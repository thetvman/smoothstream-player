
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { Channel } from "@/lib/types";
import { EPGModalProps } from "./epg/types";
import { LazyLoadedCategory } from "./epg/types";
import TimeSlotHeader from "./epg/TimeSlotHeader";
import CategoryContent from "./epg/CategoryContent";
import { generateTimeSlots, formatDate } from "./epg/utils";

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
      // Get unique category names from channels
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
      
      // Generate time slots
      setTimeSlots(generateTimeSlots());
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
            <TimeSlotHeader timeSlots={timeSlots} />
            
            {/* Guide content for each category */}
            {categoryNames.map(group => (
              <TabsContent 
                key={group} 
                value={group} 
                className="flex-1 overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <CategoryContent
                  isLoading={isLoading}
                  selectedTab={selectedTab}
                  groupName={group}
                  channels={categoryData[group]?.isLoaded ? categoryData[group].channels : []}
                  currentChannel={currentChannel}
                  timeSlots={timeSlots}
                  onSelectChannel={handleSelectChannel}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EPGModal;
