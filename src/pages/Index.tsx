
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ChannelList from "@/components/ChannelList";
import Header from "@/components/Header";
import VideoSection from "@/components/VideoSection";
import PaginationControls from "@/components/PaginationControls";
import { Playlist, Channel, PaginatedChannels } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { fetchEPGData, EPGProgram, prefetchEPGDataForChannels } from "@/lib/epgService";

const Index = () => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedChannels, setPaginatedChannels] = useState<PaginatedChannels | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [epgData, setEpgData] = useState<EPGProgram[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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
        
        // Start prefetching EPG data in the background
        const channelsWithEpg = parsedPlaylist.channels.filter(c => c.epg_channel_id);
        if (channelsWithEpg.length > 0) {
          console.log(`Starting background EPG prefetch for ${channelsWithEpg.length} channels`);
          prefetchEPGDataForChannels(channelsWithEpg);
        }
      }
    }

    // Check for saved dark mode preference
    const darkModePreference = localStorage.getItem("iptv-dark-mode") === "true";
    setIsDarkMode(darkModePreference);
  }, []);
  
  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem("iptv-dark-mode", isDarkMode.toString());
  }, [isDarkMode]);
  
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
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col h-full space-y-6">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Video player section */}
          <VideoSection 
            selectedChannel={selectedChannel}
            playlist={playlist}
            epgData={epgData}
            isEpgLoading={isEpgLoading}
            onPlaylistLoaded={handlePlaylistLoaded}
          />
          
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
              <PaginationControls 
                paginatedChannels={paginatedChannels}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
