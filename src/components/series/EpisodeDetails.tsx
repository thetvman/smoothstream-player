
import React from "react";
import { Episode, Series } from "@/lib/types";
import { Play, Clock, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EpisodeDetailsProps {
  episode: Episode | null;
  series: Series | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (episode: Episode) => void;
}

const EpisodeDetails: React.FC<EpisodeDetailsProps> = ({
  episode,
  series,
  isOpen,
  onClose,
  onPlay
}) => {
  if (!episode || !series) return null;

  const handlePlay = () => {
    onPlay(episode);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] flex flex-col bg-black/90 border-white/10 text-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {episode.name}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300">
              Season {episode.season_number}
            </div>
            <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300">
              Episode {episode.episode_number}
            </div>
            {episode.duration && (
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {episode.duration} min
              </div>
            )}
            {episode.added && (
              <div className="flex items-center text-xs text-gray-400">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {episode.added}
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-grow mt-4 overflow-y-auto">
          <div className="pr-4">
            {episode.logo && (
              <div className="mb-6">
                <img 
                  src={episode.logo} 
                  alt={episode.name} 
                  className="w-full h-auto object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {episode.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2 text-white/70">Description</h3>
                <div className="text-sm text-white/70 overflow-visible">
                  <p className="whitespace-normal break-words leading-relaxed">
                    {episode.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6 pt-4 border-t border-white/10">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            onClick={handlePlay}
          >
            <Play className="h-4 w-4" />
            Play Episode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EpisodeDetails;
