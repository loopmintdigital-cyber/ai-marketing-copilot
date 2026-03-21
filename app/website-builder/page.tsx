"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WebsiteBuilder() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brandStrategy, setBrandStrategy] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [style, setStyle] = useState("modern");
  const [pages, setPages] = useState("landing");

  useEffect(() => {
    const saved = localStorage.getItem("answers");
    const strategy = localStorage.getItem("brandStrategy");
    if (!saved) { router.push("/onboarding"); return; }
    setAnswers(JSON.parse(saved));
    setBrandStrategy(strategy || "");
  }, []);

  useEffect(() => {
    if (!generatedHTML) return;
    setTimeout(() => {
      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
      if (!iframe) return;
      iframe.srcdoc = generatedHTML;
    }, 200);
  }, [generatedHTML, activeTab]);

  async function handleGenerate() {
    setLoading(true);
    const res = await fetch("/api/website-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, brandStrategy, style, pages }),
    });
    const data = await res.json();
    setGeneratedHTML(data.result);
    setLoading(false);
  }

  function downloadHTML() {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${answers.productName || "website"}.html`;
    a.click();
  }

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-30 sticky top-0 z-30" style={{ background: "rgba(10,5,20,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-2xl">🌐</span>
          <span className="font-bold text-white">Website Builder</span>
          <span className="text-gray-600 text-sm">— {answers.productName}</span>
        </div>
        {generatedHTML && (
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl overflow-hidden border border-purple-900 border-opacity-30">
              <button onClick={() => {
  const blob = new Blob([generatedHTML], { type: "text/html" });
  window.open(URL.createObjectURL(blob));
}}
  className={`px-4 py-2 text-sm font-medium transition-all text-white`}
  style={{ background: "rgba(124,58,237,0.4)" }}>
  👁 Preview
</button>
              <button onClick={() => setActiveTab("code")}
                className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === "code" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                style={{ background: activeTab === "code" ? "rgba(124,58,237,0.4)" : "transparent" }}>
                {"</>"} Code
              </button>
            </div>
            <button onClick={downloadHTML}
              className="text-white font-bold px-5 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
              ⬇ Download
            </button>
            <button onClick={handleGenerate}
              className="text-gray-300 font-medium px-4 py-2 rounded-xl text-sm transition-all hover:scale-105 border border-gray-700 hover:border-purple-500">
              🔄 Regenerate
            </button>
          </div>
        )}
      </div>

      {!generatedHTML ? (
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🌐</div>
            <h1 className="text-4xl font-black mb-3">Build Your Website</h1>
            <p className="text-gray-400 text-lg">AI generates a complete branded website for <span className="text-purple-400">{answers.productName}</span> in seconds</p>
          </div>
          <div className="space-y-6 rounded-2xl p-8 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.5)", backdropFilter: "blur(10px)" }}>
            <div>
              <label className="text-sm text-purple-400 mb-3 block font-medium uppercase tracking-wider">Website Style</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "modern", label: "Modern", emoji: "⚡", desc: "Clean & minimal" },
                  { id: "bold", label: "Bold", emoji: "🔥", desc: "Dark & dramatic" },
                  { id: "professional", label: "Professional", emoji: "💼", desc: "Corporate & clean" },
                ].map((s) => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={`p-4 rounded-xl border transition-all text-left ${style === s.id ? "border-purple-500 bg-purple-900 bg-opacity-30" : "border-gray-800 hover:border-gray-600"}`}>
                    <div className="text-2xl mb-2">{s.emoji}</div>
                    <div className="font-bold text-sm text-white">{s.label}</div>
                    <div className="text-gray-500 text-xs">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-purple-400 mb-3 block font-medium uppercase tracking-wider">Page Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "landing", label: "Landing Page", emoji: "🚀", desc: "Hero + features + CTA" },
                  { id: "saas", label: "SaaS Page", emoji: "💻", desc: "Pricing + features + FAQ" },
                  { id: "agency", label: "Agency Page", emoji: "🎯", desc: "Services + portfolio + CTA" },
                  { id: "ecommerce", label: "Product Page", emoji: "🛍️", desc: "Product showcase + buy" },
                ].map((p) => (
                  <button key={p.id} onClick={() => setPages(p.id)}
                    className={`p-4 rounded-xl border transition-all text-left ${pages === p.id ? "border-purple-500 bg-purple-900 bg-opacity-30" : "border-gray-800 hover:border-gray-600"}`}>
                    <div className="text-2xl mb-2">{p.emoji}</div>
                    <div className="font-bold text-sm text-white">{p.label}</div>
                    <div className="text-gray-500 text-xs">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading}
              className="w-full text-white font-black py-5 rounded-2xl text-lg transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
              {loading ? "🧠 Building your website..." : "🌐 Generate My Website →"}
            </button>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-65px)]">
          <iframe id="preview-iframe" className="w-full h-full border-0" title="Website Preview" style={{ display: activeTab === "preview" ? "block" : "none" }} />
          {activeTab === "code" && (
            <div className="h-full overflow-auto p-6">
              <pre className="text-green-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                {generatedHTML}
              </pre>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
