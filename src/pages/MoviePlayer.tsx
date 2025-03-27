
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MoviePlayerComponent from "@/components/MoviePlayer";
import { Movie } from "@/lib/types";
import { getMovieById } from "@/lib/mediaService";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const MoviePlayer = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load movie from localStorage
  useEffect(() => {
    setIsLoading(true);
    console.log("Looking for movie with ID:", movieId);
    
    if (!movieId) {
      toast.error("No movie ID provided");
      navigate("/movies");
      return;
    }
    
    // Get the movie directly using our new storage method
    const foundMovie = getMovieById(movieId);
    console.log("Found movie:", foundMovie?.name);
    
    if (foundMovie) {
      setMovie(foundMovie);
      setIsLoading(false);
    } else {
      console.error("Movie not found in storage. Movie ID:", movieId);
      toast.error("Movie not found");
      navigate("/movies");
    }
  }, [movieId, navigate]);
  
  // Use preventDefault to handle back button click
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/movies");
  };
  
  return (
    <div className="fixed inset-0 bg-player">
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="btn-icon bg-black/40 hover:bg-black/60"
          onClick={handleBackClick}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="h-full flex items-center justify-center">
        {isLoading ? (
          <div className="text-white">Loading movie...</div>
        ) : (
          <MoviePlayerComponent movie={movie} autoPlay />
        )}
      </div>
    </div>
  );
};

export default MoviePlayer;
