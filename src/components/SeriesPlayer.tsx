import React, { useState, useEffect } from "react";
import type { Episode, Series } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { updateWatchHistory } from "@/lib/watchHistoryService";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface SeriesPlayerProps {
  episode: Episode | null;
  series: Series | null;
  autoPlay?: boolean;
  onEpisodeEnded?: () => void;
  onEpisodeChange?: (episodeId: string) => void;
}

const SeriesPlayer: React.FC<SeriesPlayerProps> = ({ 
  episode,
  series,
  autoPlay = true,
  onEpisodeEnded,
  onEpisodeChange
}) => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [prevEpisodeId, setPrevEpisodeId] = useState<string | null>(null);
  const [nextEpisodeId, setNextEpisodeId] = useState<string | null>(null);
  
  // Only show info initially when explicitly requested
  useEffect(() => {
    if (showInfo) {
      const timer = setTimeout(() => {
        setShowInfo(false);
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [showInfo]);

  // Find previous and next episodes whenever the episode changes
  useEffect(() => {
    if (!episode || !series || !series.seasons) return;
    
    const currentSeasonNumber = episode.season_number;
    const currentEpisodeNumber = episode.episode_number;
    
    const currentSeason = series.seasons.find(
      season => season.season_number === currentSeasonNumber
    );
    
    if (currentSeason && currentSeason.episodes) {
      const sortedEpisodes = [...currentSeason.episodes].sort(
        (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
      );
      
      const currentEpisodeIndex = sortedEpisodes.findIndex(
        ep => ep.episode_number === currentEpisodeNumber
      );
      
      // Find next episode
      if (currentEpisodeIndex !== -1 && currentEpisodeIndex < sortedEpisodes.length - 1) {
        setNextEpisodeId(sortedEpisodes[currentEpisodeIndex + 1].id);
      } else {
        const seasonNumbers = series.seasons.map(s => parseInt(s.season_number));
        const currentSeasonInt = parseInt(currentSeasonNumber);
        const nextSeasonNumber = seasonNumbers.find(num => num > currentSeasonInt);
        
        if (nextSeasonNumber) {
          const nextSeason = series.seasons.find(
            season => parseInt(season.season_number) === nextSeasonNumber
          );
          
          if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
            const sortedNextSeasonEpisodes = [...nextSeason.episodes].sort(
              (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
            );
            
            setNextEpisodeId(sortedNextSeasonEpisodes[0].id);
          } else {
            setNextEpisodeId(null);
          }
        } else {
          setNextEpisodeId(null);
        }
      }
      
      // Find previous episode
      if (currentEpisodeIndex > 0) {
        setPrevEpisodeId(sortedEpisodes[currentEpisodeIndex - 1].id);
      } else {
        const seasonNumbers = series.seasons.map(s => parseInt(s.season_number)).sort((a, b) => a - b);
        const currentSeasonInt = parseInt(currentSeasonNumber);
        const prevSeasonNumber = [...seasonNumbers].reverse().find(num => num < currentSeasonInt);
        
        if (prevSeasonNumber) {
          const prevSeason = series.seasons.find(
            season => parseInt(season.season_number) === prevSeasonNumber
          );
          
          if (prevSeason && prevSeason.episodes && prevSeason.episodes.length > 0) {
            const sortedPrevSeasonEpisodes = [...prevSeason.episodes].sort(
              (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
            );
            
            setPrevEpisodeId(sortedPrevSeasonEpisodes[sortedPrevSeasonEpisodes.length - 1].id);
          } else {
            setPrevEpisodeId(null);
          }
        } else {
          setPrevEpisodeId(null);
        }
      }
    }
  }, [episode, series]);

  // Reset tracking for watch time when episode changes
  useEffect(() => {
    if (!episode) return;
    
    // Reset watch time when episode changes
    setWatchStartTime(Date.now());
    
    const saveWatchTime = () => {
      if (watchStartTime && episode && isPlaying) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 5) { // Only track if watched more than 5 seconds
          updateWatchHistory(
            episode.id,
            `${series?.name || ''} - ${episode.name}`,
            "episode",
            watchTimeSeconds,
            episode.logo
          );
          setWatchStartTime(Date.now()); // Reset for next interval
        }
      }
    };
    
    // Periodically save watch time
    const intervalId = setInterval(saveWatchTime, 30000); // Every 30 seconds
    
    return () => {
      // Save final watch time when unmounting
      saveWatchTime();
      clearInterval(intervalId);
    };
  }, [episode, series, watchStartTime, isPlaying]);

  // Convert episode to channel format for VideoPlayer
  const channel = episode ? {
    id: episode.id,
    name: `${series?.name || ''} - ${episode.name}`,
    url: episode.url,
    logo: episode.logo,
    group: series?.group
  } : null;

  const handleVideoEnded = () => {
    // Save final watch time when episode ends
    if (watchStartTime && episode) {
      const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
      if (watchTimeSeconds > 5) {
        updateWatchHistory(
          episode.id,
          `${series?.name || ''} - ${episode.name}`,
          "episode",
          watchTimeSeconds,
          episode.logo
        );
      }
      setWatchStartTime(null);
    }
    
    if (onEpisodeEnded) {
      onEpisodeEnded();
    }
  };
  
  // Watch video playback status changes
  const handlePlaybackChange = (isPlaying: boolean) => {
    setIsPlaying(isPlaying);
    
    if (isPlaying) {
      if (!watchStartTime) {
        setWatchStartTime(Date.now());
      }
    } else {
      // Save watch time when paused
      if (watchStartTime && episode) {
        const watchTimeSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
        if (watchTimeSeconds > 5) {
          updateWatchHistory(
            episode.id,
            `${series?.name || ''} - ${episode.name}`,
            "episode",
            watchTimeSeconds,
            episode.logo
          );
        }
        setWatchStartTime(null);
      }
    }
  };

  const navigateToEpisode = (episodeId: string | null) => {
    if (!episodeId) return;
    
    // Use the callback if provided (for in-page navigation)
    if (onEpisodeChange) {
      onEpisodeChange(episodeId);
    }
    // Otherwise use the router (for full page navigation)
    else if (series) {
      navigate(`/series/${series.id}/episode/${episodeId}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video w-full group">
        {channel && (
          <VideoPlayer 
            channel={channel} 
            autoPlay={autoPlay} 
            onEnded={handleVideoEnded}
            onPlaybackChange={handlePlaybackChange}
          />
        )}
        
        {/* Navigation controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {prevEpisodeId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateToEpisode(prevEpisodeId)}
                  className="h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous Episode</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {nextEpisodeId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateToEpisode(nextEpisodeId)}
                  className="h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next Episode</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {/* Show info button with transition */}
        <button 
          className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-md text-sm transition-colors z-20"
          onClick={() => setShowInfo(true)}
        >
          Show Info
        </button>
      </div>
      
      {series && episode && showInfo && (
        <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-md animate-fade-in">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{series.name}</h2>
            </div>
            <button 
              className="text-gray-400 hover:text-white text-sm bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
              onClick={() => setShowInfo(false)}
            >
              Hide
            </button>
          </div>
          
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
            
            <h3 className="text-lg font-semibold text-white">{episode.name}</h3>
            
            {episode.description && (
              <div className="text-gray-400 max-w-none">
                <p>{episode.description}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {prevEpisodeId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToEpisode(prevEpisodeId)}
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
                  onClick={() => navigateToEpisode(nextEpisodeId)}
                  className="text-gray-300 border-gray-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesPlayer;
