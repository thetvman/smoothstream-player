
import React from "react";
import { Tv } from "lucide-react";

const NoSeriesSelected: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Tv className="h-16 w-16 text-white/20 mb-4" />
      <h3 className="text-xl font-medium mb-2">No Series Selected</h3>
      <p className="text-gray-400">
        Select a series from the list to see details and episodes
      </p>
    </div>
  );
};

export default NoSeriesSelected;
