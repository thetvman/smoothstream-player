
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EpisodeNavigationProps {
  prevEpisodeId: string | null;
  nextEpisodeId: string | null;
  onNavigate: (episodeId: string) => void;
  showTooltips?: boolean;
}

const EpisodeNavigation: React.FC<EpisodeNavigationProps> = ({
  prevEpisodeId,
  nextEpisodeId,
  onNavigate,
  showTooltips = true
}) => {
  if (!prevEpisodeId && !nextEpisodeId) return null;
  
  const renderButton = (episodeId: string | null, direction: 'prev' | 'next') => {
    if (!episodeId) return null;
    
    const content = (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate(episodeId)}
        className="h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        {direction === 'prev' ? (
          <ChevronLeft className="h-6 w-6" />
        ) : (
          <ChevronRight className="h-6 w-6" />
        )}
      </Button>
    );
    
    if (showTooltips) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{direction === 'prev' ? 'Previous Episode' : 'Next Episode'}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return content;
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {renderButton(prevEpisodeId, 'prev')}
      {renderButton(nextEpisodeId, 'next')}
    </div>
  );
};

export default EpisodeNavigation;
