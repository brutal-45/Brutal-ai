import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Brutal.ai - Smarter. Faster. Brutal.",
  description: "AI-powered chat assistant. Simple, clean, and powerful. Built under BrutalTools.",
  keywords: ["Brutal.ai", "AI", "Chat", "Assistant", "BrutalTools", "AI Tools", "Image Generation", "Code Generator"],
  authors: [{ name: "BrutalTools" }],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "512x512" },
      { url: "/logo.png", sizes: "1024x1024" },
    ],
    apple: [
      { url: "/logo.png", sizes: "1024x1024" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Brutal.ai - Smarter. Faster. Brutal.",
    description: "AI-powered chat assistant. Simple, clean, and powerful.",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brutal.ai - Smarter. Faster. Brutal.",
    description: "AI-powered chat assistant. Simple, clean, and powerful.",
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Brutal.ai",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9FAFB" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="1024x1024" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Enhanced text rendering */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
