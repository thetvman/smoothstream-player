
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProfile } from "@/context/ProfileContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tv, Film, ArrowLeft, Heart } from "lucide-react";
import { Channel, Movie, Series } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { optimizeImageUrl } from "@/lib/utils";

const Favorites = () => {
  const navigate = useNavigate();
  const { profile, isLoading } = useProfile();
  const [favoriteChannels, setFavoriteChannels] = useState<Channel[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [favoriteSeries, setFavoriteSeries] = useState<Series[]>([]);

  useEffect(() => {
    if (!isLoading && !profile) {
      navigate("/");
      return;
    }

    // Load favorite channels
    const loadFavorites = () => {
      if (!profile) return;

      // Load channels
      const savedPlaylist = localStorage.getItem("iptv-playlist");
      if (savedPlaylist) {
        const parsedPlaylist = safeJsonParse(savedPlaylist, { channels: [] });
        if (parsedPlaylist && parsedPlaylist.channels) {
          const channels = parsedPlaylist.channels.filter((channel: Channel) => 
            profile.preferences.favoriteChannels.includes(channel.id)
          );
          setFavoriteChannels(channels);
        }
      }

      // Load movies
      const savedMovies = localStorage.getItem("iptv-movies");
      if (savedMovies) {
        const parsedMovies = safeJsonParse(savedMovies, []);
        if (parsedMovies) {
          const movies = parsedMovies.filter((movie: Movie) => 
            profile.preferences.favoriteMovies.includes(movie.id)
          );
          setFavoriteMovies(movies);
        }
      }

      // Load series
      const savedSeries = localStorage.getItem("iptv-series");
      if (savedSeries) {
        const parsedSeries = safeJsonParse(savedSeries, []);
        if (parsedSeries) {
          const series = parsedSeries.filter((series: Series) => 
            profile.preferences.favoriteSeries.includes(series.id)
          );
          setFavoriteSeries(series);
        }
      }
    };

    loadFavorites();
  }, [profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <Layout fullHeight className="py-6 md:py-8">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/profile")}
              className="h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
              <p className="text-muted-foreground">Your favorite content in one place</p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="channels">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="channels">
              <Tv className="mr-2 h-4 w-4" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="movies">
              <Film className="mr-2 h-4 w-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="series">
              <Tv className="mr-2 h-4 w-4" />
              Series
            </TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="mt-6">
            {favoriteChannels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteChannels.map((channel) => (
                  <Card key={channel.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/player/${channel.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 relative flex items-center justify-center rounded bg-muted">
                          {channel.logo ? (
                            <img
                              src={optimizeImageUrl(channel.logo)}
                              alt={channel.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <Tv className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{channel.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel.group || "No category"}
                          </p>
                        </div>
                        <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No favorite channels yet</h3>
                <p className="text-muted-foreground mt-1">
                  Channels you mark as favorite will appear here
                </p>
                <Button className="mt-4" onClick={() => navigate("/")}>
                  Browse Channels
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="movies" className="mt-6">
            {favoriteMovies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteMovies.map((movie) => (
                  <Card key={movie.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/movie/${movie.id}`)}>
                    <CardContent className="p-0">
                      <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                        <img
                          src={optimizeImageUrl(movie.backdrop || movie.logo)}
                          alt={movie.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <Heart className="absolute top-2 right-2 h-5 w-5 text-red-500" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{movie.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                          {movie.year && <span>{movie.year}</span>}
                          {movie.duration && (
                            <>
                              <span>•</span>
                              <span>{movie.duration}</span>
                            </>
                          )}
                          {movie.rating && (
                            <>
                              <span>•</span>
                              <span>⭐ {movie.rating}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No favorite movies yet</h3>
                <p className="text-muted-foreground mt-1">
                  Movies you mark as favorite will appear here
                </p>
                <Button className="mt-4" onClick={() => navigate("/movies")}>
                  Browse Movies
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="series" className="mt-6">
            {favoriteSeries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteSeries.map((series) => (
                  <Card key={series.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/series/${series.id}`)}>
                    <CardContent className="p-0">
                      <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                        <img
                          src={optimizeImageUrl(series.backdrop || series.logo)}
                          alt={series.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <Heart className="absolute top-2 right-2 h-5 w-5 text-red-500" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{series.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                          {series.year && <span>{series.year}</span>}
                          {series.rating && (
                            <>
                              <span>•</span>
                              <span>⭐ {series.rating}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No favorite series yet</h3>
                <p className="text-muted-foreground mt-1">
                  Series you mark as favorite will appear here
                </p>
                <Button className="mt-4" onClick={() => navigate("/series")}>
                  Browse Series
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Favorites;
