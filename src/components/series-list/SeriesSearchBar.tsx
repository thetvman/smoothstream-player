
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SeriesSearchBarProps {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SeriesSearchBar: React.FC<SeriesSearchBarProps> = ({ 
  searchQuery, 
  onSearch 
}) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-400 rounded-lg"
        placeholder="Search series..."
        value={searchQuery}
        onChange={onSearch}
      />
    </div>
  );
};

export default SeriesSearchBar;
