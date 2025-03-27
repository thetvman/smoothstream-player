
import React, { useState, useMemo, useEffect } from "react";
import { Channel, ChannelListProps } from "@/lib/types";
import { Search, Tv, Play } from "lucide-react";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const ChannelList: React.FC<ChannelListProps> = ({
  playlist,
  paginatedChannels,
  selectedChannel,
  onSelectChannel,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [filteredPagination, setFilteredPagination] = useState(paginatedChannels);
  const [currentPage, setCurrentPage] = useState(1);
  
  const groups = useMemo(() => {
    if (!playlist?.channels) return [];
    
    const uniqueGroups = [...new Set(playlist.channels
      .map(channel => channel.group)
      .filter(Boolean) as string[]
    )];
    
    return uniqueGroups.sort();
  }, [playlist]);
  
  useEffect(() => {
    if (!playlist?.channels) {
      setFilteredPagination(null);
      return;
    }
    
    const filteredChannels = playlist.channels.filter(channel => {
      const matchesSearch = !searchTerm || 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = !activeGroup || channel.group === activeGroup;
      
      return matchesSearch && matchesGroup;
    });
    
    const newPagination = paginateChannels(
      filteredChannels, 
      currentPage,
      ITEMS_PER_PAGE
    );
    
    setFilteredPagination(newPagination);
  }, [playlist, searchTerm, activeGroup, currentPage]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-center items-center bg-card rounded-lg p-4">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-muted rounded w-full"></div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="h-14 bg-muted rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!playlist) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No playlist loaded</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {groups.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
            <button
              className={`category-tab ${activeGroup === null ? "category-tab-active" : ""}`}
              onClick={() => setActiveGroup(null)}
            >
              All Channels
            </button>
            
            {groups.map(group => (
              <button
                key={group}
                className={`category-tab ${activeGroup === group ? "category-tab-active" : ""}`}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-card border border-border rounded-lg overflow-hidden flex-1">
        <ScrollArea className="h-[350px]">
          {(!filteredPagination || filteredPagination.items.length === 0) ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">No channels found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPagination.items.map(channel => (
                <div
                  key={channel.id}
                  className="hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => onSelectChannel(channel)}
                >
                  <div className={`p-3 flex items-center space-x-3 relative ${
                    selectedChannel?.id === channel.id ? "bg-primary/10" : ""
                  }`}>
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <Tv className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {channel.name}
                      </div>
                      {channel.group && (
                        <div className="text-xs text-muted-foreground truncate">
                          {channel.group}
                        </div>
                      )}
                    </div>
                    
                    {/* Live indicator for selected channel */}
                    {selectedChannel?.id === channel.id && (
                      <div className="bg-green-500 px-2 py-0.5 rounded text-white text-xs font-medium flex items-center">
                        <Play className="w-3 h-3 mr-0.5 fill-current" />
                        LIVE
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      {filteredPagination && filteredPagination.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {/* Show max 5 page numbers */}
            {Array.from({ length: Math.min(5, filteredPagination.totalPages) }, (_, i) => {
              // Start page calculation
              let startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(startPage + 4, filteredPagination.totalPages);
              
              // Adjust startPage if we're near the end
              if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
              }
              
              const pageNum = startPage + i;
              
              // Don't render beyond total pages
              if (pageNum > filteredPagination.totalPages) {
                return null;
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    isActive={currentPage === pageNum}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage >= filteredPagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ChannelList;
