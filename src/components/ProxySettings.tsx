
import React, { useState, useEffect } from "react";
import { Check, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PROXY_SERVER_URL, isRunningOnHttps } from "@/lib/proxyUtils";
import { useToast } from "@/hooks/use-toast";

const ProxySettings = () => {
  const [proxyUrl, setProxyUrl] = useState(PROXY_SERVER_URL);
  const [enableProxy, setEnableProxy] = useState(true);
  const [isHttps, setIsHttps] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsHttps(isRunningOnHttps());
  }, []);
  
  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem("iptv-proxy-url", proxyUrl);
    localStorage.setItem("iptv-proxy-enabled", enableProxy.toString());
    
    // This would update the exported constant in a real app
    // For demo purposes, we'll just show a toast
    toast({
      title: "Proxy settings saved",
      description: "You may need to reload streams for changes to take effect",
    });
    
    // In a production app, you would need to update the module or use a context
    // to propagate these settings throughout the app
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Proxy Settings</DialogTitle>
          <DialogDescription>
            Configure proxy settings for HTTP streams
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {isHttps ? (
            <div className="flex items-center gap-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm">
              <div className="rounded-full bg-yellow-400 p-1">
                <X className="h-3 w-3 text-white" />
              </div>
              <p className="text-yellow-800 dark:text-yellow-200">
                You're using HTTPS. HTTP streams will be blocked without a proxy.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm">
              <div className="rounded-full bg-green-500 p-1">
                <Check className="h-3 w-3 text-white" />
              </div>
              <p className="text-green-800 dark:text-green-200">
                You're using HTTP. Direct streams should work without a proxy.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="enableProxy" className="text-right">
              Enable Proxy
            </Label>
            <div className="col-span-3">
              <Switch
                id="enableProxy"
                checked={enableProxy}
                onCheckedChange={setEnableProxy}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proxyUrl" className="text-right">
              Proxy URL
            </Label>
            <Input
              id="proxyUrl"
              placeholder="https://your-proxy-server.com/"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              className="col-span-3"
              disabled={!enableProxy}
            />
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            <p>Example proxy servers:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>https://cors-anywhere.herokuapp.com/</li>
              <li>https://api.allorigins.win/raw?url=</li>
              <li>Or set up your own with Node.js/Nginx</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={saveSettings}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProxySettings;
