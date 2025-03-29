
import { useState, useRef } from "react";
import { Channel } from "@/lib/types";
import { usePlayerControls } from "./player/usePlayerControls";
import { usePlayerEvents } from "./player/usePlayerEvents";
import { usePlayerFullscreen } from "./player/usePlayerFullscreen";
import { usePlayerUI } from "./player/usePlayerUI";
import { useAutoHideUI } from "./useAutoHideUI";

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
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null);
  
  // Use our custom hooks
  const {
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
  } = usePlayerControls({ autoPlay, onPlaybackChange });
  
  const {
    handleReady: baseHandleReady,
    handleEnded,
    handleError,
  } = usePlayerEvents({
    channel,
    isPlaying: playerState.playing,
    onEnded
  });
  
  const {
    isFullscreen,
    playerContainerRef,
    handleToggleFullscreen,
    setupScreenfullListeners
  } = usePlayerFullscreen();
  
  const {
    isIOS,
    videoStats,
    handleStatsUpdate
  } = usePlayerUI();
  
  // Use auto-hide UI hook for controls
  const { isVisible: showControls, updateVisibilityOnPlayState, show: showControlsUI, setIsVisible: setShowControls } = useAutoHideUI({
    initialVisibility: true,
    hideDelay: 3000,
    showOnPlay: true
  });
  
  // Handle fullscreen changes
  const handleScreenfullChange = setupScreenfullListeners();
  
  // Handle tap on container
  const handleContainerTap = () => {
    showControlsUI();
  };

  // Wrap the handleReady function to update loading state
  const handleReady = () => {
    baseHandleReady();
    setIsLoading(false);
  };

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
    handleScreenfullChange,
    setShowControls
  };
}
