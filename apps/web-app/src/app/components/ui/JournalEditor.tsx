import { useEffect } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "./utils";

interface JournalEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// Shared button used in both the static toolbar and the bubble menu
function FormatBtn({
  onClick,
  active,
  title,
  children,
  variant = "toolbar",
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  variant?: "toolbar" | "bubble";
}) {
  const isToolbar = variant === "toolbar";
  return (
    <button
      type="button"
      // onMouseDown + preventDefault keeps editor focus while clicking toolbar buttons
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "rounded-md transition-colors flex items-center justify-center",
        isToolbar
          ? [
              "h-7 w-7",
              active
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
            ]
          : [
              "p-1.5",
              active
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10",
            ],
      )}
    >
      {children}
    </button>
  );
}

function Divider({ variant = "toolbar" }: { variant?: "toolbar" | "bubble" }) {
  return (
    <div
      className={cn(
        "self-stretch",
        variant === "toolbar"
          ? "w-px bg-border/60 mx-0.5 my-0.5"
          : "w-px bg-white/10 mx-0.5",
      )}
    />
  );
}

export function JournalEditor({
  value,
  onChange,
  placeholder = "Write your reflections here...",
  className,
}: JournalEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap-journal focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync external value changes without triggering the onUpdate → onChange loop
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const currentNorm = current === "<p></p>" ? "" : current;
    const incoming = value || "";
    if (incoming !== currentNorm) {
      editor.commands.setContent(value || "", false);
    }
  }, [value]);

  if (!editor) return null;

  return (
    <div className={cn("tiptap-journal-wrapper relative w-full flex flex-col", className)}>

      {/* ── Persistent formatting toolbar ─────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-1 py-1.5 mb-4 border border-border/50 rounded-xl bg-secondary/30 flex-wrap">
        {/* Text style */}
        <FormatBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (⌘B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </FormatBtn>
        <FormatBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (⌘I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </FormatBtn>
        <FormatBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (⌘U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </FormatBtn>

        <Divider />

        {/* Structure */}
        <FormatBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </FormatBtn>
        <FormatBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </FormatBtn>
        <FormatBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </FormatBtn>
        <FormatBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </FormatBtn>

        <Divider />

        {/* History */}
        <FormatBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (⌘Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </FormatBtn>
        <FormatBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </FormatBtn>
      </div>

      {/* ── Bubble menu — quick access when text is selected ──────────── */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 120, placement: "top" }}
        shouldShow={({ state }) => {
          const { from, to } = state.selection;
          return from !== to;
        }}
      >
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-foreground rounded-xl shadow-2xl border border-white/5">
          <FormatBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
            variant="bubble"
          >
            <Bold className="w-3.5 h-3.5" />
          </FormatBtn>
          <FormatBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
            variant="bubble"
          >
            <Italic className="w-3.5 h-3.5" />
          </FormatBtn>
          <FormatBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
            variant="bubble"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </FormatBtn>
          <Divider variant="bubble" />
          <FormatBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading"
            variant="bubble"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </FormatBtn>
          <FormatBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet"
            variant="bubble"
          >
            <List className="w-3.5 h-3.5" />
          </FormatBtn>
          <FormatBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
            variant="bubble"
          >
            <Quote className="w-3.5 h-3.5" />
          </FormatBtn>
        </div>
      </BubbleMenu>

      {/* Clicking anywhere in the wrapper focuses the editor */}
      <div onClick={() => editor.commands.focus()} className="cursor-text flex-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
