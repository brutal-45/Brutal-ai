'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Briefcase, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useRef } from 'react';

const toolCategories = [
  {
    name: 'AI Image Generation',
    icon: 'sparkles',
    featured: true,
    color: 'from-[#3b82f6] to-[#8b5cf6]',
    tools: [
      { id: 'image-gen', name: 'AI Image Generator', desc: 'Create stunning images with advanced controls', featured: true },
      { id: 'logo-maker', name: 'AI Logo Maker', desc: 'Create professional logos for your brand' },
      { id: 'thumbnail', name: 'Thumbnail Creator', desc: 'Design eye-catching video thumbnails' },
      { id: 'poster-designer', name: 'Poster Designer', desc: 'Create beautiful posters and graphics' },
    ],
  },
  {
    name: 'Image Tools',
    icon: 'wand',
    color: 'from-[#8b5cf6] to-[#06b6d4]',
    tools: [
      { id: 'upscaler', name: 'AI Upscaler', desc: 'Enhance image resolution up to 4x' },
      { id: 'bg-remover', name: 'Background Remover', desc: 'Remove backgrounds from any image' },
      { id: 'face-enhancer', name: 'Face Enhancer', desc: 'Enhance facial features and quality' },
      { id: 'object-remover', name: 'Object Remover', desc: 'Remove unwanted objects from images' },
      { id: 'inpainting', name: 'AI Inpainting', desc: 'Edit specific parts of an image' },
      { id: 'outpainting', name: 'AI Outpainting', desc: 'Extend images beyond borders' },
      { id: 'image-to-image', name: 'Image to Image', desc: 'Transform images with AI' },
      { id: 'style-transfer', name: 'Style Transfer', desc: 'Apply artistic styles to images' },
    ],
  },
  {
    name: 'Developer',
    icon: 'code',
    color: 'from-[#06b6d4] to-[#3b82f6]',
    tools: [
      { id: 'code-gen', name: 'Code Generator', desc: 'Generate code in any programming language' },
      { id: 'debugger', name: 'AI Debugger', desc: 'Debug and fix your code automatically' },
      { id: 'website-builder', name: 'Website Builder', desc: 'Build complete websites with AI' },
      { id: 'api-docs', name: 'API Doc Writer', desc: 'Generate API documentation instantly' },
      { id: 'app-idea', name: 'App Idea Generator', desc: 'Generate innovative app ideas' },
    ],
  },
  {
    name: 'Business',
    icon: 'briefcase',
    color: 'from-[#3b82f6] to-[#8b5cf6]',
    tools: [
      { id: 'business-plan', name: 'Business Plan', desc: 'Create comprehensive business plans' },
      { id: 'business-name', name: 'Business Name Generator', desc: 'Generate unique business names' },
      { id: 'marketing', name: 'Marketing Strategy', desc: 'Develop winning marketing strategies' },
      { id: 'ad-copy', name: 'Ad Copy Writer', desc: 'Write compelling advertisement copy' },
      { id: 'startup-name', name: 'Startup Name Generator', desc: 'Generate unique startup names' },
    ],
  },
  {
    name: 'Productivity',
    icon: 'zap',
    color: 'from-[#8b5cf6] to-[#06b6d4]',
    tools: [
      { id: 'resume', name: 'Resume Builder', desc: 'Build professional resumes easily' },
      { id: 'email-writer', name: 'Email Writer', desc: 'Craft professional emails instantly' },
      { id: 'pdf-summary', name: 'PDF Summarizer', desc: 'Summarize PDF documents quickly' },
      { id: 'notes', name: 'Notes Generator', desc: 'Generate organized study notes' },
    ],
  },
  {
    name: 'Language',
    icon: 'languages',
    color: 'from-[#06b6d4] to-[#3b82f6]',
    tools: [
      { id: 'translator', name: 'Translator', desc: 'Translate text between 100+ languages' },
      { id: 'grammar', name: 'Grammar Fixer', desc: 'Fix grammar and spelling errors' },
      { id: 'rewriter', name: 'Text Rewriter', desc: 'Rewrite and improve your text' },
      { id: 'tone-changer', name: 'Tone Changer', desc: 'Adjust the tone of your writing' },
    ],
  },
];

