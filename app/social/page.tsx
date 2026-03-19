"use client";
import { useState } from "react";

export default function Social() {
  const [platform, setPlatform] = useState("LinkedIn");
  const [goal, setGoal] = useState("awareness");
  const [productNews, setProductNews] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleGenerate() {
    setLoading(true);
    const brandStrategy = localStorage.getItem("brandStrategy") || "";
    const answers = JSON.parse(localStorage.getItem("answers") || "{}");

    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, goal, productNews, brandStrategy, answers }),
    });
    const data = await res.json();
    setResult(data.result);
    const historyItem = {
  id: Date.now().toString(),
  module: "social",
  inputs: { platform, goal, productNews },
  result: data.result,
  createdAt: new Date().toISOString(),
};
const existing = JSON.parse(localStorage.getItem("contentHistory") || "[]");
localStorage.setItem("contentHistory", JSON.stringify([historyItem, ...existing]));
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Social Media Manager</h1>
        <p className="text-gray-400 mb-8">Generate a 7-day post calendar for your brand</p>

        <div className="space-y-6 bg-gray-900 rounded-2xl p-6 mb-6">
          <div>
            <label className="text-sm text-purple-400 mb-2 block">Platform</label>
            <div className="flex gap-3">
              {["LinkedIn", "Twitter/X", "Instagram"].map((p) => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${platform === p ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Goal</label>
            <div className="flex gap-3">
              {["awareness", "engagement", "conversion"].map((g) => (
                <button key={g} onClick={() => setGoal(g)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${goal === g ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Recent product news (optional)</label>
            <input type="text" value={productNews} onChange={(e) => setProductNews(e.target.value)}
              placeholder="e.g. We just launched a new feature..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-8 py-4 rounded-xl">
            {loading ? "Generating your 7-day calendar..." : "Generate 7-Day Post Calendar →"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 rounded-2xl p-6 space-y-2">
            {result.split('\n').map((line, i) => {
              if (line.startsWith('---')) return <hr key={i} className="border-gray-700 my-4" />;
              if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-white mt-4">{line.replace('# ', '')}</h2>;
              if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-purple-400 mt-3">{line.replace('## ', '')}</h3>;
              if (line.trim() === '') return <div key={i} className="h-1" />;
              return <p key={i} className="text-gray-300 text-sm">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
            })}
          </div>
        )}
      </div>
    </main>
  );
}