"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["Brand Strategy.", "Social Content.", "Email Sequences.", "Ad Campaigns.", "SEO Articles.", "Landing Pages."];
const TICKER_ITEMS = ["🧠 Brand Strategy", "📱 Social Media", "📧 Email Marketing", "🎯 Ad Campaigns", "🔍 SEO Strategy", "✍️ Copywriting", "⚡ 10x Faster", "💰 Save $10K/month", "🚀 Ship in Minutes", "🎨 Always On-Brand"];

const LIVE_OUTPUTS = [
  { module: "📱 Social Media", content: "LinkedIn Post — Day 1\n\"Most founders waste $10K/month on agencies that take 2 weeks to write a blog post. We built AI that does it in 10 seconds. Here's how →\"", color: "#3b82f6" },
  { module: "📧 Email Subject Lines", content: "Subject: You're leaving $10K on the table\nSubject: Your competitors aren't waiting\nSubject: 10 seconds to your entire marketing strategy", color: "#10b981" },
  { module: "🎯 Google Ad Copy", content: "Headline 1: AI Marketing in 10 Seconds\nHeadline 2: Replace Your $10K Agency\nDescription: Full brand strategy, social posts, ads & SEO — all trained on YOUR product.", color: "#f59e0b" },
  { module: "🧠 Brand Tagline", content: "\"Ship Marketing. Not Excuses.\"\n\"Your Agency Is Sleeping. Your AI Isn't.\"\n\"From Brief to Campaign in 10 Seconds.\"", color: "#a855f7" },
];

