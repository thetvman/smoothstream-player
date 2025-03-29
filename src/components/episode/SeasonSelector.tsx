
import React from "react";
import { Season } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SeasonSelectorProps {
  seasons: Season[];
  activeSeason: string;
  onSeasonChange: (seasonNumber: string) => void;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  activeSeason,
  onSeasonChange,
}) => {
  const sortedSeasons = [...seasons].sort(
    (a, b) => parseInt(a.season_number) - parseInt(b.season_number)
  );

  return (
    <div className="flex items-center gap-2">
      <Select value={activeSeason} onValueChange={onSeasonChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Season" />
        </SelectTrigger>
        <SelectContent>
          {sortedSeasons.map((season) => (
            <SelectItem key={season.id} value={season.season_number}>
              {season.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SeasonSelector;
