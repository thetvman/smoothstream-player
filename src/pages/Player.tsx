
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";
import { Channel, Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { ArrowLeft, Grid, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(true);
  
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
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist && channelId) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      if (parsedPlaylist) {
        const foundChannel = parsedPlaylist.channels.find(c => c.id === channelId) || null;
        setChannel(foundChannel);
        
        if (!foundChannel) {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [channelId, navigate]);
  
  if (!channel) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-player-background text-player-foreground">
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
        <button 
          className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-colors backdrop-blur-md"
          onClick={() => navigate("/")}
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button 
          className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-colors backdrop-blur-md"
          onClick={() => navigate("/")}
          aria-label="Show all channels"
        >
          <Grid className="w-5 h-5" />
        </button>
        
        {!showChannelInfo && (
          <button 
            className="bg-black/30 hover:bg-black/50 p-2 rounded-full transition-colors backdrop-blur-md"
            onClick={() => setShowChannelInfo(true)}
            aria-label="Show channel information"
          >
            <Info className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="h-full flex items-center justify-center relative">
        <div className="w-full max-w-screen-2xl mx-auto relative">
          <VideoPlayer channel={channel} autoPlay />
          
          {/* Channel info panel - shown conditionally */}
          {showChannelInfo && (
            <div className="absolute top-0 right-0 m-6 max-w-sm z-20 transition-all duration-300 ease-in-out">
              <div className="glass-morphism rounded-lg overflow-hidden shadow-2xl">
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {channel.logo ? (
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-12 h-12 object-contain rounded bg-black/20 p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-lg font-bold">
                        {channel.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-bold">{channel.name}</h1>
                      {channel.group && (
                        <div className="text-sm text-white/70">{channel.group}</div>
                      )}
                    </div>
                  </div>
                  <button 
                    className="text-white/70 hover:text-white"
                    onClick={() => setShowChannelInfo(false)}
                    aria-label="Hide channel information"
                  >
                    ×
                  </button>
                </div>
                
                {/* Channel details section with scrolling for long content */}
                <ScrollArea className="max-h-[60vh]">
                  <div className="p-4 pt-0">
                    {channel.epg_channel_id ? (
                      <div className="mt-2 p-3 bg-white/5 rounded-md">
                        <div className="text-sm font-medium">Current Program</div>
                        <div className="text-xs text-white/70 mt-1">
                          Program information will appear here when available
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-white/5 rounded-md">
                        <div className="text-sm text-white/70">
                          No program information available for this channel
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-white/50">
                      Stream Type: {channel.stream_type || "Unknown"}
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
