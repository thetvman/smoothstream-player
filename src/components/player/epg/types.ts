
import { Channel } from "@/lib/types";

export interface LazyLoadedCategory {
  isLoaded: boolean;
  channels: Channel[];
}

export interface EPGModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: Channel[];
  currentChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
}
