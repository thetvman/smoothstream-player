
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Channel } from "@/lib/types";
import { LazyLoadedCategory } from "@/lib/epg/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Clock } from "lucide-react";
import { fetchEPGData } from "@/lib/epg";

interface EPGModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: Channel[];
  currentChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
}

const EPGModal: React.FC<EPGModalProps> = ({
  open,
  onOpenChange,
  channels,
  currentChannel,
  onSelectChannel
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [categoryData, setCategoryData] = useState<Record<string, LazyLoadedCategory>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  // Setup category names and initial data structure on mount
  useEffect(() => {
    if (channels && channels.length > 0) {
      // Get unique category names from channels, excluding "All Channels"
      const groups = new Set<string>();
      channels.forEach(channel => {
        if (channel.group) {
          groups.add(channel.group);
        }
      });
      
      const groupNames = Array.from(groups);
      setCategoryNames(groupNames);
      
      // Initialize categories with empty channels arrays
      const initialCategoryData: Record<string, LazyLoadedCategory> = {};
      groupNames.forEach(name => {
        initialCategoryData[name] = {
          isLoaded: false,
          channels: []
        };
      });
      
      setCategoryData(initialCategoryData);
      
      // Set default selected tab to first category if available
      if (groupNames.length > 0) {
        setSelectedTab(groupNames[0]);
        handleTabChange(groupNames[0]);
      }
      
      // Generate time slots for the next 3 hours in 30-minute increments
      const now = new Date();
      now.setMinutes(now.getMinutes() - (now.getMinutes() % 30), 0, 0); // Round to nearest 30 min
      
      const slots = [];
      for (let i = 0; i < 6; i++) {
        const slotTime = new Date(now);
        slotTime.setMinutes(now.getMinutes() + (i * 30));
        slots.push(slotTime);
      }
      setTimeSlots(slots);
    }
  }, [channels]);

  // Handle tab change to load category data on demand
  const handleTabChange = (tabName: string) => {
    setSelectedTab(tabName);
    
    // If this category hasn't been loaded yet, load it now
    if (!categoryData[tabName]?.isLoaded) {
      setIsLoading(true);
      
      // Use setTimeout to give UI a chance to display loading state
      setTimeout(() => {
        const filteredChannels = channels.filter(channel => channel.group === tabName);
          
        setCategoryData(prev => ({
          ...prev,
          [tabName]: {
            isLoaded: true,
            channels: filteredChannels
          }
        }));
        
        setIsLoading(false);
      }, 200); // Short timeout to show loading indicator
    }
  };

  // Format time for display (12-hour format)
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Select channel and close the guide
  const handleSelectChannel = (channel: Channel) => {
    onSelectChannel(channel);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            TV Guide
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {formatDate(new Date())}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs 
            value={selectedTab}
            onValueChange={handleTabChange}
            className="flex-1 flex flex-col"
          >
            <div className="px-2 pt-2 border-b">
              <TabsList className="overflow-x-auto w-full justify-start h-auto p-0 bg-transparent">
                {categoryNames.map(group => (
                  <TabsTrigger 
                    key={group} 
                    value={group}
                    className="px-4 py-2 data-[state=active]:bg-primary/10"
                  >
                    {group}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {/* Time header */}
            <div className="grid grid-cols-[180px_1fr] overflow-hidden">
              <div className="p-2 bg-secondary/30 border-r font-semibold">
                Channel
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 min-w-[600px]">
                  {timeSlots.map((slot, i) => (
                    <div key={i} className="p-2 text-center bg-secondary/30 border-r font-semibold">
                      {formatTime(slot)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Guide content for each category */}
            {categoryNames.map(group => (
              <TabsContent 
                key={group} 
                value={group} 
                className="flex-1 overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                {isLoading && selectedTab === group ? (
                  <div className="flex items-center justify-center flex-1">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading channels...</span>
                  </div>
                ) : (
                  <ScrollArea className="flex-1">
                    {categoryData[group]?.isLoaded && categoryData[group]?.channels.map(channel => (
                      <ChannelRow
                        key={channel.id}
                        channel={channel}
                        currentChannel={currentChannel}
                        timeSlots={timeSlots}
                        onSelectChannel={handleSelectChannel}
                      />
                    ))}
                  </ScrollArea>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Create a separate component for channel rows to handle EPG data loading
const ChannelRow: React.FC<{
  channel: Channel,
  currentChannel: Channel | null,
  timeSlots: Date[],
  onSelectChannel: (channel: Channel) => void
}> = ({ channel, currentChannel, timeSlots, onSelectChannel }) => {
  const [epgData, setEpgData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Load EPG data when component mounts
  useEffect(() => {
    const loadEpgData = async () => {
      if (!channel.epg_channel_id) return;
      
      setIsLoading(true);
      try {
        const data = await fetchEPGData(channel);
        setEpgData(data || []);
      } catch (error) {
        console.error(`Error loading EPG data for ${channel.name}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEpgData();
  }, [channel]);

  // Find program for a specific time slot
  const findProgramForTimeSlot = (slot: Date) => {
    if (!epgData || epgData.length === 0) return null;
    
    return epgData.find(program => {
      const start = new Date(program.start);
      const end = new Date(program.end);
      return start <= slot && end > slot;
    });
  };

  return (
    <div 
      className={`grid grid-cols-[180px_1fr] border-b hover:bg-accent/20 transition-colors ${
        currentChannel?.id === channel.id ? 'bg-primary/10' : ''
      }`}
      onClick={() => onSelectChannel(channel)}
    >
      <div className="p-3 border-r flex items-center gap-2 overflow-hidden">
        {channel.logo && (
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="h-6 w-6 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="truncate font-medium">
          {channel.name}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="grid grid-cols-6 min-w-[600px] h-full">
          {timeSlots.map((slot, i) => {
            const program = findProgramForTimeSlot(slot);
            return (
              <div 
                key={i} 
                className="p-2 border-r h-full flex flex-col justify-center"
              >
                {isLoading ? (
                  <div className="text-xs text-muted-foreground">Loading...</div>
                ) : program ? (
                  <>
                    <div className="font-medium truncate">
                      {program.title}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(new Date(program.start))} - {formatTime(new Date(program.end))}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">No program data</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EPGModal;
