import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Cog, LinkIcon, X, AlertTriangle } from "lucide-react";
import { setCustomEpgUrl, getCustomEpgUrl, clearCache } from '@/lib/epg';
import { useToast } from '@/hooks/use-toast';

const EPGSettings = () => {
  const [open, setOpen] = useState(false);
  const [epgUrl, setEpgUrl] = useState('');
  const [hasSavedUrl, setHasSavedUrl] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedUrl = getCustomEpgUrl();
    if (savedUrl) {
      setEpgUrl(savedUrl);
      setHasSavedUrl(true);
    }
  }, []);

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setValidationError('An EPG URL is required for this app to function properly');
      return false;
    }
    
    if (!(url.startsWith('http://amri.wtf') || 
          url.startsWith('http://deliverynetwork.online') || 
          url.startsWith('https://deliverynetwork.online') ||
          url.startsWith('https://xerotv.vip'))) {
      setValidationError('Only URLs from our allowed domains are permitted');
      return false;
    }
    
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
    if (!validateUrl(epgUrl)) {
      return;
    }
    
    const result = setCustomEpgUrl(epgUrl);
    if (result.isChanged) {
      clearCache();
    }
    
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
      description: "EPG functionality will be limited without a source",
    });
    setOpen(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setEpgUrl(newUrl);
    
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={hasSavedUrl ? "outline" : "secondary"}
          size="sm" 
          className={`flex items-center gap-1 ${hasSavedUrl ? 'border-green-500 text-green-500 dark:border-green-600 dark:text-green-400' : ''}`}
        >
          <Cog className="h-4 w-4" />
          EPG Source {hasSavedUrl ? '✓' : ''}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>EPG Settings</DialogTitle>
          <DialogDescription>
            Configure your Electronic Program Guide (EPG) source.
            You must provide a custom XMLTV URL for your channels.
            <span className="block mt-1 font-medium text-amber-500">
              Note: Only URLs from amri.wtf, deliverynetwork.online, or xerotv.vip are allowed.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!hasSavedUrl && (
            <div className="flex p-3 text-sm bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-amber-800 dark:text-amber-300">
                EPG functionality requires a valid EPG source URL to work properly.
                Please configure your EPG source below.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">XMLTV EPG URL (Required)</label>
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
              Enter the URL to your XMLTV EPG file. This is required for
              program guide information to display correctly.
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
