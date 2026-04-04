"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

type HistoryItem = { id: string; module: string; result: string; createdAt: string; };

const modules = [
  {
    title: "Social Media Manager",
    description: "7-day post calendar for LinkedIn, Twitter & Instagram",
    icon: "📱", href: "/social",
    glow: "#3b82f6", accent: "#60a5fa",
    grad: "linear-gradient(135deg, #1e3a5f, #1e40af)",
    tag: "7-DAY CALENDAR",
  },
  {
    title: "Content & Copywriting",
    description: "Landing pages, hero copy, feature copy & more",
    icon: "✍️", href: "/content",
    glow: "#ec4899", accent: "#f472b6",
    grad: "linear-gradient(135deg, #4a1942, #be185d)",
    tag: "COPY ENGINE",
  },
  {
    title: "Email Marketing",
    description: "Onboarding sequences, newsletters & cold outreach",
    icon: "📧", href: "/email-marketing",
    glow: "#10b981", accent: "#34d399",
    grad: "linear-gradient(135deg, #064e3b, #065f46)",
    tag: "EMAIL SEQUENCES",
  },
  {
    title: "Ad Campaign Generator",
    description: "Google RSA + Meta ad copy with A/B variants",
    icon: "🎯", href: "/ads",
    glow: "#f59e0b", accent: "#fbbf24",
    grad: "linear-gradient(135deg, #451a03, #92400e)",
    tag: "GOOGLE + META",
  },
  {
    title: "SEO & Blog Strategy",
    description: "Keyword clusters, blog calendars & full article drafts",
    icon: "🔍", href: "/seo",
    glow: "#f97316", accent: "#fb923c",
    grad: "linear-gradient(135deg, #431407, #9a3412)",
    tag: "SEO POWER",
  },
  {
    title: "Brand Strategy Engine",
    description: "Your brand positioning, voice guide & ICP personas",
    icon: "🧠", href: "/brand-strategy",
    glow: "#a855f7", accent: "#c084fc",
    grad: "linear-gradient(135deg, #3b0764, #6d28d9)",
    tag: "BRAND DNA",
  },
  {
    title: "AI Poster Maker",
    description: "Generate & design stunning posters with AI + drag & drop editor",
    icon: "🖼️", href: "/poster",
    glow: "#f43f5e", accent: "#fb7185",
    grad: "linear-gradient(135deg, #4c0519, #9f1239)",
    tag: "POSTER AI",
  },
  {
    title: "Content Planner",
    description: "Visual calendar to plan, schedule & track all posts",
    icon: "🗓️", href: "/planner",
    glow: "#14b8a6", accent: "#2dd4bf",
    grad: "linear-gradient(135deg, #042f2e, #0f766e)",
    tag: "SCHEDULE",
  },
  {
    title: "Website Builder",
    description: "Generate a complete branded website in seconds",
    icon: "🌐", href: "/website-builder",
    glow: "#06b6d4", accent: "#22d3ee",
    grad: "linear-gradient(135deg, #0c4a6e, #0369a1)",
    tag: "FULL WEBSITE",
  },
  {
    title: "Brand Profile",
    description: "View and edit your brand data & strategy",
    icon: "⚡", href: "/brand-profile",
    glow: "#8b5cf6", accent: "#a78bfa",
    grad: "linear-gradient(135deg, #2e1065, #4c1d95)",
    tag: "BRAND HQ",
  },
  {
    title: "Content Calendar",
    description: "View all your generated content history",
    icon: "📅", href: "/content-calendar",
    glow: "#6366f1", accent: "#818cf8",
    grad: "linear-gradient(135deg, #1e1b4b, #3730a3)",
    tag: "HISTORY",
  },
  {
    title: "Meta Auto-Poster",
    description: "Schedule & auto-post directly to Instagram & Facebook",
    icon: "🔗", href: "#",
    glow: "#f97316", accent: "#fb923c",
    grad: "linear-gradient(135deg, #431407, #9a3412)",
    tag: "COMING SOON",
  },
];

