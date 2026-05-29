import * as React from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "./utils";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuButton = ({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={cn(
      "h-8 w-8 p-0 rounded-md transition-colors",
      active
        ? "bg-accent/10 text-accent"
        : "text-muted-foreground hover:bg-secondary/50",
    )}
    title={title}
  >
    {children}
  </Button>
);

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      BubbleMenuExtension,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px]",
          "font-serif leading-relaxed text-foreground selection:bg-accent/20",
          "placeholder:text-muted-foreground/30",
        ),
      },
    },
  });

  // Sync external value if needed (e.g., on reset)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Use JSON check or similar if HTML comparison is too flaky
      // For now, simple check to avoid loops
      const currentHTML = editor.getHTML();
      // Only update if it's a significant change (e.g., reset to empty)
      if (value === "" && currentHTML !== "<p></p>") {
        editor.commands.setContent("");
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={cn("relative flex flex-col w-full", className)}>
      {/* Static Toolbar - Always visible at the top */}
      <div className="flex flex-wrap items-center gap-1 p-2 mb-4 border-b border-border/40 bg-secondary/10 rounded-t-xl sticky top-0 z-20 backdrop-blur-sm">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>

        <div className="w-[1px] h-4 bg-border/40 mx-1" />

        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>

        <div className="w-[1px] h-4 bg-border/40 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>

        <div className="ml-auto flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>
      </div>

      <EditorContent editor={editor} className="flex-1" />

      {/* Bubble Menu - visible on selection */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex items-center gap-1 p-1 bg-background border border-border shadow-xl rounded-lg backdrop-blur-md">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </MenuButton>
        </div>
      </BubbleMenu>
    </div>
  );
};
