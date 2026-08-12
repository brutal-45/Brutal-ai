'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ToolIconProps {
  toolId: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 64,
};

export function ToolIcon({ toolId, alt, size = 'md', className }: ToolIconProps) {
  const iconSize = sizeMap[size];
  
  return (
    <Image
      src={`/tools/${toolId}.png`}
      alt={alt || `${toolId} icon`}
      width={iconSize}
      height={iconSize}
      className={cn('object-contain', className)}
      loading="lazy"
    />
  );
}

// Helper to get tool icon path
export function getToolIconPath(toolId: string): string {
  return `/tools/${toolId}.png`;
}
