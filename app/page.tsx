"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      heroRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    { icon: "🧠", title: "Brand Strategy Engine", desc: "AI builds your full brand positioning, voice guide & ICP personas in seconds." },
    { icon: "📱", title: "Social Media Manager", desc: "7-day post calendars for LinkedIn, Twitter & Instagram — always on-brand." },
    { icon: "📧", title: "Email Marketing", desc: "Onboarding sequences, nurture flows & cold outreach that actually convert." },
    { icon: "🎯", title: "Ad Campaign Generator", desc: "Google RSA + Meta ad copy with A/B variants ready to deploy." },
    { icon: "🔍", title: "SEO & Blog Strategy", desc: "Keyword clusters, 3-month blog calendars & full article drafts." },
    { icon: "✍️", title: "Content & Copywriting", desc: "Landing pages, hero copy & feature copy trained on your product." },
  ];

  const stats = [
    { value: "$10K", label: "Avg. agency cost/month" },
    { value: "$49", label: "AI Co-Pilot cost/month" },
    { value: "10x", label: "Faster content output" },
    { value: "100%", label: "Always on-brand" },
  ];

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-white">AI Marketing Co-Pilot</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white text-sm transition-colors">
            Dashboard
          </button>
          <button onClick={() => router.push("/onboarding")}
            className="bg-white text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div ref={heroRef} className="transition-transform duration-100 ease-out">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm px-4 py-2 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
              Replace your $10K/month marketing agency
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight">
              Your AI
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Marketing
              </span>
              Co-Pilot
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Get instant brand strategy, copy, social posts, ads, SEO content and email sequences —
              all trained on your product. In minutes, not months.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={() => router.push("/onboarding")}
                className="group bg-white text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95">
                Start for Free
                <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
              </button>
              <button onClick={() => router.push("/dashboard")}
                className="border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white/5 transition-all">
                View Dashboard
              </button>
            </div>

            <p className="text-gray-600 text-sm mt-6">No credit card required · Setup in 2 minutes</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent animate-pulse"></div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-20 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything your marketing
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                team needs
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              6 powerful AI modules that work together as one coherent marketing system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={f.title}
                className="group bg-white/3 border border-white/5 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                onClick={() => router.push("/onboarding")}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-4 text-purple-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  Try it free →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/20 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to replace
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                your agency?
              </span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Join founders who are saving $10K/month and shipping content 10x faster.
            </p>
            <button onClick={() => router.push("/onboarding")}
              className="bg-white text-black font-bold px-10 py-4 rounded-xl text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95">
              Get Started Free →
            </button>
            <p className="text-gray-600 text-sm mt-4">Starting at $49/month · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2026 AI Marketing Co-Pilot · Built for SaaS founders</p>
      </footer>
    </main>
  );
}