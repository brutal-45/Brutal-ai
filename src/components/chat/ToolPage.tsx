'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Download, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { type Tool } from '@/types/chat';
import { cn } from '@/lib/utils';
import { TypewriterPreview } from '@/components/tools/TypewriterPreview';

interface ToolPageProps {
  tool: Tool | null;
  open: boolean;
  onClose: () => void;
} 

export function ToolPage({ tool, open, onClose }: ToolPageProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Check dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!tool || !open) return null;

  const isImageTool = tool.isImageTool;

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setOutput('');
    setGeneratedImage(null);
    setError(null);

    try {
      if (isImageTool) {
        // Image generation tools
        const style = getImageStyle(tool.id);
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: input, 
            size: '1024x1024',
            style,
          }),
        });
        
        const data = await response.json();
        
        if (data.image) {
          setGeneratedImage(data.image);
          setOutput('Image generated successfully!');
        } else if (data.error) {
          setError(`${data.error}${data.message ? `: ${data.message}` : ''}`);
        }
      } else {
        // Text-based tools
        const toolPrompt = getToolPrompt(tool);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `${toolPrompt}\n\nUser request: ${input}` }]
          }),
        });

        const data = await response.json();
        
        if (data.response) {
          setOutput(data.response);
        } else if (data.error) {
          setError(`${data.error}${data.message ? `: ${data.message}` : ''}`);
        }
      }
    } catch (err) {
      console.error('Tool error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (isImageTool && generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${tool.id}-${Date.now()}.png`;
      link.click();
    } else if (output) {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tool.id}-output.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header - Neo-Brutality */}
      <header className="flex h-14 items-center justify-between border-b-2 border-black dark:border-[#333] px-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-9 w-9 border-2 border-black dark:border-[#333] hover:border-[#F97316]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {/* Tool Icon */}
          <div className="flex items-center justify-center w-10 h-10 border-2 border-[#F97316] bg-[#F97316]/10">
            <Image
              src={`/tools/${tool.id}.png`}
              alt={tool.name}
              width={24}
              height={24}
              className="brightness-110"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-foreground tracking-wide uppercase">{tool.name}</h1>
            <span className="text-[10px] text-[#F97316] font-bold tracking-wider uppercase">
              {tool.isImageTool ? 'Image Tool' : 'Text Tool'}
            </span>
          </div>
        </div>
        {(output || generatedImage) && !error && (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setInput(''); setOutput(''); setGeneratedImage(null); setError(null); }}
              className="border-2 border-black dark:border-[#333] hover:border-[#F97316] font-bold"
            >
              Clear
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDownload}
              className="border-2 border-black dark:border-[#333] hover:border-[#F97316] font-bold gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col overflow-hidden p-4">
        {/* Input Section */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-[#F97316] uppercase tracking-wide">
            {tool.description}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${tool.prompt}...`}
            className="w-full resize-none border-2 border-black dark:border-[#333] bg-background p-4 text-base outline-none focus:border-[#F97316] transition-colors font-medium"
            rows={6}
            disabled={isLoading}
          />
        </div>

        {/* Generate Button - Neo-Brutality */}
        <Button
          onClick={handleGenerate}
          disabled={!input.trim() || isLoading}
          className={cn(
            'mb-4 h-12 gap-2 text-base font-bold uppercase tracking-wide',
            'bg-[#F97316] text-black border-2 border-black hover:bg-[#F97316]/80',
            'shadow-clamp-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-clamp-md',
            'active:translate-x-0 active:translate-y-0 active:shadow-clamp-sm',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-clamp-sm',
            'transition-all duration-100'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate{isImageTool ? ' Image' : ''}
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 border-2 border-red-500 bg-red-500/10 p-4 text-red-500"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase">Generation Failed</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Output Section */}
        {(output || generatedImage || isLoading) && !error && (
          <div className="flex-1 overflow-hidden">
            <label className="mb-2 block text-sm font-bold text-[#F97316] uppercase tracking-wide">
              {isImageTool ? 'Generated Image' : 'Output'}
            </label>
            <div className="h-full overflow-y-auto border-2 border-black dark:border-[#333] bg-card p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-[#F97316]" />
                  <span className="text-[#F97316] font-bold uppercase tracking-wide">
                    {isImageTool ? 'Creating your image...' : 'Generating response...'}
                  </span>
                </div>
              ) : isImageTool && generatedImage ? (
                <div className="flex flex-col items-center gap-4">
                  <img src={generatedImage} alt="Generated" className="max-w-full border-2 border-[#F97316] shadow-phosphor" />
                </div>
              ) : output ? (
                <TypewriterPreview
                  content={output}
                  isTyping={false}
                  isDarkMode={isDarkMode}
                  showPreview={true}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Get image style based on tool
function getImageStyle(toolId: string): string | undefined {
  const styles: Record<string, string> = {
    'image-gen': undefined,
    'logo-maker': 'logo',
    'thumbnail': 'thumbnail',
    'poster-designer': 'poster',
    'upscaler': 'realistic',
    'bg-remover': 'realistic',
    'face-enhancer': 'realistic',
    'object-remover': 'realistic',
    'inpainting': 'realistic',
    'outpainting': 'realistic',
    'image-to-image': undefined,
    'style-transfer': 'digital-art',
  };
  return styles[toolId];
}

// Get detailed prompt for each tool
function getToolPrompt(tool: Tool): string {
  const prompts: Record<string, string> = {
    // Developer Tools
    'code-gen': `You are an expert programmer. Generate clean, well-documented, and efficient code. 
Include comments explaining the logic. Follow best practices and modern coding standards.
Provide the complete code with any necessary imports or setup instructions.`,
    
    'debugger': `You are an expert debugger. Analyze the code provided and:
1. Identify all bugs and issues
2. Explain what's causing each problem
3. Provide the corrected code
4. Suggest improvements to prevent similar issues`,
    
    'website-builder': `You are a web development expert. Create complete, functional websites with:
- Clean HTML structure
- Modern CSS styling (responsive design)
- JavaScript for interactivity
- Best practices for accessibility and SEO
Provide the complete code ready to use.`,
    
    'api-docs': `You are a technical writer specializing in API documentation. Create clear, comprehensive documentation including:
- Endpoint descriptions
- Request/response formats
- Parameters and their types
- Example requests and responses
- Error codes and handling`,
    
    'app-idea': `You are a creative consultant for app development. Generate innovative app ideas with:
- Clear problem statement
- Target audience
- Key features and functionality
- Monetization strategy
- Technical feasibility assessment`,
    
    // Business Tools
    'business-plan': `You are a business expert. Create comprehensive business plans including:
- Executive summary
- Market analysis
- Business model
- Marketing strategy
- Financial projections
- Operations plan
- Risk assessment`,
    
    'business-name': `You are a branding expert. Generate creative, memorable business names that:
- Are unique and available
- Reflect the business nature
- Are easy to pronounce and remember
- Have potential for branding
Provide 5-10 options with explanations.`,
    
    'marketing': `You are a marketing strategist. Develop comprehensive marketing strategies including:
- Target audience analysis
- Value proposition
- Marketing channels
- Content strategy
- Budget allocation
- KPIs and metrics
- Timeline and milestones`,
    
    'ad-copy': `You are a copywriting expert. Create compelling ad copy that:
- Grabs attention immediately
- Clearly communicates benefits
- Creates urgency
- Has a strong call-to-action
- Is optimized for the platform
Provide multiple versions for A/B testing.`,
    
    'startup-name': `You are a naming expert for startups. Generate unique startup names that:
- Are memorable and catchy
- Have available domains
- Reflect the startup's vision
- Are scalable
- Have positive associations
Provide 5-10 options with domain suggestions.`,
    
    // Productivity Tools
    'resume': `You are a resume writing expert. Create professional, ATS-optimized resumes that:
- Highlight relevant experience
- Use strong action verbs
- Quantify achievements
- Are formatted professionally
- Pass ATS screening
Include both a formatted version and plain text version.`,
    
    'email-writer': `You are a communication expert. Write professional emails that:
- Have clear subject lines
- Are concise yet complete
- Use appropriate tone
- Have clear calls-to-action
- Follow email best practices
Provide the complete email ready to send.`,
    
    'pdf-summary': `You are a summarization expert. Create concise summaries that:
- Capture all key points
- Maintain original meaning
- Are well-organized
- Highlight important details
- Are easy to scan
Use bullet points and headers for clarity.`,
    
    'notes': `You are a note-taking expert. Generate organized notes that:
- Are structured logically
- Highlight key concepts
- Include examples where helpful
- Are easy to review
- Support multiple learning styles
Use headings, bullet points, and formatting for clarity.`,
    
    // Language Tools
    'translator': `You are an expert translator. Translate text accurately while:
- Preserving meaning and nuance
- Using natural phrasing in target language
- Maintaining appropriate tone
- Handling idioms correctly
- Preserving formatting
Always specify the detected source language.`,
    
    'grammar': `You are a grammar expert. Fix all grammar, spelling, and punctuation issues:
- Correct all errors
- Improve sentence structure
- Enhance clarity
- Maintain original meaning and tone
- Explain major corrections
Provide both the corrected text and a summary of changes.`,
    
    'rewriter': `You are a writing expert. Rewrite text to:
- Improve clarity and flow
- Enhance vocabulary
- Remove redundancy
- Strengthen arguments
- Maintain original meaning
Provide the improved version with brief notes on changes made.`,
    
    'tone-changer': `You are a tone expert. Adjust the writing tone as requested:
- Match the requested tone precisely
- Maintain core message
- Adjust vocabulary and phrasing
- Consider audience impact
- Preserve key information
Explain how the tone was adjusted.`,
  };
  
  return prompts[tool.id] || 'You are a helpful assistant. Please provide a detailed and helpful response.';
}
