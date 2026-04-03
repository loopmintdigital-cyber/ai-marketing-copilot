"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const PLATFORM_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  LinkedIn: { bg: "rgba(59,130,246,0.2)", border: "rgba(59,130,246,0.5)", text: "#93c5fd", dot: "#3b82f6" },
  Instagram: { bg: "rgba(236,72,153,0.2)", border: "rgba(236,72,153,0.5)", text: "#f9a8d4", dot: "#ec4899" },
  "Twitter/X": { bg: "rgba(16,185,129,0.2)", border: "rgba(16,185,129,0.5)", text: "#6ee7b7", dot: "#10b981" },
  Facebook: { bg: "rgba(59,130,246,0.2)", border: "rgba(59,130,246,0.5)", text: "#93c5fd", dot: "#3b82f6" },
  General: { bg: "rgba(124,58,237,0.2)", border: "rgba(124,58,237,0.5)", text: "#a78bfa", dot: "#7c3aed" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "rgba(107,114,128,0.2)", text: "#9ca3af", label: "📝 Draft" },
  scheduled: { bg: "rgba(245,158,11,0.2)", text: "#fcd34d", label: "⏰ Scheduled" },
  posted: { bg: "rgba(16,185,129,0.2)", text: "#6ee7b7", label: "✅ Posted" },
};

