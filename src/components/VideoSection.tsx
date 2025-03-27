
import React from "react";
import { useNavigate } from "react-router-dom";
import { Channel } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import EPGGuide from "@/components/EPGGuide";
import PlaylistInput from "@/components/PlaylistInput";
import { EPGProgram } from "@/lib/epgService";
import { Button } from "@/components/ui/button";

interface VideoSectionProps {
  selectedChannel: Channel | null;
  playlist: any;
  epgData: EPGProgram[] | null;
  isEpgLoading: boolean;
  onPlaylistLoaded: (playlist: any) => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({ 
  selectedChannel, 
  playlist, 
  epgData, 
  isEpgLoading, 
  onPlaylistLoaded 
}) => {
  const navigate = useNavigate();
  
  const openFullscreenPlayer = () => {
    if (selectedChannel) {
      navigate(`/player/${selectedChannel.id}`);
    }
  };
  
  return (
    <div className="lg:col-span-2 flex flex-col space-y-4">
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
      
      {!playlist && (
        <div className="flex-1">
          <PlaylistInput onPlaylistLoaded={onPlaylistLoaded} />
        </div>
      )}
    </div>
  );
};

export default VideoSection;
