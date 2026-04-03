"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const SIZES = [
  { id: "instagram-post", label: "Instagram Post", icon: "📸", w: 1080, h: 1080, preview: { w: 500, h: 500 } },
  { id: "instagram-story", label: "Instagram Story", icon: "📱", w: 1080, h: 1920, preview: { w: 281, h: 500 } },
  { id: "linkedin-post", label: "LinkedIn Post", icon: "💼", w: 1200, h: 627, preview: { w: 500, h: 261 } },
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

const GOOGLE_FONTS = [
  "Oswald", "Montserrat", "Playfair Display", "Bebas Neue",
  "Raleway", "Poppins", "Roboto Condensed", "Anton",
  "Abril Fatface", "Righteous", "Pacifico", "Lobster",
];

type LayerType = "image" | "logo" | "text";

interface Layer {
  id: string;
  type: LayerType;
  src?: string;
  text?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  zIndex: number;
}

export default function PosterMaker() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brandColors, setBrandColors] = useState<string[]>(["#7c3aed", "#ec4899", "#3b82f6"]);
  const [prompt, setPrompt] = useState("");
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [posterHTML, setPosterHTML] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [keywords, setKeywords] = useState("");
  const [activeTab, setActiveTab] = useState<"layers" | "caption">("layers");
  const [copied, setCopied] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [step, setStep] = useState<"setup" | "editor">("setup");

  // Layers system
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; origW: number; origH: number } | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const scale = selectedSize.preview.w / selectedSize.w;

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

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setPosterHTML(""); setLayers([]); setCaption(""); setHashtags(""); setKeywords("");
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

      // Auto-create text layers from AI response
      if (data.layers) {
        const l = data.layers;
        const w = selectedSize.w;
        const h = selectedSize.h;
        const autoLayers: Layer[] = [];
        let z = 1;

        if (l.headline) autoLayers.push({
          id: `hl-${Date.now()}`, type: "text", text: l.headline,
          x: w * 0.08, y: h * 0.3, w: w * 0.85, h: 120,
          fontSize: Math.round(w * 0.075), fontFamily: "Oswald", color: "#ffffff", bold: true, italic: false, zIndex: z++
        });
        if (l.subheadline) autoLayers.push({
          id: `sh-${Date.now()+1}`, type: "text", text: l.subheadline,
          x: w * 0.08, y: h * 0.52, w: w * 0.85, h: 80,
          fontSize: Math.round(w * 0.04), fontFamily: "Montserrat", color: "#ffffff", bold: false, italic: false, zIndex: z++
        });
        if (l.body) autoLayers.push({
          id: `bd-${Date.now()+2}`, type: "text", text: l.body,
          x: w * 0.08, y: h * 0.62, w: w * 0.75, h: 70,
          fontSize: Math.round(w * 0.025), fontFamily: "Montserrat", color: "rgba(255,255,255,0.8)", bold: false, italic: false, zIndex: z++
        });
        if (l.cta) autoLayers.push({
          id: `cta-${Date.now()+3}`, type: "text", text: l.cta,
          x: w * 0.08, y: h * 0.75, w: w * 0.4, h: 70,
          fontSize: Math.round(w * 0.028), fontFamily: "Oswald", color: brandColors[0] || "#7c3aed", bold: true, italic: false, zIndex: z++
        });
        setLayers(autoLayers);
      }

      setStep("editor");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function addImageLayer(src: string, type: LayerType) {
    const newLayer: Layer = {
      id: Date.now().toString(),
      type,
      src,
      x: type === "logo" ? 30 : selectedSize.w / 2 - 200,
      y: type === "logo" ? 30 : selectedSize.h / 2 - 200,
      w: type === "logo" ? 180 : 400,
      h: type === "logo" ? 90 : 400,
      zIndex: layers.length + 1,
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
  }

  function addTextLayer() {
    const newLayer: Layer = {
      id: Date.now().toString(),
      type: "text",
      text: "Your Text Here",
      x: selectedSize.w / 2 - 200,
      y: selectedSize.h / 2 - 40,
      w: 400,
      h: 80,
      fontSize: 48,
      fontFamily: "Oswald",
      color: "#ffffff",
      bold: true,
      italic: false,
      zIndex: layers.length + 1,
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
    setTimeout(() => setEditingText(newLayer.id), 100);
  }

  function uploadFile(e: React.ChangeEvent<HTMLInputElement>, type: LayerType) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => addImageLayer(ev.target?.result as string, type);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function updateLayer(id: string, updates: Partial<Layer>) {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }

  function deleteLayer(id: string) {
    setLayers(prev => prev.filter(l => l.id !== id));
    setSelectedLayer(null);
    setEditingText(null);
  }

  // Mouse drag handlers
  function onMouseDown(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelectedLayer(id);
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    setDragging({ id, startX: e.clientX, startY: e.clientY, origX: layer.x, origY: layer.y });
  }

  function onResizeDown(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    setResizing({ id, startX: e.clientX, startY: e.clientY, origW: layer.w, origH: layer.h });
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (dragging) {
        const dx = (e.clientX - dragging.startX) / scale;
        const dy = (e.clientY - dragging.startY) / scale;
        updateLayer(dragging.id, {
          x: Math.max(0, Math.min(selectedSize.w - 50, dragging.origX + dx)),
          y: Math.max(0, Math.min(selectedSize.h - 50, dragging.origY + dy)),
        });
      }
      if (resizing) {
        const dx = (e.clientX - resizing.startX) / scale;
        const dy = (e.clientY - resizing.startY) / scale;
        updateLayer(resizing.id, {
          w: Math.max(50, resizing.origW + dx),
          h: Math.max(30, resizing.origH + dy),
        });
      }
    }
    function onMouseUp() { setDragging(null); setResizing(null); }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [dragging, resizing, scale]);

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  async function downloadAsPNG() {
    if (!posterHTML) return;
    setDownloading(true);

    // Build layers HTML to inject
    const layersHTML = layers.map(layer => {
      if (layer.type === "text") {
        return `<div style="position:absolute;left:${layer.x}px;top:${layer.y}px;width:${layer.w}px;min-height:${layer.h}px;font-size:${layer.fontSize}px;font-family:'${layer.fontFamily}',sans-serif;color:${layer.color};font-weight:${layer.bold ? "bold" : "normal"};font-style:${layer.italic ? "italic" : "normal"};z-index:${1000 + layer.zIndex};word-break:break-word;line-height:1.2;">${layer.text}</div>`;
      }
      return `<img src="${layer.src}" style="position:absolute;left:${layer.x}px;top:${layer.y}px;width:${layer.w}px;height:${layer.h}px;object-fit:contain;z-index:${1000 + layer.zIndex};" />`;
    }).join("");

    const googleFontsUrl = layers.filter(l => l.fontFamily).map(l => l.fontFamily).filter(Boolean).join("|");
    const fontImport = googleFontsUrl ? `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(googleFontsUrl)}&display=swap" rel="stylesheet">` : "";

    const finalHTML = posterHTML
      .replace("</head>", `${fontImport}</head>`)
      .replace("</body>", `${layersHTML}<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script><script>window.onload=function(){setTimeout(function(){html2canvas(document.body,{width:${selectedSize.w},height:${selectedSize.h},scale:1,useCORS:true,allowTaint:true,backgroundColor:null,logging:false}).then(function(c){var a=document.createElement('a');a.download='${answers.productName||"poster"}-poster.png';a.href=c.toDataURL('image/png');a.click();setTimeout(function(){document.body.innerHTML='<div style="text-align:center;padding:60px;font-family:sans-serif"><div style="font-size:48px">✅</div><h2 style="color:#7c3aed">PNG Downloaded!</h2><button onclick="window.close()" style="background:#7c3aed;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;margin-top:12px;font-size:15px">Close</button></div>';},500);});},1200);};<\/script></body>`);

    const win = window.open("", "_blank");
    if (win) { win.document.write(finalHTML); win.document.close(); }
    setDownloading(false);
  }

  function saveAsPDF() {
    if (!posterHTML) return;
    const layersHTML = layers.map(layer => {
      if (layer.type === "text") {
        return `<div style="position:absolute;left:${layer.x}px;top:${layer.y}px;width:${layer.w}px;font-size:${layer.fontSize}px;font-family:'${layer.fontFamily}',sans-serif;color:${layer.color};font-weight:${layer.bold ? "bold" : "normal"};z-index:${1000 + layer.zIndex};">${layer.text}</div>`;
      }
      return `<img src="${layer.src}" style="position:absolute;left:${layer.x}px;top:${layer.y}px;width:${layer.w}px;height:${layer.h}px;object-fit:contain;z-index:${1000 + layer.zIndex};" />`;
    }).join("");

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(posterHTML.replace("</head>", `<style>@page{margin:0;size:${selectedSize.w}px ${selectedSize.h}px;}body{margin:0!important;}*{-webkit-print-color-adjust:exact!important;}</style></head>`).replace("</body>", `${layersHTML}</body>`));
      win.document.close();
      setTimeout(() => { win.focus(); win.print(); }, 800);
    }
  }

  const selectedLayerData = layers.find(l => l.id === selectedLayer);

  return (
    <main className="min-h-screen text-white select-none" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-purple-900 border-opacity-30 sticky top-0 z-50"
        style={{ background: "rgba(10,5,20,0.95)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => step === "editor" ? setStep("setup") : router.push("/dashboard")}
            className="text-gray-500 hover:text-white text-sm transition-colors">
            ← {step === "editor" ? "Back" : "Dashboard"}
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-xl">🖼️</span>
          <span className="font-bold text-white">AI Poster Maker</span>
          {step === "editor" && <span className="text-xs text-gray-600 hidden md:block">— Drag, resize & edit your poster</span>}
        </div>
        {step === "editor" && posterHTML && (
          <div className="flex gap-2">
            <button onClick={downloadAsPNG} disabled={downloading}
              className="text-white font-bold px-4 py-2 rounded-xl text-sm transition-all hover:scale-105 flex items-center gap-2"
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
        /* ===== SETUP ===== */
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🖼️</div>
            <h1 className="text-4xl font-black mb-3">AI Poster Maker</h1>
            <p className="text-gray-500 text-lg">Describe your poster → AI generates it → You customize everything</p>
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
                    {selectedSize.id === size.id && <span className="ml-auto text-purple-400">✓</span>}
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
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${selectedStyle.id === style.id ? "text-white border-purple-500" : "text-gray-500 border-gray-800 hover:border-gray-600"}`}
                      style={{ background: selectedStyle.id === style.id ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.02)" }}>
                      {style.emoji} {style.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-5 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
                <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 block">🎨 Brand Colors</label>
                <div className="flex gap-2">
                  {brandColors.slice(0, 3).map((color, i) => (
                    <div key={i} className="flex-1 h-8 rounded-lg shadow-lg" style={{ background: color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
            className="w-full text-white font-black py-6 rounded-2xl text-xl transition-all hover:scale-105 disabled:opacity-60 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 60px rgba(124,58,237,0.5)" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="animate-pulse">✨ AI is designing your poster...</span>
              </span>
            ) : "🖼️ Generate My Poster →"}
          </button>
        </div>
      ) : (
        /* ===== EDITOR ===== */
        <div className="flex overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>

          {/* LEFT TOOLBAR */}
          <div className="w-16 flex flex-col items-center gap-3 py-4 border-r border-purple-900 border-opacity-20 flex-shrink-0"
            style={{ background: "rgba(10,5,20,0.98)" }}>
            {[
              { icon: "🏷️", label: "Logo", action: () => logoInputRef.current?.click() },
              { icon: "🧍", label: "Image", action: () => imageInputRef.current?.click() },
              { icon: "✏️", label: "Text", action: addTextLayer },
            ].map((tool) => (
              <button key={tool.label} onClick={tool.action} title={tool.label}
                className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-110 group"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <span className="text-lg">{tool.icon}</span>
                <span className="text-gray-600 text-[9px] group-hover:text-purple-400 transition-colors">{tool.label}</span>
              </button>
            ))}
            <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => uploadFile(e, "logo")} className="hidden" />
            <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => uploadFile(e, "image")} className="hidden" />

            <div className="w-8 h-px bg-gray-800 my-1" />

            {/* Layer list mini */}
            {layers.map((layer, i) => (
              <button key={layer.id} onClick={() => setSelectedLayer(layer.id)} title={layer.type}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all ${selectedLayer === layer.id ? "ring-2 ring-purple-500" : "hover:scale-110"}`}
                style={{ background: selectedLayer === layer.id ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)" }}>
                {layer.type === "text" ? "T" : layer.type === "logo" ? "🏷️" : "🖼️"}
              </button>
            ))}
          </div>

          {/* CANVAS */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-6" style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSelectedLayer(null)}>
            <div ref={canvasRef} className="relative flex-shrink-0"
              style={{ width: selectedSize.preview.w, height: selectedSize.preview.h, borderRadius: 12, overflow: "hidden", boxShadow: "0 0 100px rgba(124,58,237,0.4), 0 40px 100px rgba(0,0,0,0.8)" }}>

              {/* AI Poster as background */}
              <iframe srcDoc={posterHTML}
                style={{ width: selectedSize.w, height: selectedSize.h, border: "none", transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}
                title="Poster Base" />

              {/* Draggable Layers */}
              {layers.map((layer) => (
                <div key={layer.id}
                  style={{ position: "absolute", left: layer.x * scale, top: layer.y * scale, width: layer.w * scale, height: layer.type === "text" ? "auto" : layer.h * scale, zIndex: 100 + layer.zIndex, cursor: dragging?.id === layer.id ? "grabbing" : "grab", userSelect: "none" }}
                  onClick={(e) => { e.stopPropagation(); setSelectedLayer(layer.id); }}
                  onMouseDown={(e) => { if (editingText !== layer.id) onMouseDown(e, layer.id); }}>

                  {layer.type === "text" ? (
                    editingText === layer.id ? (
                      <textarea
                        autoFocus
                        value={layer.text}
                        onChange={(e) => updateLayer(layer.id, { text: e.target.value })}
                        onBlur={() => setEditingText(null)}
                        style={{
                          width: "100%", background: "rgba(124,58,237,0.1)", border: "2px solid #7c3aed",
                          color: layer.color, fontSize: (layer.fontSize || 48) * scale,
                          fontFamily: `'${layer.fontFamily}', sans-serif`,
                          fontWeight: layer.bold ? "bold" : "normal",
                          fontStyle: layer.italic ? "italic" : "normal",
                          lineHeight: 1.2, resize: "none", outline: "none", borderRadius: 4, padding: "2px 4px",
                        }}
                        rows={3}
                      />
                    ) : (
                      <div
                        onDoubleClick={() => setEditingText(layer.id)}
                        style={{
                          color: layer.color, fontSize: (layer.fontSize || 48) * scale,
                          fontFamily: `'${layer.fontFamily}', sans-serif`,
                          fontWeight: layer.bold ? "bold" : "normal",
                          fontStyle: layer.italic ? "italic" : "normal",
                          lineHeight: 1.2, wordBreak: "break-word",
                          outline: selectedLayer === layer.id ? "2px dashed rgba(124,58,237,0.8)" : "none",
                          padding: "2px 4px", borderRadius: 4,
                          whiteSpace: "pre-wrap",
                        }}>
                        {layer.text}
                      </div>
                    )
                  ) : (
                    <img src={layer.src} alt={layer.type}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block",
                        outline: selectedLayer === layer.id ? "2px dashed rgba(124,58,237,0.8)" : "none",
                        borderRadius: 4 }}
                      draggable={false} />
                  )}

                  {/* Resize handle */}
                  {selectedLayer === layer.id && (
                    <div onMouseDown={(e) => { e.stopPropagation(); onResizeDown(e, layer.id); }}
                      style={{ position: "absolute", bottom: -6, right: -6, width: 14, height: 14, background: "#7c3aed", borderRadius: "50%", cursor: "se-resize", border: "2px solid white", zIndex: 200 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-72 flex flex-col border-l border-purple-900 border-opacity-20 overflow-y-auto flex-shrink-0"
            style={{ background: "rgba(10,5,20,0.98)" }}>

            <div className="flex border-b border-purple-900 border-opacity-20">
              {[{ id: "layers", label: "🎨 Properties" }, { id: "caption", label: "✍️ Caption" }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 text-xs font-bold transition-all ${activeTab === tab.id ? "text-white border-b-2 border-purple-500" : "text-gray-600"}`}
                  style={{ background: activeTab === tab.id ? "rgba(124,58,237,0.1)" : "transparent" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "layers" && (
              <div className="p-4 space-y-4">

                {/* Quick add */}
                <div className="rounded-xl p-4 border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.5)" }}>
                  <p className="text-white text-xs font-bold mb-3 uppercase tracking-wider">➕ Add to Poster</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => logoInputRef.current?.click()}
                      className="p-3 rounded-xl text-center transition-all hover:scale-105 text-xs font-bold"
                      style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
                      🏷️<br/>Logo
                    </button>
                    <button onClick={() => imageInputRef.current?.click()}
                      className="p-3 rounded-xl text-center transition-all hover:scale-105 text-xs font-bold"
                      style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
                      🧍<br/>Image
                    </button>
                    <button onClick={addTextLayer}
                      className="p-3 rounded-xl text-center transition-all hover:scale-105 text-xs font-bold"
                      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>
                      ✏️<br/>Text
                    </button>
                  </div>
                </div>

                {/* Selected layer properties */}
                {selectedLayerData ? (
                  <div className="rounded-xl p-4 border border-purple-500 border-opacity-40" style={{ background: "rgba(124,58,237,0.08)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white text-xs font-bold uppercase tracking-wider">
                        {selectedLayerData.type === "text" ? "✏️ Text Properties" : selectedLayerData.type === "logo" ? "🏷️ Logo Properties" : "🧍 Image Properties"}
                      </p>
                      <button onClick={() => deleteLayer(selectedLayerData.id)}
                        className="text-red-400 hover:text-red-300 text-xs transition-colors">🗑 Delete</button>
                    </div>

                    {/* Text-specific controls */}
                    {selectedLayerData.type === "text" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">Text Content</label>
                          <textarea value={selectedLayerData.text} onChange={(e) => updateLayer(selectedLayerData.id, { text: e.target.value })}
                            rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 resize-none" />
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">Font</label>
                          <select value={selectedLayerData.fontFamily} onChange={(e) => updateLayer(selectedLayerData.id, { fontFamily: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500">
                            {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-500 text-xs mb-1 block">Size</label>
                            <input type="number" value={selectedLayerData.fontSize} onChange={(e) => updateLayer(selectedLayerData.id, { fontSize: Number(e.target.value) })}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500" />
                          </div>
                          <div>
                            <label className="text-gray-500 text-xs mb-1 block">Color</label>
                            <div className="flex gap-2 items-center">
                              <input type="color" value={selectedLayerData.color} onChange={(e) => updateLayer(selectedLayerData.id, { color: e.target.value })}
                                className="w-10 h-8 rounded cursor-pointer border-0" />
                              <span className="text-gray-600 text-xs font-mono">{selectedLayerData.color}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateLayer(selectedLayerData.id, { bold: !selectedLayerData.bold })}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedLayerData.bold ? "text-white" : "text-gray-500"}`}
                            style={{ background: selectedLayerData.bold ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.05)", border: `1px solid ${selectedLayerData.bold ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}` }}>
                            B Bold
                          </button>
                          <button onClick={() => updateLayer(selectedLayerData.id, { italic: !selectedLayerData.italic })}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold italic transition-all ${selectedLayerData.italic ? "text-white" : "text-gray-500"}`}
                            style={{ background: selectedLayerData.italic ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.05)", border: `1px solid ${selectedLayerData.italic ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}` }}>
                            I Italic
                          </button>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block">Double-click poster text to edit inline</label>
                          <button onClick={() => setEditingText(selectedLayerData.id)}
                            className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                            ✏️ Edit Text on Poster
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Image/Logo size controls */}
                    {(selectedLayerData.type === "image" || selectedLayerData.type === "logo") && (
                      <div className="space-y-3">
                        <p className="text-gray-500 text-xs">Drag to move • Drag ● corner to resize</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-500 text-xs mb-1 block">Width</label>
                            <input type="number" value={Math.round(selectedLayerData.w)} onChange={(e) => updateLayer(selectedLayerData.id, { w: Number(e.target.value) })}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500" />
                          </div>
                          <div>
                            <label className="text-gray-500 text-xs mb-1 block">Height</label>
                            <input type="number" value={Math.round(selectedLayerData.h)} onChange={(e) => updateLayer(selectedLayerData.id, { h: Number(e.target.value) })}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateLayer(selectedLayerData.id, { zIndex: selectedLayerData.zIndex + 1 })}
                            className="flex-1 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            ↑ Move Up
                          </button>
                          <button onClick={() => updateLayer(selectedLayerData.id, { zIndex: Math.max(1, selectedLayerData.zIndex - 1) })}
                            className="flex-1 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            ↓ Move Down
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl p-6 text-center border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-gray-600 text-xs">Click a layer on the canvas to edit its properties</p>
                  </div>
                )}

                {/* Regenerate */}
                <div className="rounded-xl p-4 border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)" }}>
                  <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider">🔄 Regenerate</p>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 resize-none mb-2" />
                  <button onClick={handleGenerate} disabled={loading}
                    className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                    {loading ? "✨ Generating..." : "✨ Regenerate Background"}
                  </button>
                </div>

                {/* Download */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={downloadAsPNG} disabled={downloading}
                    className="py-3 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                    {downloading ? "⏳..." : "⬇ PNG"}
                  </button>
                  <button onClick={saveAsPDF}
                    className="py-3 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                    🖨️ PDF
                  </button>
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
                        {copied === key ? "✅" : "📋"}
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