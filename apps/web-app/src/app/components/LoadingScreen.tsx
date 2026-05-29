import React from "react";
import { Sparkles } from "lucide-react";

interface LoadingScreenProps {
  churchName?: string;
}

export function LoadingScreen({ churchName }: LoadingScreenProps) {
  const displayChurchName = churchName && churchName.trim() !== "" ? churchName : "FaithCare";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Logo / Icon Area */}
        <div className="mb-10 relative">
          <div className="w-24 h-24 bg-card border border-border rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 animate-in zoom-in-50 duration-700">
            <Sparkles className="w-12 h-12 text-accent animate-pulse" />
          </div>
          {/* Decorative Rings */}
          <div className="absolute inset-0 -m-6 border border-accent/20 rounded-[2.5rem] animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 -m-10 border border-accent/10 rounded-[3rem] animate-ping opacity-10" style={{ animationDuration: '4s' }} />
        </div>

        {/* Church Name */}
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
              {displayChurchName}
            </h2>
            <p className="text-sm text-muted-foreground uppercase tracking-[0.3em] font-bold opacity-70 animate-in fade-in duration-1000 delay-300 fill-mode-both">
              Preparing your sanctuary
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden relative shadow-inner">
              <div className="absolute inset-y-0 left-0 bg-accent rounded-full animate-progress-flow shadow-[0_0_10px_rgba(212,165,116,0.5)]" />
            </div>
            <p className="text-xs text-muted-foreground/60 animate-pulse">Syncing with heavens...</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-flow {
          0% { left: -100%; width: 100%; }
          50% { left: 0%; width: 50%; }
          100% { left: 100%; width: 100%; }
        }
        .animate-progress-flow {
          animation: progress-flow 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
