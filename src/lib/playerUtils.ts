
import { Channel } from "@/lib/types";

/**
 * Format time for player display (HH:MM:SS)
 */
export function formatPlayerTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "00:00";
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Toggle fullscreen for a given element
 */
export async function toggleFullscreen(element: HTMLElement | null): Promise<boolean> {
  if (!element) return false;
  
  try {
    if (!document.fullscreenElement) {
      await element.requestFullscreen();
      return true;
    } else {
      await document.exitFullscreen();
      return false;
    }
  } catch (err) {
    console.error("Error toggling fullscreen:", err);
    return !!document.fullscreenElement;
  }
}

/**
 * Find closest quality or format for streaming
 */
export function findOptimalStreamQuality(
  channel: Channel, 
  preferredQuality: 'low' | 'medium' | 'high' = 'high'
): string {
  // This could be expanded as needed
  return channel.url;
}
