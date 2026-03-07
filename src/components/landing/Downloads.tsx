'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Download, Smartphone, Monitor, Apple, Globe, Terminal, Check, Star, Zap, Shield, Clock, ChevronRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useRef } from 'react';

const platforms = [
  {
    id: 'android',
    name: 'Android',
    icon: Smartphone,
    extension: 'APK',
    version: '2.4.1',
    size: '45 MB',
    features: ['Offline Mode', 'Push Notifications', 'Widget Support'],
    color: 'from-[#3b82f6] to-[#8b5cf6]',
  },
  {
    id: 'ios',
    name: 'iOS',
    icon: Apple,
    extension: 'App Store',
    version: '2.4.1',
    size: '52 MB',
    features: ['Siri Integration', 'Widgets', 'Face ID'],
    color: 'from-[#8b5cf6] to-[#06b6d4]',
  },
  {
    id: 'windows',
    name: 'Windows',
    icon: Monitor,
    extension: 'EXE',
    version: '2.4.1',
    size: '78 MB',
    features: ['System Tray', 'Global Hotkeys', 'Auto Updates'],
    color: 'from-[#06b6d4] to-[#3b82f6]',
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: Apple,
    extension: 'DMG',
    version: '2.4.1',
    size: '65 MB',
    features: ['Menu Bar App', 'Shortcuts', 'Handoff'],
    color: 'from-[#3b82f6] to-[#8b5cf6]',
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: Terminal,
    extension: 'AppImage',
    version: '2.4.1',
    size: '70 MB',
    features: ['Snap & Flatpak', 'CLI Mode', 'Self-updating'],
    color: 'from-[#8b5cf6] to-[#06b6d4]',
  },
  {
    id: 'web',
    name: 'Web App',
    icon: Globe,
    extension: 'PWA',
    version: 'Latest',
    size: 'Instant',
    features: ['No Install', 'Always Updated', 'Cross-platform'],
    color: 'from-[#06b6d4] to-[#3b82f6]',
  },
];

// 3D Download Card
function Download3DCard({ platform, index, isRecommended, onDownload }: { 
  platform: typeof platforms[0]; 
  index: number; 
  isRecommended?: boolean;
  onDownload: (platformId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="relative group cursor-pointer"
    >
      {/* Recommended badge */}
      {isRecommended && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white rounded-full font-semibold text-xs z-10 whitespace-nowrap shadow-glow-blue"
        >
          RECOMMENDED
        </motion.div>
      )}
      
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative p-6 h-full flex flex-col glass-3d rounded-2xl ${isRecommended ? 'border-[rgba(59,130,246,0.3)]' : ''}`}
      >
        {/* Dynamic glow effect */}
        <motion.div
          style={{
            x: glowX,
            y: glowY,
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)`,
          }}
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
        />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
            className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} shadow-3d`}
          >
            <platform.icon className="w-7 h-7 text-white" />
          </motion.div>
          {isRecommended && (
            <motion.div
              style={{ transform: 'translateZ(15px)' }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20"
            >
              <Star className="w-3 h-3 text-[#3b82f6] fill-[#3b82f6]" />
              <span className="text-xs text-[#3b82f6] font-semibold">BEST</span>
            </motion.div>
          )}
        </div>
        
        {/* Info */}
        <motion.div
          style={{ transform: 'translateZ(15px)' }}
          className="flex-1"
        >
          <h3 className="text-xl font-bold text-foreground mb-1">{platform.name}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 font-medium">
            <span className="flex items-center gap-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full"
              />
              v{platform.version}
            </span>
            <span>•</span>
            <span>{platform.size}</span>
          </div>
          
          {/* Features */}
          <div className="space-y-2 mb-6">
            {platform.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-[#3b82f6] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Download button - 3D */}
        <motion.div
          style={{ transform: 'translateZ(10px)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => onDownload(platform.id)}
            className={`w-full h-12 font-semibold rounded-xl shadow-3d ${isRecommended ? 'bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white btn-3d' : 'glass border-[rgba(59,130,246,0.2)] hover:bg-white/10 text-foreground'}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download {platform.extension}
            </span>
          </Button>
        </motion.div>
        
        {/* Bottom gradient line */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${platform.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </motion.div>
    </motion.div>
  );
}

