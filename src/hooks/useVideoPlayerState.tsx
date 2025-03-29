
import { useState, useCallback, useRef, useEffect } from "react";
import screenfull from 'screenfull';
import { Channel } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatchTime } from "@/hooks/use-watch-time";

interface UseVideoPlayerStateProps {
  channel: Channel | null;
  autoPlay?: boolean;
  onEnded?: () => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
}

export function useVideoPlayerState({
  channel,
  autoPlay = false,
  onEnded,
  onPlaybackChange
}: UseVideoPlayerStateProps) {
  const isMobile = useIsMobile();
  
  const [playerState, setPlayerState] = useState({
    playing: autoPlay,
    muted: false,
    volume: 0.5,
    duration: 0,
    currentTime: 0,
    seeking: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [videoStats, setVideoStats] = useState({
    resolution: undefined,
    frameRate: undefined,
    audioBitrate: undefined,
    audioChannels: undefined
  });
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  
  // Initialize watch time tracking
  const { handlePlaybackEnd } = useWatchTime({
    id: channel?.id || '',
    name: channel?.name || '',
    type: "channel",
    isPlaying: playerState.playing,
    thumbnailUrl: channel?.logo
  });

  // Check for iOS device
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || '';
      return /iPad|iPhone|iPod/.test(userAgent);
    };
    
    setIsIOS(checkIOS());
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', handleScreenfullChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleScreenfullChange);
      }
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    const newPlayingState = !playerState.playing;
    setPlayerState(prevState => ({ ...prevState, playing: newPlayingState }));
    
    if (onPlaybackChange) {
      onPlaybackChange(newPlayingState);
    }
  }, [playerState.playing, onPlaybackChange]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setPlayerState(prevState => ({ 
      ...prevState, 
      volume: newVolume,
      muted: newVolume === 0
    }));
  }, []);

  const handleMuteUnmute = useCallback(() => {
    setPlayerState(prevState => ({ ...prevState, muted: !prevState.muted }));
  }, []);

  const handleDuration = useCallback((duration: number) => {
    setPlayerState(prevState => ({ ...prevState, duration }));
  }, []);

  const handleProgress = useCallback((state: { playedSeconds: number }) => {
    if (!playerState.seeking) {
      setPlayerState(prevState => ({ ...prevState, currentTime: state.playedSeconds }));
    }
  }, [playerState.seeking]);

  const handleSeek = useCallback((value: number[]) => {
    setPlayerState(prevState => ({ ...prevState, currentTime: value[0] }));
  }, []);

  const handleSeekMouseDown = useCallback(() => {
    setPlayerState(prevState => ({ ...prevState, seeking: true }));
  }, []);

  const handleSeekMouseUp = useCallback((value: number[]) => {
    setPlayerState(prevState => ({ ...prevState, seeking: false, currentTime: value[0] }));
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (screenfull.isEnabled && playerContainerRef.current) {
      screenfull.toggle(playerContainerRef.current);
      setIsFullscreen(screenfull.isFullscreen);
    }
  }, []);

  const handleScreenfullChange = useCallback(() => {
    setIsFullscreen(screenfull.isFullscreen);
  }, []);

  const handleReady = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleEnded = useCallback(() => {
    if (channel) {
      handlePlaybackEnd();
    }
    
    if (onEnded) {
      onEnded();
    }
  }, [onEnded, handlePlaybackEnd, channel]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    if (channel) {
      console.error("Error loading stream for channel:", channel.name);
    }
  }, [channel]);

  const handlePlay = useCallback(() => {
    setPlayerState(prev => ({ ...prev, playing: true }));
    
    if (onPlaybackChange) {
      onPlaybackChange(true);
    }
  }, [onPlaybackChange]);
  
  const handlePause = useCallback(() => {
    setPlayerState(prev => ({ ...prev, playing: false }));
    
    if (onPlaybackChange) {
      onPlaybackChange(false);
    }
  }, [onPlaybackChange]);

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

  const handleContainerTap = useCallback(() => {
    if (isMobile) {
      setShowControls(prev => !prev);
    }
  }, [isMobile]);

  return {
    playerState,
    isLoading,
    isFullscreen,
    showControls,
    isIOS,
    videoStats,
    playerContainerRef,
    playerRef,
    handlePlayPause,
    handleVolumeChange,
    handleMuteUnmute,
    handleDuration,
    handleProgress,
    handleSeek,
    handleSeekMouseDown,
    handleSeekMouseUp,
    handleToggleFullscreen,
    handleReady,
    handleEnded,
    handleError,
    handlePlay,
    handlePause,
    handleStatsUpdate,
    handleContainerTap,
    setShowControls
  };
}
