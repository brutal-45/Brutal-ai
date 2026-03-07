'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Sparkles,
  Download,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  Settings,
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
  FileText,
  ImageIcon,
  Wand2,
  Lightbulb,
  Info,
  Code,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { type Tool, allTools } from '@/types/chat';
import { TypewriterPreview } from './TypewriterPreview';

// Types
interface GeneratedItem {
  id: string;
  input: string;
  output: string;
  imageUrl?: string;
  createdAt: Date;
  favorite: boolean;
}

interface ToolWorkspaceProps {
  toolId: string;
}

// Tool-specific configurations with increased limits (all 10,000)
const toolConfigs: Record<string, {
  placeholder: string;
  tips: { icon: typeof Sparkles; title: string; desc: string }[];
  isImageTool?: boolean;
  maxInputLength?: number;
}> = {
  // AI Image Generation
  'image-gen': {
    placeholder: 'Describe the image you want to create in detail...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Be Specific', desc: 'Include details about style, lighting, and mood' },
      { icon: ImageIcon, title: 'Use References', desc: 'Mention art styles or artists for better results' },
      { icon: Wand2, title: 'Iterate', desc: 'Refine your prompt based on results' },
    ],
  },
  'logo-maker': {
    placeholder: 'Describe your brand and the logo style you want...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Brand Identity', desc: 'Describe your brand values and target audience' },
      { icon: ImageIcon, title: 'Style Preferences', desc: 'Mention minimalist, modern, or classic styles' },
      { icon: Lightbulb, title: 'Color Scheme', desc: 'Specify colors that represent your brand' },
    ],
  },
  'thumbnail': {
    placeholder: 'Describe your video and the thumbnail you want...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Eye-catching', desc: 'Use bold colors and clear text' },
      { icon: ImageIcon, title: 'Expression', desc: 'Include faces with expressive emotions' },
      { icon: Lightbulb, title: 'Contrast', desc: 'High contrast works best for thumbnails' },
    ],
  },
  'poster-designer': {
    placeholder: 'Describe your poster concept and style...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Theme', desc: 'Define the event or message clearly' },
      { icon: ImageIcon, title: 'Visual Hierarchy', desc: 'Important info should stand out' },
      { icon: Lightbulb, title: 'Call to Action', desc: 'Include what viewers should do' },
    ],
  },
  // Image Tools
  'upscaler': {
    placeholder: 'Describe how you want to enhance your image...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Resolution', desc: 'Specify the target resolution' },
      { icon: ImageIcon, title: 'Details', desc: 'Mention which details to enhance' },
      { icon: Lightbulb, title: 'Style', desc: 'Keep the original style or modify' },
    ],
  },
  'bg-remover': {
    placeholder: 'Describe the background removal requirements...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Edge Quality', desc: 'Specify smooth or detailed edges' },
      { icon: ImageIcon, title: 'Replacement', desc: 'What background to use instead' },
      { icon: Lightbulb, title: 'Transparency', desc: 'Transparent or solid color background' },
    ],
  },
  'face-enhancer': {
    placeholder: 'Describe the facial enhancements you want...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Natural Look', desc: 'Enhance while keeping it natural' },
      { icon: ImageIcon, title: 'Specific Areas', desc: 'Focus on skin, eyes, or smile' },
      { icon: Lightbulb, title: 'Style', desc: 'Portrait, fashion, or casual style' },
    ],
  },
  'object-remover': {
    placeholder: 'Describe the objects you want to remove...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Object Details', desc: 'Describe the object clearly' },
      { icon: ImageIcon, title: 'Background Fill', desc: 'How to fill the removed area' },
      { icon: Lightbulb, title: 'Precision', desc: 'Mark exact areas if possible' },
    ],
  },
  'inpainting': {
    placeholder: 'Describe the edits you want to make...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Area Selection', desc: 'Specify which areas to edit' },
      { icon: ImageIcon, title: 'New Content', desc: 'What should replace the area' },
      { icon: Lightbulb, title: 'Blending', desc: 'How to blend with surroundings' },
    ],
  },
  'outpainting': {
    placeholder: 'Describe how you want to extend the image...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Direction', desc: 'Which direction to extend' },
      { icon: ImageIcon, title: 'Content', desc: 'What should appear in extension' },
      { icon: Lightbulb, title: 'Consistency', desc: 'Match the original style' },
    ],
  },
  'image-to-image': {
    placeholder: 'Describe the transformation you want...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Target Style', desc: 'Describe the desired style' },
      { icon: ImageIcon, title: 'Preserve', desc: 'What elements to keep' },
      { icon: Lightbulb, title: 'Strength', desc: 'How much to transform' },
    ],
  },
  'style-transfer': {
    placeholder: 'Describe the artistic style you want to apply...',
    isImageTool: true,
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Art Style', desc: 'Impressionism, pop art, etc.' },
      { icon: ImageIcon, title: 'Artist Reference', desc: 'Mention specific artists' },
      { icon: Lightbulb, title: 'Intensity', desc: 'Subtle or dramatic effect' },
    ],
  },
  // Developer Tools
  'code-gen': {
    placeholder: 'Describe the code you need in detail...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Language', desc: 'Specify the programming language' },
      { icon: FileText, title: 'Requirements', desc: 'List all requirements clearly' },
      { icon: Lightbulb, title: 'Examples', desc: 'Provide input/output examples' },
    ],
  },
  'debugger': {
    placeholder: 'Paste your code and describe the issue...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Error Messages', desc: 'Include any error messages' },
      { icon: FileText, title: 'Expected Behavior', desc: 'What should the code do' },
      { icon: Lightbulb, title: 'Context', desc: 'Provide relevant context' },
    ],
  },
  'website-builder': {
    placeholder: 'Describe the website you want to build...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Purpose', desc: 'What is the website for' },
      { icon: FileText, title: 'Features', desc: 'List required features' },
      { icon: Lightbulb, title: 'Style', desc: 'Describe the visual style' },
    ],
  },
  'api-docs': {
    placeholder: 'Describe the API endpoint to document...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Endpoint Details', desc: 'URL, method, parameters' },
      { icon: FileText, title: 'Responses', desc: 'Expected responses and errors' },
      { icon: Lightbulb, title: 'Examples', desc: 'Provide usage examples' },
    ],
  },
  'app-idea': {
    placeholder: 'Describe your interests or problem to solve...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Target Users', desc: 'Who will use the app' },
      { icon: Lightbulb, title: 'Problem', desc: 'What problem does it solve' },
      { icon: FileText, title: 'Market', desc: 'Any market constraints' },
    ],
  },
  // Business Tools
  'business-plan': {
    placeholder: 'Describe your business idea...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Product/Service', desc: 'What are you offering' },
      { icon: FileText, title: 'Market', desc: 'Target market and competition' },
      { icon: Lightbulb, title: 'Goals', desc: 'Short and long term goals' },
    ],
  },
  'business-name': {
    placeholder: 'Describe your business and industry...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Industry', desc: 'What industry are you in' },
      { icon: FileText, title: 'Values', desc: 'Core brand values' },
      { icon: Lightbulb, title: 'Style', desc: 'Modern, classic, playful, etc.' },
    ],
  },
  'marketing': {
    placeholder: 'Describe your product or service...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'USP', desc: 'Unique selling proposition' },
      { icon: FileText, title: 'Audience', desc: 'Target audience details' },
      { icon: Lightbulb, title: 'Channels', desc: 'Preferred marketing channels' },
    ],
  },
  'ad-copy': {
    placeholder: 'Describe what you want to advertise...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Product', desc: 'Key product benefits' },
      { icon: FileText, title: 'Audience', desc: 'Who is the target' },
      { icon: Lightbulb, title: 'Platform', desc: 'Where will the ad run' },
    ],
  },
  'startup-name': {
    placeholder: 'Describe your startup idea...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Mission', desc: 'What is your startup mission' },
      { icon: FileText, title: 'Industry', desc: 'What industry/market' },
      { icon: Lightbulb, title: 'Vibe', desc: 'Tech, creative, professional, etc.' },
    ],
  },
  // Productivity Tools
  'resume': {
    placeholder: 'Describe your experience and target job...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Experience', desc: 'Key roles and achievements' },
      { icon: FileText, title: 'Skills', desc: 'Relevant skills to highlight' },
      { icon: Lightbulb, title: 'Target Job', desc: 'What position are you applying for' },
    ],
  },
  'email-writer': {
    placeholder: 'Describe the purpose of your email...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Purpose', desc: 'What is the email goal' },
      { icon: FileText, title: 'Recipient', desc: 'Who is the recipient' },
      { icon: Lightbulb, title: 'Tone', desc: 'Formal, friendly, persuasive' },
    ],
  },
  'pdf-summary': {
    placeholder: 'Paste the content to summarize...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Key Points', desc: 'Focus on main points' },
      { icon: FileText, title: 'Length', desc: 'Desired summary length' },
      { icon: Lightbulb, title: 'Format', desc: 'Bullet points or paragraphs' },
    ],
  },
  'notes': {
    placeholder: 'Enter the topic for your notes...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Topic', desc: 'Main subject of notes' },
      { icon: FileText, title: 'Detail Level', desc: 'Brief overview or detailed' },
      { icon: Lightbulb, title: 'Format', desc: 'Outline, mind map, etc.' },
    ],
  },
  // Language Tools
  'translator': {
    placeholder: 'Enter text to translate (mention target language)...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Source Language', desc: 'Original language if known' },
      { icon: FileText, title: 'Target Language', desc: 'Language to translate to' },
      { icon: Lightbulb, title: 'Context', desc: 'Formal, casual, technical' },
    ],
  },
  'grammar': {
    placeholder: 'Enter text to check grammar...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Context', desc: 'Academic, business, casual' },
      { icon: FileText, title: 'Style', desc: 'Formal or informal writing' },
      { icon: Lightbulb, title: 'Focus', desc: 'Grammar, spelling, or both' },
    ],
  },
  'rewriter': {
    placeholder: 'Enter text to rewrite...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Goal', desc: 'Simplify, expand, formalize' },
      { icon: FileText, title: 'Audience', desc: 'Who will read this' },
      { icon: Lightbulb, title: 'Tone', desc: 'Desired writing tone' },
    ],
  },
  'tone-changer': {
    placeholder: 'Enter text and describe the desired tone...',
    maxInputLength: 10000,
    tips: [
      { icon: Sparkles, title: 'Current Tone', desc: 'What is the current tone' },
      { icon: FileText, title: 'Target Tone', desc: 'Professional, casual, etc.' },
      { icon: Lightbulb, title: 'Preserve', desc: 'What meaning to keep' },
    ],
  },
};

