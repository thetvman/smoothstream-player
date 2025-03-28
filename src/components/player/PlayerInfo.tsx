
import React from "react";
import { Clock } from "lucide-react";

interface PlayerInfoProps {
  channel: {
    name: string;
    logo?: string;
  };
  isVisible: boolean;
  isFullscreen?: boolean;
  stats?: {
    resolution?: string;
    frameRate?: number;
    audioBitrate?: string;
    audioChannels?: string;
  };
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({
  channel,
  isVisible,
  isFullscreen = false,
  stats
}) => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  
  return (
    <div 
      className={`absolute bottom-20 left-4 transition-opacity duration-300 z-20 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ 
        marginBottom: isFullscreen ? '16px' : '0'
      }}
    >
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white max-w-xs">
        <div className="flex items-center gap-3">
          {channel.logo && (
            <img 
              src={channel.logo} 
              alt={channel.name} 
              className="w-8 h-8 object-contain rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div>
            <h3 className="font-medium truncate">{channel.name}</h3>
            <div className="flex items-center text-xs text-gray-300 mt-1 gap-1">
              <Clock className="w-3 h-3" />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>
        
        {stats && (Object.values(stats).some(value => value !== undefined)) && (
          <div className="mt-2 pt-2 border-t border-white/20 text-xs text-gray-300 grid grid-cols-2 gap-x-4 gap-y-1">
            {stats.resolution && (
              <div className="flex justify-between">
                <span>Resolution:</span>
                <span className="font-mono">{stats.resolution}</span>
              </div>
            )}
            {stats.frameRate && (
              <div className="flex justify-between">
                <span>Frame rate:</span>
                <span className="font-mono">{stats.frameRate.toFixed(1)} fps</span>
              </div>
            )}
            {stats.audioBitrate && (
              <div className="flex justify-between">
                <span>Audio:</span>
                <span className="font-mono">{stats.audioBitrate}</span>
              </div>
            )}
            {stats.audioChannels && (
              <div className="flex justify-between">
                <span>Channels:</span>
                <span className="font-mono">{stats.audioChannels}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerInfo;
