'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const demoSequence = [
  { type: 'input', content: 'Write a quicksort function in Python' },
  { type: 'output', content: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Example usage
arr = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(arr))  # [1, 1, 2, 3, 6, 8, 10]` },
  { type: 'input', content: 'Explain how it works' },
  { type: 'output', content: `The quicksort algorithm uses divide-and-conquer:

1. **Base Case**: If array has ≤1 element, it's already sorted
2. **Pivot Selection**: Choose middle element as pivot
3. **Partition**: Split into three arrays:
   • left: elements smaller than pivot
   • middle: elements equal to pivot  
   • right: elements larger than pivot
4. **Recursion**: Recursively sort left and right
5. **Combine**: Concatenate sorted parts

Time Complexity: O(n log n) average, O(n²) worst case
Space Complexity: O(log n) for recursion stack` },
];

function TerminalLine({ content, isInput, delay }: { content: string; isInput: boolean; delay: number }) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= content.length) {
          setDisplayedContent(content.slice(0, index));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, isInput ? 20 : 5);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [content, delay, isInput]);

  return (
    <div className={`${isInput ? 'text-[#3b82f6]' : 'text-muted-foreground'}`}>
      {isInput && <span className="text-[#8b5cf6] mr-2 font-bold">$</span>}
      <span className="whitespace-pre-wrap font-mono text-sm">
        {displayedContent}
        {!isComplete && <span className="inline-block w-2 h-4 bg-[#3b82f6] animate-pulse ml-0.5 rounded-sm" />}
      </span>
    </div>
  );
}

// 3D Tilt Container
function TiltContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className={className}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function AIDemo() {
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  const handleCopy = () => {
    const allOutput = demoSequence.map(d => d.content).join('\n\n');
    navigator.clipboard.writeText(allOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplay = () => {
    setKey(prev => prev + 1);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      {/* 3D Floating orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          top: '10%',
          left: '5%',
          filter: 'blur(60px)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotateY: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 glass-3d rounded-full mb-6 cursor-pointer shadow-3d"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Terminal className="w-4 h-4 text-[#3b82f6]" />
            </motion.div>
            <span className="text-sm font-medium text-muted-foreground">Live Demo</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-foreground">See </span>
            <span className="text-gradient-animated">
              Brutal.ai
            </span>
            <span className="text-foreground"> in Action</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how Brutal.ai handles real coding tasks with precision and speed.
          </p>
        </motion.div>

        {/* Terminal - 3D Glass Style */}
        <TiltContainer className="max-w-4xl mx-auto">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#3b82f6]/20 via-[#8b5cf6]/20 to-[#06b6d4]/20 rounded-3xl blur-2xl opacity-50" />
            
            <div className="relative glass-3d rounded-2xl overflow-hidden shadow-3d">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(59,130,246,0.1)] bg-gradient-to-r from-[rgba(59,130,246,0.05)] to-[rgba(139,92,246,0.05)]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-xs text-[#3b82f6] ml-2 font-medium tracking-wide">brutal-ai-terminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReplay}
                    className="h-8 text-muted-foreground hover:text-[#3b82f6] hover:bg-[rgba(59,130,246,0.1)] rounded-xl"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Replay
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 text-muted-foreground hover:text-[#3b82f6] hover:bg-[rgba(59,130,246,0.1)] rounded-xl"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-[#3b82f6]" />
                        <span className="text-[#3b82f6]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Terminal content */}
              <div className="p-6 font-mono text-sm overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar bg-card/50">
                {demoSequence.map((item, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <TerminalLine
                      content={item.content}
                      isInput={item.type === 'input'}
                      delay={index === 0 ? 500 : demoSequence.slice(0, index).reduce((acc, d) => acc + d.content.length * (d.type === 'input' ? 20 : 5) + 500, 0)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Bottom gradient line */}
              <div className="h-1 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4]" />
            </div>
          </motion.div>
        </TiltContainer>
      </div>
    </section>
  );
}
