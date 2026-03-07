'use client';

import Image from 'next/image';
import {
  Palette,
  Code,
  Briefcase,
  Zap,
  Languages,
  Wand2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toolCategories, type Tool } from '@/types/chat';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

interface ToolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons: Record<string, LucideIcon> = {
  'Image': Palette,
  'Wand2': Wand2,
  'Code': Code,
  'Briefcase': Briefcase,
  'Zap': Zap,
  'Languages': Languages,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'AI Image Generation': { bg: 'bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]', text: 'text-white', border: 'border-[rgba(59,130,246,0.3)]' },
  'Image Tools': { bg: 'bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4]', text: 'text-white', border: 'border-[rgba(139,92,246,0.3)]' },
  'Developer': { bg: 'bg-gradient-to-br from-[#06b6d4] to-[#3b82f6]', text: 'text-white', border: 'border-[rgba(6,182,212,0.3)]' },
  'Business': { bg: 'bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]', text: 'text-white', border: 'border-[rgba(59,130,246,0.3)]' },
  'Productivity': { bg: 'bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4]', text: 'text-white', border: 'border-[rgba(139,92,246,0.3)]' },
  'Language': { bg: 'bg-gradient-to-br from-[#06b6d4] to-[#3b82f6]', text: 'text-white', border: 'border-[rgba(6,182,212,0.3)]' },
};

export function ToolsSheet({ open, onOpenChange }: ToolsSheetProps) {
  const { openTool } = useAppStore();

  const handleToolClick = (tool: Tool) => {
    openTool(tool.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] border-t border-[rgba(59,130,246,0.15)] bg-background/95 backdrop-blur-xl px-0 rounded-t-3xl">
        <SheetHeader className="px-6 pb-4 border-b border-[rgba(59,130,246,0.1)]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold tracking-tight">
              AI <span className="text-gradient">Tools</span>
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 rounded-xl hover:bg-[rgba(59,130,246,0.1)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100%-5rem)] px-6">
          <div className="space-y-8 pb-6 py-6">
            {toolCategories.map((category, categoryIndex) => {
              const CategoryIcon = categoryIcons[category.icon] || Palette;
              const colors = categoryColors[category.name] || categoryColors['Developer'];

              return (
                <motion.div 
                  key={category.name} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="space-y-4"
                >
                  {/* Category Header - Aesthetic */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      colors.bg
                    )}>
                      <CategoryIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{category.tools.length} tools</span>
                  </div>

                  {/* Tools Grid - Aesthetic Glass Cards */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {category.tools.map((tool, toolIndex) => {
                      return (
                        <motion.button
                          key={tool.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: categoryIndex * 0.1 + toolIndex * 0.05 }}
                          onClick={() => handleToolClick(tool)}
                          className={cn(
                            'group relative flex items-start gap-4 p-4 text-left transition-all duration-300',
                            'bg-card/60 backdrop-blur-sm border rounded-xl',
                            'hover:bg-card/80 hover:shadow-soft hover:scale-[1.02]',
                            'border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.25)]',
                            tool.isImageTool && 'ring-1 ring-[rgba(59,130,246,0.2)]'
                          )}
                        >
                          {/* Tool Icon */}
                          <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden",
                            tool.isImageTool ? "bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20" : "bg-[rgba(59,130,246,0.1)]"
                          )}>
                            <Image
                              src={`/tools/${tool.id}.png`}
                              alt={tool.name}
                              width={28}
                              height={28}
                              className="object-contain"
                              loading="lazy"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground flex items-center gap-2 mb-1">
                              {tool.name}
                              {tool.isPro && (
                                <span className="text-[10px] bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white px-2 py-0.5 rounded-full font-medium">
                                  PRO
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
