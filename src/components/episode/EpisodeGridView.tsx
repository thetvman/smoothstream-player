
import React from "react";
import { Episode } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

interface EpisodeGridViewProps {
  episodes: Episode[];
  onPlayEpisode: (episode: Episode) => void;
  currentEpisodeId?: string;
}

const EpisodeGridView: React.FC<EpisodeGridViewProps> = ({
  episodes,
  onPlayEpisode,
  currentEpisodeId,
}) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {episodes.map((episode) => (
        <Card 
          key={episode.id}
          className={`cursor-pointer hover:bg-accent/50 transition-colors ${
            episode.id === currentEpisodeId ? "border-primary" : ""
          }`}
          onClick={() => onPlayEpisode(episode)}
        >
          <CardContent className="p-3">
            <div className="aspect-video bg-black/40 rounded mb-2 relative flex items-center justify-center">
              {episode.logo ? (
                <img 
                  src={episode.logo} 
                  alt={episode.name} 
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="text-white/30 text-xs">No Preview</div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <Play className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-1">Episode {episode.episode_number}</div>
            <h4 className="font-medium text-sm truncate">{episode.name}</h4>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EpisodeGridView;
