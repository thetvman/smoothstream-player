
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
    <div className="fixed inset-0 bg-player">
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="btn-icon bg-black/40 hover:bg-black/60"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="h-full flex items-center justify-center">
        <VideoPlayer channel={channel} autoPlay />
      </div>
    </div>
  );
};

export default Player;
