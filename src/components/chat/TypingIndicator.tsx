'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <div className="flex gap-3 sm:gap-4 px-2 sm:px-4 py-3">
        {/* Avatar - Aesthetic Style */}
        <div className="flex-shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            {/* Avatar glow */}
            <div className="absolute inset-0 bg-[#3b82f6]/30 blur-xl scale-150" />
            
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] shadow-glow-blue">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Typing Animation - Aesthetic Glass Style */}
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-[rgba(59,130,246,0.15)] shadow-soft">
            {/* Animated dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            
            {/* Thinking text */}
            <span className="text-xs font-medium text-muted-foreground">
              Thinking...
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
