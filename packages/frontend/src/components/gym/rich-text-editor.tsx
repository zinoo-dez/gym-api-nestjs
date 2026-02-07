import * as React from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: number;
}

const TOOLBAR_ACTIONS = [
  { label: "B", command: "bold" },
  { label: "I", command: "italic" },
  { label: "U", command: "underline" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  height = 160,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyCommand = (command: string) => {
    document.execCommand(command);
    handleInput();
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    document.execCommand("createLink", false, url);
    handleInput();
  };

  const insertImage = () => {
    const url = window.prompt("Enter image URL");
    if (!url) return;
    document.execCommand("insertImage", false, url);
    handleInput();
  };

  return (
    <div className={cn("rounded-lg border border-border bg-background", className)}>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.command}
            type="button"
            onClick={() => applyCommand(action.command)}
            className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted"
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          onClick={insertLink}
          className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted"
        >
          Link
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted"
        >
          Image
        </button>
      </div>
      <div
        ref={editorRef}
        className="px-3 py-2 text-sm text-foreground outline-none"
        style={{ minHeight: height }}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}
