'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Download, ExternalLink, Code, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TypewriterPreviewProps {
  content: string;
  isTyping?: boolean;
  typingSpeed?: number;
  isDarkMode?: boolean;
  onComplete?: () => void;
  showPreview?: boolean;
  className?: string;
}

// HTML Preview Component
function HTMLPreview({ html, isDarkMode }: { html: string; isDarkMode?: boolean }) {
  return (
    <div 
      className={cn(
        "rounded-xl border border-border/50 overflow-hidden",
        isDarkMode ? "bg-white" : "bg-white"
      )}
    >
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-2 border-b border-border/50 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">Preview</span>
      </div>
      <div 
        className="p-4 min-h-[200px] max-h-[500px] overflow-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// Code Preview Component
function CodePreview({ 
  code, 
  language, 
  isDarkMode,
  onCopy 
}: { 
  code: string; 
  language: string; 
  isDarkMode?: boolean;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between bg-muted/80 px-4 py-2 border-b border-border/50">
        <span className="text-xs font-mono font-medium text-muted-foreground">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDarkMode ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          fontSize: '0.8125rem',
          borderRadius: 0,
          background: isDarkMode ? '#1e1e1e' : '#fafafa',
          maxHeight: '400px',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function TypewriterPreview({
  content,
  isTyping = false,
  typingSpeed = 10,
  isDarkMode = true,
  onComplete,
  showPreview = true,
  className,
}: TypewriterPreviewProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'preview' | 'raw'>('formatted');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract code blocks and check for HTML
  const codeBlocks = useCallback(() => {
    const blocks: { language: string; code: string }[] = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }
    return blocks;
  }, [content]);

  const hasHTML = codeBlocks().some(block => 
    block.language === 'html' || block.code.includes('<!DOCTYPE') || block.code.includes('<html')
  );

  // Handle non-typing mode - set content directly via initial state or memo
  const initialContent = !isTyping ? content : '';
  const [displayedContent, setDisplayedContent] = useState(initialContent);
  const [isComplete, setIsComplete] = useState(!isTyping);
  const indexRef = useRef(0);
  const contentRef = useRef(content);

  // Update content ref
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Typewriter effect - use requestAnimationFrame for async updates
  useEffect(() => {
    const animationFrameId = { current: 0 };
    const timeoutId = { current: 0 };

    if (!isTyping) {
      // For non-typing mode, use setTimeout to avoid synchronous setState
      timeoutId.current = window.setTimeout(() => {
        setDisplayedContent(content);
        setIsComplete(true);
      }, 0);
      return () => window.clearTimeout(timeoutId.current);
    }

    // Reset state asynchronously
    const resetAndStart = () => {
      setDisplayedContent('');
      setIsComplete(false);
      indexRef.current = 0;

      const interval = setInterval(() => {
        if (indexRef.current < contentRef.current.length) {
          const chunkSize = Math.ceil(typingSpeed / 5);
          const endIndex = Math.min(indexRef.current + chunkSize, contentRef.current.length);
          setDisplayedContent(contentRef.current.slice(0, endIndex));
          indexRef.current = endIndex;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, typingSpeed);

      return () => clearInterval(interval);
    };

    // Use requestAnimationFrame to defer state updates
    animationFrameId.current = window.requestAnimationFrame(() => {
      resetAndStart();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId.current);
      window.clearTimeout(timeoutId.current);
    };
  }, [content, isTyping, typingSpeed, onComplete]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brutal-ai-output-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    const contentToRender = isTyping ? displayedContent : content;

    if (viewMode === 'raw') {
      return (
        <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/30 p-4 rounded-xl overflow-auto max-h-[600px]">
          {contentToRender}
        </pre>
      );
    }

    if (viewMode === 'preview' && hasHTML) {
      const htmlBlock = codeBlocks().find(block => 
        block.language === 'html' || block.code.includes('<!DOCTYPE') || block.code.includes('<html')
      );
      if (htmlBlock) {
        return <HTMLPreview html={htmlBlock.code} isDarkMode={isDarkMode} />;
      }
    }

    // Formatted view with markdown
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              const isInline = !match && !codeString.includes('\n');
              
              if (isInline) {
                return (
                  <code 
                    className="bg-muted text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded text-sm font-mono border border-border/50"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              
              return (
                <CodePreview
                  code={codeString}
                  language={match ? match[1] : 'text'}
                  isDarkMode={isDarkMode}
                  onCopy={() => {}}
                />
              );
            },
            pre({ children }) {
              return <>{children}</>;
            },
            p({ children }) {
              return <p className="mb-3 last:mb-0 leading-[1.75] tracking-wide">{children}</p>;
            },
            ul({ children }) {
              return <ul className="list-disc pl-5 mb-3 space-y-1.5 marker:text-purple-500">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal pl-5 mb-3 space-y-1.5 marker:text-purple-500">{children}</ol>;
            },
            li({ children }) {
              return <li className="leading-[1.75] tracking-wide">{children}</li>;
            },
            h1({ children }) {
              return <h1 className="text-2xl font-bold mb-3 mt-5 first:mt-0 text-foreground">{children}</h1>;
            },
            h2({ children }) {
              return <h2 className="text-xl font-bold mb-2 mt-4 first:mt-0 text-foreground">{children}</h2>;
            },
            h3({ children }) {
              return <h3 className="text-lg font-semibold mb-2 mt-3 first:mt-0 text-foreground">{children}</h3>;
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-purple-500 pl-4 py-1 italic text-muted-foreground my-3 bg-muted/30 rounded-r-lg">
                  {children}
                </blockquote>
              );
            },
            a({ href, children }) {
              return (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-500 hover:text-purple-600 underline underline-offset-2"
                >
                  {children}
                </a>
              );
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto my-3 rounded-lg border border-border/50">
                  <table className="min-w-full border-collapse">
                    {children}
                  </table>
                </div>
              );
            },
            th({ children }) {
              return <th className="border-b border-border bg-muted/50 px-4 py-2.5 text-left font-semibold text-foreground">{children}</th>;
            },
            td({ children }) {
              return <td className="border-b border-border/50 px-4 py-2 text-foreground">{children}</td>;
            },
          }}
        >
          {contentToRender}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-border/50 bg-card/50 overflow-hidden",
        isFullscreen && "fixed inset-4 z-50 max-h-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground ml-2">
            {isTyping && !isComplete ? 'Generating...' : 'Output'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setViewMode('formatted')}
              className={cn(
                "px-2 py-1 text-xs rounded-md transition-colors",
                viewMode === 'formatted' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            {hasHTML && (
              <button
                onClick={() => setViewMode('preview')}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  viewMode === 'preview' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setViewMode('raw')}
              className={cn(
                "px-2 py-1 text-xs rounded-md transition-colors",
                viewMode === 'raw' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs ml-1 text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-xs ml-1">Copy</span>
              </>
            )}
          </Button>

          {/* Download Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7 px-2"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "p-4 overflow-auto",
        isFullscreen ? "max-h-[calc(100vh-8rem)]" : "max-h-[600px]"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && !isComplete && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block w-2 h-4 bg-purple-500 ml-1"
          />
        )}
      </div>
    </motion.div>
  );
}
