"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Ads() {
  const router = useRouter();
  const [campaignGoal, setCampaignGoal] = useState("conversions");
  const [targetAudience, setTargetAudience] = useState("");
  const [budget, setBudget] = useState("$500-$1000/month");
  const [feature, setFeature] = useState("");
  const [destinationURL, setDestinationURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleGenerate() {
    setLoading(true);
    const brandStrategy = localStorage.getItem("brandStrategy") || "";
    const answers = JSON.parse(localStorage.getItem("answers") || "{}");

    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignGoal, targetAudience, budget, feature, destinationURL, brandStrategy, answers }),
    });
    const data = await res.json();
    setResult(data.result);
    const historyItem = {
  id: Date.now().toString(),
  module: "ads",
  inputs: { campaignGoal, targetAudience, feature },
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
        <h1 className="text-3xl font-bold mb-2">Ad Campaign Generator</h1>
        <p className="text-gray-400 mb-8">Generate Google RSA + Meta ad copy with A/B variants</p>

        <div className="space-y-6 bg-gray-900 rounded-2xl p-6 mb-6">
          <div>
            <label className="text-sm text-purple-400 mb-2 block">Campaign Goal</label>
            <div className="flex gap-3 flex-wrap">
              {["conversions", "awareness", "traffic", "leads"].map((g) => (
                <button key={g} onClick={() => setCampaignGoal(g)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${campaignGoal === g ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Target Audience</label>
            <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. SaaS founders, marketing managers aged 25-45"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Budget Range</label>
            <div className="flex gap-3 flex-wrap">
              {["$500-$1000/month", "$1000-$5000/month", "$5000+/month"].map((b) => (
                <button key={b} onClick={() => setBudget(b)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${budget === b ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Feature to Promote</label>
            <input type="text" value={feature} onChange={(e) => setFeature(e.target.value)}
              placeholder="e.g. AI content generation, 7-day post calendar"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Destination URL (optional)</label>
            <input type="text" value={destinationURL} onChange={(e) => setDestinationURL(e.target.value)}
              placeholder="e.g. https://yoursite.com/landing"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <button onClick={handleGenerate} disabled={loading || !targetAudience.trim() || !feature.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-8 py-4 rounded-xl">
            {loading ? "Generating your ad campaigns..." : "Generate Ad Campaigns →"}
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