
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
  
  const handleProgressUpdate = (progress: number) => {
    setCurrentProgress(progress);
    
    // Update watch history if it's been more than 10 seconds since last update
    const now = Date.now();
    if (now - lastUpdateTime > 10000 && channel) {
      addToRecentlyWatched({
        id: channel.id,
        type: contentType,
        title: title,
        poster: posterUrl || channel.logo,
        progress: progress
      });
      setLastUpdateTime(now);
    }
  };
  
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
    <VideoPlayer 
      channel={channel} 
      autoPlay={autoPlay} 
      onProgressUpdate={handleProgressUpdate}
    />
  );
};

export default TrackedVideoPlayer;
