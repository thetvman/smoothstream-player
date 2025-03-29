
import React from "react";
import { useNavigate } from "react-router-dom";
import { Channel, Playlist } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import PlayerHeader from "@/components/player/PlayerHeader";
import PlayerNavigation from "@/components/player/PlayerNavigation";
import PlayerInfo from "@/components/player/PlayerInfo";
import EPGPanel from "@/components/player/EPGPanel";
import ChannelPreloader from "@/components/player/ChannelPreloader";
import EPGModal from "@/components/player/EPGModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

interface PlayerViewProps {
  channel: Channel;
  showInfo: boolean;
  showControls: boolean;
  epgData: any[] | null;
  isEpgLoading: boolean;
  handleShowInfo: () => void;
  handleHideInfo: () => void;
  navigateToChannel: (direction: 'next' | 'prev') => void;
  playlist: Playlist | null;
  showGuide: boolean;
  setShowGuide: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
}

const PlayerView: React.FC<PlayerViewProps> = ({
  channel,
  showInfo,
  showControls,
  epgData,
  isEpgLoading,
  handleShowInfo,
  handleHideInfo,
  navigateToChannel,
  playlist,
  showGuide,
  setShowGuide,
  isFullscreen
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black">
      <PlayerHeader 
        isVisible={showControls}
        onInfoToggle={handleShowInfo}
        showInfo={showInfo}
      />
      
      <PlayerNavigation 
        isVisible={showControls}
        onPrevious={() => navigateToChannel('prev')}
        onNext={() => navigateToChannel('next')}
        showInfo={showInfo}
      />
      
      <div className={`h-full flex ${isMobile ? 'flex-col' : ''}`}>
        <div className={`${isMobile ? 'h-1/2' : 'flex-1'} flex items-center justify-center p-0 z-10`}>
          <div className="w-full h-full mx-auto relative">
            <VideoPlayer channel={channel} autoPlay />
            
            <PlayerInfo 
              channel={channel}
              isVisible={showControls && !showInfo}
              isFullscreen={isFullscreen}
            />
            
            {showControls && !showInfo && (
              <div className="absolute bottom-20 right-6 z-20">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/70 hover:bg-black/90 text-white"
                  onClick={() => setShowGuide(true)}
                >
                  <ListFilter className="h-4 w-4 mr-2" />
                  TV Guide
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <EPGPanel 
          channel={channel}
          epgData={epgData}
          isLoading={isEpgLoading}
          isVisible={showInfo}
          isFullscreen={isFullscreen}
          isMobile={isMobile}
          onClose={handleHideInfo}
        />
      </div>
      
      <EPGModal
        open={showGuide}
        onOpenChange={setShowGuide}
        channels={playlist?.channels || []}
        currentChannel={channel}
        onSelectChannel={(selectedChannel) => {
          if (selectedChannel.id !== channel.id) {
            navigate(`/player/${selectedChannel.id}`, { replace: true });
          }
        }}
      />
      
      {playlist && channel && (
        <ChannelPreloader 
          currentChannel={channel} 
          playlist={playlist} 
        />
      )}
    </div>
  );
};

export default PlayerView;
