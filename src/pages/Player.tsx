
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";
import { Channel, Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  
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
    <div className="fixed inset-0 bg-black">
      <div className="absolute top-6 left-6 z-10">
        <button 
          className="bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
          onClick={() => navigate("/")}
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-screen-2xl mx-auto relative">
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
    </div>
  );
};

export default Player;
