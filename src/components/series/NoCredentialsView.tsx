
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Film, Tv } from "lucide-react";
import { motion } from "framer-motion";

const NoCredentialsView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 max-w-7xl h-dvh flex flex-col">
      <div className="flex items-center mb-4 gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate("/")}
            variant="ghost"
            className="group hover:bg-primary/10 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="ml-2">Back</span>
          </Button>
          
          <h1 className="text-2xl font-bold">TV Series</h1>
        </div>
        
        <Button 
          onClick={() => navigate("/movies")}
          variant="ghost"
          className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-300"
        >
          <Film className="w-5 h-5" />
          <span>Movies</span>
        </Button>
      </div>
      
      <motion.div 
        className="flex flex-col items-center justify-center flex-1 p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
      >
        <p className="text-lg mb-4">No Xtream Codes credentials found</p>
        <p className="text-muted-foreground mb-6">
          Please load a playlist with Xtream Codes credentials to access series
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          Go to Playlist
        </Button>
      </motion.div>
    </div>
  );
};

export default NoCredentialsView;
