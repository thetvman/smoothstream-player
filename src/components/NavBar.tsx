
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Tv, Film, Clapperboard, RefreshCw, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavBarProps {
  onRefresh?: () => void;
  onLogout?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  onRefresh = () => window.location.reload(),
  onLogout = () => localStorage.removeItem("iptv-playlist")
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="w-full bg-card shadow-md">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <span className="text-white">Harmony<span className="text-primary">IPTV</span></span>
        </Link>
        
        {/* Main Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={cn("nav-link", isActive("/") && "nav-link-active")}>
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link to="/" className={cn("nav-link", isActive("/browse") && "nav-link-active")}>
            <LayoutGrid className="w-4 h-4" />
            <span>Browse</span>
          </Link>
          <Link to="/" className={cn("nav-link", isActive("/") && !isActive("/movies") && !isActive("/series") && "nav-link-active")}>
            <Tv className="w-4 h-4" />
            <span>Live TV</span>
          </Link>
          <Link to="/movies" className={cn("nav-link", isActive("/movies") && "nav-link-active")}>
            <Film className="w-4 h-4" />
            <span>Movies</span>
          </Link>
          <Link to="/series" className={cn("nav-link", isActive("/series") && "nav-link-active")}>
            <Clapperboard className="w-4 h-4" />
            <span>Series</span>
          </Link>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onRefresh}
            className="btn-icon px-3 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={onLogout}
            className="btn-icon bg-destructive hover:bg-destructive/90 px-3 py-2"
          >
            <LogOut className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-around py-2 bg-card border-t border-border">
        <Link to="/" className={cn("flex flex-col items-center text-xs p-1", isActive("/") && !isActive("/movies") && !isActive("/series") && "text-primary")}>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link to="/" className={cn("flex flex-col items-center text-xs p-1", isActive("/browse") && "text-primary")}>
          <LayoutGrid className="w-5 h-5" />
          <span>Browse</span>
        </Link>
        <Link to="/movies" className={cn("flex flex-col items-center text-xs p-1", isActive("/movies") && "text-primary")}>
          <Film className="w-5 h-5" />
          <span>Movies</span>
        </Link>
        <Link to="/series" className={cn("flex flex-col items-center text-xs p-1", isActive("/series") && "text-primary")}>
          <Clapperboard className="w-5 h-5" />
          <span>Series</span>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
