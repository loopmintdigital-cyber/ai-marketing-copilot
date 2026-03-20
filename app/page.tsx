"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["Brand Strategy.", "Social Content.", "Email Sequences.", "Ad Campaigns.", "SEO Articles.", "Landing Pages."];

export default function Home() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000);
    return () => clearInterval(glitchInterval);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Typewriter
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

  // Canvas particles
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

      {/* Animated mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(236,72,153,0.1) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(59,130,246,0.1) 0%, transparent 50%)"
        }} />
      </div>

      {/* Cursor spotlight */}
      <div className="fixed pointer-events-none z-10 transition-all duration-100"
        style={{ width: 600, height: 600, borderRadius: "50%", left: mousePos.x - 300, top: mousePos.y - 300, background: "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 60%)" }} />

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
          <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-white text-sm transition-colors font-medium">Dashboard</button>
          <button onClick={() => router.push("/sign-up")}
            className="text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO — Split layout */}
      <section className="relative min-h-screen flex items-center z-10 px-8 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-8 font-bold uppercase tracking-widest" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Live · Replacing $10K/month agencies
            </div>

            <h1 className="font-black leading-none tracking-tighter mb-2" style={{ fontSize: "clamp(44px, 7vw, 90px)" }}>
              <span className={`block text-white transition-all duration-75 ${glitch ? "translate-x-1 opacity-80" : ""}`}>AI That</span>
              <span className={`block text-white transition-all duration-75 ${glitch ? "-translate-x-1 opacity-80" : ""}`}>Writes Your</span>
            </h1>
            <h1 className="font-black leading-none tracking-tighter mb-8" style={{ fontSize: "clamp(44px, 7vw, 90px)", background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", minHeight: "1.3em" }}>
              {displayed}<span className="animate-pulse" style={{ WebkitTextFillColor: "#a855f7" }}>|</span>
            </h1>

            <p className="text-gray-500 mb-10 max-w-lg leading-relaxed" style={{ fontSize: "1.1rem" }}>
              One AI. Six modules. Complete marketing output — brand strategy, social, email, ads, SEO & copy.
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
                View Demo
              </button>
            </div>

            {/* Mini stats */}
            <div className="flex items-center gap-6">
              {[{ v: "$49", l: "per month" }, { v: "10x", l: "faster" }, { v: "6", l: "AI modules" }].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.v}</div>
                  <div className="text-gray-700 text-xs font-medium">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Visual */}
          <div className={`transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
            <div className="relative">
              {/* Floating cards */}
              <div className="relative w-full h-96 lg:h-[520px]">
                {/* Main card */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", backdropFilter: "blur(20px)" }}>
                  <div className="p-8 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(124,58,237,0.2)" }}>🧠</div>
                        <div>
                          <div className="text-white font-bold text-sm">Brand Strategy Engine</div>
                          <div className="text-green-400 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span> Generating...</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {["Brand Voice: Bold & Unapologetic", "Target ICP: Founders aged 25-40", "Key Differentiator: 10x faster than agencies", "Tagline: Ship marketing. Not excuses."].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></div>
                            <span className="text-gray-300 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["LinkedIn Post ✓", "Email Sequence ✓", "Ad Copy ✓", "SEO Blog ✓"].map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.3)" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating badge top right */}
                <div className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", boxShadow: "0 0 30px rgba(124,58,237,0.5)" }}>
                  ⚡ 10 seconds
                </div>

                {/* Floating badge bottom left */}
                <div className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(10px)" }}>
                  <div className="text-green-400 font-bold text-sm">$9,951 saved</div>
                  <div className="text-gray-500 text-xs">vs hiring an agency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bold statement */}
      <section className="relative z-10 px-8 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="font-black leading-tight tracking-tighter" style={{ fontSize: "clamp(28px, 5vw, 72px)" }}>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>Stop paying $10,000/month to an agency that takes 2 weeks to write a blog post.</span>
            {" "}<span className="text-white">Start shipping in minutes.</span>
          </p>
        </div>
      </section>

      {/* Bento grid features */}
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
                <div className="mt-6 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ color: f.glow }}>Open module →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[40px] p-20 text-center" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.08))", border: "1px solid rgba(124,58,237,0.15)", boxShadow: "0 0 120px rgba(124,58,237,0.15)" }}>
            {/* Grid lines */}
            <div className="absolute inset-0 rounded-[40px] overflow-hidden opacity-20" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="relative z-10">
              <div className="text-8xl mb-8">⚡</div>
              <h2 className="font-black tracking-tighter mb-4" style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
                Your competitors
                <span className="block" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  are already using AI.
                </span>
              </h2>
              <p className="text-gray-500 text-xl mb-12 max-w-lg mx-auto">Don't get left behind. Join founders saving $10K/month.</p>
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
