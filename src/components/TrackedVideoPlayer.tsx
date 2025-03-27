
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
    console.log(`[TrackedVideoPlayer] Progress update for ${contentType} "${title}": ${progress}%`);
    
    // Update watch history if it's been more than 10 seconds since last update
    const now = Date.now();
    if (now - lastUpdateTime > 10000 && channel) {
      console.log(`[TrackedVideoPlayer] Saving to watch history: ${contentType} "${title}" (${progress}%)`);
      
      const watchItem = {
        id: channel.id,
        type: contentType,
        title: title,
        poster: posterUrl || channel.logo,
        progress: progress
      };
      console.log('[TrackedVideoPlayer] Watch item data:', watchItem);
      
      addToRecentlyWatched(watchItem)
        .then(() => console.log('[TrackedVideoPlayer] Successfully saved to watch history'))
        .catch(err => console.error('[TrackedVideoPlayer] Error saving to watch history:', err));
      
      setLastUpdateTime(now);
    }
  };
  
  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (channel && currentProgress > 0) {
        console.log(`[TrackedVideoPlayer] Component unmounting, saving final progress: ${currentProgress}%`);
        
        const watchItem = {
          id: channel.id,
          type: contentType,
          title: title,
          poster: posterUrl || channel.logo,
          progress: currentProgress
        };
        console.log('[TrackedVideoPlayer] Final watch item data:', watchItem);
        
        addToRecentlyWatched(watchItem)
          .catch(err => console.error('[TrackedVideoPlayer] Error saving final progress:', err));
      }
    };
  }, [channel, contentType, title, posterUrl, currentProgress]);

  console.log(`[TrackedVideoPlayer] Rendering for ${contentType} "${title}"`);

  return (
    <div className="tracked-video-player">
      <VideoPlayer 
        channel={channel} 
        autoPlay={autoPlay} 
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
};

export default TrackedVideoPlayer;
