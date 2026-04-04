"use client";
import { useEffect, useState } from "react";
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
      setWordIndex(i => (i + 1) % WORDS.length);
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
        setOutputIndex(i => (i + 1) % LIVE_OUTPUTS.length);
        setOutputText(""); setOutputCharIndex(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [outputCharIndex, outputIndex]);

  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh", color: "white", overflowX: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.5px" }}>AI Marketing Co-Pilot</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", opacity: 0.4, display: "inline-block" }} />
            <span style={{ color: "white", fontWeight: 600 }}>{liveCount.toLocaleString()}</span> using now
          </div>
          <button onClick={() => router.push("/dashboard")} style={{ fontSize: 14, color: "#555", background: "none", border: "none", cursor: "pointer" }}>Dashboard</button>
          <button onClick={() => router.push("/sign-up")} style={{ background: "white", color: "black", fontWeight: 800, padding: "10px 24px", borderRadius: 10, fontSize: 14, border: "none", cursor: "pointer" }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO — Full screen massive text */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 48px 60px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#444", textTransform: "uppercase" }}>
            ● Live · Replacing $10K/month agencies
          </span>
        </div>

        {/* MASSIVE HEADLINE */}
        <h1 style={{ fontWeight: 900, lineHeight: 0.95, letterSpacing: "-4px", margin: "0 0 16px", fontSize: "clamp(72px, 12vw, 180px)", color: "white" }}>
          AI That<br />Writes Your
        </h1>
        <h1 style={{ fontWeight: 900, lineHeight: 0.95, letterSpacing: "-4px", margin: "0 0 48px", fontSize: "clamp(72px, 12vw, 180px)", color: "#222", minHeight: "1.1em" }}>
          {displayed}<span style={{ color: "#333", animation: "blink 1s infinite" }}>|</span>
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", marginTop: 24 }}>
          <div>
            <p style={{ fontSize: 20, color: "#555", marginBottom: 40, lineHeight: 1.6, maxWidth: 480 }}>
              One AI. 11 modules. Complete marketing output.{" "}
              <span style={{ color: "#888" }}>Built for founders who move fast.</span>
            </p>
            <div style={{ display: "flex", gap: 16, marginBottom: 56 }}>
              <button onClick={() => router.push("/sign-up")} style={{ background: "white", color: "black", fontWeight: 900, padding: "18px 48px", borderRadius: 14, fontSize: 18, border: "none", cursor: "pointer", boxShadow: "0 0 60px rgba(255,255,255,0.08)" }}>
                Start for Free →
              </button>
              <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", color: "#444", fontWeight: 600, padding: "18px 32px", borderRadius: 14, fontSize: 18, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                View Dashboard
              </button>
            </div>
            <div style={{ display: "flex", gap: 48 }}>
              {[{ v: "$49", l: "/ month" }, { v: "10x", l: "faster" }, { v: "11", l: "modules" }, { v: "24/7", l: "always on" }].map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "white" }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: "#444", fontWeight: 500 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live output card */}
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 16, overflow: "hidden", background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0d0d0d" }}>
                {["#333","#333","#333"].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                <span style={{ marginLeft: 12, fontSize: 11, color: "#444", fontFamily: "monospace" }}>ai-marketing-copilot · live</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", opacity: 0.3, display: "inline-block" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#555" }}>LIVE</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {LIVE_OUTPUTS.map((o, i) => (
                  <button key={i} onClick={() => { setOutputIndex(i); setOutputText(""); setOutputCharIndex(0); }}
                    style={{ fontSize: 11, padding: "6px 12px", borderRadius: 8, fontWeight: 600, cursor: "pointer", border: `1px solid ${i === outputIndex ? "rgba(255,255,255,0.1)" : "transparent"}`, background: i === outputIndex ? "rgba(255,255,255,0.06)" : "transparent", color: i === outputIndex ? "#fff" : "#444" }}>
                    {o.module}
                  </button>
                ))}
              </div>
              <div style={{ padding: 24, minHeight: 160, fontFamily: "monospace" }}>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#777", lineHeight: 1.7, margin: 0 }}>
                  {outputText}<span style={{ color: "white" }}>█</span>
                </pre>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>Generated in 8.3s</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Copy","Export"].map(a => (
                    <button key={a} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#555", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", top: -12, right: -12, background: "white", color: "black", fontWeight: 800, fontSize: 12, padding: "6px 14px", borderRadius: 8 }}>
              ⚡ 10 seconds
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "20px 48px" }}>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", maxWidth: 1400, margin: "0 auto" }}>
          {["Brand Strategy","Social Media","Email Marketing","Ad Campaigns","SEO Strategy","Copywriting","AI Poster Maker","Content Planner","Website Builder"].map((item,i) => (
            <span key={i} style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Big statement */}
      <section style={{ padding: "120px 48px", maxWidth: 1400, margin: "0 auto" }}>
        <p style={{ fontWeight: 900, lineHeight: 1, letterSpacing: "-3px", fontSize: "clamp(36px, 6vw, 96px)" }}>
          <span style={{ color: "#1a1a1a" }}>Stop paying $10,000/month to an agency that takes 2 weeks to write a blog post.</span>
          {" "}<span style={{ color: "white" }}>Start shipping in minutes.</span>
        </p>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 48px 80px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { value: "$9,951", label: "Saved vs agencies", icon: "💰" },
            { value: "10s", label: "To full strategy", icon: "⚡" },
            { value: "2,858+", label: "Founders using now", icon: "🚀" },
          ].map((stat,i) => (
            <div key={i} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "40px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 52, letterSpacing: "-2px", color: "white", marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#444" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section style={{ padding: "80px 48px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 60 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#333", textTransform: "uppercase", marginBottom: 16 }}>What's inside</p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(40px, 6vw, 80px)", letterSpacing: "-3px", color: "white", margin: 0 }}>
            11 modules.<br /><span style={{ color: "#222" }}>One system.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {features.map(f => (
            <div key={f.title}
              style={{ borderRadius: 12, padding: "24px 20px", cursor: f.comingSoon ? "default" : "pointer", transition: "all 0.2s", background: hoveredCard === f.title ? "#141414" : "transparent", border: `1px solid ${hoveredCard === f.title ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`, opacity: f.comingSoon ? 0.35 : 1 }}
              onClick={() => !f.comingSoon && router.push("/sign-up")}
              onMouseEnter={() => !f.comingSoon && setHoveredCard(f.title)}
              onMouseLeave={() => setHoveredCard(null)}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: "white", margin: "0 0 6px" }}>
                {f.title}
                {f.comingSoon && <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: "#444", letterSpacing: 1 }}>SOON</span>}
              </h3>
              <p style={{ fontSize: 12, color: "#444", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 48px", borderTop: "1px solid rgba(255,255,255,0.04)", maxWidth: 1400, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#333", textTransform: "uppercase", marginBottom: 40 }}>What founders say</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { text: "Replaced my $8K/month agency in one day.", name: "Sarah K.", role: "SaaS Founder" },
            { text: "Generated a full brand strategy in 10 seconds. Insane.", name: "Marcus T.", role: "E-commerce" },
            { text: "My LinkedIn engagement went up 4x in one week.", name: "Priya M.", role: "Startup CEO" },
            { text: "Fast, on-brand, no agency BS.", name: "James L.", role: "Freelancer" },
            { text: "Ad copy better than what my agency produced.", name: "Alex R.", role: "D2C Brand" },
            { text: "This is what every founder needs.", name: "Raj K.", role: "Tech Startup" },
          ].map((t,i) => (
            <div key={i} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "24px 20px" }}>
              <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, margin: "0 0 20px" }}>"{t.text}"</p>
              <p style={{ fontWeight: 700, fontSize: 13, color: "white", margin: "0 0 2px" }}>{t.name}</p>
              <p style={{ fontSize: 12, color: "#333", margin: 0 }}>{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "120px 48px", textAlign: "center", maxWidth: 1400, margin: "0 auto" }}>
        <h2 style={{ fontWeight: 900, fontSize: "clamp(40px, 7vw, 100px)", letterSpacing: "-4px", color: "white", lineHeight: 0.95, margin: "0 0 20px" }}>
          Your competitors<br />are already<br />using AI.
        </h2>
        <p style={{ fontSize: 20, color: "#444", margin: "0 0 12px" }}>Don't get left behind.</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 40 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", opacity: 0.3, display: "inline-block" }} />
          <span style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>{liveCount.toLocaleString()} founders using right now</span>
        </div>
        <button onClick={() => router.push("/sign-up")} style={{ background: "white", color: "black", fontWeight: 900, padding: "22px 72px", borderRadius: 16, fontSize: 20, border: "none", cursor: "pointer", boxShadow: "0 0 80px rgba(255,255,255,0.08)" }}>
          Get Started Free →
        </button>
        <p style={{ fontSize: 13, color: "#2a2a2a", marginTop: 20 }}>$49/month · No credit card · Cancel anytime</p>
      </section>

      <footer style={{ padding: "24px 48px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#2a2a2a", margin: 0 }}>© 2026 AI Marketing Co-Pilot · Built for modern businesses</p>
      </footer>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        * { box-sizing: border-box; }
        button { font-family: inherit; }
      `}</style>
    </main>
  );
}