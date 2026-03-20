"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Quote,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Link2, Highlighter,
  Undo2, Redo2, Type, Target, BarChart2, BookOpen,
  FileText, Zap, AlertTriangle, CheckCircle2, Loader2,
  Eye, RefreshCw, PanelRightOpen, PanelRightClose,
  Copy, Check, Download, Lightbulb, Link as LinkIcon,
  ChevronDown, X
} from "lucide-react";

// ─── Tiptap Editor CSS ────────────────────────────────────────────────────────
const editorStyles = `
  .tiptap-editor .ProseMirror {
    outline: none;
    min-height: 100%;
    padding: 2rem 2.5rem;
    font-size: 0.9375rem;
    line-height: 1.75;
    color: inherit;
    font-family: inherit;
  }
  .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
  }
  .tiptap-editor .ProseMirror h1 {
    font-size: 1.75rem; font-weight: 800; line-height: 1.25; margin: 1.25rem 0 0.75rem;
    font-family: var(--font-heading, inherit);
  }
  .tiptap-editor .ProseMirror h2 {
    font-size: 1.35rem; font-weight: 700; line-height: 1.3; margin: 1.1rem 0 0.6rem;
  }
  .tiptap-editor .ProseMirror h3 {
    font-size: 1.1rem; font-weight: 700; line-height: 1.35; margin: 0.9rem 0 0.5rem;
  }
  .tiptap-editor .ProseMirror p { margin: 0 0 0.85rem; }
  .tiptap-editor .ProseMirror ul, .tiptap-editor .ProseMirror ol { padding-left: 1.5rem; margin: 0.5rem 0 0.85rem; }
  .tiptap-editor .ProseMirror li { margin-bottom: 0.25rem; }
  .tiptap-editor .ProseMirror blockquote {
    border-left: 3px solid #d1d5db; padding-left: 1rem; margin: 0.75rem 0;
    color: #6b7280; font-style: italic;
  }
  .dark .tiptap-editor .ProseMirror blockquote { border-color: #4b5563; color: #9ca3af; }
  .tiptap-editor .ProseMirror code {
    font-family: monospace; font-size: 0.875em;
    background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 0.3rem;
  }
  .dark .tiptap-editor .ProseMirror code { background: #1f2937; }
  .tiptap-editor .ProseMirror pre {
    background: #111827; color: #e5e7eb; padding: 1rem; border-radius: 0.75rem;
    font-family: monospace; overflow-x: auto; margin: 0.85rem 0;
  }
  .tiptap-editor .ProseMirror mark {
    background: #000; color: #fff; padding: 0 0.2em; border-radius: 0.2em;
  }
  .dark .tiptap-editor .ProseMirror mark { background: #fff; color: #000; }
  .tiptap-editor .ProseMirror a { text-decoration: underline; cursor: pointer; }
  .tiptap-editor .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5rem 0; }
  .dark .tiptap-editor .ProseMirror hr { border-color: #374151; }
`;