// Default config for tools not in the list
const defaultConfig = {
  placeholder: 'Enter your request...',
  maxInputLength: 10000,
  tips: [
    { icon: Sparkles, title: 'Be Specific', desc: 'Provide clear details' },
    { icon: FileText, title: 'Context', desc: 'Give relevant context' },
    { icon: Lightbulb, title: 'Examples', desc: 'Provide examples if helpful' },
  ],
};

// Get tool prompt
function getToolPrompt(toolId: string): string {
  const prompts: Record<string, string> = {
    'code-gen': 'You are an expert programmer. Generate clean, well-documented code with explanations.',
    'debugger': 'You are an expert debugger. Find and fix issues in the code. Explain the problem and solution.',
    'website-builder': 'You are a web development expert. Build complete websites with HTML, CSS, JS. Make them beautiful and functional.',
    'api-docs': 'You are a technical writer. Create clear API documentation with examples.',
    'app-idea': 'You are a creative consultant. Generate innovative app ideas with detailed plans.',
    'business-plan': 'You are a business expert. Create comprehensive business plans with all sections.',
    'business-name': 'You are a branding expert. Generate creative business names with explanations.',
    'marketing': 'You are a marketing strategist. Develop detailed marketing strategies.',
    'ad-copy': 'You are a copywriter. Create compelling ad copy that converts.',
    'startup-name': 'You are a naming expert. Generate unique startup names with domain suggestions.',
    'resume': 'You are a resume writer. Create professional, ATS-optimized resumes.',
    'email-writer': 'You are a communication expert. Write professional emails that get results.',
    'pdf-summary': 'You are a summarization expert. Create concise, comprehensive summaries.',
    'notes': 'You are a note-taking expert. Generate organized, useful notes.',
    'translator': 'You are an expert translator. Translate accurately while preserving nuance.',
    'grammar': 'You are a grammar expert. Fix grammar and spelling with explanations.',
    'rewriter': 'You are a writing expert. Rewrite and improve text effectively.',
    'tone-changer': 'You are a tone expert. Adjust writing tone precisely as requested.',
  };
  return prompts[toolId] || 'You are a helpful assistant. Provide detailed, helpful responses.';
}

