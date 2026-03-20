"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      heroRef.current.style.transform = `translate(${x}px, ${y}px)`;
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

    const particles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.5 ? "147, 51, 234" : Math.random() > 0.5 ? "236, 72, 153" : "59, 130, 246",
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
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();
        particles.forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animationId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", handleResize); };
  }, []);

  const features = [
    { icon: "🧠", title: "Brand Strategy Engine", desc: "AI builds your full brand positioning, voice guide & ICP personas in seconds.", color: "from-purple-500 to-purple-700", border: "hover:border-purple-500/50" },
    { icon: "📱", title: "Social Media Manager", desc: "7-day post calendars for LinkedIn, Twitter & Instagram — always on-brand.", color: "from-blue-500 to-blue-700", border: "hover:border-blue-500/50" },
    { icon: "📧", title: "Email Marketing", desc: "Onboarding sequences, nurture flows & cold outreach that actually convert.", color: "from-green-500 to-green-700", border: "hover:border-green-500/50" },
    { icon: "🎯", title: "Ad Campaign Generator", desc: "Google RSA + Meta ad copy with A/B variants ready to deploy.", color: "from-yellow-500 to-yellow-700", border: "hover:border-yellow-500/50" },
    { icon: "🔍", title: "SEO & Blog Strategy", desc: "Keyword clusters, 3-month blog calendars & full article drafts.", color: "from-orange-500 to-orange-700", border: "hover:border-orange-500/50" },
    { icon: "✍️", title: "Content & Copywriting", desc: "Landing pages, hero copy & feature copy trained on your product.", color: "from-pink-500 to-pink-700", border: "hover:border-pink-500/50" },
  ];

  const stats = [
    { value: "$10K", label: "Avg. agency cost/month" },
    { value: "$49", label: "AI Co-Pilot cost/month" },
    { value: "10x", label: "Faster content output" },
    { value: "100%", label: "Always on-brand" },
  ];

  return (
    <main className="min-h-screen text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #030303 0%, #0d0118 40%, #030303 100%)" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between" style={{ background: "rgba(3, 0, 10, 0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(147, 51, 234, 0.15)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500"></div>
          <span className="font-bold text-white">AI Marketing Co-Pilot</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</button>
          <button onClick={() => router.push("/sign-up")}
            className="relative overflow-hidden bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900">
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 z-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div ref={heroRef} className="transition-transform duration-150 ease-out">
            <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 border border-purple-500/30 text-purple-300 text-sm px-4 py-2 rounded-full mb-8" style={{ background: "rgba(147, 51, 234, 0.1)" }}>
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
                Replace your $10K/month marketing agency
              </div>

              <h1 className="text-7xl md:text-9xl font-black mb-6 leading-none tracking-tight">
                <span className="block text-white">Your AI</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                  Marketing
                </span>
                <span className="block text-white">Co-Pilot</span>
              </h1>

              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Get instant brand strategy, copy, social posts, ads, SEO content and email sequences —
                all trained on your product. <span className="text-white font-semibold">In minutes, not months.</span>
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button onClick={() => router.push("/sign-up")}
                  className="group relative overflow-hidden bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-900">
                  <span className="relative z-10">Start for Free <span className="group-hover:translate-x-1 inline-block transition-transform">→</span></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button onClick={() => router.push("/dashboard")}
                  className="border border-white/20 text-white font-semibold px-10 py-4 rounded-xl text-lg hover:bg-white/5 transition-all hover:border-purple-500/50">
                  View Dashboard
                </button>
              </div>

              <p className="text-gray-600 text-sm mt-6">No credit card required · Setup in 2 minutes</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 z-10">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-purple-500 to-transparent animate-pulse"></div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 py-20" style={{ borderTop: "1px solid rgba(147, 51, 234, 0.1)", borderBottom: "1px solid rgba(147, 51, 234, 0.1)", background: "rgba(147, 51, 234, 0.03)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-purple-500/30 text-purple-300 text-sm px-4 py-2 rounded-full mb-6" style={{ background: "rgba(147, 51, 234, 0.1)" }}>
              ⚡ 6 Powerful AI Modules
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              Everything your marketing
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                team needs
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              6 powerful AI modules that work together as one coherent marketing system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title}
                className={`group relative overflow-hidden border border-white/5 rounded-2xl p-6 ${f.border} transition-all duration-300 cursor-pointer hover:scale-105`}
                style={{ background: "rgba(26, 5, 51, 0.4)", backdropFilter: "blur(10px)" }}
                onClick={() => router.push("/sign-up")}>
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                  <h3 className="font-bold text-white mb-2 text-lg">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  <div className="mt-4 text-purple-400 text-xs opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    Try it free →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl p-12 border border-purple-500/20" style={{ background: "linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)", backdropFilter: "blur(20px)" }}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-5xl font-black mb-4">
                Ready to replace
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  your agency?
                </span>
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Join founders saving $10K/month and shipping content 10x faster.
              </p>
              <button onClick={() => router.push("/sign-up")}
                className="group relative overflow-hidden bg-white text-black font-bold px-12 py-4 rounded-xl text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                Get Started Free →
              </button>
              <p className="text-gray-600 text-sm mt-4">Starting at $49/month · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 text-center text-gray-600 text-sm" style={{ borderTop: "1px solid rgba(147, 51, 234, 0.1)" }}>
        <p>© 2026 AI Marketing Co-Pilot · Built for modern businesses</p>
      </footer>
    </main>
  );
}
