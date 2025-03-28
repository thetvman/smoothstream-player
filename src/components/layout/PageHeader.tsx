
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import EPGSettings from "@/components/EPGSettings";
import NavigationBar from "@/components/layout/NavigationBar";

interface PageHeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const PageHeader = ({ isDarkMode, toggleDarkMode }: PageHeaderProps) => {
  return (
    <header className="flex flex-col space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Stream Player</h1>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <EPGSettings />
          <NavigationBar />
        </div>
      </div>
      <p className="text-muted-foreground">Watch your IPTV streams with a premium experience</p>
    </header>
  );
};

export default PageHeader;
