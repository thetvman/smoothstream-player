
import React from "react";
import Layout from "@/components/Layout";
import PlaylistInput from "@/components/PlaylistInput";
import ChannelList from "@/components/ChannelList";
import PaginationControls from "@/components/PaginationControls";
import PlayerSection from "@/components/PlayerSection";
import PageHeader from "@/components/layout/PageHeader";
import { usePlaylist } from "@/hooks/use-playlist";
import { useDarkMode } from "@/hooks/use-dark-mode";

const Index = () => {
  const {
    playlist,
    selectedChannel,
    paginatedChannels,
    currentPage,
    isLoading,
    epgData,
    isEpgLoading,
    handlePlaylistLoaded,
    handleSelectChannel,
    handleClearPlaylist,
    handlePageChange
  } = usePlaylist();
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col h-full space-y-6">
        <PageHeader 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
      
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <PlayerSection 
              selectedChannel={selectedChannel} 
              epgData={epgData} 
              isEpgLoading={isEpgLoading} 
            />
            
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
              onClearPlaylist={handleClearPlaylist}
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
