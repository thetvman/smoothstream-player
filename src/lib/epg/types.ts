
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
