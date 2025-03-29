
import React, { useEffect, useState } from 'react';
import { Channel, Playlist } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChannelPreloaderProps {
  currentChannel: Channel;
  playlist: Playlist | null;
}

const ChannelPreloader: React.FC<ChannelPreloaderProps> = ({ 
  currentChannel, 
  playlist 
}) => {
  const [adjacentChannels, setAdjacentChannels] = useState<{prev: Channel | null, next: Channel | null}>({
    prev: null,
    next: null
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!playlist || !currentChannel) return;
    
    const currentIndex = playlist.channels.findIndex(c => c.id === currentChannel.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % playlist.channels.length;
    const prevIndex = (currentIndex - 1 + playlist.channels.length) % playlist.channels.length;
    
    setAdjacentChannels({
      next: playlist.channels[nextIndex],
      prev: playlist.channels[prevIndex]
    });
  }, [currentChannel, playlist]);

  // Preload adjacent channels with mobile optimizations
  useEffect(() => {
    // Don't preload on mobile if there are performance issues
    if (isMobile) {
      // On mobile, only preload the next channel to save bandwidth
      const nextChannel = adjacentChannels.next;
      if (!nextChannel) return;
      
      // For HLS streams, preload only the manifest on mobile
      if (nextChannel.url.includes('.m3u8')) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = nextChannel.url;
        link.as = 'fetch';
        link.type = 'application/vnd.apple.mpegurl';
        document.head.appendChild(link);
        
        return () => {
          document.head.removeChild(link);
        };
      }
      
      return;
    }
    
    // On desktop, preload both previous and next channels
    const preloadChannel = (channel: Channel | null) => {
      if (!channel) return;
      
      // For HLS streams
      if (channel.url.includes('.m3u8')) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = channel.url;
        link.as = 'fetch';
        link.type = 'application/vnd.apple.mpegurl';
        document.head.appendChild(link);
        
        return () => {
          document.head.removeChild(link);
        };
      }
      
      // For direct MP4 streams
      if (channel.url.includes('.mp4')) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = channel.url;
        link.as = 'video';
        document.head.appendChild(link);
        
        return () => {
          document.head.removeChild(link);
        };
      }
    };
    
    const cleanupPrev = preloadChannel(adjacentChannels.prev);
    const cleanupNext = preloadChannel(adjacentChannels.next);
    
    return () => {
      if (cleanupPrev) cleanupPrev();
      if (cleanupNext) cleanupNext();
    };
  }, [adjacentChannels, isMobile]);

  // Placeholder divs - we don't need iframes for preloading
  return (
    <div className="hidden">
      {adjacentChannels.next && (
        <div data-channel-id={adjacentChannels.next.id} />
      )}
      {!isMobile && adjacentChannels.prev && (
        <div data-channel-id={adjacentChannels.prev.id} />
      )}
    </div>
  );
};

export default ChannelPreloader;
