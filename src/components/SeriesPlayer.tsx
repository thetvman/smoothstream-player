
import React from "react";
import { Episode, Series } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";
import { Calendar, Clock } from "lucide-react";

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
  // Convert episode to channel format for VideoPlayer
  const channel = episode ? {
    id: episode.id,
    name: `${series?.name || ''} - ${episode.name}`,
    url: episode.url,
    logo: episode.logo,
    group: series?.group
  } : null;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <VideoPlayer channel={channel} autoPlay={autoPlay} />
      </div>
      
      {series && episode && (
        <div className="mt-6 p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-sm">
          <div className="flex flex-col space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">{series.name}</h2>
              <div className="flex items-center gap-3 mt-1">
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
