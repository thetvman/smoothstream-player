
import React from "react";
import { SeriesCategory } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SeriesCategoryTabsProps {
  seriesCategories: SeriesCategory[] | null;
  currentCategory: string | null;
  onCategoryChange: (categoryId: string) => void;
}

const SeriesCategoryTabs: React.FC<SeriesCategoryTabsProps> = ({
  seriesCategories,
  currentCategory,
  onCategoryChange,
}) => {
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
          onClick={() => onCategoryChange(category.id)}
        >
          {category.name} ({category.series.length})
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default SeriesCategoryTabs;
