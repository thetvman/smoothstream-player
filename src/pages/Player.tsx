
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";
import { Channel, Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { ArrowLeft, Info, List, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EPGGuide from "@/components/EPGGuide";
import { fetchEPGData, EPGProgram } from "@/lib/epgService";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [epgData, setEpgData] = useState<EPGProgram[] | null>(null);
  const [showEPG, setShowEPG] = useState(false);
  const [loadingEPG, setLoadingEPG] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load channel from localStorage
  useEffect(() => {
    const loadChannel = async () => {
      setIsLoading(true);
      
      try {
        const savedPlaylist = localStorage.getItem("iptv-playlist");
        if (!savedPlaylist || !channelId) {
          throw new Error("Playlist or channel ID not found");
        }
        
        const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
        if (!parsedPlaylist) {
          throw new Error("Could not parse playlist");
        }
        
        const foundChannel = parsedPlaylist.channels.find(c => c.id === channelId) || null;
        if (!foundChannel) {
          throw new Error("Channel not found in playlist");
        }
        
        setChannel(foundChannel);
        
        // Fetch EPG data
        setLoadingEPG(true);
        try {
          const data = await fetchEPGData(foundChannel);
          setEpgData(data);
        } catch (epgError) {
          console.error("EPG data fetch error:", epgError);
          // Don't fail the whole component on EPG error
        } finally {
          setLoadingEPG(false);
        }
      } catch (error) {
        console.error("Error loading channel:", error);
        setError(error instanceof Error ? error.message : "Failed to load channel");
        // Navigate back to home after a short delay
        setTimeout(() => navigate("/"), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChannel();
  }, [channelId, navigate]);
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <div className="glass-dark p-6 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            className="btn-icon bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  if (!channel) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button 
          className="btn-icon bg-black/40 hover:bg-black/60 text-white"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className={`btn-icon ${showEPG ? 'bg-primary text-primary-foreground' : 'bg-black/40 hover:bg-black/60 text-white'}`}
                onClick={() => setShowEPG(!showEPG)}
              >
                <Clock className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Toggle program guide
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {channel.group && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="btn-icon bg-black/40 hover:bg-black/60 text-white">
                  <Info className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div>
                  <p className="font-medium">{channel.name}</p>
                  <p className="text-xs text-muted-foreground">{channel.group}</p>
                  {channel.epg_channel_id && (
                    <p className="text-xs text-primary">Has EPG Guide</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="h-full flex items-center justify-center relative">
        <VideoPlayer channel={channel} autoPlay />
        
        {/* EPG Guide Overlay */}
        {showEPG && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center mb-2">
                {channel.logo ? (
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className="w-10 h-10 object-contain mr-3 bg-black/30 p-1 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div>
                  <h3 className="text-white font-bold">{channel.name}</h3>
                  {channel.group && (
                    <p className="text-xs text-white/70">{channel.group}</p>
                  )}
                </div>
              </div>
              
              <EPGGuide 
                channel={channel} 
                epgData={epgData} 
                isLoading={loadingEPG}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
