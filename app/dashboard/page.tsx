"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("answers");
    if (!saved) router.push("/onboarding");
    else setAnswers(JSON.parse(saved));
  }, []);

  const modules = [
    { title: "Social Media Manager", description: "Generate a 7-day post calendar for LinkedIn, Twitter & Instagram", icon: "📱", href: "/social", ready: true },
    { title: "Content & Copywriting", description: "Landing pages, hero copy, feature copy & more", icon: "✍️", href: "/content", ready: false },
    { title: "Email Marketing", description: "Onboarding sequences, newsletters & cold outreach", icon: "📧", href: "/email", ready:  true},
    { title: "Ad Campaign Generator", description: "Google RSA + Meta ad copy with A/B variants", icon: "🎯", href: "/ads", ready: false },
    { title: "SEO & Blog Strategy", description: "Keyword clusters, blog calendars & full article drafts", icon: "🔍", href: "/seo", ready: false },
{ title: "Brand Strategy Engine", description: "Your brand positioning, voice guide & ICP personas", icon: "🧠", href: "/brand-strategy", ready: true },  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="border-b border-gray-800 pb-6 mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h1 className="font-semibold text-white text-lg">AI Marketing Co-Pilot</h1>
            </div>
            <p className="text-gray-500 text-sm">Welcome back, {answers.productName} 👋</p>
          </div>
          <button onClick={() => { localStorage.clear(); router.push("/onboarding"); }}
            className="text-gray-500 hover:text-gray-300 text-sm">
            Start Over
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-2">Your Marketing Modules</h2>
        <p className="text-gray-400 mb-8">Select a module to start creating content for {answers.productName}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button key={mod.title}
              onClick={() => mod.ready && router.push(mod.href)}
              className={`text-left bg-gray-900 rounded-2xl p-6 border transition-all ${
                mod.ready
                  ? "border-gray-700 hover:border-purple-500 cursor-pointer"
                  : "border-gray-800 opacity-50 cursor-not-allowed"
              }`}>
              <div className="text-3xl mb-4">{mod.icon}</div>
              <h3 className="font-semibold text-white mb-2">{mod.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{mod.description}</p>
              {!mod.ready && <span className="mt-3 inline-block text-xs text-gray-600">Coming soon</span>}
              {mod.ready && <span className="mt-3 inline-block text-xs text-purple-400">→ Open</span>}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}