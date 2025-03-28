
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
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent text-white flex items-center",
        isMobile ? "transition-opacity duration-300" : "",
        isMobile && !showControls ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="flex items-center gap-2 mr-4">
        <Button variant="ghost" size="icon" onClick={onPlayPause}>
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        {!isMobile && (
          <>
            <Button variant="ghost" size="icon" onClick={onMuteUnmute}>
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <div className="w-24 hidden sm:block">
              <Slider
                value={[muted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={onVolumeChange}
              />
            </div>
          </>
        )}
      </div>

      {isMobile ? (
        <div className="flex-1 text-xs">
          <span>{formatTime(currentTime)}</span>
        </div>
      ) : (
        <div className="flex-1 text-sm">
          <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>
      )}

      <div className={cn("mr-4", isMobile ? "w-24" : "w-48")}>
        <Slider
          value={[currentTime]}
          max={duration || 1}
          step={1}
          onValueChange={onSeek}
          onMouseDown={onSeekStart}
          onValueCommit={onSeekEnd}
        />
      </div>

      <Button variant="ghost" size="icon" onClick={onToggleFullscreen}>
        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default PlayerControls;
