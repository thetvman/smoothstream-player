
import React from "react";
import { Episode } from "@/lib/types";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";

interface EpisodeItemProps {
  episode: Episode;
  episodeIndex: number;
  onEpisodeClick: (episode: Episode) => void;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({ 
  episode, 
  episodeIndex, 
  onEpisodeClick 
}) => {
  // Function to truncate description to 10 words
  const truncateDescription = (text: string, wordLimit: number = 10) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  // Function to truncate title if it's too long
  const truncateTitle = (title: string, charLimit: number = 35) => {
    if (!title) return "";
    return title.length > charLimit ? title.substring(0, charLimit) + "..." : title;
  };

  return (
    <motion.div 
      className="flex items-center p-3 hover:bg-white/5 transition-colors cursor-pointer"
      onClick={() => onEpisodeClick(episode)}
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
            {episode.episode_number}. {truncateTitle(episode.name)}
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
          <p className="text-xs text-white/50 truncate mt-1">{truncateDescription(episode.description)}</p>
        )}
      </div>
    </motion.div>
  );
};

export default EpisodeItem;
