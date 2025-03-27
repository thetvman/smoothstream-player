
import React, { useMemo, useState } from "react";
import { Playlist, Channel, PaginatedChannels } from "@/lib/types";
import TVChannelCard from "./TVChannelCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { paginateItems } from "@/lib/paginationUtils";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface TVChannelGridProps {
  playlist: Playlist | null;
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  isLoading?: boolean;
  compactMode?: boolean;
  className?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const TVChannelGrid: React.FC<TVChannelGridProps> = ({
  playlist,
  selectedChannel,
  onSelectChannel,
  isLoading = false,
  compactMode = false,
  className,
  searchQuery = "",
  onSearchChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20; // Number of channels per page
  
  const filteredChannels = useMemo(() => {
    if (!playlist) return [];
    
    return playlist.channels.filter(channel => 
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (channel.group && channel.group.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [playlist, searchQuery]);
  
  const paginatedChannels = useMemo(() => {
    return paginateItems<Channel>(filteredChannels, currentPage, ITEMS_PER_PAGE);
  }, [filteredChannels, currentPage, ITEMS_PER_PAGE]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className={cn(
        "tv-grid animate-pulse",
        compactMode ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2" : "",
        className
      )}>
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="aspect-square">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!playlist || filteredChannels.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-white/70">No channels found</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {onSearchChange && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search channels..."
            className="pl-9 glass-input text-white"
          />
        </div>
      )}
      
      <div className={cn(
        compactMode 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2" 
          : "tv-grid",
      )}>
        {paginatedChannels.items.map(channel => (
          <div key={channel.id} className="h-full">
            <TVChannelCard
              channel={channel}
              isActive={selectedChannel?.id === channel.id}
              onClick={() => onSelectChannel(channel)}
              compactMode={compactMode}
            />
          </div>
        ))}
      </div>
      
      {/* Pagination controls */}
      {paginatedChannels.totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {/* Show max 5 page numbers */}
            {Array.from({ length: Math.min(5, paginatedChannels.totalPages) }, (_, i) => {
              // Start page calculation
              let startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(startPage + 4, paginatedChannels.totalPages);
              
              // Adjust startPage if we're near the end
              if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
              }
              
              const pageNum = startPage + i;
              
              // Don't render beyond total pages
              if (pageNum > paginatedChannels.totalPages) {
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
                className={currentPage >= paginatedChannels.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TVChannelGrid;
