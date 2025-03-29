
// EPG service type definitions

export interface EPGProgram {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  channelId: string;
}

// Add interface for single channel parsing option
export interface EPGParsingOptions {
  singleChannelMode?: boolean;
  channelId?: string;
}

// New interface for channel in EPG guide
export interface EPGChannel {
  id: string;
  name: string;
  logo?: string;
  programs: EPGProgram[];
}

// New interface for the guide data structure
export interface EPGGuideData {
  channels: EPGChannel[];
  startTime: Date;
  endTime: Date;
}

// Interface for lazy loaded category data
export interface LazyLoadedCategory {
  isLoaded: boolean;
  channels: Channel[];
}
