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
    const historyItem = {
  id: Date.now().toString(),
  module: "seo",
  inputs: { productCategory, articleTopic },
  result: data.result,
  createdAt: new Date().toISOString(),
};
const existing = JSON.parse(localStorage.getItem("contentHistory") || "[]");
localStorage.setItem("contentHistory", JSON.stringify([historyItem, ...existing]));
    setLoading(false);
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
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-white text-sm">← Dashboard</button>
        </div>
        <h1 className="text-3xl font-bold mb-2">SEO & Blog Strategy</h1>
        <p className="text-gray-400 mb-8">Generate keyword clusters, blog calendars & full article drafts</p>

        <div className="space-y-6 bg-gray-900 rounded-2xl p-6 mb-6">
          <div>
            <label className="text-sm text-purple-400 mb-2 block">Product Category</label>
            <input type="text" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}
              placeholder="e.g. AI marketing tool, project management SaaS"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Target Keywords (optional)</label>
            <input type="text" value={targetKeywords} onChange={(e) => setTargetKeywords(e.target.value)}
              placeholder="e.g. AI content generation, marketing automation"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Competitor Domains (optional)</label>
            <input type="text" value={competitorDomains} onChange={(e) => setCompetitorDomains(e.target.value)}
              placeholder="e.g. jasper.ai, copy.ai, hubspot.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Article Topic</label>
            <input type="text" value={articleTopic} onChange={(e) => setArticleTopic(e.target.value)}
              placeholder="e.g. How to automate your social media marketing"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <button onClick={handleGenerate} disabled={loading || !productCategory.trim() || !articleTopic.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-8 py-4 rounded-xl">
            {loading ? "Generating your SEO strategy..." : "Generate SEO Strategy →"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 rounded-2xl p-6">
            {renderContent(result)}
          </div>
        )}
      </div>
    </main>
  );
}