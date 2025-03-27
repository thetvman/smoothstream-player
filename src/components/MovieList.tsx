
import React, { useState } from "react";
import { Movie, MovieCategory, PaginatedMovies } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { paginateItems } from "@/lib/paginationUtils";

interface MovieListProps {
  movieCategories: MovieCategory[] | null;
  selectedMovie: Movie | null;
  onSelectMovie: (movie: Movie) => void;
  isLoading?: boolean;
}

const MovieList: React.FC<MovieListProps> = ({
  movieCategories,
  selectedMovie,
  onSelectMovie,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [paginatedMovies, setPaginatedMovies] = useState<PaginatedMovies>({
    items: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Effect to initialize with the first category when data loads
  React.useEffect(() => {
    if (movieCategories && movieCategories.length > 0 && !currentCategory) {
      setCurrentCategory(movieCategories[0].id);
      
      const initialMovies = paginateItems(
        movieCategories[0].movies,
        1,
        paginatedMovies.itemsPerPage
      );
      
      setPaginatedMovies(initialMovies);
    }
  }, [movieCategories, currentCategory, paginatedMovies.itemsPerPage]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSearchQuery("");
    
    if (movieCategories) {
      const category = movieCategories.find(cat => cat.id === categoryId);
      if (category) {
        const newPaginatedMovies = paginateItems(
          category.movies,
          1,
          paginatedMovies.itemsPerPage
        );
        setPaginatedMovies(newPaginatedMovies);
      }
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (movieCategories) {
      let allMovies: Movie[] = [];
      
      if (query.trim()) {
        // Search across all categories
        movieCategories.forEach(category => {
          allMovies = [
            ...allMovies,
            ...category.movies.filter(movie =>
              movie.name.toLowerCase().includes(query.toLowerCase())
            ),
          ];
        });
      } else if (currentCategory) {
        // Show current category when search is cleared
        const category = movieCategories.find(cat => cat.id === currentCategory);
        if (category) {
          allMovies = category.movies;
        }
      }
      
      const newPaginatedMovies = paginateItems(
        allMovies,
        1,
        paginatedMovies.itemsPerPage
      );
      setPaginatedMovies(newPaginatedMovies);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (movieCategories) {
      let movies: Movie[] = [];
      
      if (searchQuery.trim()) {
        // Paginate search results
        movieCategories.forEach(category => {
          movies = [
            ...movies,
            ...category.movies.filter(movie =>
              movie.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
          ];
        });
      } else if (currentCategory) {
        // Paginate current category
        const category = movieCategories.find(cat => cat.id === currentCategory);
        if (category) {
          movies = category.movies;
        }
      }
      
      const newPaginatedMovies = paginateItems(
        movies,
        page,
        paginatedMovies.itemsPerPage
      );
      setPaginatedMovies(newPaginatedMovies);
    }
  };

  // Create loading skeletons
  const renderSkeletons = () => (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex space-x-3 items-center p-2">
          <Skeleton className="h-12 w-20 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  // Create categories tabs
  const renderCategoryTabs = () => {
    if (!movieCategories || movieCategories.length === 0) {
      return <p className="text-muted-foreground text-center p-4">No movie categories available</p>;
    }

    return (
      <TabsList className="w-full mb-4 flex overflow-x-auto">
        {movieCategories.map(category => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex-shrink-0"
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name} ({category.movies.length})
          </TabsTrigger>
        ))}
      </TabsList>
    );
  };

  // Render movie list
  const renderMovieList = () => {
    if (isLoading) {
      return renderSkeletons();
    }

    if (!paginatedMovies.items.length) {
      return (
        <p className="text-muted-foreground text-center p-4">
          {searchQuery ? "No movies match your search" : "No movies in this category"}
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {paginatedMovies.items.map(movie => (
          <Card
            key={movie.id}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedMovie?.id === movie.id ? "bg-accent border-primary" : ""
            }`}
            onClick={() => onSelectMovie(movie)}
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="relative h-16 w-28 flex-shrink-0 bg-muted rounded overflow-hidden">
                {movie.logo ? (
                  <img
                    src={movie.logo}
                    alt={movie.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <span className="text-xs text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{movie.name}</h3>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {movie.year && <span>{movie.year}</span>}
                  {movie.duration && (
                    <>
                      <span>•</span>
                      <span>{movie.duration} min</span>
                    </>
                  )}
                  {movie.rating && (
                    <>
                      <span>•</span>
                      <span>⭐ {movie.rating}</span>
                    </>
                  )}
                </div>
                {movie.genre && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {movie.genre}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        {paginatedMovies.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              className="px-3 py-1 rounded bg-secondary text-secondary-foreground text-sm disabled:opacity-50"
              disabled={paginatedMovies.currentPage === 1}
              onClick={() => handlePageChange(paginatedMovies.currentPage - 1)}
            >
              Previous
            </button>
            <span className="text-sm">
              Page {paginatedMovies.currentPage} of {paginatedMovies.totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-secondary text-secondary-foreground text-sm disabled:opacity-50"
              disabled={paginatedMovies.currentPage === paginatedMovies.totalPages}
              onClick={() => handlePageChange(paginatedMovies.currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            className="pl-9"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        {movieCategories && movieCategories.length > 0 && (
          <Tabs value={currentCategory || ""} className="w-full">
            {renderCategoryTabs()}
          </Tabs>
        )}
      </div>
      
      <ScrollArea className="flex-1 rounded-md border">
        <div className="p-4">
          {renderMovieList()}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MovieList;
