
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Cog, LinkIcon, X } from "lucide-react";
import { setCustomEpgUrl, getCustomEpgUrl } from '@/lib/epgService';
import { useToast } from '@/hooks/use-toast';

const EPGSettings = () => {
  const [open, setOpen] = useState(false);
  const [epgUrl, setEpgUrl] = useState('');
  const [hasSavedUrl, setHasSavedUrl] = useState(false);
  const { toast } = useToast();

  // Load saved EPG URL when component mounts
  useEffect(() => {
    const savedUrl = getCustomEpgUrl();
    if (savedUrl) {
      setEpgUrl(savedUrl);
      setHasSavedUrl(true);
    }
  }, []);

  const handleSave = () => {
    if (!epgUrl) {
      // Clear the EPG URL
      setCustomEpgUrl(null);
      setHasSavedUrl(false);
      toast({
        title: "EPG source removed",
        description: "Using default EPG sources now",
      });
    } else {
      try {
        // Basic URL validation
        new URL(epgUrl);
        
        setCustomEpgUrl(epgUrl);
        setHasSavedUrl(true);
        toast({
          title: "EPG source updated",
          description: "Your custom EPG source has been saved",
        });
      } catch (e) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL for your EPG source",
          variant: "destructive"
        });
        return;
      }
    }
    setOpen(false);
  };

  const handleClear = () => {
    setEpgUrl('');
    setCustomEpgUrl(null);
    setHasSavedUrl(false);
    toast({
      title: "EPG source removed",
      description: "Using default EPG sources now",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-1 ${hasSavedUrl ? 'border-green-500 text-green-500 dark:border-green-600 dark:text-green-400' : ''}`}
        >
          <Cog className="h-4 w-4" />
          EPG Source {hasSavedUrl && '✓'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>EPG Settings</DialogTitle>
          <DialogDescription>
            Configure your Electronic Program Guide (EPG) source.
            You can provide a custom XMLTV URL for your channels.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom XMLTV EPG URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/epg.xml"
                value={epgUrl}
                onChange={(e) => setEpgUrl(e.target.value)}
                className="flex-1"
              />
              {epgUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEpgUrl('')}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the URL to your XMLTV EPG file. If not provided, the system will
              use default sources based on channel EPG IDs.
            </p>
          </div>
          
          {hasSavedUrl && (
            <div className="text-sm flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-md">
              <LinkIcon className="h-4 w-4 text-green-500" />
              <span>Custom EPG source is active</span>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          {hasSavedUrl && (
            <Button variant="outline" onClick={handleClear} className="mr-auto">
              Remove EPG Source
            </Button>
          )}
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EPGSettings;
