
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PlaylistInput from "@/components/PlaylistInput";
import ChannelList from "@/components/ChannelList";
import VideoPlayer from "@/components/VideoPlayer";
import { Playlist, Channel } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  // Load saved playlist and selected channel from localStorage
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      if (parsedPlaylist) {
        setPlaylist(parsedPlaylist);
        
        // Try to load last selected channel
        const savedChannelId = localStorage.getItem("iptv-last-channel");
        if (savedChannelId) {
          const channel = parsedPlaylist.channels.find(c => c.id === savedChannelId) || null;
          setSelectedChannel(channel);
        }
      }
    }
  }, []);
  
  // Save playlist and selected channel to localStorage
  useEffect(() => {
    if (playlist) {
      localStorage.setItem("iptv-playlist", JSON.stringify(playlist));
    }
    
    if (selectedChannel) {
      localStorage.setItem("iptv-last-channel", selectedChannel.id);
    }
  }, [playlist, selectedChannel]);
  
  const handlePlaylistLoaded = (newPlaylist: Playlist) => {
    setPlaylist(newPlaylist);
    
    // Select first channel by default
    if (newPlaylist.channels.length > 0) {
      setSelectedChannel(newPlaylist.channels[0]);
    }
  };
  
  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };
  
  // Open fullscreen player page
  const openFullscreenPlayer = () => {
    if (selectedChannel) {
      navigate(`/player/${selectedChannel.id}`);
    }
  };
  
  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col h-full space-y-6">
        <header className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Stream Player</h1>
          <p className="text-muted-foreground">Watch your IPTV streams with a premium experience</p>
        </header>
      
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Video player section */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="animate-fade-in">
              <VideoPlayer channel={selectedChannel} />
            </div>
            
            {!playlist && (
              <div className="flex-1">
                <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
              </div>
            )}
          </div>
          
          {/* Channel list section */}
          <div className="h-full overflow-hidden">
            <ChannelList
              playlist={playlist}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
