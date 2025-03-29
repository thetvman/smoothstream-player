
import React from "react";
import { Episode } from "@/lib/types";
import { Play } from "lucide-react";

interface EpisodeListViewProps {
  episodes: Episode[];
  onPlayEpisode: (episode: Episode) => void;
  currentEpisodeId?: string;
}

const EpisodeListView: React.FC<EpisodeListViewProps> = ({
  episodes,
  onPlayEpisode,
  currentEpisodeId,
}) => {
  return (
    <div className="space-y-2">
      {episodes.map((episode) => (
        <div 
          key={episode.id}
          className={`p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors ${
            episode.id === currentEpisodeId ? "bg-primary/10 border border-primary/20" : "border border-transparent"
          }`}
          onClick={() => onPlayEpisode(episode)}
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0">
              <Play className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm truncate">
                  <span className="text-muted-foreground mr-2">E{episode.episode_number}</span>
                  {episode.name}
                </div>
                {episode.duration && (
                  <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {episode.duration} min
                  </div>
                )}
              </div>
              {episode.description && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {episode.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EpisodeListView;
