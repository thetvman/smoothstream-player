
import React, { useState } from "react";
import { Series, Season, Episode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Star, Tv, ChevronDown, ChevronUp, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SeriesDetailsProps {
  series: Series | null;
  onPlayEpisode: (episode: Episode, series: Series) => void;
  onLoadSeasons: (series: Series) => void;
  isLoading?: boolean;
}

const SeriesDetails: React.FC<SeriesDetailsProps> = ({ 
  series, 
  onPlayEpisode, 
  onLoadSeasons,
  isLoading = false 
}) => {
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="mt-4">
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Tv className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No Series Selected</h3>
        <p className="text-muted-foreground">
          Select a series from the list to see details and episodes
        </p>
      </div>
    );
  }

  const handleLoadSeasons = () => {
    if (!series.seasons || series.seasons.length === 0) {
      onLoadSeasons(series);
    }
  };

  const handleSeasonClick = (seasonId: string) => {
    setExpandedSeason(expandedSeason === seasonId ? null : seasonId);
    if (!series.seasons || series.seasons.length === 0) {
      onLoadSeasons(series);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="relative mb-4 rounded-lg overflow-hidden h-48 bg-card">
        {series.backdrop ? (
          <img
            src={series.backdrop}
            alt={series.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : series.logo ? (
          <img
            src={series.logo}
            alt={series.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Tv className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="p-4 text-white">
            <h2 className="text-xl font-bold">{series.name}</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {series.year && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-4 w-4" />
            <span>{series.year}</span>
          </div>
        )}
        {series.rating && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="mr-1 h-4 w-4" />
            <span>{series.rating}</span>
          </div>
        )}
        {series.group && (
          <div className="flex items-center text-sm bg-muted text-muted-foreground px-2 py-1 rounded-full">
            {series.group}
          </div>
        )}
      </div>

      {series.genre && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-1">Genre</h3>
          <p className="text-sm text-muted-foreground">{series.genre}</p>
        </div>
      )}

      {series.description && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-1">Description</h3>
          <p className="text-sm text-muted-foreground">{series.description}</p>
        </div>
      )}

      <div className="mt-4 flex-1 overflow-hidden">
        <h3 className="text-sm font-medium mb-2">Episodes</h3>
        
        {!series.seasons ? (
          <div className="flex justify-center my-4">
            <Button onClick={handleLoadSeasons}>
              Load Seasons & Episodes
            </Button>
          </div>
        ) : series.seasons.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No episodes available</p>
        ) : (
          <ScrollArea className="h-[calc(100%-3rem)]">
            <div className="pr-4">
              {series.seasons.map((season) => (
                <div key={season.id} className="mb-2 border rounded-md">
                  <div 
                    className="p-3 flex justify-between items-center cursor-pointer hover:bg-accent"
                    onClick={() => handleSeasonClick(season.id)}
                  >
                    <h4 className="font-medium">{season.name}</h4>
                    {expandedSeason === season.id ? 
                      <ChevronUp className="h-5 w-5" /> : 
                      <ChevronDown className="h-5 w-5" />
                    }
                  </div>
                  
                  {expandedSeason === season.id && season.episodes && (
                    <div className="p-2 border-t">
                      {season.episodes.map((episode) => (
                        <div 
                          key={episode.id}
                          className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                          onClick={() => onPlayEpisode(episode, series)}
                        >
                          <div className="mr-3">
                            <Play className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {episode.episode_number}. {episode.name}
                            </div>
                            {episode.duration && (
                              <div className="text-xs text-muted-foreground">
                                {episode.duration} min
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default SeriesDetails;
