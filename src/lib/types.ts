export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  epg_channel_id?: string; // For EPG support
  stream_type?: string; // To track the stream type (ts, m3u8, etc)
}

export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
  source?: string;
  credentials?: XtreamCredentials; // Store credentials for potential refresh
}

export interface PaginatedChannels {
  items: Channel[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
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

// For Xtream API responses
export interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamStream {
  stream_id: number;
  name: string;
  stream_type: string;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

// Movies
export interface XtreamMovie {
  movie_id: number;
  stream_id: number;
  name: string;
  added: string;
  category_id: string;
  container_extension: string;
  stream_type: string;
  stream_icon: string;
  rating: string;
  director: string;
  actors: string;
  genre: string;
  plot: string;
  duration: string;
  releasedate: string;
  tmdb_id?: string;
  backdrop_path?: string;
  youtube_trailer?: string;
}

export interface Movie {
  id: string;
  name: string;
  url: string;
  logo?: string;
  backdrop?: string;
  group?: string;
  description?: string;
  duration?: string;
  rating?: string;
  year?: string;
  genre?: string;
  stream_type?: string;
  movie_id?: number; // Original ID from Xtream
}

export interface MovieCategory {
  id: string;
  name: string;
  movies: Movie[];
}

export interface PaginatedMovies {
  items: Movie[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Series
export interface XtreamSeries {
  series_id: number;
  name: string;
  cover: string;
  category_id: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  release_date: string;
  last_modified: string;
  rating: string;
  rating_5based: string;
  backdrop_path?: string;
  youtube_trailer?: string;
  episode_run_time?: string;
}

export interface XtreamSeriesSeason {
  id: string;
  series_id: number;
  name: string;
  cover: string;
  overview: string;
  season_number: string;
  air_date: string;
}

export interface XtreamSeriesEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  stream_type: string;
  info: {
    movie_image: string;
    plot: string;
    releasedate: string;
    duration: string;
    season: string;
    episode: string;
    tmdb_id: string;
  };
  added: string;
  season: string;
  direct_source: string;
}

export interface Series {
  id: string;
  name: string;
  logo?: string;
  backdrop?: string;
  group?: string;
  description?: string;
  rating?: string;
  year?: string;
  genre?: string;
  series_id: number; // Original ID from Xtream
  seasons?: Season[];
}

export interface Season {
  id: string;
  name: string;
  series_id: number;
  season_number: string;
  overview?: string;
  cover?: string;
  air_date?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  name: string;
  url: string;
  logo?: string;
  episode_number: string;
  season_number: string;
  description?: string;
  duration?: string;
  series_id: number;
  stream_type?: string;
  added?: string;
}

export interface SeriesCategory {
  id: string;
  name: string;
  series: Series[];
}

export interface PaginatedSeries {
  items: Series[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Add new interface for ChannelList props
export interface ChannelListProps {
  playlist: Playlist | null;
  paginatedChannels: PaginatedChannels | null;
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  isLoading?: boolean;
}

// Add watch history related types
export interface WatchHistoryItem {
  id: string;
  name: string;
  type: "channel" | "movie" | "episode";
  watchTime: number;
  lastWatched: string;
  thumbnailUrl?: string;
}
