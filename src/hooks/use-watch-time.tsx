
import { useState, useRef, useEffect, useCallback } from "react";
import { updateWatchHistory } from "@/lib/watchHistoryService";

interface UseWatchTimeProps {
  id: string;
  name: string;
  type: "channel" | "movie" | "episode";
  isPlaying: boolean;
  thumbnailUrl?: string;
}

export function useWatchTime({ id, name, type, isPlaying, thumbnailUrl }: UseWatchTimeProps) {
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const watchIntervalRef = useRef<number | null>(null);

  // Start tracking watch time when playback starts
  useEffect(() => {
    if (isPlaying && !watchStartTime) {
      setWatchStartTime(Date.now());
    } else if (!isPlaying && watchStartTime) {
      // Save watch time when paused
      const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
      if (watchTimeSeconds > 5) {
        updateWatchHistory(
          id,
          name,
          type,
          watchTimeSeconds,
          thumbnailUrl
        );
      }
      setWatchStartTime(null);
    }
  }, [id, name, type, isPlaying, watchStartTime, thumbnailUrl]);
  
  // Periodically save watch time while playing
  useEffect(() => {
    if (watchIntervalRef.current) {
      window.clearInterval(watchIntervalRef.current);
    }
    
    if (isPlaying) {
      watchIntervalRef.current = window.setInterval(() => {
        if (watchStartTime) {
          const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
          if (watchTimeSeconds > 5) {
            updateWatchHistory(
              id,
              name,
              type,
              watchTimeSeconds,
              thumbnailUrl
            );
            setWatchStartTime(Date.now()); // Reset for next interval
          }
        }
      }, 30000); // Every 30 seconds
    }
    
    return () => {
      if (watchIntervalRef.current) {
        window.clearInterval(watchIntervalRef.current);
      }
      
      // Save final watch time when unmounting
      if (watchStartTime) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 5) {
          updateWatchHistory(
            id,
            name,
            type,
            watchTimeSeconds,
            thumbnailUrl
          );
        }
      }
    };
  }, [id, name, type, isPlaying, watchStartTime, thumbnailUrl]);
  
  const handlePlaybackEnd = useCallback(() => {
    if (watchStartTime) {
      const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
      if (watchTimeSeconds > 5) {
        updateWatchHistory(
          id,
          name,
          type,
          watchTimeSeconds,
          thumbnailUrl
        );
      }
      setWatchStartTime(null);
    }
  }, [id, name, type, watchStartTime, thumbnailUrl]);
  
  return { handlePlaybackEnd };
}
