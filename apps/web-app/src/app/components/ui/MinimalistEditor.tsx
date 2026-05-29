import * as React from "react";
import { cn } from "./utils";

interface MinimalistEditorProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

export const MinimalistEditor = React.forwardRef<
  HTMLTextAreaElement,
  MinimalistEditorProps
>(({ className, autoResize = true, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useImperativeHandle(ref, () => textareaRef.current!);

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea && autoResize) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [autoResize]);

  React.useEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value]);

  return (
    <div className="relative group w-full">
      <textarea
        {...props}
        ref={textareaRef}
        onInput={(e) => {
          adjustHeight();
          props.onInput?.(e);
        }}
        className={cn(
          "w-full bg-transparent border-none focus:ring-0 outline-none resize-none overflow-hidden",
          "text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/30",
          "font-serif selection:bg-accent/20 transition-all",
          className
        )}
      />
      {/* Subtle writing lines or indicator if desired */}
      <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-border/20 group-focus-within:bg-accent/30 transition-colors" />
    </div>
  );
});

MinimalistEditor.displayName = "MinimalistEditor";
