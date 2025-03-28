
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdvancedSearchParams {
  title: string;
  genre: string;
  yearFrom: number;
  yearTo: number;
  ratingMin: number;
}

interface AdvancedSearchProps {
  onSearch: (params: AdvancedSearchParams) => void;
  initialParams?: Partial<AdvancedSearchParams>;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  initialParams,
  className,
}) => {
  const currentYear = new Date().getFullYear();
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState<AdvancedSearchParams>({
    title: initialParams?.title || "",
    genre: initialParams?.genre || "",
    yearFrom: initialParams?.yearFrom || 1950,
    yearTo: initialParams?.yearTo || currentYear,
    ratingMin: initialParams?.ratingMin || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleYearFromChange = (value: number[]) => {
    setParams((prev) => ({ ...prev, yearFrom: value[0] }));
  };

  const handleYearToChange = (value: number[]) => {
    setParams((prev) => ({ ...prev, yearTo: value[0] }));
  };

  const handleRatingChange = (value: number[]) => {
    setParams((prev) => ({ ...prev, ratingMin: value[0] }));
  };

  const handleReset = () => {
    setParams({
      title: "",
      genre: "",
      yearFrom: 1950,
      yearTo: currentYear,
      ratingMin: 0,
    });
  };

  const handleSubmit = () => {
    onSearch(params);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn("flex items-center gap-2", className)}
        >
          <Filter className="h-4 w-4" />
          <span>Advanced Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Search by title..."
              value={params.title}
              onChange={handleInputChange}
              className="transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="genre" className="text-sm font-medium">
              Genre
            </label>
            <Input
              id="genre"
              name="genre"
              placeholder="Action, Comedy, Drama..."
              value={params.genre}
              onChange={handleInputChange}
              className="transition-all"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Year Range</label>
              <span className="text-sm text-muted-foreground">
                {params.yearFrom} - {params.yearTo}
              </span>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From</label>
                <Slider
                  value={[params.yearFrom]}
                  min={1950}
                  max={currentYear}
                  step={1}
                  onValueChange={handleYearFromChange}
                  className="transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To</label>
                <Slider
                  value={[params.yearTo]}
                  min={1950}
                  max={currentYear}
                  step={1}
                  onValueChange={handleYearToChange}
                  className="transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Minimum Rating</label>
              <span className="text-sm text-muted-foreground">{params.ratingMin} / 10</span>
            </div>
            <Slider
              value={[params.ratingMin]}
              min={0}
              max={10}
              step={0.5}
              onValueChange={handleRatingChange}
              className="transition-all"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={handleReset}
              className="transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <DialogClose asChild>
              <Button type="button" onClick={handleSubmit} className="transition-colors">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearch;