// ─── Instant SEO checks ───────────────────────────────────────────────────────
function runInstantChecks(text, html, keyword, titleVal) {
  const checks = [];
  if (!text.trim()) return checks;

  const words = text.trim().split(/\s+/);
  const wordCount = words.length;

  // H1
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
  const h1Texts = h1Match.map(h => h.replace(/<[^>]*>/g, "").trim());
  if (h1Texts.length === 0) {
    checks.push({ type: "error", category: "Structure", message: "No H1 heading found", detail: "Add a clear H1 — it's the strongest on-page signal." });
  } else if (h1Texts.length > 1) {
    checks.push({ type: "warning", category: "Structure", message: `${h1Texts.length} H1 headings detected`, detail: "Use exactly one H1. Demote others to H2." });
  } else {
    if (h1Texts[0].length > 60) {
      checks.push({ type: "warning", category: "Structure", message: `H1 too long (${h1Texts[0].length} chars)`, detail: "Keep H1 under 60 characters for SERP display." });
    }
    if (keyword && !h1Texts[0].toLowerCase().includes(keyword.toLowerCase())) {
      checks.push({ type: "warning", category: "Keyword", message: "Keyword missing from H1", detail: "Include your primary keyword in the H1 heading." });
    }
  }

  // Keyword in intro
  if (keyword) {
    const introHtml = html.substring(0, 800);
    const introText = introHtml.replace(/<[^>]*>/g, "").toLowerCase();
    if (!introText.includes(keyword.toLowerCase())) {
      checks.push({ type: "warning", category: "Keyword", message: "Keyword absent from intro", detail: "Use your keyword early — ideally in the first paragraph." });
    } else {
      checks.push({ type: "ok", category: "Keyword", message: "Keyword found in intro", detail: "" });
    }

    // Keyword density
    const kwWords = keyword.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();
    let kwCount = 0;
    let pos = 0;
    while ((pos = textLower.indexOf(keyword.toLowerCase(), pos)) !== -1) { kwCount++; pos += keyword.length; }
    const density = wordCount > 0 ? ((kwWords.length * kwCount) / wordCount * 100) : 0;
    if (density > 3.5) {
      checks.push({ type: "warning", category: "Keyword", message: `Keyword density too high (${density.toFixed(1)}%)`, detail: "Over-optimization hurts rankings. Aim for 0.5–2.5%." });
    }
  }

  // Word count
  if (wordCount < 300) {
    checks.push({ type: "tip", category: "Readability", message: `Content short — ${wordCount} words`, detail: "300–600+ words is recommended for SEO visibility." });
  } else if (wordCount >= 600) {
    checks.push({ type: "ok", category: "Readability", message: `Good length — ${wordCount} words`, detail: "" });
  }

  // Subheadings
  const h2Count = (html.match(/<h2/gi) || []).length;
  const h3Count = (html.match(/<h3/gi) || []).length;
  if (wordCount > 400 && h2Count === 0) {
    checks.push({ type: "tip", category: "Structure", message: "No H2 subheadings added", detail: "Break content with H2s to improve scannability and SEO structure." });
  } else if (h2Count > 0) {
    checks.push({ type: "ok", category: "Structure", message: `${h2Count} H2${h2Count > 1 ? "s" : ""} detected${h3Count > 0 ? ` + ${h3Count} H3${h3Count > 1 ? "s" : ""}` : ""}`, detail: "" });
  }

  // Links
  const linkCount = (html.match(/<a\s/gi) || []).length;
  if (wordCount > 300 && linkCount === 0) {
    checks.push({ type: "tip", category: "Links", message: "No links in content", detail: "Add at least 1–2 internal or external links to support topical authority." });
  } else if (linkCount > 0) {
    checks.push({ type: "ok", category: "Links", message: `${linkCount} link${linkCount > 1 ? "s" : ""} found`, detail: "" });
  }

  // Title
  if (titleVal) {
    if (titleVal.length < 40) {
      checks.push({ type: "tip", category: "Meta", message: `Title too short (${titleVal.length} chars)`, detail: "Aim for 50–60 characters." });
    } else if (titleVal.length > 60) {
      checks.push({ type: "warning", category: "Meta", message: `Title too long (${titleVal.length} chars)`, detail: "Over 60 chars gets truncated in SERPs." });
    } else {
      checks.push({ type: "ok", category: "Meta", message: `Title length perfect (${titleVal.length}/60)`, detail: "" });
    }
  }

  return checks;
}

// ─── Category icon ────────────────────────────────────────────────────────────
const CAT_ICON = {
  Keyword: Target,
  Structure: Type,
  Readability: BookOpen,
  Links: LinkIcon,
  Meta: FileText,
  Engagement: Eye,
};

