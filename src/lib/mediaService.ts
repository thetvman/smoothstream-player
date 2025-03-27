
import { 
  XtreamCredentials, 
  XtreamCategory, 
  XtreamMovie, 
  Movie, 
  MovieCategory,
  XtreamSeries,
  XtreamSeriesSeason,
  XtreamSeriesEpisode,
  Series,
  SeriesCategory,
  Season,
  Episode
} from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * Get the proper URL format for an Xtream movie stream
 */
export const getXtreamMovieUrl = (
  baseUrl: string,
  username: string,
  password: string,
  streamId: number,
  container: string = "mp4"
): string => {
  return `${baseUrl}/movie/${username}/${password}/${streamId}.${container}`;
};

/**
 * Get the proper URL format for an Xtream series episode
 */
export const getXtreamSeriesUrl = (
  baseUrl: string,
  username: string,
  password: string,
  streamId: number,
  container: string = "mp4"
): string => {
  return `${baseUrl}/series/${username}/${password}/${streamId}.${container}`;
};

/**
 * Fetch movie categories from Xtream API
 */
export const fetchMovieCategories = async (credentials: XtreamCredentials): Promise<XtreamCategory[]> => {
  const { server, username, password } = credentials;
  const baseUrl = server.replace(/\/$/, "");
  
  const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch movie categories: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format for movie categories");
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching movie categories:", error);
    throw error;
  }
};

/**
 * Fetch series categories from Xtream API
 */
export const fetchSeriesCategories = async (credentials: XtreamCredentials): Promise<XtreamCategory[]> => {
  const { server, username, password } = credentials;
  const baseUrl = server.replace(/\/$/, "");
  
  const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series categories: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format for series categories");
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching series categories:", error);
    throw error;
  }
};

/**
 * Fetch movies by category from Xtream API
 */
export const fetchMoviesByCategory = async (
  credentials: XtreamCredentials,
  categoryId: string
): Promise<XtreamMovie[]> => {
  const { server, username, password } = credentials;
  const baseUrl = server.replace(/\/$/, "");
  
  const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams&category_id=${categoryId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch movies: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format for movies");
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

/**
 * Fetch series by category from Xtream API
 */
export const fetchSeriesByCategory = async (
  credentials: XtreamCredentials,
  categoryId: string
): Promise<XtreamSeries[]> => {
  const { server, username, password } = credentials;
  const baseUrl = server.replace(/\/$/, "");
  
  const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series&category_id=${categoryId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format for series");
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching series:", error);
    throw error;
  }
};

/**
 * Fetch a specific movie's information
 */
export const fetchMovieInfo = async (
  credentials: XtreamCredentials,
  movieId: number
): Promise<XtreamMovie> => {
  const { server, username, password } = credentials;
  const baseUrl = server.replace(/\/$/, "");
  
  const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch movie info: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.info || data;
  } catch (error) {
    console.error("Error fetching movie info:", error);
    throw error;
  }
};

/**
 * Fetch a specific series information
 */
export const fetchSeriesInfo = async (
  credentials: XtreamCredentials,
  seriesId: number
): Promise<{info: XtreamSeries, episodes: Record<string, XtreamSeriesEpisode[]>}> => {
  const { server, username, password } = credentials;
  const baseUrl = server.replace(/\/$/, "");
  
  const url = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch series info: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching series info:", error);
    throw error;
  }
};

/**
 * Store a single movie in localStorage (for playback purposes)
 */
export const storeMovieForPlayback = (movie: Movie): void => {
  try {
    // Store just this single movie instead of all movies
    localStorage.setItem(`movie-${movie.id}`, JSON.stringify(movie));
    console.log("Movie saved to localStorage for playback:", movie.name);
  } catch (error) {
    console.error("Failed to store movie in localStorage:", error);
    // If storing directly fails, try removing other items
    try {
      // Clear any previous movie data to make space
      clearOldMovieData();
      // Try storing again
      localStorage.setItem(`movie-${movie.id}`, JSON.stringify(movie));
    } catch (innerError) {
      console.error("Still failed to store movie after cleanup:", innerError);
    }
  }
};

/**
 * Store a single series episode in localStorage (for playback purposes)
 */
