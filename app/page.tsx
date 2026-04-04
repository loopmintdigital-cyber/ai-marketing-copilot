"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["Brand Strategy.", "Social Content.", "Email Sequences.", "Ad Campaigns.", "SEO Articles.", "Landing Pages."];

const LIVE_OUTPUTS = [
  { module: "Social Media", content: 'LinkedIn Post — Day 1\n"Most founders waste $10K/month on agencies that take 2 weeks to write a blog post. We built AI that does it in 10 seconds. Here\'s how →"' },
  { module: "Email", content: "Subject: You're leaving $10K on the table\nSubject: Your competitors aren't waiting\nSubject: 10 seconds to your entire marketing strategy" },
  { module: "Ad Copy", content: "Headline 1: AI Marketing in 10 Seconds\nHeadline 2: Replace Your $10K Agency\nDescription: Full brand strategy trained on YOUR product." },
  { module: "Brand", content: '"Ship Marketing. Not Excuses."\n"Your Agency Is Sleeping. Your AI Isn\'t."\n"From Brief to Campaign in 10 Seconds."' },
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
  { text: "Replaced my $8K/month agency in one day. This tool is unreal.", name: "Sarah K.", role: "SaaS Founder", color: "#0a0a0a", rating: 5 },
  { text: "Generated a full brand strategy in 10 seconds. Absolutely insane.", name: "Marcus T.", role: "E-commerce CEO", color: "#e84a2b", rating: 5 },
  { text: "My LinkedIn engagement went up 4x in just one week.", name: "Priya M.", role: "Startup CEO", color: "#7c3aed", rating: 5 },
  { text: "Fast, on-brand, no agency BS. Exactly what I needed.", name: "James L.", role: "Freelancer", color: "#0a0a0a", rating: 5 },
  { text: "The ad copy is better than what my $5K/month agency produced.", name: "Alex R.", role: "D2C Brand", color: "#e84a2b", rating: 5 },
  { text: "Every founder should be using this. Game changer.", name: "Raj K.", role: "Tech Startup", color: "#0a7c5c", rating: 5 },
];

function useCountUp(target: number, trigger: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [trigger, target]);
  return value;
}

