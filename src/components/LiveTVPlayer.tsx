
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Channel, Playlist } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import { safeJsonParse } from "@/lib/utils";
import { ArrowRight, PlayCircle, ListFilter, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChannelList from "./ChannelList";
import ChannelGuide from "./ChannelGuide";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import PlaylistInput from "./PlaylistInput";
import EPGGuide from "./EPGGuide";
import { fetchEPGData } from "@/lib/epgService";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const LiveTVPlayer = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [paginatedChannels, setPaginatedChannels] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'guide'>('guide');
  const [epgData, setEpgData] = useState(null);
  const [loadingEPG, setLoadingEPG] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  // Fetch EPG data when channel changes
  useEffect(() => {
    if (!selectedChannel) return;
    
    const getEPGData = async () => {
      setLoadingEPG(true);
      const data = await fetchEPGData(selectedChannel);
      setEpgData(data);
      setLoadingEPG(false);
    };
    
    getEPGData();
  }, [selectedChannel]);

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
    setShowSettings(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const paginated = paginateChannels(playlist?.channels || [], page, ITEMS_PER_PAGE);
    setPaginatedChannels(paginated);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        {/* Channel Guide - Left Side */}
        <div className="w-full md:w-2/5 lg:w-1/3 border-r border-border">
          <div className="border-b border-border flex justify-between items-center bg-muted/30 px-4 py-2">
            <h3 className="font-medium">
              {playlist?.name || "Channels"}
              <span className="ml-2 text-sm text-muted-foreground">
                {playlist?.channels.length || 0} channels
              </span>
            </h3>
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === 'list' ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8"
              >
                <ListFilter className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button 
                variant={viewMode === 'guide' ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setViewMode('guide')}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Guide
              </Button>
              <Sheet open={showSettings} onOpenChange={setShowSettings}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="py-6">
                    <h3 className="text-lg font-medium mb-4">Playlist Settings</h3>
                    <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          <div className="h-[calc(100vh-14rem)] overflow-y-auto p-4">
            {viewMode === 'guide' ? (
              <ChannelGuide 
                playlist={playlist}
                selectedChannel={selectedChannel}
                onSelectChannel={handleSelectChannel}
                isLoading={isLoading}
              />
            ) : (
              <ChannelList 
                playlist={playlist}
                paginatedChannels={paginatedChannels}
                selectedChannel={selectedChannel}
                onSelectChannel={handleSelectChannel}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
        
        {/* Video Player - Right Side */}
        <div className="w-full md:w-3/5 lg:w-2/3">
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
              </div>
            ) : (
              <div className="flex items-center justify-center h-full flex-col gap-3 p-4">
                <p className="text-white">Add a playlist to start watching Live TV</p>
                <Button 
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="bg-primary/20 border-primary/30 text-white"
                >
                  <ArrowRight className="mr-2 h-4 w-4 transform rotate-90" />
                  Add Playlist
                </Button>
              </div>
            )}
          </div>
          
          {/* Current program info */}
          {selectedChannel && (
            <div className="p-4 border-t border-border">
              <EPGGuide 
                channel={selectedChannel} 
                epgData={epgData} 
                isLoading={loadingEPG} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTVPlayer;

