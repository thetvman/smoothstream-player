
import React, { useState } from "react";
import { Episode, Season } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, Grid3x3, List, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EpisodeGridProps {
  seasons: Season[];
  onPlayEpisode: (episode: Episode) => void;
  currentSeasonNumber?: string;
  currentEpisodeId?: string;
}

const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  seasons,
  onPlayEpisode,
  currentSeasonNumber,
  currentEpisodeId,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeSeason, setActiveSeason] = useState<string>(
    currentSeasonNumber || (seasons.length > 0 ? seasons[0].season_number : "1")
  );

  const sortedSeasons = [...seasons].sort(
    (a, b) => parseInt(a.season_number) - parseInt(b.season_number)
  );

  const handleSeasonChange = (value: string) => {
    setActiveSeason(value);
  };

  const getEpisodesForSeason = (seasonNumber: string) => {
    const season = seasons.find((s) => s.season_number === seasonNumber);
    if (!season || !season.episodes) return [];
    
    return [...season.episodes].sort(
      (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
    );
  };

  const currentSeasonEpisodes = getEpisodesForSeason(activeSeason);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={activeSeason} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {sortedSeasons.map((season) => (
                <SelectItem key={season.id} value={season.season_number}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === "grid" ? "bg-primary/20 text-primary" : ""}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grid View</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === "list" ? "bg-primary/20 text-primary" : ""}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>List View</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ScrollArea className="h-[450px] pr-4">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentSeasonEpisodes.map((episode) => (
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
        ) : (
          <div className="space-y-2">
            {currentSeasonEpisodes.map((episode) => (
              <div 
                key={episode.id}
                className={`p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors flex items-center ${
                  episode.id === currentEpisodeId ? "bg-primary/10 border border-primary/20" : "border border-transparent"
                }`}
                onClick={() => onPlayEpisode(episode)}
              >
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
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default EpisodeGrid;
