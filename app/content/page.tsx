"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Content() {
  const router = useRouter();
  const [pageType, setPageType] = useState("landing");
  const [benefit, setBenefit] = useState("");
  const [persona, setPersona] = useState("");
  const [ctaGoal, setCtaGoal] = useState("free trial");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleGenerate() {
    setLoading(true);
    const brandStrategy = localStorage.getItem("brandStrategy") || "";
    const answers = JSON.parse(localStorage.getItem("answers") || "{}");

    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageType, benefit, persona, ctaGoal, brandStrategy, answers }),
    });
    const data = await res.json();
    setResult(data.result);
    const historyItem = {
  id: Date.now().toString(),
  module: "content",
  inputs: { pageType, benefit, persona },
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
        <h1 className="text-3xl font-bold mb-2">Content & Copywriting</h1>
        <p className="text-gray-400 mb-8">Generate landing pages, hero copy, feature copy & more</p>

        <div className="space-y-6 bg-gray-900 rounded-2xl p-6 mb-6">
          <div>
            <label className="text-sm text-purple-400 mb-2 block">Page Type</label>
            <div className="flex gap-3 flex-wrap">
              {["landing", "pricing", "feature", "about", "product"].map((t) => (
                <button key={t} onClick={() => setPageType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${pageType === t ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Key Benefit to Highlight</label>
            <input type="text" value={benefit} onChange={(e) => setBenefit(e.target.value)}
              placeholder="e.g. Save 10 hours a week on content creation"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Target Persona</label>
            <input type="text" value={persona} onChange={(e) => setPersona(e.target.value)}
              placeholder="e.g. SaaS founders, marketing managers"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">CTA Goal</label>
            <div className="flex gap-3 flex-wrap">
              {["free trial", "book a demo", "get started", "buy now"].map((c) => (
                <button key={c} onClick={() => setCtaGoal(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${ctaGoal === c ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !benefit.trim() || !persona.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-8 py-4 rounded-xl">
            {loading ? "Generating your copy..." : "Generate Copy →"}
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