// 3D Tool Card
function Tool3DCard({ tool, index, onClick }: { tool: { id: string; name: string; desc: string; featured?: boolean }; index: number; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 400, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 800 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`h-full p-4 glass-3d rounded-xl transition-all duration-300 ${tool.featured ? 'border-[rgba(59,130,246,0.3)]' : ''}`}
      >
        {/* Featured badge */}
        {tool.featured && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 z-10"
          >
            <span className="text-xs bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white px-2 py-0.5 rounded-full font-medium shadow-glow-blue">
              HOT
            </span>
          </motion.div>
        )}
        
        {/* Icon - 3D */}
        <motion.div
          style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${tool.featured ? 'from-[#3b82f6] to-[#8b5cf6]' : 'from-[rgba(59,130,246,0.2)] to-[rgba(139,92,246,0.2)]'} mb-3 shadow-soft`}
        >
          <Image
            src={`/tools/${tool.id}.png`}
            alt={tool.name}
            width={24}
            height={24}
            className="transition-transform group-hover:scale-110"
            loading="lazy"
          />
        </motion.div>
        
        {/* Content - 3D */}
        <motion.h4
          style={{ transform: 'translateZ(15px)' }}
          className={`font-semibold text-sm mb-1 ${tool.featured ? 'text-[#3b82f6]' : 'text-foreground group-hover:text-[#3b82f6]'} transition-colors`}
        >
          {tool.name}
        </motion.h4>
        <motion.p
          style={{ transform: 'translateZ(10px)' }}
          className="text-xs text-muted-foreground line-clamp-2"
        >
          {tool.desc}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

interface CategorySectionProps {
  category: typeof toolCategories[0];
  index: number;
  onToolClick: (toolId: string) => void;
}

function CategorySection({ category, index, onToolClick }: CategorySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="mb-12"
    >
      {/* Category Header - 3D */}
      <motion.div
        whileHover={{ x: 10 }}
        className="flex items-center gap-3 mb-6"
      >
        <motion.div
          whileHover={{ rotateY: 180 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} shadow-3d`}
        >
          <Briefcase className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[rgba(59,130,246,0.2)] to-transparent" />
        <span className="text-sm text-muted-foreground font-medium">{category.tools.length} Tools</span>
      </motion.div>
      
      {/* Tools Grid - 3D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {category.tools.map((tool, i) => (
          <Tool3DCard 
            key={tool.id} 
            tool={tool} 
            index={i}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ToolsHub() {
  const totalTools = toolCategories.reduce((acc, cat) => acc + cat.tools.length, 0);
  const { openTool } = useAppStore();

  const handleToolClick = (toolId: string) => {
    openTool(toolId);
  };

  return (
    <section id="tools-hub" className="py-24 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      {/* 3D Floating orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          top: '5%',
          right: '10%',
          filter: 'blur(60px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotateY: [0, 180, 360],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          bottom: '10%',
          left: '5%',
          filter: 'blur(50px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotateX: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 glass-3d rounded-full mb-6 cursor-pointer shadow-3d"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Briefcase className="w-4 h-4 text-[#3b82f6]" />
            </motion.div>
            <span className="text-sm font-medium text-muted-foreground">{totalTools} AI Tools</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-foreground">AI Tools </span>
            <span className="text-gradient-animated">
              for Every Task
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Specialized AI tools designed to supercharge your workflow across creative, development, business, and productivity tasks.
          </p>
          
          {/* CTA for Image Generation - 3D */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block perspective-1000"
            >
              <Button
                size="lg"
                onClick={() => openTool('image-gen')}
                className="btn-3d gap-2 shadow-3d rounded-2xl h-14 px-8 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white font-semibold"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                Try AI Image Generation
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Tools by Category */}
        <div className="max-w-6xl mx-auto">
          {toolCategories.map((category, index) => (
            <CategorySection 
              key={category.name} 
              category={category} 
              index={index}
              onToolClick={handleToolClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
