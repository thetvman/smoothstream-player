
import { useState, useEffect, RefObject } from 'react';
import { Movie } from '@/lib/types';
import { updateWatchHistory } from '@/lib/watchHistoryService';

interface VideoEventsState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  loading: boolean;
  fullscreen: boolean;
}

interface UseVideoEventsProps {
  videoRef: RefObject<HTMLVideoElement>;
  movie: Movie | null;
  initialState?: Partial<VideoEventsState>;
}

export function useVideoEvents({ 
  videoRef, 
  movie,
  initialState = {}
}: UseVideoEventsProps) {
  const [playerState, setPlayerState] = useState<VideoEventsState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    loading: true,
    fullscreen: false,
    ...initialState
  });
  
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [loadingTimeoutId, setLoadingTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Debug loading state changes
  useEffect(() => {
    console.log("Player loading state:", playerState.loading);
  }, [playerState.loading]);
  
  // Clear any existing loading timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
    };
  }, [loadingTimeoutId]);
  
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
      console.log("Video play event");
      setPlayerState(prev => ({ ...prev, playing: true }));
      setWatchStartTime(Date.now());
    };
    
    const handlePause = () => {
      console.log("Video pause event");
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
      console.log("Video ended event");
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
      
      setPlayerState(prev => ({ ...prev, playing: false, loading: false }));
    };
    
    const handleVolumeChange = () => {
      setPlayerState(prev => ({
        ...prev,
        volume: video.volume,
        muted: video.muted
      }));
    };
    
    const handleLoadStart = () => {
      console.log("Video loadstart event");
      setPlayerState(prev => ({ ...prev, loading: true }));
      
      // Set a timeout to clear loading state if it gets stuck
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
      
      const timeoutId = setTimeout(() => {
        console.log("Loading timeout triggered, forcing loading state to false");
        setPlayerState(prev => ({ ...prev, loading: false }));
      }, 8000);
      
      setLoadingTimeoutId(timeoutId);
    };
    
    const handleCanPlay = () => {
      console.log("Video canplay event");
      
      // Clear loading timeout if it exists
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
        setLoadingTimeoutId(null);
      }
      
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    const handleError = (e: Event) => {
      console.error("Video error:", e);
      
      // Clear loading timeout if it exists
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
        setLoadingTimeoutId(null);
      }
      
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    // Handler for when video starts playing
    const handlePlaying = () => {
      console.log("Video playing event");
      
      // Clear loading timeout if it exists
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
        setLoadingTimeoutId(null);
      }
      
      // Ensure we set loading to false once playback actually starts
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    // Add loadeddata event for when metadata and first frame are loaded
    const handleLoadedData = () => {
      console.log("Video loadeddata event");
      
      // Set a short timeout to give the browser time to prepare playback
      // This helps prevent false "not loading" states
      setTimeout(() => {
        setPlayerState(prev => ({ ...prev, loading: false }));
      }, 300);
    };
    
    const handleWaiting = () => {
      console.log("Video waiting event");
      // Show loading indicator when video is waiting/buffering
      setPlayerState(prev => ({ ...prev, loading: true }));
      
      // Set a timeout to clear loading state if it gets stuck
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
      
      const timeoutId = setTimeout(() => {
        console.log("Waiting timeout triggered, forcing loading state to false");
        setPlayerState(prev => ({ ...prev, loading: false }));
      }, 10000);
      
      setLoadingTimeoutId(timeoutId);
    };
    
    const handleStalled = () => {
      console.log("Video stalled event");
      setPlayerState(prev => ({ ...prev, loading: true }));
      
      // Set a timeout to clear loading state if it gets stuck
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
      
      const timeoutId = setTimeout(() => {
        console.log("Stalled timeout triggered, forcing loading state to false");
        setPlayerState(prev => ({ ...prev, loading: false }));
      }, 10000);
      
      setLoadingTimeoutId(timeoutId);
    };
    
    const handleSuspend = () => {
      console.log("Video suspend event");
      // Often occurs when media loading is suspended, not necessarily a problem
    };
    
    const handleSeeking = () => {
      console.log("Video seeking event");
      setPlayerState(prev => ({ ...prev, loading: true }));
    };
    
    const handleSeeked = () => {
      console.log("Video seeked event");
      
      // Add a small delay to ensure the video has actually resumed playback
      setTimeout(() => {
        setPlayerState(prev => ({ ...prev, loading: false }));
      }, 200);
    };
    
    // Add all event listeners
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("suspend", handleSuspend);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    
    // Clean up event listeners on unmount
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
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("stalled", handleStalled);
      video.removeEventListener("suspend", handleSuspend);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      
      // Clear any active timeout
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
    };
  }, [movie, watchStartTime, videoRef, loadingTimeoutId]);
  
  return { playerState, setPlayerState };
}
