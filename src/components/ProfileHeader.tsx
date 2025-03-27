
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/context/ProfileContext";
import { UserRound, Settings, Heart, Clock, LogOut, User, Moon, Sun } from "lucide-react";

const ProfileHeader = () => {
  const navigate = useNavigate();
  const { profile, isLoading, updateUserPreferences, signOut } = useProfile();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const toggleTheme = () => {
    if (!profile) return;
    
    const newTheme = profile.preferences.theme === 'dark' ? 'light' : 'dark';
    updateUserPreferences({ theme: newTheme });
    
    // Apply theme change immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0">
        <span className="sr-only">Loading profile</span>
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  if (!profile) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/profile")}
        className="flex items-center gap-1"
      >
        <UserRound className="h-4 w-4 mr-1" />
        Sign In
      </Button>
    );
  }

  const isDarkMode = profile.preferences.theme === 'dark';

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme}
        className="h-8 w-8 rounded-full"
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar} alt={profile.username} />
              <AvatarFallback>
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.username}</p>
              {profile.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {profile.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/favorites")}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Favorites</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/history")}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Watch History</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileHeader;