const moduleColors: Record<string, string> = {
  social: "bg-blue-900 text-blue-300",
  email: "bg-green-900 text-green-300",
  ads: "bg-yellow-900 text-yellow-300",
  content: "bg-pink-900 text-pink-300",
  seo: "bg-orange-900 text-orange-300",
  poster: "bg-rose-900 text-rose-300",
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
  const [mounted, setMounted] = useState(false);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    if (!isLoaded || !user) return;
    async function loadData() {
      await user!.reload();
      const meta = user!.publicMetadata as { onboardingComplete?: boolean; answers?: Record<string, string> };
      const localAnswers = localStorage.getItem("answers");
      const hasLocalData = localAnswers && JSON.parse(localAnswers).productName;
      if (!meta?.onboardingComplete && !hasLocalData) { router.push("/onboarding"); return; }
      if (meta?.answers) { setAnswers(meta.answers); localStorage.setItem("answers", JSON.stringify(meta.answers)); }
      else if (localAnswers) setAnswers(JSON.parse(localAnswers));
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
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      color: ["147,51,234","236,72,153","59,130,246","16,185,129"][Math.floor(Math.random() * 4)],
      pulse: Math.random() * Math.PI * 2,
    }));
    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p: any) => {
        p.x += p.speedX; p.y += p.speedY; p.pulse += 0.015;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const op = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, `rgba(${p.color},${op})`);
        g.addColorStop(1, `rgba(${p.color},0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${op})`; ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    }
    animate();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#020008" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" style={{ boxShadow: "0 0 30px rgba(124,58,237,0.5)" }} />
        <div className="text-purple-400 text-sm animate-pulse">Launching your workspace...</div>
      </div>
    </div>
  );

  const greeting = time.getHours() < 12 ? "Good morning" : time.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden" style={{ background: "#020008" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position: "absolute", width: "60%", height: "50%", top: "-5%", left: "-10%", background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)", filter: "blur(60px)", animation: "float1 12s ease-in-out infinite alternate" }} />
        <div style={{ position: "absolute", width: "50%", height: "40%", top: "30%", right: "-5%", background: "radial-gradient(ellipse, rgba(236,72,153,0.08) 0%, transparent 70%)", filter: "blur(60px)", animation: "float2 15s ease-in-out infinite alternate" }} />
      </div>

      <div className="fixed pointer-events-none z-10" style={{ width: 400, height: 400, borderRadius: "50%", left: mousePos.x - 200, top: mousePos.y - 200, background: "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 60%)", transition: "left 0.1s, top 0.1s" }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(2,0,8,0.7)", backdropFilter: "blur(30px)", borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping opacity-40 absolute" />
            <div className="w-3 h-3 bg-purple-500 rounded-full relative" style={{ boxShadow: "0 0 10px #7c3aed" }} />
          </div>
          <span className="font-black text-white text-lg tracking-tight">AI Marketing Co-Pilot</span>
          <span className="hidden md:block text-xs px-3 py-1 rounded-full font-bold" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
            {answers.productName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-mono font-bold">{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <button onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: "rgba(26,5,51,0.8)", border: "1px solid rgba(124,58,237,0.2)", color: "#c084fc" }}>
            📚 History {history.length > 0 && <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>}
          </button>
          <button onClick={() => router.push("/chat")}
            className="text-sm px-4 py-2 rounded-xl font-bold transition-all hover:scale-105"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "#c084fc" }}>
            💬 AI Chat
          </button>
          <button onClick={() => signOut(() => router.push("/sign-in"))}
            className="text-sm px-3 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-16">

        {/* GREETING */}
        <div className={`mb-12 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full mb-6 font-bold uppercase tracking-widest"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            AI-Powered Marketing Suite • 11 Modules Active
          </div>
          <h1 className="font-black tracking-tighter leading-none mb-3" style={{ fontSize: "clamp(32px, 5vw, 64px)" }}>
            <span className="text-gray-500">{greeting}, </span>
            <span style={{ background: "linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {answers.productName}
            </span>
            <span className="text-white"> 👋</span>
          </h1>
          <p className="text-gray-500 text-lg">Your AI marketing engine is ready. What are we building today?</p>
        </div>

        {/* STATS */}
        <div className={`grid grid-cols-4 gap-4 mb-12 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {[
            { label: "AI Modules", value: "11", icon: "⚡", color: "#a855f7", glow: "rgba(168,85,247,0.3)" },
            { label: "Content Generated", value: history.length.toString(), icon: "📄", color: "#10b981", glow: "rgba(16,185,129,0.3)" },
            { label: "Brand Voice", value: answers.brandVoice?.split(" ")[0] || "Set", icon: "🎨", color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
            { label: "Status", value: "LIVE", icon: "🚀", color: "#ec4899", glow: "rgba(236,72,153,0.3)" },
          ].map((stat, i) => (
            <div key={stat.label}
              className={`rounded-2xl p-5 text-center cursor-default transition-all duration-500 hover:scale-105 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.glow}`, boxShadow: `0 0 30px ${stat.glow}`, transitionDelay: `${i * 100}ms` }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 60px ${stat.glow}`}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${stat.glow}`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-gray-600 text-xs mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* MODULE GRID */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-gray-600 font-bold">Your Marketing Arsenal</h2>
          <span className="text-xs text-gray-700">11 modules • Click to launch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, i) => {
            const isComingSoon = mod.tag === "COMING SOON";
            return (
              <button key={mod.title}
                onClick={() => !isComingSoon && router.push(mod.href)}
                onMouseEnter={() => setHoveredModule(mod.title)}
                onMouseLeave={() => setHoveredModule(null)}
                className={`text-left rounded-2xl p-6 relative overflow-hidden group transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${isComingSoon ? "cursor-not-allowed" : "cursor-pointer"}`}
                style={{
                  background: isComingSoon
                    ? "rgba(255,255,255,0.01)"
                    : hoveredModule === mod.title ? mod.grad : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isComingSoon ? "rgba(255,255,255,0.04)" : hoveredModule === mod.title ? mod.glow + "60" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: hoveredModule === mod.title && !isComingSoon ? `0 0 60px ${mod.glow}30, 0 20px 40px rgba(0,0,0,0.4)` : "none",
                  transform: hoveredModule === mod.title && !isComingSoon ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
                  transitionDelay: `${i * 30}ms`,
                  opacity: isComingSoon ? 0.5 : 1,
                }}>

                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle, ${mod.glow}30 0%, transparent 70%)` }} />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest"
                    style={{ background: `${mod.glow}20`, color: mod.accent, border: `1px solid ${mod.glow}30` }}>
                    {mod.tag}
                  </span>
                  {!isComingSoon && <span className="text-gray-700 group-hover:text-gray-400 transition-colors text-xs">→</span>}
                </div>

                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block"
                  style={{ filter: hoveredModule === mod.title && !isComingSoon ? `drop-shadow(0 0 12px ${mod.glow})` : "none" }}>
                  {mod.icon}
                </div>

                <h3 className="font-black text-white text-base mb-1.5">{mod.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-400 transition-colors">{mod.description}</p>

                {!isComingSoon && (
                  <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className="text-xs font-bold" style={{ color: mod.accent }}>Launch Module</span>
                    <span style={{ color: mod.accent }}>→</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* BOTTOM BANNER */}
        <div className="mt-12 rounded-3xl p-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.06))", border: "1px solid rgba(124,58,237,0.15)" }}>
          <div className="absolute inset-0 rounded-3xl" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white font-black text-xl mb-1">Ready to launch? 🚀</p>
              <p className="text-gray-500 text-sm">Add Stripe payments and start making money today</p>
            </div>
            <button className="text-white font-black px-8 py-3 rounded-2xl transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}>
              💳 Add Payments →
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-70 z-40" onClick={() => { setSidebarOpen(false); setSelected(null); }} />}
      <div className={`fixed top-0 right-0 h-full w-96 z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "rgba(5,0,15,0.98)", backdropFilter: "blur(30px)", borderLeft: "1px solid rgba(124,58,237,0.15)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
          <h2 className="font-black text-white">📚 Content History</h2>
          <button onClick={() => { setSidebarOpen(false); setSelected(null); }} className="text-gray-600 hover:text-white text-xl transition-colors">✕</button>
        </div>
        {selected ? (
          <div className="flex flex-col h-full">
            <div className="px-6 py-3 border-b" style={{ borderColor: "rgba(124,58,237,0.08)" }}>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-sm transition-colors">← Back</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <span className={`text-xs px-2 py-1 rounded-full capitalize mb-4 inline-block ${moduleColors[selected.module] || "bg-purple-900 text-purple-300"}`}>{selected.module}</span>
              <p className="text-gray-600 text-xs mb-4">{new Date(selected.createdAt).toLocaleString()}</p>
              {renderContent(selected.result)}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500 text-sm">No history yet</p>
                <p className="text-gray-700 text-xs mt-2">Generate content and it appears here</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(124,58,237,0.08)" }}>
                {history.map((item) => (
                  <button key={item.id} onClick={() => setSelected(item)}
                    className="w-full text-left px-6 py-4 transition-all hover:bg-purple-900 hover:bg-opacity-15">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${moduleColors[item.module] || "bg-purple-900 text-purple-300"}`}>{item.module}</span>
                      <span className="text-gray-700 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">{item.result.slice(0, 80)}...</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float1 { from { transform: translateY(0) translateX(0); } to { transform: translateY(30px) translateX(20px); } }
        @keyframes float2 { from { transform: translateY(0) translateX(0); } to { transform: translateY(-20px) translateX(-30px); } }
      `}</style>
    </main>
  );
}