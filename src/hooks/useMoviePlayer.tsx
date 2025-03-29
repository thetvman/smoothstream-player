
import { useState, useEffect, useRef } from "react";
import { Movie } from "@/lib/types";
import { updateWatchHistory } from "@/lib/watchHistoryService";

interface UseMoviePlayerProps {
  movie: Movie | null;
  autoPlay?: boolean;
}

export function useMoviePlayer({ movie, autoPlay = true }: UseMoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [playerState, setPlayerState] = useState({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    loading: true,
    fullscreen: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  
  // Initialize stream URL from movie
  useEffect(() => {
    if (movie?.url) {
      setStreamUrl(movie.url);
      setError(null);
      // Reset loading state when movie changes
      setPlayerState(prev => ({ ...prev, loading: true }));
    }
  }, [movie]);
  
  // Determines if there's an alternative format available
  const hasAlternativeFormat = (): boolean => {
    if (!movie?.url) return false;
    
    const currentUrl = streamUrl || movie.url;
    return currentUrl.endsWith('.mp4') || currentUrl.endsWith('.m3u8');
  };
  
  // Try an alternative format when the current one fails
  const tryAlternativeFormat = () => {
    if (!movie?.url) return false;
    
    const currentUrl = streamUrl || movie.url;
    
    if (currentUrl.endsWith('.mp4')) {
      const m3u8Url = currentUrl.replace(/\.mp4$/, '.m3u8');
      console.log('Trying alternative format:', m3u8Url);
      setStreamUrl(m3u8Url);
      return true;
    }
    
    if (currentUrl.endsWith('.m3u8')) {
      const mp4Url = currentUrl.replace(/\.m3u8$/, '.mp4');
      console.log('Trying alternative format:', mp4Url);
      setStreamUrl(mp4Url);
      return true;
    }
    
    return false;
  };
  
  // Handle video events (play, pause, timeupdate, etc.)
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
      setWatchStartTime(Date.now());
    };
    
    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, playing: false }));
      
      if (watchStartTime && movie) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 3) {
          updateWatchHistory(
            movie.id,
            movie.name,
            "movie",
            watchTimeSeconds,
            movie.logo || movie.backdrop
          );
        }
        setWatchStartTime(null);
      }
    };
    
    const handleEnded = () => {
      if (watchStartTime && movie) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 3) {
          updateWatchHistory(
            movie.id,
            movie.name,
            "movie",
            watchTimeSeconds,
            movie.logo || movie.backdrop
          );
        }
      }
      
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
      setError("Error playing movie. Please try again.");
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    // Add a handler for when video starts playing
    const handlePlaying = () => {
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.addEventListener("ended", handleEnded);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.removeEventListener("ended", handleEnded);
    };
  }, [movie, watchStartTime]);
  
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
  }, []);
  
  // Player control handlers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (playerState.playing) {
      video.pause();
    } else {
      video.play().catch((e) => {
        console.error("Failed to play:", e);
      });
    }
  };
  
  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
  };
  
  const handleVolumeChange = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = volume;
    if (volume > 0) {
      video.muted = false;
    }
  };
  
  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = time;
  };
  
  const handleFullscreen = () => {
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
  };
  
  const handleRetry = () => {
    if (tryAlternativeFormat()) {
      setError(null);
    } else {
      setError(null);
      const video = videoRef.current;
      if (video) {
        video.load();
      }
    }
  };
  
  return {
    videoRef,
    containerRef,
    playerState,
    error,
    streamUrl,
    handlePlayPause,
    handleMute,
    handleVolumeChange,
    handleSeek,
    handleFullscreen,
    handleRetry,
    hasAlternativeFormat: hasAlternativeFormat()
  };
}
