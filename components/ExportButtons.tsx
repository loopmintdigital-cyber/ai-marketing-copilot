"use client";
import { useState } from "react";
import { downloadAsTXT, downloadAsHTML, printAsPDF } from "../lib/exportContent";

interface ExportButtonsProps {
  content: string;
  filename: string;
  productName: string;
}

export default function ExportButtons({ content, filename, productName }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2 items-center relative">
      <button onClick={copyToClipboard}
        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
        style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c084fc" }}>
        {copied ? "✅ Copied!" : "📋 Copy"}
      </button>
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c084fc" }}>
          ⬇ Export ▾
        </button>
        {showMenu && (
          <div className="absolute right-0 top-8 z-50 rounded-xl overflow-hidden border border-purple-900 border-opacity-30 shadow-xl"
            style={{ background: "rgba(15,5,30,0.95)", backdropFilter: "blur(20px)", minWidth: 180 }}>
            <button onClick={() => { downloadAsTXT(content, filename); setShowMenu(false); }}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-purple-900 hover:bg-opacity-30 transition-all">
              📄 Download as TXT
            </button>
            <button onClick={() => { downloadAsHTML(content, filename, productName); setShowMenu(false); }}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-purple-900 hover:bg-opacity-30 transition-all">
              🌐 Download as HTML
            </button>
            <button onClick={() => { printAsPDF(content, filename, productName); setShowMenu(false); }}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-purple-900 hover:bg-opacity-30 transition-all">
              🖨️ Print / Save as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
