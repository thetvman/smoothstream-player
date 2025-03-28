import React, { useRef, useEffect, useState } from "react";
import ReactPlayer from 'react-player';
import { Loader2 } from 'lucide-react';
import { Channel } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoDisplayProps {
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

const VideoDisplay: React.FC<VideoDisplayProps> = ({
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
  isFullscreen = false,
  onStatsUpdate
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || '';
      return /iPad|iPhone|iPod/.test(userAgent);
    };
    
    setIsIOS(checkIOS());
  }, []);

  useEffect(() => {
    if (!onStatsUpdate) return;
    
    const collectStats = () => {
      const video = videoRef.current;
      if (!video) {
        const player = playerRef.current;
        if (player) {
          const internalPlayer = player.getInternalPlayer();
          if (internalPlayer instanceof HTMLVideoElement) {
            collectVideoStats(internalPlayer);
          }
        }
        return;
      }
      
      collectVideoStats(video);
    };
    
    const collectVideoStats = (videoElement: HTMLVideoElement) => {
      try {
        const stats = {
          resolution: videoElement.videoWidth && videoElement.videoHeight 
            ? `${videoElement.videoWidth}×${videoElement.videoHeight}` 
            : undefined,
          frameRate: undefined as number | undefined,
          audioBitrate: undefined as string | undefined,
          audioChannels: undefined as string | undefined,
        };
        
        if ('webkitVideoDecodedByteCount' in videoElement) {
          const webkitVideoDecodedFrameCount = (videoElement as any).webkitVideoDecodedFrameCount;
          if (typeof webkitVideoDecodedFrameCount === 'number') {
            const lastStats = (videoElement as any)._lastStats || { 
              time: Date.now(),
              frames: webkitVideoDecodedFrameCount 
            };
            
            const now = Date.now();
            const timeDiff = (now - lastStats.time) / 1000;
            if (timeDiff > 0) {
              const frameDiff = webkitVideoDecodedFrameCount - lastStats.frames;
              stats.frameRate = frameDiff / timeDiff;
              
              (videoElement as any)._lastStats = {
                time: now,
                frames: webkitVideoDecodedFrameCount
              };
            }
          }
        }
        
        stats.audioChannels = 'Stereo';  // Default assumption
        stats.audioBitrate = '128 kbps';  // Default assumption
        
        onStatsUpdate(stats);
      } catch (error) {
        console.error("Error collecting video stats:", error);
      }
    };
    
    const intervalId = setInterval(collectStats, 1000);
    return () => clearInterval(intervalId);
  }, [onStatsUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      onProgress({ playedSeconds: video.currentTime });
    };
    
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("playing", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("playing", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, [onPlay, onPause, onEnded, onError, onProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isIOS) return;
    
    if (playing) {
      video.play().catch(err => {
        console.error("Error playing video:", err);
      });
    } else {
      video.pause();
    }
    
    video.volume = volume;
    video.muted = muted;
  }, [playing, volume, muted, isIOS]);

  if (isIOS) {
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        )}
        <video
          ref={videoRef}
          src={channel.url}
          className="w-full h-full"
          controls
          playsInline
          autoPlay={playing}
          muted={muted}
          onLoadedMetadata={(e) => {
            onReady();
            onDuration(e.currentTarget.duration || 0);
          }}
          onEnded={onEnded}
          onError={onError}
          onPlay={onPlay}
          onPause={onPause}
        />
      </>
    );
  }

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
      />
    </>
  );
};

export default VideoDisplay;
