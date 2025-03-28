
import React, { useState, useEffect } from "react";
import { Channel, ChannelListProps } from "@/lib/types";
import { Search, Tv, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { fetchEPGData, EPGProgram } from "@/lib/epg";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChannelTableViewProps extends Omit<ChannelListProps, 'paginatedChannels'> {
  channels: Channel[];
}

const ChannelTableView: React.FC<ChannelTableViewProps> = ({
  playlist,
  channels,
  selectedChannel,
  onSelectChannel,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [epgData, setEpgData] = useState<Record<string, EPGProgram[]>>({});
  const [loadingEpg, setLoadingEpg] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Filter channels based on search term
  useEffect(() => {
    if (!channels) {
      setFilteredChannels([]);
      return;
    }
    
    const filtered = channels.filter(channel => 
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (channel.group && channel.group.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Sort the filtered channels
    const sorted = [...filtered].sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === "group") {
        const groupA = a.group || "";
        const groupB = b.group || "";
        return sortDirection === "asc" 
          ? groupA.localeCompare(groupB) 
          : groupB.localeCompare(groupA);
      }
      return 0;
    });
    
    setFilteredChannels(sorted);
  }, [channels, searchTerm, sortField, sortDirection]);
  
  // Format time for EPG display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get current program for a channel
  const getCurrentProgram = (channelId: string) => {
    if (!epgData[channelId]) return null;
    
    const now = new Date();
    return epgData[channelId].find(
      program => program.start <= now && program.end >= now
    );
  };
  
  // Get next program for a channel
  const getNextProgram = (channelId: string) => {
    if (!epgData[channelId]) return null;
    
    const now = new Date();
    return epgData[channelId]
      .filter(program => program.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  };
  
  // Load EPG data for a channel
  const loadEpgForChannel = async (channel: Channel) => {
    if (!channel.epg_channel_id || epgData[channel.id] || loadingEpg[channel.id]) {
      return;
    }
    
    setLoadingEpg(prev => ({ ...prev, [channel.id]: true }));
    
    try {
      const data = await fetchEPGData(channel);
      if (data) {
        setEpgData(prev => ({ ...prev, [channel.id]: data }));
      }
    } catch (error) {
      console.error(`Error loading EPG data for ${channel.name}:`, error);
    } finally {
      setLoadingEpg(prev => ({ ...prev, [channel.id]: false }));
    }
  };
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Render sort icons
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1 inline" /> 
      : <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card rounded-lg border border-border">
      {/* Header with search */}
      <div className="p-3 border-b border-border">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 text-sm"
          />
        </div>
      </div>
      
      {/* Table view of channels */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Channel {renderSortIcon("name")}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("group")}
              >
                Group {renderSortIcon("group")}
              </TableHead>
              <TableHead>Now Playing</TableHead>
              <TableHead>Next Up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChannels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No channels found
                </TableCell>
              </TableRow>
            ) : (
              filteredChannels.map(channel => {
                // Try to load EPG data when the channel is rendered
                if (channel.epg_channel_id && !epgData[channel.id] && !loadingEpg[channel.id]) {
                  loadEpgForChannel(channel);
                }
                
                const currentProgram = getCurrentProgram(channel.id);
                const nextProgram = getNextProgram(channel.id);
                
                return (
                  <TableRow 
                    key={channel.id}
                    className={`cursor-pointer ${selectedChannel?.id === channel.id ? 'bg-accent' : ''}`}
                    onClick={() => onSelectChannel(channel)}
                  >
                    <TableCell className="p-2">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-8 h-8 object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-xs font-medium">
                          {channel.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {channel.name}
                        {channel.epg_channel_id && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Tv className="w-3 h-3 text-primary ml-2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>EPG available</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {channel.group ? (
                        <Badge variant="outline" className="font-normal">
                          {channel.group}
                        </Badge>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      {loadingEpg[channel.id] ? (
                        <Skeleton className="h-5 w-32" />
                      ) : channel.epg_channel_id ? (
                        currentProgram ? (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 text-primary mr-1.5" />
                            <div>
                              <div className="text-sm font-medium truncate max-w-[180px]">
                                {currentProgram.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No info available</span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-xs">No EPG</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {loadingEpg[channel.id] ? (
                        <Skeleton className="h-5 w-32" />
                      ) : channel.epg_channel_id && nextProgram ? (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 text-muted-foreground mr-1.5" />
                          <div>
                            <div className="text-sm truncate max-w-[180px]">
                              {nextProgram.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(nextProgram.start)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      
      {/* Footer with playlist info */}
      {playlist && (
        <div className="p-3 border-t border-border bg-secondary/30">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{playlist.name}</span> • {playlist.channels.length} channels
            {filteredChannels.length !== playlist.channels.length && 
              ` • ${filteredChannels.length} filtered`}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelTableView;
