
import React, { memo } from "react";
import { Channel } from "@/lib/types";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import PlayerControls from "./PlayerControls";
import PlayerErrorDisplay from "./player/PlayerErrorDisplay";
import PlayerHeader from "./player/PlayerHeader";
import LoadingSpinner from "./common/LoadingSpinner";

interface VideoPlayerProps {
  channel: Channel | null;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, autoPlay = true }) => {
  const {
    videoRef,
    containerRef,
    playerState,
    error,
    handlePlayPause,
    handleMute,
    handleVolumeChange,
    handleSeek,
    handleFullscreen,
    tryAlternativeFormat
  } = useVideoPlayer(channel, autoPlay);
  
  const handleRetry = () => {
    if (tryAlternativeFormat()) {
      // Alternative format will be tried
    } else {
      // Reload the current video
      const video = videoRef.current;
      if (video) {
        video.load();
      }
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-player overflow-hidden rounded-lg group"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
      />
      
      {playerState.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      <PlayerErrorDisplay 
        error={error || ""}
        media={channel}
        onRetry={handleRetry}
      />
      
      <PlayerHeader media={channel} />
      
      {channel && !error && (
        <PlayerControls
          videoRef={videoRef}
          playerState={playerState}
          onPlayPause={handlePlayPause}
          onMute={handleMute}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
          onFullscreen={handleFullscreen}
        />
      )}
    </div>
  );
};

export default memo(VideoPlayer);
