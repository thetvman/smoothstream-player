
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MoviePlayerComponent from "@/components/MoviePlayer";
import { Movie } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const MoviePlayer = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  
  // Load movie from localStorage
  useEffect(() => {
    if (!movieId) {
      navigate("/movies");
      return;
    }
    
    // Search for the movie in localStorage
    const storageKeys = ['xtream-movies'];
    let foundMovie: Movie | null = null;
    
    for (const key of storageKeys) {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const parsedData = safeJsonParse<MovieCategory[]>(storedData, []);
        
        for (const category of parsedData) {
          const movie = category.movies.find(m => m.id === movieId);
          if (movie) {
            foundMovie = movie;
            break;
          }
        }
        
        if (foundMovie) break;
      }
    }
    
    if (foundMovie) {
      setMovie(foundMovie);
    } else {
      // If we couldn't find the movie by ID, go back to the movies page
      navigate("/movies");
    }
  }, [movieId, navigate]);
  
  return (
    <div className="fixed inset-0 bg-player">
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="btn-icon bg-black/40 hover:bg-black/60"
          onClick={() => navigate("/movies")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="h-full flex items-center justify-center">
        <MoviePlayerComponent movie={movie} autoPlay />
      </div>
    </div>
  );
};

export default MoviePlayer;
