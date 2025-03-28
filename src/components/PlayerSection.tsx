
import React from "react";
import { useNavigate } from "react-router-dom";
import { Channel } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import EPGGuide from "@/components/EPGGuide";
import { Button } from "@/components/ui/button";
import { EPGProgram } from "@/lib/epg";

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

  return (
    <div className="flex flex-col space-y-4">
      <div className="animate-fade-in">
        <VideoPlayer channel={selectedChannel} />
        
        {selectedChannel && (
          <div className="flex justify-end mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={openFullscreenPlayer}
              className="text-xs"
            >
              Open Fullscreen Player
            </Button>
          </div>
        )}
      </div>
      
      {selectedChannel && (
        <EPGGuide 
          channel={selectedChannel} 
          epgData={epgData} 
          isLoading={isEpgLoading} 
        />
      )}
    </div>
  );
};

export default PlayerSection;
