'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformance } from '@/hooks/use-performance';
import styles from './SplashScreen.module.css';

// Boot sequence messages - minimal aesthetic
const BOOT_MESSAGES = [
  'Initializing...',
  'Loading AI Models...',
  'Connecting...',
  'Ready.',
];

// 3D Particle system using canvas - Blue to Purple theme
function ParticleCanvas({ count }: { count: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    size: number;
    opacity: number;
    hue: number;
  }>>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize subtle particles - blue to purple range
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: Math.random() * 1.5 + 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      hue: 210 + Math.random() * 60, // Blue (210) to Purple (270) range
    }));

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sort by z for depth effect
      const sortedParticles = [...particlesRef.current].sort((a, b) => b.z - a.z);

      sortedParticles.forEach((p) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.z -= p.vz;

        // Reset particle when it reaches the camera
        if (p.z <= 0) {
          p.z = 1000;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        }

        // Project 3D to 2D
        const scale = 1000 / (1000 + p.z);
        const projectedX = canvas.width / 2 + (p.x - canvas.width / 2) * scale;
        const projectedY = canvas.height / 2 + (p.y - canvas.height / 2) * scale;
        const projectedSize = p.size * scale;

        // Skip if out of bounds
        if (projectedX < -50 || projectedX > canvas.width + 50 ||
            projectedY < -50 || projectedY > canvas.height + 50) {
          return;
        }

        // Calculate depth-based opacity
        const depthOpacity = p.opacity * (1 - p.z / 1000);

        // Draw particle with soft glow
        const gradient = ctx.createRadialGradient(
          projectedX, projectedY, 0,
          projectedX, projectedY, projectedSize * 4
        );
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${depthOpacity})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 80%, 55%, ${depthOpacity * 0.2})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(projectedX, projectedY, projectedSize * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${depthOpacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [count]);

  return <canvas ref={canvasRef} className={styles.particleCanvas} />;
}

// Typing text component
function TypingText({ 
  text, 
  onComplete, 
  isActive 
}: { 
  text: string; 
  onComplete: () => void;
  isActive: boolean;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        setTimeout(() => onCompleteRef.current(), 100);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [text, isActive]);

  if (!isActive && !isComplete) {
    return (
      <span className={styles.bootContent}>
        <span className={styles.bootPrefix}>{'>'}</span>
        {text}
      </span>
    );
  }

  return (
    <span className={`${styles.bootContent} ${styles.bootActive}`}>
      <span className={styles.bootPrefix}>{'>'}</span>
      {displayedText}
      {!isComplete && <span className={styles.cursor} />}
    </span>
  );
}

// Circular loader with gradient
function CircularLoader({ progress }: { progress: number }) {
  const size = 100;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={styles.circularLoader}>
      <svg className={styles.loaderSvg} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          className={styles.loaderBackground}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        {/* Progress circle */}
        <circle
          className={styles.loaderProgress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#loaderGradient)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          style={{
            transition: 'stroke-dashoffset 0.3s ease-out',
          }}
        />
      </svg>
      <motion.span 
        className={styles.percentageText}
        key={Math.floor(progress / 5)}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {Math.floor(progress)}%
      </motion.span>
    </div>
  );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className={styles.progressBar}>
      <motion.div
        className={styles.progressBarFill}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Energy pulse wave effect
function EnergyPulse({ trigger }: { trigger: boolean }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className={styles.energyPulse}
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 5, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}

// Light flash effect
function LightFlash({ trigger }: { trigger: boolean }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className={styles.lightFlash}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </AnimatePresence>
  );
}

