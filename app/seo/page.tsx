"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SEO() {
  const router = useRouter();
  const [productCategory, setProductCategory] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [competitorDomains, setCompetitorDomains] = useState("");
  const [articleTopic, setArticleTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const brandStrategy = localStorage.getItem("brandStrategy") || "";
    const answers = JSON.parse(localStorage.getItem("answers") || "{}");
    const res = await fetch("/api/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productCategory, targetKeywords, competitorDomains, articleTopic, brandStrategy, answers }),
    });
    const data = await res.json();
    setResult(data.result);
    const historyItem = { id: Date.now().toString(), module: "seo", inputs: { productCategory, articleTopic }, result: data.result, createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("contentHistory") || "[]");
    localStorage.setItem("contentHistory", JSON.stringify([historyItem, ...existing]));
    setLoading(false);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderContent(content: string) {
    return (
      <div className="space-y-2">
        {content.split('\n').map((line, i) => {
          if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-white mt-4">{line.replace('# ', '')}</h2>;
          if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-purple-400 mt-3">{line.replace('## ', '')}</h3>;
          if (line.startsWith('### ')) return <h4 key={i} className="text-base font-semibold text-purple-300 mt-2">{line.replace('### ', '')}</h4>;
          if (line.startsWith('---')) return <hr key={i} className="border-gray-700 my-4" />;
          if (line.trim() === '') return <div key={i} className="h-1" />;
          return <p key={i} className="text-gray-300 text-sm">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
        })}
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white px-6 py-10" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mb-8">← Dashboard</button>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🔍</span>
          <h1 className="text-3xl font-bold">SEO & Blog Strategy</h1>
        </div>
        <p className="text-gray-400 mb-8 ml-14">Generate keyword clusters, blog calendars & full article drafts</p>

        <div className="space-y-6 rounded-2xl p-6 mb-6 border border-purple-900 border-opacity-50" style={{ background: "rgba(26, 5, 51, 0.6)", backdropFilter: "blur(10px)", boxShadow: "0 0 40px rgba(147, 51, 234, 0.1)" }}>
          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">Product Category</label>
            <input type="text" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}
              placeholder="e.g. Fashion brand, SaaS tool, E-commerce store"
              className="w-full border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" style={{ background: "rgba(17, 24, 39, 0.8)" }} />
          </div>
          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">Target Keywords <span className="text-gray-600">(optional)</span></label>
            <input type="text" value={targetKeywords} onChange={(e) => setTargetKeywords(e.target.value)}
              placeholder="e.g. affordable fashion, bold streetwear, premium quality"
              className="w-full border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" style={{ background: "rgba(17, 24, 39, 0.8)" }} />
          </div>
          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">Competitor Domains <span className="text-gray-600">(optional)</span></label>
            <input type="text" value={competitorDomains} onChange={(e) => setCompetitorDomains(e.target.value)}
              placeholder="e.g. zara.com, hm.com, westside.com"
              className="w-full border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" style={{ background: "rgba(17, 24, 39, 0.8)" }} />
          </div>
          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">Article Topic</label>
            <input type="text" value={articleTopic} onChange={(e) => setArticleTopic(e.target.value)}
              placeholder="e.g. How to style bold outfits on a budget"
              className="w-full border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" style={{ background: "rgba(17, 24, 39, 0.8)" }} />
          </div>
          <button onClick={handleGenerate} disabled={loading || !productCategory.trim() || !articleTopic.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-purple-900">
            {loading ? "✨ Generating your SEO strategy..." : "Generate SEO Strategy →"}
          </button>
        </div>

        {result && (
          <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30" style={{ background: "rgba(26, 5, 51, 0.4)", backdropFilter: "blur(10px)" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-purple-400 font-medium text-sm uppercase tracking-wider">Generated Content</h3>
              <button onClick={copyToClipboard} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-all">
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
            {renderContent(result)}
          </div>
        )}
      </div>
    </main>
  );
}
