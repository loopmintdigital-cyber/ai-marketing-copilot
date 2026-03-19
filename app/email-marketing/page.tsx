"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Email() {
  const router = useRouter();
  const [sequenceType, setSequenceType] = useState("onboarding");
  const [persona, setPersona] = useState("");
  const [feature, setFeature] = useState("");
  const [sequenceLength, setSequenceLength] = useState("3");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleGenerate() {
    setLoading(true);
    const brandStrategy = localStorage.getItem("brandStrategy") || "";
    const answers = JSON.parse(localStorage.getItem("answers") || "{}");

    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequenceType, persona, feature, sequenceLength, tone, brandStrategy, answers }),
    });
    const data = await res.json();
    setResult(data.result);
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
        <h1 className="text-3xl font-bold mb-2">Email Marketing</h1>
        <p className="text-gray-400 mb-8">Generate email sequences for onboarding, nurture & cold outreach</p>

        <div className="space-y-6 bg-gray-900 rounded-2xl p-6 mb-6">
          <div>
            <label className="text-sm text-purple-400 mb-2 block">Sequence Type</label>
            <div className="flex gap-3 flex-wrap">
              {["onboarding", "nurture", "cold outreach", "product update"].map((t) => (
                <button key={t} onClick={() => setSequenceType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${sequenceType === t ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Target Persona</label>
            <input type="text" value={persona} onChange={(e) => setPersona(e.target.value)}
              placeholder="e.g. SaaS founders, new signups, trial users"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Feature to Highlight</label>
            <input type="text" value={feature} onChange={(e) => setFeature(e.target.value)}
              placeholder="e.g. AI content generation, social scheduling"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Number of Emails</label>
            <div className="flex gap-3">
              {["3", "5", "7"].map((n) => (
                <button key={n} onClick={() => setSequenceLength(n)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${sequenceLength === n ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                  {n} emails
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-purple-400 mb-2 block">Tone Override (optional)</label>
            <input type="text" value={tone} onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. More casual, very formal, witty"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          </div>

          <button onClick={handleGenerate} disabled={loading || !persona.trim() || !feature.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-8 py-4 rounded-xl">
            {loading ? "Generating your email sequence..." : "Generate Email Sequence →"}
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