
import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface UseHlsPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  streamUrl: string | null;
  autoPlay: boolean;
  onReady: () => void;
  onError: (message: string) => void;
  onTryAlternative: () => boolean;
}

export function useHlsPlayer({
  videoRef,
  streamUrl,
  autoPlay,
  onReady,
  onError,
  onTryAlternative
}: UseHlsPlayerProps) {
  const hlsRef = useRef<Hls | null>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    
    // Clean up any existing HLS instance
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
              onReady();
            })
            .catch((e) => {
              console.error("Failed to autoplay:", e);
              onReady();
            });
        } else {
          onReady();
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
              
              if (onTryAlternative()) {
                console.log("Trying alternative stream format after fatal error");
              } else {
                onError("Failed to load stream: unrecoverable error");
              }
              break;
          }
        } else if (errorCount > 10) {
          if (onTryAlternative()) {
            console.log("Trying alternative stream format after too many errors");
            errorCount = 0;
          }
        }
      });
    } 
    else {
      console.log('Using direct playback for:', streamUrl);
      video.src = streamUrl;
      
      if (autoPlay) {
        video.play()
          .then(() => {
            onReady();
          })
          .catch((e) => {
            console.error("Direct playback failed:", e);
            
            if (onTryAlternative()) {
              console.log("Trying alternative stream format after direct playback failed");
            } else {
              onError("Your browser does not support this stream format");
            }
          });
      } else {
        onReady();
      }
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, autoPlay, videoRef, onReady, onError, onTryAlternative]);
  
  return hlsRef;
}
