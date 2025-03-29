
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SeriesPlayer from "@/components/SeriesPlayer";
import type { Episode, Series } from "@/lib/types";
import { getSeriesById, getEpisodeById } from "@/lib/mediaService";
import { ArrowLeft, SkipForward, ChevronDown, List } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

const EpisodePlayer = () => {
  const { seriesId, episodeId } = useParams<{ seriesId: string, episodeId: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextEpisodeId, setNextEpisodeId] = useState<string | null>(null);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  
  // Load episode and series data
  const loadEpisodeData = (epId: string, seriesId: string) => {
    setIsLoading(true);
    setShowNextEpisode(false);
    console.log("Looking for episode with ID:", epId);
    
    const foundSeries = getSeriesById(seriesId);
    const foundEpisode = getEpisodeById(epId);
    
    console.log("Found series:", foundSeries?.name);
    console.log("Found episode:", foundEpisode?.name);
    
    if (foundSeries && foundEpisode) {
      setSeries(foundSeries);
      setEpisode(foundEpisode);
      
      if (foundSeries.seasons) {
        const currentSeasonNumber = foundEpisode.season_number;
        const currentEpisodeNumber = foundEpisode.episode_number;
        
        const currentSeason = foundSeries.seasons.find(
          season => season.season_number === currentSeasonNumber
        );
        
        if (currentSeason && currentSeason.episodes) {
          const sortedEpisodes = [...currentSeason.episodes].sort(
            (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
          );
          
          const currentEpisodeIndex = sortedEpisodes.findIndex(
            ep => ep.episode_number === currentEpisodeNumber
          );
          
          if (currentEpisodeIndex !== -1 && currentEpisodeIndex < sortedEpisodes.length - 1) {
            setNextEpisodeId(sortedEpisodes[currentEpisodeIndex + 1].id);
          } else {
            const seasonNumbers = foundSeries.seasons.map(s => parseInt(s.season_number));
            const currentSeasonInt = parseInt(currentSeasonNumber);
            const nextSeasonNumber = seasonNumbers.find(num => num > currentSeasonInt);
            
            if (nextSeasonNumber) {
              const nextSeason = foundSeries.seasons.find(
                season => parseInt(season.season_number) === nextSeasonNumber
              );
              
              if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
                const sortedNextSeasonEpisodes = [...nextSeason.episodes].sort(
                  (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
                );
                
                setNextEpisodeId(sortedNextSeasonEpisodes[0].id);
              }
            }
          }
        }
      }
      
      setIsLoading(false);
    } else {
      console.error("Episode or series not found in storage. IDs:", { seriesId, epId });
      toast.error("Episode not found");
      navigate("/series");
    }
  };
  
  // Initial load
  useEffect(() => {
    if (!episodeId || !seriesId) {
      toast.error("No episode or series ID provided");
      navigate("/series");
      return;
    }
    
    loadEpisodeData(episodeId, seriesId);
  }, [episodeId, seriesId, navigate]);
  
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/series");
  };
  
  const handleEpisodeEnded = () => {
    if (nextEpisodeId) {
      setShowNextEpisode(true);
      
      const timer = setTimeout(() => {
        if (nextEpisodeId && seriesId) {
          handleEpisodeChange(nextEpisodeId);
        }
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  };
  
  const playNextEpisode = () => {
    if (nextEpisodeId) {
      handleEpisodeChange(nextEpisodeId);
    }
  };

  const handleEpisodeChange = (newEpisodeId: string) => {
    if (!seriesId) return;
    
    // Update the URL without full page reload
    navigate(`/series/${seriesId}/episode/${newEpisodeId}`, { replace: true });
    
    // Load the new episode data
    loadEpisodeData(newEpisodeId, seriesId);
    
    // Hide UI elements
    setShowEpisodeList(false);
    setShowNextEpisode(false);
  };

  const toggleEpisodeList = () => {
    setShowEpisodeList(!showEpisodeList);
  };
  
  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black flex flex-col">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className="bg-black/40 hover:bg-black/60 transition-colors rounded-full"
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to series</p>
            </TooltipContent>
          </Tooltip>
          
          {series?.seasons && series.seasons.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-black/40 hover:bg-black/60 transition-colors rounded-full"
                  variant="ghost"
                  size="icon"
                  onClick={toggleEpisodeList}
                >
                  <List className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Episode navigator</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {episode && (
            <div className="bg-black/40 text-white px-4 py-1.5 rounded-full text-sm">
              S{episode.season_number} E{episode.episode_number}
            </div>
          )}
        </div>
        
        {nextEpisodeId && showNextEpisode && (
          <div className="absolute bottom-20 right-4 z-20 bg-gray-900/90 p-4 rounded-lg shadow-lg border border-gray-800 max-w-xs animate-fade-in">
            <div className="text-white mb-2">Up next:</div>
            <div className="text-gray-300 text-sm mb-3">
              {series?.name} - {nextEpisodeId && getEpisodeById(nextEpisodeId)?.name}
            </div>
            <Button 
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md text-sm transition-colors"
              onClick={playNextEpisode}
            >
              <SkipForward className="w-4 h-4" /> 
              Play Now
            </Button>
          </div>
        )}
        
        {showEpisodeList && series?.seasons && (
          <div className="absolute top-16 left-4 z-20 bg-black/90 p-4 rounded-lg shadow-lg border border-gray-800 w-80 max-h-[80vh] animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium">Episodes</h3>
              <Button 
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white"
                onClick={() => setShowEpisodeList(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="mb-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                  >
                    {episode ? `Season ${episode.season_number}` : "Select Season"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-80 overflow-auto">
                  {series.seasons.map((season) => (
                    <DropdownMenuItem
                      key={season.id}
                      onClick={() => {
                        if (season.episodes && season.episodes.length > 0) {
                          const firstEpisode = [...season.episodes].sort(
                            (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
                          )[0];
                          handleEpisodeChange(firstEpisode.id);
                        }
                      }}
                    >
                      {season.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <ScrollArea className="h-[calc(80vh-9rem)]">
              {episode && series.seasons && (
                <div className="space-y-1">
                  {series.seasons
                    .find(s => s.season_number === episode.season_number)
                    ?.episodes
                    ?.sort((a, b) => parseInt(a.episode_number) - parseInt(b.episode_number))
                    .map((ep) => (
                      <Button
                        key={ep.id}
                        variant="ghost"
                        className={`w-full justify-start text-left ${
                          ep.id === episode.id 
                            ? "bg-primary/20 text-primary" 
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                        onClick={() => handleEpisodeChange(ep.id)}
                      >
                        <span className="w-8 text-xs">{ep.episode_number}.</span>
                        <span className="truncate">{ep.name}</span>
                      </Button>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-white flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-white/70">Loading episode...</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <SeriesPlayer 
                episode={episode} 
                series={series} 
                autoPlay 
                onEpisodeEnded={handleEpisodeEnded}
                onEpisodeChange={handleEpisodeChange}
              />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EpisodePlayer;
