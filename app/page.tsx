"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["Brand Strategy.", "Social Content.", "Email Sequences.", "Ad Campaigns.", "SEO Articles.", "Landing Pages."];
const TICKER_ITEMS = ["🧠 Brand Strategy", "📱 Social Media", "📧 Email Marketing", "🎯 Ad Campaigns", "🔍 SEO Strategy", "✍️ Copywriting", "🖼️ AI Poster Maker", "🗓️ Content Planner", "🌐 Website Builder", "⚡ 10x Faster", "💰 Save $10K/month", "🚀 Ship in Minutes"];

const LIVE_OUTPUTS = [
  { module: "📱 Social Media", content: "LinkedIn Post — Day 1\n\"Most founders waste $10K/month on agencies that take 2 weeks to write a blog post. We built AI that does it in 10 seconds. Here's how →\"", color: "#a855f7" },
  { module: "📧 Email Subject Lines", content: "Subject: You're leaving $10K on the table\nSubject: Your competitors aren't waiting\nSubject: 10 seconds to your entire marketing strategy", color: "#a855f7" },
  { module: "🎯 Google Ad Copy", content: "Headline 1: AI Marketing in 10 Seconds\nHeadline 2: Replace Your $10K Agency\nDescription: Full brand strategy, social posts, ads & SEO — all trained on YOUR product.", color: "#a855f7" },
  { module: "🧠 Brand Tagline", content: "\"Ship Marketing. Not Excuses.\"\n\"Your Agency Is Sleeping. Your AI Isn't.\"\n\"From Brief to Campaign in 10 Seconds.\"", color: "#a855f7" },
];

function useCounter(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [start, target, duration]);
  return count;
}

