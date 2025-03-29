
import React from "react";
import { useNavigate } from "react-router-dom";
import { SeriesCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SeriesSidebarProps {
  seriesCategories: SeriesCategory[] | null;
  activeCategory: string | null;
  isLoading: boolean;
  isAdvancedSearch: boolean;
  quickSearch: string;
  filteredSeries: any[];
  onCategoryChange: (categoryId: string) => void;
  onQuickSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearAdvancedSearch: () => void;
}

const SeriesSidebar: React.FC<SeriesSidebarProps> = ({
  seriesCategories,
  activeCategory,
  isLoading,
  isAdvancedSearch,
  quickSearch,
  filteredSeries,
  onCategoryChange,
  onQuickSearchChange,
  clearAdvancedSearch
}) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="w-64 border-r border-white/10 bg-black/60 backdrop-blur-md h-full flex-shrink-0 overflow-y-auto"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div>
        <div className="flex items-center p-4 border-b border-white/10">
          <Button 
            onClick={() => navigate("/")}
            variant="ghost"
            size="icon"
            className="mr-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold">TV Series</h2>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search series..."
              value={quickSearch}
              onChange={onQuickSearchChange}
              className="pl-10 bg-white/5 border-white/10 focus:border-primary/70 focus:ring-primary/40 text-white rounded-lg"
            />
          </div>
          
          {isAdvancedSearch && (
            <motion.div 
              className="mb-4 p-2 bg-white/5 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">
                  {filteredSeries.length} results
                </span>
                <Button
                  onClick={clearAdvancedSearch}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-white transition-colors h-auto py-1"
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
          
          {!isAdvancedSearch && isLoading ? (
            <div className="space-y-3 mt-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-white/5" />
              ))}
            </div>
          ) : !isAdvancedSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-sm font-medium text-gray-400 mb-2">Categories</div>
              <ul className="space-y-1">
                {seriesCategories?.map((category, index) => (
                  <motion.li 
                    key={category.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (index * 0.05) }}
                  >
                    <button
                      onClick={() => onCategoryChange(category.id)}
                      className={cn(
                        "w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all",
                        "hover:bg-white/10",
                        activeCategory === category.id 
                          ? "bg-primary/20 text-primary font-medium" 
                          : "text-gray-400"
                      )}
                    >
                      <span className="truncate">{category.name}</span>
                      <ChevronRight className={cn(
                        "h-4 w-4 transform transition-transform",
                        activeCategory === category.id ? "text-primary rotate-90" : ""
                      )} />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SeriesSidebar;
