'use client';

import { motion } from 'framer-motion';
import { Sparkles, Code2, Mail, Lightbulb } from 'lucide-react';

const suggestions = [
  { icon: Lightbulb, text: 'Explain quantum computing in simple terms', color: 'bg-[#F97316]' },
  { icon: Code2, text: 'Write a Python function to sort a list', color: 'bg-[#F97316]/80' },
  { icon: Mail, text: 'Help me write a professional email', color: 'bg-[#F97316]/60' },
  { icon: Sparkles, text: 'Generate creative ideas for a mobile app', color: 'bg-[#F97316]/40' },
];

interface WelcomeProps {
  onSuggestionClick?: (text: string) => void;
}

export function Welcome({ onSuggestionClick }: WelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-2xl mx-auto"
      >
        {/* Logo - Neo-Brutality Style */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#F97316]/30 blur-xl scale-150" />
            <img 
              src="/logo.png" 
              alt="Brutal.ai" 
              className="relative h-20 w-20 border-3 border-[#F97316] shadow-amber"
            />
          </div>
        </motion.div>
        
        {/* Title - Neo-Brutality */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl sm:text-3xl font-black text-foreground mb-3 tracking-tight font-stretch-125"
        >
          HOW CAN I HELP YOU TODAY?
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[#94A3B8] mb-10 text-sm sm:text-base font-medium tracking-wide"
        >
          <span className="text-[#F97316] font-bold">Smarter.</span>{' '}
          <span className="text-[#F97316] font-bold">Faster.</span>{' '}
          <span className="text-[#F97316] font-bold">Brutal.</span>
        </motion.p>

        {/* Suggestion Cards - Neo-Brutality Style */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl"
        >
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.text}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              onClick={() => onSuggestionClick?.(suggestion.text)}
              className="group relative flex items-start gap-4 p-5 text-left transition-all duration-100 border-2 border-black dark:border-[#333] bg-card hover:border-[#F97316] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-clamp-sm active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              {/* Icon */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black ${suggestion.color}`}>
                <suggestion.icon className="h-5 w-5 text-black" />
              </div>
              
              {/* Text */}
              <span className="text-sm text-[#94A3B8] group-hover:text-foreground transition-colors leading-relaxed font-medium">
                {suggestion.text}
              </span>
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </motion.div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-8 text-[10px] text-[#64748b] font-mono tracking-wider uppercase"
        >
          Type a message or click a suggestion to start
        </motion.p>
      </motion.div>
    </div>
  );
}
