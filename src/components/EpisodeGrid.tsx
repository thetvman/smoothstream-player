
import React, { useState } from "react";
import { Season } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import SeasonSelector from "./episode/SeasonSelector";
import EpisodeViewModeSelector from "./episode/EpisodeViewModeSelector";
import EpisodeGridView from "./episode/EpisodeGridView";
import EpisodeListView from "./episode/EpisodeListView";
import EpisodePagination from "./episode/EpisodePagination";
import { useEpisodePagination } from "@/hooks/useEpisodePagination";

interface EpisodeGridProps {
  seasons: Season[];
  onPlayEpisode: (episode: any) => void;
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
  
  const getEpisodesForSeason = (seasonNumber: string) => {
    const season = seasons.find((s) => s.season_number === seasonNumber);
    if (!season || !season.episodes) return [];
    
    return [...season.episodes].sort(
      (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
    );
  };

  const allSeasonEpisodes = getEpisodesForSeason(activeSeason);
  
  const { 
    currentPage, 
    paginatedEpisodes, 
    handlePageChange,
    setCurrentPage
  } = useEpisodePagination(allSeasonEpisodes, viewMode === "grid" ? 16 : 10);

  const handleSeasonChange = (value: string) => {
    setActiveSeason(value);
    setCurrentPage(1); // Reset to first page when changing season
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    // Also reset pagination when changing view mode
    setCurrentPage(1);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <SeasonSelector 
            seasons={seasons}
            activeSeason={activeSeason}
            onSeasonChange={handleSeasonChange}
          />
          
          <EpisodeViewModeSelector 
            viewMode={viewMode} 
            onViewModeChange={handleViewModeChange} 
          />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="pb-4">
              {viewMode === "grid" ? (
                <EpisodeGridView 
                  episodes={paginatedEpisodes.items}
                  onPlayEpisode={onPlayEpisode}
                  currentEpisodeId={currentEpisodeId}
                />
              ) : (
                <EpisodeListView 
                  episodes={paginatedEpisodes.items}
                  onPlayEpisode={onPlayEpisode}
                  currentEpisodeId={currentEpisodeId}
                />
              )}
            </div>
            
            {paginatedEpisodes.totalPages > 1 && (
              <EpisodePagination 
                currentPage={currentPage}
                totalPages={paginatedEpisodes.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EpisodeGrid;
