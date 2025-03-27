
import React, { useState, useEffect } from "react";
import { Series, SeriesCategory, PaginatedSeries } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { paginateItems } from "@/lib/paginationUtils";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface SeriesListProps {
  seriesCategories: SeriesCategory[] | null;
  selectedSeries: Series | null;
  onSelectSeries: (series: Series) => void;
  isLoading?: boolean;
}

const SeriesList: React.FC<SeriesListProps> = ({
  seriesCategories,
  selectedSeries,
  onSelectSeries,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [paginatedSeries, setPaginatedSeries] = useState<PaginatedSeries>({
    items: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Effect to initialize with the first category when data loads
  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !currentCategory) {
      setCurrentCategory(seriesCategories[0].id);
      
      const initialSeries = paginateItems(
        seriesCategories[0].series,
        1,
        paginatedSeries.itemsPerPage
      );
      
      setPaginatedSeries(initialSeries);
    }
  }, [seriesCategories, currentCategory, paginatedSeries.itemsPerPage]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSearchQuery("");
    
    if (seriesCategories) {
      const category = seriesCategories.find(cat => cat.id === categoryId);
      if (category) {
        const newPaginatedSeries = paginateItems(
          category.series,
          1,
          paginatedSeries.itemsPerPage
        );
        setPaginatedSeries(newPaginatedSeries);
      }
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (seriesCategories) {
      let allSeries: Series[] = [];
      
      if (query.trim()) {
        // Search across all categories
        seriesCategories.forEach(category => {
          allSeries = [
            ...allSeries,
            ...category.series.filter(series =>
              series.name.toLowerCase().includes(query.toLowerCase())
            ),
          ];
        });
      } else if (currentCategory) {
        // Show current category when search is cleared
        const category = seriesCategories.find(cat => cat.id === currentCategory);
        if (category) {
          allSeries = category.series;
        }
      }
      
      const newPaginatedSeries = paginateItems(
        allSeries,
        1,
        paginatedSeries.itemsPerPage
      );
      setPaginatedSeries(newPaginatedSeries);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (seriesCategories) {
      let seriesList: Series[] = [];
      
      if (searchQuery.trim()) {
        // Paginate search results
        seriesCategories.forEach(category => {
          seriesList = [
            ...seriesList,
            ...category.series.filter(series =>
              series.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
          ];
        });
      } else if (currentCategory) {
        // Paginate current category
        const category = seriesCategories.find(cat => cat.id === currentCategory);
        if (category) {
          seriesList = category.series;
        }
      }
      
      const newPaginatedSeries = paginateItems(
        seriesList,
        page,
        paginatedSeries.itemsPerPage
      );
      setPaginatedSeries(newPaginatedSeries);
      
      // Scroll back to top of the container
      document.querySelector('.scroll-area-viewport')?.scrollTo(0, 0);
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
    if (!seriesCategories || seriesCategories.length === 0) {
      return <p className="text-muted-foreground text-center p-4">No series categories available</p>;
    }

    return (
      <TabsList className="w-full mb-4 flex overflow-x-auto">
        {seriesCategories.map(category => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex-shrink-0"
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name} ({category.series.length})
          </TabsTrigger>
        ))}
      </TabsList>
    );
  };

  // Render series list
  const renderSeriesList = () => {
    if (isLoading) {
      return renderSkeletons();
    }

    if (!paginatedSeries.items.length) {
      return (
        <p className="text-muted-foreground text-center p-4">
          {searchQuery ? "No series match your search" : "No series in this category"}
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {paginatedSeries.items.map(series => (
          <Card
            key={series.id}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedSeries?.id === series.id ? "bg-accent border-primary" : ""
            }`}
            onClick={() => onSelectSeries(series)}
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="relative h-16 w-28 flex-shrink-0 bg-muted rounded overflow-hidden">
                {series.logo ? (
                  <img
                    src={series.logo}
                    alt={series.name}
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
                <h3 className="font-medium text-sm truncate">{series.name}</h3>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {series.year && <span>{series.year}</span>}
                  {series.rating && (
                    <>
                      <span>•</span>
                      <span>⭐ {series.rating}</span>
                    </>
                  )}
                </div>
                {series.genre && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {series.genre}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Enhanced Pagination UI */}
        {paginatedSeries.totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(paginatedSeries.currentPage - 1)}
                  className={paginatedSeries.currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(3, paginatedSeries.totalPages) }, (_, i) => {
                // Calculate pages to show (max 3)
                let startPage = Math.max(1, paginatedSeries.currentPage - 1);
                const endPage = Math.min(startPage + 2, paginatedSeries.totalPages);
                
                // Adjust startPage if we're near the end
                if (endPage - startPage < 2) {
                  startPage = Math.max(1, endPage - 2);
                }
                
                const pageNum = startPage + i;
                
                // Don't render beyond total pages
                if (pageNum > paginatedSeries.totalPages) {
                  return null;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      isActive={paginatedSeries.currentPage === pageNum}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(paginatedSeries.currentPage + 1)}
                  className={paginatedSeries.currentPage >= paginatedSeries.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
            placeholder="Search series..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        {seriesCategories && seriesCategories.length > 0 && (
          <Tabs value={currentCategory || ""} className="w-full">
            {renderCategoryTabs()}
          </Tabs>
        )}
      </div>
      
      <ScrollArea className="flex-1 rounded-md border scroll-area-viewport">
        <div className="p-4">
          {renderSeriesList()}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SeriesList;
