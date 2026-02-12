import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ParticlesBackground } from "@/components/ui";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DocuMind | AI Intelligence for Documents",
  description: "Transform your documents with enterprise-grade AI analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        variables: {
          colorPrimary: "oklch(0.55 0.24 275)",
          fontFamily: "var(--font-inter)",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-card/90 backdrop-blur-xl border border-border shadow-2xl shadow-black/5",
          headerTitle: "font-heading text-2xl text-foreground",
          headerSubtitle: "text-muted-foreground",
          formButtonPrimary: "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95",
          formFieldInput: "bg-secondary/50 border-border text-foreground placeholder-muted-foreground focus:border-primary/30 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all rounded-lg",
          formFieldLabel: "text-foreground/80 text-sm font-medium",
          footerActionLink: "text-primary hover:text-primary/90 hover:underline",
          socialButtonsBlockButton: "bg-secondary/30 border-border text-foreground hover:bg-secondary/50",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${outfit.variable} antialiased bg-background text-foreground overflow-x-hidden selection:bg-primary/30`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ParticlesBackground />
            <div className="relative z-10 flex min-h-screen flex-col page-enter">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
