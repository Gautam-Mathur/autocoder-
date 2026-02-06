import { Link } from "wouter";
import { Code2, Zap, Shield, Globe, Terminal, Sparkles, ChevronRight, MessageSquare, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Code2,
    title: "Code Generation",
    description: "Generate HTML, CSS, JavaScript, and React code. Landing pages, forms, components, and more.",
  },
  {
    icon: Zap,
    title: "Instant & Free",
    description: "Works immediately with no setup. No API keys, no downloads, no configuration.",
  },
  {
    icon: Shield,
    title: "Built-in Engine",
    description: "Local code templates that work anywhere. Download and run on your own machine.",
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Optimized for frontend and web development. React, vanilla JS, CSS layouts, and more.",
  },
  {
    icon: MessageSquare,
    title: "Chat Interface",
    description: "Natural conversation flow. Describe what you need in plain English.",
  },
  {
    icon: Wrench,
    title: "Ready Templates",
    description: "Pre-built patterns for common web tasks. Forms, modals, cards, navigation, and more.",
  },
];

const codeExample = `// Ask CodeAI anything
> "Write a debounce function in TypeScript"

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}`;

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" data-testid="logo-header">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">CodeAI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/chat">
              <Button data-testid="button-start-coding-header">
                Start Coding
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 lg:py-32" data-testid="section-hero">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium" data-testid="badge-free">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free - No API Key Required
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight" data-testid="text-hero-title">
                  Code Generator, <span className="text-primary">Works Anywhere</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg" data-testid="text-hero-subtitle">
                  Generate web code instantly with built-in templates. No API keys, no downloads, no setup. Works online and offline - download and run locally.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/chat">
                    <Button size="lg" className="gap-2" data-testid="button-start-coding-hero">
                      <Terminal className="h-4 w-4" />
                      Start Coding Now
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2" data-testid="text-no-setup">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Zero setup
                  </div>
                  <div className="flex items-center gap-2" data-testid="text-no-api">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    No API keys
                  </div>
                  <div className="flex items-center gap-2" data-testid="text-instant">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Instant responses
                  </div>
                </div>
              </div>
              <div className="relative" data-testid="code-preview">
                <Card className="p-0 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-card-border bg-muted/30">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono ml-2">CodeAI</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code className="font-mono">{codeExample}</code>
                  </pre>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30" data-testid="section-features">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-features-title">Everything You Need</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-subtitle">
                Powerful AI coding assistance with zero friction. Just ask and get code.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={feature.title} className="p-6" data-testid={`card-feature-${index}`}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" data-testid="section-how-it-works">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-how-it-works-title">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Start coding with AI in seconds.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center" data-testid="step-1">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Open CodeAI</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Start Coding" - that's it. No sign-up, no API keys.
                </p>
              </div>
              <div className="text-center" data-testid="step-2">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">Describe What You Need</h3>
                <p className="text-sm text-muted-foreground">
                  Tell the AI what code you want in plain English.
                </p>
              </div>
              <div className="text-center" data-testid="step-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">Get Working Code</h3>
                <p className="text-sm text-muted-foreground">
                  Copy the generated code into your project and use it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary/5" data-testid="section-cta">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Ready to Code?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto" data-testid="text-cta-subtitle">
              Start generating code with AI right now. It's free and works instantly.
            </p>
            <Link href="/chat">
              <Button size="lg" className="gap-2" data-testid="button-start-coding-cta">
                <Terminal className="h-4 w-4" />
                Start Coding Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8" data-testid="footer">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2" data-testid="logo-footer">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Terminal className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-medium">CodeAI</span>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-footer">
              Free AI coding assistant. No API keys required.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
