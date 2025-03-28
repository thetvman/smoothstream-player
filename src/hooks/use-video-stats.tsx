
import { useState, useEffect, useRef } from "react";

interface VideoStats {
  resolution?: string;
  frameRate?: number;
  audioBitrate?: string;
  audioChannels?: string;
}

interface UseVideoStatsProps {
  enabled: boolean;
  videoElement?: HTMLVideoElement | null;
  playerRef?: React.RefObject<any>;
  onStatsUpdate?: (stats: VideoStats) => void;
  autoHideAfter?: number; // in milliseconds
}

export function useVideoStats({
  enabled,
  videoElement,
  playerRef,
  onStatsUpdate,
  autoHideAfter = 10000
}: UseVideoStatsProps) {
  const [isCollectingStats, setIsCollectingStats] = useState(false);
  const statsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (statsTimeoutRef.current) {
        clearTimeout(statsTimeoutRef.current);
      }
    };
  }, []);

  // Start or stop collecting stats
  const startCollectingStats = () => {
    if (!enabled || !onStatsUpdate) return;
    
    setIsCollectingStats(true);
    
    if (statsTimeoutRef.current) {
      clearTimeout(statsTimeoutRef.current);
    }
    
    // Stop collecting stats after specified time
    statsTimeoutRef.current = setTimeout(() => {
      setIsCollectingStats(false);
      // Send null stats after timeout to hide the stats display
      onStatsUpdate({
        resolution: undefined,
        frameRate: undefined,
        audioBitrate: undefined,
        audioChannels: undefined
      });
    }, autoHideAfter);
    
    // Collect stats immediately when starting
    collectStats();
  };

  const collectStats = () => {
    if (!onStatsUpdate) return;
    
    let videoToUse = videoElement;
    
    // If no direct video element, try to get it from the player ref
    if (!videoToUse && playerRef?.current) {
      const internalPlayer = playerRef.current.getInternalPlayer();
      if (internalPlayer instanceof HTMLVideoElement) {
        videoToUse = internalPlayer;
      }
    }
    
    if (!videoToUse) return;
    
    try {
      const stats: VideoStats = {
        resolution: videoToUse.videoWidth && videoToUse.videoHeight 
          ? `${videoToUse.videoWidth}×${videoToUse.videoHeight}` 
          : undefined,
        frameRate: undefined,
        audioBitrate: '128 kbps',  // Default assumption
        audioChannels: 'Stereo',   // Default assumption
      };
      
      // Try to calculate frame rate for browsers that support it
      if ('webkitVideoDecodedByteCount' in videoToUse) {
        const webkitVideoDecodedFrameCount = (videoToUse as any).webkitVideoDecodedFrameCount;
        if (typeof webkitVideoDecodedFrameCount === 'number') {
          const lastStats = (videoToUse as any)._lastStats || { 
            time: Date.now(),
            frames: webkitVideoDecodedFrameCount 
          };
          
          const now = Date.now();
          const timeDiff = (now - lastStats.time) / 1000;
          if (timeDiff > 0) {
            const frameDiff = webkitVideoDecodedFrameCount - lastStats.frames;
            stats.frameRate = frameDiff / timeDiff;
            
            (videoToUse as any)._lastStats = {
              time: now,
              frames: webkitVideoDecodedFrameCount
            };
          }
        }
      }
      
      onStatsUpdate(stats);
    } catch (error) {
      console.error("Error collecting video stats:", error);
    }
  };

  // Effect for regular stats collection when actively collecting
  useEffect(() => {
    if (!enabled || !onStatsUpdate) return;
    
    if (isCollectingStats) {
      const intervalId = setInterval(collectStats, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isCollectingStats, enabled, onStatsUpdate]);

  return { isCollectingStats, startCollectingStats };
}
