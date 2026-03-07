import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, Tool } from '@/types/chat';

const generateId = () => Math.random().toString(36).substring(2, 15);

export interface ChatConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  preview?: string;
}

interface ChatState {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  isTyping: boolean;
  currentTool: Tool | null;
  sidebarOpen: boolean;
  
  // Actions
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  setCurrentConversation: (id: string | null) => void;
  getCurrentConversation: () => ChatConversation | null;
  
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  setCurrentTool: (tool: Tool | null) => void;
  clearMessages: () => void;
  
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isTyping: false,
      currentTool: null,
      sidebarOpen: false,

      createConversation: () => {
        const id = generateId();
        const conversation: ChatConversation = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter((c) => c.id !== id);
          const newCurrentId = state.currentConversationId === id 
            ? (newConversations[0]?.id || null)
            : state.currentConversationId;
          return { 
            conversations: newConversations,
            currentConversationId: newCurrentId,
          };
        });
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date() } : c
          ),
        }));
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },

      getCurrentConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.currentConversationId) || null;
      },

      addMessage: (message) => {
        const state = get();
        if (!state.currentConversationId) {
          // Create new conversation if none exists
          const id = get().createConversation();
          const newMessage: Message = {
            ...message,
            id: generateId(),
            timestamp: new Date(),
          };
          set((s) => ({
            conversations: s.conversations.map((c) =>
              c.id === id 
                ? { 
                    ...c, 
                    messages: [newMessage],
                    title: message.content.slice(0, 30) + (message.content.length > 30 ? '...' : ''),
                    updatedAt: new Date(),
                  }
                : c
            ),
          }));
          return;
        }

        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        };

        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === s.currentConversationId 
              ? { 
                  ...c, 
                  messages: [...c.messages, newMessage],
                  title: c.messages.length === 0 
                    ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                    : c.title,
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      updateLastAssistantMessage: (content) => {
        set((state) => {
          if (!state.currentConversationId) return state;
          return {
            conversations: state.conversations.map((c) => {
              if (c.id !== state.currentConversationId) return c;
              const messages = [...c.messages];
              const lastAssistantIndex = messages.length - 1;
              if (lastAssistantIndex >= 0 && messages[lastAssistantIndex].role === 'assistant') {
                messages[lastAssistantIndex] = {
                  ...messages[lastAssistantIndex],
                  content,
                };
              }
              return { ...c, messages, updatedAt: new Date() };
            }),
          };
        });
      },

      setTyping: (isTyping) => set({ isTyping }),

      setCurrentTool: (tool) => set({ currentTool: tool }),

      clearMessages: () => {
        set((state) => {
          if (!state.currentConversationId) return state;
          return {
            conversations: state.conversations.map((c) =>
              c.id === state.currentConversationId 
                ? { ...c, messages: [], title: 'New Chat', updatedAt: new Date() }
                : c
            ),
          };
        });
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'brutal-ai-chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
);
