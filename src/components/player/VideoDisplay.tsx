
import React, { useState, useEffect } from "react";
import { Channel } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import IOSVideoDisplay from "./IOSVideoDisplay";
import StandardVideoDisplay from "./StandardVideoDisplay";

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

const VideoDisplay: React.FC<VideoDisplayProps> = (props) => {
  const [isIOS, setIsIOS] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || '';
      return /iPad|iPhone|iPod/.test(userAgent);
    };
    
    setIsIOS(checkIOS());
  }, []);

  if (isIOS) {
    return (
      <IOSVideoDisplay
        channel={props.channel}
        playing={props.playing}
        muted={props.muted}
        onReady={props.onReady}
        onDuration={props.onDuration}
        onEnded={props.onEnded}
        onError={props.onError}
        onPlay={props.onPlay}
        onPause={props.onPause}
        isLoading={props.isLoading}
      />
    );
  }

  return (
    <StandardVideoDisplay
      {...props}
    />
  );
};

export default VideoDisplay;
