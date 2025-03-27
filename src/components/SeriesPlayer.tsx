
import React, { useState, useEffect } from "react";
import { Episode, Series } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";
import { Calendar, Clock } from "lucide-react";
import { addToRecentlyWatched } from "@/lib/profileService";

interface SeriesPlayerProps {
  episode: Episode | null;
  series: Series | null;
  autoPlay?: boolean;
}

const SeriesPlayer: React.FC<SeriesPlayerProps> = ({ 
  episode,
  series,
  autoPlay = true 
}) => {
  const [showInfo, setShowInfo] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Auto-hide the info panel after 7 seconds
  useEffect(() => {
    if (showInfo) {
      const timer = setTimeout(() => {
        setShowInfo(false);
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [showInfo]);

  // Add to recently watched when episode is played
  useEffect(() => {
    if (episode && series) {
      addToRecentlyWatched({
        id: `${series.id}_${episode.season_number}_${episode.episode_number}`,
        type: 'episode',
        title: `${series.name} - ${episode.name}`,
        poster: episode.logo || series.logo,
        progress: 0 // Initial progress
      });
    }
  }, [episode, series]);
  
  // Update progress periodically
  const handleProgressUpdate = (currentProgress: number) => {
    setProgress(currentProgress);
    
    // Save progress every 10 seconds
    if (episode && series && Math.abs(currentProgress - progress) > 5) {
      addToRecentlyWatched({
        id: `${series.id}_${episode.season_number}_${episode.episode_number}`,
        type: 'episode',
        title: `${series.name} - ${episode.name}`,
        poster: episode.logo || series.logo,
        progress: currentProgress
      });
    }
  };

  // Convert episode to channel format for VideoPlayer
  const channel = episode ? {
    id: episode.id,
    name: `${series?.name || ''} - ${episode.name}`,
    url: episode.url,
    logo: episode.logo,
    group: series?.group
  } : null;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video w-full">
        <VideoPlayer 
          channel={channel} 
          autoPlay={autoPlay} 
          onProgressUpdate={handleProgressUpdate}
        />
        
        {/* Show info button when info is hidden */}
        {!showInfo && series && episode && (
          <button 
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-md text-sm transition-colors z-20"
            onClick={() => setShowInfo(true)}
          >
            Show Info
          </button>
        )}
      </div>
      
      {series && episode && showInfo && (
        <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{series.name}</h2>
            </div>
            <button 
              className="text-gray-400 hover:text-white text-sm bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded"
              onClick={() => setShowInfo(false)}
            >
              Hide
            </button>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300">
                  Season {episode.season_number}
                </div>
                <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300">
                  Episode {episode.episode_number}
                </div>
                {episode.added && (
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {episode.added}
                  </div>
                )}
                {episode.duration && (
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {episode.duration} min
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white">{episode.name}</h3>
            
            {episode.description && (
              <div className="text-gray-400 max-w-none">
                <p>{episode.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesPlayer;
