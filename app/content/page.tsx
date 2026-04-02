"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import ExportButtons from "@/components/ExportButtons";
import { useRouter } from "next/navigation";

export default function Content() {
  const router = useRouter();
  const { user } = useUser();
  const [pageType, setPageType] = useState("landing");
  const [benefit, setBenefit] = useState("");
  const [persona, setPersona] = useState("");
  const [ctaGoal, setCtaGoal] = useState("free trial");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const brandStrategy = localStorage.getItem("brandStrategy") || "";
    const answers = JSON.parse(localStorage.getItem("answers") || "{}");
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageType, benefit, persona, ctaGoal, brandStrategy, answers, userId: user?.id }),
    });
    const data = await res.json();
    setResult(data.result);
    const historyItem = { id: Date.now().toString(), module: "content", inputs: { pageType, benefit, persona }, result: data.result, createdAt: new Date().toISOString() };
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
          <span className="text-4xl">✍️</span>
          <h1 className="text-3xl font-bold">Content & Copywriting</h1>
        </div>
        <p className="text-gray-400 mb-8 ml-14">Generate landing pages, hero copy, feature copy & more</p>

        <div className="space-y-6 rounded-2xl p-6 mb-6 border border-purple-900 border-opacity-50" style={{ background: "rgba(26, 5, 51, 0.6)", backdropFilter: "blur(10px)", boxShadow: "0 0 40px rgba(147, 51, 234, 0.1)" }}>
          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">Page Type</label>
            <div className="flex gap-3 flex-wrap">
              {["landing", "pricing", "feature", "about", "product"].map((t) => (
                <button key={t} onClick={() => setPageType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${pageType === t ? "bg-purple-600 text-white shadow-lg shadow-purple-900" : "bg-gray-800 bg-opacity-60 text-gray-300 hover:bg-gray-700"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">Key Benefit to Highlight</label>
            <input type="text" value={benefit} onChange={(e) => setBenefit(e.target.value)}
              placeholder="e.g. Save 10 hours a week on content creation"
              className="w-full border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" style={{ background: "rgba(17, 24, 39, 0.8)" }} />
          </div>
          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">Target Persona</label>
            <input type="text" value={persona} onChange={(e) => setPersona(e.target.value)}
              placeholder="e.g. SaaS founders, marketing managers"
              className="w-full border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" style={{ background: "rgba(17, 24, 39, 0.8)" }} />
          </div>
          <div>
            <label className="text-sm text-purple-400 mb-2 block font-medium">CTA Goal</label>
            <div className="flex gap-3 flex-wrap">
              {["free trial", "book a demo", "get started", "buy now"].map((c) => (
                <button key={c} onClick={() => setCtaGoal(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${ctaGoal === c ? "bg-purple-600 text-white shadow-lg shadow-purple-900" : "bg-gray-800 bg-opacity-60 text-gray-300 hover:bg-gray-700"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading || !benefit.trim() || !persona.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-purple-900">
            {loading ? "✨ Generating your copy..." : "Generate Copy →"}
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
