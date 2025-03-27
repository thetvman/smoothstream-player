
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PlaylistInput from "@/components/PlaylistInput";
import ChannelList from "@/components/ChannelList";
import VideoPlayer from "@/components/VideoPlayer";
import EPGGuide from "@/components/EPGGuide";
import { Playlist, Channel, PaginatedChannels } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { fetchEPGData, EPGProgram } from "@/lib/epgService";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Index = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedChannels, setPaginatedChannels] = useState<PaginatedChannels | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [epgData, setEpgData] = useState<EPGProgram[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  
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
  
  // Update paginated channels when playlist or page changes
  useEffect(() => {
    if (playlist) {
      setPaginatedChannels(paginateChannels(playlist.channels, currentPage, ITEMS_PER_PAGE));
    } else {
      setPaginatedChannels(null);
    }
  }, [playlist, currentPage]);
  
  // Save playlist and selected channel to localStorage
  useEffect(() => {
    if (playlist) {
      localStorage.setItem("iptv-playlist", JSON.stringify(playlist));
    }
    
    if (selectedChannel) {
      localStorage.setItem("iptv-last-channel", selectedChannel.id);
    }
  }, [playlist, selectedChannel]);
  
  // Fetch EPG data when selected channel changes
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
    
    // Use setTimeout to prevent UI from freezing during large playlist processing
    setTimeout(() => {
      setPlaylist(newPlaylist);
      setCurrentPage(1);
      
      // Select first channel by default
      if (newPlaylist.channels.length > 0) {
        setSelectedChannel(newPlaylist.channels[0]);
      }
      
      setIsLoading(false);
    }, 50);
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
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Generate pagination links
  const renderPaginationLinks = () => {
    if (!paginatedChannels || paginatedChannels.totalPages <= 1) return null;
    
    const { currentPage, totalPages } = paginatedChannels;
    const pageItems = [];
    
    // Add current page and surrounding pages
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
          <h1 className="text-2xl font-bold tracking-tight">Stream Player</h1>
          <p className="text-muted-foreground">Watch your IPTV streams with a premium experience</p>
        </header>
      
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Video player section */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="animate-fade-in">
              <VideoPlayer channel={selectedChannel} />
            </div>
            
            {/* EPG Guide - New component */}
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
          
          {/* Channel list section */}
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
