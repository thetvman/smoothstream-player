
import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { Channel, PlayerState } from "@/lib/types";
import PlayerControls from "./PlayerControls";
import LoadingSpinner from "./common/LoadingSpinner";

interface VideoPlayerProps {
  channel: Channel | null;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
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
  
  // Initialize HLS and load channel
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel?.url) return;
    
    setError(null);
    setPlayerState(prev => ({ ...prev, loading: true }));
    
    const loadChannel = () => {
      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          startLevel: -1,
          manifestLoadingMaxRetry: 5,
          levelLoadingMaxRetry: 5,
          fragLoadingMaxRetry: 5
        });
        
        hlsRef.current = hls;
        
        hls.loadSource(channel.url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play()
              .then(() => {
                setPlayerState(prev => ({ ...prev, playing: true, loading: false }));
              })
              .catch((e) => {
                console.error("Failed to autoplay:", e);
                setPlayerState(prev => ({ ...prev, loading: false }));
              });
          } else {
            setPlayerState(prev => ({ ...prev, loading: false }));
          }
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Try to recover network error
                console.warn("Fatal network error encountered, trying to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("Fatal media error encountered, trying to recover");
                hls.recoverMediaError();
                break;
              default:
                // Cannot recover
                hls.destroy();
                setError("Failed to load stream: unrecoverable error");
                break;
            }
          }
        });
      } 
      // For browsers with native HLS support
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = channel.url;
        video.addEventListener("loadedmetadata", () => {
          if (autoPlay) {
            video.play()
              .then(() => {
                setPlayerState(prev => ({ ...prev, playing: true, loading: false }));
              })
              .catch(() => {
                setPlayerState(prev => ({ ...prev, loading: false }));
              });
          } else {
            setPlayerState(prev => ({ ...prev, loading: false }));
          }
        });
      } else {
        setError("Your browser does not support HLS playback");
      }
    };
    
    loadChannel();
    
    // Clean up
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, autoPlay]);
  
  // Set up time update and other video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: video.currentTime,
        duration: video.duration || 0
      }));
    };
    
    const handlePlay = () => {
      setPlayerState(prev => ({ ...prev, playing: true }));
    };
    
    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, playing: false }));
    };
    
    const handleVolumeChange = () => {
      setPlayerState(prev => ({
        ...prev,
        volume: video.volume,
        muted: video.muted
      }));
    };
    
    const handleLoadStart = () => {
      setPlayerState(prev => ({ ...prev, loading: true }));
    };
    
    const handleCanPlay = () => {
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    const handleError = () => {
      setError("Error playing stream. Please try again.");
      setPlayerState(prev => ({ ...prev, loading: false }));
    };
    
    // Add event listeners
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    // Remove event listeners on cleanup
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, []);
  
  // Handle play/pause toggling
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (playerState.playing) {
      video.pause();
    } else {
      video.play().catch((e) => {
        console.error("Failed to play:", e);
      });
    }
  };
  
  // Handle mute toggling
  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
  };
  
  // Handle volume change
  const handleVolumeChange = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = volume;
    if (volume > 0) {
      video.muted = false;
    }
  };
  
  // Handle seeking
  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = time;
  };
  
  // Handle fullscreen toggle
  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setPlayerState(prev => ({ ...prev, fullscreen: true }));
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setPlayerState(prev => ({ ...prev, fullscreen: false }));
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({
        ...prev,
        fullscreen: !!document.fullscreenElement
      }));
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-player overflow-hidden rounded-lg group"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />
      
      {/* Loading spinner */}
      {playerState.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
          <div className="text-red-500 mb-2 text-lg">⚠️ {error}</div>
          {channel && (
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
              onClick={() => {
                setError(null);
                const video = videoRef.current;
                if (video) {
                  video.load();
                }
              }}
            >
              Try Again
            </button>
          )}
        </div>
      )}
      
      {/* Channel information overlay */}
      {channel && !error && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent player-controls">
          <h3 className="text-white font-medium truncate">{channel.name}</h3>
        </div>
      )}
      
      {/* Controls */}
      {channel && !error && (
        <PlayerControls
          videoRef={videoRef}
          playerState={playerState}
          onPlayPause={handlePlayPause}
          onMute={handleMute}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
          onFullscreen={handleFullscreen}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
