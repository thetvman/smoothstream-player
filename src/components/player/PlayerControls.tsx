
import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-hide controls after inactivity when playing
  useEffect(() => {
    if (isMobile && playing) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isMobile, playing]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white flex flex-col gap-2 z-20",
        isMobile ? "transition-opacity duration-300" : "",
        isMobile && !showControls ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{ 
        marginBottom: isFullscreen ? '16px' : '0', // Add padding in fullscreen mode
        paddingBottom: isFullscreen ? '8px' : '4px'
      }}
    >
      {/* Progress slider */}
      <div className="w-full px-2">
        <Slider
          value={[currentTime]}
          max={duration || 1}
          step={1}
          onValueChange={onSeek}
          onMouseDown={onSeekStart}
          onValueCommit={onSeekEnd}
          className={cn(isFullscreen ? "h-2" : "h-1.5")} // Slightly larger in fullscreen
        />
      </div>
      
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPlayPause} className={isFullscreen ? "h-10 w-10" : ""}>
            {playing ? <Pause className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} /> : <Play className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} />}
          </Button>

          {!isMobile && (
            <>
              <Button variant="ghost" size="icon" onClick={onMuteUnmute} className={isFullscreen ? "h-10 w-10" : ""}>
                {muted ? <VolumeX className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} /> : <Volume2 className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} />}
              </Button>

              <div className={cn("hidden sm:block", isFullscreen ? "w-32" : "w-24")}>
                <Slider
                  value={[muted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={onVolumeChange}
                />
              </div>
            </>
          )}
          
          <div className={cn("text-sm", isFullscreen && "text-base ml-2")}>
            <span>{formatTime(currentTime)}</span> 
            {!isMobile && <span> / {formatTime(duration)}</span>}
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleFullscreen}
          className={isFullscreen ? "h-10 w-10" : ""}
        >
          {isFullscreen ? 
            <Minimize2 className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} /> : 
            <Maximize2 className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} />
          }
        </Button>
      </div>
    </div>
  );
};

export default PlayerControls;
