import React, { useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { Channel } from '@/lib/types';
import { addToRecentlyWatched } from '@/lib/profileService';
import { useProfile } from '@/context/ProfileContext';

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
  const { profile } = useProfile();
  
  const handleProgressUpdate = (progress: number) => {
    setCurrentProgress(progress);
    // Watch history tracking temporarily removed
  };
  
  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (channel && currentProgress > 0 && profile) {
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
      } else if (!profile) {
        console.log('[TrackedVideoPlayer] Skipping final progress save: No profile found');
      }
    };
  }, [channel, contentType, title, posterUrl, currentProgress, profile]);

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
