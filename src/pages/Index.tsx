
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Film, Tv2 } from "lucide-react";
import LiveTVPlayer from "@/components/LiveTVPlayer";

const Index = () => {
  const navigate = useNavigate();
  
  const goToMovies = () => {
    navigate("/movies");
  };
  
  const goToSeries = () => {
    navigate("/series");
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-7xl">
        <section className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold tv-gradient-text mb-2">Welcome to Harmony</h1>
          
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="w-full max-w-md grid grid-cols-3 mb-6">
              <TabsTrigger value="live">
                <Tv2 className="mr-2 h-4 w-4" />
                Live TV
              </TabsTrigger>
              <TabsTrigger value="movies">
                <Film className="mr-2 h-4 w-4" />
                Movies
              </TabsTrigger>
              <TabsTrigger value="series">
                <PlayCircle className="mr-2 h-4 w-4" />
                Series
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="live" className="mt-4">
              <div className="animate-fade-in">
                <LiveTVPlayer />
              </div>
            </TabsContent>
            
            <TabsContent value="movies" className="mt-4">
              <Card className="border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl">Movies Library</CardTitle>
                  <CardDescription>Browse and watch movies on demand</CardDescription>
                </CardHeader>
                <CardContent className="pb-1">
                  <div className="aspect-[21/9] bg-gradient-to-br from-card/40 to-background/40 rounded-xl overflow-hidden border border-border/40 flex items-center justify-center shadow-inner">
                    <div className="text-center p-6">
                      <Film className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">Discover Movies</h3>
                      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                        Browse our collection of movies from different genres
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-primary text-white hover:bg-primary/90"
                        onClick={goToMovies}
                      >
                        Explore Movies
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <p className="text-sm text-muted-foreground">
                    Your on-demand movie watching experience starts here.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="series" className="mt-4">
              <Card className="border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl">TV Series</CardTitle>
                  <CardDescription>Watch your favorite TV shows</CardDescription>
                </CardHeader>
                <CardContent className="pb-1">
                  <div className="aspect-[21/9] bg-gradient-to-br from-card/40 to-background/40 rounded-xl overflow-hidden border border-border/40 flex items-center justify-center shadow-inner">
                    <div className="text-center p-6">
                      <PlayCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">Discover TV Series</h3>
                      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                        Watch episodes from your favorite TV shows
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-primary text-white hover:bg-primary/90"
                        onClick={goToSeries}
                      >
                        Explore Series
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <p className="text-sm text-muted-foreground">
                    Binge-watch your favorite TV series with ease.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
