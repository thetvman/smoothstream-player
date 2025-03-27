
import { XtreamCredentials, XtreamCategory, XtreamMovie, Movie, MovieCategory } from "./types";
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
