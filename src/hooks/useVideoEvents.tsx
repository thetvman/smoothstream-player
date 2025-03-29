
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
      setPlayerState(prev => ({ ...prev, loading: true }));
    };
    
    const handleCanPlay = () => {
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    const handleError = (e: Event) => {
      console.error("Video error:", e);
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    // Handler for when video starts playing
    const handlePlaying = () => {
      // Ensure we set loading to false once playback actually starts
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    // Add loadeddata event for when metadata and first frame are loaded
    const handleLoadedData = () => {
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    const handleWaiting = () => {
      // Show loading indicator when video is waiting/buffering
      setPlayerState(prev => ({ ...prev, loading: true }));
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
    };
  }, [movie, watchStartTime, videoRef]);
  
  return { playerState, setPlayerState };
}
