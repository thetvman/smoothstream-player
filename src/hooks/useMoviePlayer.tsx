
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
    }
  }, [movie, setPlayerState]);
  
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
    video.currentTime = time;
  };
  
  const handleRetry = () => {
    const newUrl = tryAlternativeFormat(movie, streamUrl);
    if (newUrl) {
      setStreamUrl(newUrl);
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
    hasAlternativeFormat: movie ? hasAlternativeFormat(movie, streamUrl) : false
  };
}
