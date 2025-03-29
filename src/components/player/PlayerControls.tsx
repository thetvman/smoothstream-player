
import React, { useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlayerTheme } from "@/lib/playerThemeStore";
import { useAutoHideUI } from "@/hooks/useAutoHideUI";
import { formatPlayerTime } from "@/lib/playerUtils";

interface PlayerControlsProps {
  playing: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onMuteUnmute: () => void;
  onVolumeChange: (value: number[]) => void;
  onSeek: (value: number[]) => void;
  onSeekStart: () => void;
  onSeekEnd: (value: number[]) => void;
  onToggleFullscreen: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  playing,
  muted,
  volume,
  currentTime,
  duration,
  isFullscreen,
  onPlayPause,
  onMuteUnmute,
  onVolumeChange,
  onSeek,
  onSeekStart,
  onSeekEnd,
  onToggleFullscreen
}) => {
  const isMobile = useIsMobile();
  const { theme } = usePlayerTheme();
  
  // Use our auto-hide UI hook
  const { isVisible: showControls, updateVisibilityOnPlayState } = useAutoHideUI({
    initialVisibility: true,
    hideDelay: 3000, // Hide controls after 3 seconds of inactivity
    showOnPlay: true
  });
  
  // Update visibility when playing state changes
  useEffect(() => {
    updateVisibilityOnPlayState(playing);
  }, [playing, updateVisibilityOnPlayState]);

  // Apply theme styles
  const controlsStyle = {
    backgroundColor: 'var(--player-theme-control-bg, rgba(0, 0, 0, 0.7))',
    color: 'var(--player-theme-fg, white)',
  };

  const sliderTrackClass = "bg-primary/30";
  const sliderThumbClass = "bg-primary border-2 border-white";

  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white flex flex-col gap-2 z-20",
        "transition-opacity duration-300",
        !showControls ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{ 
        ...controlsStyle,
        marginBottom: isFullscreen ? '16px' : '0',
        paddingBottom: isFullscreen ? '8px' : '4px',
        backgroundImage: 'linear-gradient(to top, var(--player-theme-control-bg, rgba(0, 0, 0, 0.7)), transparent)'
      }}
    >
      {/* Progress slider */}
      <div className="w-full px-2">
        <Slider
          value={[currentTime]}
          max={duration || 1}
          step={0.1}
          onValueChange={onSeek}
          onMouseDown={onSeekStart}
          onValueCommit={onSeekEnd}
          className={cn(isFullscreen ? "h-2" : "h-1.5")}
          trackClassName={sliderTrackClass}
          thumbClassName={sliderThumbClass}
        />
      </div>
      
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPlayPause} 
            className={cn(
              isFullscreen ? "h-10 w-10" : "",
              "hover:bg-primary/20 text-white rounded-full"
            )}
          >
            {playing ? <Pause className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} /> : <Play className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} />}
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMuteUnmute} 
              className={cn(
                isFullscreen ? "h-10 w-10" : "",
                "hover:bg-primary/20 text-white rounded-full"
              )}
            >
              {muted ? <VolumeX className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} /> : <Volume2 className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} />}
            </Button>

            <div className={cn("hidden sm:block", isFullscreen ? "w-32" : "w-24")}>
              <Slider
                value={[muted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={onVolumeChange}
                trackClassName={sliderTrackClass}
                thumbClassName={sliderThumbClass}
              />
            </div>
          </div>
          
          <div className={cn("text-sm", isFullscreen && "text-base ml-2")}>
            <span>{formatPlayerTime(currentTime)}</span> 
            <span className="text-white/70"> / {formatPlayerTime(duration)}</span>
          </div>
        </div>

        {/* Fullscreen Button */}
        <Button 
          variant={isFullscreen ? "secondary" : "outline"}
          size="sm" 
          onClick={onToggleFullscreen}
          className={cn(
            "hover:bg-primary/20 text-white rounded-md flex items-center gap-1",
            isFullscreen ? "bg-primary/30" : "bg-black/50 border-white/20"
          )}
        >
          {isFullscreen ? (
            <>
              <Minimize className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </>
          ) : (
            <>
              <Maximize className="h-4 w-4" />
              <span className="hidden sm:inline">Fullscreen</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PlayerControls;