// Result Card Component with Preview
function ResultCard({
  item,
  isImageTool,
  onDownload,
  onFavorite,
  onDelete,
  onCopy,
  isDarkMode,
}: {
  item: GeneratedItem;
  isImageTool?: boolean;
  onDownload: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  onCopy: () => void;
  isDarkMode?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.output);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border border-border/50 rounded-xl overflow-hidden bg-card/50"
    >
      {/* Image Preview */}
      {isImageTool && item.imageUrl && (
        <div className="aspect-video relative bg-muted">
          <img
            src={item.imageUrl}
            alt={item.input}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{item.input}</p>
          {item.favorite && (
            <Badge variant="secondary" className="shrink-0">★ Favorite</Badge>
          )}
        </div>
        
        {/* Typewriter Preview */}
        {showFullPreview ? (
          <div className="mb-4">
            <TypewriterPreview
              content={item.output}
              isTyping={false}
              isDarkMode={isDarkMode}
              showPreview={true}
            />
          </div>
        ) : (
          <button 
            onClick={() => setShowFullPreview(true)}
            className="w-full text-left"
          >
            <div className="text-sm text-foreground max-h-40 overflow-hidden mb-4 whitespace-pre-wrap hover:bg-muted/30 rounded-lg p-2 transition-colors">
              {item.output.slice(0, 500)}...
              <span className="text-purple-500 text-xs ml-2">Click to see full preview</span>
            </div>
          </button>
        )}
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button size="sm" variant="outline" onClick={onFavorite} className="gap-1">
            <span className={item.favorite ? 'text-yellow-500' : ''}>★</span>
            {item.favorite ? 'Saved' : 'Save'}
          </Button>
          <Button size="sm" variant="outline" onClick={onDownload} className="gap-1">
            <Download className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="ml-auto text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Main Tool Workspace Component
export function ToolWorkspace({ toolId }: ToolWorkspaceProps) {
  const { toast } = useToast();
  const tool = allTools.find(t => t.id === toolId);
  const config = toolConfigs[toolId] || defaultConfig;
  const isImageTool = tool?.isImageTool || config.isImageTool;
  
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOutput, setCurrentOutput] = useState<string | null>(null);
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Check dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'favorites') {
      return items.filter(item => item.favorite);
    }
    return items;
  }, [items, filter]);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter your request.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setCurrentOutput(null);

    try {
      if (isImageTool) {
        // Image generation
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input, size: '1024x1024' }),
        });

        const data = await response.json();

        if (data.image) {
          const newItem: GeneratedItem = {
            id: Date.now().toString(),
            input,
            output: 'Image generated successfully!',
            imageUrl: data.image,
            createdAt: new Date(),
            favorite: false,
          };
          setItems(prev => [newItem, ...prev]);
          setCurrentOutput('Image generated successfully!');
          toast({
            title: '✨ Generated Successfully!',
            description: 'Your image has been created.',
          });
        } else if (data.error) {
          throw new Error(data.message || data.error);
        }
      } else {
        // Text generation
        const toolPrompt = getToolPrompt(toolId);
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `${toolPrompt}\n\nUser request: ${input}` }],
            maxTokens: 8192,
          }),
        });

        const data = await response.json();

        if (data.response) {
          const newItem: GeneratedItem = {
            id: Date.now().toString(),
            input,
            output: data.response,
            createdAt: new Date(),
            favorite: false,
          };
          setItems(prev => [newItem, ...prev]);
          setCurrentOutput(data.response);
          toast({
            title: '✨ Generated Successfully!',
            description: 'Your content has been created.',
          });
        } else if (data.error) {
          throw new Error(data.message || data.error);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [input, isImageTool, toolId, toast]);

  const handleDownload = useCallback((item: GeneratedItem) => {
    if (isImageTool && item.imageUrl) {
      const link = document.createElement('a');
      link.href = item.imageUrl;
      link.download = `brutal-ai-${toolId}-${item.id}.png`;
      link.click();
    } else {
      const blob = new Blob([item.output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brutal-ai-${toolId}-${item.id}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
    toast({
      title: 'Download Started',
      description: 'Your file is being downloaded.',
    });
  }, [isImageTool, toolId, toast]);

  const handleFavorite = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'Deleted',
      description: 'Item removed from history.',
    });
  }, [toast]);

  if (!tool) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Tool not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Image
                src={`/tools/${toolId}.png`}
                alt={tool.name}
                width={32}
                height={32}
                className="brightness-110"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{tool.name}</h1>
              <p className="text-muted-foreground mt-1">{tool.description}</p>
            </div>
            {tool.isPro && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">PRO</Badge>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="generate" className="gap-2">
                <Wand2 className="w-4 h-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History ({items.length})
              </TabsTrigger>
            </TabsList>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-6">
              {/* Input Area */}
              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder={config.placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[200px] resize-none pr-12 text-base leading-relaxed"
                    disabled={isGenerating}
                    maxLength={config.maxInputLength}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {input.length}/{config.maxInputLength}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !input.trim()}
                  className={cn(
                    "w-full h-14 text-lg font-semibold gap-2 rounded-xl",
                    "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600",
                    "hover:from-purple-700 hover:via-violet-700 hover:to-fuchsia-700",
                    "shadow-lg shadow-purple-500/25"
                  )}
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate{isImageTool ? ' Image' : ''}
                    </>
                  )}
                </Button>
              </div>

              {/* Current Output with Typewriter Preview */}
              {(isGenerating || currentOutput) && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {isImageTool ? (
                      <>
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        Generated Image
                      </>
                    ) : (
                      <>
                        <Code className="w-5 h-5 text-purple-400" />
                        Output Preview
                      </>
                    )}
                  </h2>
                  
                  {isGenerating && !currentOutput ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 border border-border/50 rounded-xl bg-muted/30">
                      <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                      <span className="text-muted-foreground">Generating your content...</span>
                    </div>
                  ) : isImageTool && items[0]?.imageUrl ? (
                    <div className="rounded-xl border border-border/50 overflow-hidden">
                      <img 
                        src={items[0].imageUrl} 
                        alt="Generated" 
                        className="w-full max-h-[500px] object-contain"
                      />
                    </div>
                  ) : currentOutput && (
                    <TypewriterPreview
                      content={currentOutput}
                      isTyping={isGenerating}
                      typingSpeed={10}
                      isDarkMode={isDarkMode}
                      showPreview={true}
                    />
                  )}
                </div>
              )}

              {/* Recent Results */}
              {items.length > 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Previous Generations</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {items.slice(1, 4).map((item) => (
                      <ResultCard
                        key={item.id}
                        item={item}
                        isImageTool={isImageTool}
                        onDownload={() => handleDownload(item)}
                        onFavorite={() => handleFavorite(item.id)}
                        onDelete={() => handleDelete(item.id)}
                        onCopy={() => {}}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {config.tips.map((tip, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <tip.icon className="w-5 h-5 text-purple-400 mb-2" />
                    <h3 className="font-medium text-sm">{tip.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({items.length})
                </Button>
                <Button
                  variant={filter === 'favorites' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('favorites')}
                >
                  ★ Favorites ({items.filter(i => i.favorite).length})
                </Button>
              </div>

              {/* Results Grid */}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence>
                    {filteredItems.map((item) => (
                      <ResultCard
                        key={item.id}
                        item={item}
                        isImageTool={isImageTool}
                        onDownload={() => handleDownload(item)}
                        onFavorite={() => handleFavorite(item.id)}
                        onDelete={() => handleDelete(item.id)}
                        onCopy={() => {}}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    {filter === 'favorites' ? 'No favorites yet' : 'No history'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {filter === 'favorites'
                      ? 'Star items to save them as favorites'
                      : 'Generate content to see it here'
                    }
                  </p>
                  {filter === 'all' && (
                    <Button onClick={() => setActiveTab('generate')}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Start Generating
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
        <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{tool.name} Settings</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 mb-4">
              <Info className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-muted-foreground">
                Advanced settings will be available in a future update.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
