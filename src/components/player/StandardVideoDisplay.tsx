
import React, { useRef, useEffect } from "react";
import ReactPlayer from 'react-player';
import { Loader2 } from 'lucide-react';
import { Channel } from "@/lib/types";
import { useVideoStats } from "@/hooks/use-video-stats";

interface StandardVideoDisplayProps {
  channel: Channel;
  playing: boolean;
  muted: boolean;
  volume: number;
  onReady: () => void;
  onDuration: (duration: number) => void;
  onProgress: (state: { playedSeconds: number }) => void;
  onEnded: () => void;
  onError: () => void;
  onPlay: () => void;
  onPause: () => void;
  isLoading: boolean;
  isFullscreen?: boolean;
  onStatsUpdate?: (stats: {
    resolution?: string;
    frameRate?: number;
    audioBitrate?: string;
    audioChannels?: string;
  }) => void;
}

const StandardVideoDisplay: React.FC<StandardVideoDisplayProps> = ({
  channel,
  playing,
  muted,
  volume,
  onReady,
  onDuration,
  onProgress,
  onEnded,
  onError,
  onPlay,
  onPause,
  isLoading,
  isFullscreen,
  onStatsUpdate
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  
  const { startCollectingStats } = useVideoStats({
    enabled: !!onStatsUpdate,
    playerRef,
    onStatsUpdate,
    autoHideAfter: 10000
  });

  // Start collecting stats initially
  useEffect(() => {
    if (onStatsUpdate) {
      startCollectingStats();
    }
  }, [onStatsUpdate, startCollectingStats]);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}
      <ReactPlayer
        ref={playerRef}
        url={channel.url}
        playing={playing}
        muted={muted}
        volume={volume}
        width="100%"
        height="100%"
        style={{ backgroundColor: 'black' }}
        onReady={onReady}
        onDuration={onDuration}
        onProgress={onProgress}
        onEnded={onEnded}
        onError={onError}
        onPlay={onPlay}
        onPause={onPause}
        config={{
          file: {
            forceHLS: channel.url.includes('.m3u8'),
            hlsOptions: {
              backBufferLength: 3,
              maxBufferLength: 3,
              maxMaxBufferLength: 3,
              lowLatencyMode: false
            }
          }
        }}
      />
    </>
  );
};

export default StandardVideoDisplay;
