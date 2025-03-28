
import React, { useState, useMemo, useEffect } from "react";
import { Channel, ChannelListProps } from "@/lib/types";
import { Search, Tv, Grid2X2, List, ChevronRight, ChevronDown } from "lucide-react";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  
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
  
  // Handle group selection
  const handleGroupSelect = (group: string | null) => {
    setActiveGroup(group);
    setGroupDialogOpen(false);
  };

  // Toggle between list and grid view
  const toggleViewMode = () => {
    setViewMode(prev => prev === "list" ? "grid" : "list");
  };

  // Show more/less groups
  const toggleShowAllGroups = () => {
    setShowAllGroups(!showAllGroups);
  };

  // Render skeleton loading state
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

  // Determine which groups to show based on showAllGroups state
  const displayedGroups = showAllGroups ? groups : groups.slice(0, 7);
  const hasMoreGroups = groups.length > 7;
  
  return (
    <div className="flex flex-col h-full overflow-hidden bg-card rounded-lg border border-border">
      {/* Header with search and view toggle */}
      <div className="p-3 border-b border-border">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-input rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setGroupDialogOpen(true)} 
              className="text-xs flex items-center gap-1"
            >
              {activeGroup || "All Groups"}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleViewMode} title={`Switch to ${viewMode === "list" ? "grid" : "list"} view`}>
            {viewMode === "list" ? <Grid2X2 className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Channel list/grid */}
      <ScrollArea className="flex-1">
        {(!filteredPagination || !filteredPagination.items || filteredPagination.items.length === 0) ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No channels found</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2 p-2" : "space-y-1 p-1"}>
            {filteredPagination.items.map(channel => (
              viewMode === "grid" ? (
                <div
                  key={channel.id}
                  className={`p-2 rounded-md border cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedChannel?.id === channel.id ? "bg-accent border-primary" : "border-border"
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <div className="flex flex-col items-center text-center gap-2 p-2">
                    {channel.logo ? (
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-12 h-12 object-contain rounded bg-background p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center text-md font-medium">
                        {channel.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    <div>
                      <div className="font-medium text-sm line-clamp-1">
                        {channel.name}
                        {channel.epg_channel_id && (
                          <span className="ml-1 inline-flex items-center" title="EPG info available">
                            <Tv className="w-3 h-3 text-primary/60" />
                          </span>
                        )}
                      </div>
                      {channel.group && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {channel.group}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={channel.id}
                  className={`p-2 rounded-md border flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedChannel?.id === channel.id ? "bg-accent border-primary" : "border-border"
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  {channel.logo ? (
                    <img 
                      src={channel.logo} 
                      alt={channel.name} 
                      className="w-8 h-8 object-contain rounded bg-background p-1 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {channel.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate flex items-center">
                      {channel.name}
                      {channel.epg_channel_id && (
                        <span className="ml-1.5 inline-flex items-center" title="EPG info available">
                          <Tv className="w-3 h-3 text-primary/60" />
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
              )
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Footer with playlist info */}
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

      {/* Group selection dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Channel Group</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={activeGroup === null ? "default" : "outline"}
                className="justify-start"
                onClick={() => handleGroupSelect(null)}
              >
                All Groups
              </Button>
              
              {groups.map(group => (
                <Button
                  key={group}
                  variant={activeGroup === group ? "default" : "outline"}
                  className="justify-start text-sm overflow-hidden text-ellipsis"
                  onClick={() => handleGroupSelect(group)}
                >
                  {group}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChannelList;
