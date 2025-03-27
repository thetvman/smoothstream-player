
import React, { useState, useEffect } from "react";
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
      <div className="relative rounded-lg overflow-hidden bg-player-background">
        <VideoPlayer channel={channel} autoPlay={autoPlay} />
      </div>
      
      {series && episode && (
        <div className="mt-6 p-6 bg-card rounded-lg border border-border shadow-sm">
          <div className="flex flex-col space-y-4">
            <div>
              <h2 className="text-xl font-bold">{series.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="bg-secondary px-3 py-1 rounded-full text-xs">
                  Season {episode.season_number}
                </div>
                <div className="bg-secondary px-3 py-1 rounded-full text-xs">
                  Episode {episode.episode_number}
                </div>
                {episode.added && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {episode.added}
                  </div>
                )}
                {episode.duration && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {episode.duration} min
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold">{episode.name}</h3>
            
            {episode.description && (
              <div className="prose-sm text-muted-foreground max-w-none">
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
