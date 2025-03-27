
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load saved EPG URL when component mounts
  useEffect(() => {
    const savedUrl = getCustomEpgUrl();
    if (savedUrl) {
      setEpgUrl(savedUrl);
      setHasSavedUrl(true);
    }
  }, []);

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is valid (will use default sources)
    
    // Validate that the URL starts with http://amri.wtf
    if (!url.startsWith('http://amri.wtf')) {
      setValidationError('Only URLs from http://amri.wtf are allowed');
      return false;
    }
    
    // Additional URL validation
    try {
      new URL(url);
      setValidationError(null);
      return true;
    } catch (e) {
      setValidationError('Please enter a valid URL');
      return false;
    }
  };

  const handleSave = () => {
    if (!epgUrl) {
      // Clear the EPG URL
      setCustomEpgUrl(null);
      setHasSavedUrl(false);
      toast({
        title: "EPG source removed",
        description: "Using default EPG sources now",
      });
      setOpen(false);
      return;
    }
    
    // Validate the URL
    if (!validateUrl(epgUrl)) {
      return; // Don't proceed if validation fails
    }
    
    setCustomEpgUrl(epgUrl);
    setHasSavedUrl(true);
    toast({
      title: "EPG source updated",
      description: "Your custom EPG source has been saved",
    });
    setOpen(false);
  };

  const handleClear = () => {
    setEpgUrl('');
    setCustomEpgUrl(null);
    setHasSavedUrl(false);
    setValidationError(null);
    toast({
      title: "EPG source removed",
      description: "Using default EPG sources now",
    });
    setOpen(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setEpgUrl(newUrl);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
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
            <span className="block mt-1 font-medium text-amber-500">
              Note: Only URLs from http://amri.wtf are allowed.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom XMLTV EPG URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="http://amri.wtf/epg.xml"
                value={epgUrl}
                onChange={handleUrlChange}
                className={`flex-1 ${validationError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {epgUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEpgUrl('');
                    setValidationError(null);
                  }}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {validationError && (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            )}
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
