import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render text with bold, italic, and inline code
  const renderInlineStyles = (text: string) => {
    // Escape simple HTML
    let sanitized = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Match inline code: `code`
    const parts: React.ReactNode[] = [];
    let currentIdx = 0;

    // Regexp to match bold, italic, and inline code in one pass, or sequentially
    // Since simple replacement works well, let's parse inline patterns.
    // To make it highly robust, let's parse segments.
    // For extreme reliability, let's split inline code first, then parse bold/italic on outer parts.
    const inlineCodeRegex = /`([^`]+)`/g;
    let match;
    let keyCounter = 0;

    while ((match = inlineCodeRegex.exec(sanitized)) !== null) {
      const precedingText = sanitized.substring(currentIdx, match.index);
      if (precedingText) {
        parts.push(...parseBoldItalics(precedingText, keyCounter++));
      }
      parts.push(
        <code
          key={`code-${keyCounter++}`}
          className="px-1.5 py-0.5 font-mono text-xs text-amber-800 bg-amber-50 rounded border border-amber-100 font-semibold"
        >
          {match[1]}
        </code>
      );
      currentIdx = inlineCodeRegex.lastIndex;
    }

    if (currentIdx < sanitized.length) {
      parts.push(...parseBoldItalics(sanitized.substring(currentIdx), keyCounter++));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Helper to parse bold (**text**) and italic (*text*) inside inline text segments
  const parseBoldItalics = (text: string, baseKey: number): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let currentIdx = 0;
    let key = 0;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const preceding = text.substring(currentIdx, match.index);
      if (preceding) {
        parts.push(<span key={`txt-${baseKey}-${key++}`}>{preceding}</span>);
      }

      if (match[1]) {
        // Bold
        parts.push(
          <strong key={`bold-${baseKey}-${key++}`} className="font-bold text-slate-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic
        parts.push(
          <em key={`italic-${baseKey}-${key++}`} className="italic text-slate-800">
            {match[4]}
          </em>
        );
      }
      currentIdx = regex.lastIndex;
    }

    if (currentIdx < text.length) {
      parts.push(<span key={`txt-${baseKey}-${key++}`}>{text.substring(currentIdx)}</span>);
    }

    return parts;
  };

  // Split content into blocks: code blocks vs regular text (paragraphs, lists)
  const blocks: React.ReactNode[] = [];
  const rawBlocks = content.split(/(```[\s\S]*?```)/g);

  rawBlocks.forEach((block, index) => {
    if (block.startsWith("```")) {
      // Code block
      const match = block.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const code = match ? match[2].trim() : block.replace(/```/g, "").trim();
      const id = `code-block-${index}`;

      blocks.push(
        <div key={id} className="my-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-sm text-slate-200">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 text-xs text-slate-400 border-b border-slate-700/50">
            <span className="font-mono">{language || "code"}</span>
            <button
              onClick={() => copyToClipboard(code, id)}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors py-0.5 px-2 rounded hover:bg-slate-700"
            >
              {copiedId === id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto font-mono text-sm leading-relaxed bg-slate-950 text-slate-100 select-all">
            <code>{code}</code>
          </pre>
        </div>
      );
    } else {
      // Normal text with potential lists, headers, paragraphs
      const lines = block.split("\n");
      let inList = false;
      let listItems: React.ReactNode[] = [];
      let listKey = `list-${index}`;

      const pushListIfActive = () => {
        if (inList && listItems.length > 0) {
          blocks.push(
            <ul key={listKey} className="list-disc pl-6 my-3 space-y-1 text-slate-700">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
      };

      lines.forEach((line, lineIdx) => {
        const trimmedLine = line.trim();

        // Check for headers (e.g., ### Title)
        const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          pushListIfActive();
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          const key = `h-${index}-${lineIdx}`;

          if (level === 1) {
            blocks.push(<h1 key={key} className="text-2xl font-bold text-slate-900 mt-4 mb-2 tracking-tight">{renderInlineStyles(text)}</h1>);
          } else if (level === 2) {
            blocks.push(<h2 key={key} className="text-xl font-semibold text-slate-900 mt-4 mb-2 tracking-tight">{renderInlineStyles(text)}</h2>);
          } else {
            blocks.push(<h3 key={key} className="text-lg font-medium text-slate-800 mt-3 mb-1 tracking-tight">{renderInlineStyles(text)}</h3>);
          }
          return;
        }

        // Check for bullet lists starting with - or *
        const listMatch = trimmedLine.match(/^[-*]\s+(.*)$/);
        if (listMatch) {
          inList = true;
          listItems.push(
            <li key={`li-${index}-${lineIdx}`} className="text-slate-700">
              {renderInlineStyles(listMatch[1])}
            </li>
          );
          return;
        }

        // Check for numbered lists starting with digits (e.g., 1. Item)
        const numListMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
        if (numListMatch) {
          pushListIfActive(); // Flush unordered list if it was active
          // For simplicity, we can render numbered items directly
          blocks.push(
            <div key={`nli-${index}-${lineIdx}`} className="flex gap-2 pl-2 my-1.5 text-slate-700">
              <span className="font-semibold text-amber-700 shrink-0">{numListMatch[1]}.</span>
              <div className="grow">{renderInlineStyles(numListMatch[2])}</div>
            </div>
          );
          return;
        }

        // Empty line or blank line
        if (!trimmedLine) {
          pushListIfActive();
          return;
        }

        // Normal paragraph line
        pushListIfActive();
        blocks.push(
          <p key={`p-${index}-${lineIdx}`} className="leading-relaxed text-slate-700 my-2">
            {renderInlineStyles(line)}
          </p>
        );
      });

      // Flush any lingering lists at the block end
      pushListIfActive();
    }
  });

  return <div className="space-y-1.5 break-words">{blocks}</div>;
}
