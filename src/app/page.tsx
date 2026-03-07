'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Wrench, X, ChevronRight, Image as ImageIcon, Wand2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { InputBar } from '@/components/chat/InputBar';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ToolsSheet } from '@/components/chat/ToolsSheet';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { AIDemo } from '@/components/landing/AIDemo';
import { Stats } from '@/components/landing/Stats';
import { Downloads } from '@/components/landing/Downloads';
import { ToolsHub } from '@/components/landing/ToolsHub';
import { CTA } from '@/components/landing/CTA';
import { ImageGenerator } from '@/components/tools/ImageGenerator';
import { ImageToolsHub } from '@/components/tools/ImageToolsHub';
import { ToolWorkspace } from '@/components/tools/ToolWorkspace';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { useChatStore, UploadedFile } from '@/store/chat-store';
import { useAppStore } from '@/store/app-store';
import { type Tool, allTools } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export default function Home() {
  const { 
    conversations, 
    isTyping, 
    sidebarOpen, 
    createConversation,
    getCurrentConversation,
    addMessage, 
    setTyping, 
    setCurrentTool,
    setSidebarOpen, 
    toggleSidebar,
  } = useChatStore();
  const { currentView, setCurrentView, selectedToolId, setSelectedToolId } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolPageOpen, setToolPageOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);
  const [isStreamingMessage, setIsStreamingMessage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const currentConversation = getCurrentConversation();
  const messages = currentConversation?.messages || [];
  const currentTool = selectedToolId ? allTools.find(t => t.id === selectedToolId) : null;

  // Fix hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setTimeout(() => setSplashComplete(true), 100);
  }, []);

  // Create new conversation on first load
  useEffect(() => {
    if (mounted && conversations.length === 0 && currentView === 'chat') {
      createConversation();
    }
  }, [mounted, conversations.length, currentView, createConversation]);

  // Smooth auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  // Fast scroll for typewriter effect
  const scrollToBottomFast = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, []);

  // Scroll when messages or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Fast scroll during streaming
  useEffect(() => {
    if (isStreamingMessage) {
      const interval = setInterval(() => {
        scrollToBottomFast();
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isStreamingMessage, scrollToBottomFast]);

  // Stop generation function
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setTyping(false);
    setIsGenerating(false);
    setIsStreamingMessage(false);
  }, [setTyping]);

  const sendMessage = useCallback(async (content: string, files?: UploadedFile[]) => {
    // Build message with file context
    let messageContent = content;
    if (files && files.length > 0) {
      const fileInfo = files.map(f => `[Attached: ${f.name}]`).join(' ');
      messageContent = `${fileInfo}\n\n${content}`;
    }
    
    // Add user message
    addMessage({ role: 'user', content: messageContent });
    setTyping(true);
    setIsGenerating(true);

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Prepare messages for API
      const apiMessages = [...messages, { role: 'user' as const, content: messageContent }].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortController.signal,
      });

      const data = await response.json();

      // Handle missing API key error
      if (data.code === 'MISSING_API_KEY') {
        addMessage({ 
          role: 'assistant', 
          content: `🔑 **API Key Required**

To use Brutal.ai, you need to add your API key:

**On Vercel:**
${data.instructions?.vercel?.join('\n') || '1. Go to Settings → Environment Variables\n2. Add ZAI_API_KEY = your-api-key\n3. Redeploy'}

**Local Development:**
${data.instructions?.local?.join('\n') || '1. Create .env file\n2. Add ZAI_API_KEY=your-api-key\n3. Restart server'}` 
        });
        return;
      }

      if (response.ok && data.response) {
        addMessage({ role: 'assistant', content: data.response });
        setIsStreamingMessage(true);
      } else if (data.error) {
        addMessage({ role: 'assistant', content: `**Error:** ${data.error}\n\n${data.message || ''}` });
      } else {
        addMessage({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was aborted, add a message indicating stop
        addMessage({ role: 'assistant', content: '⏹️ *Generation stopped*' });
      } else {
        console.error('Chat error:', error);
        addMessage({ role: 'assistant', content: 'Sorry, I encountered an error. Please check your connection and try again.' });
      }
    } finally {
      setTyping(false);
      setCurrentTool(null);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [messages, addMessage, setTyping, setCurrentTool]);

  const handleToolSelect = (tool: Tool) => {
    setSelectedToolId(tool.id);
    setCurrentView('tool');
    setToolsOpen(false);
    setSidebarOpen(false);
  };

  const handleRegenerate = useCallback(async () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');
    if (!lastUserMessage) return;
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Tool Workspace View
  if (currentView === 'tool' && selectedToolId) {
    const tool = allTools.find(t => t.id === selectedToolId);
    const isImageTool = tool?.isImageTool;
    
    return (
      <div className="h-screen bg-background flex flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[rgba(59,130,246,0.1)] bg-background/80 backdrop-blur-xl px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setCurrentView('landing');
                setSelectedToolId(null);
              }}
              className="h-9 w-9 rounded-xl hover:bg-[rgba(59,130,246,0.1)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <button 
              onClick={() => {
                setCurrentView('landing');
                setSelectedToolId(null);
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.png" 
                alt="Brutal.ai" 
                className="h-8 w-8 rounded-xl"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-sm">Brutal.ai</span>
                <span className="text-[10px] text-muted-foreground">{tool?.name || 'Tool'}</span>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {isImageTool && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentView('image-tools');
                  setSelectedToolId(null);
                }}
                className="gap-2 rounded-xl"
              >
                <Wand2 className="h-4 w-4" />
                <span className="hidden sm:inline">Image Tools</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentView('chat');
                setSelectedToolId(null);
              }}
              className="gap-2 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
              Chat
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <ToolWorkspace toolId={selectedToolId} />
        </div>
      </div>
    );
  }

  // Image Generator View
  if (currentView === 'image-gen') {
    return (
      <div className="h-screen bg-background flex flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[rgba(59,130,246,0.1)] bg-background/80 backdrop-blur-xl px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView('landing')}
              className="h-9 w-9 rounded-xl hover:bg-[rgba(59,130,246,0.1)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <button 
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.png" 
                alt="Brutal.ai" 
                className="h-8 w-8 rounded-xl"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-sm">Brutal.ai</span>
                <span className="text-[10px] text-muted-foreground">AI Image Generation</span>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('image-tools')}
              className="gap-2 rounded-xl"
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">Image Tools</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('chat')}
              className="gap-2 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
              Chat
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <ImageGenerator />
        </div>
      </div>
    );
  }

  // Image Tools Hub View
  if (currentView === 'image-tools') {
    return (
      <div className="h-screen bg-background flex flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[rgba(59,130,246,0.1)] bg-background/80 backdrop-blur-xl px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView('image-gen')}
              className="h-9 w-9 rounded-xl hover:bg-[rgba(59,130,246,0.1)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <button 
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.png" 
                alt="Brutal.ai" 
                className="h-8 w-8 rounded-xl"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-sm">Brutal.ai</span>
                <span className="text-[10px] text-muted-foreground">Image Tools</span>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('image-gen')}
              className="gap-2 rounded-xl"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Generate</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('chat')}
              className="gap-2 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
              Chat
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <ImageToolsHub onBack={() => setCurrentView('image-gen')} />
        </div>
      </div>
    );
  }

  // Landing Page View
  if (currentView === 'landing') {
    return (
      <main className="min-h-screen bg-background">
        {/* Fixed Header - Aesthetic Style */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-[rgba(59,130,246,0.1)]">
          <div className="container mx-auto px-4 flex h-16 items-center justify-between">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 group"
            >
              <img 
                src="/logo.png" 
                alt="Brutal.ai" 
                className="h-9 w-9 rounded-xl shadow-soft group-hover:shadow-glow-blue transition-shadow"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground tracking-tight">Brutal.ai</span>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-xl gap-2 font-medium"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('image-gen')}
                className="hidden sm:flex rounded-xl gap-2 font-medium"
              >
                <ImageIcon className="w-4 h-4" />
                Image Gen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const toolsSection = document.getElementById('tools-hub');
                  toolsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden sm:flex rounded-xl gap-2 font-medium"
              >
                <Wrench className="w-4 h-4" />
                Tools
              </Button>
              <Button
                onClick={() => setCurrentView('chat')}
                className="btn-primary"
              >
                Start Chatting
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Landing Sections */}
        <Hero />
        <Features />
        <AIDemo />
        <Stats />
        <ToolsHub />
        <Downloads />
        <CTA />
        
        {/* Footer - Aesthetic Style */}
        <footer className="py-12 border-t border-[rgba(59,130,246,0.1)] bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid.cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/logo.png" alt="Brutal.ai" className="h-10 w-10 rounded-xl" />
                  <span className="font-bold text-xl text-foreground tracking-tight">Brutal.ai</span>
                </div>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  A powerful AI platform built for <span className="text-[#3b82f6]">speed</span>, <span className="text-[#8b5cf6]">clarity</span>, and <span className="text-[#06b6d4]">precision</span>.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><button onClick={() => setCurrentView('image-gen')} className="hover:text-[#3b82f6] transition-colors">AI Image Generation</button></li>
                  <li><a href="#tools-hub" className="hover:text-[#3b82f6] transition-colors">AI Tools</a></li>
                  <li><a href="#downloads" className="hover:text-[#3b82f6] transition-colors">Downloads</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-[#3b82f6] transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-[#8b5cf6] transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-[#06b6d4] transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-[rgba(59,130,246,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 Brutal.ai. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Developed Under BRUTALTOOLS
              </p>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  // Chat View
  return (
    <>
      <div className="flex h-screen bg-background gradient-mesh">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-72 bg-background/95 backdrop-blur-xl border-r border-[rgba(59,130,246,0.1)] z-50 shadow-xl lg:hidden"
              >
                <Sidebar 
                  onToolsClick={() => {
                    setToolsOpen(true);
                    setSidebarOpen(false);
                  }}
                  onClose={() => setSidebarOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 h-screen border-r border-[rgba(59,130,246,0.1)] bg-muted/30 shrink-0">
          <Sidebar 
            onToolsClick={() => setToolsOpen(true)}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Aesthetic Style */}
          <header className="flex h-14 items-center justify-between border-b border-[rgba(59,130,246,0.1)] bg-background/80 backdrop-blur-xl px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden h-9 w-9 rounded-xl hover:bg-[rgba(59,130,246,0.1)]"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <button 
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo.png" 
                  alt="Brutal.ai" 
                  className="h-8 w-8 rounded-xl"
                />
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-sm text-foreground tracking-tight">Brutal.ai</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Intelligence Activated</span>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('image-gen')}
                className="rounded-xl gap-2 font-medium"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Images</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToolsOpen(true)}
                className="rounded-xl gap-2 font-medium"
              >
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Tools</span>
              </Button>
            </div>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md"
                >
                  <div className="mb-6">
                    <img 
                      src="/logo.png" 
                      alt="Brutal.ai" 
                      className="w-16 h-16 mx-auto rounded-2xl shadow-glow-blue"
                    />
                  </div>
                  <h1 className="text-2xl font-bold mb-2 tracking-tight">How can I help you today?</h1>
                  <p className="text-muted-foreground mb-8">
                    I'm <span className="text-[#3b82f6] font-semibold">Brutal.ai</span>, your intelligent AI assistant. Ask me anything!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: '💡', text: 'Explain quantum computing simply' },
                      { icon: '💻', text: 'Write a Python function' },
                      { icon: '✍️', text: 'Help me write an email' },
                      { icon: '🎨', text: 'Generate a creative image idea', action: () => setCurrentView('image-gen') },
                    ].map((suggestion, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        onClick={suggestion.action || (() => sendMessage(suggestion.text))}
                        className="flex items-start gap-3 p-4 bg-card/60 backdrop-blur-sm border border-[rgba(59,130,246,0.1)] rounded-xl text-left hover:border-[rgba(59,130,246,0.25)] hover:shadow-soft transition-all"
                      >
                        <span className="text-xl">{suggestion.icon}</span>
                        <span className="text-sm text-muted-foreground">{suggestion.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="py-4">
                <div className="max-w-3xl mx-auto">
                  {messages.map((message, index) => (
                    <div key={message.id} ref={index === messages.length - 1 ? lastMessageRef : null}>
                      <ChatMessage
                        message={message}
                        onRegenerate={handleRegenerate}
                        isLast={index === messages.length - 1 && message.role === 'assistant'}
                        isDarkMode={theme === 'dark'}
                        isStreaming={isStreamingMessage && index === messages.length - 1 && message.role === 'assistant'}
                        onStreamingComplete={() => setIsStreamingMessage(false)}
                      />
                    </div>
                  ))}
                  <AnimatePresence>
                    {isTyping && !isStreamingMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TypingIndicator />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-[rgba(59,130,246,0.1)] bg-background/80 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto">
              <InputBar
                onSend={sendMessage}
                onStop={handleStopGeneration}
                disabled={isTyping && !isStreamingMessage}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tools Sheet */}
      <ToolsSheet
        open={toolsOpen}
        onOpenChange={setToolsOpen}
        onToolSelect={handleToolSelect}
      />
    </>
  );
}
