"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("answers");
    if (!saved) router.push("/onboarding");
    else setAnswers(JSON.parse(saved));
    const savedHistory = localStorage.getItem("contentHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory).slice(0, 5));
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
    social: "text-blue-400",
    email: "text-green-400",
    ads: "text-yellow-400",
    content: "text-pink-400",
    seo: "text-orange-400",
  };

  return (
    <main className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-800 flex flex-col h-screen sticky top-0">
        <div className="px-6 py-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h1 className="font-semibold text-white">AI Marketing Co-Pilot</h1>
          </div>
          <p className="text-gray-500 text-xs ml-4">{answers.productName}</p>
        </div>

        <div className="px-4 py-4 flex-1 overflow-y-auto">
          <p className="text-gray-600 text-xs uppercase tracking-wider mb-3 px-2">Recent History</p>
          {history.length === 0 ? (
            <p className="text-gray-600 text-xs px-2">No history yet</p>
          ) : (
            <div className="space-y-1">
              {history.map((item) => (
                <button key={item.id}
                  onClick={() => router.push("/history")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900 transition-all">
                  <span className={`text-xs font-medium capitalize ${moduleColors[item.module] || "text-purple-400"}`}>{item.module}</span>
                  <p className="text-gray-400 text-xs truncate mt-0.5">{item.result.slice(0, 50)}...</p>
                </button>
              ))}
              <button onClick={() => router.push("/history")}
                className="w-full text-left px-3 py-2 text-xs text-purple-400 hover:text-purple-300">
                View all history →
              </button>
            </div>
          )}
        </div>

        <div className="px-4 py-4 border-t border-gray-800 space-y-1">
          <button onClick={() => router.push("/history")}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900 text-gray-400 text-sm flex items-center gap-2">
            📚 History
          </button>
          <button onClick={() => { localStorage.clear(); router.push("/onboarding"); }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900 text-gray-400 text-sm flex items-center gap-2">
            🔄 Start Over
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-10 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Your Marketing Modules</h2>
        <p className="text-gray-400 mb-8">Select a module to start creating content for <span className="text-purple-400">{answers.productName}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button key={mod.title}
              onClick={() => router.push(mod.href)}
              className="text-left bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer">
              <div className="text-3xl mb-4">{mod.icon}</div>
              <h3 className="font-semibold text-white mb-2">{mod.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{mod.description}</p>
              <span className="mt-3 inline-block text-xs text-purple-400">→ Open</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}