"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const SIZES = [
  { id: "instagram-post", label: "Instagram Post", icon: "📸", w: 1080, h: 1080, preview: { w: 400, h: 400 } },
  { id: "instagram-story", label: "Instagram Story", icon: "📱", w: 1080, h: 1920, preview: { w: 225, h: 400 } },
  { id: "linkedin-post", label: "LinkedIn Post", icon: "💼", w: 1200, h: 627, preview: { w: 400, h: 209 } },
];

const STYLES = [
  { id: "bold", label: "Bold & Dramatic", emoji: "🔥" },
  { id: "minimal", label: "Clean & Minimal", emoji: "✨" },
  { id: "gradient", label: "Gradient Vibes", emoji: "🌈" },
  { id: "dark", label: "Dark Luxury", emoji: "🖤" },
  { id: "neon", label: "Neon & Electric", emoji: "⚡" },
  { id: "magazine", label: "Magazine Style", emoji: "📰" },
];

const QUICK_PROMPTS = [
  "New product launch — bold and exciting",
  "Summer sale 50% off — bright and energetic",
  "Limited edition drop — dark luxury feel",
  "Motivational quote — minimal and clean",
  "Grand opening — festive and colorful",
  "Flash sale 24 hours — urgent and bold",
];

export default function PosterMaker() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brandColors, setBrandColors] = useState<string[]>(["#7c3aed", "#ec4899", "#3b82f6"]);
  const [prompt, setPrompt] = useState("");
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [posterHTML, setPosterHTML] = useState("");
  const [finalHTML, setFinalHTML] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [keywords, setKeywords] = useState("");
  const [activeTab, setActiveTab] = useState<"poster" | "caption">("poster");
  const [copied, setCopied] = useState("");
  const [logoBase64, setLogoBase64] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [step, setStep] = useState<"setup" | "editor">("setup");

  useEffect(() => {
    const saved = localStorage.getItem("answers");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnswers(parsed);
      if (parsed.colorPalette) {
        try {
          const colors = JSON.parse(parsed.colorPalette);
          if (colors.length > 0) setBrandColors(colors);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (!posterHTML) { setFinalHTML(""); return; }
    const logoTag = logoBase64
      ? `<img src="${logoBase64}" style="position:absolute;top:32px;left:32px;width:auto;height:80px;max-width:200px;object-fit:contain;z-index:99999;" alt="logo" />`
      : "";
    const editorScript = editMode ? `
      <style>
        [data-editable]:hover { outline: 2px dashed rgba(124,58,237,0.7) !important; cursor: text !important; }
        [data-editable]:focus { outline: 2px solid #7c3aed !important; }
        #edit-hint { position:fixed;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(15,5,30,0.95);color:#a78bfa;padding:6px 14px;border-radius:20px;font-size:11px;font-family:sans-serif;border:1px solid rgba(124,58,237,0.4);z-index:999999;white-space:nowrap; }
      </style>
      <div id="edit-hint">✏️ Click any text to edit it directly</div>
      <script>
        document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,button,a,div').forEach(function(el) {
          if (el.children.length > 2 || el.querySelector('div,section,nav')) return;
          if (el.closest('[data-editable]')) return;
          var txt = el.innerText || el.textContent || '';
          if (!txt.trim() || txt.trim().length > 200) return;
          el.setAttribute('data-editable','true');
          el.contentEditable = 'true';
          el.spellcheck = false;
          el.addEventListener('input', function() {
            window.parent.postMessage({type:'HTML_UPDATE',html:document.documentElement.outerHTML},'*');
          });
          el.addEventListener('keydown', function(e) {
            if(e.key==='Escape') { el.blur(); }
          });
        });
      <\/script>` : "";
    let html = posterHTML;
    if (logoTag) html = html.replace(/<body([^>]*)>/, `<body$1>${logoTag}`);
    if (editorScript) html = html.replace("</body>", `${editorScript}</body>`);
    setFinalHTML(html);
  }, [posterHTML, logoBase64, editMode]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "HTML_UPDATE") setPosterHTML(e.data.html);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogoBase64(base64);
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setPosterHTML(""); setFinalHTML(""); setCaption(""); setHashtags(""); setKeywords("");
    setEditMode(false);
    try {
      const res = await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: prompt, size: selectedSize, style: selectedStyle.id,
          brandColors, answers,
          brandStrategy: localStorage.getItem("brandStrategy") || "",
        }),
      });
      const data = await res.json();
      setPosterHTML(data.html || "");
      setCaption(data.caption || "");
      setHashtags(data.hashtags || "");
      setKeywords(data.keywords || "");
      setStep("editor");
      setActiveTab("poster");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  async function downloadAsPNG() {
    if (!finalHTML) return;
    setDownloading(true);
    const script = `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script><script>window.onload=function(){setTimeout(function(){html2canvas(document.body,{width:${selectedSize.w},height:${selectedSize.h},scale:1,useCORS:true,allowTaint:true,backgroundColor:null}).then(function(c){var a=document.createElement('a');a.download='${answers.productName||"poster"}-${selectedSize.id}.png';a.href=c.toDataURL('image/png');a.click();setTimeout(function(){document.body.innerHTML='<div style="text-align:center;padding:60px;font-family:sans-serif;"><div style="font-size:48px">✅</div><h2 style="color:#7c3aed">PNG Downloaded!</h2><button onclick="window.close()" style="background:#7c3aed;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;margin-top:12px;">Close</button></div>';},500);});},800);};<\/script>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(finalHTML.replace("</body>", `${script}</body>`)); win.document.close(); }
    setDownloading(false);
  }

  function saveAsPDF() {
    if (!finalHTML) return;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(finalHTML.replace("</head>", `<style>@page{margin:0;size:${selectedSize.w}px ${selectedSize.h}px;}body{margin:0!important;}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}</style></head>`));
      win.document.close();
      setTimeout(() => { win.focus(); win.print(); }, 800);
    }
  }

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-30 sticky top-0 z-30"
        style={{ background: "rgba(10,5,20,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => step === "editor" ? setStep("setup") : router.push("/dashboard")}
            className="text-gray-500 hover:text-white text-sm transition-colors">
            ← {step === "editor" ? "Back" : "Dashboard"}
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-xl">🖼️</span>
          <span className="font-bold text-white">AI Poster Maker</span>
          {step === "editor" && posterHTML && (
            <button onClick={() => setEditMode(!editMode)}
              className={`ml-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${editMode ? "text-white" : "text-gray-400"}`}
              style={{ background: editMode ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.06)", border: `1px solid ${editMode ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.08)"}` }}>
              {editMode ? "✏️ Editing Live" : "✏️ Edit Mode"}
            </button>
          )}
        </div>
        {step === "editor" && finalHTML && (
          <div className="flex gap-2">
            <button onClick={downloadAsPNG} disabled={downloading}
              className="text-white font-bold px-4 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
              {downloading ? "⏳..." : "⬇ PNG"}
            </button>
            <button onClick={saveAsPDF}
              className="text-white font-bold px-4 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              🖨️ PDF
            </button>
          </div>
        )}
      </div>

      {step === "setup" ? (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-3">🖼️ AI Poster Maker</h1>
            <p className="text-gray-500 text-lg">Describe your poster — AI designs it in your brand colors</p>
          </div>

          <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30 mb-5" style={{ background: "rgba(26,5,51,0.4)" }}>
            <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">✍️ Describe your poster</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Bold fashion poster for new summer collection with energetic vibes..."
              rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none mb-4" />
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button key={p} onClick={() => setPrompt(p)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 font-medium"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="rounded-2xl p-5 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
              <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">📐 Size</label>
              <div className="space-y-2">
                {SIZES.map((size) => (
                  <button key={size.id} onClick={() => setSelectedSize(size)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${selectedSize.id === size.id ? "border-purple-500 bg-purple-900 bg-opacity-30" : "border-gray-800 hover:border-gray-600"}`}>
                    <span className="text-xl">{size.icon}</span>
                    <div>
                      <div className="text-white text-sm font-bold">{size.label}</div>
                      <div className="text-gray-600 text-xs">{size.w}×{size.h}px</div>
                    </div>
                    {selectedSize.id === size.id && <span className="ml-auto text-purple-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl p-5 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
                <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">🎨 Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((style) => (
                    <button key={style.id} onClick={() => setSelectedStyle(style)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${selectedStyle.id === style.id ? "text-white border-purple-500" : "text-gray-500 border-gray-800 hover:border-gray-600"}`}
                      style={{ background: selectedStyle.id === style.id ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.02)" }}>
                      {style.emoji} {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
                <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">🏷️ Logo (optional)</label>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                {logoPreview ? (
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 rounded-lg flex items-center justify-center p-2 border border-purple-500 border-opacity-30" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-green-400 text-xs font-bold mb-1">✅ Logo ready!</p>
                      <button onClick={() => { setLogoBase64(""); setLogoPreview(""); }} className="text-xs text-red-400 hover:text-red-300">Remove ×</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => logoInputRef.current?.click()}
                    className="w-full py-5 rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 transition-all text-center group">
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🖼️</div>
                    <p className="text-gray-500 text-xs">Click to upload logo</p>
                  </button>
                )}
              </div>

              <div className="rounded-2xl p-5 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
                <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 block">🎨 Brand Colors</label>
                <div className="flex gap-2">
                  {brandColors.slice(0, 3).map((color, i) => (
                    <div key={i} className="flex-1 h-8 rounded-lg" style={{ background: color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
            className="w-full relative overflow-hidden text-white font-black py-6 rounded-2xl text-xl transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 60px rgba(124,58,237,0.5)" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="animate-pulse">✨ AI is designing your poster</span>
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </span>
            ) : "🖼️ Generate My Poster →"}
          </button>
        </div>
      ) : (
        <div className="flex overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>
          {/* LEFT — Poster Preview */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto" style={{ background: "rgba(0,0,0,0.4)" }}>
            {editMode && (
              <div className="mb-4 px-5 py-2 rounded-full text-sm font-bold animate-pulse"
                style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.5)", color: "#a78bfa" }}>
                ✏️ Edit Mode ON — Click any text on the poster to edit it
              </div>
            )}
            <div style={{ width: selectedSize.preview.w, height: selectedSize.preview.h, overflow: "hidden", borderRadius: 16, boxShadow: "0 0 80px rgba(124,58,237,0.4), 0 30px 80px rgba(0,0,0,0.6)" }}>
              <iframe ref={iframeRef} srcDoc={finalHTML}
                style={{ width: selectedSize.w, height: selectedSize.h, border: "none", transform: `scale(${selectedSize.preview.w / selectedSize.w})`, transformOrigin: "top left" }}
                title="Poster Preview" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={downloadAsPNG} disabled={downloading}
                className="text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
                {downloading ? "⏳ Preparing..." : "⬇ Download PNG"}
              </button>
              <button onClick={saveAsPDF}
                className="text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
                🖨️ Save as PDF
              </button>
            </div>
          </div>

          {/* RIGHT — Side Panel */}
          <div className="w-72 flex flex-col border-l border-purple-900 border-opacity-20 overflow-y-auto flex-shrink-0"
            style={{ background: "rgba(10,5,20,0.98)" }}>
            <div className="flex border-b border-purple-900 border-opacity-20">
              {[{ id: "poster", label: "🎨 Edit" }, { id: "caption", label: "✍️ Caption" }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 text-xs font-bold transition-all ${activeTab === tab.id ? "text-white border-b-2 border-purple-500" : "text-gray-600"}`}
                  style={{ background: activeTab === tab.id ? "rgba(124,58,237,0.1)" : "transparent" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "poster" && (
              <div className="p-4 space-y-4">
                {/* Live Edit Toggle */}
                <div className="rounded-xl p-4 border border-purple-900 border-opacity-30" style={{ background: "rgba(124,58,237,0.08)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-bold">✏️ Live Text Editor</p>
                    <button onClick={() => setEditMode(!editMode)}
                      className={`w-12 h-6 rounded-full transition-all relative ${editMode ? "bg-purple-600" : "bg-gray-700"}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editMode ? "left-7" : "left-1"}`} />
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs">{editMode ? "✅ Click any text on the poster to edit" : "Toggle to enable click-to-edit"}</p>
                </div>

                {/* Regenerate */}
                <div className="rounded-xl p-4 border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)" }}>
                  <p className="text-white text-sm font-bold mb-3">🔄 Edit Prompt</p>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none mb-2" />
                  <button onClick={handleGenerate} disabled={loading}
                    className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                    {loading ? "✨ Generating..." : "✨ Regenerate"}
                  </button>
                </div>

                {/* Style switcher */}
                <div className="rounded-xl p-4 border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)" }}>
                  <p className="text-white text-sm font-bold mb-3">🎨 Switch Style</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STYLES.map((style) => (
                      <button key={style.id} onClick={() => setSelectedStyle(style)}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${selectedStyle.id === style.id ? "text-white border-purple-500" : "text-gray-500 border-gray-800 hover:border-gray-600"}`}
                        style={{ background: selectedStyle.id === style.id ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.02)" }}>
                        {style.emoji} {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo */}
                <div className="rounded-xl p-4 border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)" }}>
                  <p className="text-white text-sm font-bold mb-3">🏷️ Logo</p>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  {logoPreview ? (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-lg flex items-center justify-center p-1 border border-purple-500 border-opacity-30" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-green-400 text-xs font-bold">✅ Showing on poster</p>
                        <button onClick={() => { setLogoBase64(""); setLogoPreview(""); }} className="text-xs text-red-400">Remove ×</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => logoInputRef.current?.click()}
                      className="w-full py-3 rounded-lg border border-dashed border-gray-700 hover:border-purple-500 text-gray-500 text-xs transition-all">
                      + Upload Logo
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === "caption" && (
              <div className="p-4 space-y-3">
                {[
                  { key: "caption", label: "📝 Caption", content: caption, isText: true },
                  { key: "hashtags", label: "# Hashtags", content: hashtags, isText: false },
                  { key: "keywords", label: "🔑 Keywords", content: keywords, isText: false },
                ].map(({ key, label, content, isText }) => (
                  <div key={key} className="rounded-xl p-4 border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-purple-400 text-xs font-bold">{label}</p>
                      <button onClick={() => copyText(content, key)}
                        className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                        {copied === key ? "✅" : "📋 Copy"}
                      </button>
                    </div>
                    {isText ? (
                      <p className="text-gray-300 text-xs leading-relaxed">{content}</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(key === "hashtags" ? content.split(" ").filter((h: string) => h.startsWith("#")) : content.split(",")).map((item: string, i: number) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded"
                            style={key === "hashtags" ? { background: "rgba(124,58,237,0.15)", color: "#a78bfa" } : { background: "rgba(255,255,255,0.05)", color: "#9ca3af" }}>
                            {item.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}