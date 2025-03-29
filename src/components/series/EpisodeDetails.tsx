
import React from "react";
import { Episode, Series } from "@/lib/types";
import { Play, Clock, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EpisodeDetailsProps {
  episode: Episode | null;
  series: Series | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (episode: Episode, series: Series) => void;
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
    onPlay(episode, series);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">
            {episode.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>Season {episode.season_number}, Episode {episode.episode_number}</span>
            {episode.duration && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1 inline" />
                  {episode.duration} min
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4 pr-4">
          {episode.logo && (
            <div className="mb-4">
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
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {episode.description}
              </p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex items-center gap-2"
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
