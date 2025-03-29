
import React, { useRef, useEffect, memo } from "react";
import Hls from "hls.js";
import { Movie } from "@/lib/types";
import LoadingSpinner from "../common/LoadingSpinner";
import PlayerControls from "./PlayerControls";

interface MovieStreamPlayerProps {
  movie: Movie;
  streamUrl: string;
  playerState: {
    playing: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    loading: boolean;
    fullscreen: boolean;
  };
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  onPlayPause: () => void;
  onMute: () => void;
  onVolumeChange: (value: number[]) => void;
  onSeek: (value: number[]) => void;
  onSeekStart: (value: number[]) => void;
  onFullscreen: () => void;
  autoPlay?: boolean;
  error: string | null;
}

const MovieStreamPlayer: React.FC<MovieStreamPlayerProps> = ({
  movie,
  streamUrl,
  playerState,
  videoRef,
  containerRef,
  onPlayPause,
  onMute,
  onVolumeChange,
  onSeek,
  onSeekStart,
  onFullscreen,
  autoPlay = true,
  error
}) => {
  // Check if HLS is needed for this stream
  const isHlsStream = streamUrl.endsWith('.m3u8');
  
  // Set up HLS if needed
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    
    let hls: Hls | null = null;
    
    if (isHlsStream && Hls.isSupported()) {
      hls = new Hls({
        startLevel: -1,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
        fragLoadingMaxRetry: 3,
        lowLatencyMode: false,
        enableWorker: true,
        backBufferLength: 3,
        maxBufferLength: 3,
        maxMaxBufferLength: 3
      });
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed, attempting to play");
        if (autoPlay) {
          video.play().catch((e) => {
            console.error("Failed to autoplay:", e);
          });
        }
      });
      
      // Add error handling for HLS errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("HLS network error - trying to recover");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("HLS media error - trying to recover");
              hls?.recoverMediaError();
              break;
            default:
              console.error("Fatal HLS error, cannot recover");
              break;
          }
        }
      });
    } 
    else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHlsStream) {
      // Use native HLS support if available (Safari) or direct playback for non-HLS
      video.src = streamUrl;
      
      if (autoPlay) {
        console.log("Using native playback, attempting to play");
        video.play().catch(e => {
          console.error("Direct playback failed:", e);
        });
      }
    }
    
    // Cleanup function
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl, autoPlay, isHlsStream, videoRef]);
  
  return (
    <>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
      />
      
      {playerState.loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {!error && movie && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent player-controls z-20">
          <h3 className="text-white font-medium truncate">{movie.name}</h3>
        </div>
      )}
      
      {movie && !error && (
        <PlayerControls
          playing={playerState.playing}
          muted={playerState.muted}
          volume={playerState.volume}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          isFullscreen={playerState.fullscreen}
          onPlayPause={onPlayPause}
          onMuteUnmute={onMute}
          onVolumeChange={onVolumeChange}
          onSeek={onSeek}
          onSeekStart={() => onSeekStart([playerState.currentTime])}
          onSeekEnd={onSeek}
          onToggleFullscreen={onFullscreen}
        />
      )}
    </>
  );
};

export default memo(MovieStreamPlayer);
