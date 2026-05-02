export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentTool: Tool | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  setCurrentTool: (tool: Tool | null) => void;
  clearMessages: () => void; 
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  prompt: string;
  apiEndpoint?: string;
  isImageTool?: boolean;
  isPro?: boolean;
}

export type ToolCategory = 'creative' | 'image-tools' | 'developer' | 'business' | 'productivity' | 'language';

export interface ToolCategoryInfo {
  name: string;
  icon: string;
  tools: Tool[];
}

export const toolCategories: ToolCategoryInfo[] = [
  {
    name: 'AI Image Generation',
    icon: 'Image',
    tools: [
      { id: 'image-gen', name: 'AI Image Generator', description: 'Create stunning images with advanced controls', icon: 'Sparkles', category: 'creative', prompt: 'Describe the image you want to generate:', apiEndpoint: '/api/image', isImageTool: true },
      { id: 'logo-maker', name: 'AI Logo Maker', description: 'Create professional logos', icon: 'Shapes', category: 'creative', prompt: 'Describe your brand for the logo:', apiEndpoint: '/api/tools/logo', isImageTool: true },
      { id: 'thumbnail', name: 'AI Thumbnail Creator', description: 'Create eye-catching thumbnails', icon: 'Frame', category: 'creative', prompt: 'Describe the video thumbnail you want:', apiEndpoint: '/api/tools/thumbnail', isImageTool: true },
      { id: 'poster-designer', name: 'AI Poster Designer', description: 'Design beautiful posters', icon: 'FileImage', category: 'creative', prompt: 'Describe the poster you want to design:', apiEndpoint: '/api/tools/poster-designer', isImageTool: true },
    ]
  },
  {
    name: 'Image Tools',
    icon: 'Wand2',
    tools: [
      { id: 'upscaler', name: 'AI Image Upscaler', description: 'Enhance resolution up to 4x', icon: 'Maximize2', category: 'image-tools', prompt: 'Upload an image to upscale:', apiEndpoint: '/api/tools/upscaler', isImageTool: true },
      { id: 'bg-remover', name: 'Background Remover', description: 'Remove backgrounds instantly', icon: 'Eraser', category: 'image-tools', prompt: 'Upload an image to remove background:', apiEndpoint: '/api/tools/background-remover', isImageTool: true },
      { id: 'face-enhancer', name: 'AI Face Enhancer', description: 'Enhance facial features', icon: 'Smile', category: 'image-tools', prompt: 'Upload a portrait to enhance:', apiEndpoint: '/api/tools/face-enhancer', isImageTool: true },
      { id: 'object-remover', name: 'AI Object Remover', description: 'Remove unwanted objects', icon: 'Scissors', category: 'image-tools', prompt: 'Upload an image and mark objects to remove:', apiEndpoint: '/api/tools/object-remover', isImageTool: true },
      { id: 'inpainting', name: 'AI Inpainting', description: 'Edit specific image areas', icon: 'Paintbrush', category: 'image-tools', prompt: 'Upload an image and describe edits:', apiEndpoint: '/api/tools/inpainting', isImageTool: true },
      { id: 'outpainting', name: 'AI Outpainting', description: 'Extend images beyond borders', icon: 'Expand', category: 'image-tools', prompt: 'Upload an image to extend:', apiEndpoint: '/api/tools/outpainting', isImageTool: true },
      { id: 'image-to-image', name: 'Image to Image', description: 'Transform images with AI', icon: 'RefreshCw', category: 'image-tools', prompt: 'Upload an image and describe transformation:', apiEndpoint: '/api/tools/image-to-image', isImageTool: true },
      { id: 'style-transfer', name: 'AI Style Transfer', description: 'Apply artistic styles', icon: 'Palette', category: 'image-tools', prompt: 'Upload an image and choose a style:', apiEndpoint: '/api/tools/style-transfer', isImageTool: true },
    ]
  },
  {
    name: 'Developer',
    icon: 'Code',
    tools: [
      { id: 'code-gen', name: 'AI Code Generator', description: 'Generate code in any language', icon: 'FileCode', category: 'developer', prompt: 'Describe what code you need:', apiEndpoint: '/api/tools/code' },
      { id: 'debugger', name: 'AI Debugger', description: 'Debug and fix your code', icon: 'Bug', category: 'developer', prompt: 'Paste your code to debug:', apiEndpoint: '/api/tools/debug' },
      { id: 'website-builder', name: 'AI Website Builder', description: 'Build websites with AI', icon: 'Globe', category: 'developer', prompt: 'Describe the website you want to build:', apiEndpoint: '/api/tools/website' },
      { id: 'api-docs', name: 'API Documentation Writer', description: 'Generate API documentation', icon: 'FileText', category: 'developer', prompt: 'Describe the API endpoint to document:', apiEndpoint: '/api/tools/api-docs' },
      { id: 'app-idea', name: 'AI App Idea Generator', description: 'Generate innovative app ideas', icon: 'Lightbulb', category: 'developer', prompt: 'Describe your interests or domain:', apiEndpoint: '/api/tools/app-idea' },
    ]
  },
  {
    name: 'Business',
    icon: 'Briefcase',
    tools: [
      { id: 'business-plan', name: 'AI Business Plan', description: 'Create comprehensive business plans', icon: 'FileText', category: 'business', prompt: 'Describe your business idea:', apiEndpoint: '/api/tools/business-plan' },
      { id: 'business-name', name: 'AI Business Name Generator', description: 'Generate unique business names', icon: 'Building2', category: 'business', prompt: 'Describe your business:', apiEndpoint: '/api/tools/business-name' },
      { id: 'marketing', name: 'AI Marketing Strategy', description: 'Develop marketing strategies', icon: 'TrendingUp', category: 'business', prompt: 'Describe your product or service:', apiEndpoint: '/api/tools/marketing' },
      { id: 'ad-copy', name: 'AI Ad Copy Writer', description: 'Write compelling ad copy', icon: 'Megaphone', category: 'business', prompt: 'Describe what you want to advertise:', apiEndpoint: '/api/tools/ad-copy' },
      { id: 'startup-name', name: 'AI Startup Name Generator', description: 'Generate unique startup names', icon: 'Sparkles', category: 'business', prompt: 'Describe your startup idea:', apiEndpoint: '/api/tools/startup-name' },
    ]
  },
  {
    name: 'Productivity',
    icon: 'Zap',
    tools: [
      { id: 'resume', name: 'AI Resume Builder', description: 'Build professional resumes', icon: 'FileUser', category: 'productivity', prompt: 'Describe your experience and the job you are targeting:', apiEndpoint: '/api/tools/resume' },
      { id: 'email-writer', name: 'AI Email Writer', description: 'Write professional emails', icon: 'Mail', category: 'productivity', prompt: 'Describe the purpose of your email:', apiEndpoint: '/api/tools/email' },
      { id: 'pdf-summary', name: 'AI PDF Summarizer', description: 'Summarize PDF documents', icon: 'FileSearch', category: 'productivity', prompt: 'Paste the content to summarize:', apiEndpoint: '/api/tools/pdf-summary' },
      { id: 'notes', name: 'AI Notes Generator', description: 'Generate organized notes', icon: 'Notebook', category: 'productivity', prompt: 'Enter the topic for your notes:', apiEndpoint: '/api/tools/notes' },
    ]
  },
  {
    name: 'Language',
    icon: 'Languages',
    tools: [
      { id: 'translator', name: 'AI Translator', description: 'Translate text to any language', icon: 'Globe2', category: 'language', prompt: 'Enter text to translate (mention target language if needed):', apiEndpoint: '/api/tools/translate' },
      { id: 'grammar', name: 'AI Grammar Fixer', description: 'Fix grammar and spelling', icon: 'SpellCheck', category: 'language', prompt: 'Enter text to fix grammar:', apiEndpoint: '/api/tools/grammar' },
      { id: 'rewriter', name: 'AI Text Rewriter', description: 'Rewrite and improve text', icon: 'RefreshCw', category: 'language', prompt: 'Enter text to rewrite:', apiEndpoint: '/api/tools/rewrite' },
      { id: 'tone-changer', name: 'AI Tone Changer', description: 'Adjust the tone of your writing', icon: 'MessageSquare', category: 'language', prompt: 'Enter text and describe the desired tone:', apiEndpoint: '/api/tools/tone-changer' },
    ]
  }
];

// All tools flattened for easy access
export const allTools: Tool[] = toolCategories.flatMap(cat => cat.tools);