export default function Home() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [liveCount, setLiveCount] = useState(2847);
  const [outputIndex, setOutputIndex] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [outputCharIndex, setOutputCharIndex] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 4000);
    const countInterval = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 3));
    }, 2000);
    return () => { clearInterval(glitchInterval); clearInterval(countInterval); };
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Typewriter for hero
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

  // Live output typewriter
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

  // Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.9 + 0.1,
      color: ["147,51,234","236,72,153","59,130,246","16,185,129","251,191,36","239,68,68"][Math.floor(Math.random() * 6)],
      pulse: Math.random() * Math.PI * 2,
      size2: Math.random() * 3 + 1,
    }));

    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p: any) => {
        p.x += p.speedX; p.y += p.speedY; p.pulse += 0.02;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const op = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size2 * 5);
        g.addColorStop(0, `rgba(${p.color},${op})`);
        g.addColorStop(1, `rgba(${p.color},0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size2 * 5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${op})`; ctx.fill();
        particles.forEach((p2: any) => {
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147,51,234,${0.05*(1-d/100)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    }
    animate();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  const features = [
    { icon: "🧠", title: "Brand Strategy", desc: "Full positioning & voice guide in 10 seconds.", glow: "#7c3aed", span: "col-span-2" },
    { icon: "📱", title: "Social Media", desc: "7-day calendars for every platform.", glow: "#3b82f6", span: "col-span-1" },
    { icon: "📧", title: "Email Marketing", desc: "Sequences that actually convert.", glow: "#10b981", span: "col-span-1" },
    { icon: "🎯", title: "Ad Campaigns", desc: "Google + Meta copy with A/B variants.", glow: "#f59e0b", span: "col-span-1" },
    { icon: "🔍", title: "SEO Strategy", desc: "Keywords, blogs & full article drafts.", glow: "#f97316", span: "col-span-1" },
    { icon: "✍️", title: "Copywriting", desc: "Landing pages trained on your product.", glow: "#ec4899", span: "col-span-2" },
  ];

  return (
    <main className="text-white overflow-x-hidden" style={{ background: "#010003", minHeight: "100vh" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Mesh bg */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(124,58,237,0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(236,72,153,0.08) 0%, transparent 50%)" }} />

      {/* Cursor */}
      <div className="fixed pointer-events-none z-10 transition-all duration-100" style={{ width: 500, height: 500, borderRadius: "50%", left: mousePos.x - 250, top: mousePos.y - 250, background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)" }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between" style={{ background: "rgba(1,0,3,0.5)", backdropFilter: "blur(30px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3">
            <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-30"></div>
            <div className="relative w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500"></div>
          </div>
          <span className="font-black text-white tracking-tight text-lg">AI Marketing Co-Pilot</span>
        </div>
        <div className="flex items-center gap-6">
          {/* Live counter */}
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-400 font-bold">{liveCount.toLocaleString()}</span>
            <span className="text-gray-600">using now</span>
          </div>
          <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-white text-sm transition-colors font-medium">Dashboard</button>
          <button onClick={() => router.push("/sign-up")}
            className="text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center z-10 px-8 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-8 font-bold uppercase tracking-widest" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Live · Replacing $10K/month agencies
            </div>

            <h1 className="font-black leading-none tracking-tighter mb-2" style={{ fontSize: "clamp(44px, 7vw, 88px)" }}>
              <span className={`block text-white transition-all duration-75 ${glitch ? "translate-x-0.5 opacity-90 text-purple-100" : ""}`}>AI That</span>
              <span className={`block text-white transition-all duration-75 ${glitch ? "-translate-x-0.5 opacity-90" : ""}`}>Writes Your</span>
            </h1>
            <h1 className="font-black leading-none tracking-tighter mb-8" style={{ fontSize: "clamp(44px, 7vw, 88px)", background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", minHeight: "1.3em" }}>
              {displayed}<span className="animate-pulse" style={{ WebkitTextFillColor: "#a855f7" }}>|</span>
            </h1>

            <p className="text-gray-500 mb-10 max-w-lg leading-relaxed" style={{ fontSize: "1.1rem" }}>
              One AI. Six modules. Complete marketing output.
              <span className="text-gray-300 font-semibold"> Built for founders who move fast.</span>
            </p>

            <div className="flex items-center gap-4 mb-12">
              <button onClick={() => router.push("/sign-up")}
                className="text-white font-black px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.2)" }}>
                Start for Free →
              </button>
              <button onClick={() => router.push("/dashboard")}
                className="text-gray-400 font-semibold px-8 py-5 rounded-2xl text-lg transition-all hover:text-white hover:scale-105"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                View Dashboard
              </button>
            </div>

            <div className="flex items-center gap-8">
              {[{ v: "$49", l: "per month" }, { v: "10x", l: "faster" }, { v: "6", l: "AI modules" }, { v: "0", l: "agencies needed" }].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.v}</div>
                  <div className="text-gray-700 text-xs font-medium">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Live AI Output */}
          <div className={`transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", backdropFilter: "blur(20px)" }}>
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(124,58,237,0.1)", background: "rgba(0,0,0,0.3)" }}>
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-70"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-70"></div>
                  <span className="ml-3 text-gray-600 text-xs font-mono">ai-marketing-copilot · live output</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-xs font-bold">LIVE</span>
                  </div>
                </div>

                {/* Module tabs */}
                <div className="flex gap-2 px-5 py-3 border-b overflow-x-auto" style={{ borderColor: "rgba(124,58,237,0.08)" }}>
                  {LIVE_OUTPUTS.map((o, i) => (
                    <button key={i} onClick={() => { setOutputIndex(i); setOutputText(""); setOutputCharIndex(0); }}
                      className="text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium"
                      style={{ background: i === outputIndex ? `${o.color}20` : "rgba(255,255,255,0.03)", color: i === outputIndex ? o.color : "#6b7280", border: `1px solid ${i === outputIndex ? o.color + "30" : "rgba(255,255,255,0.05)"}` }}>
                      {o.module}
                    </button>
                  ))}
                </div>

                {/* Output */}
                <div className="p-6 font-mono text-sm" style={{ minHeight: 200 }}>
                  <pre className="whitespace-pre-wrap leading-relaxed" style={{ color: LIVE_OUTPUTS[outputIndex].color, fontSize: "0.85rem" }}>
                    {outputText}<span className="animate-pulse text-white">█</span>
                  </pre>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(124,58,237,0.08)", background: "rgba(0,0,0,0.2)" }}>
                  <span className="text-gray-700 text-xs font-mono">Generated in 8.3s</span>
                  <div className="flex gap-2">
                    {["Copy", "Export", "Refine"].map((a) => (
                      <button key={a} className="text-xs px-3 py-1 rounded-lg transition-all hover:scale-105 font-medium" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>{a}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-5 -right-5 px-4 py-2 rounded-2xl text-sm font-bold text-white animate-bounce" style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", boxShadow: "0 0 30px rgba(124,58,237,0.6)", animationDuration: "3s" }}>
                ⚡ 10 seconds
              </div>
              <div className="absolute -bottom-5 -left-5 px-4 py-3 rounded-2xl" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", backdropFilter: "blur(10px)" }}>
                <div className="text-green-400 font-bold text-sm">$9,951 saved</div>
                <div className="text-gray-600 text-xs">vs hiring an agency</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee ticker */}
      <div className="relative z-10 py-6 overflow-hidden" style={{ background: "rgba(124,58,237,0.06)", borderTop: "1px solid rgba(124,58,237,0.1)", borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
        <div className="flex gap-8 animate-marquee whitespace-nowrap" style={{ animation: "marquee 20s linear infinite" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-bold px-4" style={{ color: "#6b21a8" }}>{item}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
      </div>

      {/* Bold statement */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <p className="font-black leading-tight tracking-tighter" style={{ fontSize: "clamp(28px, 5vw, 72px)" }}>
            <span style={{ color: "rgba(255,255,255,0.12)" }}>Stop paying $10,000/month to an agency that takes 2 weeks to write a blog post.</span>
            {" "}<span className="text-white">Start shipping in minutes.</span>
          </p>
        </div>
      </section>

      {/* Bento grid */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-3">What's inside</p>
            <h2 className="font-black tracking-tighter" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
              <span className="text-white">6 modules.</span>
              <span style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}> One system.</span>
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {features.map((f) => (
              <div key={f.title}
                className={`group relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${f.span}`}
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", minHeight: 200 }}
                onClick={() => router.push("/sign-up")}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 50px ${f.glow}25`; el.style.borderColor = `${f.glow}30`; el.style.background = `${f.glow}08`; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.borderColor = "rgba(255,255,255,0.05)"; el.style.background = "rgba(255,255,255,0.02)"; }}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</div>
                <h3 className="text-white font-black text-xl mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-6 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all" style={{ color: f.glow }}>Open module →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof marquee */}
      <div className="relative z-10 py-8 overflow-hidden">
        <p className="text-center text-xs uppercase tracking-widest text-gray-700 font-bold mb-6">What founders are saying</p>
        <div className="flex gap-4 overflow-hidden">
          <div className="flex gap-4 animate-marquee" style={{ animation: "marquee 30s linear infinite" }}>
            {[
              { text: "Replaced my $8K/month agency in one day.", name: "Sarah K., SaaS Founder", color: "#7c3aed" },
              { text: "Generated a full brand strategy in 10 seconds. Insane.", name: "Marcus T., E-commerce", color: "#ec4899" },
              { text: "My LinkedIn engagement went up 4x in one week.", name: "Priya M., Startup CEO", color: "#3b82f6" },
              { text: "This is what I needed. Fast, on-brand, no agency BS.", name: "James L., Freelancer", color: "#10b981" },
              { text: "The ad copy is better than what my agency produced.", name: "Alex R., D2C Brand", color: "#f59e0b" },
              { text: "Replaced my $8K/month agency in one day.", name: "Sarah K., SaaS Founder", color: "#7c3aed" },
              { text: "Generated a full brand strategy in 10 seconds. Insane.", name: "Marcus T., E-commerce", color: "#ec4899" },
              { text: "My LinkedIn engagement went up 4x in one week.", name: "Priya M., Startup CEO", color: "#3b82f6" },
            ].map((t, i) => (
              <div key={i} className="flex-shrink-0 w-96 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${t.color}20` }}>
                <p className="text-gray-200 text-base mb-4 leading-relaxed">"{t.text}"</p>
                <p className="text-xs font-bold" style={{ color: t.color }}>— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-[40px] p-20" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.08))", border: "1px solid rgba(124,58,237,0.15)", boxShadow: "0 0 120px rgba(124,58,237,0.15)" }}>
            <div className="absolute inset-0 rounded-[40px] overflow-hidden opacity-10" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="relative z-10">
              <div className="text-8xl mb-8">⚡</div>
              <h2 className="font-black tracking-tighter mb-4" style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
                Your competitors
                <span className="block" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  are already using AI.
                </span>
              </h2>
              <p className="text-gray-500 text-xl mb-4 max-w-lg mx-auto">Don't get left behind.</p>
              <div className="flex items-center justify-center gap-2 mb-10">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 font-bold text-sm">{liveCount.toLocaleString()} founders using right now</span>
              </div>
              <button onClick={() => router.push("/sign-up")}
                className="text-white font-black px-16 py-6 rounded-2xl text-2xl transition-all hover:scale-105 active:scale-95 inline-block"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 60px rgba(124,58,237,0.6), 0 0 120px rgba(124,58,237,0.3)" }}>
                Get Started Free →
              </button>
              <p className="text-gray-700 text-sm mt-6">$49/month · No credit card · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-8 py-10 text-center" style={{ borderTop: "1px solid rgba(124,58,237,0.06)" }}>
        <p className="text-gray-800 text-sm font-medium">© 2026 AI Marketing Co-Pilot · Built for modern businesses</p>
      </footer>
    </main>
  );
}
