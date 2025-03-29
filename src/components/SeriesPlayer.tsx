
import React, { useRef, useState } from "react";
import type { Episode, Series } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";
import { Button } from "@/components/ui/button";
import { toggleFullscreen } from "@/lib/playerUtils";
import { useEpisodeNavigation } from "@/hooks/useEpisodeNavigation";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAutoHideUI } from "@/hooks/useAutoHideUI";
import EpisodeNavigation from "./player/EpisodeNavigation";
import EpisodeInfo from "./player/EpisodeInfo";

interface SeriesPlayerProps {
  episode: Episode | null;
  series: Series | null;
  autoPlay?: boolean;
  onEpisodeEnded?: () => void;
  onEpisodeChange?: (episodeId: string) => void;
}

const SeriesPlayer: React.FC<SeriesPlayerProps> = ({ 
  episode,
  series,
  autoPlay = true,
  onEpisodeEnded,
  onEpisodeChange
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Use our custom hooks
  const { prevEpisodeId, nextEpisodeId } = useEpisodeNavigation(episode, series);
  const { handleVideoEnded, handlePlaybackChange } = useWatchHistory(episode, series, isPlaying);
  const { isVisible: showInfo, toggle: toggleInfo, hide: hideInfo } = useAutoHideUI({ hideDelay: 5000 });
  
  // Handle fullscreen
  const handleToggleFullscreen = async () => {
    if (playerContainerRef.current) {
      const fullscreenState = await toggleFullscreen(playerContainerRef.current);
      setIsFullscreen(fullscreenState);
    }
  };

  const navigateToEpisode = (episodeId: string | null) => {
    if (!episodeId) return;
    
    // Use the callback if provided (for in-page navigation)
    if (onEpisodeChange) {
      onEpisodeChange(episodeId);
    }
  };

  // Handle video ended event
  const handleEnded = () => {
    handleVideoEnded();
    if (onEpisodeEnded) {
      onEpisodeEnded();
    }
  };

  // Convert episode to channel format for VideoPlayer
  const channel = episode ? {
    id: episode.id,
    name: `${series?.name || ''} - ${episode.name}`,
    url: episode.url,
    logo: episode.logo,
    group: series?.group
  } : null;

  return (
    <div 
      ref={playerContainerRef}
      className={`${isFullscreen ? 'fixed inset-0 bg-black z-50' : 'w-full max-w-full mx-auto flex flex-col gap-6'}`}
    >
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video w-full group h-full">
        {channel && (
          <VideoPlayer 
            channel={channel} 
            autoPlay={autoPlay} 
            onEnded={handleEnded}
            onPlaybackChange={(isPlaying) => {
              setIsPlaying(isPlaying);
              handlePlaybackChange(isPlaying);
            }}
          />
        )}
        
        {/* Episode navigation controls */}
        <EpisodeNavigation 
          prevEpisodeId={prevEpisodeId}
          nextEpisodeId={nextEpisodeId}
          onNavigate={navigateToEpisode}
        />
        
        {/* Fullscreen and info buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleToggleFullscreen}
            className="bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-md text-sm transition-colors"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
          
          <Button 
            variant="ghost"
            size="sm"
            onClick={toggleInfo}
            className="bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-md text-sm transition-colors"
          >
            Show Info
          </Button>
        </div>
      </div>
      
      {/* Episode information panel */}
      {series && episode && (
        <EpisodeInfo
          episode={episode}
          series={series}
          isFullscreen={isFullscreen}
          showInfo={showInfo}
          prevEpisodeId={prevEpisodeId}
          nextEpisodeId={nextEpisodeId}
          onNavigate={navigateToEpisode}
          onHideInfo={hideInfo}
        />
      )}
    </div>
  );
};

export default SeriesPlayer;
