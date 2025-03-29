
import React from "react";
import { Season, Episode } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import EpisodeItem from "./EpisodeItem";

interface SeasonItemProps {
  season: Season;
  isExpanded: boolean;
  onSeasonClick: (seasonId: string) => void;
  onEpisodeClick: (episode: Episode) => void;
  seasonIndex: number;
}

const SeasonItem: React.FC<SeasonItemProps> = ({
  season,
  isExpanded,
  onSeasonClick,
  onEpisodeClick,
  seasonIndex,
}) => {
  return (
    <motion.div 
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
          {isExpanded ? 
            <ChevronUp className="h-5 w-5 text-white/70" /> : 
            <ChevronDown className="h-5 w-5 text-white/70" />
          }
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && season.episodes && (
          <motion.div 
            className="border-t border-white/10 bg-black/30"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScrollArea className="max-h-[400px]">
              <div className="divide-y divide-white/5">
                {season.episodes.map((episode, episodeIndex) => (
                  <EpisodeItem 
                    key={episode.id}
                    episode={episode}
                    episodeIndex={episodeIndex}
                    onEpisodeClick={onEpisodeClick}
                  />
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SeasonItem;
