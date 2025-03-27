
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Channel, Playlist } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import { safeJsonParse } from "@/lib/utils";
import { 
  ArrowRight, 
  PlayCircle, 
  ListFilter, 
  LayoutGrid, 
  Maximize, 
  ArrowLeftRight, 
  Settings, 
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import PlaylistInput from "./PlaylistInput";
import EPGGuide from "./EPGGuide";
import { fetchEPGData } from "@/lib/epgService";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import TVChannelGrid from "./TVChannelGrid";

const LiveTVPlayer = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [paginatedChannels, setPaginatedChannels] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [epgData, setEpgData] = useState(null);
  const [loadingEPG, setLoadingEPG] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [guideSize, setGuideSize] = useState<'normal' | 'expanded' | 'minimized'>('normal');
  const [searchQuery, setSearchQuery] = useState("");

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

  const toggleGuideSize = () => {
    if (guideSize === 'normal') {
      setGuideSize('expanded');
    } else if (guideSize === 'expanded') {
      setGuideSize('minimized');
    } else {
      setGuideSize('normal');
    }
  };

  return (
    <div className="tv-guide-container rounded-xl overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
      {/* Main Content Area - Flexible Layout */}
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Channel Guide - Left Side (Responsive Size) */}
        <div 
          className={`
            ${guideSize === 'expanded' ? 'w-full md:w-3/5 lg:w-1/2' : ''}
            ${guideSize === 'normal' ? 'w-full md:w-2/5 lg:w-1/3' : ''}
            ${guideSize === 'minimized' ? 'w-full md:w-[120px]' : ''}
            tv-sidebar transition-all duration-300 flex flex-col
          `}
        >
          <div className="flex justify-between items-center bg-white/5 px-4 py-3">
            <h3 className={`font-medium ${guideSize === 'minimized' ? 'hidden md:block text-xs' : ''}`}>
              {playlist?.name || "Channels"}
              {playlist?.channels.length > 0 && guideSize !== 'minimized' && (
                <span className="ml-2 text-sm text-white/70">
                  {playlist?.channels.length} channels
                </span>
              )}
            </h3>
            <div className="flex space-x-1.5">
              <Button 
                variant={viewMode === 'list' ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 ${guideSize === 'minimized' ? 'p-0 w-8' : ''}`}
              >
                <ListFilter className="h-4 w-4 mr-1" />
                {guideSize !== 'minimized' && <span>List</span>}
              </Button>
              <Button 
                variant={viewMode === 'grid' ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 ${guideSize === 'minimized' ? 'p-0 w-8' : ''}`}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                {guideSize !== 'minimized' && <span>Grid</span>}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleGuideSize}
                className="h-8"
                title="Adjust guide size"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
              <Sheet open={showSettings} onOpenChange={setShowSettings}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <Settings className="h-4 w-4" />
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
          
          <div className={`tv-content-area ${guideSize === 'minimized' ? 'p-2' : 'p-4'} scrollbar-none`}>
            <TVChannelGrid
              playlist={playlist}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
              isLoading={isLoading}
              compactMode={guideSize === 'minimized'}
              searchQuery={searchQuery}
              onSearchChange={guideSize !== 'minimized' ? setSearchQuery : undefined}
            />
          </div>
        </div>
        
        {/* Video Player - Right Side */}
        <div className={`
          ${guideSize === 'expanded' ? 'w-full md:w-2/5 lg:w-1/2' : ''}
          ${guideSize === 'normal' ? 'w-full md:w-3/5 lg:w-2/3' : ''}
          ${guideSize === 'minimized' ? 'w-full md:flex-1' : ''}
          flex flex-col h-full transition-all duration-300
          bg-gradient-to-br from-gray-900 to-black p-4
        `}>
          <div className="flex-1 relative tv-video-container">
            {selectedChannel ? (
              <div className="h-full">
                <VideoPlayer 
                  channel={selectedChannel} 
                  autoPlay 
                />
                <div className="absolute bottom-4 right-4 z-10">
                  <Button
                    size="sm"
                    className="glass-button text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => navigate(`/player/${selectedChannel.id}`)}
                  >
                    <Maximize className="mr-2 h-4 w-4" />
                    Fullscreen
                  </Button>
                </div>
                
                {/* Channel info overlay */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                  <div className="flex items-center gap-3 glass-dark px-3 py-1.5 rounded-lg max-w-[70%]">
                    {selectedChannel.logo && (
                      <img 
                        src={selectedChannel.logo} 
                        alt="" 
                        className="h-8 w-8 object-contain bg-black/40 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="truncate">
                      <h3 className="font-medium truncate">{selectedChannel.name}</h3>
                      {selectedChannel.group && (
                        <p className="text-xs text-white/70 truncate">{selectedChannel.group}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-green-500/80 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                    <PlayCircle className="w-3 h-3 mr-1 fill-current" />
                    LIVE
                  </div>
                </div>
              </div>
            ) : playlist ? (
              <div className="flex items-center justify-center h-full flex-col gap-4 p-4 glass-dark">
                <PlayCircle className="h-16 w-16 text-primary/80 animate-pulse" />
                <p className="text-lg">Select a channel to start watching</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full flex-col gap-5 p-6 glass-dark">
                <div className="text-center">
                  <PlayCircle className="h-16 w-16 text-primary/80 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Add a playlist to start watching</h3>
                  <p className="text-white/70 max-w-md mb-4">
                    You can add your custom IPTV playlist to access your favorite live TV channels
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="glass-button text-white"
                  size="lg"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Add Playlist
                </Button>
              </div>
            )}
          </div>
          
          {/* Current program info */}
          {selectedChannel && (
            <div className="mt-4 glass-dark rounded-xl p-4">
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
