import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import { useHotkeys } from 'react-hotkeys-hook';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Channel } from "@/lib/types";

interface VideoPlayerProps {
  channel: Channel | null;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, autoPlay = false }) => {
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = useCallback(() => {
    setPlaying(prevPlaying => !prevPlaying);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  }, []);

  const handleMuteUnmute = useCallback(() => {
    setMuted(prevMuted => !prevMuted);
  }, []);

  const handleDuration = useCallback((duration: number) => {
    setDuration(duration);
  }, []);

  const handleProgress = useCallback((state: { playedSeconds: number }) => {
    if (!seeking) {
      setCurrentTime(state.playedSeconds);
    }
  }, [seeking]);

  const handleSeek = useCallback((value: number[]) => {
    setCurrentTime(value[0]);
  }, []);

  const handleSeekMouseDown = useCallback(() => {
    setSeeking(true);
  }, []);

  const handleSeekMouseUp = useCallback((value: number[]) => {
    setSeeking(false);
    playerRef.current?.seekTo(value[0], 'seconds');
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (screenfull.isEnabled && playerContainerRef.current) {
      screenfull.toggle(playerContainerRef.current);
      setIsFullscreen(screenfull.isFullscreen);
    }
  }, []);

  const handleScreenfullChange = useCallback(() => {
    setIsFullscreen(screenfull.isFullscreen);
  }, []);

  const handleReady = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    console.error("Error loading stream for channel:", channel?.name);
  }, [channel?.name]);

  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', handleScreenfullChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleScreenfullChange);
      }
    };
  }, [handleScreenfullChange]);

  useHotkeys('space', handlePlayPause, { preventDefault: true });
  useHotkeys('m', handleMuteUnmute, { preventDefault: true });
  useHotkeys('f', handleToggleFullscreen, { preventDefault: true });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  if (!channel) {
    return <div className="text-red-500">No channel selected.</div>;
  }

  return (
    <div className="relative aspect-video bg-black" ref={playerContainerRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
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
        onReady={handleReady}
        onDuration={handleDuration}
        onProgress={handleProgress}
        onError={handleError}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent text-white flex items-center">
        <div className="flex items-center gap-2 mr-4">
          <Button variant="ghost" size="icon" onClick={handlePlayPause}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleMuteUnmute}>
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>

          <div className="w-24">
            <Slider
              defaultValue={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>

        <div className="flex-1 text-sm">
          <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>

        <div className="w-48 mr-4">
          <Slider
            defaultValue={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
          />
        </div>

        <Button variant="ghost" size="icon" onClick={handleToggleFullscreen}>
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoPlayer;