function StatCard({ icon, value, label, numTarget, prefix = "", suffix = "" }: {
  icon: string; value: string; label: string; numTarget?: number; prefix?: string; suffix?: string;
}) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useCountUp(numTarget ?? 0, triggered && !!numTarget);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "48px 40px",
        transition: "background 0.25s, color 0.25s",
        background: hovered ? "#0a0a0a" : "#f5f0e8",
        cursor: "default",
        borderRight: "1px solid rgba(0,0,0,0.08)",
      }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(48px, 4vw, 64px)",
        lineHeight: 1,
        color: hovered ? "#fff" : "#0a0a0a",
        letterSpacing: "-1px",
        marginBottom: 8,
        transition: "color 0.25s",
      }}>
        {numTarget ? `${prefix}${counted.toLocaleString()}${suffix}` : value}
      </div>
      <div style={{
        fontFamily: "monospace",
        fontSize: 12,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: hovered ? "#888" : "#999",
        transition: "color 0.25s",
      }}>{label}</div>
    </div>
  );
}

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

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

  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const countInterval = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 3) - 1), 2500);
    const onMove = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    let raf: number;
    function animCursor() {
      if (cursorRef.current && ringRef.current) {
        cursorRef.current.style.left = mousePos.current.x + "px";
        cursorRef.current.style.top = mousePos.current.y + "px";
        ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.13;
        ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.13;
        ringRef.current.style.left = ringPos.current.x + "px";
        ringRef.current.style.top = ringPos.current.y + "px";
      }
      raf = requestAnimationFrame(animCursor);
    }
    raf = requestAnimationFrame(animCursor);
    return () => { clearInterval(countInterval); window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const word = WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;
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
      const t = setTimeout(() => { setOutputText(fullText.slice(0, outputCharIndex + 1)); setOutputCharIndex(i => i + 1); }, 18);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setOutputIndex(i => (i + 1) % LIVE_OUTPUTS.length); setOutputText(""); setOutputCharIndex(0); }, 3000);
      return () => clearTimeout(t);
    }
  }, [outputCharIndex, outputIndex]);

  const accentColor = "#e84a2b";
  const cream = "#f5f0e8";

  return (
    <>
      {/* Custom cursor */}
      <div ref={cursorRef} style={{
        position: "fixed", width: 10, height: 10, borderRadius: "50%",
        background: accentColor, pointerEvents: "none", zIndex: 9999,
        transform: "translate(-50%,-50%)", mixBlendMode: "multiply",
        transition: "width 0.2s, height 0.2s",
      }} />
      <div ref={ringRef} style={{
        position: "fixed", width: 34, height: 34, borderRadius: "50%",
        border: "1.5px solid #0a0a0a", pointerEvents: "none", zIndex: 9998,
        transform: "translate(-50%,-50%)",
      }} />

      <main style={{ background: cream, minHeight: "100vh", color: "#0a0a0a", overflowX: "hidden", cursor: "none", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
          @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
          @keyframes blink { 0%,50% { opacity:1 } 51%,100% { opacity:0 } }
          * { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
        `}</style>

        {/* NAV */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "18px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(245,240,232,0.95)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}>
          <a href="#" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: "#0a0a0a", textDecoration: "none" }}>
            AI<span style={{ color: accentColor }}>·</span>COPILOT
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: 12, color: "#999" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <strong style={{ color: "#0a0a0a" }}>{liveCount.toLocaleString()}</strong> using now
            </div>
            <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", cursor: "none", fontSize: 14, color: "#999" }}>
              Dashboard
            </button>
            <button onClick={() => router.push("/sign-up")} style={{
              background: "#0a0a0a", color: "#f5f0e8", border: "2px solid #0a0a0a",
              padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "none",
              letterSpacing: 0.5, transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = accentColor)}
              onMouseLeave={e => (e.currentTarget.style.background = "#0a0a0a")}>
              Get Started →
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight: "100vh", padding: "140px 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "all 0.9s ease" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32,
              fontFamily: "monospace", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase",
              color: accentColor, border: `1px solid ${accentColor}`, padding: "6px 14px",
            }}>
              <span>●</span> The AI agency killer
            </div>

            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(72px, 8vw, 116px)", lineHeight: 0.92, letterSpacing: "-1px", color: "#0a0a0a", marginBottom: 16 }}>
              AI THAT<br />WRITES<br />YOUR
            </h1>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(72px, 8vw, 116px)", lineHeight: 0.92, letterSpacing: "-1px", color: accentColor, marginBottom: 32, minHeight: "1em" }}>
              {displayed}<span style={{ animation: "blink 1s infinite", display: "inline-block" }}>|</span>
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.7, color: "#666", maxWidth: 440, marginBottom: 40, fontWeight: 300 }}>
              One AI. 11 modules. Your entire marketing stack.{" "}
              <strong style={{ color: "#0a0a0a", fontWeight: 500 }}>Built for founders who ship fast.</strong>
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40, flexWrap: "wrap" }}>
              <button onClick={() => router.push("/sign-up")} style={{
                background: "#0a0a0a", color: cream, padding: "16px 32px", fontSize: 15, fontWeight: 600,
                border: "2px solid #0a0a0a", cursor: "none", letterSpacing: 0.5, position: "relative", overflow: "hidden",
                transition: "background 0.2s, border-color 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = accentColor; e.currentTarget.style.borderColor = accentColor; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.borderColor = "#0a0a0a"; }}>
                Start for Free →
              </button>
              <button onClick={() => router.push("/dashboard")} style={{
                background: "transparent", color: "#0a0a0a", padding: "16px 24px", fontSize: 15,
                border: "1.5px solid rgba(0,0,0,0.2)", cursor: "none",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#0a0a0a")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)")}>
                View Dashboard
              </button>
            </div>

            <div style={{ display: "flex", gap: 36 }}>
              {[{ v: "$49", l: "per month" }, { v: "10x", l: "faster" }, { v: "11", l: "modules" }, { v: "24/7", l: "always on" }].map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: -0.5, color: "#0a0a0a", lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 20, fontFamily: "monospace", fontSize: 11, color: "#bbb", letterSpacing: 1 }}>
              No credit card required · Cancel anytime
            </p>
          </div>

          {/* Terminal */}
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "all 0.9s ease 0.2s", position: "relative" }}>
            <div style={{ position: "absolute", top: -16, right: -16, background: "#ffd60a", color: "#0a0a0a", fontFamily: "monospace", fontSize: 11, fontWeight: 700, padding: "7px 14px", zIndex: 2 }}>
              ⚡ 10 seconds
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #222", boxShadow: "20px 20px 0 rgba(0,0,0,0.12), 0 8px 48px rgba(0,0,0,0.18)" }}>
              <div style={{ padding: "13px 18px", background: "#1a1a1a", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a2a" }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
                <div style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: 11, color: "#555" }}>ai-marketing-copilot · live</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 11, color: "#22c55e" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                  LIVE
                </div>
              </div>
              <div style={{ display: "flex", borderBottom: "1px solid #1e1e1e" }}>
                {LIVE_OUTPUTS.map((o, i) => (
                  <button key={i} onClick={() => { setOutputIndex(i); setOutputText(""); setOutputCharIndex(0); }}
                    style={{
                      padding: "10px 16px", fontFamily: "monospace", fontSize: 11, cursor: "none",
                      color: i === outputIndex ? "#fff" : "#555", background: "transparent", border: "none",
                      borderBottom: i === outputIndex ? `2px solid ${accentColor}` : "2px solid transparent",
                      transition: "color 0.2s",
                    }}>
                    {o.module}
                  </button>
                ))}
              </div>
              <div style={{ padding: "24px 20px", minHeight: 180, fontFamily: "monospace", fontSize: 13, color: "#ccc", lineHeight: 1.9 }}>
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {outputText}<span style={{ display: "inline-block", width: 8, height: 14, background: accentColor, verticalAlign: "middle", animation: "blink 1s infinite" }} />
                </pre>
              </div>
              <div style={{ padding: "12px 20px", borderTop: "1px solid #1e1e1e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#ffd60a" }}>💰 $9,951 saved</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Copy", "Export"].map(a => (
                    <button key={a} style={{ fontFamily: "monospace", fontSize: 11, padding: "5px 12px", background: "transparent", border: "1px solid #2a2a2a", color: "#666", cursor: "none" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#666"; }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div style={{ background: "#0a0a0a", padding: "14px 0", overflow: "hidden", borderTop: "1px solid #1a1a1a" }}>
          <div style={{ display: "flex", animation: "marquee 25s linear infinite", whiteSpace: "nowrap" }}>
            {[...Array(2)].map((_, rep) => (
              <div key={rep} style={{ display: "flex", flexShrink: 0 }}>
                {["Brand Strategy", "Social Media", "Email Sequences", "Ad Campaigns", "SEO Articles", "Copywriting", "AI Poster Maker", "Content Planner", "Website Builder"].map((item, i) => (
                  <span key={i} style={{ padding: "0 40px", fontFamily: "monospace", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#444", display: "flex", alignItems: "center", gap: 20 }}>
                    {item} <span style={{ color: accentColor, fontSize: 18 }}>·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <StatCard icon="💰" value="$9,951" label="Saved vs agencies" numTarget={9951} prefix="$" />
          <StatCard icon="⚡" value="10s" label="To full brand strategy" />
          <StatCard icon="🚀" value="2,875+" label="Founders using now" numTarget={2875} suffix="+" />
        </div>

        {/* STATEMENT */}
        <RevealSection>
          <section style={{ padding: "120px 48px", maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: accentColor, marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 32, height: 1, background: accentColor, display: "inline-block" }} />
              Why founders are switching
            </div>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 5.5vw, 80px)", lineHeight: 1.05, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#ccc" }}>Your agency charges $10K/month, takes 2 weeks, and sends you a PDF.</span>
              {" "}<strong style={{ color: "#0a0a0a", fontWeight: "normal" }}>We do it in 10 seconds.</strong>
            </p>
          </section>
        </RevealSection>

        {/* MODULES */}
        <section style={{ background: "#0a0a0a", padding: "80px 48px 120px" }}>
          <RevealSection>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 60 }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>Everything you need</div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 5vw, 64px)", color: "#f5f0e8", lineHeight: 1, letterSpacing: "-0.5px" }}>
                  11 MODULES.<br />ZERO EXCUSES.
                </h2>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#333", letterSpacing: 2 }}>11 / 11 LIVE</div>
            </div>
          </RevealSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#1a1a1a" }}>
            {features.map((f, idx) => (
              <RevealSection key={f.title} delay={idx * 40}>
                <ModuleCard f={f} accentColor={accentColor} onClick={() => !f.comingSoon && router.push("/sign-up")} />
              </RevealSection>
            ))}
          </div>
        </section>

        {/* PROOF */}
        <section style={{ background: cream, padding: "120px 48px" }}>
          <RevealSection>
            <div style={{ marginBottom: 64 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: accentColor, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 32, height: 1, background: accentColor, display: "inline-block" }} /> Real results. Real founders.
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 5vw, 68px)", lineHeight: 1, letterSpacing: "-0.5px" }}>
                THEY DITCHED<br />THE AGENCY.
              </h2>
              <p style={{ fontSize: 16, color: "#888", fontWeight: 300, marginTop: 16, maxWidth: 480 }}>
                Over 2,800 founders have already made the switch. Here's what they're saying.
              </p>
            </div>
          </RevealSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {reviews.map((r, i) => (
              <RevealSection key={i} delay={i * 60}>
                <ReviewCard r={r} accentColor={accentColor} featured={i === 1} />
              </RevealSection>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section style={{ background: "#0a0a0a", padding: "120px 48px" }}>
          <RevealSection>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>Pricing</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 5vw, 64px)", color: "#f5f0e8", lineHeight: 1, letterSpacing: "-0.5px" }}>
                SIMPLE.<br />TRANSPARENT.
              </h2>
              <p style={{ fontFamily: "monospace", fontSize: 13, color: "#555", marginTop: 16, letterSpacing: 0.5 }}>
                No hidden fees. No agency markup. Just results.
              </p>
            </div>
          </RevealSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "#1a1a1a", marginTop: 60 }}>
            {[
              { label: "Starter", price: "$49", period: "/month", features: ["5 modules included", "50 generations/mo", "1 brand profile", "Export to PDF/DOCX"], cta: "Get Started", featured: false },
              { label: "Pro", price: "$99", period: "/month", features: ["All 11 modules", "Unlimited generations", "3 brand profiles", "API integrations", "Priority support"], cta: "Start for Free", featured: true },
              { label: "Agency", price: "$299", period: "/month", features: ["Everything in Pro", "10 brand profiles", "White-label export", "Dedicated support"], cta: "Contact Us", featured: false },
            ].map((p, i) => (
              <RevealSection key={i} delay={i * 80}>
                <PriceCard p={p} accentColor={accentColor} cream={cream} onClick={() => router.push("/sign-up")} />
              </RevealSection>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: cream, padding: "160px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 280, color: "rgba(0,0,0,0.04)", whiteSpace: "nowrap", pointerEvents: "none", letterSpacing: -8 }}>
            GO
          </div>
          <RevealSection>
            <div style={{ position: "relative" }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", color: accentColor, marginBottom: 24 }}>
                Stop waiting. Start shipping.
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(56px, 8vw, 108px)", lineHeight: 0.9, letterSpacing: "-2px", color: "#0a0a0a", marginBottom: 32 }}>
                YOUR AGENCY<br />IS ASLEEP.<br />YOUR AI ISN'T.
              </h2>
              <p style={{ fontSize: 17, color: "#666", fontWeight: 300, marginBottom: 44 }}>
                Join {liveCount.toLocaleString()}+ founders already saving $10K/month.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <button onClick={() => router.push("/sign-up")} style={{
                  background: "#0a0a0a", color: cream, padding: "18px 40px", fontSize: 16, fontWeight: 600,
                  border: "2px solid #0a0a0a", cursor: "none", transition: "background 0.2s, border-color 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = accentColor; e.currentTarget.style.borderColor = accentColor; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.borderColor = "#0a0a0a"; }}>
                  Start for Free →
                </button>
                <button onClick={() => router.push("/dashboard")} style={{
                  background: "transparent", color: "#0a0a0a", padding: "18px 28px", fontSize: 16,
                  border: "1.5px solid rgba(0,0,0,0.2)", cursor: "none",
                }}>
                  View Dashboard
                </button>
              </div>
              <p style={{ marginTop: 20, fontFamily: "monospace", fontSize: 11, color: "#bbb", letterSpacing: 1 }}>
                $49/month · No credit card · Cancel anytime
              </p>
            </div>
          </RevealSection>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "#0a0a0a", padding: "28px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #1a1a1a" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: "#333" }}>
            AI<span style={{ color: accentColor }}>·</span>COPILOT
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#333" }}>© 2026 AI·COPILOT · Replace your agency. Keep your budget.</div>
        </footer>
      </main>
    </>
  );
}

function ModuleCard({ f, accentColor, onClick }: { f: typeof features[0]; accentColor: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#141414" : "#0f0f0f",
        padding: "36px 32px", cursor: f.comingSoon ? "default" : "none",
        opacity: f.comingSoon ? 0.45 : 1, position: "relative",
        borderBottom: hovered ? `2px solid ${accentColor}` : "2px solid transparent",
        transition: "background 0.2s, border-color 0.3s",
      }}>
      {f.comingSoon && (
        <div style={{ position: "absolute", top: 20, right: 20, fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#555", border: "1px solid #2a2a2a", padding: "3px 8px", textTransform: "uppercase" }}>
          Soon
        </div>
      )}
      <div style={{ fontSize: 26, marginBottom: 20 }}>{f.icon}</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: "#f5f0e8", marginBottom: 8 }}>{f.title}</div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888", lineHeight: 1.6 }}>{f.desc}</div>
    </div>
  );
}

function ReviewCard({ r, accentColor, featured }: { r: typeof reviews[0]; accentColor: string; featured: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", padding: "32px",
        border: `1px solid ${hovered ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.08)"}`,
        borderTop: featured ? `3px solid ${accentColor}` : undefined,
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "8px 8px 0 rgba(0,0,0,0.06)" : "none",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
      }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
        {Array.from({ length: r.rating }).map((_, i) => <span key={i} style={{ color: "#ffd60a", fontSize: 14 }}>★</span>)}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: "#333", marginBottom: 24, fontStyle: "italic", fontWeight: 300 }}>
        "{r.text}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
          {r.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#aaa" }}>{r.role}</div>
        </div>
      </div>
    </div>
  );
}