// ─── Toolbar button ───────────────────────────────────────────────────────────
function TBtn({ onClick, active, title, children, disabled }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${
        active
          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function TDivider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />;
}

// ─── Suggestion card ──────────────────────────────────────────────────────────
function SuggestionCard({ s, index }) {
  const [open, setOpen] = useState(false);
  const Icon = CAT_ICON[s.category] || Lightbulb;

  if (s.type === "ok") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.035 }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800"
      >
        <CheckCircle2 size={12} className="text-gray-400 shrink-0" />
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">{s.message}</span>
      </motion.div>
    );
  }

  const accent = s.type === "error" ? "border-l-black dark:border-l-white" : s.type === "warning" ? "border-l-gray-400" : "border-l-gray-200";
  const iconCls = s.type === "error" ? "text-black dark:text-white" : s.type === "warning" ? "text-gray-500" : "text-gray-400";

  return (
    <motion.button
      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.035 }}
      onClick={() => setOpen(!open)}
      className={`w-full text-left bg-white dark:bg-[#1e1e28] rounded-xl border border-gray-100 dark:border-gray-800 border-l-2 ${accent} overflow-hidden`}
    >
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <Icon size={12} className={`mt-0.5 shrink-0 ${iconCls}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-snug">{s.message}</p>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{s.category}</span>
        </div>
        {s.detail && (
          <ChevronDown size={12} className={`text-gray-400 mt-0.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </div>
      <AnimatePresence>
        {open && s.detail && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }} className="overflow-hidden">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium px-3 pb-2.5 border-t border-gray-100 dark:border-gray-800 pt-2 leading-relaxed">{s.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, highlight }) {
  return (
    <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border text-center min-w-[60px] ${
      highlight ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-[#1e1e28] border-gray-200 dark:border-gray-700"
    }`}>
      <span className={`text-base font-extrabold leading-none ${highlight ? "" : "text-gray-900 dark:text-white"}`}>{value}</span>
      <span className={`text-[9px] font-bold mt-0.5 ${highlight ? "opacity-70" : "text-gray-400"}`}>{label}</span>
      {sub && <span className={`text-[8px] font-medium ${highlight ? "opacity-50" : "text-gray-300 dark:text-gray-600"}`}>{sub}</span>}
    </div>
  );
}

// ─── Link dialog ──────────────────────────────────────────────────────────────
function LinkDialog({ editor, onClose }) {
  const [href, setHref] = useState(editor?.getAttributes("link").href || "");
  const apply = () => {
    if (href) editor.chain().focus().setLink({ href }).run();
    else editor.chain().focus().unsetLink().run();
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#1e1e28] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-900 dark:text-white">Insert Link</span>
          <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-black dark:hover:text-white" /></button>
        </div>
        <input
          autoFocus value={href} onChange={e => setHref(e.target.value)}
          onKeyDown={e => e.key === "Enter" && apply()}
          placeholder="https://example.com"
          className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button onClick={apply} className="flex-1 py-2 text-sm font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200">Apply</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveEditorPage() {
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showPanel, setShowPanel] = useState(true);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [linkDialog, setLinkDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const [instantChecks, setInstantChecks] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiMeta, setAiMeta] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState(0);
  const [aiError, setAiError] = useState(null);

  const debounceRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Start writing your SEO content here…\n\nTip: begin with a clear H1 heading. Use H2s to structure sections.",
      }),
      CharacterCount,
    ],
    editorProps: {
      attributes: { class: "tiptap-editor" },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const html = editor.getHTML();
      setInstantChecks(runInstantChecks(text, html, keyword, title));
      clearTimeout(debounceRef.current);
      if (text.trim().length > 80) {
        debounceRef.current = setTimeout(() => {
          runAiAnalysis(text, keyword, title);
        }, 1400);
      }
    },
    immediatelyRender: false,
  });

  // Re-run instant checks when keyword/title changes
  useEffect(() => {
    if (!editor) return;
    const text = editor.getText();
    const html = editor.getHTML();
    setInstantChecks(runInstantChecks(text, html, keyword, title));
    clearTimeout(debounceRef.current);
    if (text.trim().length > 80) {
      debounceRef.current = setTimeout(() => runAiAnalysis(text, keyword, title), 1200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, title]);

  const runAiAnalysis = useCallback(async (text, kw, t) => {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const res = await fetch("/api/copilot-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, keyword: kw, title: t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAiSuggestions(data.suggestions || []);
      setAiMeta({ keywordDensity: data.keywordDensity, readabilityScore: data.readabilityScore });
      setLastAnalyzed(Date.now());
    } catch (err) {
      setAiError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const wordCount = editor?.storage.characterCount.words() ?? 0;
  const charCount = editor?.storage.characterCount.characters() ?? 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const allSuggestions = [...instantChecks, ...aiSuggestions];
  const errorCount = allSuggestions.filter(s => s.type === "error").length;
  const warnCount = allSuggestions.filter(s => s.type === "warning").length;
  const tipCount = allSuggestions.filter(s => s.type === "tip").length;
  const okCount = allSuggestions.filter(s => s.type === "ok").length;
  const score = Math.max(0, 100 - (errorCount * 18) - (warnCount * 7) - (tipCount * 3));

  const copyContent = () => {
    if (!editor) return;
    navigator.clipboard.writeText(editor.getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    if (!editor) return;
    const html = `<!DOCTYPE html><html><head><title>${title || "Content"}</title></head><body>${editor.getHTML()}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "content.html"; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Toolbar ────────────────────────────────────────────────────────────────
  const Toolbar = () => editor ? (
    <div className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a22] px-3 py-2 flex flex-wrap items-center gap-0.5 overflow-x-auto">
      {/* History */}
      <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo2 size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo2 size={15} /></TBtn>
      <TDivider />
      {/* Headings */}
      <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 size={15} /></TBtn>
      <TDivider />
      {/* Formatting */}
      <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><UnderlineIcon size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight"><Highlighter size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code"><Code size={15} /></TBtn>
      <TDivider />
      {/* Alignment */}
      <TBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left"><AlignLeft size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center"><AlignCenter size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right"><AlignRight size={15} /></TBtn>
      <TDivider />
      {/* Lists + Blocks */}
      <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List"><ListOrdered size={15} /></TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote size={15} /></TBtn>
      <TDivider />
      {/* Link */}
      <TBtn onClick={() => setLinkDialog(true)} active={editor.isActive("link")} title="Insert Link"><Link2 size={15} /></TBtn>
      <TDivider />
      {/* Actions */}
      <div className="ml-auto flex items-center gap-1">
        <TBtn onClick={copyContent} title="Copy plain text">{copied ? <Check size={15} className="text-black dark:text-white" /> : <Copy size={15} />}</TBtn>
        <TBtn onClick={downloadHtml} title="Download HTML"><Download size={15} /></TBtn>
        <TDivider />
        {/* Toggle panel — desktop */}
        <button
          onClick={() => setShowPanel(p => !p)}
          title={showPanel ? "Hide suggestions" : "Show suggestions"}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-[11px] font-bold transition-colors"
        >
          {showPanel ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          <span className="hidden lg:inline">{showPanel ? "Hide" : "Suggestions"}</span>
        </button>
        {/* Toggle panel — mobile */}
        <button
          onClick={() => setShowMobilePanel(p => !p)}
          title="SEO Suggestions"
          className="md:hidden relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold"
        >
          <Zap size={14} />
          {(errorCount + warnCount) > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-black dark:bg-white border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center text-[8px] font-black text-white dark:text-black">{errorCount + warnCount}</span>
          )}
        </button>
      </div>
    </div>
  ) : null;

  // ─── Suggestion Panel ───────────────────────────────────────────────────────
  const SuggestionPanel = ({ mobile = false }) => (
    <div className={`flex flex-col bg-[#f5f5f7] dark:bg-[#0f0f12] overflow-hidden ${mobile ? "flex-1" : "w-72 xl:w-80 shrink-0 border-l border-gray-200 dark:border-gray-800"}`}>
      {/* Score header */}
      <div className="shrink-0 bg-white dark:bg-[#1a1a22] border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Live SEO Score</span>
          </div>
          {isAnalyzing && <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Loader2 size={10} className="animate-spin" />Scanning…</div>}
        </div>

        {/* Score + bars */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#f3f4f6" strokeWidth="5" className="dark:stroke-gray-800" />
              <motion.circle cx="24" cy="24" r="20" fill="none" strokeWidth="5" strokeLinecap="round"
                stroke={score >= 75 ? "#000" : score >= 50 ? "#6b7280" : "#d1d5db"}
                className={score >= 75 ? "dark:stroke-white" : "dark:stroke-gray-400"}
                strokeDasharray={125.6}
                animate={{ strokeDashoffset: 125.6 - (score / 100) * 125.6 }}
                initial={{ strokeDashoffset: 125.6 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-extrabold text-gray-900 dark:text-white leading-none">{score}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {errorCount > 0 && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full" /><span className="text-[10px] font-black text-gray-900 dark:text-white">{errorCount} error{errorCount > 1 ? "s" : ""}</span></div>}
            {warnCount > 0 && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /><span className="text-[10px] font-black text-gray-500">{warnCount} warning{warnCount > 1 ? "s" : ""}</span></div>}
            {tipCount > 0 && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" /><span className="text-[10px] font-black text-gray-400">{tipCount} tip{tipCount > 1 ? "s" : ""}</span></div>}
            {okCount > 0 && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-gray-200 rounded-full" /><span className="text-[10px] font-bold text-gray-300 dark:text-gray-600">{okCount} passing</span></div>}
          </div>
        </div>

        {/* Score progress bar */}
        <div className="mt-3 w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-black dark:bg-white rounded-full" animate={{ width: `${score}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="shrink-0 px-4 py-3 flex gap-2 overflow-x-auto border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a22]">
        <Stat label="Words" value={wordCount} />
        <Stat label="Read" value={`${readTime}m`} />
        {aiMeta?.readabilityScore != null && <Stat label="Readability" value={aiMeta.readabilityScore} sub="/100" />}
        {aiMeta?.keywordDensity != null && (
          <Stat label="KW %" value={`${aiMeta.keywordDensity}%`} highlight={aiMeta.keywordDensity >= 0.5 && aiMeta.keywordDensity <= 2.5} />
        )}
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
        {allSuggestions.length === 0 && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Zap size={16} className="text-gray-400" />
            </div>
            <p className="text-[11px] font-bold text-gray-400">Write to see live suggestions</p>
          </div>
        )}

        {instantChecks.length > 0 && (
          <>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 px-1 mt-1 mb-0.5">Instant Checks</p>
            {instantChecks.map((s, i) => <SuggestionCard key={`i-${i}`} s={s} index={i} />)}
          </>
        )}

        {(aiSuggestions.length > 0 || isAnalyzing) && (
          <>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 px-1 mt-3 mb-0.5 flex items-center gap-1.5">
              AI Analysis {isAnalyzing && <Loader2 size={9} className="animate-spin" />}
            </p>
            <AnimatePresence>
              {aiSuggestions.map((s, i) => <SuggestionCard key={`a-${i}`} s={s} index={i} />)}
            </AnimatePresence>
          </>
        )}

        {aiError && !isAnalyzing && (
          <div className="flex items-center gap-2 bg-white dark:bg-[#1e1e28] border border-gray-100 dark:border-gray-800 rounded-xl p-3 mt-1">
            <AlertTriangle size={11} className="text-gray-400 shrink-0" />
            <p className="text-[10px] text-gray-400 font-medium">{aiError}</p>
          </div>
        )}
        <div className="h-4" />
      </div>

      {lastAnalyzed > 0 && (
        <div className="shrink-0 px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a22] flex items-center justify-between">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
            AI: {new Date(lastAnalyzed).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button onClick={() => { if (editor) runAiAnalysis(editor.getText(), keyword, title); }} className="text-[9px] font-bold text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">
            <RefreshCw size={9} /> Re-run
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{editorStyles}</style>

      <div className="flex flex-col h-screen bg-[#f5f5f7] dark:bg-[#0f0f12] text-gray-900 dark:text-gray-100 border-l border-gray-200 dark:border-gray-800 w-full overflow-hidden">

        {/* ── Top header ── */}
        <div className="shrink-0 bg-white dark:bg-[#1a1a22] border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-gray-900 dark:bg-white rounded-xl shrink-0">
              <Type size={15} className="text-white dark:text-gray-900" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white font-heading truncate">Live SEO Editor</h1>
              <p className="text-[10px] text-gray-400 font-medium">Write, optimize, publish — all in one place</p>
            </div>
          </div>

          {/* Title + Keyword inputs */}
          <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-2xl">
            <div className="relative flex-1 min-w-0">
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Page title (50–60 chars)"
                className="w-full pr-10 bg-gray-50 dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
              />
              <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black ${title.length > 60 ? "text-black dark:text-white" : "text-gray-300 dark:text-gray-600"}`}>
                {title.length}/60
              </span>
            </div>
            <div className="relative sm:w-44 flex-shrink-0">
              <Target size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                placeholder="Target keyword"
                className="w-full pl-7 bg-gray-50 dark:bg-[#1e1e28] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <Toolbar />

        {/* ── Body: editor + panel ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Editor */}
          <div className="flex-1 min-w-0 overflow-y-auto bg-white dark:bg-[#1e1e28]">
            <EditorContent
              editor={editor}
              className="tiptap-editor h-full min-h-full text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Desktop side panel */}
          <AnimatePresence>
            {showPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="hidden md:flex overflow-hidden"
              >
                <SuggestionPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Mobile bottom sheet ── */}
        <AnimatePresence>
          {showMobilePanel && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-black/40 z-40"
                onClick={() => setShowMobilePanel(false)}
              />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white dark:bg-[#1a1a22] rounded-t-3xl border-t border-gray-200 dark:border-gray-800 shadow-2xl"
                style={{ maxHeight: "78vh" }}
              >
                <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">SEO Suggestions</span>
                  <button onClick={() => setShowMobilePanel(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
                <SuggestionPanel mobile />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Link dialog */}
      <AnimatePresence>
        {linkDialog && <LinkDialog editor={editor} onClose={() => setLinkDialog(false)} />}
      </AnimatePresence>
    </>
  );
}
