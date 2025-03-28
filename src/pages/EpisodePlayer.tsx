
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SeriesPlayer from "@/components/SeriesPlayer";
import { Episode, Series } from "@/lib/types";
import { getSeriesById, getEpisodeById } from "@/lib/mediaService";
import { ArrowLeft, SkipForward } from "lucide-react";
import { toast } from "sonner";

const EpisodePlayer = () => {
  const { seriesId, episodeId } = useParams<{ seriesId: string, episodeId: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextEpisodeId, setNextEpisodeId] = useState<string | null>(null);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  
  // Load episode and series from localStorage
  useEffect(() => {
    setIsLoading(true);
    setShowNextEpisode(false);
    console.log("Looking for episode with ID:", episodeId);
    
    if (!episodeId || !seriesId) {
      toast.error("No episode or series ID provided");
      navigate("/series");
      return;
    }
    
    // Get the series and episode directly using our storage method
    const foundSeries = getSeriesById(seriesId);
    const foundEpisode = getEpisodeById(episodeId);
    
    console.log("Found series:", foundSeries?.name);
    console.log("Found episode:", foundEpisode?.name);
    
    if (foundSeries && foundEpisode) {
      setSeries(foundSeries);
      setEpisode(foundEpisode);
      
      // Find the next episode
      if (foundSeries.seasons) {
        const currentSeasonNumber = foundEpisode.season_number;
        const currentEpisodeNumber = foundEpisode.episode_number;
        
        // Try to find the next episode in the same season
        const currentSeason = foundSeries.seasons.find(
          season => season.season_number === currentSeasonNumber
        );
        
        if (currentSeason && currentSeason.episodes) {
          // Sort episodes by episode number
          const sortedEpisodes = [...currentSeason.episodes].sort(
            (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
          );
          
          const currentEpisodeIndex = sortedEpisodes.findIndex(
            ep => ep.episode_number === currentEpisodeNumber
          );
          
          if (currentEpisodeIndex !== -1 && currentEpisodeIndex < sortedEpisodes.length - 1) {
            // There's a next episode in this season
            setNextEpisodeId(sortedEpisodes[currentEpisodeIndex + 1].id);
          } else {
            // Try to find the first episode of the next season
            const seasonNumbers = foundSeries.seasons.map(s => parseInt(s.season_number));
            const currentSeasonInt = parseInt(currentSeasonNumber);
            const nextSeasonNumber = seasonNumbers.find(num => num > currentSeasonInt);
            
            if (nextSeasonNumber) {
              const nextSeason = foundSeries.seasons.find(
                season => parseInt(season.season_number) === nextSeasonNumber
              );
              
              if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
                // Sort episodes by episode number
                const sortedNextSeasonEpisodes = [...nextSeason.episodes].sort(
                  (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
                );
                
                // Set the first episode of the next season
                setNextEpisodeId(sortedNextSeasonEpisodes[0].id);
              }
            }
          }
        }
      }
      
      setIsLoading(false);
    } else {
      console.error("Episode or series not found in storage. IDs:", { seriesId, episodeId });
      toast.error("Episode not found");
      navigate("/series");
    }
  }, [episodeId, seriesId, navigate]);
  
  // Use preventDefault to handle back button click
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/series");
  };
  
  // Handle episode ended event
  const handleEpisodeEnded = () => {
    if (nextEpisodeId) {
      setShowNextEpisode(true);
      
      // Auto-play the next episode after 10 seconds if user doesn't interact
      const timer = setTimeout(() => {
        if (nextEpisodeId && seriesId) {
          navigate(`/series/${seriesId}/episode/${nextEpisodeId}`);
        }
      }, 10000);
      
      // Clean up the timer when component unmounts or user navigates
      return () => clearTimeout(timer);
    }
  };
  
  // Play next episode immediately
  const playNextEpisode = () => {
    if (nextEpisodeId && seriesId) {
      navigate(`/series/${seriesId}/episode/${nextEpisodeId}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="btn-icon bg-black/40 hover:bg-black/60"
          onClick={handleBackClick}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      {nextEpisodeId && showNextEpisode && (
        <div className="absolute bottom-20 right-4 z-20 bg-gray-900/90 p-4 rounded-lg shadow-lg border border-gray-800 max-w-xs">
          <div className="text-white mb-2">Up next:</div>
          <div className="text-gray-300 text-sm mb-3">
            {series?.name} - {nextEpisodeId && getEpisodeById(nextEpisodeId)?.name}
          </div>
          <button 
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md text-sm"
            onClick={playNextEpisode}
          >
            <SkipForward className="w-4 h-4" /> 
            Play Now
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-white flex items-center justify-center h-full">Loading episode...</div>
        ) : (
          <SeriesPlayer 
            episode={episode} 
            series={series} 
            autoPlay 
            onEpisodeEnded={handleEpisodeEnded}
          />
        )}
      </div>
    </div>
  );
};

export default EpisodePlayer;
