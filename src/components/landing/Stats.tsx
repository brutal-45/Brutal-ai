'use client';

import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Cpu, Clock, Zap, Shield } from 'lucide-react';

const stats = [
  {
    icon: Cpu,
    value: 10,
    suffix: 'M+',
    label: 'Queries Processed',
    description: 'AI requests handled with precision',
    color: 'from-[#3b82f6] to-[#8b5cf6]',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    icon: Shield,
    value: 99,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Users love the experience',
    color: 'from-[#8b5cf6] to-[#06b6d4]',
    shadowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    icon: Clock,
    value: 24,
    suffix: '/7',
    label: 'Availability',
    description: 'Always online, always ready',
    color: 'from-[#06b6d4] to-[#3b82f6]',
    shadowColor: 'rgba(6, 182, 212, 0.3)',
  },
  {
    icon: Zap,
    value: 100,
    suffix: 'ms',
    label: 'Response Time',
    description: 'Lightning-fast AI engine',
    color: 'from-[#3b82f6] to-[#8b5cf6]',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
  },
];

function CountUp({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value, inView]);
  
  return (
    <span className="tabular-nums text-gradient">
      {count}{suffix}
    </span>
  );
}

// 3D Stat Card
function Stat3DCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });
  
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]), { stiffness: 200, damping: 20 });
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-30, 30]), { stiffness: 200, damping: 20 });

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="group cursor-pointer"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full p-6 sm:p-8 glass-3d rounded-2xl"
      >
        {/* Dynamic glow effect */}
        <motion.div
          style={{
            x: glowX,
            y: glowY,
            background: `radial-gradient(circle, ${stat.shadowColor} 0%, transparent 70%)`,
          }}
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
        />
        
        {/* Icon - 3D */}
        <motion.div
          style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4 shadow-3d`}
        >
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            <stat.icon className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
        
        {/* Value - 3D */}
        <motion.div
          style={{ transform: 'translateZ(20px)' }}
          className="text-4xl sm:text-5xl font-bold mb-2"
        >
          <CountUp value={stat.value} suffix={stat.suffix} inView={inView} />
        </motion.div>
        
        {/* Label */}
        <motion.div
          style={{ transform: 'translateZ(15px)' }}
          className="text-base font-semibold text-foreground mb-1"
        >
          {stat.label}
        </motion.div>
        
        {/* Description */}
        <motion.p
          style={{ transform: 'translateZ(10px)' }}
          className="text-sm text-muted-foreground"
        >
          {stat.description}
        </motion.p>
        
        {/* Bottom gradient line */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </motion.div>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      {/* 3D Animated orbs */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          top: '20%',
          right: '15%',
          filter: 'blur(60px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotateY: [0, 180, 360],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          bottom: '25%',
          left: '10%',
          filter: 'blur(50px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.4, 1],
          rotateX: [0, 180, 360],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Animated data lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#3b82f6]/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      
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
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-2 h-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full"
            />
            <span className="text-sm font-medium text-muted-foreground">Trusted Worldwide</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-foreground">Trusted by </span>
            <span className="text-gradient-animated">
              Developers
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            High-performance AI infrastructure that scales with your needs.
          </p>
        </motion.div>

        {/* Stats Grid - 3D */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <Stat3DCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
