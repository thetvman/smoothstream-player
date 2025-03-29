import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";
import { Channel, Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { fetchEPGData, EPGProgram } from "@/lib/epg";
import { useIsMobile } from "@/hooks/use-mobile";
import PlayerHeader from "@/components/player/PlayerHeader";
import PlayerNavigation from "@/components/player/PlayerNavigation";
import PlayerInfo from "@/components/player/PlayerInfo";
import EPGPanel from "@/components/player/EPGPanel";
import ChannelPreloader from "@/components/player/ChannelPreloader";
import EPGModal from "@/components/player/EPGModal";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [epgData, setEpgData] = useState<EPGProgram[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  const [epgLoaded, setEpgLoaded] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showControls, setShowControls] = useState(true);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist && channelId) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      if (parsedPlaylist) {
        setPlaylist(parsedPlaylist);
        const foundChannel = parsedPlaylist.channels.find(c => c.id === channelId) || null;
        setChannel(foundChannel);
        
        if (!foundChannel) {
          toast({
            title: "Channel not found",
            description: "The requested channel could not be found",
            variant: "destructive"
          });
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [channelId, navigate, toast]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', checkFullscreen);
    
    return () => {
      const darkModePreference = localStorage.getItem("iptv-dark-mode") === "true";
      if (!darkModePreference) {
        document.documentElement.classList.remove('dark');
      }
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, []);
  
  useEffect(() => {
    const loadEpgData = async () => {
      if (!channel || !channel.epg_channel_id || epgLoaded) {
        return;
      }
      
      setIsEpgLoading(true);
      try {
        const data = await fetchEPGData(channel);
        
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} EPG programs for ${channel.name}`);
          setEpgData(data);
        } else {
          console.log(`No EPG data found for ${channel.name}`);
          setEpgData(null);
        }
        setEpgLoaded(true);
      } catch (error) {
        console.error(`Error fetching EPG data for ${channel.name}:`, error);
        setEpgData(null);
      } finally {
        setIsEpgLoading(false);
      }
    };
    
    if (showInfo && !epgLoaded) {
      loadEpgData();
    }
  }, [channel, showInfo, epgLoaded]);
  
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (!showInfo) {
        setShowControls(true);
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };
    
    if (!showInfo) {
      resetControlsTimeout();
    }
    
    const handleMouseMove = () => !showInfo && resetControlsTimeout();
    const handleClick = () => !showInfo && resetControlsTimeout();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [showInfo]);
  
  const handleShowInfo = () => {
    setShowControls(false);
    setShowInfo(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  };
  
  const handleHideInfo = () => {
    setShowInfo(false);
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };
  
  const navigateToChannel = (direction: 'next' | 'prev') => {
    if (!playlist || !channel) return;
    
    const currentIndex = playlist.channels.findIndex(c => c.id === channel.id);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % playlist.channels.length;
    } else {
      newIndex = (currentIndex - 1 + playlist.channels.length) % playlist.channels.length;
    }
    
    const newChannel = playlist.channels[newIndex];
    
    // Optimize channel switching
    setIsEpgLoading(true);
    setEpgData(null);
    setEpgLoaded(false);
    
    // Pre-set the channel immediately to avoid delay
    setChannel(newChannel);
    
    // Update URL asynchronously
    navigate(`/player/${newChannel.id}`, { replace: true });
  };
  
  if (!channel) {
    return null;
  }
  
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

export default Player;
