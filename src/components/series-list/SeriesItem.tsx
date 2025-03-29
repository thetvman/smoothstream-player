
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
      className={`cursor-pointer transition-colors hover:bg-accent ${
        isSelected ? "bg-accent border-primary" : ""
      }`}
      onClick={() => onSelect(series)}
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
  );
};

export default SeriesItem;
