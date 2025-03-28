
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
    // Only track if we have a valid ID
    if (id === '') return;
    
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
    // Only track if we have a valid ID
    if (id === '') return;
    
    if (watchIntervalRef.current) {
      window.clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
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
        watchIntervalRef.current = null;
      }
      
      // Save final watch time when unmounting
      if (watchStartTime && id !== '') {
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
    // Only process if we have a valid ID
    if (id === '') return;
    
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
