'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Wrench, 
  Moon, 
  Sun,
  X,
  Check,
  Sparkles,
  Zap, 
  Code,
  MessageCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useChatStore, ChatConversation } from '@/store/chat-store';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onToolsClick: () => void;
  onClose?: () => void;
}

function ConversationItem({ 
  conversation, 
  isActive, 
  onSelect, 
  onDelete, 
  onRename 
}: { 
  conversation: ChatConversation; 
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-300 rounded-xl mx-2',
        isActive 
          ? 'bg-gradient-to-r from-[rgba(59,130,246,0.15)] to-[rgba(139,92,246,0.1)] border border-[rgba(59,130,246,0.2)]' 
          : 'hover:bg-card/60 border border-transparent hover:border-[rgba(59,130,246,0.1)]'
      )}
      onClick={() => !isEditing && onSelect()}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn(
        'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300',
        isActive 
          ? 'bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white shadow-glow-blue' 
          : 'bg-[rgba(59,130,246,0.1)] text-muted-foreground group-hover:bg-[rgba(59,130,246,0.15)]'
      )}>
        <MessageSquare className="w-4 h-4" />
      </div>
      
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 bg-background border border-[rgba(59,130,246,0.3)] rounded-lg px-2 py-1 text-sm outline-none focus:border-[#3b82f6]"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="p-1.5 rounded-lg bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <span className="flex-1 text-sm truncate font-medium text-foreground/90">{conversation.title}</span>
      )}

      <AnimatePresence>
        {showActions && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1.5 rounded-lg hover:bg-[rgba(59,130,246,0.1)] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-muted-foreground hover:text-[#3b82f6]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Sidebar({ onToolsClick, onClose }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const { 
    conversations, 
    currentConversationId, 
    createConversation, 
    deleteConversation, 
    renameConversation,
    setCurrentConversation,
  } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    createConversation();
    onClose?.();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    onClose?.();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all conversations?')) {
      conversations.forEach((c) => deleteConversation(c.id));
      createConversation();
      onClose?.();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/80 backdrop-blur-xl border-r border-[rgba(59,130,246,0.1)]">
      {/* Header - Aesthetic */}
      <div className="relative flex items-center justify-between p-4 border-b border-[rgba(59,130,246,0.1)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#3b82f6]/30 blur-xl scale-150" />
            <img 
              src="/logo.png" 
              alt="Brutal.ai" 
              className="relative w-10 h-10 rounded-xl" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground tracking-tight">
              Brutal.ai
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">Intelligence Activated</span>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden h-9 w-9 rounded-xl hover:bg-[rgba(59,130,246,0.1)]"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* New Chat Button - Aesthetic */}
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white border-0 font-semibold rounded-xl shadow-glow-blue hover:shadow-lg hover:shadow-[#3b82f6]/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Search - Aesthetic */}
      <div className="px-3 pb-2">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#3b82f6] transition-colors" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-3 py-2.5 text-sm bg-card/60 backdrop-blur-sm border border-[rgba(59,130,246,0.1)] rounded-xl outline-none focus:border-[rgba(59,130,246,0.3)] focus:bg-card/80 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="py-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-[#3b82f6]" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                {searchQuery ? 'No chats found' : 'No conversations yet'}
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onSelect={() => handleSelectConversation(conversation.id)}
                onDelete={() => deleteConversation(conversation.id)}
                onRename={(title) => renameConversation(conversation.id, title)}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-[rgba(59,130,246,0.1)] p-3 space-y-2">
        {/* Response Mode */}
        <div className="flex items-center justify-between px-3 py-3 text-sm bg-card/60 backdrop-blur-sm border border-[rgba(59,130,246,0.1)] rounded-xl">
          <span className="text-muted-foreground font-medium text-xs">Mode</span>
          <div className="flex gap-1">
            {[
              { icon: Sparkles, label: 'Balanced', active: true },
              { icon: Zap, label: 'Fast', active: false },
              { icon: MessageCircle, label: 'Detailed', active: false },
              { icon: Code, label: 'Code', active: false },
            ].map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className={cn(
                  'p-2 rounded-lg transition-all duration-300',
                  active 
                    ? 'bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white shadow-glow-blue' 
                    : 'text-muted-foreground hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3b82f6]'
                )}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <motion.button
          whileHover={{ x: 4 }}
          onClick={onToolsClick}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card/60 backdrop-blur-sm border border-[rgba(59,130,246,0.1)] rounded-xl text-muted-foreground hover:text-foreground hover:border-[rgba(59,130,246,0.25)] transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <span className="text-sm font-medium">AI Tools</span>
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card/60 backdrop-blur-sm border border-[rgba(59,130,246,0.1)] rounded-xl text-muted-foreground hover:text-foreground hover:border-[rgba(59,130,246,0.25)] transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 flex items-center justify-center">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#3b82f6]" />
            ) : (
              <Moon className="w-4 h-4 text-[#8b5cf6]" />
            )}
          </div>
          <span className="text-sm font-medium">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </motion.button>

        {/* Clear All */}
        {conversations.length > 0 && (
          <motion.button
            whileHover={{ x: 4 }}
            onClick={handleClearAll}
            className="w-full flex items-center gap-3 px-4 py-3 bg-card/60 backdrop-blur-sm border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm font-medium">Clear All Chats</span>
          </motion.button>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[rgba(59,130,246,0.1)] p-4">
        <p className="text-[10px] text-muted-foreground text-center font-medium">
          Developed under BRUTALTOOLS
        </p>
      </div>
    </div>
  );
}
