import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Series, SeriesCategory, Episode, XtreamCredentials } from "@/lib/types";
import { fetchAllSeries, fetchSeriesWithEpisodes, storeEpisodeForPlayback, clearOldSeriesData } from "@/lib/mediaService";
import SeriesList from "@/components/SeriesList";
import SeriesDetails from "@/components/SeriesDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/utils";

const Series = () => {
  const navigate = useNavigate();
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [activeTab, setActiveTab] = useState<string>("browse");
  
  const getCredentials = (): XtreamCredentials | null => {
    const playlist = localStorage.getItem("iptv-playlist");
    if (!playlist) return null;
    
    const parsedPlaylist = safeJsonParse(playlist, null);
    return parsedPlaylist?.credentials || null;
  };
  
  const credentials = getCredentials();
  
  const { data: seriesCategories, isLoading, error } = useQuery({
    queryKey: ["series", credentials?.server],
    queryFn: async () => {
      if (!credentials) {
        throw new Error("No Xtream credentials found");
      }
      return fetchAllSeries(credentials);
    },
    enabled: !!credentials,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to load series: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, [error]);
  
  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
    setActiveTab("details");
  };
  
  useEffect(() => {
    clearOldSeriesData();
  }, []);
  
  const handleLoadSeasons = async (series: Series) => {
    if (!credentials) {
      toast.error("No Xtream credentials found");
      return;
    }
    
    try {
      toast.info(`Loading seasons for ${series.name}...`);
      const updatedSeries = await fetchSeriesWithEpisodes(credentials, series);
      
      if (!updatedSeries.seasons || updatedSeries.seasons.length === 0) {
        toast.warning("No episodes found for this series");
      } else {
        setSelectedSeries(updatedSeries);
        toast.success(`Loaded ${updatedSeries.seasons.length} seasons`);
      }
    } catch (error) {
      console.error("Error loading series episodes:", error);
      toast.error("Failed to load episodes");
    }
  };
  
  const handlePlayEpisode = (episode: Episode, series: Series) => {
    if (!episode) {
      toast.error("No episode selected");
      return;
    }
    
    try {
      storeEpisodeForPlayback(episode, series);
      navigate(`/series/${series.id}/episode/${episode.id}`);
    } catch (error) {
      console.error("Error preparing episode for playback:", error);
      toast.error("Failed to prepare episode for playback");
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl h-dvh flex flex-col">
      <div className="flex items-center mb-4 gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="btn-icon"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="ml-2">Back</span>
          </button>
          
          <h1 className="text-2xl font-bold">TV Series</h1>
        </div>
        
        <button 
          onClick={() => navigate("/movies")}
          className="btn-icon"
        >
          <Film className="w-5 h-5" />
          <span className="ml-2">Movies</span>
        </button>
      </div>
      
      {!credentials ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
          <p className="text-lg mb-4">No Xtream Codes credentials found</p>
          <p className="text-muted-foreground mb-6">
            Please load a playlist with Xtream Codes credentials to access series
          </p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => navigate("/")}
          >
            Go to Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <div className="md:col-span-1 h-[calc(100vh-8rem)]">
            <SeriesList 
              seriesCategories={seriesCategories || null}
              selectedSeries={selectedSeries}
              onSelectSeries={handleSelectSeries}
              isLoading={isLoading}
            />
          </div>
          
          <div className="md:col-span-2 md:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">Browse</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browse" className="h-[calc(100vh-12rem)]">
                <SeriesList 
                  seriesCategories={seriesCategories || null}
                  selectedSeries={selectedSeries}
                  onSelectSeries={handleSelectSeries}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="details" className="h-[calc(100vh-12rem)]">
                <SeriesDetails 
                  series={selectedSeries}
                  onPlayEpisode={handlePlayEpisode}
                  onLoadSeasons={handleLoadSeasons}
                  isLoading={isLoading && !selectedSeries}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="hidden md:block md:col-span-2 border rounded-lg h-[calc(100vh-8rem)]">
            <SeriesDetails 
              series={selectedSeries}
              onPlayEpisode={handlePlayEpisode}
              onLoadSeasons={handleLoadSeasons}
              isLoading={isLoading && !selectedSeries}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Series;
