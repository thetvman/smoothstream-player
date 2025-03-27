
import React, { useState, useEffect } from "react";
import { Episode, Series } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";

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
    <div className="w-full h-full">
      <VideoPlayer channel={channel} autoPlay={autoPlay} />
      
      {series && episode && (
        <div className="mt-4 p-4 bg-card rounded-lg">
          <h3 className="font-medium mb-1">{series.name} - Season {episode.season_number}</h3>
          <h4 className="text-lg font-bold mb-2">Episode {episode.episode_number}: {episode.name}</h4>
          
          {episode.description && (
            <p className="text-sm text-muted-foreground">{episode.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SeriesPlayer;
