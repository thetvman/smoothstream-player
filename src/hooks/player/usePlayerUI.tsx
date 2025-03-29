
import { useState, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function usePlayerUI() {
  const isMobile = useIsMobile();
  const [showControls, setShowControls] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [videoStats, setVideoStats] = useState({
    resolution: undefined,
    frameRate: undefined,
    audioBitrate: undefined,
    audioChannels: undefined
  });
  
  // Check for iOS device
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || '';
      return /iPad|iPhone|iPod/.test(userAgent);
    };
    
    setIsIOS(checkIOS());
  }, []);

  const handleContainerTap = useCallback(() => {
    if (isMobile) {
      setShowControls(prev => !prev);
    }
  }, [isMobile]);

  const handleStatsUpdate = useCallback((stats: {
    resolution?: string;
    frameRate?: number;
    audioBitrate?: string;
    audioChannels?: string;
  }) => {
    setVideoStats(prevStats => ({
      resolution: stats.resolution !== undefined ? stats.resolution : prevStats.resolution,
      frameRate: stats.frameRate !== undefined ? stats.frameRate : prevStats.frameRate,
      audioBitrate: stats.audioBitrate !== undefined ? stats.audioBitrate : prevStats.audioBitrate,
      audioChannels: stats.audioChannels !== undefined ? stats.audioChannels : prevStats.audioChannels
    }));
  }, []);

  return {
    isMobile,
    showControls,
    setShowControls,
    isIOS,
    videoStats,
    handleContainerTap,
    handleStatsUpdate
  };
}
