"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import ExportButtons from "@/components/ExportButtons";
import { useRouter } from "next/navigation";

const PLATFORM_TIMES: Record<string, string[]> = {
  "LinkedIn": ["8:00 AM", "12:00 PM", "5:00 PM", "7:00 PM", "9:00 AM", "6:00 PM", "10:00 AM"],
  "Twitter/X": ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "8:00 AM", "5:00 PM", "11:00 AM"],
  "Instagram": ["6:00 AM", "11:00 AM", "3:00 PM", "7:00 PM", "9:00 AM", "8:00 PM", "12:00 PM"],
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_COLORS = [
  { bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.4)", text: "#a78bfa" },
  { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", text: "#93c5fd" },
  { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", text: "#6ee7b7" },
  { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", text: "#fcd34d" },
  { bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.4)", text: "#f9a8d4" },
  { bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.4)", text: "#fdba74" },
  { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.4)", text: "#c4b5fd" },
];

interface DayPost {
  day: string;
  date: string;
  time: string;
  type: string;
  content: string;
  hashtags: string;
}

function parseCalendar(result: string, startDate: Date, platform: string): DayPost[] {
  const times = PLATFORM_TIMES[platform] || PLATFORM_TIMES["LinkedIn"];
  const posts: DayPost[] = [];

  // Split by DAY sections
  const sections = result.split(/(?=DAY\s*\d+)/i).filter(s => s.trim() && s.match(/DAY\s*\d+/i));

  sections.slice(0, 7).forEach((section, i) => {
    const postDate = new Date(startDate);
    postDate.setDate(startDate.getDate() + i);

    const typeMatch = section.match(/Content Type[:\s]+([^\n]+)/i);
    const type = typeMatch ? typeMatch[1].replace(/\*\*/g, "").trim() : "Post";

    const hashtagLine = section.match(/((?:#\w+\s*){3,})/);
    const hashtags = hashtagLine ? hashtagLine[1].trim() : "";

    // Get main content lines (not metadata)
    const lines = section.split('\n')
      .map(l => l.replace(/\*\*/g, "").trim())
      .filter(l => l.length > 15 &&
        !l.match(/^DAY\s*\d+/i) &&
        !l.match(/Best Posting Time/i) &&
        !l.match(/Content Type/i) &&
        !l.match(/^---/) &&
        !l.match(/^#+\s/) &&
        !l.match(/^#\w+/) &&
        !l.match(/Hashtags:/i)
      );

    const content = lines.slice(0, 6).join('\n').trim();

    posts.push({
      day: DAYS[i],
      date: postDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: times[i] || "9:00 AM",
      type,
      content: content || section.replace(/DAY\s*\d+[^\n]*/i, "").trim().slice(0, 400),
      hashtags,
    });
  });

  // Fallback: split by ---
  if (posts.length === 0) {
    result.split('---').filter(c => c.trim().length > 30).slice(0, 7).forEach((chunk, i) => {
      const postDate = new Date(startDate);
      postDate.setDate(startDate.getDate() + i);
      posts.push({
        day: DAYS[i], time: times[i],
        date: postDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        type: "Post", content: chunk.trim().slice(0, 400), hashtags: "",
      });
    });
  }

  return posts;
}

export default function Social() {
  const router = useRouter();
  const { user } = useUser();
  const [platform, setPlatform] = useState("LinkedIn");
  const [goal, setGoal] = useState("awareness");
  const [productNews, setProductNews] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [view, setView] = useState<"calendar" | "raw">("calendar");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [posts, setPosts] = useState<DayPost[]>([]);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  async function handleGenerate() {
    setLoading(true);
    const brandStrategy = localStorage.getItem("brandStrategy") || "";
    const answers = JSON.parse(localStorage.getItem("answers") || "{}");
    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, goal, productNews, brandStrategy, answers, userId: user?.id }),
    });
    const data = await res.json();
    setResult(data.result);
    const parsed = parseCalendar(data.result, new Date(startDate + "T00:00:00"), platform);
    setPosts(parsed);
    setExpandedDay(0);
    const historyItem = { id: Date.now().toString(), module: "social", inputs: { platform, goal, productNews }, result: data.result, createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("contentHistory") || "[]");
    localStorage.setItem("contentHistory", JSON.stringify([historyItem, ...existing]));
    setLoading(false);
    setView("calendar");
  }

  function copyDay(post: DayPost, i: number) {
    const text = `📅 ${post.day} — ${post.date} at ${post.time}\n\n${post.content}\n\n${post.hashtags}`;
    navigator.clipboard.writeText(text);
    setCopiedDay(i);
    setTimeout(() => setCopiedDay(null), 2000);
  }

  function copyAll() {
    const text = posts.map(p => `📅 ${p.day} — ${p.date} at ${p.time}\n\n${p.content}\n\n${p.hashtags}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
  }

  return (
    <main className="min-h-screen text-white px-6 py-10" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mb-8">
          ← Dashboard
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📱</span>
          <h1 className="text-3xl font-bold">Social Media Manager</h1>
        </div>
        <p className="text-gray-400 mb-8 ml-14">Generate a 7-day post calendar with best posting times</p>

        {/* Controls */}
        <div className="space-y-5 rounded-2xl p-6 mb-6 border border-purple-900 border-opacity-50" style={{ background: "rgba(26, 5, 51, 0.6)", backdropFilter: "blur(10px)", boxShadow: "0 0 40px rgba(147, 51, 234, 0.1)" }}>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-purple-400 mb-2 block font-medium">Platform</label>
              <div className="flex gap-2 flex-wrap">
                {["LinkedIn", "Twitter/X", "Instagram"].map((p) => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${platform === p ? "bg-purple-600 text-white shadow-lg shadow-purple-900" : "bg-gray-800 bg-opacity-60 text-gray-300 hover:bg-gray-700"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-purple-400 mb-2 block font-medium">Goal</label>
              <div className="flex gap-2">
                {["Awareness", "Engagement", "Conversion"].map((g) => (
                  <button key={g} onClick={() => setGoal(g.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${goal === g.toLowerCase() ? "bg-purple-600 text-white shadow-lg shadow-purple-900" : "bg-gray-800 bg-opacity-60 text-gray-300 hover:bg-gray-700"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-purple-400 mb-2 block font-medium">📅 Schedule Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                style={{ background: "rgba(17, 24, 39, 0.8)", colorScheme: "dark" }} />
            </div>
            <div>
              <label className="text-sm text-purple-400 mb-2 block font-medium">Recent news <span className="text-gray-600">(optional)</span></label>
              <input type="text" value={productNews} onChange={(e) => setProductNews(e.target.value)}
                placeholder="e.g. We just launched a new feature..."
                className="w-full border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                style={{ background: "rgba(17, 24, 39, 0.8)" }} />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full relative overflow-hidden bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-purple-900">
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="animate-pulse">✨ Thinking & Generating</span>
                <span className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </span>
            ) : "📅 Generate 7-Day Post Calendar →"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div>
            {/* View toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={() => setView("calendar")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === "calendar" ? "text-white" : "text-gray-600"}`}
                  style={{ background: view === "calendar" ? "rgba(124,58,237,0.4)" : "transparent" }}>
                  📅 Calendar
                </button>
                <button onClick={() => setView("raw")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === "raw" ? "text-white" : "text-gray-600"}`}
                  style={{ background: view === "raw" ? "rgba(124,58,237,0.4)" : "transparent" }}>
                  📄 Full Content
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={copyAll}
                  className="text-xs px-3 py-2 rounded-lg font-medium transition-all hover:scale-105"
                  style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                  📋 Copy All
                </button>
                <ExportButtons content={result} filename="social-media-calendar" productName="" />
              </div>
            </div>

            {/* Calendar View */}
            {view === "calendar" && posts.length > 0 && (
              <div className="space-y-3">
                {/* Week banner */}
                <div className="rounded-2xl p-4 flex items-center justify-between mb-2"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}>
                  <div>
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-0.5">📅 Your Schedule</p>
                    <p className="text-white font-bold text-sm">{posts[0]?.date} — {posts[posts.length - 1]?.date}</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-white font-bold">{platform}</p>
                      <p className="text-gray-600 text-xs">Platform</p>
                    </div>
                    <div>
                      <p className="text-white font-bold capitalize">{goal}</p>
                      <p className="text-gray-600 text-xs">Goal</p>
                    </div>
                    <div>
                      <p className="text-white font-bold">7</p>
                      <p className="text-gray-600 text-xs">Posts</p>
                    </div>
                  </div>
                </div>

                {posts.map((post, i) => {
                  const color = DAY_COLORS[i % DAY_COLORS.length];
                  const isExpanded = expandedDay === i;
                  return (
                    <div key={i} className="rounded-2xl border overflow-hidden transition-all duration-200"
                      style={{ background: isExpanded ? color.bg : "rgba(26,5,51,0.4)", border: `1px solid ${isExpanded ? color.border : "rgba(255,255,255,0.07)"}` }}>
                      {/* Header row */}
                      <div className="flex items-center gap-4 p-4 cursor-pointer select-none"
                        onClick={() => setExpandedDay(isExpanded ? null : i)}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
                          style={{ background: color.bg, border: `2px solid ${color.border}`, color: color.text }}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm">{post.day}</span>
                            <span className="text-gray-600 text-xs">•</span>
                            <span className="text-gray-400 text-xs">{post.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                              ⏰ {post.time}
                            </span>
                            <span className="text-gray-600 text-xs truncate max-w-xs">{post.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); copyDay(post, i); }}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                            style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                            {copiedDay === i ? "✅" : "📋 Copy"}
                          </button>
                          <span className="text-gray-700 text-xs">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {/* Expanded */}
                      {isExpanded && (
                        <div className="px-4 pb-5 space-y-4 border-t" style={{ borderColor: color.border + "60" }}>
                          <div className="pt-4">
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: color.text }}>📝 Post Content</p>
                            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                          </div>

                          {post.hashtags && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: color.text }}># Hashtags</p>
                              <div className="flex flex-wrap gap-1.5">
                                {post.hashtags.split(/\s+/).filter(h => h.startsWith("#")).slice(0, 20).map((tag, j) => (
                                  <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.25)" }}>
                            <p className="text-xs text-gray-500">
                              💡 Post at <strong style={{ color: color.text }}>{post.time}</strong> on <strong className="text-gray-300">{platform}</strong> for best <strong className="text-gray-300">{goal}</strong> results
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Raw View */}
            {view === "raw" && (
              <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30" style={{ background: "rgba(26, 5, 51, 0.4)", backdropFilter: "blur(10px)" }}>
                <div className="space-y-2">
                  {result.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-white mt-4">{line.replace('# ', '')}</h2>;
                    if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-purple-400 mt-3">{line.replace('## ', '')}</h3>;
                    if (line.startsWith('---')) return <hr key={i} className="border-gray-700 my-4" />;
                    if (line.trim() === '') return <div key={i} className="h-1" />;
                    return <p key={i} className="text-gray-300 text-sm">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      `}</style>
    </main>
  );
}