
import { useState, useEffect } from "react";
import { Series, SeriesCategory, XtreamCredentials, AdvancedSearchParams } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchAllSeries, fetchSeriesWithEpisodes, clearOldSeriesData } from "@/lib/mediaService";
import { paginateItems } from "@/lib/paginationUtils";

const ITEMS_PER_PAGE = 12;

export const useSeriesState = () => {
  // Core states
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [featuredSeries, setFeaturedSeries] = useState<Series | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search states
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>({
    title: "",
    genre: "",
    yearFrom: 1950,
    yearTo: new Date().getFullYear(),
    ratingMin: 0
  });
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  
  const getCredentials = (): XtreamCredentials | null => {
    const playlist = localStorage.getItem("iptv-playlist");
    if (!playlist) return null;
    
    const parsedPlaylist = safeJsonParse(playlist, null);
    return parsedPlaylist?.credentials || null;
  };
  
  const credentials = getCredentials();
  
  // Fetch series data
  const { data: seriesCategories, isLoading, error } = useQuery({
    queryKey: ["series", credentials?.server],
    queryFn: async () => {
      if (!credentials) {
        throw new Error("No Xtream credentials found");
      }
      return fetchAllSeries(credentials);
    },
    enabled: !!credentials,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Initialize active category when data loads
  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !activeCategory) {
      setActiveCategory(seriesCategories[0].id);
    }
  }, [seriesCategories, activeCategory]);
  
  // Set featured series when data loads
  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !featuredSeries) {
      const categoriesWithSeries = seriesCategories.filter(cat => cat.series.length > 0);
      if (categoriesWithSeries.length > 0) {
        const randomCategory = categoriesWithSeries[Math.floor(Math.random() * categoriesWithSeries.length)];
        if (randomCategory && randomCategory.series.length > 0) {
          const randomSeries = randomCategory.series[Math.floor(Math.random() * randomCategory.series.length)];
          setFeaturedSeries(randomSeries);
        }
      }
    }
  }, [seriesCategories, featuredSeries]);
  
  // Clear old series data on mount
  useEffect(() => {
    clearOldSeriesData();
  }, []);
  
  // Handle series selection
  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
  };
  
  // Load seasons for a series
  const handleLoadSeasons = async (series: Series) => {
    if (!credentials) {
      return null;
    }
    
    try {
      const updatedSeries = await fetchSeriesWithEpisodes(credentials, series);
      return updatedSeries;
    } catch (error) {
      console.error("Error loading series episodes:", error);
      throw error;
    }
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentPage(1); // Reset to first page when changing categories
  };
  
  // Get recommended/suggested series
  const getSuggestedSeries = (): Series[] => {
    if (!seriesCategories) return [];
    
    const allSeries: Series[] = [];
    seriesCategories.forEach(category => {
      allSeries.push(...category.series);
    });
    
    const filteredSeries = allSeries.filter(series => series.id !== selectedSeries?.id);
    const shuffled = [...filteredSeries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  };
  
  // Handle search
  const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setQuickSearch(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
    
    if (!searchTerm.trim()) {
      setIsAdvancedSearch(false);
      return;
    }
    
    if (!seriesCategories) return;
    
    setIsAdvancedSearch(true);
    
    let results: Series[] = [];
    seriesCategories.forEach(category => {
      results = [...results, ...category.series];
    });
    
    results = results.filter(series => 
      series.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredSeries(results);
  };
  
  const clearAdvancedSearch = () => {
    setIsAdvancedSearch(false);
    setQuickSearch("");
    setCurrentPage(1);
    setSearchParams({
      title: "",
      genre: "",
      yearFrom: 1950,
      yearTo: new Date().getFullYear(),
      ratingMin: 0
    });
  };
  
  // Get current series based on active category or search
  const getCurrentSeries = () => {
    if (isAdvancedSearch) {
      return filteredSeries;
    } else if (activeCategory && seriesCategories) {
      const category = seriesCategories.find(cat => cat.id === activeCategory);
      return category?.series || [];
    }
    return [];
  };

  // Get paginated series
  const getPaginatedSeries = () => {
    const currentSeries = getCurrentSeries();
    return paginateItems(currentSeries, currentPage, ITEMS_PER_PAGE);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return {
    seriesCategories,
    selectedSeries,
    activeCategory,
    featuredSeries,
    isLoading,
    error,
    filteredSeries,
    isAdvancedSearch,
    quickSearch,
    currentPage,
    credentials,
    getPaginatedSeries,
    handleSelectSeries,
    setSelectedSeries,
    handleLoadSeasons,
    handleCategoryChange,
    getSuggestedSeries,
    handleQuickSearch,
    clearAdvancedSearch,
    handlePageChange,
  };
};
