
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";
import { Channel, Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { ArrowLeft, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import EPGGuide from "@/components/EPGGuide";
import EPGSettings from "@/components/EPGSettings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchEPGData, EPGProgram } from "@/lib/epg";
import { useIsMobile } from "@/hooks/use-mobile";

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
    
    return () => {
      const darkModePreference = localStorage.getItem("iptv-dark-mode") === "true";
      if (!darkModePreference) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);
  
  // Load EPG data when the info panel is opened for the first time
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
  
  // Auto-hide navigation controls after inactivity
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
    
    // Add mouse movement listener to show controls
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
    setShowInfo(true);
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
      <div className="absolute top-6 left-6 z-10">
        <button 
          className="bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors text-white"
          onClick={() => navigate("/")}
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <EPGSettings />
        
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white rounded-full"
          onClick={handleShowInfo}
          aria-label={showInfo ? "Hide info" : "Show info"}
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Channel navigation controls */}
      <div 
        className={`absolute left-0 top-1/2 right-0 -translate-y-1/2 flex justify-between px-4 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
          onClick={() => navigateToChannel('prev')}
          aria-label="Previous channel"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
          onClick={() => navigateToChannel('next')}
          aria-label="Next channel"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      
      <div className={`h-full flex ${isMobile ? 'flex-col' : ''}`}>
        <div className={`${isMobile ? 'h-1/2' : 'flex-1'} flex items-center justify-center p-4`}>
          <div className="w-full max-w-screen-2xl mx-auto relative">
            <VideoPlayer channel={channel} autoPlay />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <h1 className={`text-white font-bold mb-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{channel.name}</h1>
              {channel.group && (
                <div className="inline-block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white">
                  {channel.group}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showInfo && (
          <div className={`${isMobile ? 'h-1/2' : 'w-80'} bg-gray-900 ${isMobile ? 'border-t' : 'border-l'} border-gray-800 overflow-hidden transition-all duration-300 animate-slide-up`}>
            <ScrollArea className="h-full p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Channel Info</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowInfo(false)}
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
                    isLoading={isEpgLoading}
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
