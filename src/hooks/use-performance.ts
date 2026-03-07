'use client';

import { useState, useEffect } from 'react';

type PerformanceTier = 'low' | 'medium' | 'high';

interface PerformanceConfig {
  tier: PerformanceTier;
  particleCount: number;
  enableBlur: boolean;
  enableShadows: boolean;
  animationComplexity: number;
}

const PERFORMANCE_CONFIGS: Record<PerformanceTier, PerformanceConfig> = {
  low: {
    tier: 'low',
    particleCount: 15,
    enableBlur: false,
    enableShadows: false,
    animationComplexity: 0.5,
  },
  medium: {
    tier: 'medium',
    particleCount: 30,
    enableBlur: true,
    enableShadows: true,
    animationComplexity: 0.75,
  },
  high: {
    tier: 'high',
    particleCount: 50,
    enableBlur: true,
    enableShadows: true,
    animationComplexity: 1,
  },
};

export function usePerformance(): PerformanceConfig {
  const [config, setConfig] = useState<PerformanceConfig>(PERFORMANCE_CONFIGS.medium);

  useEffect(() => {
    const detectPerformance = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        setConfig(PERFORMANCE_CONFIGS.low);
        return;
      }

      // Check device memory (if available)
      const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      
      // Check hardware concurrency
      const cores = navigator.hardwareConcurrency || 4;
      
      // Check if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Determine performance tier
      let tier: PerformanceTier = 'medium';
      
      if (isMobile || (deviceMemory && deviceMemory < 4) || cores < 4) {
        tier = 'low';
      } else if (cores >= 8 && (!deviceMemory || deviceMemory >= 8)) {
        tier = 'high';
      } else if (deviceMemory && deviceMemory < 8) {
        tier = 'medium';
      }
      
      // Also check screen size as a proxy for device capability
      const isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen && tier === 'high') {
        tier = 'medium';
      }
      
      setConfig(PERFORMANCE_CONFIGS[tier]);
    };

    detectPerformance();

    // Re-detect on resize
    window.addEventListener('resize', detectPerformance);
    return () => window.removeEventListener('resize', detectPerformance);
  }, []);

  return config;
}
