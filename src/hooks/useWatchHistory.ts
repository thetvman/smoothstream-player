
import { useState, useEffect, useRef } from "react";
import { Episode, Series } from "@/lib/types";
import { updateWatchHistory } from "@/lib/watchHistoryService";

export function useWatchHistory(episode: Episode | null, series: Series | null, isPlaying: boolean) {
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  
  // Reset tracking for watch time when episode changes
  useEffect(() => {
    if (!episode) return;
    
    // Reset watch time when episode changes
    setWatchStartTime(Date.now());
    
    const saveWatchTime = () => {
      if (watchStartTime && episode && isPlaying) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 5) { // Only track if watched more than 5 seconds
          updateWatchHistory(
            episode.id,
            `${series?.name || ''} - ${episode.name}`,
            "episode",
            watchTimeSeconds,
            episode.logo
          );
          setWatchStartTime(Date.now()); // Reset for next interval
        }
      }
    };
    
    // Periodically save watch time
    const intervalId = setInterval(saveWatchTime, 30000); // Every 30 seconds
    
    return () => {
      // Save final watch time when unmounting
      saveWatchTime();
      clearInterval(intervalId);
    };
  }, [episode, series, watchStartTime, isPlaying]);

  const handleVideoEnded = () => {
    // Save final watch time when episode ends
    if (watchStartTime && episode) {
      const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
      if (watchTimeSeconds > 5) {
        updateWatchHistory(
          episode.id,
          `${series?.name || ''} - ${episode.name}`,
          "episode",
          watchTimeSeconds,
          episode.logo
        );
      }
      setWatchStartTime(null);
    }
  };
  
  const handlePlaybackChange = (isNowPlaying: boolean) => {
    if (isNowPlaying) {
      if (!watchStartTime) {
        setWatchStartTime(Date.now());
      }
    } else {
      // Save watch time when paused
      if (watchStartTime && episode) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 5) {
          updateWatchHistory(
            episode.id,
            `${series?.name || ''} - ${episode.name}`,
            "episode",
            watchTimeSeconds,
            episode.logo
          );
        }
        setWatchStartTime(null);
      }
    }
  };
  
  return {
    handleVideoEnded,
    handlePlaybackChange
  };
}
