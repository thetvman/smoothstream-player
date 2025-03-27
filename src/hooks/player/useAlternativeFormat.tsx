
import { useState, useEffect } from "react";

export function useAlternativeFormat(mediaUrl: string | null) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  
  // Initialize streamUrl when mediaUrl changes
  useEffect(() => {
    if (mediaUrl) {
      setStreamUrl(mediaUrl);
    }
  }, [mediaUrl]);
  
  // Function to try alternative format
  const tryAlternativeFormat = () => {
    if (!streamUrl) return false;
    
    if (streamUrl.endsWith('.mp4')) {
      const m3u8Url = streamUrl.replace(/\.mp4$/, '.m3u8');
      console.log('Trying alternative format:', m3u8Url);
      setStreamUrl(m3u8Url);
      return true;
    }
    
    if (streamUrl.endsWith('.m3u8')) {
      const mp4Url = streamUrl.replace(/\.m3u8$/, '.mp4');
      console.log('Trying alternative format:', mp4Url);
      setStreamUrl(mp4Url);
      return true;
    }
    
    return false;
  };
  
  return { streamUrl, setStreamUrl, tryAlternativeFormat };
}
