
import React from "react";
import { X, Play, Star, Clock, CalendarIcon, Film } from "lucide-react";
import { Movie } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ 
  movie, 
  isOpen, 
  onClose, 
  onPlay 
}) => {
  if (!movie) return null;

  const handlePlayClick = () => {
    onPlay(movie);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-black text-white border border-white/10 shadow-2xl rounded-2xl">
        <AnimatePresence>
          {isOpen && (
            <div className="relative flex flex-col h-full">
              {/* Backdrop image */}
              <div className="relative h-64 md:h-80">
                {movie.backdrop ? (
                  <motion.img
                    src={movie.backdrop}
                    alt={movie.name}
                    className="w-full h-full object-cover opacity-80"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    transition={{ duration: 1.2 }}
                  />
                ) : movie.logo ? (
                  <motion.img
                    src={movie.logo}
                    alt={movie.name}
                    className="w-full h-full object-cover opacity-80"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    transition={{ duration: 1.2 }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
                    <Film className="h-20 w-20 text-white/20" />
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                
                {/* Close button */}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 z-10"
                >
                  <X className="h-5 w-5" />
                </Button>
                
                {/* Movie title section positioned at bottom of backdrop */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.h2 
                    className="text-3xl font-bold mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {movie.name}
                  </motion.h2>
                  
                  {/* Movie metadata badges */}
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {movie.year && (
                      <Badge className="bg-white/10 backdrop-blur-md border-none">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {movie.year}
                      </Badge>
                    )}
                    {movie.duration && (
                      <Badge className="bg-white/10 backdrop-blur-md border-none">
                        <Clock className="mr-1 h-3 w-3" />
                        {movie.duration} min
                      </Badge>
                    )}
                    {movie.rating && (
                      <Badge className="bg-white/10 backdrop-blur-md border-none">
                        <Star className="mr-1 h-3 w-3 text-yellow-400" />
                        {movie.rating}
                      </Badge>
                    )}
                  </motion.div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Genre tags */}
                  {movie.genre && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-sm font-medium mb-2 text-white/70">Genre</h3>
                      <div className="flex flex-wrap gap-2">
                        {movie.genre.split(',').map((genre, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-none">
                            {genre.trim()}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  <Separator className="bg-white/10" />
                  
                  {/* Description */}
                  {movie.description && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="text-sm font-medium mb-2 text-white/70">Description</h3>
                      <p className="text-white/80 leading-relaxed">{movie.description}</p>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Play button section */}
              <motion.div 
                className="p-6 border-t border-white/10 bg-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  onClick={handlePlayClick} 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-white gap-2 py-6 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  <Play className="h-5 w-5" />
                  Watch Now
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailModal;
