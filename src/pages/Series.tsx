
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Episode } from "@/lib/types";
import { getSeriesById, getEpisodeById } from "@/lib/mediaService";
import { ArrowLeft, SkipForward, Tv, Film, Search, ChevronRight, CalendarIcon, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SeriesList from "@/components/SeriesList";
import SeriesDetails from "@/components/SeriesDetails";
import SeriesSuggestions from "@/components/SeriesSuggestions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllSeries, fetchSeriesWithEpisodes, storeEpisodeForPlayback, clearOldSeriesData } from "@/lib/mediaService";
import { useQuery } from "@tanstack/react-query";
import { safeJsonParse } from "@/lib/utils";
import type { XtreamCredentials, Series as SeriesType } from "@/lib/types";
import AdvancedSearch, { AdvancedSearchParams } from "@/components/AdvancedSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const Series = () => {
  const navigate = useNavigate();
  const [selectedSeries, setSelectedSeries] = useState<SeriesType | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [featuredSeries, setFeaturedSeries] = useState<SeriesType | null>(null);
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>({
    title: "",
    genre: "",
    yearFrom: 1950,
    yearTo: new Date().getFullYear(),
    ratingMin: 0
  });
  const [filteredSeries, setFilteredSeries] = useState<SeriesType[]>([]);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  
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

  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !activeCategory) {
      setActiveCategory(seriesCategories[0].id);
    }
  }, [seriesCategories, activeCategory]);

  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !featuredSeries) {
      const categoriesWithSeries = seriesCategories.filter(cat => cat.series.length > 0);
      if (categoriesWithSeries.length > 0) {
        const randomCategory = categoriesWithSeries[Math.floor(Math.random() * categoriesWithSeries.length)];
        if (randomCategory && randomCategory.series.length > 0) {
          const randomSeries = randomCategory.series[Math.floor(Math.random() * randomCategory.series.length)];
          setFeaturedSeries(randomSeries);
        }
      }
    }
  }, [seriesCategories, featuredSeries]);
  
  const handleSelectSeries = (series: SeriesType) => {
    setSelectedSeries(series);
  };
  
  useEffect(() => {
    clearOldSeriesData();
  }, []);
  
  const handleLoadSeasons = async (series: SeriesType) => {
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
  
  const handlePlayEpisode = (episode: Episode, series: SeriesType) => {
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

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const getSuggestedSeries = (): SeriesType[] => {
    if (!seriesCategories) return [];
    
    const allSeries: SeriesType[] = [];
    seriesCategories.forEach(category => {
      allSeries.push(...category.series);
    });
    
    const filteredSeries = allSeries.filter(series => series.id !== selectedSeries?.id);
    const shuffled = [...filteredSeries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  };

  const applyAdvancedSearch = (params: AdvancedSearchParams) => {
    if (!seriesCategories) return;
    
    setSearchParams(params);
    setIsAdvancedSearch(true);
    
    let results: SeriesType[] = [];
    
    seriesCategories.forEach(category => {
      results = [...results, ...category.series];
    });
    
    results = results.filter(series => {
      if (params.title && !series.name.toLowerCase().includes(params.title.toLowerCase())) {
        return false;
      }
      
      if (params.genre && series.genre && 
          !series.genre.toLowerCase().includes(params.genre.toLowerCase())) {
        return false;
      }
      
      if (series.year) {
        const year = parseInt(series.year);
        if (year < params.yearFrom || year > params.yearTo) {
          return false;
        }
      }
      
      if (series.rating) {
        const rating = parseFloat(series.rating);
        if (rating < params.ratingMin) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredSeries(results);
  };

  const clearAdvancedSearch = () => {
    setIsAdvancedSearch(false);
    setQuickSearch("");
    setSearchParams({
      title: "",
      genre: "",
      yearFrom: 1950,
      yearTo: new Date().getFullYear(),
      ratingMin: 0
    });
  };

  const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setQuickSearch(searchTerm);
    
    if (!searchTerm.trim()) {
      setIsAdvancedSearch(false);
      return;
    }
    
    if (!seriesCategories) return;
    
    setIsAdvancedSearch(true);
    
    let results: SeriesType[] = [];
    seriesCategories.forEach(category => {
      results = [...results, ...category.series];
    });
    
    results = results.filter(series => 
      series.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredSeries(results);
  };

  const renderSeriesGrid = (series: SeriesType[]) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {series.map((series, index) => (
          <motion.div 
            key={series.id} 
            className="cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                delay: index * 0.05,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            onClick={() => {
              setSelectedSeries(series);
              handleLoadSeasons(series);
            }}
          >
            <div className="relative aspect-[2/3] bg-black rounded-xl overflow-hidden mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300">
              {series.logo ? (
                <img 
                  src={series.logo} 
                  alt={series.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <Tv className="h-12 w-12 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                <motion.div 
                  className="bg-primary text-white p-2 rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Tv className="h-6 w-6" />
                </motion.div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-sm truncate text-white group-hover:text-primary transition-colors duration-300">{series.name}</h3>
              <div className="flex text-xs text-gray-400 gap-2">
                {series.year && <span>{series.year}</span>}
                {series.rating && <span className="flex items-center"><Star className="h-3 w-3 text-yellow-500 mr-0.5" /> {series.rating}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (!credentials) {
    return (
      <div className="container mx-auto p-4 max-w-7xl h-dvh flex flex-col">
        <div className="flex items-center mb-4 gap-4 justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate("/")}
              variant="ghost"
              className="group hover:bg-primary/10 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="ml-2">Back</span>
            </Button>
            
            <h1 className="text-2xl font-bold">TV Series</h1>
          </div>
          
          <Button 
            onClick={() => navigate("/movies")}
            variant="ghost"
            className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-300"
          >
            <Film className="w-5 h-5" />
            <span>Movies</span>
          </Button>
        </div>
        
        <motion.div 
          className="flex flex-col items-center justify-center flex-1 p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
        >
          <p className="text-lg mb-4">No Xtream Codes credentials found</p>
          <p className="text-muted-foreground mb-6">
            Please load a playlist with Xtream Codes credentials to access series
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            Go to Playlist
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <AnimatePresence>
        {featuredSeries && (
          <motion.div 
            className="relative w-full h-[50vh] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            />
            
            {featuredSeries.backdrop ? (
              <motion.img 
                src={featuredSeries.backdrop} 
                alt={featuredSeries.name}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            ) : featuredSeries.logo ? (
              <div className="w-full h-full relative bg-gradient-to-br from-gray-900 to-black">
                <motion.img 
                  src={featuredSeries.logo} 
                  alt={featuredSeries.name}
                  className="absolute inset-0 m-auto max-w-[80%] max-h-[80%] object-contain"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <Tv className="h-32 w-32 text-white/10" />
              </div>
            )}
            
            <motion.div 
              className="absolute bottom-0 left-0 p-8 z-20 max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <motion.h2 
                className="text-4xl font-bold mb-3 text-white/90"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {featuredSeries.name}
              </motion.h2>
              
              <motion.div 
                className="flex flex-wrap gap-3 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                {featuredSeries.year && (
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-none">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {featuredSeries.year}
                  </Badge>
                )}
                {featuredSeries.rating && (
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-none">
                    <Star className="mr-1 h-3 w-3 text-yellow-400" />
                    {featuredSeries.rating}
                  </Badge>
                )}
                {featuredSeries.genre && (
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-none">
                    {featuredSeries.genre.split(',')[0]}
                  </Badge>
                )}
              </motion.div>
              
              {featuredSeries.description && (
                <motion.p 
                  className="text-white/70 mb-6 line-clamp-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  {featuredSeries.description}
                </motion.p>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg transition-all shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  onClick={() => {
                    setSelectedSeries(featuredSeries);
                    handleLoadSeasons(featuredSeries);
                  }}
                >
                  <Tv className="h-5 w-5 mr-2" />
                  View Details
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          <motion.div 
            className="w-64 border-r border-white/10 bg-black/60 backdrop-blur-md h-full flex-shrink-0 overflow-y-auto"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <div className="flex items-center p-4 border-b border-white/10">
                <Button 
                  onClick={() => navigate("/")}
                  variant="ghost"
                  size="icon"
                  className="mr-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold">TV Series</h2>
              </div>

              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search series..."
                    value={quickSearch}
                    onChange={handleQuickSearch}
                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/70 focus:ring-primary/40 text-white rounded-lg"
                  />
                </div>
                
                {isAdvancedSearch && (
                  <motion.div 
                    className="mb-4 p-2 bg-white/5 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">
                        {filteredSeries.length} results
                      </span>
                      <Button
                        onClick={clearAdvancedSearch}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white transition-colors h-auto py-1"
                      >
                        Clear
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {!isAdvancedSearch && isLoading ? (
                  <div className="space-y-3 mt-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full bg-white/5" />
                    ))}
                  </div>
                ) : !isAdvancedSearch && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-sm font-medium text-gray-400 mb-2">Categories</div>
                    <ul className="space-y-1">
                      {seriesCategories?.map((category, index) => (
                        <motion.li 
                          key={category.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + (index * 0.05) }}
                        >
                          <button
                            onClick={() => handleCategoryChange(category.id)}
                            className={cn(
                              "w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all",
                              "hover:bg-white/10",
                              activeCategory === category.id 
                                ? "bg-primary/20 text-primary font-medium" 
                                : "text-gray-400"
                            )}
                          >
                            <span className="truncate">{category.name}</span>
                            <ChevronRight className={cn(
                              "h-4 w-4 transform transition-transform",
                              activeCategory === category.id ? "text-primary rotate-90" : ""
                            )} />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6">
            {!isAdvancedSearch && !isLoading && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Recommended For You</h2>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    See all
                  </Button>
                </div>
                
                <Carousel className="w-full">
                  <CarouselContent className="-ml-4">
                    {getSuggestedSeries().map((series, index) => (
                      <CarouselItem key={series.id} className="pl-4 md:basis-1/4 lg:basis-1/5">
                        <motion.div 
                          className="cursor-pointer group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: { 
                              delay: 0.3 + (index * 0.05),
                              duration: 0.5
                            }
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                          onClick={() => {
                            setSelectedSeries(series);
                            handleLoadSeasons(series);
                          }}
                        >
                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300">
                            {series.logo ? (
                              <img 
                                src={series.logo} 
                                alt={series.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                                <Tv className="h-10 w-10 text-white/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                              <motion.div 
                                className="bg-primary text-white p-2 rounded-full"
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileHover={{ scale: 1 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Tv className="h-5 w-5" />
                              </motion.div>
                            </div>
                          </div>
                          <h3 className="font-medium text-sm truncate text-white">{series.name}</h3>
                          <div className="flex text-xs text-gray-400 gap-2">
                            {series.year && <span>{series.year}</span>}
                            {series.rating && <span className="flex items-center"><Star className="h-3 w-3 text-yellow-500 mr-0.5" /> {series.rating}</span>}
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 bg-black/70 text-white hover:bg-black/90 border-none" />
                  <CarouselNext className="right-2 bg-black/70 text-white hover:bg-black/90 border-none" />
                </Carousel>
              </motion.div>
            )}

            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold mb-4">
                {isAdvancedSearch 
                  ? "Search Results" 
                  : (activeCategory && seriesCategories 
                      ? seriesCategories.find(cat => cat.id === activeCategory)?.name || "All Series"
                      : "All Series"
                    )
                }
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex flex-col">
                      <Skeleton className="h-40 w-full bg-white/5 rounded-xl" />
                      <Skeleton className="h-5 w-3/4 mt-3 bg-white/5 rounded-md" />
                      <Skeleton className="h-4 w-1/2 mt-2 bg-white/5 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {isAdvancedSearch 
                    ? (filteredSeries.length > 0 
                        ? renderSeriesGrid(filteredSeries)
                        : <p className="text-gray-400 mt-4">No series match your search criteria</p>
                      )
                    : (activeCategory && seriesCategories 
                        ? renderSeriesGrid(seriesCategories
                            .find(cat => cat.id === activeCategory)
                            ?.series || [])
                        : <p className="text-gray-400 mt-4">Select a category to view series</p>
                      )
                  }
                </>
              )}
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {selectedSeries && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="bg-black/90 w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] border border-white/10"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                <div className="p-4 flex justify-between items-center border-b border-white/10">
                  <h2 className="text-xl font-bold">{selectedSeries.name}</h2>
                  <Button 
                    onClick={() => setSelectedSeries(null)}
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
                  <SeriesDetails 
                    series={selectedSeries}
                    onPlayEpisode={handlePlayEpisode}
                    onLoadSeasons={handleLoadSeasons}
                    isLoading={isLoading && !selectedSeries.seasons}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Series;
