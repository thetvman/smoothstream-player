
import React, { useRef, useEffect } from "react";
import { Loader2 } from 'lucide-react';
import { Channel } from "@/lib/types";

interface IOSVideoDisplayProps {
  channel: Channel;
  playing: boolean;
  muted: boolean;
  onReady: () => void;
  onDuration: (duration: number) => void;
  onEnded: () => void;
  onError: () => void;
  onPlay: () => void;
  onPause: () => void;
  isLoading: boolean;
}

const IOSVideoDisplay: React.FC<IOSVideoDisplayProps> = ({
  channel,
  playing,
  muted,
  onReady,
  onDuration,
  onEnded,
  onError,
  onPlay,
  onPause,
  isLoading
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      // Pass the current time to parent component
      if (onDuration) {
        onDuration(video.duration || 0);
      }
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
  }, [onDuration, onPlay, onPause, onEnded, onError]);

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
};

export default IOSVideoDisplay;
