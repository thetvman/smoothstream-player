
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Episode, Series } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EpisodeInfoProps {
  episode: Episode;
  series: Series;
  isFullscreen: boolean;
  showInfo: boolean;
  prevEpisodeId: string | null;
  nextEpisodeId: string | null;
  onNavigate: (episodeId: string) => void;
  onHideInfo: () => void;
}

const EpisodeInfo: React.FC<EpisodeInfoProps> = ({
  episode,
  series,
  isFullscreen,
  showInfo,
  prevEpisodeId,
  nextEpisodeId,
  onNavigate,
  onHideInfo
}) => {
  if (!showInfo) return null;
  
  return (
    <div className={`${isFullscreen ? 'absolute bottom-20 left-0 right-0 mx-4 z-30' : ''} p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-md animate-fade-in`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white line-clamp-2">{series.name}</h2>
        </div>
        <button 
          className="text-gray-400 hover:text-white text-sm bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors flex-shrink-0 ml-2"
          onClick={onHideInfo}
        >
          Hide
        </button>
      </div>
      
      <ScrollArea className="max-h-[60vh]">
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
          
          <h3 className="text-lg font-semibold text-white line-clamp-2">{episode.name}</h3>
          
          {episode.description && (
            <div className="text-gray-400">
              <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                {episode.description}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {prevEpisodeId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(prevEpisodeId)}
                className="text-gray-300 border-gray-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            
            {nextEpisodeId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(nextEpisodeId)}
                className="text-gray-300 border-gray-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EpisodeInfo;
