
import React from "react";
import { Channel } from "@/lib/types";
import { EPGProgram } from "@/lib/epg";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import EPGGuide from "@/components/EPGGuide";

interface EPGPanelProps {
  channel: Channel;
  epgData: EPGProgram[] | null;
  isLoading: boolean;
  isVisible: boolean;
  isFullscreen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const EPGPanel: React.FC<EPGPanelProps> = ({
  channel,
  epgData,
  isLoading,
  isVisible,
  isFullscreen,
  isMobile,
  onClose
}) => {
  if (!isVisible) return null;
  
  return (
    <div className={`${isMobile ? 'h-1/2' : 'w-80'} bg-gray-900 ${isMobile ? 'border-t' : 'border-l'} border-gray-800 overflow-hidden transition-all duration-300 animate-slide-up ${isFullscreen ? 'z-50' : 'z-20'}`}>
      <ScrollArea className="h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Channel Info</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white">{channel.name}</h3>
            {channel.group && (
              <div className="text-sm text-gray-400 mt-1">{channel.group}</div>
            )}
            {channel.epg_channel_id && (
              <div className="text-xs text-gray-500 mt-1">EPG ID: {channel.epg_channel_id}</div>
            )}
          </div>

          {channel.logo && (
            <div className="flex justify-center p-2 bg-black/30 rounded-lg">
              <img 
                src={channel.logo} 
                alt={`${channel.name} logo`} 
                className="h-20 object-contain" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="pt-2 border-t border-gray-800">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Program Guide</h4>
            <EPGGuide 
              channel={channel} 
              epgData={epgData} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EPGPanel;
