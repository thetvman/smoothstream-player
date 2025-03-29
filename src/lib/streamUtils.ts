
import { Movie } from "@/lib/types";

/**
 * Determines if there's an alternative format available for a movie stream
 */
export const hasAlternativeFormat = (movie: Movie | null, currentUrl: string | null): boolean => {
  if (!movie?.url) return false;
  
  const streamUrl = currentUrl || movie.url;
  return streamUrl.endsWith('.mp4') || streamUrl.endsWith('.m3u8');
};

/**
 * Try an alternative format when the current one fails
 * Returns the new URL if an alternative exists, or null if not
 */
export const tryAlternativeFormat = (movie: Movie | null, currentUrl: string | null): string | null => {
  if (!movie?.url) return null;
  
  const streamUrl = currentUrl || movie.url;
  
  if (streamUrl.endsWith('.mp4')) {
    const m3u8Url = streamUrl.replace(/\.mp4$/, '.m3u8');
    console.log('Trying alternative format:', m3u8Url);
    return m3u8Url;
  }
  
  if (streamUrl.endsWith('.m3u8')) {
    const mp4Url = streamUrl.replace(/\.m3u8$/, '.mp4');
    console.log('Trying alternative format:', mp4Url);
    return mp4Url;
  }
  
  return null;
};
