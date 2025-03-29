
import React from "react";
import { Season, Series } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, ChevronDown, ChevronUp, Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SeasonsListProps {
  seasons: Season[];
  onPlayEpisode: (episode: any, series: Series) => void;
  series: Series;
  expandedSeason: string | null;
  onSeasonClick: (seasonId: string) => void;
}

const SeasonsList: React.FC<SeasonsListProps> = ({
  seasons,
  onPlayEpisode,
  series,
  expandedSeason,
  onSeasonClick
}) => {
  if (!seasons || seasons.length === 0) {
    return <p className="text-center py-8 text-white/50">No episodes available for this series</p>;
  }

  return (
    <div className="space-y-3">
      {seasons.map((season, seasonIndex) => (
        <motion.div 
          key={season.id} 
          className="border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-colors duration-300"
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
            onClick={() => onSeasonClick(season.id)}
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
                className="border-t border-white/10 bg-black/30 max-h-[300px] overflow-y-auto"
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
    </div>
  );
};

export default SeasonsList;
