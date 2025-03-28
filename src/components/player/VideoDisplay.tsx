
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
  isLoading
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const [isIOS, setIsIOS] = useState(false);
  
  // Check if device is iOS
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || '';
      return /iPad|iPhone|iPod/.test(userAgent);
    };
    
    setIsIOS(checkIOS());
  }, []);

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

  // Control HTML5 video with our player controls when not using native controls
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

  // For iOS devices, use the native HTML5 video player with controls
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

  // For non-iOS devices, use ReactPlayer
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
