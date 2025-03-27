
import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { PlayerState } from "@/lib/types";

interface PlayerControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  playerState: PlayerState;
  onPlayPause: () => void;
  onMute: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  videoRef,
  playerState,
  onPlayPause,
  onMute,
  onVolumeChange,
  onSeek,
  onFullscreen
}) => {
  const { playing, currentTime, duration, volume, muted, loading, fullscreen } = playerState;
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Hide controls after inactivity
  const [controlsVisible, setControlsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setControlsVisible(true);
      
      if (playing) {
        timeoutRef.current = setTimeout(() => {
          setControlsVisible(false);
        }, 3000);
      }
    };

    resetTimeout();

    // Clean up timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [playing, controlsVisible]);

  // Handle progress bar clicking
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      onSeek(percent * duration);
    }
  };

  return (
    <div 
      className={`player-controls absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseMove={() => setControlsVisible(true)}
    >
      <div className="flex flex-col gap-4">
        {/* Progress bar */}
        <div 
          ref={progressRef}
          className="player-progress"
          onClick={handleProgressClick}
        >
          <div 
            className="player-progress-fill" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="player-progress-handle" 
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      
        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause button */}
            <button 
              className="btn-icon" 
              onClick={onPlayPause}
              aria-label={playing ? "Pause" : "Play"}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            
            {/* Volume control */}
            <div className="relative flex items-center">
              <button 
                className="btn-icon"
                onClick={onMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              {/* Volume slider */}
              <div 
                className={`absolute left-10 w-24 h-10 flex items-center transition-all duration-200 ${showVolumeSlider ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={muted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to right, white ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 0%)`,
                  }}
                />
              </div>
            </div>
            
            {/* Time display */}
            <div className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Fullscreen button */}
            <button 
              className="btn-icon" 
              onClick={onFullscreen}
              aria-label={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {fullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
