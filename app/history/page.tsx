"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type HistoryItem = {
  id: string;
  module: string;
  inputs: Record<string, string>;
  result: string;
  createdAt: string;
};

export default function History() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("contentHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const modules = ["all", "social", "email", "ads", "content", "seo"];

  const filtered = filter === "all" ? history : history.filter((h) => h.module === filter);

  function deleteItem(id: string) {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("contentHistory", JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-white text-sm">← Dashboard</button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Content History</h1>
        <p className="text-gray-400 mb-8">All your past generated content</p>

        <div className="flex gap-3 mb-6 flex-wrap">
          {modules.map((m) => (
            <button key={m} onClick={() => setFilter(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === m ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
              {m}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-10 text-center">
            <p className="text-gray-500 text-lg">No history yet!</p>
            <p className="text-gray-600 text-sm mt-2">Generate some content and it will appear here.</p>
            <button onClick={() => router.push("/dashboard")}
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-sm">
              Go to Dashboard →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              {filtered.map((item) => (
                <button key={item.id} onClick={() => setSelected(item)}
                  className={`w-full text-left bg-gray-900 rounded-xl p-4 border transition-all ${selected?.id === item.id ? "border-purple-500" : "border-gray-800 hover:border-gray-600"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full capitalize">{item.module}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="text-gray-600 hover:text-red-400 text-xs">Delete</button>
                  </div>
                  <p className="text-white text-sm font-medium truncate">{item.result.slice(0, 60)}...</p>
                  <p className="text-gray-600 text-xs mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <div className="bg-gray-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full capitalize">{selected.module}</span>
                    <span className="text-gray-500 text-xs">{new Date(selected.createdAt).toLocaleString()}</span>
                  </div>
                  {renderContent(selected.result)}
                </div>
              ) : (
                <div className="bg-gray-900 rounded-2xl p-10 text-center">
                  <p className="text-gray-500">Select an item to view</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}