'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  Share2,
  RefreshCw,
  Heart,
  Copy,
  ZoomIn,
  Trash2,
  MoreHorizontal,
  Settings,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  Wand2,
  Palette,
  Sun,
  Moon,
  Camera,
  Layers,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Monitor,
  Film,
  Gamepad2,
  PenTool,
  Box,
  Zap,
  Shield,
  Sliders,
  Shuffle,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  style: string;
  aspectRatio: string;
  resolution: string;
  seed?: number;
  createdAt: Date;
  favorite: boolean;
}

interface ImageSettings {
  aspectRatio: string;
  resolution: string;
  style: string;
  styleIntensity: number;
  creativity: number;
  lighting: string;
  cameraAngle: string;
  background: string;
  colorTone: string;
  negativePrompt: string;
  seed: string;
  batchSize: number;
}

// Constants
const IMAGE_STYLES = [
  { id: 'realistic', name: 'Realistic', icon: Camera, color: 'from-blue-500 to-cyan-500' },
  { id: 'cinematic', name: 'Cinematic', icon: Film, color: 'from-purple-500 to-pink-500' },
  { id: 'anime', name: 'Anime', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
  { id: '3d', name: '3D Render', icon: Box, color: 'from-green-500 to-emerald-500' },
  { id: 'digital-art', name: 'Digital Art', icon: PenTool, color: 'from-orange-500 to-amber-500' },
  { id: 'pixel-art', name: 'Pixel Art', icon: Gamepad2, color: 'from-red-500 to-orange-500' },
  { id: 'logo', name: 'Logo', icon: Layers, color: 'from-indigo-500 to-purple-500' },
  { id: 'thumbnail', name: 'Thumbnail', icon: Square, color: 'from-yellow-500 to-orange-500' },
  { id: 'poster', name: 'Poster', icon: ImageIcon, color: 'from-teal-500 to-cyan-500' },
  { id: 'ui-mockup', name: 'UI Mockup', icon: Monitor, color: 'from-slate-500 to-gray-500' },
  { id: 'product', name: 'Product', icon: Box, color: 'from-violet-500 to-purple-500' },
  { id: 'concept', name: 'Concept Art', icon: Palette, color: 'from-cyan-500 to-blue-500' },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square', icon: Square, width: 1024, height: 1024 },
  { id: '16:9', name: 'Landscape', icon: RectangleHorizontal, width: 1344, height: 768 },
  { id: '9:16', name: 'Portrait', icon: RectangleVertical, width: 768, height: 1344 },
  { id: '4:3', name: 'Standard', icon: RectangleHorizontal, width: 1152, height: 864 },
  { id: '3:4', name: 'Portrait Std', icon: RectangleVertical, width: 864, height: 1152 },
  { id: '21:9', name: 'Ultrawide', icon: RectangleHorizontal, width: 1440, height: 720 },
];

const RESOLUTIONS = [
  { id: 'hd', name: 'HD', desc: '1024px', size: 1024 },
  { id: '2k', name: '2K', desc: '1536px', size: 1536 },
  { id: '4k', name: '4K', desc: '2048px', size: 2048 },
];

const LIGHTING_OPTIONS = [
  { id: 'natural', name: 'Natural', icon: Sun },
  { id: 'studio', name: 'Studio', icon: Camera },
  { id: 'dramatic', name: 'Dramatic', icon: Moon },
  { id: 'soft', name: 'Soft', icon: Sun },
  { id: 'cinematic', name: 'Cinematic', icon: Film },
];

const CAMERA_ANGLES = [
  { id: 'front', name: 'Front' },
  { id: 'side', name: 'Side' },
  { id: 'top', name: 'Top Down' },
  { id: 'low', name: 'Low Angle' },
  { id: 'high', name: 'High Angle' },
  { id: 'dutch', name: 'Dutch Angle' },
];

const BACKGROUND_OPTIONS = [
  { id: 'solid', name: 'Solid' },
  { id: 'gradient', name: 'Gradient' },
  { id: 'transparent', name: 'Transparent' },
  { id: 'blur', name: 'Blurred' },
  { id: 'nature', name: 'Nature' },
  { id: 'studio', name: 'Studio' },
];

const COLOR_TONES = [
  { id: 'vibrant', name: 'Vibrant', color: '#FF6B6B' },
  { id: 'warm', name: 'Warm', color: '#FFA94D' },
  { id: 'cool', name: 'Cool', color: '#4DABF7' },
  { id: 'muted', name: 'Muted', color: '#ADB5BD' },
  { id: 'monochrome', name: 'Mono', color: '#495057' },
  { id: 'pastel', name: 'Pastel', color: '#F8BBD9' },
];

// Image Card Component
function ImageCard({
  image,
  onDownload,
  onFavorite,
  onDelete,
  onRegenerate,
  onView,
}: {
  image: GeneratedImage;
  onDownload: (format: string) => void;
  onFavorite: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  onView: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
    >
      <img
        src={image.url}
        alt={image.prompt}
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          isLoading && "opacity-0"
        )}
        onLoad={() => setIsLoading(false)}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {image.favorite && (
        <div className="absolute top-2 left-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500 drop-shadow-lg" />
        </div>
      )}
      
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className="text-xs bg-black/50 backdrop-blur-sm border-0">
          {IMAGE_STYLES.find(s => s.id === image.style)?.name || image.style}
        </Badge>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={onView}
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={onFavorite}
            >
              <Heart className={cn("w-4 h-4", image.favorite && "text-red-500 fill-red-500")} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={onRegenerate}
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <Download className="w-4 h-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload('png')}>PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload('jpg')}>JPG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload('webp')}>WebP</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(image.url)}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-white/80 line-clamp-2">{image.prompt}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Queue Status Component
function QueueStatus({ position }: { position: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
      <div className="p-2 bg-blue-500/20 rounded-lg">
        <Clock className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">Queue Position: {position}</p>
        <p className="text-xs text-muted-foreground">Estimated wait: ~{position * 3}s</p>
      </div>
      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
    </div>
  );
}

// Progress Bar Component
function GenerationProgress({ progress, status }: { progress: number; status: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{status}</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// Main Image Generator Component
export function ImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'favorites'>('all');
  
  const [settings, setSettings] = useState<ImageSettings>({
    aspectRatio: '1:1',
    resolution: 'hd',
    style: 'realistic',
    styleIntensity: 75,
    creativity: 50,
    lighting: 'natural',
    cameraAngle: 'front',
    background: 'solid',
    colorTone: 'vibrant',
    negativePrompt: '',
    seed: '',
    batchSize: 1,
  });

  const filteredImages = useMemo(() => {
    if (galleryFilter === 'favorites') {
      return images.filter(img => img.favorite);
    }
    return images;
  }, [images, galleryFilter]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a description for your image.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setQueuePosition(Math.floor(Math.random() * 5) + 1);
    setProgress(0);
    setProgressStatus('Initializing...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQueuePosition(null);
      
      const progressSteps = [
        { progress: 20, status: 'Analyzing prompt...' },
        { progress: 40, status: 'Generating composition...' },
        { progress: 60, status: 'Adding details...' },
        { progress: 80, status: 'Refining image...' },
        { progress: 95, status: 'Finalizing...' },
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(step.progress);
        setProgressStatus(step.status);
      }

      const aspectRatio = ASPECT_RATIOS.find(ar => ar.id === settings.aspectRatio) || ASPECT_RATIOS[0];
      
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}, ${settings.style} style, ${settings.lighting} lighting, ${settings.colorTone} color tone`,
          size: `${aspectRatio.width}x${aspectRatio.height}`,
        }),
      });

      const data = await response.json();
      
      // Handle missing API key error
      if (data.code === 'MISSING_API_KEY') {
        toast({
          title: '🔑 API Key Required',
          description: 'Add ZAI_API_KEY in Vercel Environment Variables to use image generation.',
          variant: 'destructive',
        });
        setIsGenerating(false);
        setProgress(0);
        setProgressStatus('');
        return;
      }
      
      if (data.image) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: data.image,
          prompt,
          negativePrompt: settings.negativePrompt,
          style: settings.style,
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
          seed: settings.seed ? parseInt(settings.seed) : undefined,
          createdAt: new Date(),
          favorite: false,
        };
        
        setImages(prev => [newImage, ...prev]);
        setProgress(100);
        setProgressStatus('Complete!');
        
        toast({
          title: 'Image Generated! ✨',
          description: 'Your image has been created successfully.',
        });
      }
    } catch {
      toast({
        title: 'Generation Failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressStatus('');
    }
  }, [prompt, settings, toast]);

  const handleDownload = useCallback((image: GeneratedImage, format: string) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `brutal-ai-${image.id}.${format}`;
    link.click();
    
    toast({
      title: 'Download Started',
      description: `Downloading as ${format.toUpperCase()}`,
    });
  }, [toast]);

  const handleFavorite = useCallback((id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, favorite: !img.favorite } : img
    ));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: 'Image Deleted',
      description: 'Image removed from gallery.',
    });
  }, [toast]);

  const handleRegenerate = useCallback((image: GeneratedImage) => {
    setPrompt(image.prompt);
    setSettings(prev => ({
      ...prev,
      style: image.style,
      aspectRatio: image.aspectRatio,
      resolution: image.resolution,
    }));
    setActiveTab('generate');
    setTimeout(() => handleGenerate(), 100);
  }, [handleGenerate]);

  // Settings Panel Component
  const SettingsPanel = () => (
    <div className="space-y-6">
      {/* Style Selection */}
      <div>
        <label className="text-sm font-medium mb-3 block">Image Style</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {IMAGE_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSettings(prev => ({ ...prev, style: style.id }))}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                settings.style === style.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", style.color)}>
                <style.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium truncate w-full text-center">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="text-sm font-medium mb-3 block">Aspect Ratio</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              onClick={() => setSettings(prev => ({ ...prev, aspectRatio: ratio.id }))}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                settings.aspectRatio === ratio.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <ratio.icon className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs font-medium">{ratio.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div>
        <label className="text-sm font-medium mb-3 block">Resolution</label>
        <div className="grid grid-cols-3 gap-2">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.id}
              onClick={() => setSettings(prev => ({ ...prev, resolution: res.id }))}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                settings.resolution === res.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-sm font-semibold">{res.name}</span>
              <span className="text-xs text-muted-foreground">{res.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {advancedMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Style Intensity</label>
                <span className="text-sm text-muted-foreground">{settings.styleIntensity}%</span>
              </div>
              <Slider
                value={[settings.styleIntensity]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, styleIntensity: value }))}
                max={100}
                step={1}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Creativity</label>
                <span className="text-sm text-muted-foreground">{settings.creativity}%</span>
              </div>
              <Slider
                value={[settings.creativity]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, creativity: value }))}
                max={100}
                step={1}
              />
            </div>
          </div>

          {/* Lighting */}
          <div>
            <label className="text-sm font-medium mb-3 block">Lighting</label>
            <div className="grid grid-cols-5 gap-2">
              {LIGHTING_OPTIONS.map((light) => (
                <button
                  key={light.id}
                  onClick={() => setSettings(prev => ({ ...prev, lighting: light.id }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all",
                    settings.lighting === light.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <light.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs">{light.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Angle */}
          <div>
            <label className="text-sm font-medium mb-3 block">Camera Angle</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CAMERA_ANGLES.map((angle) => (
                <button
                  key={angle.id}
                  onClick={() => setSettings(prev => ({ ...prev, cameraAngle: angle.id }))}
                  className={cn(
                    "p-2 rounded-xl border text-sm font-medium transition-all",
                    settings.cameraAngle === angle.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {angle.name}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="text-sm font-medium mb-3 block">Background</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSettings(prev => ({ ...prev, background: bg.id }))}
                  className={cn(
                    "p-2 rounded-xl border text-sm font-medium transition-all",
                    settings.background === bg.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Tone */}
          <div>
            <label className="text-sm font-medium mb-3 block">Color Tone</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSettings(prev => ({ ...prev, colorTone: tone.id }))}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border transition-all",
                    settings.colorTone === tone.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tone.color }} />
                  <span className="text-sm">{tone.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="text-sm font-medium mb-3 block">Negative Prompt</label>
            <Textarea
              placeholder="Things to avoid in the image..."
              value={settings.negativePrompt}
              onChange={(e) => setSettings(prev => ({ ...prev, negativePrompt: e.target.value }))}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Seed */}
          <div>
            <label className="text-sm font-medium mb-3 block">Seed (Optional)</label>
            <div className="flex gap-2">
              <Input
                placeholder="Random seed..."
                value={settings.seed}
                onChange={(e) => setSettings(prev => ({ ...prev, seed: e.target.value }))}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setSettings(prev => ({ ...prev, seed: Math.floor(Math.random() * 999999).toString() }))}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Batch Size */}
          <div>
            <label className="text-sm font-medium mb-3 block">Batch Size</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setSettings(prev => ({ ...prev, batchSize: num }))}
                  className={cn(
                    "p-2 rounded-xl border text-sm font-medium transition-all",
                    settings.batchSize === num
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {num} {num === 1 ? 'Image' : 'Images'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Advanced Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Advanced Mode</span>
        </div>
        <Switch
          checked={advancedMode}
          onCheckedChange={setAdvancedMode}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">AI Image Generation</h1>
              <p className="text-muted-foreground mt-1">Create stunning images with AI</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                Fast Mode
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" />
                Safe
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="generate" className="gap-2">
                <Wand2 className="w-4 h-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Gallery ({images.length})
              </TabsTrigger>
            </TabsList>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder="Describe the image you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none pr-12 text-base"
                    disabled={isGenerating}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {prompt.length}/1000
                  </div>
                </div>

                {/* Quick Style Buttons */}
                <div className="flex flex-wrap gap-2">
                  {IMAGE_STYLES.slice(0, 6).map((style) => (
                    <Button
                      key={style.id}
                      variant={settings.style === style.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, style: style.id }))}
                      className="gap-1"
                    >
                      <style.icon className="w-3 h-3" />
                      {style.name}
                    </Button>
                  ))}
                </div>

                {/* Settings Collapsible */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Settings</span>
                      <Badge variant="secondary" className="text-xs">
                        {settings.aspectRatio} • {settings.resolution.toUpperCase()} • {IMAGE_STYLES.find(s => s.id === settings.style)?.name}
                      </Badge>
                    </div>
                    {settingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  <AnimatePresence>
                    {settingsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-border">
                          <SettingsPanel />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Queue Status */}
                {queuePosition && <QueueStatus position={queuePosition} />}

                {/* Progress */}
                {isGenerating && progress > 0 && (
                  <GenerationProgress progress={progress} status={progressStatus} />
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>

              {/* Recent Images */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Recent Generations</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.slice(0, 4).map((image) => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        onDownload={(format) => handleDownload(image, format)}
                        onFavorite={() => handleFavorite(image.id)}
                        onDelete={() => handleDelete(image.id)}
                        onRegenerate={() => handleRegenerate(image)}
                        onView={() => setSelectedImage(image)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Sparkles, title: 'Be Specific', desc: 'Include details about style, lighting, and mood' },
                  { icon: Palette, title: 'Use References', desc: 'Mention art styles or artists for better results' },
                  { icon: Zap, title: 'Iterate', desc: 'Refine your prompt based on results' },
                ].map((tip, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <tip.icon className="w-5 h-5 text-primary mb-2" />
                    <h3 className="font-medium text-sm">{tip.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-4">
              {/* Filter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={galleryFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGalleryFilter('all')}
                  >
                    All ({images.length})
                  </Button>
                  <Button
                    variant={galleryFilter === 'favorites' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGalleryFilter('favorites')}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Favorites ({images.filter(i => i.favorite).length})
                  </Button>
                </div>
                {images.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Archive className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Download as PNG</DropdownMenuItem>
                      <DropdownMenuItem>Download as JPG</DropdownMenuItem>
                      <DropdownMenuItem>Download as ZIP</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Images Grid */}
              {filteredImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {filteredImages.map((image) => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        onDownload={(format) => handleDownload(image, format)}
                        onFavorite={() => handleFavorite(image.id)}
                        onDelete={() => handleDelete(image.id)}
                        onRegenerate={() => handleRegenerate(image)}
                        onView={() => setSelectedImage(image)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    {galleryFilter === 'favorites' ? 'No favorites yet' : 'No images generated'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {galleryFilter === 'favorites' 
                      ? 'Start adding images to your favorites'
                      : 'Create your first image to see it here'
                    }
                  </p>
                  {galleryFilter === 'all' && (
                    <Button onClick={() => setActiveTab('generate')}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Image
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Image Settings</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <SettingsPanel />
          </div>
        </SheetContent>
      </Sheet>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>Image Preview</DialogTitle>
                <DialogDescription>
                  {selectedImage.prompt}
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{selectedImage.style}</Badge>
                  <Badge variant="secondary">{selectedImage.aspectRatio}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFavorite(selectedImage.id)}
                  >
                    <Heart className={cn("w-4 h-4 mr-1", selectedImage.favorite && "fill-red-500 text-red-500")} />
                    {selectedImage.favorite ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(selectedImage, 'png')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
