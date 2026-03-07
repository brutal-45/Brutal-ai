'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  RotateCw,
  Maximize2,
  Eraser,
  Wand2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Scissors,
  Palette,
  ZoomIn,
  Crop,
  ArrowLeftRight,
  Check,
  Loader2,
  X,
  Play,
  Slider,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider as UISlider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Tool definitions
const IMAGE_TOOLS = [
  {
    id: 'upscaler',
    name: 'AI Upscaler',
    description: 'Enhance image resolution up to 4x',
    icon: Maximize2,
    color: 'from-blue-500 to-cyan-500',
    features: ['2x Upscale', '4x Upscale', 'Smart Enhancement'],
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove background instantly',
    icon: Eraser,
    color: 'from-green-500 to-emerald-500',
    features: ['Auto Detection', 'Edge Refinement', 'Transparent PNG'],
  },
  {
    id: 'face-enhancer',
    name: 'Face Enhancer',
    description: 'Enhance facial features and quality',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500',
    features: ['Face Detection', 'Skin Smoothing', 'Detail Enhancement'],
  },
  {
    id: 'object-remover',
    name: 'Object Remover',
    description: 'Remove unwanted objects from images',
    icon: Scissors,
    color: 'from-orange-500 to-amber-500',
    features: ['Smart Selection', 'Fill Background', 'Seamless Results'],
  },
  {
    id: 'inpainting',
    name: 'AI Inpainting',
    description: 'Edit specific parts of an image',
    icon: Wand2,
    color: 'from-purple-500 to-violet-500',
    features: ['Brush Selection', 'Text Prompt', 'Smart Fill'],
  },
  {
    id: 'outpainting',
    name: 'AI Outpainting',
    description: 'Extend images beyond borders',
    icon: Crop,
    color: 'from-teal-500 to-cyan-500',
    features: ['Extend Any Direction', 'Seamless Blend', 'AI Generation'],
  },
  {
    id: 'image-to-image',
    name: 'Image to Image',
    description: 'Transform images with AI',
    icon: ArrowLeftRight,
    color: 'from-indigo-500 to-purple-500',
    features: ['Style Transfer', 'Content Modification', 'Prompt Control'],
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Apply artistic styles to images',
    icon: Palette,
    color: 'from-red-500 to-pink-500',
    features: ['Art Styles', 'Custom Styles', 'Intensity Control'],
  },
];

interface ImageToolsHubProps {
  onBack?: () => void;
}

export function ImageToolsHub({ onBack }: ImageToolsHubProps) {
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [compareMode, setCompareMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (!uploadedImage || !selectedTool) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing
    const steps = [20, 40, 60, 80, 100];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(step);
    }

    // For demo, just use the uploaded image as processed
    setProcessedImage(uploadedImage);
    setIsProcessing(false);

    toast({
      title: 'Processing Complete!',
      description: 'Your image has been processed successfully.',
    });
  }, [uploadedImage, selectedTool, toast]);

  const handleDownload = useCallback((format: string) => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `brutal-ai-${selectedTool}-${Date.now()}.${format}`;
    link.click();

    toast({
      title: 'Download Started',
      description: `Downloading as ${format.toUpperCase()}`,
    });
  }, [processedImage, selectedTool, toast]);

  const currentTool = IMAGE_TOOLS.find(t => t.id === selectedTool);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedTool && (
              <Button variant="ghost" size="icon" onClick={() => {
                setSelectedTool(null);
                setUploadedImage(null);
                setProcessedImage(null);
              }}>
                <X className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold">
                {currentTool?.name || 'AI Image Tools'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentTool?.description || 'Professional image editing powered by AI'}
              </p>
            </div>
          </div>
          {processedImage && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Compare
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownload('png')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedTool ? (
          // Tool Selection
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {IMAGE_TOOLS.map((tool) => (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTool(tool.id)}
                  className="p-6 rounded-2xl border border-border bg-card/50 hover:bg-card text-left transition-all group"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                    tool.color
                  )}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          // Tool Workspace
          <div className="p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
              {/* Upload Area */}
              {!uploadedImage ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-2 border-dashed border-border rounded-2xl p-12 text-center"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className={cn(
                    "w-20 h-20 rounded-2xl bg-gradient-to-br mx-auto flex items-center justify-center mb-6",
                    currentTool?.color
                  )}>
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload an Image</h3>
                  <p className="text-muted-foreground mb-6">
                    Drag and drop an image here, or click to browse
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-4">
                    Supports: PNG, JPG, WebP • Max: 10MB
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Image Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Original</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedImage(null);
                            setProcessedImage(null);
                          }}
                        >
                          <RotateCw className="w-4 h-4 mr-2" />
                          Change
                        </Button>
                      </div>
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                        <img
                          src={uploadedImage}
                          alt="Original"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Processed */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Result</span>
                        {processedImage && (
                          <Badge variant="secondary" className="gap-1">
                            <Check className="w-3 h-3" />
                            Complete
                          </Badge>
                        )}
                      </div>
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border relative">
                        {processedImage ? (
                          <img
                            src={processedImage}
                            alt="Processed"
                            className="w-full h-full object-contain"
                          />
                        ) : isProcessing ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">Processing... {progress}%</p>
                            <div className="w-32 h-1 bg-muted rounded-full mt-2 overflow-hidden">
                              <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                              <p className="text-sm">Result will appear here</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tool Controls */}
                  <div className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Settings</h3>
                      <Badge variant="outline">{currentTool?.name}</Badge>
                    </div>

                    {/* Tool-specific controls */}
                    {selectedTool === 'upscaler' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm mb-2 block">Upscale Factor</label>
                          <div className="flex gap-2">
                            {[2, 4].map((factor) => (
                              <Button
                                key={factor}
                                variant={sliderValue === factor ? 'default' : 'outline'}
                                onClick={() => setSliderValue(factor)}
                              >
                                {factor}x
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTool === 'style-transfer' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm mb-2 block">Style Intensity</label>
                          <UISlider
                            value={[sliderValue]}
                            onValueChange={([v]) => setSliderValue(v)}
                            max={100}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {['Cinematic', 'Anime', 'Oil Paint', 'Watercolor'].map((style) => (
                            <Button key={style} variant="outline" size="sm">
                              {style}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(selectedTool === 'inpainting' || selectedTool === 'object-remover') && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm mb-2 block">Brush Size</label>
                          <UISlider
                            value={[sliderValue]}
                            onValueChange={([v]) => setSliderValue(v)}
                            max={100}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Click and drag on the image to select areas to modify
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1"
                        onClick={handleProcess}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Process Image
                          </>
                        )}
                      </Button>
                      {processedImage && (
                        <Button variant="outline" onClick={() => handleDownload('png')}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Download Options */}
                  {processedImage && (
                    <div className="p-4 rounded-xl border border-border bg-card/50">
                      <h3 className="font-medium mb-3">Export Options</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {['PNG', 'JPG', 'WebP'].map((format) => (
                          <Button
                            key={format}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(format.toLowerCase())}
                          >
                            {format}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
