
import React from "react";
import { useNavigate } from "react-router-dom";
import { Film, Tv, BarChart2 } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const NavigationBar = () => {
  const navigate = useNavigate();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink 
            className={navigationMenuTriggerStyle()}
            onClick={() => navigate('/movies')}
          >
            <Film className="mr-2 h-4 w-4" />
            Movies
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink 
            className={navigationMenuTriggerStyle()}
            onClick={() => navigate('/series')}
          >
            <Tv className="mr-2 h-4 w-4" />
            Series
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink 
            className={navigationMenuTriggerStyle()}
            onClick={() => navigate('/connections')}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Connections
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavigationBar;