export default function Home() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [liveCount, setLiveCount] = useState(2847);
  const [outputIndex, setOutputIndex] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [outputCharIndex, setOutputCharIndex] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const savedCount = useCounter(9951, 2000, statsVisible);
  const speedCount = useCounter(10, 1500, statsVisible);
  const foundersCount = useCounter(2858, 2500, statsVisible);

  const features = [
    { icon: "🧠", title: "Brand Strategy", desc: "Full positioning & voice guide in 10 seconds." },
    { icon: "📱", title: "Social Media", desc: "7-day calendars for every platform." },
    { icon: "📧", title: "Email Marketing", desc: "Sequences that actually convert." },
    { icon: "🎯", title: "Ad Campaigns", desc: "Google + Meta copy with A/B variants." },
    { icon: "🔍", title: "SEO Strategy", desc: "Keywords, blogs & full article drafts." },
    { icon: "✍️", title: "Copywriting", desc: "Landing pages trained on your product." },
    { icon: "🖼️", title: "AI Poster Maker", desc: "Generate & design stunning posters with AI." },
    { icon: "🗓️", title: "Content Planner", desc: "Visual calendar to plan & track all posts." },
    { icon: "🌐", title: "Website Builder", desc: "Generate a full branded website in seconds." },
    { icon: "⚡", title: "Brand Profile", desc: "View and edit your brand data & strategy." },
    { icon: "📅", title: "Content Calendar", desc: "View all your generated content history." },
    { icon: "🔗", title: "Meta Auto-Poster", desc: "Auto-post to Instagram & Facebook. Coming soon!" },
  ];

  useEffect(() => {
    setMounted(true);
    const countInterval = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(countInterval);
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const word = WORDS[wordIndex];
    let timeout: NodeJS.Timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 70);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  useEffect(() => {
    const output = LIVE_OUTPUTS[outputIndex];
    const fullText = output.content;
    if (outputCharIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setOutputText(fullText.slice(0, outputCharIndex + 1));
        setOutputCharIndex(i => i + 1);
      }, 25);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setOutputIndex((i) => (i + 1) % LIVE_OUTPUTS.length);
        setOutputText("");
        setOutputCharIndex(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [outputCharIndex, outputIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));
    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p: any) => {
        p.x += p.speedX; p.y += p.speedY; p.pulse += 0.01;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const op = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(109,40,217,${op})`; ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    }
    animate();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <main className="text-white overflow-x-hidden" style={{ background: "#08080c", minHeight: "100vh" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Subtle purple glow — top only */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position: "absolute", width: "80%", height: "40%", top: "-10%", left: "10%", background: "radial-gradient(ellipse, rgba(109,40,217,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between" style={{ background: "rgba(8,8,12,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(109,40,217,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full" style={{ boxShadow: "0 0 8px rgba(109,40,217,0.8)" }} />
          <span className="font-black text-white tracking-tight text-lg">AI Marketing Co-Pilot</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.15)" }}>
            <span className="w-1.5 h-1.5 bg-purple-700 rounded-full animate-pulse" />
            <span className="text-purple-600 font-bold">{liveCount.toLocaleString()}</span>
            <span className="text-gray-600">using now</span>
          </div>
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">Dashboard</button>
          <button onClick={() => router.push("/sign-up")}
            className="text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
            style={{ background: "#6d28d9", boxShadow: "0 0 20px rgba(109,40,217,0.3)" }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center z-10 px-8 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-8 font-medium" style={{ background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.15)", color: "#8b5cf6" }}>
              <span className="w-1.5 h-1.5 bg-purple-700 rounded-full animate-pulse" />
              Replacing $10K/month agencies
            </div>
            <h1 className="font-black leading-none tracking-tighter mb-2 text-white" style={{ fontSize: "clamp(44px, 7vw, 88px)" }}>
              <span className="block">AI That</span>
              <span className="block">Writes Your</span>
            </h1>
            <h1 className="font-black leading-none tracking-tighter mb-8" style={{ fontSize: "clamp(44px, 7vw, 88px)", color: "#6d28d9", minHeight: "1.3em" }}>
              {displayed}<span className="animate-pulse text-purple-500">|</span>
            </h1>
            <p className="text-gray-500 mb-10 max-w-lg leading-relaxed" style={{ fontSize: "1.1rem" }}>
              One AI. 11 modules. Complete marketing output.
              <span className="text-gray-300 font-semibold"> Built for founders who move fast.</span>
            </p>
            <div className="flex items-center gap-4 mb-12">
              <button onClick={() => router.push("/sign-up")}
                className="text-white font-black px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95"
                style={{ background: "#6d28d9", boxShadow: "0 0 40px rgba(109,40,217,0.4)" }}>
                Start for Free →
              </button>
              <button onClick={() => router.push("/dashboard")}
                className="text-gray-400 font-semibold px-8 py-5 rounded-2xl text-lg transition-all hover:text-white"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                View Dashboard
              </button>
            </div>
            <div ref={statsRef} className="flex items-center gap-8">
              {[
                { v: "$49", l: "per month" },
                { v: "10x", l: "faster" },
                { v: "11", l: "AI modules" },
                { v: "24/7", l: "always on" }
              ].map((s) => (
                <div key={s.l} className="cursor-default">
                  <div className="text-2xl font-black text-purple-600">{s.v}</div>
                  <div className="text-gray-600 text-xs font-medium">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live output card */}
          <div className={`transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
            <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(109,40,217,0.15)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(109,40,217,0.08)", background: "rgba(0,0,0,0.3)" }}>
                <div className="w-3 h-3 rounded-full bg-red-500 opacity-60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-60" />
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-60" />
                <span className="ml-3 text-gray-600 text-xs font-mono">ai-marketing-copilot · live output</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-purple-700 rounded-full animate-pulse" />
                  <span className="text-purple-600 text-xs font-bold">LIVE</span>
                </div>
              </div>
              <div className="flex gap-2 px-5 py-3 border-b overflow-x-auto" style={{ borderColor: "rgba(109,40,217,0.08)" }}>
                {LIVE_OUTPUTS.map((o, i) => (
                  <button key={i} onClick={() => { setOutputIndex(i); setOutputText(""); setOutputCharIndex(0); }}
                    className="text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium"
                    style={{ background: i === outputIndex ? "rgba(109,40,217,0.15)" : "rgba(255,255,255,0.03)", color: i === outputIndex ? "#a78bfa" : "#6b7280", border: `1px solid ${i === outputIndex ? "rgba(109,40,217,0.3)" : "rgba(255,255,255,0.05)"}` }}>
                    {o.module}
                  </button>
                ))}
              </div>
              <div className="p-6 font-mono text-sm" style={{ minHeight: 200 }}>
                <pre className="whitespace-pre-wrap leading-relaxed text-purple-300" style={{ fontSize: "0.85rem" }}>
                  {outputText}<span className="animate-pulse text-white">█</span>
                </pre>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(109,40,217,0.08)", background: "rgba(0,0,0,0.2)" }}>
                <span className="text-gray-700 text-xs font-mono">Generated in 8.3s</span>
                <div className="flex gap-2">
                  {["Copy", "Export", "Refine"].map((a) => (
                    <button key={a} className="text-xs px-3 py-1 rounded-lg transition-all font-medium" style={{ background: "rgba(109,40,217,0.1)", color: "#8b5cf6", border: "1px solid rgba(109,40,217,0.15)" }}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "#6d28d9", boxShadow: "0 0 20px rgba(109,40,217,0.5)" }}>
              ⚡ 10 seconds
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="relative z-10 py-5 overflow-hidden" style={{ borderTop: "1px solid rgba(109,40,217,0.08)", borderBottom: "1px solid rgba(109,40,217,0.08)" }}>
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: "marquee 25s linear infinite" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-medium px-4 text-gray-600">{item}</span>
          ))}
        </div>
      </div>

      {/* Bold statement */}
      <section className="relative z-10 px-8 py-28">
        <div className="max-w-5xl mx-auto">
          <p className="font-black leading-tight tracking-tighter" style={{ fontSize: "clamp(28px, 4vw, 64px)" }}>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>Stop paying $10,000/month to an agency that takes 2 weeks to write a blog post.</span>
            {" "}<span className="text-white">Start shipping in minutes.</span>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-8 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4">
          {[
            { value: `$${savedCount.toLocaleString()}`, label: "Saved vs agencies", icon: "💰" },
            { value: `${speedCount}s`, label: "To full strategy", icon: "⚡" },
            { value: foundersCount.toLocaleString(), label: "Founders using now", icon: "🚀" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-8 text-center"
              style={{ background: "rgba(109,40,217,0.04)", border: "1px solid rgba(109,40,217,0.1)" }}>
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="font-black text-4xl mb-2 text-purple-600">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules grid */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-purple-500 font-bold mb-3">What's inside</p>
            <h2 className="font-black tracking-tighter text-white" style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>
              11 modules. One system.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {features.map((f, i) => {
              const isComingSoon = f.title === "Meta Auto-Poster";
              return (
                <div key={f.title}
                  className="group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(109,40,217,0.1)",
                    opacity: isComingSoon ? 0.6 : 1,
                  }}
                  onClick={() => !isComingSoon && router.push("/sign-up")}
                  onMouseEnter={(e) => {
                    if (isComingSoon) return;
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(109,40,217,0.06)";
                    el.style.borderColor = "rgba(109,40,217,0.25)";
                    el.style.boxShadow = "0 0 30px rgba(109,40,217,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(255,255,255,0.02)";
                    el.style.borderColor = "rgba(109,40,217,0.1)";
                    el.style.boxShadow = "none";
                  }}>
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="text-white font-bold text-base mb-1">{f.title}
                    {isComingSoon && <span className="ml-2 text-xs px-2 py-0.5 rounded-full align-middle" style={{ background: "rgba(109,40,217,0.15)", color: "#8b5cf6", border: "1px solid rgba(109,40,217,0.2)" }}>SOON</span>}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{f.desc}</p>
                  <div className="mt-4 text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {!isComingSoon && "Open →"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <div className="relative z-10 py-12 overflow-hidden">
        <p className="text-center text-xs uppercase tracking-widest text-gray-700 font-bold mb-8">What founders are saying</p>
        <div className="flex gap-4 overflow-hidden">
          <div className="flex gap-4" style={{ animation: "marquee 30s linear infinite" }}>
            {[
              { text: "Replaced my $8K/month agency in one day.", name: "Sarah K., SaaS Founder" },
              { text: "Generated a full brand strategy in 10 seconds. Insane.", name: "Marcus T., E-commerce" },
              { text: "My LinkedIn engagement went up 4x in one week.", name: "Priya M., Startup CEO" },
              { text: "This is what I needed. Fast, on-brand, no agency BS.", name: "James L., Freelancer" },
              { text: "The ad copy is better than what my agency produced.", name: "Alex R., D2C Brand" },
              { text: "Replaced my $8K/month agency in one day.", name: "Sarah K., SaaS Founder" },
              { text: "Generated a full brand strategy in 10 seconds. Insane.", name: "Marcus T., E-commerce" },
              { text: "My LinkedIn engagement went up 4x in one week.", name: "Priya M., Startup CEO" },
            ].map((t, i) => (
              <div key={i} className="flex-shrink-0 w-80 rounded-2xl p-5 cursor-default transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(109,40,217,0.08)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(109,40,217,0.2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(109,40,217,0.08)"; }}>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">"{t.text}"</p>
                <p className="text-purple-600 text-xs font-bold">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="relative z-10 px-8 py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-16" style={{ background: "rgba(109,40,217,0.05)", border: "1px solid rgba(109,40,217,0.12)" }}>
            <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(32px, 5vw, 64px)" }}>
              Your competitors are already using AI.
            </h2>
            <p className="text-gray-500 text-lg mb-4">Don't get left behind.</p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="w-1.5 h-1.5 bg-purple-700 rounded-full animate-pulse" />
              <span className="text-purple-600 font-bold text-sm">{liveCount.toLocaleString()} founders using right now</span>
            </div>
            <button onClick={() => router.push("/sign-up")}
              className="text-white font-black px-14 py-5 rounded-2xl text-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "#6d28d9", boxShadow: "0 0 40px rgba(109,40,217,0.4)" }}>
              Get Started Free →
            </button>
            <p className="text-gray-700 text-sm mt-5">$49/month · No credit card · Cancel anytime</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-8 py-8 text-center" style={{ borderTop: "1px solid rgba(109,40,217,0.06)" }}>
        <p className="text-gray-800 text-sm">© 2026 AI Marketing Co-Pilot · Built for modern businesses</p>
      </footer>

      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
    </main>
  );
}