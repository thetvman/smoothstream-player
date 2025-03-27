
import { useRef, useState } from "react";
import { Channel, PlayerState } from "@/lib/types";
import { usePlayerEvents } from "./player/usePlayerEvents";
import { useHlsPlayer } from "./player/useHlsPlayer";
import { useAlternativeFormat } from "./player/useAlternativeFormat";

export function useVideoPlayer(
  media: Channel | null,
  autoPlay: boolean = true
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    loading: true,
    fullscreen: false
  });
  
  const [error, setError] = useState<string | null>(null);
  
  // Use custom hook for alternating between formats (.ts and .m3u8)
  const { streamUrl, setStreamUrl, tryAlternativeFormat: originalTryAlternativeFormat } = 
    useAlternativeFormat(media?.url || null);
  
  // Customize the tryAlternativeFormat for video formats
  const tryAlternativeFormat = () => {
    if (!streamUrl) return false;
    
    if (streamUrl.endsWith('.ts')) {
      const m3u8Url = streamUrl.replace(/\.ts$/, '.m3u8');
      console.log('Trying alternative format:', m3u8Url);
      setStreamUrl(m3u8Url);
      return true;
    }
    
    if (streamUrl.endsWith('.m3u8')) {
      const tsUrl = streamUrl.replace(/\.m3u8$/, '.ts');
      console.log('Trying alternative format:', tsUrl);
      setStreamUrl(tsUrl);
      return true;
    }
    
    return false;
  };
  
  // Set up player controls (play/pause, seek, volume, etc)
  const controls = usePlayerEvents(videoRef, containerRef, setPlayerState, setError);
  
  // Handle HLS playback
  useHlsPlayer({
    videoRef,
    streamUrl,
    autoPlay,
    onReady: () => {
      setPlayerState(prev => ({ ...prev, loading: false }));
    },
    onError: (message) => {
      setError(message);
      setPlayerState(prev => ({ ...prev, loading: false }));
    },
    onTryAlternative: tryAlternativeFormat
  });
  
  return {
    videoRef,
    containerRef,
    playerState,
    error,
    handlePlayPause: controls.handlePlayPause,
    handleMute: controls.handleMute,
    handleVolumeChange: controls.handleVolumeChange,
    handleSeek: controls.handleSeek,
    handleFullscreen: controls.handleFullscreen,
    tryAlternativeFormat
  };
}
