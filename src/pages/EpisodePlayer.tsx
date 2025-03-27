
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SeriesPlayer from "@/components/SeriesPlayer";
import { Episode, Series } from "@/lib/types";
import { getSeriesById, getEpisodeById } from "@/lib/mediaService";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const EpisodePlayer = () => {
  const { seriesId, episodeId } = useParams<{ seriesId: string, episodeId: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load episode and series from localStorage
  useEffect(() => {
    setIsLoading(true);
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
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-white flex items-center justify-center h-full">Loading episode...</div>
        ) : (
          <SeriesPlayer episode={episode} series={series} autoPlay />
        )}
      </div>
    </div>
  );
};

export default EpisodePlayer;
