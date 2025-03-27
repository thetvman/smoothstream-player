
import React, { useState, useMemo, useEffect } from "react";
import { Channel, ChannelListProps } from "@/lib/types";
import { Search, Tv, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { paginateItems } from "@/lib/paginationUtils";

interface GridChannelListProps extends Omit<ChannelListProps, 'paginatedChannels'> {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

const GridChannelList: React.FC<GridChannelListProps> = ({
  playlist,
  channels,
  selectedChannel,
  onSelectChannel,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>(channels);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24); // Show more items per page in grid view
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  
  const groups = useMemo(() => {
    if (!playlist?.channels) return [];
    
    const uniqueGroups = [...new Set(playlist.channels
      .map(channel => channel.group)
      .filter(Boolean) as string[]
    )];
    
    return uniqueGroups.sort();
  }, [playlist]);
  
  // Filter channels based on search and group
  useEffect(() => {
    if (!channels) {
      setFilteredChannels([]);
      return;
    }
    
    const filtered = channels.filter(channel => {
      const matchesSearch = !searchTerm || 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = !activeGroup || channel.group === activeGroup;
      
      return matchesSearch && matchesGroup;
    });
    
    setFilteredChannels(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [channels, searchTerm, activeGroup]);
  
  // Calculate pagination
  const paginatedChannels = useMemo(() => {
    return paginateItems(filteredChannels, currentPage, itemsPerPage);
  }, [filteredChannels, currentPage, itemsPerPage]);
  
  const handleChannelClick = (channel: Channel) => {
    onSelectChannel(channel);
    navigate(`/player/${channel.id}`);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Render pagination links
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
  
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {Array.from({ length: 24 }).map((_, index) => (
            <Card key={index} className="aspect-video animate-pulse glossy-card">
              <CardContent className="p-0 h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-700/60"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Always render the component even if playlist is null
  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      <div className="p-3 border-b border-gray-800 glossy-header sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glossy-input pl-9 pr-3"
            />
          </div>
        </div>
        
        {groups.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap pb-1">
            <div className="flex items-center gap-1">
              <button
                className={`glossy-pill whitespace-nowrap ${
                  activeGroup === null 
                    ? "bg-gradient-to-r from-primary/80 to-primary/60 border-primary/40" 
                    : ""
                }`}
                onClick={() => setActiveGroup(null)}
              >
                All
              </button>
              
              {groups.map(group => (
                <button
                  key={group}
                  className={`glossy-pill whitespace-nowrap ${
                    activeGroup === group 
                      ? "bg-gradient-to-r from-primary/80 to-primary/60 border-primary/40" 
                      : ""
                  }`}
                  onClick={() => setActiveGroup(group)}
                >
                  {group}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        {paginatedChannels.items.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-300">No channels found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            {paginatedChannels.items.map(channel => (
              <Card 
                key={channel.id} 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 overflow-hidden glossy-card", 
                  selectedChannel?.id === channel.id ? "ring-2 ring-primary/90" : ""
                )}
                onClick={() => handleChannelClick(channel)}
                onMouseEnter={() => setHoveredChannel(channel.id)}
                onMouseLeave={() => setHoveredChannel(null)}
              >
                <CardContent className="p-0 h-full flex flex-col bg-gray-900/20 backdrop-blur-sm aspect-video relative">
                  <div className="flex-1 flex items-center justify-center p-3">
                    {channel.logo ? (
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-full h-full object-contain p-2 max-h-16"
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.display = 'none';
                          if (imgElement.nextElementSibling) {
                            (imgElement.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      "w-full h-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300",
                      channel.logo ? "hidden" : ""
                    )}>
                      {channel.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md p-2 text-center text-xs font-medium text-gray-200 truncate border-t border-gray-700/40">
                    {channel.name}
                  </div>
                  
                  {/* Channel info tooltip shown on hover - always visible on hover */}
                  {hoveredChannel === channel.id && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 group-hover:opacity-100 animate-fade-in z-10">
                      <div className="text-center">
                        <h3 className="font-bold text-white">{channel.name}</h3>
                        {channel.group && (
                          <p className="text-xs text-gray-300 mt-1">{channel.group}</p>
                        )}
                        <p className="text-xs text-primary mt-2">Click to watch</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {paginatedChannels.totalPages > 1 && (
        <div className="p-3 border-t border-gray-800 glossy-header shadow-inner">
          <Pagination>
            <PaginationContent className="flex justify-center">
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    className="text-white glossy-button hover:bg-gray-700/50" 
                  />
                </PaginationItem>
              )}
              
              {renderPaginationLinks()}
              
              {currentPage < paginatedChannels.totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    className="text-white glossy-button hover:bg-gray-700/50" 
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
          
          <div className="text-xs text-center text-gray-400 mt-2">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, paginatedChannels.totalItems)} of {paginatedChannels.totalItems} channels
          </div>
        </div>
      )}
      
      <div className="p-3 border-t border-gray-800 glossy-header shadow-inner">
        <div className="text-xs text-gray-400">
          <span className="font-medium text-gray-300">{playlist?.name}</span> • {playlist?.channels?.length || 0} channels
          {activeGroup && 
            ` • ${filteredChannels.length} in "${activeGroup}"`}
        </div>
      </div>
    </div>
  );
};

export default GridChannelList;
