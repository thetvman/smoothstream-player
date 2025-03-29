
import React from "react";
import { Channel } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVideoPlayerState } from "@/hooks/useVideoPlayerState";
import VideoDisplay from "./player/VideoDisplay";
import PlayerControls from "./player/PlayerControls";
import PlayerInfo from "./player/PlayerInfo";
import PlayerThemeSettings from "./player/PlayerThemeSettings";
import PlayerContainer from "./player/PlayerContainer";
import PlayerHotkeys from "./player/PlayerHotkeys";

interface VideoPlayerProps {
  channel: Channel | null;
  autoPlay?: boolean;
  onEnded?: () => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  channel, 
  autoPlay = false, 
  onEnded,
  onPlaybackChange 
}) => {
  const isMobile = useIsMobile();
  
  const {
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
  } = useVideoPlayerState({
    channel,
    autoPlay,
    onEnded,
    onPlaybackChange
  });

  // Set up hotkeys
  PlayerHotkeys({
    onPlayPause: handlePlayPause,
    onMuteUnmute: handleMuteUnmute,
    onToggleFullscreen: handleToggleFullscreen,
    isMobile
  });

  if (!channel) {
    return <div className="text-red-500">No channel selected.</div>;
  }

  return (
    <PlayerContainer
      containerRef={playerContainerRef}
      onClick={handleContainerTap}
    >
      <VideoDisplay
        channel={channel}
        playing={playerState.playing}
        muted={playerState.muted}
        volume={playerState.volume}
        onReady={handleReady}
        onDuration={handleDuration}
        onProgress={handleProgress}
        onEnded={handleEnded}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        isLoading={isLoading}
        isFullscreen={isFullscreen}
        onStatsUpdate={handleStatsUpdate}
      />

      {!isIOS && (
        <>
          <PlayerControls
            playing={playerState.playing}
            muted={playerState.muted}
            volume={playerState.volume}
            currentTime={playerState.currentTime}
            duration={playerState.duration}
            isFullscreen={isFullscreen}
            onPlayPause={handlePlayPause}
            onMuteUnmute={handleMuteUnmute}
            onVolumeChange={handleVolumeChange}
            onSeek={handleSeek}
            onSeekStart={handleSeekMouseDown}
            onSeekEnd={handleSeekMouseUp}
            onToggleFullscreen={handleToggleFullscreen}
          />

          {channel && (
            <PlayerInfo
              channel={channel}
              isVisible={showControls}
              isFullscreen={isFullscreen}
              stats={videoStats}
            />
          )}
          
          <div className={`absolute top-4 right-4 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <PlayerThemeSettings />
          </div>
        </>
      )}
    </PlayerContainer>
  );
};

export default VideoPlayer;
