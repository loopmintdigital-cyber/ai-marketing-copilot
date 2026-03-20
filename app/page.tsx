"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.7 + 0.1,
      color: ["147, 51, 234", "236, 72, 153", "59, 130, 246", "16, 185, 129"][Math.floor(Math.random() * 4)],
      pulse: Math.random() * Math.PI * 2,
    }));

    let animationId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p: any) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;
        const pulsedOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `rgba(${p.color}, ${pulsedOpacity})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${pulsedOpacity})`;
        ctx.fill();

        particles.forEach((p2: any) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.06 * (1 - dist / 150)})`;
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

  const features = [
    { icon: "🧠", title: "Brand Strategy Engine", desc: "Full brand positioning, voice guide & ICP personas in seconds.", color: "purple", glow: "rgba(147,51,234,0.3)" },
    { icon: "📱", title: "Social Media Manager", desc: "7-day post calendars for LinkedIn, Twitter & Instagram.", color: "blue", glow: "rgba(59,130,246,0.3)" },
    { icon: "📧", title: "Email Marketing", desc: "Onboarding sequences, nurture flows & cold outreach.", color: "green", glow: "rgba(16,185,129,0.3)" },
    { icon: "🎯", title: "Ad Campaign Generator", desc: "Google RSA + Meta ad copy with A/B variants.", color: "yellow", glow: "rgba(234,179,8,0.3)" },
    { icon: "🔍", title: "SEO & Blog Strategy", desc: "Keyword clusters, blog calendars & full article drafts.", color: "orange", glow: "rgba(249,115,22,0.3)" },
    { icon: "✍️", title: "Content & Copywriting", desc: "Landing pages, hero copy & feature copy.", color: "pink", glow: "rgba(236,72,153,0.3)" },
  ];

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: "#030007" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Cursor glow effect */}
      <div className="fixed pointer-events-none z-10 w-96 h-96 rounded-full transition-all duration-300"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)",
          left: mousePos.x - 192,
          top: mousePos.y - 192,
        }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between" style={{ background: "rgba(3, 0, 7, 0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(147, 51, 234, 0.1)" }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-purple-500 rounded-full animate-ping opacity-30"></div>
          </div>
          <span className="font-black text-white text-lg tracking-tight">AI Marketing Co-Pilot</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">Dashboard</button>
          <button onClick={() => router.push("/sign-up")}
            className="relative group overflow-hidden text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            <span className="relative z-10">Get Started Free →</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, #9333ea, #f43f5e)" }} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 z-10">
        {/* Big glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto text-center">
          <div className={`transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

            <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full mb-10 font-medium" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c084fc" }}>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
              Replace your $10K/month marketing agency
            </div>

            <h1 className="font-black leading-none tracking-tighter mb-8" style={{ fontSize: "clamp(60px, 12vw, 140px)" }}>
              <span className="block text-white">Your AI</span>
              <span className="block" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Marketing
              </span>
              <span className="block text-white">Co-Pilot</span>
            </h1>

            <p className="text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "1.25rem" }}>
              Get instant brand strategy, copy, social posts, ads, SEO & email sequences —
              all trained on your product. <span className="text-white font-semibold">In minutes, not months.</span>
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
              <button onClick={() => router.push("/sign-up")}
                className="group relative overflow-hidden text-white font-black px-12 py-5 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
                <span className="relative z-10">Start for Free →</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, #9333ea, #f43f5e)" }} />
              </button>
              <button onClick={() => router.push("/dashboard")}
                className="font-semibold px-12 py-5 rounded-2xl text-lg transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                View Dashboard
              </button>
            </div>

            {/* Stats inline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { value: "$10K", label: "Agency cost/month" },
                { value: "$49", label: "Our cost/month" },
                { value: "10x", label: "Faster output" },
                { value: "100%", label: "On-brand always" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                  <div className="text-2xl font-black mb-1" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{stat.value}</div>
                  <div className="text-gray-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black mb-4 tracking-tight" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
              <span className="text-white">Everything your</span>
              <span className="block" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                marketing needs
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">6 AI modules working as one coherent marketing system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title}
                className="group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}
                onClick={() => router.push("/sign-up")}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${f.glow}`; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.4)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.1)"; }}>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                <h3 className="font-bold text-white mb-2 text-lg">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <span className="text-purple-400 text-xs opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0 inline-block">Try it free →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center relative overflow-hidden rounded-3xl p-16"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.1))", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.2), transparent)" }} />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.2), transparent)" }} />
          </div>
          <div className="relative z-10">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="font-black mb-4 tracking-tight" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
              Ready to ditch
              <span className="block" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                your agency?
              </span>
            </h2>
            <p className="text-gray-400 mb-10 text-xl">Join founders saving $10K/month shipping content 10x faster.</p>
            <button onClick={() => router.push("/sign-up")}
              className="group relative overflow-hidden text-white font-black px-14 py-5 rounded-2xl text-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 60px rgba(124,58,237,0.5)" }}>
              Get Started Free →
            </button>
            <p className="text-gray-600 text-sm mt-5">Starting at $49/month · Cancel anytime</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 py-8 text-center text-gray-700 text-sm" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        <p>© 2026 AI Marketing Co-Pilot · Built for modern businesses</p>
      </footer>
    </main>
  );
}
