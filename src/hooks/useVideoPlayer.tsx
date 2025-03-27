
import { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { Channel, PlayerState } from "@/lib/types";

export function useVideoPlayer(
  media: Channel | null,
  autoPlay: boolean = true
) {
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
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (media?.url) {
      setStreamUrl(media.url);
      setError(null);
    }
  }, [media]);
  
  const tryAlternativeFormat = () => {
    if (!media?.url) return false;
    
    const currentUrl = streamUrl || media.url;
    
    if (currentUrl.endsWith('.ts')) {
      const m3u8Url = currentUrl.replace(/\.ts$/, '.m3u8');
      console.log('Trying alternative format:', m3u8Url);
      setStreamUrl(m3u8Url);
      return true;
    }
    
    if (currentUrl.endsWith('.m3u8')) {
      const tsUrl = currentUrl.replace(/\.m3u8$/, '.ts');
      console.log('Trying alternative format:', tsUrl);
      setStreamUrl(tsUrl);
      return true;
    }
    
    return false;
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    
    setError(null);
    setPlayerState(prev => ({ ...prev, loading: true }));
    
    const loadStream = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      const isHlsStream = streamUrl.endsWith('.m3u8');
      console.log('Loading ' + (isHlsStream ? 'HLS' : 'direct') + ' stream:', streamUrl);
      
      if (isHlsStream && Hls.isSupported()) {
        const hls = new Hls({
          startLevel: -1,
          manifestLoadingMaxRetry: 5,
          levelLoadingMaxRetry: 5,
          fragLoadingMaxRetry: 5,
          lowLatencyMode: false,
          enableWorker: true,
          backBufferLength: 30,
          maxBufferLength: 30,
          maxMaxBufferLength: 60
        });
        
        hlsRef.current = hls;
        
        hls.loadSource(streamUrl);
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
        
        let errorCount = 0;
        hls.on(Hls.Events.ERROR, (_, data) => {
          errorCount++;
          console.warn(`HLS error (${errorCount}):`, data.type, data.details);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("Fatal network error encountered, trying to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("Fatal media error encountered, trying to recover");
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                hlsRef.current = null;
                
                if (tryAlternativeFormat()) {
                  console.log("Trying alternative stream format after fatal error");
                } else {
                  setError("Failed to load stream: unrecoverable error");
                }
                break;
            }
          } else if (errorCount > 10) {
            if (tryAlternativeFormat()) {
              console.log("Trying alternative stream format after too many errors");
              errorCount = 0;
            }
          }
        });
      } 
      else if (video.canPlayType("application/vnd.apple.mpegurl") && isHlsStream) {
        console.log('Using native HLS support for:', streamUrl);
        video.src = streamUrl;
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
        console.log('Using direct playback for:', streamUrl);
        video.src = streamUrl;
        
        if (autoPlay) {
          video.play()
            .then(() => {
              setPlayerState(prev => ({ ...prev, playing: true, loading: false }));
            })
            .catch((e) => {
              console.error("Direct playback failed:", e);
              
              if (tryAlternativeFormat()) {
                console.log("Trying alternative stream format after direct playback failed");
              } else {
                setError("Your browser does not support this stream format");
                setPlayerState(prev => ({ ...prev, loading: false }));
              }
            });
        }
      }
    };
    
    loadStream();
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, autoPlay]);
  
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
    
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
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
  
  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
  };
  
  const handleVolumeChange = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = volume;
    if (volume > 0) {
      video.muted = false;
    }
  };
  
  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = time;
  };
  
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
  
  return {
    videoRef,
    containerRef,
    playerState,
    error,
    handlePlayPause,
    handleMute,
    handleVolumeChange,
    handleSeek,
    handleFullscreen,
    tryAlternativeFormat
  };
}
