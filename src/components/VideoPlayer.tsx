
import React, { memo } from "react";
import { Channel } from "@/lib/types";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import MediaPlayer from "./player/MediaPlayer";
import PlayerErrorDisplay from "./player/PlayerErrorDisplay";
import PlayerHeader from "./player/PlayerHeader";

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
    <MediaPlayer
      videoRef={videoRef}
      containerRef={containerRef}
      playerState={playerState}
      error={error}
      headerComponent={<PlayerHeader media={channel} />}
      errorComponent={
        <PlayerErrorDisplay 
          error={error || ""}
          media={channel}
          onRetry={handleRetry}
        />
      }
      onPlayPause={handlePlayPause}
      onMute={handleMute}
      onVolumeChange={handleVolumeChange}
      onSeek={handleSeek}
      onFullscreen={handleFullscreen}
    />
  );
};

export default memo(VideoPlayer);
