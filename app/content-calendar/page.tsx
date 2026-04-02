"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ContentItem = {
  id: string;
  module: string;
  inputs: Record<string, string>;
  result: string;
  created_at: string;
};

const MODULE_COLORS: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  social: { bg: "rgba(59,130,246,0.15)", text: "#93c5fd", border: "rgba(59,130,246,0.3)", emoji: "📱" },
  email: { bg: "rgba(16,185,129,0.15)", text: "#6ee7b7", border: "rgba(16,185,129,0.3)", emoji: "📧" },
  ads: { bg: "rgba(245,158,11,0.15)", text: "#fcd34d", border: "rgba(245,158,11,0.3)", emoji: "🎯" },
  content: { bg: "rgba(236,72,153,0.15)", text: "#f9a8d4", border: "rgba(236,72,153,0.3)", emoji: "✍️" },
  seo: { bg: "rgba(249,115,22,0.15)", text: "#fdba74", border: "rgba(249,115,22,0.3)", emoji: "🔍" },
  brand: { bg: "rgba(124,58,237,0.15)", text: "#c4b5fd", border: "rgba(124,58,237,0.3)", emoji: "🧠" },
};

export default function ContentCalendar() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchContent();
  }, [isLoaded, user]);

  async function fetchContent(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const { data, error } = await supabase
      .from("content_history")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) setContent(data);
    setLoading(false);
    setRefreshing(false);
  }

  async function deleteItem(id: string) {
    await supabase.from("content_history").delete().eq("id", id);
    setContent(content.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function copyContent() {
    if (!selected) return;
    navigator.clipboard.writeText(selected.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filtered = filter === "all" ? content : content.filter(c => c.module === filter);
  const modules = ["all", ...Array.from(new Set(content.map(c => c.module)))];

  const groupedByDate = filtered.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="text-purple-400 animate-pulse">Loading...</div>
    </div>
  );

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-30 flex-shrink-0" style={{ background: "rgba(10,5,20,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-xl">📅</span>
          <span className="font-bold text-white">Content Calendar</span>
          <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "rgba(124,58,237,0.2)", color: "#c084fc" }}>
            {content.length} items
          </span>
        </div>

        {/* ✅ ANIMATED REFRESH BUTTON */}
        <button
          onClick={() => fetchContent(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors disabled:opacity-60"
        >
          {refreshing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="animate-pulse text-purple-400">Refreshing</span>
            </>
          ) : "🔄 Refresh"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-6 py-4 border-b border-purple-900 border-opacity-20 flex-shrink-0 overflow-x-auto" style={{ background: "rgba(10,5,20,0.5)" }}>
        {modules.map((mod) => {
          const color = MODULE_COLORS[mod];
          return (
            <button key={mod} onClick={() => setFilter(mod)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap flex-shrink-0 ${filter === mod ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
              style={{
                background: filter === mod ? (color?.bg || "rgba(124,58,237,0.2)") : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter === mod ? (color?.border || "rgba(124,58,237,0.3)") : "rgba(255,255,255,0.05)"}`,
                color: filter === mod ? (color?.text || "#c084fc") : undefined,
              }}>
              {color?.emoji || "📋"} {mod === "all" ? "All Content" : mod}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Content List */}
        <div className="w-96 flex-shrink-0 overflow-y-auto border-r border-purple-900 border-opacity-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              {/* ✅ ANIMATED LOADING STATE */}
              <span className="flex items-center gap-3 text-purple-300 text-sm">
                <svg className="animate-spin h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="animate-pulse">Loading content</span>
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 px-6 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500 text-sm">No content yet</p>
              <p className="text-gray-700 text-xs mt-1">Generate content from any module</p>
              <button onClick={() => router.push("/dashboard")}
                className="mt-4 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="divide-y divide-purple-900 divide-opacity-20">
              {Object.entries(groupedByDate).map(([date, items]) => (
                <div key={date}>
                  <div className="px-4 py-2 sticky top-0" style={{ background: "rgba(10,5,20,0.9)" }}>
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{date}</p>
                  </div>
                  {items.map((item) => {
                    const color = MODULE_COLORS[item.module] || MODULE_COLORS.brand;
                    return (
                      <button key={item.id} onClick={() => setSelected(item)}
                        className={`w-full text-left px-4 py-4 transition-all hover:bg-purple-900 hover:bg-opacity-10 ${selected?.id === item.id ? "bg-purple-900 bg-opacity-20 border-l-2 border-purple-500" : ""}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{color.emoji}</span>
                          <span className="text-xs font-bold capitalize px-2 py-0.5 rounded-full" style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                            {item.module}
                          </span>
                          <span className="text-gray-700 text-xs ml-auto">
                            {new Date(item.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{item.result.slice(0, 100)}...</p>
                        {item.inputs && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {Object.entries(item.inputs).slice(0, 2).map(([k, v]) => v && (
                              <span key={k} className="text-xs text-gray-700 bg-gray-900 px-2 py-0.5 rounded-full">{v}</span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-20 flex-shrink-0" style={{ background: "rgba(10,5,20,0.5)" }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{MODULE_COLORS[selected.module]?.emoji || "📋"}</span>
                  <div>
                    <span className="font-bold text-white capitalize">{selected.module}</span>
                    <p className="text-gray-600 text-xs">{new Date(selected.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyContent}
                    className="text-white font-bold px-4 py-2 rounded-xl text-xs transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                    {copied ? "✅ Copied!" : "📋 Copy"}
                  </button>
                  <button onClick={() => deleteItem(selected.id)}
                    className="text-red-400 hover:text-red-300 font-medium px-4 py-2 rounded-xl text-xs border border-red-900 hover:border-red-700 transition-all">
                    🗑 Delete
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">{selected.result}</pre>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-black mb-2 text-white">Content Calendar</h3>
              <p className="text-gray-500 text-sm max-w-xs">Select any content from the left to preview it here. All your generated content is saved automatically.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}