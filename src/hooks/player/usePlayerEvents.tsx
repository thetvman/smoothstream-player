
import { useEffect } from "react";
import { PlayerState } from "@/lib/types";

/**
 * This hook handles all the video element event listeners
 */
export function usePlayerEvents(
  videoRef: React.RefObject<HTMLVideoElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Handle video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: video.currentTime,
        duration: video.duration || 0
      }));
    };
    
    const handlePlay = () => {
      setPlayerState(prev => ({ ...prev, playing: true }));
    };
    
    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, playing: false }));
    };
    
    const handleVolumeChange = () => {
      setPlayerState(prev => ({
        ...prev,
        volume: video.volume,
        muted: video.muted
      }));
    };
    
    const handleLoadStart = () => {
      setPlayerState(prev => ({ ...prev, loading: true }));
    };
    
    const handleCanPlay = () => {
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    const handleError = () => {
      setError("Error playing media. Please try again.");
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [videoRef, setPlayerState, setError]);
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({
        ...prev,
        fullscreen: !!document.fullscreenElement
      }));
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [setPlayerState]);
  
  // Return control functions
  return {
    handlePlayPause: () => {
      const video = videoRef.current;
      if (!video) return;
      
      if (video.paused) {
        video.play().catch((e) => {
          console.error("Failed to play:", e);
        });
      } else {
        video.pause();
      }
    },
    
    handleMute: () => {
      const video = videoRef.current;
      if (!video) return;
      
      video.muted = !video.muted;
    },
    
    handleVolumeChange: (volume: number) => {
      const video = videoRef.current;
      if (!video) return;
      
      video.volume = volume;
      if (volume > 0) {
        video.muted = false;
      }
    },
    
    handleSeek: (time: number) => {
      const video = videoRef.current;
      if (!video) return;
      
      video.currentTime = time;
    },
    
    handleFullscreen: () => {
      const container = containerRef.current;
      if (!container) return;
      
      if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => {
          setPlayerState(prev => ({ ...prev, fullscreen: true }));
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen().then(() => {
          setPlayerState(prev => ({ ...prev, fullscreen: false }));
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };
}
