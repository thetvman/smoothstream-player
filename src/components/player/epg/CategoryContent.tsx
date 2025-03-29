
import React from "react";
import { Channel } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import ChannelRow from "./ChannelRow";

interface CategoryContentProps {
  isLoading: boolean;
  selectedTab: string;
  groupName: string;
  channels: Channel[];
  currentChannel: Channel | null;
  timeSlots: Date[];
  onSelectChannel: (channel: Channel) => void;
}

const CategoryContent: React.FC<CategoryContentProps> = ({
  isLoading,
  selectedTab,
  groupName,
  channels,
  currentChannel,
  timeSlots,
  onSelectChannel
}) => {
  if (isLoading && selectedTab === groupName) {
    return (
      <div className="flex items-center justify-center flex-1 bg-background/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading channels...</span>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 bg-background/50">
      {channels.map(channel => (
        <ChannelRow
          key={channel.id}
          channel={channel}
          currentChannel={currentChannel}
          timeSlots={timeSlots}
          onSelectChannel={onSelectChannel}
        />
      ))}
    </ScrollArea>
  );
};

export default CategoryContent;
