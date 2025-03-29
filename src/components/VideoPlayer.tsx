import React, { useState, useCallback, useRef, useEffect } from "react";
import screenfull from 'screenfull';
import { useHotkeys } from 'react-hotkeys-hook';
import { Channel } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatchTime } from "@/hooks/use-watch-time";
import VideoDisplay from "./player/VideoDisplay";
import PlayerControls from "./player/PlayerControls";
import PlayerInfo from "./player/PlayerInfo";

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
  const isMobile = useIsMobile();
  const [playerState, setPlayerState] = useState({
    playing: autoPlay,
    muted: false,
    volume: 0.5,
    duration: 0,
    currentTime: 0,
    seeking: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [videoStats, setVideoStats] = useState({
    resolution: undefined,
    frameRate: undefined,
    audioBitrate: undefined,
    audioChannels: undefined
  });
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || '';
      return /iPad|iPhone|iPod/.test(userAgent);
    };
    
    setIsIOS(checkIOS());
  }, []);
  
  const { handlePlaybackEnd } = useWatchTime({
    id: channel?.id || '',
    name: channel?.name || '',
    type: "channel",
    isPlaying: playerState.playing,
    thumbnailUrl: channel?.logo
  });

  const handlePlayPause = useCallback(() => {
    const newPlayingState = !playerState.playing;
    setPlayerState(prevState => ({ ...prevState, playing: newPlayingState }));
    
    if (onPlaybackChange) {
      onPlaybackChange(newPlayingState);
    }
  }, [playerState.playing, onPlaybackChange]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setPlayerState(prevState => ({ 
      ...prevState, 
      volume: newVolume,
      muted: newVolume === 0
    }));
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
    setPlayerState(prevState => ({ ...prevState, seeking: false, currentTime: value[0] }));
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
    if (channel) {
      handlePlaybackEnd();
    }
    
    if (onEnded) {
      onEnded();
    }
  }, [onEnded, handlePlaybackEnd, channel]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    if (channel) {
      console.error("Error loading stream for channel:", channel.name);
    }
  }, [channel]);

  const handlePlay = useCallback(() => {
    setPlayerState(prev => ({ ...prev, playing: true }));
    
    if (onPlaybackChange) {
      onPlaybackChange(true);
    }
  }, [onPlaybackChange]);
  
  const handlePause = useCallback(() => {
    setPlayerState(prev => ({ ...prev, playing: false }));
    
    if (onPlaybackChange) {
      onPlaybackChange(false);
    }
  }, [onPlaybackChange]);

  const handleStatsUpdate = useCallback((stats: {
    resolution?: string;
    frameRate?: number;
    audioBitrate?: string;
    audioChannels?: string;
  }) => {
    setVideoStats(prevStats => ({
      resolution: stats.resolution !== undefined ? stats.resolution : prevStats.resolution,
      frameRate: stats.frameRate !== undefined ? stats.frameRate : prevStats.frameRate,
      audioBitrate: stats.audioBitrate !== undefined ? stats.audioBitrate : prevStats.audioBitrate,
      audioChannels: stats.audioChannels !== undefined ? stats.audioChannels : prevStats.audioChannels
    }));
  }, []);

  useHotkeys('space', (e) => {
    e.preventDefault();
    handlePlayPause();
  }, { enabled: !isMobile });
  
  useHotkeys('m', (e) => {
    e.preventDefault();
    handleMuteUnmute();
  }, { enabled: !isMobile });
  
  useHotkeys('f', (e) => {
    e.preventDefault();
    handleToggleFullscreen();
  }, { enabled: !isMobile });

  React.useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', handleScreenfullChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleScreenfullChange);
      }
    };
  }, [handleScreenfullChange]);

  const handleContainerTap = useCallback(() => {
    if (isMobile) {
      setShowControls(prev => !prev);
    }
  }, [isMobile]);

  if (!channel) {
    return <div className="text-red-500">No channel selected.</div>;
  }

  return (
    <div 
      className="relative aspect-video bg-black" 
      ref={playerContainerRef}
      onClick={handleContainerTap}
    >
      <VideoDisplay
        channel={channel}
        playing={playerState.playing}
        muted={playerState.muted}
        volume={playerState.volume}
        onReady={() => setIsLoading(false)}
        onDuration={handleDuration}
        onProgress={handleProgress}
        onEnded={() => {
          if (channel) {
            handlePlaybackEnd();
          }
          
          if (onEnded) {
            onEnded();
          }
        }}
        onError={() => {
          setIsLoading(false);
          if (channel) {
            console.error("Error loading stream for channel:", channel.name);
          }
        }}
        onPlay={() => {
          setPlayerState(prev => ({ ...prev, playing: true }));
          
          if (onPlaybackChange) {
            onPlaybackChange(true);
          }
        }}
        onPause={() => {
          setPlayerState(prev => ({ ...prev, playing: false }));
          
          if (onPlaybackChange) {
            onPlaybackChange(false);
          }
        }}
        isLoading={isLoading}
        isFullscreen={isFullscreen}
        onStatsUpdate={handleStatsUpdate}
      />

      {!isIOS && (
        <>
          <PlayerControls
            playing={playerState.playing}
            muted={playerState.muted}
            volume={playerState.volume}
            currentTime={playerState.currentTime}
            duration={playerState.duration}
            isFullscreen={isFullscreen}
            onPlayPause={handlePlayPause}
            onMuteUnmute={handleMuteUnmute}
            onVolumeChange={handleVolumeChange}
            onSeek={handleSeek}
            onSeekStart={handleSeekMouseDown}
            onSeekEnd={handleSeekMouseUp}
            onToggleFullscreen={handleToggleFullscreen}
          />

          {channel && (
            <PlayerInfo
              channel={channel}
              isVisible={showControls}
              isFullscreen={isFullscreen}
              stats={videoStats}
            />
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
