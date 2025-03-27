
import { Movie, Series, Season, Episode } from "./types";

// TMDB API configuration
const TMDB_API_KEY = "0fd8ade0f772180c8f8d651787c35e14";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Image sizes
export const POSTER_SIZES = {
  small: "w185",
  medium: "w342",
  large: "w500",
  original: "original"
};

export const BACKDROP_SIZES = {
  small: "w300",
  medium: "w780",
  large: "w1280",
  original: "original"
};

// Types for TMDB API responses
interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
}

interface TMDBTVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
}

interface TMDBTVSeason {
  id: number;
  season_number: number;
  name: string;
  poster_path: string | null;
  overview: string;
  episodes: TMDBEpisode[];
  air_date: string;
}

interface TMDBEpisode {
  id: number;
  episode_number: number;
  name: string;
  still_path: string | null;
  overview: string;
  air_date: string;
  runtime: number | null;
  season_number: number;
}

// Helper functions
export const getTMDBImageUrl = (path: string | null, size: string): string | undefined => {
  if (!path) return undefined;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Main API functions
export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((movie: TMDBMovie) => ({
      id: `tmdb-movie-${movie.id}`,
      name: movie.title,
      url: "", // This will be populated when the movie is played
      logo: getTMDBImageUrl(movie.poster_path, POSTER_SIZES.medium),
      backdrop: getTMDBImageUrl(movie.backdrop_path, BACKDROP_SIZES.large),
      description: movie.overview,
      year: movie.release_date ? movie.release_date.substring(0, 4) : undefined,
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined,
      tmdb_id: movie.id,
      group: "TMDB Search Results"
    }));
  } catch (error) {
    console.error("Error searching TMDB movies:", error);
    return [];
  }
};

export const searchTVShows = async (query: string): Promise<Series[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((show: TMDBTVShow) => ({
      id: `tmdb-series-${show.id}`,
      name: show.name,
      logo: getTMDBImageUrl(show.poster_path, POSTER_SIZES.medium),
      backdrop: getTMDBImageUrl(show.backdrop_path, BACKDROP_SIZES.large),
      description: show.overview,
      year: show.first_air_date ? show.first_air_date.substring(0, 4) : undefined,
      rating: show.vote_average ? show.vote_average.toFixed(1) : undefined,
      tmdb_id: show.id,
      series_id: show.id,
      group: "TMDB Search Results"
    }));
  } catch (error) {
    console.error("Error searching TMDB TV shows:", error);
    return [];
  }
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((movie: TMDBMovie) => ({
      id: `tmdb-movie-${movie.id}`,
      name: movie.title,
      url: "", // This will be populated when the movie is played
      logo: getTMDBImageUrl(movie.poster_path, POSTER_SIZES.medium),
      backdrop: getTMDBImageUrl(movie.backdrop_path, BACKDROP_SIZES.large),
      description: movie.overview,
      year: movie.release_date ? movie.release_date.substring(0, 4) : undefined,
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined,
      tmdb_id: movie.id,
      group: "Popular Movies"
    }));
  } catch (error) {
    console.error("Error fetching popular TMDB movies:", error);
    return [];
  }
};

export const getPopularTVShows = async (): Promise<Series[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((show: TMDBTVShow) => ({
      id: `tmdb-series-${show.id}`,
      name: show.name,
      logo: getTMDBImageUrl(show.poster_path, POSTER_SIZES.medium),
      backdrop: getTMDBImageUrl(show.backdrop_path, BACKDROP_SIZES.large),
      description: show.overview,
      year: show.first_air_date ? show.first_air_date.substring(0, 4) : undefined,
      rating: show.vote_average ? show.vote_average.toFixed(1) : undefined,
      tmdb_id: show.id,
      series_id: show.id,
      group: "Popular TV Shows"
    }));
  } catch (error) {
    console.error("Error fetching popular TMDB TV shows:", error);
    return [];
  }
};

export const getMovieDetails = async (tmdbId: number): Promise<Movie | null> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const movie: TMDBMovie & { videos?: any; credits?: any } = await response.json();
    
    // Extract trailer if available
    let trailerUrl = undefined;
    if (movie.videos && movie.videos.results) {
      const trailer = movie.videos.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      if (trailer) {
        trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    }
    
    // Extract cast
    let cast = undefined;
    if (movie.credits && movie.credits.cast) {
      cast = movie.credits.cast.slice(0, 5).map((c: any) => c.name).join(", ");
    }
    
    // Format genres
    const genres = movie.genres ? movie.genres.map(g => g.name).join(", ") : undefined;
    
    return {
      id: `tmdb-movie-${movie.id}`,
      name: movie.title,
      url: "", // This will be populated when the movie is played using the original URL
      logo: getTMDBImageUrl(movie.poster_path, POSTER_SIZES.medium),
      backdrop: getTMDBImageUrl(movie.backdrop_path, BACKDROP_SIZES.large),
      description: movie.overview,
      year: movie.release_date ? movie.release_date.substring(0, 4) : undefined,
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined,
      duration: movie.runtime ? `${movie.runtime}` : undefined,
      genre: genres,
      cast: cast,
      trailer: trailerUrl,
      tmdb_id: movie.id,
      group: "Movie Details"
    };
  } catch (error) {
    console.error("Error fetching TMDB movie details:", error);
    return null;
  }
};

