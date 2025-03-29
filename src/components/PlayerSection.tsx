
import React from "react";
import { useNavigate } from "react-router-dom";
import { Channel } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import EPGGuide from "@/components/EPGGuide";
import { Button } from "@/components/ui/button";
import { EPGProgram } from "@/lib/epg";
import { Maximize2 } from "lucide-react";

interface PlayerSectionProps {
  selectedChannel: Channel | null;
  epgData: EPGProgram[] | null;
  isEpgLoading: boolean;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({
  selectedChannel,
  epgData,
  isEpgLoading
}) => {
  const navigate = useNavigate();

  const openFullscreenPlayer = () => {
    if (selectedChannel) {
      navigate(`/player/${selectedChannel.id}`);
    }
  };

  if (!selectedChannel) {
    return (
      <div className="aspect-video flex flex-col items-center justify-center bg-card/50 text-muted-foreground p-4">
        <div className="text-center space-y-2">
          <h3 className="font-medium">No Channel Selected</h3>
          <p className="text-sm">Select a channel from the list to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="relative">
        <VideoPlayer channel={selectedChannel} />
        
        <Button
          variant="secondary"
          size="sm"
          onClick={openFullscreenPlayer}
          className="absolute bottom-4 right-4 text-xs bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <Maximize2 className="h-3.5 w-3.5 mr-1" />
          Fullscreen
        </Button>
      </div>
      
      {selectedChannel && (
        <div className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium">{selectedChannel.name}</h3>
              {selectedChannel.group && (
                <p className="text-xs text-muted-foreground">{selectedChannel.group}</p>
              )}
            </div>
          </div>
          
          <EPGGuide 
            channel={selectedChannel} 
            epgData={epgData} 
            isLoading={isEpgLoading} 
          />
        </div>
      )}
    </div>
  );
};

export default PlayerSection;
