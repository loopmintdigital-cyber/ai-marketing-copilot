"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["Brand Strategy.", "Social Content.", "Email Sequences.", "Ad Campaigns.", "SEO Articles.", "Landing Pages."];

const LIVE_OUTPUTS = [
  { module: "Social Media", content: "LinkedIn Post — Day 1\n\"Most founders waste $10K/month on agencies that take 2 weeks to write a blog post. We built AI that does it in 10 seconds. Here's how →\"" },
  { module: "Email", content: "Subject: You're leaving $10K on the table\nSubject: Your competitors aren't waiting\nSubject: 10 seconds to your entire marketing strategy" },
  { module: "Ad Copy", content: "Headline 1: AI Marketing in 10 Seconds\nHeadline 2: Replace Your $10K Agency\nDescription: Full brand strategy, social posts, ads & SEO — trained on YOUR product." },
  { module: "Brand", content: "\"Ship Marketing. Not Excuses.\"\n\"Your Agency Is Sleeping. Your AI Isn't.\"\n\"From Brief to Campaign in 10 Seconds.\"" },
];

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
  { icon: "🔗", title: "Meta Auto-Poster", desc: "Auto-post to Instagram & Facebook.", comingSoon: true },
];

export default function Home() {
  const router = useRouter();
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [liveCount, setLiveCount] = useState(2847);
  const [outputIndex, setOutputIndex] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [outputCharIndex, setOutputCharIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const countInterval = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 3)), 2000);
    return () => clearInterval(countInterval);
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
    const fullText = LIVE_OUTPUTS[outputIndex].content;
    if (outputCharIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setOutputText(fullText.slice(0, outputCharIndex + 1));
        setOutputCharIndex(i => i + 1);
      }, 20);
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

  return (
    <main className="text-white overflow-x-hidden" style={{ background: "#0a0a0a", minHeight: "100vh" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="font-black text-white tracking-tight text-base">AI Marketing Co-Pilot</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: "#666" }}>
            <span className="w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-pulse" />
            <span className="text-white font-medium">{liveCount.toLocaleString()}</span>
            <span>using now</span>
          </div>
          <button onClick={() => router.push("/dashboard")} className="text-sm transition-colors" style={{ color: "#666" }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#fff"}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#666"}>
            Dashboard
          </button>
          <button onClick={() => router.push("/sign-up")}
            className="text-black font-bold px-5 py-2 rounded-lg text-sm transition-all hover:scale-105 bg-white">
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center px-8 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-8 font-medium" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#999" }}>
              <span className="w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-pulse" />
              Replacing $10K/month agencies
            </div>

            <h1 className="font-black leading-none tracking-tighter mb-2 text-white" style={{ fontSize: "clamp(48px, 7vw, 96px)", letterSpacing: "-3px" }}>
              <span className="block">AI That</span>
              <span className="block">Writes Your</span>
            </h1>
            <h1 className="font-black leading-none tracking-tighter mb-10" style={{ fontSize: "clamp(48px, 7vw, 96px)", letterSpacing: "-3px", color: "#444", minHeight: "1.2em" }}>
              {displayed}<span className="animate-pulse" style={{ color: "#666" }}>|</span>
            </h1>

            <p className="mb-10 max-w-md leading-relaxed" style={{ color: "#555", fontSize: "1.1rem" }}>
              One AI. 11 modules. Complete marketing output.{" "}
              <span style={{ color: "#aaa" }}>Built for founders who move fast.</span>
            </p>

            <div className="flex items-center gap-4 mb-14">
              <button onClick={() => router.push("/sign-up")}
                className="text-black font-black px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 bg-white"
                style={{ boxShadow: "0 0 40px rgba(255,255,255,0.1)" }}>
                Start for Free →
              </button>
              <button onClick={() => router.push("/dashboard")}
                className="font-semibold px-8 py-4 rounded-xl text-lg transition-all"
                style={{ color: "#555", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#fff"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#555"}>
                View Dashboard
              </button>
            </div>

            <div className="flex items-center gap-10">
              {[
                { v: "$49", l: "per month" },
                { v: "10x", l: "faster" },
                { v: "11", l: "modules" },
                { v: "24/7", l: "always on" }
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black text-white">{s.v}</div>
                  <div className="text-xs font-medium" style={{ color: "#444" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live output */}
          <div className={`transition-all duration-1000 delay-300 relative ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                <span className="ml-3 text-xs font-mono" style={{ color: "#444" }}>ai-marketing-copilot · live</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-pulse" />
                  <span className="text-xs font-bold" style={{ color: "#666" }}>LIVE</span>
                </div>
              </div>
              <div className="flex gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {LIVE_OUTPUTS.map((o, i) => (
                  <button key={i} onClick={() => { setOutputIndex(i); setOutputText(""); setOutputCharIndex(0); }}
                    className="text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium"
                    style={{ background: i === outputIndex ? "rgba(255,255,255,0.08)" : "transparent", color: i === outputIndex ? "#fff" : "#444", border: `1px solid ${i === outputIndex ? "rgba(255,255,255,0.12)" : "transparent"}` }}>
                    {o.module}
                  </button>
                ))}
              </div>
              <div className="p-6 font-mono" style={{ minHeight: 180 }}>
                <pre className="whitespace-pre-wrap leading-relaxed text-sm" style={{ color: "#888" }}>
                  {outputText}<span className="animate-pulse text-white">█</span>
                </pre>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-xs font-mono" style={{ color: "#333" }}>Generated in 8.3s</span>
                <div className="flex gap-2">
                  {["Copy", "Export"].map((a) => (
                    <button key={a} className="text-xs px-3 py-1 rounded-lg font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "#666", border: "1px solid rgba(255,255,255,0.08)" }}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "#fff", color: "#000" }}>
              ⚡ 10 seconds
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="px-8 py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-6">
          {["Brand Strategy", "Social Media", "Email Marketing", "Ad Campaigns", "SEO Strategy", "Copywriting", "AI Poster Maker", "Content Planner", "Website Builder"].map((item, i) => (
            <span key={i} className="text-sm font-medium" style={{ color: "#333" }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Bold statement */}
      <section className="px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <p className="font-black leading-tight tracking-tighter" style={{ fontSize: "clamp(32px, 5vw, 72px)", letterSpacing: "-2px" }}>
            <span style={{ color: "#222" }}>Stop paying $10,000/month to an agency that takes 2 weeks to write a blog post.</span>
            {" "}<span className="text-white">Start shipping in minutes.</span>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 py-8 mb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-3">
          {[
            { value: "$9,951", label: "Saved vs agencies", icon: "💰" },
            { value: "10s", label: "To full strategy", icon: "⚡" },
            { value: "2,858+", label: "Founders using now", icon: "🚀" },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl p-8 text-center" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="font-black text-4xl mb-1 text-white">{stat.value}</div>
              <div className="text-xs" style={{ color: "#444" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "#444" }}>What's inside</p>
            <h2 className="font-black tracking-tighter text-white" style={{ fontSize: "clamp(32px, 4vw, 56px)", letterSpacing: "-2px" }}>
              11 modules. One system.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {features.map((f) => (
              <div key={f.title}
                className="group rounded-xl p-5 cursor-pointer transition-all duration-200"
                style={{
                  background: hoveredCard === f.title ? "#141414" : "transparent",
                  border: `1px solid ${hoveredCard === f.title ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
                  opacity: f.comingSoon ? 0.4 : 1,
                }}
                onClick={() => !f.comingSoon && router.push("/sign-up")}
                onMouseEnter={() => !f.comingSoon && setHoveredCard(f.title)}
                onMouseLeave={() => setHoveredCard(null)}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-white font-bold text-sm mb-1">
                  {f.title}
                  {f.comingSoon && <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "#555" }}>SOON</span>}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#444" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-8 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest font-bold mb-10" style={{ color: "#444" }}>What founders say</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { text: "Replaced my $8K/month agency in one day.", name: "Sarah K.", role: "SaaS Founder" },
              { text: "Generated a full brand strategy in 10 seconds. Insane.", name: "Marcus T.", role: "E-commerce" },
              { text: "My LinkedIn engagement went up 4x in one week.", name: "Priya M.", role: "Startup CEO" },
              { text: "Fast, on-brand, no agency BS.", name: "James L.", role: "Freelancer" },
              { text: "Ad copy is better than what my agency produced.", name: "Alex R.", role: "D2C Brand" },
              { text: "This is what every founder needs.", name: "Raj K.", role: "Tech Startup" },
            ].map((t, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "#888" }}>"{t.text}"</p>
                <div>
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: "#444" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(36px, 5vw, 72px)", letterSpacing: "-2px" }}>
            Your competitors are already using AI.
          </h2>
          <p className="mb-3 text-lg" style={{ color: "#444" }}>Don't get left behind.</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-pulse" />
            <span className="text-sm font-medium" style={{ color: "#555" }}>{liveCount.toLocaleString()} founders using right now</span>
          </div>
          <button onClick={() => router.push("/sign-up")}
            className="text-black font-black px-14 py-5 rounded-xl text-xl transition-all hover:scale-105 bg-white inline-block"
            style={{ boxShadow: "0 0 60px rgba(255,255,255,0.1)" }}>
            Get Started Free →
          </button>
          <p className="text-xs mt-5" style={{ color: "#333" }}>$49/month · No credit card · Cancel anytime</p>
        </div>
      </section>

      <footer className="px-8 py-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-xs" style={{ color: "#333" }}>© 2026 AI Marketing Co-Pilot · Built for modern businesses</p>
      </footer>
    </main>
  );
}