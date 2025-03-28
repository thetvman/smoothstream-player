
import React, { useRef, useEffect } from "react";
import ReactPlayer from 'react-player';
import { Loader2 } from 'lucide-react';
import { Channel } from "@/lib/types";

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
