
import React, { useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { Channel } from '@/lib/types';
import { addToRecentlyWatched } from '@/lib/profileService';

interface TrackedVideoPlayerProps {
  channel: Channel | null;
  autoPlay?: boolean;
  contentType: 'channel' | 'movie' | 'episode';
  title: string;
  posterUrl?: string;
}

const TrackedVideoPlayer: React.FC<TrackedVideoPlayerProps> = ({
  channel,
  autoPlay = true,
  contentType,
  title,
  posterUrl
}) => {
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [currentProgress, setCurrentProgress] = useState(0);
  
  // Track playback progress every 10 seconds
  useEffect(() => {
    if (!channel) return;
    
    const intervalId = setInterval(() => {
      const videoElement = document.querySelector('video');
      if (videoElement && !videoElement.paused) {
        const duration = videoElement.duration;
        const currentTime = videoElement.currentTime;
        
        if (duration && !isNaN(duration) && duration > 0) {
          const progress = Math.round((currentTime / duration) * 100);
          setCurrentProgress(progress);
          
          // Update watch history if it's been more than 10 seconds since last update
          const now = Date.now();
          if (now - lastUpdateTime > 10000) {
            addToRecentlyWatched({
              id: channel.id,
              type: contentType,
              title: title,
              poster: posterUrl || channel.logo,
              progress: progress
            });
            setLastUpdateTime(now);
          }
        }
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [channel, contentType, title, posterUrl, lastUpdateTime]);
  
  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (channel && currentProgress > 0) {
        addToRecentlyWatched({
          id: channel.id,
          type: contentType,
          title: title,
          poster: posterUrl || channel.logo,
          progress: currentProgress
        });
      }
    };
  }, [channel, contentType, title, posterUrl, currentProgress]);

  return (
    <VideoPlayer channel={channel} autoPlay={autoPlay} />
  );
};

export default TrackedVideoPlayer;