export const storeEpisodeForPlayback = (episode: Episode, series: Series): void => {
  try {
    // Store just this single episode and its parent series
    localStorage.setItem(`episode-${episode.id}`, JSON.stringify(episode));
    localStorage.setItem(`series-${series.id}`, JSON.stringify(series));
    console.log("Episode saved to localStorage for playback:", episode.name);
  } catch (error) {
    console.error("Failed to store episode in localStorage:", error);
    // If storing directly fails, try removing other items
    try {
      // Clear any previous media data to make space
      clearOldMediaData();
      // Try storing again
      localStorage.setItem(`episode-${episode.id}`, JSON.stringify(episode));
      localStorage.setItem(`series-${series.id}`, JSON.stringify(series));
    } catch (innerError) {
      console.error("Still failed to store episode after cleanup:", innerError);
    }
  }
};

/**
 * Get a movie from localStorage by ID
 */
export const getMovieById = (movieId: string): Movie | null => {
  try {
    const movieData = localStorage.getItem(`movie-${movieId}`);
    if (movieData) {
      return JSON.parse(movieData) as Movie;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving movie from localStorage:", error);
    return null;
  }
};

/**
 * Get a series from localStorage by ID
 */
export const getSeriesById = (seriesId: string): Series | null => {
  try {
    const seriesData = localStorage.getItem(`series-${seriesId}`);
    if (seriesData) {
      return JSON.parse(seriesData) as Series;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving series from localStorage:", error);
    return null;
  }
};

/**
 * Get an episode from localStorage by ID
 */
export const getEpisodeById = (episodeId: string): Episode | null => {
  try {
    const episodeData = localStorage.getItem(`episode-${episodeId}`);
    if (episodeData) {
      return JSON.parse(episodeData) as Episode;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving episode from localStorage:", error);
    return null;
  }
};

/**
 * Clear old movie data from localStorage
 */
export const clearOldMovieData = (): void => {
  try {
    // Find and remove items that start with "movie-" prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("movie-")) {
        keysToRemove.push(key);
      }
    }
    
    // Remove old movie data
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} old movie items from localStorage`);
  } catch (error) {
    console.error("Error clearing old movie data:", error);
  }
};

/**
 * Clear old series data from localStorage
 */
export const clearOldSeriesData = (): void => {
  try {
    // Find and remove items that start with "series-" or "episode-" prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("series-") || key.startsWith("episode-"))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove old series data
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} old series items from localStorage`);
  } catch (error) {
    console.error("Error clearing old series data:", error);
  }
};

/**
 * Clear all media data from localStorage
 */
export const clearOldMediaData = (): void => {
  clearOldMovieData();
  clearOldSeriesData();
};

/**
 * Fetch all movies from Xtream API
 */
export const fetchAllMovies = async (credentials: XtreamCredentials): Promise<MovieCategory[]> => {
  try {
    // First fetch all categories
    const categories = await fetchMovieCategories(credentials);
    console.log(`Fetched ${categories.length} movie categories`);
    
    // Map categories to their names for later use
    const categoryMap: Record<string, string> = {};
    categories.forEach(cat => {
      categoryMap[cat.category_id] = cat.category_name;
    });
    
    // Fetch movies for each category in parallel
    const movieCategoriesPromises = categories.map(async category => {
      try {
        const xtreamMovies = await fetchMoviesByCategory(credentials, category.category_id);
        
        // Convert Xtream movies to our app format
        const movies: Movie[] = xtreamMovies.map(movie => {
          const container = movie.container_extension || 'mp4';
          return {
            id: uuidv4(),
            name: movie.name,
            url: getXtreamMovieUrl(credentials.server, credentials.username, credentials.password, movie.stream_id, container),
            logo: movie.stream_icon || undefined,
            backdrop: movie.backdrop_path,
            group: categoryMap[movie.category_id],
            description: movie.plot || undefined,
            duration: movie.duration || undefined,
            rating: movie.rating || undefined,
            year: movie.releasedate ? new Date(movie.releasedate).getFullYear().toString() : undefined,
            genre: movie.genre || undefined,
            stream_type: container,
            movie_id: movie.movie_id
          };
        });
        
        return {
          id: uuidv4(),
          name: category.category_name,
          movies
        };
      } catch (error) {
        console.error(`Error fetching movies for category ${category.category_name}:`, error);
        return {
          id: uuidv4(),
          name: category.category_name,
          movies: []
        };
      }
    });
    
    const movieCategories = await Promise.all(movieCategoriesPromises);
    
    // Filter out empty categories
    return movieCategories.filter(category => category.movies.length > 0);
  } catch (error) {
    console.error("Error fetching all movies:", error);
    throw error;
  }
};

