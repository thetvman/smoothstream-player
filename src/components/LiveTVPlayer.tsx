
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Channel, Playlist } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import { safeJsonParse } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChannelList from "./ChannelList";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import PlaylistInput from "./PlaylistInput";

const LiveTVPlayer = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [paginatedChannels, setPaginatedChannels] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Load last used playlist from localStorage
  useEffect(() => {
    setIsLoading(true);
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    
    if (savedPlaylist) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      if (parsedPlaylist && parsedPlaylist.channels.length > 0) {
        setPlaylist(parsedPlaylist);
        
        // Get the last watched channel id
        const lastChannelId = localStorage.getItem("last-channel-id");
        const initialChannel = lastChannelId 
          ? parsedPlaylist.channels.find(c => c.id === lastChannelId) || parsedPlaylist.channels[0]
          : parsedPlaylist.channels[0];
          
        setSelectedChannel(initialChannel);
        
        // Set up pagination
        const paginated = paginateChannels(parsedPlaylist.channels, currentPage, ITEMS_PER_PAGE);
        setPaginatedChannels(paginated);
      }
    }
    
    setIsLoading(false);
  }, [currentPage]);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    // Save last selected channel ID
    localStorage.setItem("last-channel-id", channel.id);
  };

  const handlePlaylistLoaded = (newPlaylist: Playlist) => {
    // Save to localStorage for persistence
    localStorage.setItem("iptv-playlist", JSON.stringify(newPlaylist));
    
    setPlaylist(newPlaylist);
    
    if (newPlaylist.channels.length > 0) {
      const initialChannel = newPlaylist.channels[0];
      setSelectedChannel(initialChannel);
      localStorage.setItem("last-channel-id", initialChannel.id);
    }
    
    setCurrentPage(1);
    const paginated = paginateChannels(newPlaylist.channels, 1, ITEMS_PER_PAGE);
    setPaginatedChannels(paginated);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const paginated = paginateChannels(playlist?.channels || [], page, ITEMS_PER_PAGE);
    setPaginatedChannels(paginated);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <Tabs defaultValue="player" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none">
          <TabsTrigger value="player">Live TV</TabsTrigger>
          <TabsTrigger value="channels">Channel List</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="player" className="m-0">
          <div className="aspect-video bg-black relative">
            {selectedChannel ? (
              <div>
                <VideoPlayer 
                  channel={selectedChannel} 
                  autoPlay 
                />
                <div className="absolute bottom-4 right-4">
                  <Button
                    size="sm"
                    className="bg-primary text-white hover:bg-primary/90"
                    onClick={() => navigate(`/player/${selectedChannel.id}`)}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Fullscreen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : playlist ? (
              <div className="flex items-center justify-center h-full flex-col gap-3 p-4">
                <p className="text-white">Select a channel to start watching</p>
                <ArrowRight className="h-8 w-8 text-white/60 animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full flex-col gap-3 p-4">
                <p className="text-white">Add a playlist to start watching Live TV</p>
                <ArrowRight className="h-8 w-8 text-white/60 animate-pulse transform rotate-90" />
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="channels" className="m-0 max-h-[400px]">
          <div className="h-[400px]">
            <ChannelList 
              playlist={playlist}
              paginatedChannels={paginatedChannels}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="m-0 max-h-[400px]">
          <div className="p-4 h-[400px] overflow-y-auto">
            <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveTVPlayer;
