import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PlaylistInput from "@/components/PlaylistInput";
import ChannelList from "@/components/ChannelList";
import VideoPlayer from "@/components/VideoPlayer";
import EPGGuide from "@/components/EPGGuide";
import EPGSettings from "@/components/EPGSettings";
import EPGLoadingProgress from "@/components/EPGLoadingProgress";
import { Playlist, Channel, PaginatedChannels } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { 
  fetchEPGData, 
  EPGProgram, 
  prefetchEPGDataForChannels, 
  getEPGLoadingProgress,
  EPGProgressInfo,
  hasValidCachedEPG
} from "@/lib/epg";

const Index = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedChannels, setPaginatedChannels] = useState<PaginatedChannels | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [epgData, setEpgData] = useState<EPGProgram[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [epgProgress, setEpgProgress] = useState<EPGProgressInfo>({
    total: 0,
    processed: 0,
    progress: 0,
    isLoading: false
  });
  const [cachedChannelCount, setCachedChannelCount] = useState(0);
  
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
        
        const channelsWithEpg = parsedPlaylist.channels.filter(c => c.epg_channel_id);
        if (channelsWithEpg.length > 0) {
          const cachedCount = channelsWithEpg.filter(c => hasValidCachedEPG(c.epg_channel_id!)).length;
          setCachedChannelCount(cachedCount);
          
          if (cachedCount < channelsWithEpg.length) {
            console.log(`Starting background EPG prefetch for ${channelsWithEpg.length - cachedCount} channels (${cachedCount} from cache)`);
            prefetchEPGDataForChannels(channelsWithEpg, setEpgProgress);
          } else {
            console.log(`All ${cachedCount} channels have cached EPG data, skipping prefetch`);
          }
        }
      }
    }

    const darkModePreference = localStorage.getItem("iptv-dark-mode") === "true";
    setIsDarkMode(darkModePreference);
  }, []);
  
  useEffect(() => {
    if (playlist && playlist.channels) {
      const channelsWithEpg = playlist.channels.filter(c => c.epg_channel_id);
      const cachedCount = channelsWithEpg.filter(c => hasValidCachedEPG(c.epg_channel_id!)).length;
      setCachedChannelCount(cachedCount);
    }
  }, [epgProgress, playlist]);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem("iptv-dark-mode", isDarkMode.toString());
  }, [isDarkMode]);
  
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
      
      const channelsWithEpg = newPlaylist.channels.filter(c => c.epg_channel_id);
      if (channelsWithEpg.length > 0) {
        const cachedCount = channelsWithEpg.filter(c => hasValidCachedEPG(c.epg_channel_id!)).length;
        setCachedChannelCount(cachedCount);
        
        if (cachedCount < channelsWithEpg.length) {
          console.log(`Starting EPG prefetch for ${channelsWithEpg.length - cachedCount} channels (${cachedCount} from cache)`);
          prefetchEPGDataForChannels(channelsWithEpg, setEpgProgress);
        } else {
          console.log(`All ${cachedCount} channels have cached EPG data, skipping prefetch`);
        }
      }
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
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col h-full space-y-6">
        <header className="flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Stream Player</h1>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <EPGSettings />
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      className={navigationMenuTriggerStyle()}
                      onClick={() => navigate('/movies')}
                    >
                      <Film className="mr-2 h-4 w-4" />
                      Movies
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      className={navigationMenuTriggerStyle()}
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
          <p className="text-muted-foreground">Watch your IPTV streams with a premium experience</p>
        </header>
      
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          <div className="lg:col-span-2 flex flex-col space-y-4">
            {epgProgress.isLoading && (
              <EPGLoadingProgress 
                isLoading={epgProgress.isLoading}
                progress={epgProgress.progress}
                total={epgProgress.total}
                processed={epgProgress.processed}
                message={epgProgress.message}
                cachedCount={cachedChannelCount}
              />
            )}
          
            <div className="animate-fade-in">
              <VideoPlayer channel={selectedChannel} />
              
              {selectedChannel && (
                <div className="flex justify-end mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openFullscreenPlayer}
                    className="text-xs"
                  >
                    Open Fullscreen Player
                  </Button>
                </div>
              )}
            </div>
            
            {selectedChannel && (
              <EPGGuide 
                channel={selectedChannel} 
                epgData={epgData} 
                isLoading={isEpgLoading} 
              />
            )}
            
            {!playlist && (
              <div className="flex-1">
                <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
              </div>
            )}
          </div>
          
          <div className="h-full flex flex-col overflow-hidden">
            <ChannelList
              playlist={playlist}
              paginatedChannels={paginatedChannels}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
              isLoading={isLoading}
            />
            
            {paginatedChannels && paginatedChannels.totalPages > 1 && (
              <div className="py-4 border-t">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    
                    {renderPaginationLinks()}
                    
                    {currentPage < paginatedChannels.totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
                
                <div className="text-xs text-center text-muted-foreground mt-2">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, paginatedChannels.totalItems)} of {paginatedChannels.totalItems} channels
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
