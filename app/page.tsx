"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["Brand Strategy.", "Social Content.", "Email Sequences.", "Ad Campaigns.", "SEO Articles.", "Landing Pages."];

const LIVE_OUTPUTS = [
  { module: "Social Media", content: "LinkedIn Post — Day 1\n\"Most founders waste $10K/month on agencies that take 2 weeks to write a blog post. We built AI that does it in 10 seconds. Here's how →\"" },
  { module: "Email", content: "Subject: You're leaving $10K on the table\nSubject: Your competitors aren't waiting\nSubject: 10 seconds to your entire marketing strategy" },
  { module: "Ad Copy", content: "Headline 1: AI Marketing in 10 Seconds\nHeadline 2: Replace Your $10K Agency\nDescription: Full brand strategy trained on YOUR product." },
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

const reviews = [
  { text: "Replaced my $8K/month agency in one day. This tool is unreal.", name: "Sarah K.", role: "SaaS Founder", rating: 5 },
  { text: "Generated a full brand strategy in 10 seconds. Absolutely insane.", name: "Marcus T.", role: "E-commerce CEO", rating: 5 },
  { text: "My LinkedIn engagement went up 4x in just one week.", name: "Priya M.", role: "Startup CEO", rating: 5 },
  { text: "Fast, on-brand, no agency BS. Exactly what I needed.", name: "James L.", role: "Freelancer", rating: 5 },
  { text: "The ad copy is better than what my $5K/month agency produced.", name: "Alex R.", role: "D2C Brand", rating: 5 },
  { text: "Every founder should be using this. Game changer.", name: "Raj K.", role: "Tech Startup", rating: 5 },
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
    <main className="overflow-x-hidden" style={{ background: "#ffffff", minHeight: "100vh", color: "#0a0a0a" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #e5e5e5" }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-black" />
          <span className="font-black tracking-tight text-base" style={{ color: "#0a0a0a" }}>AI Marketing Co-Pilot</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}>
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse opacity-60" />
            <span className="font-bold" style={{ color: "#0a0a0a" }}>{liveCount.toLocaleString()}</span>
            <span style={{ color: "#999" }}>using now</span>
          </div>
          <button onClick={() => router.push("/dashboard")} className="text-sm transition-colors" style={{ color: "#999" }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#000"}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#999"}>
            Dashboard
          </button>
          <button onClick={() => router.push("/sign-up")}
            className="text-white font-black px-5 py-2 rounded-lg text-sm transition-all hover:scale-105"
            style={{ background: "#0a0a0a" }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center px-8 pt-20" style={{ background: "linear-gradient(180deg, #fff 0%, #f9f9f9 100%)" }}>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-8 font-medium" style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", color: "#666" }}>
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse opacity-40" />
              Replacing $10K/month agencies
            </div>

            <h1 className="font-black leading-none tracking-tighter mb-2" style={{ fontSize: "clamp(52px, 7vw, 96px)", letterSpacing: "-4px", color: "#0a0a0a" }}>
              <span className="block">AI That</span>
              <span className="block">Writes Your</span>
            </h1>
            <h1 className="font-black leading-none tracking-tighter mb-10" style={{ fontSize: "clamp(52px, 7vw, 96px)", letterSpacing: "-4px", color: "#d0d0d0", minHeight: "1.2em" }}>
              {displayed}<span className="animate-pulse" style={{ color: "#bbb" }}>|</span>
            </h1>

            <p className="mb-10 max-w-md leading-relaxed" style={{ color: "#888", fontSize: "1.1rem" }}>
              One AI. 11 modules. Complete marketing output.{" "}
              <span style={{ color: "#444" }}>Built for founders who move fast.</span>
            </p>

            <div className="flex items-center gap-4 mb-14">
              <button onClick={() => router.push("/sign-up")}
                className="text-white font-black px-10 py-4 rounded-xl text-lg transition-all hover:scale-105"
                style={{ background: "#0a0a0a", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                Start for Free →
              </button>
              <button onClick={() => router.push("/dashboard")}
                className="font-semibold px-8 py-4 rounded-xl text-lg transition-all"
                style={{ color: "#888", background: "#f5f5f5", border: "1px solid #e0e0e0" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#000"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#888"}>
                View Dashboard
              </button>
            </div>

            <div className="flex items-center gap-10">
              {[{ v: "$49", l: "per month" }, { v: "10x", l: "faster" }, { v: "11", l: "modules" }, { v: "24/7", l: "always on" }].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black" style={{ color: "#0a0a0a" }}>{s.v}</div>
                  <div className="text-xs" style={{ color: "#bbb" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live output */}
          <div className={`relative transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#0a0a0a", boxShadow: "0 40px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {["#e55", "#fa0", "#5a5"].map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                <span className="ml-3 text-xs font-mono" style={{ color: "#444" }}>ai-marketing-copilot · live</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-green-400">LIVE</span>
                </div>
              </div>
              <div className="flex gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {LIVE_OUTPUTS.map((o, i) => (
                  <button key={i} onClick={() => { setOutputIndex(i); setOutputText(""); setOutputCharIndex(0); }}
                    className="text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium"
                    style={{ background: i === outputIndex ? "rgba(255,255,255,0.1)" : "transparent", color: i === outputIndex ? "#fff" : "#555", border: `1px solid ${i === outputIndex ? "rgba(255,255,255,0.15)" : "transparent"}` }}>
                    {o.module}
                  </button>
                ))}
              </div>
              <div className="p-6 font-mono" style={{ minHeight: 180 }}>
                <pre className="whitespace-pre-wrap leading-relaxed text-sm text-gray-400">
                  {outputText}<span className="animate-pulse text-white">█</span>
                </pre>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-xs font-mono" style={{ color: "#333" }}>Generated in 8.3s</span>
                <div className="flex gap-2">
                  {["Copy", "Export"].map((a) => (
                    <button key={a} className="text-xs px-3 py-1 rounded-lg font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#666", border: "1px solid rgba(255,255,255,0.1)" }}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-lg text-xs font-black text-white" style={{ background: "#0a0a0a" }}>
              ⚡ 10 seconds
            </div>
            <div className="absolute -bottom-3 -left-3 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "#fff", color: "#0a0a0a", border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              💰 $9,951 saved
            </div>
          </div>
        </div>
      </section>

      {/* Logos ticker */}
      <div className="py-5 overflow-hidden" style={{ borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: "marquee 25s linear infinite" }}>
          {["🧠 Brand Strategy", "📱 Social Media", "📧 Email Marketing", "🎯 Ad Campaigns", "🔍 SEO Strategy", "✍️ Copywriting", "🖼️ AI Poster Maker", "🗓️ Content Planner", "🌐 Website Builder", "🧠 Brand Strategy", "📱 Social Media", "📧 Email Marketing", "🎯 Ad Campaigns"].map((item, i) => (
            <span key={i} className="text-sm font-medium" style={{ color: "#ccc" }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Bold statement */}
      <section className="px-8 py-28" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto">
          <p className="font-black leading-tight" style={{ fontSize: "clamp(32px, 5vw, 72px)", letterSpacing: "-2px" }}>
            <span style={{ color: "#e0e0e0" }}>Stop paying $10,000/month to an agency that takes 2 weeks to write a blog post.</span>
            {" "}<span style={{ color: "#0a0a0a" }}>Start shipping in minutes.</span>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 py-12" style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4">
          {[
            { value: "$9,951", label: "Saved vs agencies", icon: "💰" },
            { value: "10s", label: "To full strategy", icon: "⚡" },
            { value: "2,858+", label: "Founders using now", icon: "🚀" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-8 text-center transition-all hover:scale-105" style={{ background: "#fff", border: "1px solid #e5e5e5", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="font-black text-4xl mb-1" style={{ color: "#0a0a0a" }}>{stat.value}</div>
              <div className="text-xs" style={{ color: "#aaa" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="px-8 py-20" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "#ccc" }}>What's inside</p>
            <h2 className="font-black tracking-tighter" style={{ fontSize: "clamp(32px, 4vw, 56px)", letterSpacing: "-2px", color: "#0a0a0a" }}>
              11 modules. One system.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {features.map((f) => (
              <div key={f.title}
                className="group rounded-xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: "#fafafa", border: "1px solid #e5e5e5", opacity: f.comingSoon ? 0.5 : 1 }}
                onClick={() => !f.comingSoon && router.push("/sign-up")}
                onMouseEnter={(e) => { if (!f.comingSoon) { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#d0d0d0"; } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fafafa"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e5e5"; }}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "#0a0a0a" }}>
                  {f.title}
                  {f.comingSoon && <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: "#f0f0f0", color: "#aaa" }}>SOON</span>}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#aaa" }}>{f.desc}</p>
                <div className="mt-3 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all" style={{ color: "#0a0a0a" }}>{!f.comingSoon && "Open →"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-8 py-20" style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "#ccc" }}>Social proof</p>
            <h2 className="font-black tracking-tighter" style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-2px", color: "#0a0a0a" }}>
              Founders love it.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-xl p-6 transition-all hover:shadow-md" style={{ background: "#fff", border: "1px solid #e5e5e5" }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <span key={j} style={{ color: "#0a0a0a", fontSize: "12px" }}>★</span>
                  ))}
                </div>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: "#555" }}>"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: "#0a0a0a" }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#0a0a0a" }}>{r.name}</p>
                    <p className="text-xs" style={{ color: "#aaa" }}>{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-28" style={{ background: "#0a0a0a" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-2px" }}>
            Your competitors are already using AI.
          </h2>
          <p className="mb-3 text-lg" style={{ color: "#555" }}>Don't get left behind.</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-pulse" />
            <span className="text-sm font-medium" style={{ color: "#444" }}>{liveCount.toLocaleString()} founders using right now</span>
          </div>
          <button onClick={() => router.push("/sign-up")}
            className="text-black font-black px-14 py-5 rounded-xl text-xl transition-all hover:scale-105 inline-block bg-white">
            Get Started Free →
          </button>
          <p className="text-xs mt-5" style={{ color: "#333" }}>$49/month · No credit card · Cancel anytime</p>
        </div>
      </section>

      <footer className="px-8 py-6 text-center" style={{ borderTop: "1px solid #e5e5e5", background: "#fff" }}>
        <p className="text-xs" style={{ color: "#ccc" }}>© 2026 AI Marketing Co-Pilot · Built for modern businesses</p>
      </footer>

      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
    </main>
  );
}