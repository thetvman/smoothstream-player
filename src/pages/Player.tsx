
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";
import { Channel, Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { ArrowLeft, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import EPGGuide from "@/components/EPGGuide";
import EPGSettings from "@/components/EPGSettings";
import EPGLoadingProgress from "@/components/EPGLoadingProgress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchEPGData, EPGProgram, getEPGLoadingProgress } from "@/lib/epgService";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [epgData, setEpgData] = useState<EPGProgram[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  const { toast } = useToast();
  const [epgProgress, setEpgProgress] = useState(getEPGLoadingProgress());
  
  // Periodically update EPG progress information
  useEffect(() => {
    if (epgProgress.isLoading) {
      const interval = setInterval(() => {
        setEpgProgress(getEPGLoadingProgress());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [epgProgress.isLoading]);
  
  // Load channel from localStorage
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist && channelId) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      if (parsedPlaylist) {
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

  // Always use dark mode in player, regardless of main site preference
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Clean up when component unmounts - restore user preference
    return () => {
      const darkModePreference = localStorage.getItem("iptv-dark-mode") === "true";
      if (!darkModePreference) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);
  
  // Fetch EPG data when channel changes
  useEffect(() => {
    const loadEpgData = async () => {
      if (!channel || !channel.epg_channel_id) {
        setEpgData(null);
        return;
      }
      
      setIsEpgLoading(true);
      try {
        const data = await fetchEPGData(channel);
        if (data) {
          console.log(`Loaded ${data.length} EPG programs for ${channel.name}`);
        }
        setEpgData(data);
      } catch (error) {
        console.error("Error fetching EPG data:", error);
        setEpgData(null);
      } finally {
        setIsEpgLoading(false);
      }
    };
    
    loadEpgData();
  }, [channel]);
  
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
          onClick={() => setShowInfo(!showInfo)}
          aria-label={showInfo ? "Hide info" : "Show info"}
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="h-full flex">
        {/* Main video area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-screen-2xl mx-auto relative">
            {epgProgress.isLoading && (
              <div className="absolute top-0 left-0 right-0 z-10 p-4">
                <EPGLoadingProgress 
                  isLoading={epgProgress.isLoading}
                  progress={epgProgress.progress}
                  total={epgProgress.total}
                  processed={epgProgress.processed}
                  message={epgProgress.message}
                />
              </div>
            )}
            
            <VideoPlayer channel={channel} autoPlay />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <h1 className="text-white text-2xl font-bold mb-2">{channel.name}</h1>
              {channel.group && (
                <div className="inline-block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white">
                  {channel.group}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Info sidebar - conditionally shown */}
        {showInfo && (
          <div className="w-80 bg-gray-900 border-l border-gray-800 overflow-hidden transition-all duration-300 animate-slide-up">
            <ScrollArea className="h-screen p-4">
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
