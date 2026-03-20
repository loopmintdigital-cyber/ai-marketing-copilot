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
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouse);
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("mousemove", handleMouse); };
  }, []);

  // Typewriter effect
  useEffect(() => {
    const word = WORDS[wordIndex];
    let timeout: NodeJS.Timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.8 + 0.1,
      color: ["147, 51, 234", "236, 72, 153", "59, 130, 246", "16, 185, 129", "251, 191, 36"][Math.floor(Math.random() * 5)],
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
        g.addColorStop(0, `rgba(${p.color}, ${op})`);
        g.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${op})`; ctx.fill();
        particles.forEach((p2: any) => {
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147,51,234,${0.04 * (1 - d / 130)})`; ctx.lineWidth = 0.5; ctx.stroke();
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
    { icon: "🧠", title: "Brand Strategy", desc: "Full positioning, voice guide & ICP personas in 10 seconds.", glow: "#7c3aed" },
    { icon: "📱", title: "Social Media", desc: "7-day calendars for LinkedIn, Twitter & Instagram.", glow: "#3b82f6" },
    { icon: "📧", title: "Email Marketing", desc: "Sequences that convert — onboarding, nurture & cold.", glow: "#10b981" },
    { icon: "🎯", title: "Ad Campaigns", desc: "Google RSA + Meta copy with A/B variants.", glow: "#f59e0b" },
    { icon: "🔍", title: "SEO Strategy", desc: "Keywords, blog calendars & full article drafts.", glow: "#f97316" },
    { icon: "✍️", title: "Copywriting", desc: "Landing pages & hero copy trained on your product.", glow: "#ec4899" },
  ];

  return (
    <main className="text-white overflow-x-hidden" style={{ background: "#020004", minHeight: "100vh" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Cursor glow */}
      <div className="fixed pointer-events-none z-10 transition-all duration-200"
        style={{ width: 400, height: 400, borderRadius: "50%", left: mousePos.x - 200, top: mousePos.y - 200, background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between" style={{ background: "rgba(2,0,4,0.6)", backdropFilter: "blur(30px)", borderBottom: "1px solid rgba(147,51,234,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3">
            <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-40"></div>
            <div className="relative w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
          <span className="font-black text-white tracking-tight">AI Marketing Co-Pilot</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-white text-sm transition-colors">Dashboard</button>
          <button onClick={() => router.push("/sign-up")}
            className="text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center z-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%)" }} />
        </div>

        <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
          <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full mb-12 font-semibold uppercase tracking-widest" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
            The future of marketing is here
          </div>

          <h1 className="font-black tracking-tighter leading-none mb-6" style={{ fontSize: "clamp(48px, 10vw, 120px)" }}>
            <span className="block text-white">AI That Writes Your</span>
            <span className="block relative" style={{ background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", minHeight: "1.2em" }}>
              {displayed}<span className="animate-pulse">|</span>
            </span>
          </h1>

          <p className="text-gray-500 mb-12 max-w-xl mx-auto" style={{ fontSize: "1.2rem", lineHeight: 1.7 }}>
            One AI. Six modules. All your marketing — brand strategy, social, email, ads, SEO & copy. 
            <span className="text-gray-300"> Built for founders who move fast.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button onClick={() => router.push("/sign-up")}
              className="group relative overflow-hidden text-white font-black px-12 py-5 rounded-2xl text-lg w-full sm:w-auto transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 50px rgba(124,58,237,0.5), 0 0 100px rgba(124,58,237,0.2)" }}>
              Start for Free →
            </button>
            <button onClick={() => router.push("/dashboard")}
              className="text-white font-semibold px-12 py-5 rounded-2xl text-lg w-full sm:w-auto transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              View Dashboard
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              { value: "$10K", label: "Agency/month" },
              { value: "$49", label: "Our price" },
              { value: "10x", label: "Faster" },
              { value: "6", label: "AI modules" },
            ].map((s) => (
              <div key={s.label} className="py-4 px-3 rounded-2xl" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
                <div className="text-2xl font-black" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</div>
                <div className="text-gray-600 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big statement */}
      <section className="relative z-10 px-6 py-32 text-center">
        <div className="max-w-5xl mx-auto">
          <p className="font-black leading-tight tracking-tighter" style={{ fontSize: "clamp(32px, 6vw, 80px)", color: "rgba(255,255,255,0.08)" }}>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>Stop paying $10,000/month</span> to an agency that takes 2 weeks to write a blog post. <span style={{ color: "rgba(255,255,255,0.9)" }}>Start shipping in minutes.</span>
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-4">What's inside</p>
            <h2 className="font-black tracking-tighter" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
              <span className="text-white">6 modules.</span>
              <span style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}> One system.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <div key={f.title}
                className="group relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", animationDelay: `${i * 100}ms` }}
                onClick={() => router.push("/sign-up")}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 0 40px ${f.glow}30, 0 20px 60px rgba(0,0,0,0.5)`;
                  el.style.borderColor = `${f.glow}40`;
                  el.style.background = `${f.glow}08`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "none";
                  el.style.borderColor = "rgba(255,255,255,0.05)";
                  el.style.background = "rgba(255,255,255,0.02)";
                }}>
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</div>
                <h3 className="text-white font-black text-xl mb-3">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-6 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0" style={{ color: f.glow }}>
                  Try free →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl p-16" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))", border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 0 100px rgba(124,58,237,0.2)" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full" style={{ background: "linear-gradient(to bottom, transparent, rgba(124,58,237,0.3), transparent)" }} />
            </div>
            <div className="text-7xl mb-8">⚡</div>
            <h2 className="font-black tracking-tighter mb-4" style={{ fontSize: "clamp(40px, 6vw, 72px)" }}>
              Your competitors
              <span className="block" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                are already using AI.
              </span>
            </h2>
            <p className="text-gray-500 text-xl mb-12">Don't get left behind. Start free today.</p>
            <button onClick={() => router.push("/sign-up")}
              className="text-white font-black px-16 py-6 rounded-2xl text-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 60px rgba(124,58,237,0.6), 0 0 120px rgba(124,58,237,0.3)" }}>
              Get Started Free →
            </button>
            <p className="text-gray-700 text-sm mt-6">$49/month · No credit card · Cancel anytime</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 py-10 text-center" style={{ borderTop: "1px solid rgba(124,58,237,0.08)" }}>
        <p className="text-gray-800 text-sm font-medium">© 2026 AI Marketing Co-Pilot</p>
      </footer>
    </main>
  );
}
