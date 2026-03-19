"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type HistoryItem = {
  id: string;
  module: string;
  result: string;
  createdAt: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("answers");
    if (!saved) router.push("/onboarding");
    else setAnswers(JSON.parse(saved));
    const savedHistory = localStorage.getItem("contentHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const modules = [
    { title: "Social Media Manager", description: "7-day post calendar for LinkedIn, Twitter & Instagram", icon: "📱", href: "/social" },
    { title: "Content & Copywriting", description: "Landing pages, hero copy, feature copy & more", icon: "✍️", href: "/content" },
    { title: "Email Marketing", description: "Onboarding sequences, newsletters & cold outreach", icon: "📧", href: "/email-marketing" },
    { title: "Ad Campaign Generator", description: "Google RSA + Meta ad copy with A/B variants", icon: "🎯", href: "/ads" },
    { title: "SEO & Blog Strategy", description: "Keyword clusters, blog calendars & full article drafts", icon: "🔍", href: "/seo" },
    { title: "Brand Strategy Engine", description: "Your brand positioning, voice guide & ICP personas", icon: "🧠", href: "/brand-strategy" },
  ];

  const moduleColors: Record<string, string> = {
    social: "bg-blue-900 text-blue-300",
    email: "bg-green-900 text-green-300",
    ads: "bg-yellow-900 text-yellow-300",
    content: "bg-pink-900 text-pink-300",
    seo: "bg-orange-900 text-orange-300",
  };

  function renderContent(content: string) {
    return (
      <div className="space-y-1">
        {content.split('\n').slice(0, 20).map((line, i) => {
          if (line.startsWith('# ')) return <h2 key={i} className="text-base font-bold text-white mt-2">{line.replace('# ', '')}</h2>;
          if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-purple-400 mt-2">{line.replace('## ', '')}</h3>;
          if (line.startsWith('---')) return <hr key={i} className="border-gray-700 my-2" />;
          if (line.trim() === '') return <div key={i} className="h-1" />;
          return <p key={i} className="text-gray-300 text-xs">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
        })}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <h1 className="font-semibold text-white">AI Marketing Co-Pilot</h1>
          <span className="text-gray-500 text-sm">— {answers.productName}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-sm bg-gray-900 hover:bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg transition-all">
            📚 History
            {history.length > 0 && (
              <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
            )}
          </button>
          <button onClick={() => { localStorage.clear(); router.push("/onboarding"); }}
            className="text-gray-500 hover:text-gray-300 text-sm">
            Start Over
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Your Marketing Modules</h2>
        <p className="text-gray-400 mb-8">Select a module to start creating content for <span className="text-purple-400">{answers.productName}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button key={mod.title} onClick={() => router.push(mod.href)}
              className="text-left bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer group">
              <div className="text-3xl mb-4">{mod.icon}</div>
              <h3 className="font-semibold text-white mb-2">{mod.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{mod.description}</p>
              <span className="mt-3 inline-block text-xs text-purple-400 group-hover:text-purple-300">→ Open</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
          onClick={() => { setSidebarOpen(false); setSelected(null); }} />
      )}

      {/* Sliding Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-gray-950 border-l border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Content History</h2>
          <button onClick={() => { setSidebarOpen(false); setSelected(null); }}
            className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        {selected ? (
          <div className="flex flex-col h-full">
            <div className="px-6 py-3 border-b border-gray-800">
              <button onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-white text-sm">← Back</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <span className={`text-xs px-2 py-1 rounded-full capitalize mb-4 inline-block ${moduleColors[selected.module] || "bg-purple-900 text-purple-300"}`}>
                {selected.module}
              </span>
              <p className="text-gray-500 text-xs mb-4">{new Date(selected.createdAt).toLocaleString()}</p>
              {renderContent(selected.result)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No history yet</p>
                  <p className="text-gray-600 text-sm mt-2">Generate content and it will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {history.map((item) => (
                    <button key={item.id} onClick={() => setSelected(item)}
                      className="w-full text-left px-6 py-4 hover:bg-gray-900 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${moduleColors[item.module] || "bg-purple-900 text-purple-300"}`}>
                          {item.module}
                        </span>
                        <span className="text-gray-600 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm truncate">{item.result.slice(0, 80)}...</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}