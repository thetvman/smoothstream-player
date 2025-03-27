
export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
  source?: string;
}

export interface PlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  loading: boolean;
  fullscreen: boolean;
}

export interface XtreamCredentials {
  server: string;
  username: string;
  password: string;
}

