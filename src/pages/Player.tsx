
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";
import EPGGuide from "@/components/EPGGuide";
import { Channel, Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { ArrowLeft, Grid, Info, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEPGData } from "@/lib/epgService";
import { toast } from "@/hooks/use-toast";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(true);
  const [epgData, setEpgData] = useState<any[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  
  // Auto-hide channel info after 5 seconds
  useEffect(() => {
    if (showChannelInfo) {
      const timer = setTimeout(() => {
        setShowChannelInfo(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showChannelInfo]);
  
  // Load channel from localStorage
  useEffect(() => {
    try {
      const savedPlaylist = localStorage.getItem("iptv-playlist");
      if (savedPlaylist && channelId) {
        const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
        if (parsedPlaylist) {
          const foundChannel = parsedPlaylist.channels.find(c => c.id === channelId) || null;
          setChannel(foundChannel);
          
          if (!foundChannel) {
            toast.error("Channel not found");
            navigate("/");
          }
        } else {
          toast.error("Invalid playlist data");
          navigate("/");
        }
      } else {
        toast.error("No playlist found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading channel:", error);
      toast.error("Error loading channel");
      navigate("/");
    }
  }, [channelId, navigate]);
  
  // Fetch EPG data for the selected channel
  useEffect(() => {
    const getEPGData = async () => {
      if (!channel || !channel.epg_channel_id) {
        setEpgData(null);
        return;
      }
      
      setIsEpgLoading(true);
      try {
        const data = await fetchEPGData(channel);
        setEpgData(data);
      } catch (error) {
        console.error("Error fetching EPG data:", error);
        setEpgData(null);
      } finally {
        setIsEpgLoading(false);
      }
    };
    
    getEPGData();
  }, [channel]);
  
  if (!channel) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading channel...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black text-white">
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
        <button 
          className="glossy-button p-2 rounded-full"
          onClick={() => navigate("/")}
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5 text-gray-200" />
        </button>
        
        <button 
          className="glossy-button p-2 rounded-full"
          onClick={() => navigate("/")}
          aria-label="Show all channels"
        >
          <Grid className="w-5 h-5 text-gray-200" />
        </button>
        
        {!showChannelInfo && (
          <button 
            className="glossy-button p-2 rounded-full"
            onClick={() => setShowChannelInfo(true)}
            aria-label="Show channel information"
          >
            <Info className="w-5 h-5 text-gray-200" />
          </button>
        )}
      </div>
      
      <div className="h-full flex items-center justify-center relative">
        <div className="w-full max-w-screen-2xl mx-auto relative">
          <VideoPlayer channel={channel} autoPlay />
          
          {/* Channel info panel - shown conditionally */}
          {showChannelInfo && (
            <div className="absolute top-0 right-0 m-6 max-w-sm z-20 animate-fade-in">
              <div className="glossy-card overflow-hidden shadow-xl">
                <div className="flex items-start justify-between p-4 glossy-header">
                  <div className="flex items-center gap-3">
                    {channel.logo ? (
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-12 h-12 object-contain rounded bg-gray-800/60 p-1 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center text-lg font-bold text-gray-300 shadow-sm">
                        {channel.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-bold text-white">{channel.name}</h1>
                      {channel.group && (
                        <div className="text-sm text-gray-400">{channel.group}</div>
                      )}
                    </div>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={() => setShowChannelInfo(false)}
                    aria-label="Hide channel information"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Channel details section with dark theme */}
                <ScrollArea className="max-h-[60vh]">
                  <div className="p-4 pt-0 bg-gray-800/30 backdrop-blur-md">
                    <EPGGuide
                      channel={channel}
                      epgData={epgData}
                      isLoading={isEpgLoading}
                    />
                    
                    <div className="border-t border-gray-700/40 mt-4 pt-2 text-sm text-gray-400">
                      Stream Type: {channel.stream_type || "m3u8"}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
