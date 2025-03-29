
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

/**
 * Auto-hide UI element after specified time
 */
export function setupAutoHideTimeout(
  setVisibility: (visible: boolean) => void,
  timeoutMs: number = 5000
): () => void {
  const timeout = setTimeout(() => {
    setVisibility(false);
  }, timeoutMs);
  
  return () => clearTimeout(timeout);
}

/**
 * Check if device is in portrait orientation
 */
export function isPortraitOrientation(): boolean {
  return window.matchMedia("(orientation: portrait)").matches;
}

/**
 * Format duration from minutes to hours and minutes
 */
export function formatDuration(minutes: number): string {
  if (!minutes) return '';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Generate placeholder image with initials
 */
export function generatePlaceholderImage(text: string, width = 300, height = 200): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(width / 8)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Get initials
  const initials = text
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
  
  ctx.fillText(initials, width / 2, height / 2);
  
  return canvas.toDataURL('image/png');
}
