
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import { useHotkeys } from 'react-hotkeys-hook';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Channel } from "@/lib/types";
import { updateWatchHistory } from "@/lib/watchHistoryService";

interface VideoPlayerProps {
  channel: Channel | null;
  autoPlay?: boolean;
  onEnded?: () => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  channel, 
  autoPlay = false, 
  onEnded,
  onPlaybackChange 
}) => {
  const [playerState, setPlayerState] = useState({
    playing: autoPlay,
    muted: false,
    volume: 0.5,
    duration: 0,
    currentTime: 0,
    seeking: false,
    isFullscreen: false,
    isLoading: true
  });
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const watchIntervalRef = useRef<number | null>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!channel) return;
    
    setWatchStartTime(Date.now());
    
    if (watchIntervalRef.current) {
      window.clearInterval(watchIntervalRef.current);
    }
    
    watchIntervalRef.current = window.setInterval(() => {
      if (watchStartTime && playerState.playing) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 5) {
          updateWatchHistory(
            channel.id,
            channel.name,
            "channel",
            watchTimeSeconds,
            channel.logo
          );
          setWatchStartTime(Date.now());
        }
      }
    }, 30000);
    
    return () => {
      if (watchStartTime && channel) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 5) {
          updateWatchHistory(
            channel.id,
            channel.name,
            "channel",
            watchTimeSeconds,
            channel.logo
          );
        }
      }
      
      if (watchIntervalRef.current) {
        window.clearInterval(watchIntervalRef.current);
      }
    };
  }, [channel, watchStartTime, playerState.playing]);

  const handlePlayPause = useCallback(() => {
    const newPlayingState = !playerState.playing;
    setPlayerState(prevState => ({ ...prevState, playing: newPlayingState }));
    
    if (onPlaybackChange) {
      onPlaybackChange(newPlayingState);
    }
  }, [playerState.playing, onPlaybackChange]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setPlayerState(prevState => ({ ...prevState, volume: newVolume }));
    if (newVolume === 0) {
      setPlayerState(prevState => ({ ...prevState, muted: true }));
    } else {
      setPlayerState(prevState => ({ ...prevState, muted: false }));
    }
  }, []);

  const handleMuteUnmute = useCallback(() => {
    setPlayerState(prevState => ({ ...prevState, muted: !prevState.muted }));
  }, []);

  const handleDuration = useCallback((duration: number) => {
    setPlayerState(prevState => ({ ...prevState, duration }));
  }, []);

  const handleProgress = useCallback((state: { playedSeconds: number }) => {
    if (!playerState.seeking) {
      setPlayerState(prevState => ({ ...prevState, currentTime: state.playedSeconds }));
    }
  }, [playerState.seeking]);

  const handleSeek = useCallback((value: number[]) => {
    setPlayerState(prevState => ({ ...prevState, currentTime: value[0] }));
  }, []);

  const handleSeekMouseDown = useCallback(() => {
    setPlayerState(prevState => ({ ...prevState, seeking: true }));
  }, []);

  const handleSeekMouseUp = useCallback((value: number[]) => {
    setPlayerState(prevState => ({ ...prevState, seeking: false }));
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

  const handleEnded = useCallback(() => {
    if (watchStartTime && channel) {
      const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
      if (watchTimeSeconds > 5) {
        updateWatchHistory(
          channel.id,
          channel.name,
          "channel",
          watchTimeSeconds,
          channel.logo
        );
      }
    }
    
    if (onEnded) {
      onEnded();
    }
  }, [onEnded, channel, watchStartTime]);

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

  const handlePlay = useCallback(() => {
    setPlayerState(prev => ({ ...prev, playing: true }));
    setWatchStartTime(Date.now());
    
    if (onPlaybackChange) {
      onPlaybackChange(true);
    }
  }, [onPlaybackChange]);
  
  const handlePause = useCallback(() => {
    setPlayerState(prev => ({ ...prev, playing: false }));
    
    if (watchStartTime && channel) {
      const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
      if (watchTimeSeconds > 5) {
        updateWatchHistory(
          channel.id,
          channel.name,
          "channel",
          watchTimeSeconds,
          channel.logo
        );
      }
      setWatchStartTime(null);
    }
    
    if (onPlaybackChange) {
      onPlaybackChange(false);
    }
  }, [channel, watchStartTime, onPlaybackChange]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setPlayerState(prevState => ({ ...prevState, duration: video.duration }));
      setPlayerState(prevState => ({ ...prevState, currentTime: video.currentTime }));
    };
    
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", () => {
      setPlayerState(prevState => ({ ...prevState, volume: video.volume }));
      setPlayerState(prevState => ({ ...prevState, muted: video.muted }));
    });
    video.addEventListener("loadedmetadata", () => {
      setPlayerState(prevState => ({ ...prevState, duration: video.duration }));
    });
    video.addEventListener("waiting", () => setIsLoading(true));
    video.addEventListener("canplay", () => setIsLoading(false));
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", () => {});
      video.removeEventListener("loadedmetadata", () => {});
      video.removeEventListener("waiting", () => {});
      video.removeEventListener("canplay", () => {});
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [handlePlay, handlePause, handleEnded, handleError]);

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
        playing={playerState.playing}
        muted={playerState.muted}
        volume={playerState.volume}
        width="100%"
        height="100%"
        style={{ backgroundColor: 'black' }}
        onReady={handleReady}
        onDuration={handleDuration}
        onProgress={handleProgress}
        onEnded={handleEnded}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent text-white flex items-center">
        <div className="flex items-center gap-2 mr-4">
          <Button variant="ghost" size="icon" onClick={handlePlayPause}>
            {playerState.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleMuteUnmute}>
            {playerState.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>

          <div className="w-24">
            <Slider
              defaultValue={[playerState.volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>

        <div className="flex-1 text-sm">
          <span>{formatTime(playerState.currentTime)}</span> / <span>{formatTime(playerState.duration)}</span>
        </div>

        <div className="w-48 mr-4">
          <Slider
            defaultValue={[playerState.currentTime]}
            max={playerState.duration}
            step={1}
            onValueChange={handleSeek}
            onMouseDown={handleSeekMouseDown}
            onValueCommit={handleSeekMouseUp}
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
