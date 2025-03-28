
import React from "react";
import { Channel } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerInfoProps {
  channel: Channel;
  isVisible: boolean;
  isFullscreen: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ 
  channel, 
  isVisible,
  isFullscreen
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className={`text-white font-bold mb-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{channel.name}</h1>
      {channel.group && (
        <div className="inline-block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white">
          {channel.group}
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;
