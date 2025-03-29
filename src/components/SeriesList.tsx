
import React, { useState, useEffect } from "react";
import { Series, SeriesCategory, PaginatedSeries } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs } from "@/components/ui/tabs";
import { paginateItems, ITEMS_PER_PAGE } from "@/lib/paginationUtils";

// Import refactored components
import SeriesSearchBar from "./series-list/SeriesSearchBar";
import SeriesCategoryTabs from "./series-list/SeriesCategoryTabs";
import SeriesListItems from "./series-list/SeriesListItems";
import SeriesListPagination from "./series-list/SeriesListPagination";

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
    itemsPerPage: ITEMS_PER_PAGE,
  });

  // Effect to initialize with the first category when data loads
  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !currentCategory) {
      setCurrentCategory(seriesCategories[0].id);
      
      const initialSeries = paginateItems(
        seriesCategories[0].series,
        1,
        ITEMS_PER_PAGE
      );
      
      setPaginatedSeries(initialSeries);
    }
  }, [seriesCategories, currentCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSearchQuery("");
    
    if (seriesCategories) {
      const category = seriesCategories.find(cat => cat.id === categoryId);
      if (category) {
        console.log(`Changing to category: ${categoryId} with ${category.series.length} series`);
        const newPaginatedSeries = paginateItems(
          category.series,
          1,
          ITEMS_PER_PAGE
        );
        console.log(`Paginated series: ${newPaginatedSeries.items.length}/${newPaginatedSeries.totalItems} items, page ${newPaginatedSeries.currentPage}/${newPaginatedSeries.totalPages}`);
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
      
      console.log(`Search query: "${query}", found ${allSeries.length} series`);
      const newPaginatedSeries = paginateItems(
        allSeries,
        1,
        ITEMS_PER_PAGE
      );
      console.log(`Search results: ${newPaginatedSeries.items.length}/${newPaginatedSeries.totalItems} items, page ${newPaginatedSeries.currentPage}/${newPaginatedSeries.totalPages}`);
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
      
      console.log(`Changing to page ${page}, total series: ${seriesList.length}`);
      const newPaginatedSeries = paginateItems(
        seriesList,
        page,
        ITEMS_PER_PAGE
      );
      console.log(`Page ${page} results: ${newPaginatedSeries.items.length}/${newPaginatedSeries.totalItems} items, page ${newPaginatedSeries.currentPage}/${newPaginatedSeries.totalPages}`);
      setPaginatedSeries(newPaginatedSeries);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4">
        <SeriesSearchBar 
          searchQuery={searchQuery} 
          onSearch={handleSearch} 
        />
        
        {seriesCategories && seriesCategories.length > 0 && (
          <Tabs value={currentCategory || ""} className="w-full">
            <SeriesCategoryTabs 
              seriesCategories={seriesCategories}
              currentCategory={currentCategory}
              onCategoryChange={handleCategoryChange}
            />
          </Tabs>
        )}
      </div>
      
      <ScrollArea className="flex-1 rounded-md border">
        <div className="p-4">
          <SeriesListItems 
            items={paginatedSeries.items}
            selectedSeries={selectedSeries}
            onSelectSeries={onSelectSeries}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
          
          {/* Pagination */}
          <SeriesListPagination 
            paginatedSeries={paginatedSeries}
            onPageChange={handlePageChange}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default SeriesList;
