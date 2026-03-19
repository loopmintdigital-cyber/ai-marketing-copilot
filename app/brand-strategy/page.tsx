"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BrandStrategy() {
  const router = useRouter();
  const [brandStrategy, setBrandStrategy] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("brandStrategy");
    const savedAnswers = localStorage.getItem("answers");
    if (!saved) router.push("/onboarding");
    else {
      setBrandStrategy(saved);
      setAnswers(JSON.parse(savedAnswers || "{}"));
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-white text-sm">← Back to Dashboard</button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Brand Strategy Engine</h1>
        <p className="text-gray-400 mb-8">Your brand positioning, voice guide & ICP personas for <span className="text-purple-400">{answers.productName}</span></p>

        <div className="bg-gray-900 rounded-2xl p-6 space-y-2">
          {brandStrategy.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-white mt-4">{line.replace('# ', '')}</h2>;
            if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-purple-400 mt-3">{line.replace('## ', '')}</h3>;
            if (line.startsWith('### ')) return <h4 key={i} className="text-base font-semibold text-purple-300 mt-2">{line.replace('### ', '')}</h4>;
            if (line.startsWith('---')) return <hr key={i} className="border-gray-700 my-4" />;
            if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-purple-500 pl-4 text-purple-200 italic my-2">{line.replace('> ', '')}</blockquote>;
            if (line.trim() === '') return <div key={i} className="h-1" />;
            return <p key={i} className="text-gray-300 text-sm">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => { localStorage.clear(); router.push("/onboarding"); }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl text-sm">
            Redo Brand Strategy
          </button>
        </div>
      </div>
    </main>
  );
}