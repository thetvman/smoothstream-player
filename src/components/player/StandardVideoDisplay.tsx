
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
  isMobile?: boolean;
  onStatsUpdate?: (stats: {
    resolution?: string;
    frameRate?: number;
    audioBitrate?: string;
    audioChannels?: string;
  }) => void;
}

// Define a more complete HLS options interface to match what we're using
interface ExtendedHlsOptions {
  backBufferLength: number;
  maxBufferLength: number;
  maxMaxBufferLength: number;
  lowLatencyMode: boolean;
  debug: boolean;
  progressive: boolean;
  manifestLoadingTimeOut: number;
  manifestLoadingMaxRetry: number;
  levelLoadingTimeOut: number;
  fragLoadingTimeOut: number;
  // Additional options for mobile optimization
  startLevel?: number;
  abrEwmaDefaultEstimate?: number;
  liveSyncDurationCount?: number;
  maxBufferHole?: number;
  maxFragLookUpTolerance?: number;
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
  isMobile = false,
  onStatsUpdate
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  
  const { startCollectingStats } = useVideoStats({
    enabled: !!onStatsUpdate && !isMobile,
    playerRef,
    onStatsUpdate,
    autoHideAfter: 10000
  });

  // Start collecting stats initially (only on desktop)
  useEffect(() => {
    if (onStatsUpdate && !isMobile) {
      startCollectingStats();
    }
  }, [onStatsUpdate, startCollectingStats, isMobile]);

  // Create HLS config based on device type
  const getHlsConfig = () => {
    const baseConfig: { forceHLS: boolean, hlsOptions: ExtendedHlsOptions } = {
      forceHLS: channel.url.includes('.m3u8'),
      hlsOptions: {
        backBufferLength: isMobile ? 0 : 3,
        maxBufferLength: isMobile ? 15 : 3,
        maxMaxBufferLength: isMobile ? 15 : 3,
        lowLatencyMode: false,
        debug: false,
        progressive: true,
        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: isMobile ? 1 : 2,
        levelLoadingTimeOut: 8000,
        fragLoadingTimeOut: 8000,
      }
    };

    // Mobile-specific optimizations
    if (isMobile) {
      baseConfig.hlsOptions.startLevel = 0;
      baseConfig.hlsOptions.abrEwmaDefaultEstimate = 500000; // Lower initial bandwidth estimate for mobile
      baseConfig.hlsOptions.liveSyncDurationCount = 1; // Reduce the number of segments to buffer
      baseConfig.hlsOptions.maxBufferHole = 1; // Reduce buffer holes for smoother playback
      baseConfig.hlsOptions.maxFragLookUpTolerance = 0.5; // Better fragment seeking
    }

    return baseConfig;
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
        playsinline={true}
        config={{
          file: getHlsConfig()
        }}
      />
    </>
  );
};

export default StandardVideoDisplay;
