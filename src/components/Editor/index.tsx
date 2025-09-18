"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback } from "react";

interface TiptapProps {
  content?: string;
  onChange?: (content: string) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const Tiptap = ({
  content = "",
  onChange,
  onTextChange,
  placeholder = "Enter description...",
  className = "",
}: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-5",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-5",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "ml-0",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      Highlight,
      CharacterCount,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange?.(html);
      onTextChange?.(text);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose max-w-none focus:outline-none min-h-[200px] p-4 ${className}`,
        placeholder: placeholder,
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Check if content is HTML or plain text
      const isHTML = content.includes("<") && content.includes(">");
      if (isHTML) {
        editor.commands.setContent(content);
      } else {
        // If it's plain text, wrap it in paragraph tags
        editor.commands.setContent(content ? `<p>${content}</p>` : "");
      }
    }
  }, [content, editor]);

  // Helper functions for selection-based formatting
  const handleHeading = useCallback((level: 1 | 2 | 3) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const isActive = editor.isActive('heading', { level });
    
    if (from === to) {
      // No selection - apply to current block
      if (isActive) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().setHeading({ level }).run();
      }
    } else {
      // Has selection - apply to selected blocks
      if (isActive) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().setHeading({ level }).run();
      }
    }
  }, [editor]);

  const handleParagraph = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().setParagraph().run();
  }, [editor]);

  const handleBulletList = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    
    if (from === to) {
      // No selection - apply to current block
      if (editor.isActive('bulletList')) {
        editor.chain().focus().liftListItem('listItem').run();
      } else {
        editor.chain().focus().toggleBulletList().run();
      }
    } else {
      // Has selection - apply to selected blocks
      if (editor.isActive('bulletList')) {
        editor.chain().focus().liftListItem('listItem').run();
      } else {
        editor.chain().focus().toggleBulletList().run();
      }
    }
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    
    if (from === to) {
      // No selection - apply to current block
      if (editor.isActive('orderedList')) {
        editor.chain().focus().liftListItem('listItem').run();
      } else {
        editor.chain().focus().toggleOrderedList().run();
      }
    } else {
      // Has selection - apply to selected blocks
      if (editor.isActive('orderedList')) {
        editor.chain().focus().liftListItem('listItem').run();
      } else {
        editor.chain().focus().toggleOrderedList().run();
      }
    }
  }, [editor]);

  const handleTextAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (!editor) return;
    editor.chain().focus().setTextAlign(alignment).run();
  }, [editor]);

  const handleBlockquote = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const handleCodeBlock = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;

    if (from === to) {
      alert("Please select some text first to add a link");
      return;
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:", "https://");
    if (url && url !== "https://") {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white dark:bg-gray-800">
        <div className="rounded-t-lg border-b border-gray-300 bg-gray-50 p-3 dark:bg-gray-700">
          <div className="flex flex-wrap gap-1">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-600"
              ></div>
            ))}
          </div>
        </div>
        <div className="min-h-[200px] p-4">
          <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
      {/* Enhanced Toolbar */}
      <div className="rounded-t-lg border-b border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("bold")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Bold (Ctrl+B)"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.75 4.5a3.25 3.25 0 100 6.5H14v-1h-1.25a2.25 2.25 0 110-4.5H14v-1h-1.25zM12 14a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("italic")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Italic (Ctrl+I)"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3v2h2l-3 10H5v2h6v-2H9l3-10h2V3H8z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("underline")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Underline (Ctrl+U)"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 18h12v1H4v-1zM10 3a4 4 0 00-4 4v6a4 4 0 008 0V7a4 4 0 00-4-4z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("strike")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Strikethrough"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10h16v1H2v-1zm4.5-4a2.5 2.5 0 00-2.5 2.5h1A1.5 1.5 0 016.5 7h7a1.5 1.5 0 011.5 1.5H16A2.5 2.5 0 0013.5 6h-7z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("highlight")
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Highlight"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("code")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Inline Code"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.293 7.293a1 1 0 000 1.414L8.586 11l-2.293 2.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 0zM11 13a1 1 0 100 2h3a1 1 0 100-2h-3z" />
              </svg>
            </button>
          </div>

          <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Headings */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleHeading(1)}
              className={`rounded px-3 py-1 text-sm font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => handleHeading(2)}
              className={`rounded px-3 py-1 text-sm font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => handleHeading(3)}
              className={`rounded px-3 py-1 text-sm font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => handleParagraph()}
              className={`rounded px-3 py-1 text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("paragraph")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Paragraph"
            >
              P
            </button>
          </div>

          <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Lists */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleBulletList()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("bulletList")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Bullet List"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleOrderedList()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("orderedList")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Numbered List"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4h1v2H3V4zM3 8h1v2H3V8zM3 12h1v2H3v-2zM7 4h10v2H7V4zM7 8h10v2H7V8zM7 12h10v2H7v-2z" />
              </svg>
            </button>
          </div>

          <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Text Alignment */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleTextAlign("left")}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: "left" })
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Align Left"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4h14v2H3V4zM3 8h10v2H3V8zM3 12h14v2H3v-2zM3 16h10v2H3v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleTextAlign("center")}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: "center" })
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Align Center"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 4h16v2H2V4zM5 8h10v2H5V8zM2 12h16v2H2v-2zM5 16h10v2H5v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleTextAlign("right")}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: "right" })
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Align Right"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4h14v2H3V4zM7 8h10v2H7V8zM3 12h14v2H3v-2zM7 16h10v2H7v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleTextAlign("justify")}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive({ textAlign: "justify" })
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Justify"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4h14v2H3V4zM3 8h14v2H3V8zM3 12h14v2H3v-2zM3 16h14v2H3v-2z" />
              </svg>
            </button>
          </div>

          <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Special Elements */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleBlockquote()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("blockquote")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Quote"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10c0-2 1.5-3 3-3s3 1 3 3-1.5 3-3 3-3-1-3-3zM3 7c0-3 2.5-5 5-5s5 2 5 5v6c0 1-1 2-2 2H5c-1 0-2-1-2-2V7z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleCodeBlock()}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("codeBlock")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Code Block"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="rounded p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Horizontal Rule"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 10h14v1H3v-1z" />
              </svg>
            </button>
          </div>

          <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={addLink}
              className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${
                editor.isActive("link")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="Add Link"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={addImage}
              className="rounded p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Add Image"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="rounded p-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Undo (Ctrl+Z)"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="rounded p-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Redo (Ctrl+Y)"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="overflow-hidden rounded-b-lg">
        <EditorContent
          editor={editor}
          className="min-h-[200px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50"
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between border-t border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>
              {editor.storage.characterCount?.characters() || 0} characters
            </span>
            <span>{editor.storage.characterCount?.words() || 0} words</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs">
              {editor.can().undo() ? "Ctrl+Z to undo" : ""}
              {editor.can().undo() && editor.can().redo() ? " • " : ""}
              {editor.can().redo() ? "Ctrl+Y to redo" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tiptap;
