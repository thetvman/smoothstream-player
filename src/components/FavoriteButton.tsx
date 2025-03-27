
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toggleFavoriteChannel, isChannelFavorite } from '@/lib/profileService';
import { Channel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  channel: Channel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconOnly?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  channel, 
  size = 'md', 
  className = '',
  iconOnly = false
}) => {
  const [isFavorite, setIsFavorite] = React.useState(false);
  
  // Check favorite status on mount
  React.useEffect(() => {
    setIsFavorite(isChannelFavorite(channel.id));
  }, [channel.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await toggleFavoriteChannel(channel.id, channel.name, channel.logo);
    setIsFavorite(result);
  };

  // Size mappings
  const sizeClasses = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };
  
  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("rounded-full", className)}
        onClick={handleToggleFavorite}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart 
          className={cn(
            iconSizes[size], 
            isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
          )} 
        />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(sizeClasses[size], className)}
      onClick={handleToggleFavorite}
    >
      <Heart 
        className={cn(
          "mr-1", 
          iconSizes[size], 
          isFavorite ? "fill-red-500 text-red-500" : ""
        )} 
      />
      {isFavorite ? "Favorited" : "Favorite"}
    </Button>
  );
};

export default FavoriteButton;
