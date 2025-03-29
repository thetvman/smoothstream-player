
import { useState, useEffect, useRef } from "react";
import { Movie } from "@/lib/types";
import { useVideoEvents } from "./useVideoEvents";
import { useFullscreen } from "./useFullscreen";
import { hasAlternativeFormat, tryAlternativeFormat } from "@/lib/streamUtils";

interface UseMoviePlayerProps {
  movie: Movie | null;
  autoPlay?: boolean;
}

export function useMoviePlayer({ movie, autoPlay = true }: UseMoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  
  // Use our custom hooks for video events and fullscreen
  const { playerState, setPlayerState } = useVideoEvents({ 
    videoRef, 
    movie,
    initialState: { playing: autoPlay }
  });
  
  const { isFullscreen, handleFullscreen } = useFullscreen(containerRef);
  
  // Update fullscreen state in player state
  useEffect(() => {
    setPlayerState(prev => ({ ...prev, fullscreen: isFullscreen }));
  }, [isFullscreen, setPlayerState]);
  
  // Initialize stream URL from movie
  useEffect(() => {
    if (movie?.url) {
      setStreamUrl(movie.url);
      setError(null);
      // Reset loading state when movie changes
      setPlayerState(prev => ({ ...prev, loading: true }));
      
      // Add a safety timeout to clear loading state if it gets stuck
      const safetyTimeout = setTimeout(() => {
        setPlayerState(prev => {
          if (prev.loading) {
            console.log('Safety timeout: forcing loading state to false');
            return { ...prev, loading: false };
          }
          return prev;
        });
      }, 8000); // 8 seconds should be enough for most videos to start loading
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [movie, setPlayerState]);
  
  // Player control handlers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (playerState.playing) {
      video.pause();
    } else {
      // Reset loading state when attempting to play
      setPlayerState(prev => ({ ...prev, loading: true }));
      video.play().catch((e) => {
        console.error("Failed to play:", e);
        setError("Failed to play video. Please try again.");
        // Clear loading state on error
        setPlayerState(prev => ({ ...prev, loading: false }));
      });
    }
  };
  
  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
  };
  
  const handleVolumeChange = (values: number[]) => {
    const video = videoRef.current;
    if (!video || !values.length) return;
    
    const volume = values[0];
    video.volume = volume;
    if (volume > 0) {
      video.muted = false;
    }
  };
  
  const handleSeek = (values: number[]) => {
    const video = videoRef.current;
    if (!video || !values.length) return;
    
    const time = values[0];
    // Show loading indicator during seeking
    setPlayerState(prev => ({ ...prev, loading: true }));
    video.currentTime = time;
    
    // Set a timeout to clear loading state if seeking takes too long
    setTimeout(() => {
      setPlayerState(prev => {
        if (prev.loading) {
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 1000);
  };
  
  const handleSeekStart = (values: number[]) => {
    // This is a pass-through function for seek start events
    return values;
  };
  
  const handleRetry = () => {
    // Clear any existing errors
    setError(null);
    
    // Set loading state
    setPlayerState(prev => ({ ...prev, loading: true }));
    
    // Try alternative format if available
    const newUrl = tryAlternativeFormat(movie, streamUrl);
    if (newUrl) {
      console.log("Trying alternative format:", newUrl);
      setStreamUrl(newUrl);
    } else {
      console.log("No alternative format available, reloading current stream");
      const video = videoRef.current;
      if (video) {
        // Force reload the video element
        video.load();
        // Attempt to play after a short delay
        setTimeout(() => {
          video.play().catch(e => {
            console.error("Retry playback failed:", e);
            setPlayerState(prev => ({ ...prev, loading: false }));
            setError("Failed to play video after retry. Please try again.");
          });
        }, 1000);
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
    handleSeekStart,
    handleFullscreen,
    handleRetry,
    hasAlternativeFormat: movie ? hasAlternativeFormat(movie, streamUrl) : false
  };
}
