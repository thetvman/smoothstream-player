
import { useState, useCallback } from "react";

interface PlayerState {
  playing: boolean;
  muted: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  seeking: boolean;
}

interface UsePlayerControlsProps {
  autoPlay?: boolean;
  onPlaybackChange?: (isPlaying: boolean) => void;
}

export function usePlayerControls({ 
  autoPlay = false,
  onPlaybackChange
}: UsePlayerControlsProps) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    playing: autoPlay,
    muted: false,
    volume: 0.5,
    duration: 0,
    currentTime: 0,
    seeking: false
  });

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

  return {
    playerState,
    setPlayerState,
    handlePlayPause,
    handleVolumeChange,
    handleMuteUnmute,
    handleDuration,
    handleProgress,
    handleSeek,
    handleSeekMouseDown,
    handleSeekMouseUp,
    handlePlay,
    handlePause
  };
}