function PriceCard({ p, accentColor, cream, onClick }: { p: { label: string; price: string; period: string; features: string[]; cta: string; featured: boolean }; accentColor: string; cream: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ background: p.featured ? accentColor : "#0f0f0f", padding: "48px 36px", position: "relative" }}>
      {p.featured && (
        <div style={{ position: "absolute", top: -1, right: 28, background: "#ffd60a", color: "#0a0a0a", fontFamily: "monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 10px" }}>
          Most Popular
        </div>
      )}
      <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: p.featured ? "rgba(255,255,255,0.6)" : "#555", marginBottom: 20 }}>{p.label}</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, lineHeight: 1, color: p.featured ? "#0a0a0a" : "#f5f0e8", letterSpacing: -1, marginBottom: 4 }}>{p.price}</div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: p.featured ? "rgba(0,0,0,0.5)" : "#555", marginBottom: 32 }}>{p.period}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
        {p.features.map(f => (
          <li key={f} style={{ fontFamily: "monospace", fontSize: 13, color: p.featured ? "rgba(0,0,0,0.7)" : "#666", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: p.featured ? "#0a0a0a" : accentColor }}>→</span> {f}
          </li>
        ))}
      </ul>
      <button onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block", width: "100%", padding: "14px 24px", fontFamily: "monospace", fontSize: 13,
          fontWeight: 600, letterSpacing: 0.5, cursor: "none", transition: "all 0.2s",
          background: p.featured ? (hovered ? "#111" : "#0a0a0a") : "transparent",
          border: p.featured ? "1.5px solid #0a0a0a" : `1.5px solid ${hovered ? accentColor : "#2a2a2a"}`,
          color: p.featured ? "#fff" : (hovered ? accentColor : "#666"),
        }}>
        {p.cta}
      </button>
    </div>
  );
}