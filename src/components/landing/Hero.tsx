'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown, Zap, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useEffect, useState, useRef } from 'react';

// Enhanced Floating Orbs with 3D Parallax
function FloatingOrbs() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const orb1X = useSpring(useTransform(mouseX, [-0.5, 0.5], [30, -30]), { stiffness: 50, damping: 30 });
  const orb1Y = useSpring(useTransform(mouseY, [-0.5, 0.5], [30, -30]), { stiffness: 50, damping: 30 });
  const orb2X = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), { stiffness: 70, damping: 30 });
  const orb2Y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), { stiffness: 70, damping: 30 });
  const orb3X = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), { stiffness: 90, damping: 30 });
  const orb3Y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-15, 15]), { stiffness: 90, damping: 30 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary blue orb */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)',
          top: '-25%',
          left: '-20%',
          filter: 'blur(80px)',
          x: orb1X,
          y: orb1Y,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Purple orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
          bottom: '-25%',
          right: '-15%',
          filter: 'blur(70px)',
          x: orb2X,
          y: orb2Y,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Cyan accent orb */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 60%)',
          top: '40%',
          right: '20%',
          filter: 'blur(60px)',
          x: orb3X,
          y: orb3Y,
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Particle field effect */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

// Animated Grid Pattern
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Typewriter Code Panel with Premium Effects and Animations
function TypewriterCodePanel() {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [glitchText, setGlitchText] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });
  
  const fullText = `// Brutal.ai - AI Code Generation
import { generate } from 'brutal-ai';

async function createArt(prompt: string) {
  const result = await generate({
    model: 'brutal-v2',
    prompt: prompt,
    style: 'creative',
    quality: 'hd'
  });
  
  return result.output;
}

// Generate stunning AI content
const art = await createArt(
  "A futuristic cityscape"
);`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Glitch effect
  useEffect(() => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        const pos = Math.floor(Math.random() * displayText.length);
        const char = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        setGlitchText(displayText.slice(0, pos) + char + displayText.slice(pos + 1));
        setTimeout(() => setGlitchText(''), 50);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [displayText]);

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

  const textToDisplay = glitchText || displayText;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100 }}
      className="relative w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      {/* Multiple animated glow layers */}
      <motion.div 
        className="absolute -inset-4 bg-gradient-to-r from-[#3b82f6]/40 via-[#8b5cf6]/40 to-[#06b6d4]/40 rounded-3xl blur-3xl"
        animate={{ 
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div 
        className="absolute -inset-2 bg-gradient-to-r from-[#3b82f6]/20 via-[#8b5cf6]/20 to-[#06b6d4]/20 rounded-2xl blur-2xl"
        animate={{ 
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      
      {/* Rotating border effect with multiple rings */}
      <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4]"
          style={{ originX: 0.5, originY: 0.5 }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-[2px] bg-[#0c0c12] rounded-xl" />
      </div>
      
      {/* Secondary rotating ring */}
      <div className="absolute -inset-[6px] rounded-3xl overflow-hidden opacity-50">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#3b82f6]"
          style={{ originX: 0.5, originY: 0.5 }}
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-[2px] bg-transparent rounded-3xl" />
      </div>
      
      {/* Main Panel with 3D tilt */}
      <motion.div 
        className="relative bg-[#0c0c12]/98 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Terminal header with animated gradient */}
        <motion.div 
          className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Animated background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 via-[#8b5cf6]/5 to-[#06b6d4]/5"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Shimmer effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="relative flex gap-2">
            <motion.div 
              className="w-3 h-3 rounded-full bg-[#ff5f57]"
              whileHover={{ scale: 1.3 }}
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(255,95,87,0)', '0 0 15px 3px rgba(255,95,87,0.5)', '0 0 0 0 rgba(255,95,87,0)'],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.div 
              className="w-3 h-3 rounded-full bg-[#febc2e]"
              whileHover={{ scale: 1.3 }}
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(254,188,46,0)', '0 0 15px 3px rgba(254,188,46,0.5)', '0 0 0 0 rgba(254,188,46,0)'],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div 
              className="w-3 h-3 rounded-full bg-[#28c840]"
              whileHover={{ scale: 1.3 }}
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(40,200,64,0)', '0 0 15px 3px rgba(40,200,64,0.5)', '0 0 0 0 rgba(40,200,64,0)'],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
            />
          </div>
          
          <div className="flex-1 flex justify-center relative z-10">
            <motion.div 
              className="flex items-center gap-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]"
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-white/70 font-medium tracking-wide">brutal-ai.ts</span>
            </motion.div>
          </div>
          
          <div className="relative z-10 flex items-center gap-2">
            <motion.span 
              className="text-[10px] text-[#3b82f6] font-medium bg-[#3b82f6]/10 px-2 py-0.5 rounded border border-[#3b82f6]/20"
              animate={{ 
                opacity: [0.7, 1, 0.7],
                borderColor: ['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.5)', 'rgba(59,130,246,0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              TypeScript
            </motion.span>
          </div>
        </motion.div>
        
        {/* Code content with premium typography */}
        <div className="p-6 font-mono text-[13px] leading-[1.8] overflow-x-auto relative">
          {/* Enhanced scan line effect */}
          <motion.div 
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6]/40 to-transparent"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Secondary scan line */}
          <motion.div 
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent"
            animate={{ top: ['100%', '0%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          
          <pre className="text-white/95 relative z-10">
            <code>
              {textToDisplay.split('\n').map((line, i) => (
                <motion.div 
                  key={i} 
                  className="flex"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  <span className="text-white/15 select-none w-8 text-right pr-5 text-[11px] flex-shrink-0 font-normal">{i + 1}</span>
                  <span dangerouslySetInnerHTML={{
                    __html: line
                      .replace(/(\/\/.*)/g, '<span class="text-[#6a9955] italic">$1</span>')
                      .replace(/(import|from|async|const|await|return|function)/g, '<span class="text-[#c586c0] font-medium">$1</span>')
                      .replace(/('.*?')/g, '<span class="text-[#ce9178]">$1</span>')
                      .replace(/(".*?")/g, '<span class="text-[#ce9178]">$1</span>')
                      .replace(/\b(generate|createArt|prompt|result|model|style|quality|output|art)\b/g, '<span class="text-[#9cdcfe]">$1</span>')
                      .replace(/\b(brutal-v2|creative|hd|string)\b/g, '<span class="text-[#4ec9b0]">$1</span>')
                      .replace(/(\{|\}|\[|\]|\(|\)|,|;)/g, '<span class="text-white/50">$1</span>')
                  }} />
                  {i === textToDisplay.split('\n').length - 1 && showCursor && isTyping && (
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="ml-0.5 w-[2px] h-[18px] bg-gradient-to-b from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] inline-block rounded-full"
                    />
                  )}
                </motion.div>
              ))}
            </code>
          </pre>
        </div>
        
        {/* Status bar with premium styling */}
        <motion.div 
          className="flex items-center justify-between px-5 py-3 border-t border-white/5 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Animated background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 via-[#8b5cf6]/5 to-[#06b6d4]/5"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="flex items-center gap-2.5 relative z-10">
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [1, 0.6, 1],
                boxShadow: ['0 0 0 0 rgba(40,200,64,0)', '0 0 15px 4px rgba(40,200,64,0.6)', '0 0 0 0 rgba(40,200,64,0)']
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2.5 h-2.5 bg-gradient-to-r from-[#28c840] to-[#3b82f6] rounded-full"
            />
            <motion.span 
              className="text-[11px] text-white/50 font-medium tracking-wide"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isTyping ? 'Generating...' : 'AI Generated ✓'}
            </motion.span>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <span className="text-[10px] text-white/30 font-medium">UTF-8</span>
            <motion.span 
              className="text-[10px] text-[#3b82f6] font-medium bg-gradient-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 px-2.5 py-1 rounded-md border border-[#3b82f6]/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{
                borderColor: ['rgba(59,130,246,0.3)', 'rgba(139,92,246,0.5)', 'rgba(59,130,246,0.3)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              v2.0
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Stat Card with 3D effects
function StatCard({ value, label, delay, icon: Icon }: { value: string; label: string; delay: number; icon?: typeof Sparkles }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center backdrop-blur-sm hover:bg-white/10 transition-all relative overflow-hidden group"
      style={{ perspective: 1000 }}
    >
      {/* Animated gradient on hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 via-[#8b5cf6]/10 to-[#06b6d4]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      
      {Icon && (
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1 -right-1 opacity-20"
        >
          <Icon className="w-6 h-6 text-[#3b82f6]" />
        </motion.div>
      )}
      
      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent relative z-10">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1 relative z-10">{label}</div>
    </motion.div>
  );
}

// Floating badge animation
function FloatingBadge({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: delay * 2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const { setCurrentView } = useAppStore();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-14">
      {/* Background */}
      <FloatingOrbs />
      <AnimatedGrid />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <FloatingBadge>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full relative overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.2)' }}
            >
              {/* Shimmer effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4 text-[#3b82f6]" />
              </motion.div>
              <span className="text-sm font-medium text-muted-foreground relative z-10">Next-Gen AI Platform</span>
              
              {/* Pro badge */}
              <motion.span
                className="text-[10px] font-bold bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white px-2 py-0.5 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                PRO
              </motion.span>
            </motion.div>
          </motion.div>
        </FloatingBadge>

        {/* Main Two-Column Layout - Left: Info, Right: Terminal */}
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-12 lg:gap-16 w-full">
          
          {/* Left Side - Title and Information */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-1/2"
          >
            {/* Main Title with enhanced animation */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 relative"
            >
              <motion.span 
                className="bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent inline-block"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Brutal.ai
              </motion.span>
              
              {/* Floating crown for premium feel */}
              <motion.div
                className="absolute -top-4 -right-4"
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Crown className="w-8 h-8 text-[#f59e0b] opacity-80" />
              </motion.div>
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-2xl sm:text-3xl font-semibold text-foreground mb-3"
            >
              Powerful AI.{' '}
              <motion.span 
                className="inline-block"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Beautifully
              </motion.span>{' '}
              Designed.
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-base sm:text-lg text-muted-foreground max-w-md mb-8 leading-relaxed"
            >
              Experience the future of AI assistance with intelligent conversations, 
              creative tools, and seamless interactions.
            </motion.p>

            {/* CTA Buttons with enhanced effects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                style={{ perspective: 1000 }}
              >
                <Button
                  size="lg"
                  onClick={() => setCurrentView('chat')}
                  className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white border-0 rounded-xl shadow-lg shadow-[#3b82f6]/25 relative overflow-hidden group"
                >
                  {/* Button shimmer */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative z-10 flex items-center">
                    Start Chatting
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, rotateY: -5 }}
                whileTap={{ scale: 0.95 }}
                style={{ perspective: 1000 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const toolsSection = document.getElementById('tools-hub');
                    toolsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-12 px-8 text-base font-semibold bg-white/5 border-white/10 hover:bg-white/10 text-foreground rounded-xl relative overflow-hidden group"
                >
                  {/* Border glow on hover */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      boxShadow: '0 0 20px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.1)'
                    }}
                  />
                  <span className="relative z-10 flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className="mr-2"
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                    Explore AI Tools
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats with enhanced animations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              <StatCard value="10M+" label="Queries" delay={0.9} icon={Zap} />
              <StatCard value="99%" label="Satisfaction" delay={1.0} icon={Star} />
              <StatCard value="30+" label="AI Tools" delay={1.1} icon={Sparkles} />
            </motion.div>
          </motion.div>

          {/* Right Side - Code Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="hidden lg:block w-full lg:w-1/2 max-w-lg"
          >
            <TypewriterCodePanel />
          </motion.div>
        </div>

        {/* Mobile Code Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="lg:hidden w-full max-w-lg mx-auto mt-8"
        >
          <TypewriterCodePanel />
        </motion.div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-3 cursor-pointer group"
          onClick={() => {
            const features = document.getElementById('features');
            features?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full"
            />
          </motion.div>
          <span className="text-xs text-muted-foreground font-medium tracking-wider group-hover:text-[#3b82f6] transition-colors">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-[#3b82f6] transition-colors" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
