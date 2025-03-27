
import React from "react";
import { Channel, ChannelListProps, PaginatedChannels } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tv } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import FavoriteButton from "@/components/FavoriteButton";
import { optimizeImageUrl } from "@/lib/utils";

const ChannelList: React.FC<ChannelListProps> = ({
  playlist,
  paginatedChannels,
  selectedChannel,
  onSelectChannel,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center p-4 border rounded-lg bg-card">
        <h3 className="font-medium mb-2">No playlist loaded</h3>
        <p className="text-sm text-muted-foreground">
          Please upload an M3U playlist or connect to an Xtream service
        </p>
      </div>
    );
  }

  if (!paginatedChannels || !paginatedChannels.items || paginatedChannels.items.length === 0) {
    return (
      <div className="text-center p-4 border rounded-lg bg-card">
        <h3 className="font-medium mb-2">No channels found</h3>
        <p className="text-sm text-muted-foreground">
          The playlist doesn't contain any channels
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-auto h-full pb-4">
      <h2 className="font-semibold mb-3 px-1">
        Channels ({paginatedChannels.totalItems})
      </h2>
      {paginatedChannels.items.map((channel: Channel) => (
        <Card
          key={channel.id}
          className={`cursor-pointer transition-colors hover:bg-muted/50 overflow-hidden ${
            selectedChannel?.id === channel.id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onSelectChannel(channel)}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
              {channel.logo ? (
                <img
                  src={optimizeImageUrl(channel.logo)}
                  alt={channel.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : (
                <Tv className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{channel.name}</h3>
              {channel.group && (
                <p className="text-xs text-muted-foreground truncate">
                  {channel.group}
                </p>
              )}
            </div>
            <FavoriteButton channel={channel} iconOnly size="sm" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChannelList;
