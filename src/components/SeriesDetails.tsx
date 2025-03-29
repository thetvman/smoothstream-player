
import React, { useState } from "react";
import { Series, Season, Episode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Star, Tv, ChevronDown, ChevronUp, Play, Clock, Film, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
      <div className="space-y-6 p-6">
        <Skeleton className="h-56 w-full rounded-xl bg-white/5" />
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-6 w-24 bg-white/5 rounded-md" />
          <Skeleton className="h-6 w-24 bg-white/5 rounded-md" />
        </div>
        <Skeleton className="h-32 w-full bg-white/5 rounded-lg" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
          <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
          <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Tv className="h-16 w-16 text-white/20 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Series Selected</h3>
        <p className="text-gray-400">
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
    <div className="p-6 h-full flex flex-col">
      <div className="relative mb-6 rounded-xl overflow-hidden h-64 bg-gradient-to-br from-gray-900 to-black shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <Tv className="h-16 w-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end">
          <div className="p-4 text-white">
            <h2 className="text-2xl font-bold mb-2">{series.name}</h2>
            
            <div className="flex flex-wrap gap-2">
              {series.year && (
                <Badge className="bg-white/10 backdrop-blur-md border-none text-white">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {series.year}
                </Badge>
              )}
              {series.rating && (
                <Badge className="bg-white/10 backdrop-blur-md border-none text-white">
                  <Star className="mr-1 h-3 w-3 text-yellow-400" />
                  {series.rating}
                </Badge>
              )}
              {series.group && (
                <Badge className="bg-white/10 backdrop-blur-md border-none text-white">
                  {series.group}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {series.genre && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium mb-2 text-white/70">Genre</h3>
          <div className="flex flex-wrap gap-2">
            {series.genre.split(',').map((genre, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-primary/10 hover:bg-primary/20 text-primary border-none"
              >
                {genre.trim()}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {series.description && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium mb-2 text-white/70">Description</h3>
          <p className="text-white/70">{series.description}</p>
        </motion.div>
      )}

      <div className="mt-4 flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Episodes</h3>
            {series.seasons && series.seasons.length > 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {series.seasons.length} Seasons
              </Badge>
            )}
          </div>
          
          {!series.seasons ? (
            <div className="flex justify-center my-6">
              <Button 
                onClick={handleLoadSeasons}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-5 gap-2 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300"
              >
                <Info className="h-5 w-5" />
                Load Seasons & Episodes
              </Button>
            </div>
          ) : series.seasons.length === 0 ? (
            <p className="text-center py-8 text-white/50">No episodes available for this series</p>
          ) : (
            <ScrollArea className="h-[calc(100%-3rem)] pr-4">
              <AnimatePresence>
                {series.seasons.map((season, seasonIndex) => (
                  <motion.div 
                    key={season.id} 
                    className="mb-3 border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-colors duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        delay: 0.3 + (seasonIndex * 0.05),
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }}
                  >
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => handleSeasonClick(season.id)}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3">
                          <Tv className="h-4 w-4" />
                        </div>
                        <h4 className="font-medium text-white">{season.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {season.episodes && (
                          <Badge variant="outline" className="bg-black/30 text-white/70 border-white/10">
                            {season.episodes.length} Episodes
                          </Badge>
                        )}
                        {expandedSeason === season.id ? 
                          <ChevronUp className="h-5 w-5 text-white/70" /> : 
                          <ChevronDown className="h-5 w-5 text-white/70" />
                        }
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedSeason === season.id && season.episodes && (
                        <motion.div 
                          className="border-t border-white/10 bg-black/30"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {season.episodes.map((episode, episodeIndex) => (
                            <motion.div 
                              key={episode.id}
                              className="flex items-center p-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-b-0"
                              onClick={() => onPlayEpisode(episode, series)}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ 
                                opacity: 1, 
                                x: 0,
                                transition: { 
                                  delay: 0.1 + (episodeIndex * 0.03),
                                  duration: 0.3
                                }
                              }}
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0">
                                <Play className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-white truncate">
                                    {episode.episode_number}. {episode.name}
                                  </div>
                                  <div className="flex items-center text-white/60 ml-2 text-sm flex-shrink-0">
                                    {episode.duration && (
                                      <div className="flex items-center">
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        {episode.duration} min
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {episode.description && (
                                  <p className="text-xs text-white/50 truncate mt-1">{episode.description}</p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SeriesDetails;
