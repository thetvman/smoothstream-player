
import React from "react";
import { Channel } from "@/lib/types";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TVChannelCardProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  compactMode?: boolean;
}

const TVChannelCard: React.FC<TVChannelCardProps> = ({
  channel,
  isActive,
  onClick,
  compactMode = false
}) => {
  if (compactMode) {
    return (
      <div 
        className={cn(
          "tv-channel-card p-2 cursor-pointer mb-2",
          isActive && "tv-channel-active"
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-center">
          {channel.logo ? (
            <img 
              src={channel.logo} 
              alt={channel.name}
              className="h-10 w-10 object-contain bg-black/30 rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-10 w-10 flex items-center justify-center rounded-md bg-black/30">
              <span className="text-xs font-medium truncate">{channel.name.substring(0, 2)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "tv-channel-card h-full cursor-pointer group",
        isActive && "tv-channel-active"
      )}
      onClick={onClick}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="tv-logo-container mb-3 mx-auto">
          {channel.logo ? (
            <img 
              src={channel.logo} 
              alt={channel.name}
              className="h-12 w-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <span className="text-lg font-medium">{channel.name.substring(0, 2)}</span>
            </div>
          )}
        </div>
        
        <div className="text-center mb-2">
          <h3 className="font-medium text-sm truncate">{channel.name}</h3>
          {channel.group && (
            <p className="text-xs text-white/70 truncate">{channel.group}</p>
          )}
        </div>
        
        <div className="mt-auto flex items-center justify-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center bg-white/10 transition-all duration-300",
            isActive ? "bg-green-500/80" : "opacity-0 group-hover:opacity-100"
          )}>
            <PlayCircle className={cn(
              "w-5 h-5",
              isActive && "fill-white text-white" 
            )} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVChannelCard;
