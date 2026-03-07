'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Square, Paperclip, X, FileText, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  preview?: string;
}

interface InputBarProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export function InputBar({ onSend, onStop, disabled, isGenerating = false }: InputBarProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 500)}px`;
    }
  }, [message]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      
      setMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    for (const file of Array.from(selectedFiles)) {
      const id = Math.random().toString(36).substring(2, 15);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        const uploadedFile: UploadedFile = {
          id,
          name: file.name,
          type: file.type,
          size: file.size,
          content: file.type.startsWith('image/') ? undefined : content,
          preview: file.type.startsWith('image/') ? content : undefined,
        };
        
        setFiles((prev) => [...prev, uploadedFile]);
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    if ((message.trim() || files.length > 0) && !disabled) {
      onSend(message.trim(), files.length > 0 ? files : undefined);
      setMessage('');
      setFiles([]);
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const speechSupported = typeof window !== 'undefined' && 
    (typeof window.SpeechRecognition !== 'undefined' || typeof window.webkitSpeechRecognition !== 'undefined');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full py-3">
      {/* File previews - Aesthetic Style */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 px-1">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm rounded-xl border border-[rgba(59,130,246,0.2)] text-foreground shadow-soft"
            >
              {file.preview ? (
                <img src={file.preview} alt={file.name} className="w-6 h-6 rounded-lg object-cover" />
              ) : (
                <FileText className="w-4 h-4 text-[#3b82f6]" />
              )}
              <span className="text-xs text-foreground truncate max-w-[100px]">{file.name}</span>
              <span className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-[#3b82f6]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-2">
        {/* Input Container - Aesthetic Glass Style */}
        <div className="relative flex-1 flex items-end">
          <div 
            className={cn(
              "relative flex-1 flex items-end bg-card/80 backdrop-blur-xl rounded-2xl transition-all duration-300",
              "border shadow-soft",
              isFocused 
                ? "border-[rgba(59,130,246,0.4)] shadow-glow-blue" 
                : "border-[rgba(59,130,246,0.15)]",
              isListening && "border-[rgba(239,68,68,0.4)] shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            )}
          >
            {/* File upload button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isGenerating}
              className={cn(
                "flex h-12 w-12 items-center justify-center transition-all shrink-0 rounded-l-2xl",
                "text-muted-foreground hover:text-[#3b82f6] hover:bg-[rgba(59,130,246,0.08)]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title="Upload file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isListening ? "Listening..." : "Message Brutal.ai..."}
              disabled={disabled || isGenerating}
              rows={1}
              maxLength={10000}
              className={cn(
                "flex-1 resize-none bg-transparent py-3 text-[15px]",
                "placeholder:text-muted-foreground",
                "focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "max-h-[500px] leading-relaxed text-foreground"
              )}
              style={{ minHeight: '48px' }}
            />
            
            {/* Character count */}
            {message.length > 5000 && (
              <span className="text-xs text-muted-foreground pr-2">
                {message.length.toLocaleString()}/10,000
              </span>
            )}
            
            {/* Right side buttons */}
            <div className="flex items-center gap-1 px-2 pb-2">
              {/* Voice Input Button */}
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  disabled={disabled || isGenerating}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center transition-all rounded-xl",
                    isListening 
                      ? "bg-[#ef4444] text-white animate-pulse" 
                      : "text-muted-foreground hover:text-[#3b82f6] hover:bg-[rgba(59,130,246,0.1)]",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>
              )}
              
              {/* Stop Button - Show when generating */}
              {isGenerating ? (
                <button
                  onClick={onStop}
                  className="flex h-10 w-10 items-center justify-center transition-all rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-105"
                  title="Stop generating"
                >
                  <StopCircle className="h-5 w-5" />
                </button>
              ) : (
                /* Send Button - Aesthetic Style */
                <button
                  onClick={handleSubmit}
                  disabled={(!message.trim() && files.length === 0) || disabled}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center transition-all rounded-xl",
                    (message.trim() || files.length > 0) && !disabled
                      ? "bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white hover:shadow-lg hover:shadow-[#3b82f6]/30 hover:scale-105"
                      : "text-muted-foreground cursor-not-allowed"
                  )}
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Voice indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-2 pt-2 text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full bg-[#ef4444] opacity-75 rounded-full"></span>
            <span className="relative inline-flex bg-[#ef4444] h-2.5 w-2.5 rounded-full"></span>
          </span>
          <span className="text-xs font-medium text-[#ef4444]">Listening... speak now</span>
        </div>
      )}
      
      {/* Hint text */}
      <div className="flex items-center justify-center pt-2">
        <p className="text-[10px] text-muted-foreground">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
      
      {/* Mobile safe area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
