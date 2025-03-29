
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, MovieCategory, XtreamCredentials } from "@/lib/types";
import { fetchAllMovies, storeMovieForPlayback } from "@/lib/mediaService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/utils";
import Layout from "@/components/Layout";
import { ArrowLeft, Search, Film, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import MovieDetailModal from "@/components/MovieDetailModal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { paginateItems } from "@/lib/paginationUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Movies = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allMoviesInCategory, setAllMoviesInCategory] = useState<Movie[]>([]);
  const [paginatedMovies, setPaginatedMovies] = useState<{
    items: Movie[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }>({
    items: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 24,
  });
  
  const getCredentials = (): XtreamCredentials | null => {
    const playlist = localStorage.getItem("iptv-playlist");
    if (!playlist) return null;
    
    const parsedPlaylist = safeJsonParse(playlist, null);
    return parsedPlaylist?.credentials || null;
  };
  
  const credentials = getCredentials();
  
  const { data: movieCategories, isLoading, error } = useQuery({
    queryKey: ["movies", credentials?.server],
    queryFn: async () => {
      if (!credentials) {
        throw new Error("No Xtream credentials found");
      }
      return fetchAllMovies(credentials);
    },
    enabled: !!credentials,
    staleTime: 5 * 60 * 1000,
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to load movies: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, [error]);

  useEffect(() => {
    if (movieCategories && movieCategories.length > 0) {
      if (!activeCategory) {
        setActiveCategory(movieCategories[0].id);
        setAllMoviesInCategory(movieCategories[0].movies);
        
        const paginated = paginateItems(
          movieCategories[0].movies,
          1,
          paginatedMovies.itemsPerPage
        );
        setPaginatedMovies(paginated);
      }
    }
  }, [movieCategories]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    
    if (movieCategories) {
      const category = movieCategories.find(cat => cat.id === categoryId);
      if (category) {
        setAllMoviesInCategory(category.movies);
        
        const paginated = paginateItems(
          category.movies,
          1,
          paginatedMovies.itemsPerPage
        );
        setPaginatedMovies(paginated);
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (movieCategories) {
      if (query.trim()) {
        let results: Movie[] = [];
        movieCategories.forEach(category => {
          results = [
            ...results,
            ...category.movies.filter(movie =>
              movie.name.toLowerCase().includes(query.toLowerCase())
            ),
          ];
        });
        setAllMoviesInCategory(results);
        
        const paginated = paginateItems(
          results,
          1,
          paginatedMovies.itemsPerPage
        );
        setPaginatedMovies(paginated);
      } else if (activeCategory) {
        const category = movieCategories.find(cat => cat.id === activeCategory);
        if (category) {
          setAllMoviesInCategory(category.movies);
          
          const paginated = paginateItems(
            category.movies,
            1,
            paginatedMovies.itemsPerPage
          );
          setPaginatedMovies(paginated);
        }
      }
    }
  };
  
  const handlePageChange = (page: number) => {
    const paginated = paginateItems(
      allMoviesInCategory,
      page,
      paginatedMovies.itemsPerPage
    );
    setPaginatedMovies(paginated);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handlePlayMovie = (movie: Movie) => {
    if (!movie) {
      toast.error("No movie selected");
      return;
    }
    
    try {
      storeMovieForPlayback(movie);
      navigate(`/movie/${movie.id}`);
    } catch (error) {
      console.error("Error preparing movie for playback:", error);
      toast.error("Failed to prepare movie for playback");
    }
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (!credentials) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center min-h-screen bg-black text-white">
        <div className="mb-6 p-8 rounded-lg bg-black/40 backdrop-blur-lg border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <Film className="w-16 h-16 mx-auto mb-4 text-primary/80" />
          <p className="text-2xl font-bold mb-4">No Credentials Found</p>
          <p className="text-gray-400 mb-6">
            Please load a playlist with Xtream Codes credentials to access movies
          </p>
          <Button
            className="px-6 py-6 bg-primary/90 hover:bg-primary text-white rounded-md font-medium text-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
            onClick={() => navigate("/")}
          >
            Go to Playlist
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Layout className="p-0 m-0 max-w-none bg-black/95 text-white">
      <MovieDetailModal 
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlay={handlePlayMovie}
      />
      
      <div className="flex flex-col min-h-screen">
        {/* Header with glassmorphism effect */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/80 border-b border-white/10 shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/")}
                  className="rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Movies
                </h1>
              </div>
              
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  className="bg-white/5 border-white/10 pl-9 text-white w-full rounded-full focus:ring-primary"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories sidebar with glassmorphism */}
          <div className="hidden md:block w-64 overflow-y-auto p-4 backdrop-blur-md bg-black/40 border-r border-white/10">
            <h2 className="text-lg font-medium mb-4 text-white/80">Categories</h2>
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="space-y-1 pr-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full bg-white/5" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {movieCategories?.map((category) => (
                      <motion.button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={cn(
                          "w-full text-left py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/10 flex justify-between items-center",
                          activeCategory === category.id 
                            ? "bg-white/10 border-l-4 border-primary" 
                            : "border-l-4 border-transparent text-gray-400"
                        )}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-medium truncate">{category.name}</span>
                        <Badge variant="outline" className="bg-white/5">
                          {category.movies.length}
                        </Badge>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {searchQuery
                    ? `Search: "${searchQuery}"`
                    : activeCategory && movieCategories
                      ? movieCategories.find(c => c.id === activeCategory)?.name || "All Movies"
                      : "All Movies"}
                </h2>
                
                {/* Mobile categories dropdown would go here */}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[2/3] w-full rounded-xl bg-white/5" />
                      <Skeleton className="h-5 w-3/4 rounded bg-white/5" />
                      <Skeleton className="h-4 w-2/4 rounded bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : paginatedMovies.items.length === 0 ? (
                <div className="text-center py-16 my-16">
                  <Film className="h-20 w-20 mx-auto mb-4 text-white/20" />
                  <p className="text-xl text-white/60">
                    {searchQuery ? "No movies found matching your search" : "No movies available in this category"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {paginatedMovies.items.map((movie, index) => (
                      <motion.div 
                        key={movie.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(0.05 * (index % 12), 0.5) }}
                        className="group relative"
                        onClick={() => handleMovieClick(movie)}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-black/40 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                          {movie.logo ? (
                            <img
                              src={movie.logo}
                              alt={movie.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/60">
                              <Film className="h-16 w-16 text-white/30" />
                            </div>
                          )}
                          
                          {/* Movie overlay with gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className="font-medium text-white line-clamp-1 text-sm group-hover:text-lg transition-all duration-300">
                                {movie.name}
                              </h3>
                              <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
                                {movie.year && <span>{movie.year}</span>}
                                {movie.rating && (
                                  <span className="flex items-center">
                                    <span className="text-yellow-400 mr-1">★</span> 
                                    {movie.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Play button that appears on hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <motion.div 
                              className="bg-primary/80 text-white p-3 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Play className="h-8 w-8" />
                            </motion.div>
                          </div>
                          
                          {/* Genre badge */}
                          {movie.genre && (
                            <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              {movie.genre.split(',').slice(0, 2).map((genre, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-black/60 backdrop-blur-md">
                                  {genre.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {paginatedMovies.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          {paginatedMovies.currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => handlePageChange(paginatedMovies.currentPage - 1)}
                                className="cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                              />
                            </PaginationItem>
                          )}
                          
                          {Array.from({ length: Math.min(5, paginatedMovies.totalPages) }).map((_, i) => {
                            let pageNumber: number;
                            
                            if (paginatedMovies.totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (paginatedMovies.currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (paginatedMovies.currentPage >= paginatedMovies.totalPages - 2) {
                              pageNumber = paginatedMovies.totalPages - 4 + i;
                            } else {
                              pageNumber = paginatedMovies.currentPage - 2 + i;
                            }
                            
                            if (i === 0 && pageNumber > 1) {
                              return (
                                <React.Fragment key={`start-${pageNumber}`}>
                                  <PaginationItem>
                                    <PaginationLink 
                                      onClick={() => handlePageChange(1)}
                                      className="cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                      1
                                    </PaginationLink>
                                  </PaginationItem>
                                  {pageNumber > 2 && (
                                    <PaginationItem>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  )}
                                </React.Fragment>
                              );
                            }
                            
                            if (i === 4 && pageNumber < paginatedMovies.totalPages) {
                              return (
                                <React.Fragment key={`end-${pageNumber}`}>
                                  {pageNumber < paginatedMovies.totalPages - 1 && (
                                    <PaginationItem>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  )}
                                  <PaginationItem>
                                    <PaginationLink 
                                      onClick={() => handlePageChange(paginatedMovies.totalPages)}
                                      className="cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                      {paginatedMovies.totalPages}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              );
                            }
                            
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink 
                                  isActive={pageNumber === paginatedMovies.currentPage}
                                  onClick={() => handlePageChange(pageNumber)}
                                  className={cn(
                                    "cursor-pointer transition-colors",
                                    pageNumber === paginatedMovies.currentPage 
                                      ? "bg-primary text-white" 
                                      : "bg-white/5 hover:bg-white/10"
                                  )}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          {paginatedMovies.currentPage < paginatedMovies.totalPages && (
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => handlePageChange(paginatedMovies.currentPage + 1)}
                                className="cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Movies;
