'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Code2, Zap, Shield, Smartphone, Globe, Cpu, Sparkles, ArrowRight, Star } from 'lucide-react';
import { useRef, useState } from 'react';

const features = [
  {
    icon: Sparkles,
    title: 'Smart AI Chat',
    description: 'Advanced conversational AI that understands context, writes code, and provides intelligent responses tailored to your needs.',
    color: 'from-[#3b82f6] to-[#8b5cf6]',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    glowColor: '#3b82f6',
  },
  {
    icon: Code2,
    title: '30+ AI Tools',
    description: 'Comprehensive suite of AI-powered tools for creative, development, business, and productivity tasks all in one place.',
    color: 'from-[#8b5cf6] to-[#06b6d4]',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    glowColor: '#8b5cf6',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with end-to-end encryption. Your data stays yours, always protected and confidential.',
    color: 'from-[#06b6d4] to-[#3b82f6]',
    shadowColor: 'rgba(6, 182, 212, 0.4)',
    glowColor: '#06b6d4',
  },
  {
    icon: Cpu,
    title: 'Developer Friendly',
    description: 'Built by developers, for developers. Clean APIs, excellent documentation, and powerful integrations ready to use.',
    color: 'from-[#3b82f6] to-[#8b5cf6]',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    glowColor: '#3b82f6',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Native app-like experience on any device. Responsive design that works beautifully everywhere you need it.',
    color: 'from-[#8b5cf6] to-[#06b6d4]',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    glowColor: '#8b5cf6',
  },
  {
    icon: Globe,
    title: 'Cross Platform',
    description: 'Available on Web, Android, iOS, Windows, macOS, and Linux. Your AI assistant, everywhere you work.',
    color: 'from-[#06b6d4] to-[#3b82f6]',
    shadowColor: 'rgba(6, 182, 212, 0.4)',
    glowColor: '#06b6d4',
  },
];

// Enhanced 3D Tilt Card Component with more effects
function Feature3DCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), { stiffness: 400, damping: 30 });
  
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-100, 100]), { stiffness: 200, damping: 20 });
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-100, 100]), { stiffness: 200, damping: 20 });
  
  const scale = useSpring(1, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, type: 'spring', stiffness: 100 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
      className="group relative cursor-pointer"
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `radial-gradient(circle at center, ${feature.shadowColor} 0%, transparent 70%)`,
        }}
        animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* 3D Card */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full p-6 bg-card/60 backdrop-blur-sm border border-[rgba(59,130,246,0.1)] rounded-2xl transition-colors duration-300 hover:bg-card/80 hover:border-[rgba(59,130,246,0.25)] overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />
        
        {/* Dynamic spotlight effect */}
        <motion.div
          style={{
            x: glowX,
            y: glowY,
            background: `radial-gradient(circle, ${feature.shadowColor} 0%, transparent 50%)`,
          }}
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-2xl"
        />
        
        {/* Animated border glow */}
        <motion.div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 0 30px ${feature.shadowColor}, 0 0 30px ${feature.shadowColor}`,
          }}
        />
        
        {/* Floating particles */}
        {isHovered && [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{ 
              x: Math.random() * 200 - 100, 
              y: 200,
              opacity: 0 
            }}
            animate={{ 
              y: -200,
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          />
        ))}
        
        {/* Icon - 3D elevated with enhanced animation */}
        <motion.div
          style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}
          className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br shadow-lg mb-5"
          initial={{ rotateY: 0 }}
          animate={isHovered ? { rotateY: 360 } : { rotateY: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <motion.div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color}`}
            animate={{
              boxShadow: [
                `0 0 20px ${feature.shadowColor}`,
                `0 0 40px ${feature.shadowColor}`,
                `0 0 20px ${feature.shadowColor}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-7 h-7 relative z-10"
          >
            <feature.icon className="w-7 h-7 text-white drop-shadow-lg" />
          </motion.div>
          
          {/* Icon particles */}
          <AnimatePresence>
            {isHovered && [...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/50 rounded-full"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: (i - 1) * 20,
                  y: -20,
                }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Title - 3D depth */}
        <motion.h3
          style={{ transform: 'translateZ(35px)' }}
          className="text-lg font-semibold text-foreground mb-2 relative z-10 group-hover:text-white transition-colors"
        >
          {feature.title}
        </motion.h3>
        
        {/* Description */}
        <motion.p
          style={{ transform: 'translateZ(20px)' }}
          className="text-sm text-muted-foreground leading-relaxed relative z-10 group-hover:text-white/80 transition-colors"
        >
          {feature.description}
        </motion.p>
        
        {/* Animated arrow indicator */}
        <motion.div
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10, opacity: 0 }}
          animate={isHovered ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ArrowRight className="w-5 h-5 text-white/50" />
          </motion.div>
        </motion.div>
        
        {/* Bottom gradient line with glow */}
        <motion.div 
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-2xl`}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isHovered ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ transformOrigin: 'left' }}
        />
        
        {/* Corner accent */}
        <motion.div
          className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at top right, ${feature.glowColor} 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      
      {/* Animated background lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"
            style={{ top: `${(i + 1) * 20}%` }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear', delay: i }}
          />
        ))}
      </div>
      
      {/* Enhanced 3D Floating orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 60%)',
          top: '5%',
          right: '5%',
          filter: 'blur(80px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.6, 0.4],
          rotateY: [0, 180, 360],
          x: [0, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
          bottom: '15%',
          left: '3%',
          filter: 'blur(70px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.5, 0.3],
          rotateX: [0, 180, 360],
          y: [0, -30, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 60%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Enhanced 3D */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="inline-flex items-center gap-2 px-6 py-3 glass-3d rounded-full mb-8 cursor-pointer shadow-3d relative overflow-hidden"
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
              <Zap className="w-5 h-5 text-[#3b82f6]" />
            </motion.div>
            <span className="text-sm font-semibold text-muted-foreground relative z-10">Powerful Features</span>
            
            {/* Stars decoration */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                className="absolute"
                style={{ right: `${10 + i * 15}%`, top: '20%' }}
              >
                <Star className="w-3 h-3 text-[#f59e0b]" />
              </motion.div>
            ))}
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
          >
            <span className="text-foreground">Built for </span>
            <motion.span 
              className="inline-block"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ 
                backgroundSize: '200% 200%',
              }}
            >
              <span className="text-gradient-animated">Performance</span>
            </motion.span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to harness the power of AI, designed with developers in mind.
          </motion.p>
        </motion.div>

        {/* Feature Cards Grid - Enhanced 3D */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Feature3DCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
        
        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-16"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 text-muted-foreground/50"
          >
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
            <Sparkles className="w-4 h-4" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
