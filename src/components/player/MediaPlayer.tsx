
import React, { memo } from "react";
import PlayerControls from "../PlayerControls";
import LoadingSpinner from "../common/LoadingSpinner";

interface MediaPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  playerState: any;
  error: string | null;
  headerComponent: React.ReactNode;
  errorComponent: React.ReactNode;
  onPlayPause: () => void;
  onMute: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  videoRef,
  containerRef,
  playerState,
  error,
  headerComponent,
  errorComponent,
  onPlayPause,
  onMute,
  onVolumeChange,
  onSeek,
  onFullscreen
}) => {
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
      
      {errorComponent}
      {headerComponent}
      
      {!error && (
        <PlayerControls
          videoRef={videoRef}
          playerState={playerState}
          onPlayPause={onPlayPause}
          onMute={onMute}
          onVolumeChange={onVolumeChange}
          onSeek={onSeek}
          onFullscreen={onFullscreen}
        />
      )}
    </div>
  );
};

export default memo(MediaPlayer);
