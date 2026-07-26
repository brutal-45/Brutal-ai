'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Share2, Download, Sparkles } from 'lucide-react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { jsPDF } from 'jspdf'; 

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  isLast?: boolean;
  isDarkMode?: boolean;
  isStreaming?: boolean;
  onStreamingComplete?: () => void;
}

export function ChatMessage({ 
  message, 
  onRegenerate, 
  isLast, 
  isDarkMode,
  isStreaming = false,
  onStreamingComplete,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(!isStreaming);
  const indexRef = useRef(0);
  const contentRef = useRef(message.content);
  const isUser = message.role === 'user';

  // Update content ref when message changes
  useEffect(() => {
    contentRef.current = message.content;
  }, [message.content]);

  // Typewriter effect for streaming messages
  useEffect(() => {
    if (isUser) return;
    
    const animationFrameId = { current: 0 };
    const timeoutId = { current: 0 };

    if (!isStreaming) {
      timeoutId.current = window.setTimeout(() => {
        setDisplayedContent(message.content);
        setIsComplete(true);
      }, 0);
      return () => window.clearTimeout(timeoutId.current);
    }

    // Typewriter effect
    const startTyping = () => {
      const typingSpeed = 10;
      
      const interval = setInterval(() => {
        if (indexRef.current < contentRef.current.length) {
          const chunkSize = 3;
          const endIndex = Math.min(indexRef.current + chunkSize, contentRef.current.length);
          setDisplayedContent(contentRef.current.slice(0, endIndex));
          indexRef.current = endIndex;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onStreamingComplete?.();
        }
      }, typingSpeed);

      return () => clearInterval(interval);
    };

    animationFrameId.current = window.requestAnimationFrame(() => {
      startTyping();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId.current);
      window.clearTimeout(timeoutId.current);
    };
  }, [message.content, isStreaming, isUser, onStreamingComplete]);

  // Reset when message changes
  useEffect(() => {
    if (isUser) return;
    indexRef.current = 0;
    const timeoutId = setTimeout(() => {
      setDisplayedContent('');
      setIsComplete(!isStreaming);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [message.id, isUser, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = 20;

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(message.content, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    doc.save(`brutal-ai-message-${Date.now()}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Brutal.ai Response',
          text: message.content.slice(0, 200) + '...',
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  // User message - Aesthetic Style
  if (isUser) {
    return (
      <div className="flex justify-end px-2 sm:px-4 py-2 group">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-[85%] sm:max-w-[75%]"
        >
          <div className="chat-bubble-user">
            <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.7]">{message.content}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // AI message - full width with avatar
  const contentToShow = isStreaming ? displayedContent : message.content;
  const showCursor = isStreaming && !isComplete && displayedContent.length < message.content.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full py-2 group transition-colors overflow-hidden"
    >
      <div className="flex gap-3 sm:gap-4 px-2 sm:px-4 max-w-3xl mx-auto">
        {/* Avatar - Aesthetic Style */}
        <div className="flex-shrink-0 pt-1">
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

        {/* Message Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-[15px] leading-[1.75] text-foreground">
            <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-wrap-anywhere">
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
                          className="bg-[rgba(59,130,246,0.1)] text-[#3b82f6] px-2 py-0.5 text-sm rounded-lg font-medium"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    
                    return (
                      <div className="relative my-4 -mx-1 sm:mx-0 rounded-xl overflow-hidden border border-[rgba(59,130,246,0.2)] shadow-soft">
                        <div className="flex items-center justify-between bg-card/80 backdrop-blur-sm px-4 py-2.5 text-xs text-muted-foreground border-b border-[rgba(59,130,246,0.1)]">
                          <span className="font-medium text-[#3b82f6]">{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => handleCopyCode(codeString)}
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-[rgba(59,130,246,0.1)]"
                          >
                            {copiedCode === codeString ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[#3b82f6]" />
                                <span className="text-[#3b82f6]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <SyntaxHighlighter
                            language={match ? match[1] : 'text'}
                            style={isDarkMode ? oneDark : oneLight}
                            customStyle={{
                              margin: 0,
                              fontSize: '0.8125rem',
                              borderRadius: 0,
                              background: isDarkMode ? '#0e0e12' : '#FAFBFC',
                              maxWidth: '100%',
                            }}
                            codeTagProps={{
                              style: {
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                wordBreak: 'break-all',
                                whiteSpace: 'pre-wrap',
                              }
                            }}
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                  p({ children }) {
                    return <p className="mb-4 last:mb-0 leading-[1.75]">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-[#3b82f6]">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-[#8b5cf6]">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="leading-[1.75]">{children}</li>;
                  },
                  h1({ children }) {
                    return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-gradient">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0 text-[#3b82f6]">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0 text-[#8b5cf6]">{children}</h3>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-[#3b82f6] pl-4 py-2 italic text-muted-foreground my-4 bg-[rgba(59,130,246,0.05)] rounded-r-xl">
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
                        className="text-[#3b82f6] hover:underline underline-offset-2 transition-colors font-medium"
                      >
                        {children}
                      </a>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4 rounded-xl border border-[rgba(59,130,246,0.15)]">
                        <table className="min-w-full border-collapse">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="border-b border-[rgba(59,130,246,0.15)] bg-[rgba(59,130,246,0.05)] px-4 py-3 text-left font-semibold text-foreground">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="border-b border-[rgba(59,130,246,0.1)] px-4 py-2.5">{children}</td>;
                  },
                }}
              >
                {contentToShow || ''}
              </ReactMarkdown>
              {/* Typing cursor */}
              {showCursor && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-block w-0.5 h-5 bg-[#3b82f6] ml-0.5 rounded-full"
                  style={{
                    animation: 'blink 1s step-end infinite',
                  }}
                />
              )}
            </div>
          </div>

          {/* Action Buttons - only show when complete */}
          {(isComplete || !isStreaming) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-1 mt-3 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3 text-xs font-medium rounded-xl border border-transparent hover:border-[rgba(59,130,246,0.3)] gap-1.5 hover:bg-[rgba(59,130,246,0.08)]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#3b82f6]" />
                  </>
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(liked === true ? null : true)}
                className={cn(
                  "h-8 px-3 text-xs font-medium rounded-xl gap-1.5 border border-transparent",
                  liked === true ? "text-[#3b82f6] border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)]" : "hover:border-[rgba(59,130,246,0.3)] hover:bg-[rgba(59,130,246,0.08)]"
                )}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(liked === false ? null : false)}
                className={cn(
                  "h-8 px-3 text-xs font-medium rounded-xl gap-1.5 border border-transparent",
                  liked === false ? "text-red-500 border-red-500/30 bg-red-500/10" : "hover:border-red-500/30 hover:bg-red-500/10"
                )}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 px-3 text-xs font-medium rounded-xl border border-transparent hover:border-[rgba(59,130,246,0.3)] gap-1.5 hover:bg-[rgba(59,130,246,0.08)]"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 px-3 text-xs font-medium rounded-xl border border-transparent hover:border-[rgba(59,130,246,0.3)] gap-1.5 hover:bg-[rgba(59,130,246,0.08)]"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              
              {isLast && onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                  className="h-8 px-3 text-xs font-medium rounded-xl border border-transparent hover:border-[rgba(59,130,246,0.3)] gap-1.5 hover:bg-[rgba(59,130,246,0.08)]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