interface Post {
  id: string;
  date: string; // YYYY-MM-DD
  platform: string;
  time: string;
  content: string;
  hashtags: string;
  status: "draft" | "scheduled" | "posted";
  type: string;
  createdAt: string;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function ContentPlanner() {
  const router = useRouter();
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // New post form
  const [newPost, setNewPost] = useState({
    date: new Date().toISOString().split("T")[0],
    platform: "Instagram",
    time: "9:00 AM",
    content: "",
    hashtags: "",
    status: "draft" as const,
    type: "Post",
  });

  useEffect(() => {
    // Load posts from localStorage
    const saved = localStorage.getItem("contentPlannerPosts");
    if (saved) {
      setPosts(JSON.parse(saved));
    }
  }, []);

  function savePosts(updated: Post[]) {
    localStorage.setItem("contentPlannerPosts", JSON.stringify(updated));
    setPosts(updated);
  }

  function addPost() {
    if (!newPost.content.trim()) return;
    const post: Post = {
      id: Date.now().toString(),
      ...newPost,
      createdAt: new Date().toISOString(),
    };
    savePosts([...posts, post]);
    setShowAddModal(false);
    setNewPost({ date: new Date().toISOString().split("T")[0], platform: "Instagram", time: "9:00 AM", content: "", hashtags: "", status: "draft", type: "Post" });
  }

  function updateStatus(id: string, status: Post["status"]) {
    savePosts(posts.map(p => p.id === id ? { ...p, status } : p));
    if (selectedPost?.id === id) setSelectedPost(prev => prev ? { ...prev, status } : null);
  }

  function deletePost(id: string) {
    savePosts(posts.filter(p => p.id !== id));
    setSelectedPost(null);
  }

  function copyPost(post: Post) {
    navigator.clipboard.writeText(`${post.content}\n\n${post.hashtags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  function getPostsForDate(dateStr: string) {
    return posts.filter(p => p.date === dateStr &&
      (filterPlatform === "All" || p.platform === filterPlatform) &&
      (filterStatus === "All" || p.status === filterStatus)
    );
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }

  // Stats
  const totalPosts = posts.length;
  const postedCount = posts.filter(p => p.status === "posted").length;
  const scheduledCount = posts.filter(p => p.status === "scheduled").length;
  const draftCount = posts.filter(p => p.status === "draft").length;

  const filteredPosts = posts
    .filter(p => (filterPlatform === "All" || p.platform === filterPlatform) && (filterStatus === "All" || p.status === filterStatus))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-30 sticky top-0 z-30"
        style={{ background: "rgba(10,5,20,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-xl">🗓️</span>
          <span className="font-bold text-white">Content Planner</span>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setView("calendar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "calendar" ? "text-white" : "text-gray-600"}`}
              style={{ background: view === "calendar" ? "rgba(124,58,237,0.4)" : "transparent" }}>
              🗓️ Calendar
            </button>
            <button onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "list" ? "text-white" : "text-gray-600"}`}
              style={{ background: view === "list" ? "rgba(124,58,237,0.4)" : "transparent" }}>
              📋 List
            </button>
          </div>
          <button onClick={() => { setSelectedDate(today); setNewPost(p => ({ ...p, date: today })); setShowAddModal(true); }}
            className="text-white font-bold px-4 py-2 rounded-xl text-sm transition-all hover:scale-105 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            ➕ Add Post
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Posts", value: totalPosts, icon: "📝", color: "#a78bfa" },
            { label: "Posted", value: postedCount, icon: "✅", color: "#6ee7b7" },
            { label: "Scheduled", value: scheduledCount, icon: "⏰", color: "#fcd34d" },
            { label: "Drafts", value: draftCount, icon: "📄", color: "#9ca3af" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4 border border-purple-900 border-opacity-20 text-center"
              style={{ background: "rgba(26,5,51,0.4)" }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-gray-600 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex gap-2">
            <span className="text-gray-500 text-xs self-center">Platform:</span>
            {["All", "Instagram", "LinkedIn", "Twitter/X", "Facebook"].map(p => (
              <button key={p} onClick={() => setFilterPlatform(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterPlatform === p ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                style={{ background: filterPlatform === p ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.04)", border: `1px solid ${filterPlatform === p ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.06)"}` }}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-4">
            <span className="text-gray-500 text-xs self-center">Status:</span>
            {["All", "draft", "scheduled", "posted"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus === s ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                style={{ background: filterStatus === s ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.04)", border: `1px solid ${filterStatus === s ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.06)"}` }}>
                {s === "All" ? "All" : STATUS_STYLES[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {view === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)" }}>
                {/* Month nav */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-20">
                  <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="text-gray-400 hover:text-white transition-colors text-xl px-2">‹</button>
                  <h2 className="text-white font-black text-lg">{MONTHS[month]} {year}</h2>
                  <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    className="text-gray-400 hover:text-white transition-colors text-xl px-2">›</button>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 border-b border-purple-900 border-opacity-10">
                  {DAYS_OF_WEEK.map(d => (
                    <div key={d} className="py-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 border-b border-r border-purple-900 border-opacity-10" style={{ background: "rgba(0,0,0,0.1)" }} />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayPosts = getPostsForDate(dateStr);
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;

                    return (
                      <div key={day}
                        className={`h-24 border-b border-r border-purple-900 border-opacity-10 p-1 cursor-pointer transition-all hover:bg-purple-900 hover:bg-opacity-20 ${isSelected ? "bg-purple-900 bg-opacity-30" : ""}`}
                        onClick={() => { setSelectedDate(dateStr); setNewPost(p => ({ ...p, date: dateStr })); }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-purple-600 text-white" : "text-gray-400"}`}>
                            {day}
                          </span>
                          {dayPosts.length > 0 && (
                            <span className="text-xs text-purple-400 font-bold">{dayPosts.length}</span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {dayPosts.slice(0, 2).map((post) => {
                            const color = PLATFORM_COLORS[post.platform] || PLATFORM_COLORS.General;
                            return (
                              <div key={post.id}
                                className="text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                                style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                                onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}>
                                {post.platform.charAt(0)} • {post.time}
                              </div>
                            );
                          })}
                          {dayPosts.length > 2 && (
                            <div className="text-xs text-gray-600 pl-1">+{dayPosts.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected date posts */}
              {selectedDate && (
                <div className="mt-4 rounded-2xl p-4 border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-bold text-sm">{formatDate(selectedDate)}</p>
                    <button onClick={() => { setNewPost(p => ({ ...p, date: selectedDate })); setShowAddModal(true); }}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                      ➕ Add Post
                    </button>
                  </div>
                  {getPostsForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-4">No posts for this day. Click "Add Post" to schedule one!</p>
                  ) : (
                    <div className="space-y-2">
                      {getPostsForDate(selectedDate).map((post) => {
                        const color = PLATFORM_COLORS[post.platform] || PLATFORM_COLORS.General;
                        const statusStyle = STATUS_STYLES[post.status];
                        return (
                          <div key={post.id} className="rounded-xl p-3 cursor-pointer hover:opacity-90 transition-all"
                            style={{ background: color.bg, border: `1px solid ${color.border}` }}
                            onClick={() => setSelectedPost(post)}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold" style={{ color: color.text }}>{post.platform}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-xs text-gray-400">{post.time}</span>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                                {statusStyle.label}
                              </span>
                            </div>
                            <p className="text-gray-300 text-xs truncate">{post.content.slice(0, 80)}...</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right panel — Post detail */}
            <div>
              {selectedPost ? (
                <div className="rounded-2xl border border-purple-900 border-opacity-20 overflow-hidden sticky top-24" style={{ background: "rgba(26,5,51,0.4)" }}>
                  {/* Post header */}
                  <div className="p-4 border-b border-purple-900 border-opacity-20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ background: (PLATFORM_COLORS[selectedPost.platform] || PLATFORM_COLORS.General).bg, color: (PLATFORM_COLORS[selectedPost.platform] || PLATFORM_COLORS.General).text }}>
                        {selectedPost.platform}
                      </span>
                      <button onClick={() => setSelectedPost(null)} className="text-gray-600 hover:text-white text-sm">✕</button>
                    </div>
                    <p className="text-white font-bold text-sm">{formatDate(selectedPost.date)}</p>
                    <p className="text-gray-500 text-xs mt-0.5">⏰ {selectedPost.time} • {selectedPost.type}</p>
                  </div>

                  {/* Status changer */}
                  <div className="p-4 border-b border-purple-900 border-opacity-20">
                    <p className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">Status</p>
                    <div className="flex gap-2">
                      {(["draft", "scheduled", "posted"] as const).map(s => (
                        <button key={s} onClick={() => updateStatus(selectedPost.id, s)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedPost.status === s ? "scale-105" : "opacity-50 hover:opacity-80"}`}
                          style={{ background: STATUS_STYLES[s].bg, color: STATUS_STYLES[s].text, border: `1px solid ${selectedPost.status === s ? STATUS_STYLES[s].text + "60" : "transparent"}` }}>
                          {STATUS_STYLES[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 border-b border-purple-900 border-opacity-20">
                    <p className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">Content</p>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>

                  {/* Hashtags */}
                  {selectedPost.hashtags && (
                    <div className="p-4 border-b border-purple-900 border-opacity-20">
                      <p className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">Hashtags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPost.hashtags.split(/\s+/).filter(h => h.startsWith("#")).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 space-y-2">
                    <button onClick={() => copyPost(selectedPost)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                      {copied ? "✅ Copied!" : "📋 Copy Post"}
                    </button>
                    <button onClick={() => deletePost(selectedPost.id)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-red-400 transition-all hover:scale-105 border border-red-900 hover:border-red-600">
                      🗑 Delete Post
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-8 text-center border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)" }}>
                  <div className="text-5xl mb-4">🗓️</div>
                  <p className="text-gray-500 text-sm">Click any post on the calendar to view details</p>
                  <p className="text-gray-700 text-xs mt-2">Or click a date to add a new post</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-gray-500">No posts yet</p>
                <button onClick={() => setShowAddModal(true)}
                  className="mt-4 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  ➕ Add Your First Post
                </button>
              </div>
            ) : filteredPosts.map((post) => {
              const color = PLATFORM_COLORS[post.platform] || PLATFORM_COLORS.General;
              const statusStyle = STATUS_STYLES[post.status];
              return (
                <div key={post.id} className="rounded-2xl p-4 border transition-all hover:scale-[1.01] cursor-pointer"
                  style={{ background: "rgba(26,5,51,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onClick={() => setSelectedPost(post)}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: color.bg, border: `1px solid ${color.border}` }}>
                      <span className="text-xs font-bold" style={{ color: color.text }}>
                        {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg font-black" style={{ color: color.text }}>
                        {new Date(post.date + "T00:00:00").getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color.bg, color: color.text }}>{post.platform}</span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-400 text-xs">⏰ {post.time}</span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-500 text-xs">{post.type}</span>
                      </div>
                      <p className="text-gray-300 text-sm truncate">{post.content.slice(0, 100)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                        {statusStyle.label}
                      </span>
                      <div className="flex gap-1">
                        {(["draft", "scheduled", "posted"] as const).map(s => (
                          <button key={s} onClick={(e) => { e.stopPropagation(); updateStatus(post.id, s); }}
                            className={`w-2 h-2 rounded-full transition-all ${post.status === s ? "scale-150" : "opacity-30 hover:opacity-60"}`}
                            style={{ background: STATUS_STYLES[s].text }} title={s} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
          <div className="rounded-2xl w-full max-w-lg border border-purple-900 border-opacity-40 overflow-hidden" style={{ background: "rgba(15,5,30,0.98)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-20">
              <h3 className="text-white font-bold">➕ Add New Post</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-purple-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Platform</label>
                  <select value={newPost.platform} onChange={(e) => setNewPost(p => ({ ...p, platform: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
                    {Object.keys(PLATFORM_COLORS).filter(p => p !== "General").map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-purple-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Date</label>
                  <input type="date" value={newPost.date} onChange={(e) => setNewPost(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                    style={{ colorScheme: "dark" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-purple-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Time</label>
                  <select value={newPost.time} onChange={(e) => setNewPost(p => ({ ...p, time: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
                    {["6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-purple-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Status</label>
                  <select value={newPost.status} onChange={(e) => setNewPost(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
                    <option value="draft">📝 Draft</option>
                    <option value="scheduled">⏰ Scheduled</option>
                    <option value="posted">✅ Posted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-purple-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Post Content</label>
                <textarea value={newPost.content} onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))}
                  rows={4} placeholder="Write your post content here..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none" />
              </div>

              <div>
                <label className="text-purple-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Hashtags (optional)</label>
                <input type="text" value={newPost.hashtags} onChange={(e) => setNewPost(p => ({ ...p, hashtags: e.target.value }))}
                  placeholder="#brand #marketing #growth"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 border border-gray-700 hover:border-gray-500 transition-all">
                  Cancel
                </button>
                <button onClick={addPost} disabled={!newPost.content.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  ➕ Add Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post detail modal for mobile */}
      {selectedPost && view === "list" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
          <div className="rounded-2xl w-full max-w-lg border border-purple-900 border-opacity-40 overflow-hidden" style={{ background: "rgba(15,5,30,0.98)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-20">
              <div>
                <p className="text-white font-bold">{selectedPost.platform} • {selectedPost.time}</p>
                <p className="text-gray-500 text-xs">{formatDate(selectedPost.date)}</p>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">Status</p>
                <div className="flex gap-2">
                  {(["draft", "scheduled", "posted"] as const).map(s => (
                    <button key={s} onClick={() => updateStatus(selectedPost.id, s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedPost.status === s ? "scale-105" : "opacity-50"}`}
                      style={{ background: STATUS_STYLES[s].bg, color: STATUS_STYLES[s].text }}>
                      {STATUS_STYLES[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">Content</p>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              {selectedPost.hashtags && (
                <div>
                  <p className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">Hashtags</p>
                  <p className="text-purple-400 text-xs">{selectedPost.hashtags}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => copyPost(selectedPost)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  {copied ? "✅ Copied!" : "📋 Copy Post"}
                </button>
                <button onClick={() => deletePost(selectedPost.id)}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-red-400 border border-red-900">
                  🗑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}