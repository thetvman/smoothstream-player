
// EPG service type definitions

export interface EPGProgram {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  channelId: string;
}

export interface EPGProgressInfo {
  total: number;
  processed: number;
  progress: number;
  isLoading: boolean;
  message?: string;
  parsingSpeed?: number;
  estimatedTimeRemaining?: string;
  startTime?: number;
}
