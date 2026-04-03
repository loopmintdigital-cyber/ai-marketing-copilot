"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

type HistoryItem = {
  id: string;
  module: string;
  result: string;
  createdAt: string;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

export default function Dashboard() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [checking, setChecking] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadData() {
      await user!.reload();
      const meta = user!.publicMetadata as { onboardingComplete?: boolean; answers?: Record<string, string> };
      const localAnswers = localStorage.getItem("answers");
      const hasLocalData = localAnswers && JSON.parse(localAnswers).productName;

      if (!meta?.onboardingComplete && !hasLocalData) {
        router.push("/onboarding");
        return;
      }

      if (meta?.answers) {
        setAnswers(meta.answers);
        localStorage.setItem("answers", JSON.stringify(meta.answers));
      } else if (localAnswers) {
        setAnswers(JSON.parse(localAnswers));
      }

      const savedHistory = localStorage.getItem("contentHistory");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      setChecking(false);
    }

    loadData();
  }, [isLoaded, user]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let animationId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 51, 234, ${p.opacity})`;
        ctx.fill();
        particles.forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.05 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animationId = requestAnimationFrame(animate);
    }

    animate();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", handleResize); };
  }, []);

  const modules = [
    { title: "Social Media Manager", description: "7-day post calendar for LinkedIn, Twitter & Instagram", icon: "📱", href: "/social", color: "from-blue-900 to-blue-950", border: "hover:border-blue-500", tag: "bg-blue-900 text-blue-300" },
    { title: "Content & Copywriting", description: "Landing pages, hero copy, feature copy & more", icon: "✍️", href: "/content", color: "from-pink-900 to-pink-950", border: "hover:border-pink-500", tag: "bg-pink-900 text-pink-300" },
    { title: "Email Marketing", description: "Onboarding sequences, newsletters & cold outreach", icon: "📧", href: "/email-marketing", color: "from-green-900 to-green-950", border: "hover:border-green-500", tag: "bg-green-900 text-green-300" },
    { title: "Ad Campaign Generator", description: "Google RSA + Meta ad copy with A/B variants", icon: "🎯", href: "/ads", color: "from-yellow-900 to-yellow-950", border: "hover:border-yellow-500", tag: "bg-yellow-900 text-yellow-300" },
    { title: "SEO & Blog Strategy", description: "Keyword clusters, blog calendars & full article drafts", icon: "🔍", href: "/seo", color: "from-orange-900 to-orange-950", border: "hover:border-orange-500", tag: "bg-orange-900 text-orange-300" },
    { title: "Brand Strategy Engine", description: "Your brand positioning, voice guide & ICP personas", icon: "🧠", href: "/brand-strategy", color: "from-purple-900 to-purple-950", border: "hover:border-purple-400", tag: "bg-purple-900 text-purple-300" },
    { title: "Brand Profile", description: "View and edit your brand data & strategy", icon: "🧠", href: "/brand-profile", color: "from-violet-900 to-violet-950", border: "hover:border-violet-500", tag: "bg-violet-900 text-violet-300" },
    { title: "Content Calendar", description: "View all your generated content history", icon: "📅", href: "/content-calendar", color: "from-indigo-900 to-indigo-950", border: "hover:border-indigo-500", tag: "bg-indigo-900 text-indigo-300" },
    { title: "Website Builder", description: "Generate a complete branded website in seconds", icon: "🌐", href: "/website-builder", color: "from-cyan-900 to-cyan-950", border: "hover:border-cyan-500", tag: "bg-cyan-900 text-cyan-300" },
    // ✅ NEW — Poster Maker
    { title: "AI Poster Maker", description: "Generate stunning social media posters with captions, hashtags & keywords", icon: "🖼️", href: "/poster", color: "from-rose-900 to-rose-950", border: "hover:border-rose-500", tag: "bg-rose-900 text-rose-300" },
  ];

  const moduleColors: Record<string, string> = {
    social: "bg-blue-900 text-blue-300",
    email: "bg-green-900 text-green-300",
    ads: "bg-yellow-900 text-yellow-300",
    content: "bg-pink-900 text-pink-300",
    seo: "bg-orange-900 text-orange-300",
    poster: "bg-rose-900 text-rose-300",
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

  if (!isLoaded || checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <div className="text-purple-400 text-sm">Loading your workspace...</div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen text-white relative" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="border-b border-purple-900 border-opacity-40 px-6 py-4 flex items-center justify-between sticky top-0 z-30" style={{ background: "rgba(10, 5, 20, 0.85)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-lg shadow-purple-500"></div>
          <h1 className="font-bold text-white text-lg">AI Marketing Co-Pilot</h1>
          <span className="text-gray-500 text-sm hidden md:block">—</span>
          <span className="text-purple-400 text-sm font-medium hidden md:block">{answers.productName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-sm border border-gray-700 hover:border-purple-500 px-4 py-2 rounded-lg transition-all"
            style={{ background: "rgba(26, 5, 51, 0.6)" }}>
            📚 History
            {history.length > 0 && <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>}
          </button>
          <button onClick={() => router.push("/chat")}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all font-bold"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "#c084fc" }}>
            💬 AI Chat
          </button>
          <button onClick={() => signOut(() => router.push("/sign-in"))}
            className="text-red-400 hover:text-red-300 text-sm border border-red-900 hover:border-red-600 px-3 py-1.5 rounded-lg transition-all">
            Sign Out
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-900 bg-opacity-40 border border-purple-700 border-opacity-40 rounded-full px-4 py-1.5 text-purple-300 text-xs mb-4">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
            AI-Powered Marketing Suite
          </div>
          <h2 className="text-4xl font-bold mb-3">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{answers.productName}</span> 👋
          </h2>
          <p className="text-gray-400 text-lg">Pick a module and let AI do the heavy lifting for your marketing.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Modules Available", value: "10", icon: "⚡" },
            { label: "Content Generated", value: history.length.toString(), icon: "📄" },
            { label: "Brand Voice", value: answers.brandVoice || "Set", icon: "🎨" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4 border border-purple-900 border-opacity-30 text-center" style={{ background: "rgba(26, 5, 51, 0.4)", backdropFilter: "blur(10px)" }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-4 font-medium">Your Marketing Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button key={mod.title} onClick={() => router.push(mod.href)}
              className={`text-left rounded-2xl p-6 border border-gray-800 ${mod.border} transition-all cursor-pointer group relative overflow-hidden`}
              style={{ background: "rgba(26, 5, 51, 0.5)", backdropFilter: "blur(10px)" }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="text-3xl mb-4">{mod.icon}</div>
                <h3 className="font-semibold text-white mb-2 text-base">{mod.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{mod.description}</p>
                <span className={`text-xs px-2.5 py-1 rounded-full ${mod.tag}`}>→ Open</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={() => { setSidebarOpen(false); setSelected(null); }} />}

      <div className={`fixed top-0 right-0 h-full w-96 border-l border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "rgba(10, 5, 25, 0.97)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Content History</h2>
          <button onClick={() => { setSidebarOpen(false); setSelected(null); }} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        {selected ? (
          <div className="flex flex-col h-full">
            <div className="px-6 py-3 border-b border-gray-800">
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-sm">← Back</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <span className={`text-xs px-2 py-1 rounded-full capitalize mb-4 inline-block ${moduleColors[selected.module] || "bg-purple-900 text-purple-300"}`}>{selected.module}</span>
              <p className="text-gray-500 text-xs mb-4">{new Date(selected.createdAt).toLocaleString()}</p>
              {renderContent(selected.result)}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500">No history yet</p>
                <p className="text-gray-600 text-sm mt-2">Generate content and it will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {history.map((item) => (
                  <button key={item.id} onClick={() => setSelected(item)}
                    className="w-full text-left px-6 py-4 hover:bg-purple-900 hover:bg-opacity-20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${moduleColors[item.module] || "bg-purple-900 text-purple-300"}`}>{item.module}</span>
                      <span className="text-gray-600 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm truncate">{item.result.slice(0, 80)}...</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
