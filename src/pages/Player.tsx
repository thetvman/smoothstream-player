
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
  const [isShowingInfo, setIsShowingInfo] = useState(false);
  
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
      
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    resetControlsTimeout();
    
    const handleMouseMove = () => resetControlsTimeout();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseMove);
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseMove);
    };
  }, []);
  
  const handleShowInfo = () => {
    setShowControls(false);
    setIsShowingInfo(true);
    
    const timer = setTimeout(() => {
      setShowInfo(true);
      setTimeout(() => {
        setIsShowingInfo(false);
      }, 300);
    }, 300);
    
    return () => clearTimeout(timer);
  };
  
  const handleHideInfo = () => {
    setShowInfo(false);
    setIsShowingInfo(true);
    
    const timer = setTimeout(() => {
      setShowControls(true);
      setIsShowingInfo(false);
    }, 300);
    
    return () => clearTimeout(timer);
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
    navigate(`/player/${newChannel.id}`);
  };
  
  if (!channel) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black">
      <PlayerHeader 
        isVisible={showControls && !isShowingInfo}
        onInfoToggle={handleShowInfo}
      />
      
      <PlayerNavigation 
        isVisible={showControls && !showInfo && !isShowingInfo}
        onPrevious={() => navigateToChannel('prev')}
        onNext={() => navigateToChannel('next')}
      />
      
      <div className={`h-full flex ${isMobile ? 'flex-col' : ''}`}>
        <div className={`${isMobile ? 'h-1/2' : 'flex-1'} flex items-center justify-center p-0 z-10`}>
          <div className="w-full h-full mx-auto relative">
            <VideoPlayer channel={channel} autoPlay />
            
            <PlayerInfo 
              channel={channel}
              isVisible={(showControls || !isFullscreen) && !showInfo && !isShowingInfo}
              isFullscreen={isFullscreen}
            />
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
    </div>
  );
};

export default Player;