export const getTVShowDetails = async (tmdbId: number): Promise<Series | null> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const show: TMDBTVShow & { videos?: any; credits?: any } = await response.json();
    
    // Extract trailer if available
    let trailerUrl = undefined;
    if (show.videos && show.videos.results) {
      const trailer = show.videos.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      if (trailer) {
        trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    }
    
    // Extract cast
    let cast = undefined;
    if (show.credits && show.credits.cast) {
      cast = show.credits.cast.slice(0, 5).map((c: any) => c.name).join(", ");
    }
    
    // Format genres
    const genres = show.genres ? show.genres.map(g => g.name).join(", ") : undefined;
    
    return {
      id: `tmdb-series-${show.id}`,
      name: show.name,
      logo: getTMDBImageUrl(show.poster_path, POSTER_SIZES.medium),
      backdrop: getTMDBImageUrl(show.backdrop_path, BACKDROP_SIZES.large),
      description: show.overview,
      year: show.first_air_date ? show.first_air_date.substring(0, 4) : undefined,
      rating: show.vote_average ? show.vote_average.toFixed(1) : undefined,
      genre: genres,
      cast: cast,
      trailer: trailerUrl,
      seasons_count: show.number_of_seasons,
      tmdb_id: show.id,
      series_id: show.id,
      group: "TV Show Details"
    };
  } catch (error) {
    console.error("Error fetching TMDB TV show details:", error);
    return null;
  }
};

export const getTVSeasonDetails = async (
  tmdbId: number, 
  seasonNumber: number
): Promise<Season | null> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const season: TMDBTVSeason = await response.json();
    
    const episodes: Episode[] = season.episodes.map(ep => ({
      id: `tmdb-episode-${ep.id}`,
      name: ep.name,
      url: "", // This will be populated when the episode is played
      logo: getTMDBImageUrl(ep.still_path, POSTER_SIZES.medium),
      episode_number: `${ep.episode_number}`,
      season_number: `${ep.season_number}`,
      description: ep.overview,
      duration: ep.runtime ? `${ep.runtime}` : undefined,
      series_id: tmdbId,
      added: ep.air_date
    }));
    
    return {
      id: `tmdb-season-${season.id}`,
      name: season.name,
      series_id: tmdbId,
      season_number: `${season.season_number}`,
      overview: season.overview,
      cover: getTMDBImageUrl(season.poster_path, POSTER_SIZES.medium),
      air_date: season.air_date,
      episodes: episodes
    };
  } catch (error) {
    console.error("Error fetching TMDB TV season details:", error);
    return null;
  }
};

// Functions to get movie lists by category
export const getMoviesByCategory = async (category: string): Promise<Movie[]> => {
  try {
    let endpoint = "popular";
    
    switch (category.toLowerCase()) {
      case "top rated":
        endpoint = "top_rated";
        break;
      case "now playing":
        endpoint = "now_playing";
        break;
      case "upcoming":
        endpoint = "upcoming";
        break;
      default:
        endpoint = "popular";
    }
    
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${endpoint}?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((movie: TMDBMovie) => ({
      id: `tmdb-movie-${movie.id}`,
      name: movie.title,
      url: "", // This will be populated when the movie is played
      logo: getTMDBImageUrl(movie.poster_path, POSTER_SIZES.medium),
      backdrop: getTMDBImageUrl(movie.backdrop_path, BACKDROP_SIZES.large),
      description: movie.overview,
      year: movie.release_date ? movie.release_date.substring(0, 4) : undefined,
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined,
      tmdb_id: movie.id,
      group: category
    }));
  } catch (error) {
    console.error(`Error fetching ${category} TMDB movies:`, error);
    return [];
  }
};

// Function to get TV shows by category
export const getTVShowsByCategory = async (category: string): Promise<Series[]> => {
  try {
    let endpoint = "popular";
    
    switch (category.toLowerCase()) {
      case "top rated":
        endpoint = "top_rated";
        break;
      case "on the air":
        endpoint = "on_the_air";
        break;
      case "airing today":
        endpoint = "airing_today";
        break;
      default:
        endpoint = "popular";
    }
    
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${endpoint}?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((show: TMDBTVShow) => ({
      id: `tmdb-series-${show.id}`,
      name: show.name,
      logo: getTMDBImageUrl(show.poster_path, POSTER_SIZES.medium),
      backdrop: getTMDBImageUrl(show.backdrop_path, BACKDROP_SIZES.large),
      description: show.overview,
      year: show.first_air_date ? show.first_air_date.substring(0, 4) : undefined,
      rating: show.vote_average ? show.vote_average.toFixed(1) : undefined,
      tmdb_id: show.id,
      series_id: show.id,
      group: category
    }));
  } catch (error) {
    console.error(`Error fetching ${category} TMDB TV shows:`, error);
    return [];
  }
};
