import { XtreamCredentials, XtreamCategory, XtreamMovie, Movie, MovieCategory } from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * Get the proper URL format for an Xtream movie stream
 * Ensures the URL uses HTTPS to prevent mixed content warnings
 */
export const getXtreamMovieUrl = (
  baseUrl: string,
  username: string,
  password: string,
  streamId: number,
  container: string = "mp4"
): string => {
  // Convert the URL to HTTPS if it's using HTTP
  let secureBaseUrl = baseUrl;
  if (secureBaseUrl.startsWith('http:')) {
    secureBaseUrl = secureBaseUrl.replace('http:', 'https:');
  }
  
  return `${secureBaseUrl}/movie/${username}/${password}/${streamId}.${container}`;
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
 * Store a single movie in localStorage (for playback purposes)
 */
export const storeMovieForPlayback = (movie: Movie): void => {
  try {
    // Ensure movie URL uses HTTPS
    if (movie.url && movie.url.startsWith('http:')) {
      movie.url = movie.url.replace('http:', 'https:');
    }
    
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
          
          // Ensure we use HTTPS URL
          let movieUrl = getXtreamMovieUrl(credentials.server, credentials.username, credentials.password, movie.stream_id, container);
          
          return {
            id: uuidv4(),
            name: movie.name,
            url: movieUrl,
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
