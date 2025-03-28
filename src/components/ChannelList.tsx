
import React, { useState, useMemo, useEffect } from "react";
import { Channel, ChannelListProps } from "@/lib/types";
import { Search, Tv } from "lucide-react";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";

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
      paginatedChannels?.currentPage || 1,
      ITEMS_PER_PAGE
    );
    
    setFilteredPagination(newPagination);
  }, [playlist, searchTerm, activeGroup, paginatedChannels?.currentPage]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-center items-center bg-card rounded-lg border border-border p-4">
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
    <div className="flex flex-col h-full overflow-hidden bg-card rounded-lg border border-border">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-input rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      
      {groups.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                activeGroup === null 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              onClick={() => setActiveGroup(null)}
            >
              All
            </button>
            
            {groups.map(group => (
              <button
                key={group}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  activeGroup === group 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-1">
        {(!filteredPagination || filteredPagination.items.length === 0) ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No channels found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredPagination.items.map(channel => (
              <div
                key={channel.id}
                className={`channel-item ${selectedChannel?.id === channel.id ? "channel-item-active" : ""}`}
                onClick={() => onSelectChannel(channel)}
              >
                {channel.logo ? (
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className="w-8 h-8 object-contain rounded bg-background p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-xs font-medium">
                    {channel.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {channel.name}
                    {channel.epg_channel_id && (
                      <span className="ml-1.5 inline-flex items-center">
                        <Tv className="w-3 h-3 text-primary" />
                      </span>
                    )}
                  </div>
                  {channel.group && (
                    <div className="text-xs text-muted-foreground truncate">
                      {channel.group}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-border bg-secondary/30">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">{playlist.name}</span> • {playlist.channels.length} channels
          {activeGroup && 
            ` • ${filteredPagination?.totalItems || 0} in "${activeGroup}"`}
          {filteredPagination && filteredPagination.totalPages > 1 && (
            <span> • Page {filteredPagination.currentPage} of {filteredPagination.totalPages}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