// Light beam sweep
function LightBeamSweep({ trigger }: { trigger: boolean }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className={styles.lightBeam}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.lightBeamLine}
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Particle formation effect - Blue to Purple
function ParticleFormation({ active }: { active: boolean }) {
  const particles = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    angle: (i / 40) * Math.PI * 2,
    radius: 100 + Math.random() * 80,
    delay: i * 0.015,
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((particle, i) => {
        const startX = Math.cos(particle.angle) * particle.radius;
        const startY = Math.sin(particle.angle) * particle.radius;
        const hue = 210 + (i % 3) * 20; // Blue to Purple range
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + Math.random() * 3,
              height: 3 + Math.random() * 3,
              background: `hsl(${hue}, 80%, 60%)`,
              boxShadow: `0 0 8px hsl(${hue}, 80%, 60%)`,
            }}
            initial={{
              x: startX,
              y: startY,
              opacity: 0,
              scale: 0,
            }}
            animate={active ? {
              x: 0,
              y: 0,
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            } : {}}
            transition={{
              duration: 0.6,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

// Main splash screen component
interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const performanceConfig = usePerformance();
  const [phase, setPhase] = useState<'boot' | 'logo' | 'loading' | 'complete'>('boot');
  const [bootIndex, setBootIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showPulse, setShowPulse] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showBeam, setShowBeam] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Boot sequence timing - faster for aesthetic
  const handleBootMessageComplete = useCallback(() => {
    if (bootIndex < BOOT_MESSAGES.length - 1) {
      setTimeout(() => setBootIndex(prev => prev + 1), 80);
    } else {
      setTimeout(() => {
        setPhase('logo');
        setShowPulse(true);
      }, 150);
    }
  }, [bootIndex]);

  // Logo phase - start loading after reveal
  useEffect(() => {
    if (phase !== 'logo') return;

    const timer = setTimeout(() => {
      setPhase('loading');
    }, 600);

    return () => clearTimeout(timer);
  }, [phase]);

  // Loading progress animation - smoother
  useEffect(() => {
    if (phase !== 'loading') return;

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowFlash(true);
          setShowBeam(true);
          setTimeout(() => {
            setPhase('complete');
            setIsExiting(true);
            setTimeout(onComplete, 400);
          }, 300);
          return 100;
        }
        // Smooth acceleration
        const increment = prev < 50 ? 3 : prev < 80 ? 4 : 6;
        return Math.min(prev + increment, 100);
      });
    }, 25);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <motion.div
      className={`${styles.splashContainer} ${isExiting ? styles.fadeOut : ''}`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Floating gradient orbs */}
      <div className={styles.floatOrb + ' ' + styles.floatOrb1} />
      <div className={styles.floatOrb + ' ' + styles.floatOrb2} />
      <div className={styles.floatOrb + ' ' + styles.floatOrb3} />

      {/* Background layers */}
      <div className={styles.backgroundLayer}>
        <div className={styles.gradientWave} />
        <div className={styles.lightWave} />
        <div className={styles.gridOverlay} />
        <div className={styles.ambientPulse} />
        <div className={styles.particleGlow} />
      </div>

      {/* Canvas-based particles */}
      <ParticleCanvas count={performanceConfig.particleCount} />

      {/* Boot Phase */}
      <AnimatePresence>
        {phase === 'boot' && (
          <motion.div
            className={styles.bootContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.bootText}>
              {BOOT_MESSAGES.slice(0, bootIndex + 1).map((msg, i) => (
                <motion.div
                  key={i}
                  className={styles.bootLine}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <TypingText 
                    text={msg} 
                    onComplete={handleBootMessageComplete}
                    isActive={i === bootIndex}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo Phase */}
      <AnimatePresence>
        {(phase === 'logo' || phase === 'loading' || phase === 'complete') && (
          <motion.div
            className={styles.logoContainer}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Energy pulse */}
            <EnergyPulse trigger={showPulse} />
            
            {/* Light flash */}
            <LightFlash trigger={showFlash} />

            {/* Logo wrapper */}
            <div className={styles.logoWrapper}>
              {/* Rotating gradient halo */}
              <div className={styles.rotatingRing} />
              
              {/* Inner breathing ring */}
              <div className={styles.innerRing} />
              
              {/* Particle formation */}
              <ParticleFormation active={phase === 'logo'} />
              
              {/* Logo image */}
              <motion.img
                src="/logo.png"
                alt="Brutal.ai"
                className={styles.logoImage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
              />
              
              {/* Light beam sweep */}
              <LightBeamSweep trigger={showBeam} />
            </div>

            {/* Brand name */}
            <motion.h1
              className={styles.brandName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              BRUTAL.AI
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className={styles.tagline}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Intelligence Activated.
            </motion.p>

            {/* Loading indicator */}
            {phase === 'loading' && (
              <motion.div
                className={styles.loadingSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CircularLoader progress={loadingProgress} />
                <ProgressBar progress={loadingProgress} />
              </motion.div>
            )}
            
            {/* Footer */}
            <motion.p
              className={styles.footer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Developed under BRUTALTOOLS
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
