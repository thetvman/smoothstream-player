
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Tv, Film, Radio } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const NavBar = () => {
  const location = useLocation();
  
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === "/" && "bg-accent text-accent-foreground"
                  )}
                >
                  <Radio className="mr-2 h-4 w-4" />
                  Live TV
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/movies">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === "/movies" && "bg-accent text-accent-foreground"
                  )}
                >
                  <Tv className="mr-2 h-4 w-4" />
                  Movies
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/tv-series">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === "/tv-series" && "bg-accent text-accent-foreground"
                  )}
                >
                  <Film className="mr-2 h-4 w-4" />
                  TV Series
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default NavBar;
