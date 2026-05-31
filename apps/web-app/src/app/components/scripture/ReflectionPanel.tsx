import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import type { ReflectionData } from "@/api/scripture/types";

interface ReflectionPanelProps {
  reflection: ReflectionData;
  defaultOpen?: boolean;
}

export function ReflectionPanel({ reflection, defaultOpen = true }: ReflectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-accent/5 hover:bg-accent/10 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-4 h-4 text-accent" />
          <span className="font-bold text-foreground text-sm tracking-wide">
            Reflection
          </span>
          {reflection.theme && (
            <span className="text-[11px] font-semibold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              {reflection.theme}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-5 py-6 space-y-6 bg-card">
          {/* Context */}
          {reflection.context && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Context
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {reflection.context}
              </p>
            </div>
          )}

          {/* Reflection Questions */}
          {reflection.reflectionQuestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Reflection Questions
              </p>
              <ol className="space-y-3">
                {reflection.reflectionQuestions.map((q, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-foreground/80 leading-relaxed border-l-2 border-accent/40 pl-3"
                  >
                    <span className="font-bold text-accent shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Prayer Prompt */}
          {reflection.prayerPrompt && (
            <div className="pl-4 border-l-2 border-accent/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Prayer
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                {reflection.prayerPrompt}
              </p>
            </div>
          )}

          {/* Application */}
          {reflection.application && (
            <div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                <span className="font-bold text-foreground">Today's Step: </span>
                {reflection.application}
              </p>
            </div>
          )}

          {/* Memory Verse */}
          {reflection.memoryVerse?.text && (
            <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-4">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">
                Memory Verse
              </p>
              <p className="text-sm text-amber-900 italic leading-relaxed mb-2">
                "{reflection.memoryVerse.text}"
              </p>
              <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                {reflection.memoryVerse.reference}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