/**
 * Fetch all series from Xtream API
 */
export const fetchAllSeries = async (credentials: XtreamCredentials): Promise<SeriesCategory[]> => {
  try {
    // First fetch all categories
    const categories = await fetchSeriesCategories(credentials);
    console.log(`Fetched ${categories.length} series categories`);
    
    // Map categories to their names for later use
    const categoryMap: Record<string, string> = {};
    categories.forEach(cat => {
      categoryMap[cat.category_id] = cat.category_name;
    });
    
    // Fetch series for each category in parallel
    const seriesCategoriesPromises = categories.map(async category => {
      try {
        const xtreamSeries = await fetchSeriesByCategory(credentials, category.category_id);
        
        // Convert Xtream series to our app format
        const seriesList: Series[] = xtreamSeries.map(series => {
          return {
            id: uuidv4(),
            name: series.name,
            logo: series.cover || undefined,
            backdrop: series.backdrop_path,
            group: categoryMap[series.category_id],
            description: series.plot || undefined,
            rating: series.rating || undefined,
            year: series.release_date ? new Date(series.release_date).getFullYear().toString() : undefined,
            genre: series.genre || undefined,
            series_id: series.series_id
          };
        });
        
        return {
          id: uuidv4(),
          name: category.category_name,
          series: seriesList
        };
      } catch (error) {
        console.error(`Error fetching series for category ${category.category_name}:`, error);
        return {
          id: uuidv4(),
          name: category.category_name,
          series: []
        };
      }
    });
    
    const seriesCategories = await Promise.all(seriesCategoriesPromises);
    
    // Filter out empty categories
    return seriesCategories.filter(category => category.series.length > 0);
  } catch (error) {
    console.error("Error fetching all series:", error);
    throw error;
  }
};

/**
 * Fetch series info with episodes
 */
export const fetchSeriesWithEpisodes = async (
  credentials: XtreamCredentials,
  series: Series
): Promise<Series> => {
  try {
    const seriesInfo = await fetchSeriesInfo(credentials, series.series_id);
    
    // Process seasons and episodes
    const seasons: Season[] = [];
    
    // Episodes come in a format like { "1": [episode1, episode2], "2": [episode1] }
    // where "1", "2" are season numbers
    Object.entries(seriesInfo.episodes).forEach(([seasonNum, episodes]) => {
      const seasonEpisodes: Episode[] = episodes.map(episode => {
        const container = episode.container_extension || 'mp4';
        return {
          id: uuidv4(),
          name: episode.title,
          url: getXtreamSeriesUrl(
            credentials.server, 
            credentials.username, 
            credentials.password, 
            parseInt(episode.id),
            container
          ),
          logo: episode.info.movie_image || undefined,
          episode_number: episode.episode_num.toString(),
          season_number: seasonNum,
          description: episode.info.plot || undefined,
          duration: episode.info.duration || undefined,
          series_id: series.series_id,
          stream_type: container,
          added: episode.added
        };
      });
      
      seasons.push({
        id: uuidv4(),
        name: `Season ${seasonNum}`,
        series_id: series.series_id,
        season_number: seasonNum,
        episodes: seasonEpisodes
      });
    });
    
    // Sort seasons by number
    seasons.sort((a, b) => parseInt(a.season_number) - parseInt(b.season_number));
    
    // Sort episodes within each season
    seasons.forEach(season => {
      if (season.episodes) {
        season.episodes.sort((a, b) => parseInt(a.episode_number) - parseInt(b.episode_number));
      }
    });
    
    return {
      ...series,
      seasons
    };
  } catch (error) {
    console.error("Error fetching series with episodes:", error);
    return series;
  }
};
