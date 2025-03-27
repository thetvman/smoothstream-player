import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PlaylistInput from "@/components/PlaylistInput";
import ChannelList from "@/components/ChannelList";
import GridChannelList from "@/components/GridChannelList";
import VideoPlayer from "@/components/VideoPlayer";
import EPGGuide from "@/components/EPGGuide";
import { Playlist, Channel, PaginatedChannels } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { fetchEPGData, EPGProgram } from "@/lib/epgService";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Film, Grid, List, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedChannels, setPaginatedChannels] = useState<PaginatedChannels | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [epgData, setEpgData] = useState<EPGProgram[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      if (parsedPlaylist) {
        setPlaylist(parsedPlaylist);
        
        const savedChannelId = localStorage.getItem("iptv-last-channel");
        if (savedChannelId) {
          const channel = parsedPlaylist.channels.find(c => c.id === savedChannelId) || null;
          setSelectedChannel(channel);
        }
      }
    }
  }, []);
  
  useEffect(() => {
    if (playlist) {
      setPaginatedChannels(paginateChannels(playlist.channels, currentPage, ITEMS_PER_PAGE));
    } else {
      setPaginatedChannels(null);
    }
  }, [playlist, currentPage]);
  
  useEffect(() => {
    if (playlist) {
      localStorage.setItem("iptv-playlist", JSON.stringify(playlist));
    }
    
    if (selectedChannel) {
      localStorage.setItem("iptv-last-channel", selectedChannel.id);
    }
  }, [playlist, selectedChannel]);
  
  useEffect(() => {
    const getEPGData = async () => {
      if (!selectedChannel || !selectedChannel.epg_channel_id) {
        setEpgData(null);
        return;
      }
      
      setIsEpgLoading(true);
      try {
        const data = await fetchEPGData(selectedChannel);
        setEpgData(data);
      } catch (error) {
        console.error("Error fetching EPG data:", error);
        setEpgData(null);
      } finally {
        setIsEpgLoading(false);
      }
    };
    
    getEPGData();
  }, [selectedChannel]);
  
  const handlePlaylistLoaded = (newPlaylist: Playlist) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setPlaylist(newPlaylist);
      setCurrentPage(1);
      
      if (newPlaylist.channels.length > 0) {
        setSelectedChannel(newPlaylist.channels[0]);
      }
      
      setIsLoading(false);
    }, 50);
  };
  
  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };
  
  const openFullscreenPlayer = () => {
    if (selectedChannel) {
      navigate(`/player/${selectedChannel.id}`);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const renderPaginationLinks = () => {
    if (!paginatedChannels || paginatedChannels.totalPages <= 1) return null;
    
    const { currentPage, totalPages } = paginatedChannels;
    const pageItems = [];
    
    const pageRange = 2;
    const startPage = Math.max(1, currentPage - pageRange);
    const endPage = Math.min(totalPages, currentPage + pageRange);
    
    if (startPage > 1) {
      pageItems.push(
        <PaginationItem key="page-1">
          <PaginationLink isActive={currentPage === 1} onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        pageItems.push(
          <PaginationItem key="ellipsis-1">
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink isActive={currentPage === i} onClick={() => handlePageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageItems.push(
          <PaginationItem key="ellipsis-2">
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        );
      }
      
      pageItems.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink isActive={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pageItems;
  };
  
  return (
    <div className={`${!playlist ? '' : 'tv-background'} min-h-screen`}>
      <Layout fullHeight className="py-6 md:py-8">
        <div className="flex flex-col h-full space-y-6">
          <header className="flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <h1 className={`text-2xl font-bold tracking-tight ${playlist ? 'text-white' : ''}`}>Stream Player</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode('grid')}
                    className={`${viewMode === 'grid' ? 'bg-muted' : ''} ${playlist ? 'text-white hover:text-white hover:bg-[hsl(0,73%,25%)]' : ''}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode('list')}
                    className={`${viewMode === 'list' ? 'bg-muted' : ''} ${playlist ? 'text-white hover:text-white hover:bg-[hsl(0,73%,25%)]' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink 
                        className={`${navigationMenuTriggerStyle()} ${playlist ? 'text-white bg-[hsl(0,73%,22%)] hover:bg-[hsl(0,73%,25%)]' : ''}`}
                        onClick={() => navigate('/movies')}
                      >
                        <Film className="mr-2 h-4 w-4" />
                        Movies
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink 
                        className={`${navigationMenuTriggerStyle()} ${playlist ? 'text-white bg-[hsl(0,73%,22%)] hover:bg-[hsl(0,73%,25%)]' : ''}`}
                        onClick={() => navigate('/series')}
                      >
                        <Tv className="mr-2 h-4 w-4" />
                        Series
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
            <p className={`${playlist ? 'text-[hsl(0,30%,85%)]' : 'text-muted-foreground'}`}>
              Watch your IPTV streams with a premium experience
            </p>
          </header>
        
          {!playlist ? (
            <div className="flex-1">
              <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="flex-1 overflow-hidden">
                <GridChannelList
                  playlist={playlist}
                  channels={playlist.channels}
                  selectedChannel={selectedChannel}
                  onSelectChannel={handleSelectChannel}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                <div className="lg:col-span-2 flex flex-col space-y-4">
                  <div className="animate-fade-in">
                    <VideoPlayer channel={selectedChannel} />
                  </div>
                  
                  {selectedChannel && (
                    <div className="tv-card shadow-lg">
                      <div className="tv-section">
                        <div className="flex items-center gap-2">
                          {selectedChannel.logo ? (
                            <img 
                              src={selectedChannel.logo} 
                              alt={selectedChannel.name} 
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-[hsl(0,73%,25%)] flex items-center justify-center">
                              {selectedChannel.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold">{selectedChannel.name}</h3>
                            {selectedChannel.group && (
                              <p className="text-xs text-[hsl(0,30%,85%)]">{selectedChannel.group}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="tv-content">
                        <EPGGuide 
                          channel={selectedChannel} 
                          epgData={epgData} 
                          isLoading={isEpgLoading} 
                        />
                        <div className="tv-info-row">
                          Stream Type: {selectedChannel.stream_type || "m3u8"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="h-full flex flex-col overflow-hidden tv-card">
                  <ChannelList
                    playlist={playlist}
                    paginatedChannels={paginatedChannels}
                    selectedChannel={selectedChannel}
                    onSelectChannel={handleSelectChannel}
                    isLoading={isLoading}
                  />
                  
                  {paginatedChannels && paginatedChannels.totalPages > 1 && (
                    <div className="py-4 border-t border-[hsl(0,60%,35%)] px-3">
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className="text-white" />
                            </PaginationItem>
                          )}
                          
                          {renderPaginationLinks()}
                          
                          {currentPage < paginatedChannels.totalPages && (
                            <PaginationItem>
                              <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className="text-white" />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                      
                      <div className="text-xs text-center text-[hsl(0,30%,85%)] mt-2">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                        {Math.min(currentPage * ITEMS_PER_PAGE, paginatedChannels.totalItems)} of {paginatedChannels.totalItems} channels
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </Layout>
    </div>
  );
};

export default Index;
