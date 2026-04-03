"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const SIZES = [
  { id: "instagram-post", label: "Instagram Post", icon: "📸", w: 1080, h: 1080, preview: { w: 320, h: 320 }, aspect: "1/1" },
  { id: "instagram-story", label: "Instagram Story", icon: "📱", w: 1080, h: 1920, preview: { w: 180, h: 320 }, aspect: "9/16" },
  { id: "linkedin-post", label: "LinkedIn Post", icon: "💼", w: 1200, h: 627, preview: { w: 320, h: 167 }, aspect: "1.91/1" },
];

const STYLES = [
  { id: "bold", label: "Bold & Dramatic", emoji: "🔥" },
  { id: "minimal", label: "Clean & Minimal", emoji: "✨" },
  { id: "gradient", label: "Gradient Vibes", emoji: "🌈" },
  { id: "dark", label: "Dark Luxury", emoji: "🖤" },
  { id: "simple", label: "Simple & Flat", emoji: "🎨" },
];

export default function PosterMaker() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brandColors, setBrandColors] = useState<string[]>(["#7c3aed", "#ec4899", "#3b82f6"]);
  const [topic, setTopic] = useState("");
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [posterHTML, setPosterHTML] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [keywords, setKeywords] = useState("");
  const [activeTab, setActiveTab] = useState<"poster" | "caption">("poster");
  const [copied, setCopied] = useState<string>("");
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

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
    if (!topic.trim()) return;
    setLoading(true);
    setPosterHTML(""); setCaption(""); setHashtags(""); setKeywords("");
    try {
      const res = await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic, size: selectedSize, style: selectedStyle.id,
          brandColors, answers,
          brandStrategy: localStorage.getItem("brandStrategy") || "",
          logoBase64: logoBase64 || null,
        }),
      });
      const data = await res.json();
      setPosterHTML(data.html || "");
      setCaption(data.caption || "");
      setHashtags(data.hashtags || "");
      setKeywords(data.keywords || "");
      setActiveTab("poster");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  async function downloadPoster() {
    if (!posterHTML) return;
    setDownloading(true);
    try {
      const downloadHTML = posterHTML.replace("</head>", `<style>
        @page { margin: 0; size: ${selectedSize.w}px ${selectedSize.h}px; }
        body { margin: 0; padding: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      </style></head>`);

      // Download as HTML file
      const blob = new Blob([downloadHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${answers.productName || "poster"}-${selectedSize.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Open in new tab with print dialog
      setTimeout(() => {
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(downloadHTML);
          win.document.close();
          setTimeout(() => win.print(), 800);
        }
      }, 300);
    } catch (e) { console.error(e); }
    setDownloading(false);
  }

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-30 sticky top-0 z-30"
        style={{ background: "rgba(10,5,20,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-xl">🖼️</span>
          <span className="font-bold text-white">AI Poster Maker</span>
        </div>
        {posterHTML && (
          <button onClick={downloadPoster} disabled={downloading}
            className="text-white font-bold px-5 py-2 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            {downloading ? "⏳ Preparing..." : "⬇ Download Poster"}
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black mb-1">🖼️ AI Poster Maker</h1>
              <p className="text-gray-500">Generate stunning social media posters with your brand colors</p>
            </div>

            {/* Topic */}
            <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
              <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">What's the poster about?</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. New product launch, Summer sale 50% off, Motivational quote..."
                rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
            </div>

            {/* ✅ Logo Upload */}
            <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
              <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">
                🏷️ Brand Logo <span className="text-gray-600 font-normal normal-case">(optional — appears on poster)</span>
              </label>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              {logoPreview ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-purple-900 border-opacity-30 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-400 text-sm font-bold mb-1">✅ Logo uploaded!</p>
                    <p className="text-gray-500 text-xs mb-2">Your logo will appear on the poster</p>
                    <button onClick={() => { setLogoBase64(""); setLogoPreview(""); }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove logo ×</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => logoInputRef.current?.click()}
                  className="w-full py-8 rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 transition-all text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
                  <p className="text-gray-400 text-sm font-medium">Click to upload your logo</p>
                  <p className="text-gray-600 text-xs mt-1">PNG, JPG, SVG — will be embedded in poster</p>
                </button>
              )}
            </div>

            {/* Size */}
            <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
              <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">Poster Size</label>
              <div className="grid grid-cols-3 gap-3">
                {SIZES.map((size) => (
                  <button key={size.id} onClick={() => setSelectedSize(size)}
                    className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-105 ${selectedSize.id === size.id ? "border-purple-500 bg-purple-900 bg-opacity-30" : "border-gray-800 hover:border-gray-600"}`}>
                    <div className="text-2xl mb-2">{size.icon}</div>
                    <div className="text-white text-xs font-bold">{size.label}</div>
                    <div className="text-gray-600 text-xs">{size.w}×{size.h}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
              <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">Design Style</label>
              <div className="flex gap-2 flex-wrap">
                {STYLES.map((style) => (
                  <button key={style.id} onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 ${selectedStyle.id === style.id ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                    style={{ background: selectedStyle.id === style.id ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.03)", border: selectedStyle.id === style.id ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.06)" }}>
                    {style.emoji} {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand colors */}
            <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
              <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 block">Your Brand Colors</label>
              <div className="flex gap-3 items-center">
                {brandColors.map((color, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-xl shadow-lg mb-1" style={{ background: color }} />
                    <p className="text-gray-600 text-xs font-mono">{color}</p>
                  </div>
                ))}
                <button onClick={() => router.push("/brand-profile")} className="ml-auto text-xs text-purple-400 hover:text-purple-300 transition-colors">Change →</button>
              </div>
            </div>

            {/* Generate */}
            <button onClick={handleGenerate} disabled={loading || !topic.trim()}
              className="w-full relative overflow-hidden text-white font-black py-5 rounded-2xl text-lg transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="animate-pulse">✨ Generating Poster</span>
                  <span className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </span>
              ) : `🖼️ Generate Poster${logoPreview ? " with Logo" : ""} + Caption →`}
            </button>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {posterHTML && (
              <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {[{ id: "poster", label: "🖼️ Poster Preview" }, { id: "caption", label: "✍️ Caption & Hashtags" }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "text-white" : "text-gray-600"}`}
                    style={{ background: activeTab === tab.id ? "rgba(124,58,237,0.4)" : "transparent" }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "poster" && (
              <div className="rounded-2xl overflow-hidden border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
                {posterHTML ? (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Preview — {selectedSize.label}</p>
                      <p className="text-gray-700 text-xs">{selectedSize.w}×{selectedSize.h}px</p>
                    </div>
                    <div className="flex justify-center">
                      <div style={{ width: selectedSize.preview.w, height: selectedSize.preview.h, overflow: "hidden", borderRadius: 12, boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}>
                        <iframe ref={iframeRef} srcDoc={posterHTML}
                          style={{ width: selectedSize.w, height: selectedSize.h, border: "none", transform: `scale(${selectedSize.preview.w / selectedSize.w})`, transformOrigin: "top left" }}
                          title="Poster Preview" sandbox="allow-scripts" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <button onClick={downloadPoster} disabled={downloading}
                        className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                        {downloading ? "⏳ Preparing..." : "⬇ Download Poster"}
                      </button>
                      <p className="text-gray-600 text-xs text-center">💡 Tip: In the print dialog, select "Save as PDF" for best quality</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-80 text-center p-8">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-gray-500 text-sm">Your poster will appear here</p>
                    <p className="text-gray-700 text-xs mt-1">Fill in the details and click Generate</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "caption" && posterHTML && (
              <div className="space-y-4">
                {[
                  { key: "caption", label: "📝 Caption", content: caption, isText: true },
                  { key: "hashtags", label: "# Hashtags", content: hashtags, isText: false },
                  { key: "keywords", label: "🔑 Keywords", content: keywords, isText: false },
                ].map(({ key, label, content, isText }) => (
                  <div key={key} className="rounded-2xl p-5 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">{label}</p>
                      <button onClick={() => copyText(content, key)}
                        className="text-xs px-3 py-1 rounded-lg font-medium transition-all hover:scale-105"
                        style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                        {copied === key ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    {isText ? (
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(key === "hashtags" ? content.split(" ").filter(h => h.startsWith("#")) : content.split(",")).map((item, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={key === "hashtags" ? { background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" } : { background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}>
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
      </div>
    </main>
  );
}