export function Downloads() {
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);
  
  // Detect platform - only runs on client
  const detectedPlatform = useMemo(() => {
    if (typeof window === 'undefined') return 'web';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('linux')) return 'linux';
    if (ua.includes('windows')) return 'windows';
    return 'web';
  }, []);

  const handleDownload = (platformId: string) => {
    setDownloadStarted(platformId);
    setTimeout(() => setDownloadStarted(null), 3000);
  };

  // Sort platforms to show detected platform first
  const sortedPlatforms = useMemo(() => {
    return [...platforms].sort((a, b) => {
      if (a.id === detectedPlatform) return -1;
      if (b.id === detectedPlatform) return 1;
      return 0;
    });
  }, [detectedPlatform]);

  return (
    <section className="py-24 relative overflow-hidden" id="downloads">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      {/* 3D Floating orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          top: '10%',
          right: '5%',
          filter: 'blur(60px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotateY: [0, 180, 360],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
              <Download className="w-4 h-4 text-[#3b82f6]" />
            </motion.div>
            <span className="text-sm font-medium text-muted-foreground">All Platforms</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-foreground">Download </span>
            <span className="text-gradient-animated">
              Brutal.ai
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Get the full Brutal.ai experience on your device. Fast, free, and always up-to-date with the latest AI features.
          </p>
          
          {/* Quick stats - 3D */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { icon: Zap, text: 'Instant Setup' },
              { icon: Shield, text: 'Secure & Private' },
              { icon: Clock, text: 'Auto Updates' },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, rotateY: 10 }}
                className="flex items-center gap-2 text-muted-foreground glass px-4 py-2 rounded-xl cursor-pointer shadow-soft"
              >
                <item.icon className="w-4 h-4 text-[#3b82f6]" />
                <span className="font-semibold">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Download Cards Grid - 3D */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {sortedPlatforms.map((platform, index) => (
            <Download3DCard
              key={platform.id}
              platform={platform}
              index={index}
              isRecommended={platform.id === detectedPlatform}
              onDownload={handleDownload}
            />
          ))}
        </div>

        {/* QR Code Section - 3D */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <motion.div
            whileHover={{ rotateY: 5, rotateX: -5 }}
            className="p-8 glass-3d rounded-2xl shadow-3d"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* QR Code placeholder */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="shrink-0 w-32 h-32 bg-white p-2 rounded-xl shadow-soft"
              >
                <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMCAxMGgyMHYyMEgxMHptNSA1djEwaDEwVjE1em0tNSA1NWgyMHYyMEgxMHptNSA1djEwaDEwVjc1em0tNS0zMGgyMHYyMEgxMHptNSA1djEwaDEwVjUwek03MCAxMGgyMHYyMEg3MHptNSA1djEwaDEwVjE1em0tMjAgMGgyMHYyMEg1MHptNSA1djEwaDEwVjE1em0tMjAgMjBoMjB2MjBIMzB6bTUgNXYxMGgxMFY0MHptMTAgMGgyMHYyMEg2MHptNSA1djEwaDEwVjQwem0tMTAgMjBoMjB2MjBINTB6bTUgNXYxMGgxMFY2NXptMTUgMGgyMHYyMEg2MHptNSA1djEwaDEwVjY1eiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')] bg-contain bg-center bg-no-repeat rounded-lg" />
              </motion.div>
              
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Scan to Download</h3>
                <p className="text-muted-foreground mb-4">
                  Point your phone camera at this QR code to instantly download Brutal.ai on your mobile device.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="gap-2 glass border-[rgba(59,130,246,0.2)] hover:bg-white/10 font-semibold rounded-xl shadow-soft"
                  >
                    <QrCode className="w-4 h-4" />
                    Get Mobile App
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* What's New Section - 3D */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-6">What's New in v2.4.1</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Zap, title: '50% Faster', desc: 'Improved AI response speed', color: 'from-[#3b82f6] to-[#8b5cf6]' },
              { icon: Shield, title: 'Enhanced Privacy', desc: 'End-to-end encryption', color: 'from-[#8b5cf6] to-[#06b6d4]' },
              { icon: Star, title: '21 New Tools', desc: 'More AI capabilities', color: 'from-[#06b6d4] to-[#3b82f6]' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 10 }}
                className="p-4 glass-3d rounded-xl cursor-pointer shadow-3d"
              >
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-soft`}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </motion.div>
                <div className="font-bold text-foreground text-sm">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Download notification */}
      {downloadStarted && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white rounded-2xl shadow-3d z-50"
        >
          <div className="flex items-center gap-2 font-semibold">
            <Check className="w-5 h-5" />
            <span>Download started for {platforms.find(p => p.id === downloadStarted)?.name}!</span>
          </div>
        </motion.div>
      )}
    </section>
  );
}
