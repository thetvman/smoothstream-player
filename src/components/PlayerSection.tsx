
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
      <div className="aspect-video flex flex-col items-center justify-center bg-card/50 text-muted-foreground p-4 rounded-lg shadow-lg transform transition-all hover:shadow-xl">
        <div className="text-center space-y-2">
          <h3 className="font-medium">No Channel Selected</h3>
          <p className="text-sm">Select a channel from the list to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col transform transition-all duration-300 hover:translate-z-6 rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="relative rounded-t-lg overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
        <VideoPlayer channel={selectedChannel} />
        
        <Button
          variant="default"
          size="lg"
          onClick={openFullscreenPlayer}
          className="absolute top-4 right-4 text-sm bg-primary hover:bg-primary/90 shadow-md transform transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          Fullscreen
        </Button>
      </div>
      
      {selectedChannel && (
        <div className="p-3 bg-gradient-to-b from-background/95 to-background rounded-b-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
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
