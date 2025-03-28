
import { WatchHistoryItem } from "./types";
import { safeJsonParse } from "./utils";

/**
 * Updates watch history for a media item
 * @param id - Unique identifier for the item
 * @param name - Display name of the media
 * @param type - Type of media (channel, movie, episode)
 * @param watchTime - Time in seconds watched
 * @param thumbnailUrl - Optional thumbnail URL
 */
export function updateWatchHistory(
  id: string,
  name: string,
  type: "channel" | "movie" | "episode",
  watchTime: number,
  thumbnailUrl?: string
): void {
  // Get existing watch history
  const watchHistoryJson = localStorage.getItem("iptv-watch-history") || "{}";
  const watchHistory = safeJsonParse<Record<string, WatchHistoryItem>>(watchHistoryJson, {});
  
  // Update or create history item
  const existingItem = watchHistory[id];
  const updatedTime = existingItem ? existingItem.watchTime + watchTime : watchTime;
  
  watchHistory[id] = {
    id,
    name,
    type,
    watchTime: updatedTime,
    lastWatched: new Date().toISOString(),
    thumbnailUrl
  };
  
  // Save updated history
  localStorage.setItem("iptv-watch-history", JSON.stringify(watchHistory));
  
  // Update watch time summary
  updateWatchTimeSummary(id, type, watchTime);
}

/**
 * Updates watch time summary by content type and source
 */
function updateWatchTimeSummary(
  id: string,
  type: "channel" | "movie" | "episode",
  watchTime: number
): void {
  // Update total watch time tracking
  const watchTimeJson = localStorage.getItem("iptv-watch-time") || "{}";
  const watchTimeData = safeJsonParse<Record<string, number>>(watchTimeJson, {});
  
  watchTimeData[id] = (watchTimeData[id] || 0) + watchTime;
  localStorage.setItem("iptv-watch-time", JSON.stringify(watchTimeData));
  
  // Track watched items by type
  const playlistId = localStorage.getItem("iptv-playlist-id") || "default";
  
  if (type === "channel") {
    updateWatchedList("iptv-watched-channels", playlistId, id);
  } else if (type === "movie") {
    updateWatchedList("iptv-watched-movies", playlistId, id);
  } else if (type === "episode") {
    updateWatchedList("iptv-watched-episodes", playlistId, id);
  }
}

/**
 * Updates the list of watched items for a specific category
 */
function updateWatchedList(storageKey: string, playlistId: string, itemId: string): void {
  const watchedJson = localStorage.getItem(storageKey) || "{}";
  const watchedData = safeJsonParse<Record<string, string[]>>(watchedJson, {});
  
  if (!watchedData[playlistId]) {
    watchedData[playlistId] = [];
  }
  
  if (!watchedData[playlistId].includes(itemId)) {
    watchedData[playlistId].push(itemId);
    localStorage.setItem(storageKey, JSON.stringify(watchedData));
  }
}

/**
 * Gets watch history for a specific item
 */
export function getWatchHistoryItem(id: string): WatchHistoryItem | null {
  const watchHistoryJson = localStorage.getItem("iptv-watch-history") || "{}";
  const watchHistory = safeJsonParse<Record<string, WatchHistoryItem>>(watchHistoryJson, {});
  
  return watchHistory[id] || null;
}

/**
 * Gets all watch history items sorted by last watched time
 */
export function getAllWatchHistory(): WatchHistoryItem[] {
  const watchHistoryJson = localStorage.getItem("iptv-watch-history") || "{}";
  const watchHistory = safeJsonParse<Record<string, WatchHistoryItem>>(watchHistoryJson, {});
  
  return Object.values(watchHistory).sort(
    (a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
  );
}
