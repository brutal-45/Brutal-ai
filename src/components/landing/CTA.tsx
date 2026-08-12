'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Star, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useRef, useState } from 'react';

// Animated particle
function Particle({ delay, duration }: { delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white/30 rounded-full"
      initial={{ y: 0, x: 0, opacity: 0 }}
      animate={{
        y: -300,
        x: Math.random() * 100 - 50,
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

export function CTA() {
  const { setCurrentView } = useAppStore();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Enhanced background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Enhanced 3D Animated orbs */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)',
          top: '-30%',
          left: '-15%',
          filter: 'blur(100px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotateY: [0, 180, 360],
          x: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
          bottom: '-30%',
          right: '-15%',
          filter: 'blur(90px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.4, 1],
          rotateX: [0, 180, 360],
          y: [0, -50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Additional cyan orb */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 60%)',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Particle key={i} delay={i * 0.5} duration={4 + Math.random() * 2} />
        ))}
      </div>
      
      {/* Enhanced animated data lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#3b82f6]/40 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#06b6d4]/30 to-transparent"
          animate={{ x: ['-50%', '50%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Vertical lines */}
        <motion.div
          className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#3b82f6]/20 to-transparent"
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute right-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#8b5cf6]/20 to-transparent"
          animate={{ y: ['100%', '-100%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      
      <div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            perspective: 1000,
          }}
        >
          {/* Enhanced Badge - 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.08, rotateY: 10 }}
            className="inline-flex items-center gap-2 px-6 py-3 glass-3d rounded-full mb-10 cursor-pointer shadow-3d relative overflow-hidden"
          >
            {/* Animated shimmer */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Spinning icon */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-[#3b82f6]" />
            </motion.div>
            
            <span className="text-sm font-semibold text-muted-foreground relative z-10">Ready to get started?</span>
            
            {/* Decorative stars */}
            <motion.div
              animate={{ scale: [0, 1, 0], rotate: [0, 180] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-1 -right-1"
            >
              <Star className="w-3 h-3 text-[#f59e0b]" />
            </motion.div>
          </motion.div>
          
          {/* Enhanced Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 tracking-tight leading-tight"
          >
            <span className="text-foreground">Start Building with </span>
            <motion.span 
              className="inline-block"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              <span className="text-gradient-animated">Brutal.ai</span>
            </motion.span>
            <motion.span 
              className="text-foreground inline-block ml-2"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Today
            </motion.span>
          </motion.h2>
          
          {/* Enhanced Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            No sign-up required. Jump right in and experience the power of AI that's built for{' '}
            <motion.span 
              className="text-[#3b82f6] font-semibold inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              speed
            </motion.span>
            ,{' '}
            <motion.span 
              className="text-[#8b5cf6] font-semibold inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              clarity
            </motion.span>
            , and{' '}
            <motion.span 
              className="text-[#06b6d4] font-semibold inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              precision
            </motion.span>
            .
          </motion.p>
          
          {/* Enhanced CTA Buttons - 3D */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            {/* Primary button with enhanced effects */}
            <motion.div
              whileHover={{ scale: 1.08, rotateY: 8, rotateX: 5 }}
              whileTap={{ scale: 0.95 }}
              style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              className="relative"
            >
              {/* Glow ring */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-3xl blur-xl opacity-50"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <Button
                size="lg"
                onClick={() => setCurrentView('chat')}
                className="relative h-14 px-12 text-lg font-semibold rounded-2xl bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] hover:from-[#2563eb] hover:via-[#7c3aed] hover:to-[#0891b2] text-white border-0 shadow-2xl overflow-hidden"
              >
                {/* Button shimmer */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                
                {/* Animated particles inside button */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/40 rounded-full"
                      animate={{
                        x: ['0%', '100%'],
                        y: ['100%', '0%'],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.3,
                        repeat: Infinity,
                      }}
                      style={{ left: `${20 + i * 30}%` }}
                    />
                  ))}
                </div>
                
                <span className="relative z-10 flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Rocket className="w-5 h-5" />
                  </motion.div>
                  Start Chatting
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
            
            {/* Secondary button with enhanced effects */}
            <motion.div
              whileHover={{ scale: 1.08, rotateY: -8, rotateX: 5 }}
              whileTap={{ scale: 0.95 }}
              style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              className="relative"
            >
              {/* Subtle glow on hover */}
              <motion.div
                className="absolute -inset-1 bg-white/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"
              />
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const toolsSection = document.getElementById('tools-hub');
                  toolsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative h-14 px-12 text-lg font-semibold glass-3d border-[rgba(59,130,246,0.2)] hover:bg-white/10 text-foreground rounded-2xl overflow-hidden group"
              >
                {/* Animated border */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: 'inset 0 0 30px rgba(59,130,246,0.1), 0 0 30px rgba(59,130,246,0.1)',
                  }}
                />
                
                <span className="relative z-10 flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  Explore Tools
                </span>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
          >
            {[
              { icon: '🔒', text: 'Secure' },
              { icon: '⚡', text: 'Fast' },
              { icon: '🆓', text: 'Free to start' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
