
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, MovieCategory, XtreamCredentials } from "@/lib/types";
import { fetchAllMovies, storeMovieForPlayback } from "@/lib/mediaService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/utils";
import Layout from "@/components/Layout";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
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

const Movies = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
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

  if (!credentials) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center min-h-screen">
        <p className="text-lg mb-4">No Xtream Codes credentials found</p>
        <p className="text-muted-foreground mb-6">
          Please load a playlist with Xtream Codes credentials to access movies
        </p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => navigate("/")}
        >
          Go to Playlist
        </button>
      </div>
    );
  }
  
  return (
    <Layout withSidebar fullHeight maxWidth="full" className="bg-black text-white">
      <div className="w-64 border-r border-gray-800 bg-black h-screen flex-shrink-0 overflow-y-auto">
        <div className="flex items-center mb-6 p-4">
          <button 
            onClick={() => navigate("/")}
            className="mr-2 p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">All Movies</h2>
        </div>

        <div className="px-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full bg-gray-800" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {movieCategories?.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      "w-full text-left py-2 px-3 rounded-md text-sm transition-colors hover:bg-gray-800",
                      activeCategory === category.id ? "bg-gray-800 font-medium" : "text-gray-400"
                    )}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-6 flex-shrink-0 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {searchQuery
                ? `Search Results: "${searchQuery}"`
                : activeCategory && movieCategories
                  ? movieCategories.find(c => c.id === activeCategory)?.name || "All Movies"
                  : "All Movies"}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  className="bg-gray-800 border-gray-700 pl-9 text-white w-64 h-9"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <button className="bg-gray-800 p-2 rounded-md">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="sr-only">Filter</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-md bg-gray-800" />
                  <Skeleton className="h-4 w-3/4 rounded bg-gray-800" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {paginatedMovies.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-400">
                    {searchQuery ? "No movies found matching your search" : "No movies available in this category"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                    {paginatedMovies.items.map((movie) => (
                      <div 
                        key={movie.id} 
                        className="group cursor-pointer"
                        onClick={() => handlePlayMovie(movie)}
                      >
                        <div className="aspect-[2/3] relative rounded-md overflow-hidden mb-2 max-w-[140px]">
                          {movie.logo ? (
                            <img
                              src={movie.logo}
                              alt={movie.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <span className="text-gray-500">No Image</span>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
                            <button className="bg-white text-black font-medium mb-4 py-1 px-4 text-sm rounded hover:bg-gray-200 transition-colors">
                              Play
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-xs line-clamp-1">{movie.name}</h3>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          {movie.year && <span>{movie.year}</span>}
                          {movie.duration && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{movie.duration} min</span>
                            </>
                          )}
                          {movie.rating && (
                            <>
                              <span className="mx-1">•</span>
                              <span>⭐ {movie.rating}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {paginatedMovies.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          {paginatedMovies.currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => handlePageChange(paginatedMovies.currentPage - 1)}
                                className="cursor-pointer"
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
                                      className="cursor-pointer"
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
                                      className="cursor-pointer"
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
                                  className="cursor-pointer"
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
                                className="cursor-pointer"
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Movies;
