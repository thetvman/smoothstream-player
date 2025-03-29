
import React from "react";
import { Series } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface SeriesItemProps {
  series: Series;
  isSelected: boolean;
  onSelect: (series: Series) => void;
}

const SeriesItem: React.FC<SeriesItemProps> = ({
  series,
  isSelected,
  onSelect,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      } overflow-hidden bg-black/30 border-0`}
      onClick={() => onSelect(series)}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
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
          <div className="h-full w-full flex items-center justify-center bg-black/50">
            <span className="text-xs text-muted-foreground">No Image</span>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate text-white">{series.name}</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
          {series.year && <span>{series.year}</span>}
          {series.rating && (
            <>
              <span>•</span>
              <span>⭐ {series.rating}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeriesItem;
