
import React, { useState, useEffect } from "react";
import { Episode, Series } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";
import { Clock, Calendar, Film, Star } from "lucide-react";

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
        <div className="mt-4 glass-card">
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {series.logo && (
                <img 
                  src={series.logo} 
                  alt={series.name} 
                  className="h-10 w-10 object-contain bg-black/30 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{series.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Film className="h-3.5 w-3.5" />
                    Season {episode.season_number}
                  </span>
                  {series.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {series.year}
                    </span>
                  )}
                  {series.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {series.rating}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-4 glass-dark p-3 rounded-lg">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <span className="bg-primary/20 text-primary rounded-full w-7 h-7 flex items-center justify-center text-sm">
                  {episode.episode_number}
                </span>
                {episode.name}
              </h4>
              
              {episode.duration && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  {episode.duration} min
                </div>
              )}
            </div>
            
            {episode.description && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Description</h5>
                <p className="text-sm text-muted-foreground glass-dark p-3 rounded-lg">
                  {episode.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesPlayer;
