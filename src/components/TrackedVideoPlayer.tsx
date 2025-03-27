
import React from 'react';
import VideoPlayer from './VideoPlayer';
import { Channel } from '@/lib/types';

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
  // Watch progress tracking has been temporarily disabled
  const handleProgressUpdate = (progress: number) => {
    // Watch history tracking temporarily removed
    console.log(`[TrackedVideoPlayer] Progress update: ${progress}%`);
  };

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
