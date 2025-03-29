
import React from "react";
import { Settings } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlayerTheme, usePlayerTheme } from "@/lib/playerThemeStore";

const colorPresets = [
  { name: "Default", colors: ["#000000", "#FFFFFF", "hsl(var(--primary))"] },
  { name: "Dark Blue", colors: ["#0F172A", "#E2E8F0", "#3B82F6"] },
  { name: "Forest", colors: ["#022c22", "#ecfdf5", "#059669"] },
  { name: "Sunset", colors: ["#18181b", "#fafafa", "#f97316"] },
  { name: "Night", colors: ["#09090b", "#fafafa", "#a855f7"] },
  { name: "Minimal", colors: ["#ffffff", "#09090b", "#18181b"] },
];

const PlayerThemeSettings = () => {
  const { theme, setTheme, resetTheme } = usePlayerTheme();

  const applyColorPreset = (index: number) => {
    const preset = colorPresets[index];
    setTheme({
      background: preset.colors[0],
      foreground: preset.colors[1],
      accent: preset.colors[2],
      controlBackground: `${preset.colors[0]}99`, // With opacity
      controlForeground: preset.colors[1],
    });
  };

  const handleSizeChange = (value: string) => {
    setTheme({ size: value as PlayerTheme['size'] });
  };

  const handleRadiusChange = (value: string) => {
    setTheme({ cornerRadius: value as PlayerTheme['cornerRadius'] });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Player Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Player Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="appearance">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="size">Size & Shape</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Color Themes</h4>
                <div className="grid grid-cols-3 gap-2">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={preset.name}
                      className="group flex flex-col items-center p-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={() => applyColorPreset(index)}
                    >
                      <div className="flex gap-1 mb-1">
                        {preset.colors.map((color) => (
                          <div 
                            key={color} 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="size" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Player Size</Label>
                <RadioGroup 
                  value={theme.size} 
                  onValueChange={handleSizeChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="size-small" />
                    <Label htmlFor="size-small">Small</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="size-medium" />
                    <Label htmlFor="size-medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="size-large" />
                    <Label htmlFor="size-large">Large</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Corner Radius</Label>
                <RadioGroup 
                  value={theme.cornerRadius} 
                  onValueChange={handleRadiusChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="radius-none" />
                    <Label htmlFor="radius-none">None</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="radius-small" />
                    <Label htmlFor="radius-small">Small</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="radius-medium" />
                    <Label htmlFor="radius-medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="radius-large" />
                    <Label htmlFor="radius-large">Large</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={resetTheme}
          >
            Reset to Default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerThemeSettings;
