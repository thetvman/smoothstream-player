
import React from "react";
import { Series } from "@/lib/types";
import SeriesItem from "./SeriesItem";
import SeriesListSkeleton from "./SeriesListSkeleton";

interface SeriesListItemsProps {
  items: Series[];
  selectedSeries: Series | null;
  onSelectSeries: (series: Series) => void;
  isLoading: boolean;
  searchQuery: string;
}

const SeriesListItems: React.FC<SeriesListItemsProps> = ({
  items,
  selectedSeries,
  onSelectSeries,
  isLoading,
  searchQuery,
}) => {
  if (isLoading) {
    return <SeriesListSkeleton />;
  }

  if (!items.length) {
    return (
      <p className="text-muted-foreground text-center p-4">
        {searchQuery ? "No series match your search" : "No series in this category"}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map(series => (
        <SeriesItem
          key={series.id}
          series={series}
          isSelected={selectedSeries?.id === series.id}
          onSelect={onSelectSeries}
        />
      ))}
    </div>
  );
};

export default SeriesListItems;
