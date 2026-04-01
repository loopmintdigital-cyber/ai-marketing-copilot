"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const FIELDS = [
  { key: "productName", label: "Product Name", placeholder: "e.g. Augive", icon: "🏷️" },
  { key: "description", label: "Product Description", placeholder: "e.g. A fashion brand for bold people", icon: "📝" },
  { key: "targetCustomer", label: "Target Customer", placeholder: "e.g. Ages 19+, fashion lovers", icon: "🎯" },
  { key: "competitors", label: "Top Competitors", placeholder: "e.g. Zara, H&M, Westside", icon: "⚔️" },
  { key: "differentiator", label: "What Makes You Different", placeholder: "e.g. Premium quality at affordable prices", icon: "✨" },
  { key: "brandVoice", label: "Brand Voice", placeholder: "e.g. Bold, Unapologetic, Empowering", icon: "🎤" },
];

export default function BrandProfile() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brandStrategy, setBrandStrategy] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "strategy">("profile");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/sign-in"); return; }
    const meta = user.publicMetadata as { answers?: Record<string, string>; brandStrategy?: string };
    if (meta?.answers) setAnswers(meta.answers);
    if (meta?.brandStrategy) setBrandStrategy(meta.brandStrategy);
    const localAnswers = localStorage.getItem("answers");
    const localStrategy = localStorage.getItem("brandStrategy");
    if (localAnswers) setAnswers(JSON.parse(localAnswers));
    if (localStrategy) setBrandStrategy(localStrategy);
  }, [isLoaded, user]);

  async function handleSave() {
    setSaving(true);
    localStorage.setItem("answers", JSON.stringify(answers));
    await fetch("/api/save-onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, brandStrategy }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    const res = await fetch("/api/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    const data = await res.json();
    setBrandStrategy(data.result);
    localStorage.setItem("brandStrategy", data.result);
    await fetch("/api/save-onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, brandStrategy: data.result }),
    });
    setRegenerating(false);
  }

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="text-purple-400 animate-pulse">Loading...</div>
    </div>
  );

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-30 sticky top-0 z-30" style={{ background: "rgba(10,5,20,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-xl">🧠</span>
          <span className="font-bold text-white">Brand Profile</span>
          <span className="text-gray-600 text-sm">— {answers.productName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRegenerate} disabled={regenerating}
            className="text-gray-300 font-medium px-4 py-2 rounded-xl text-sm border border-gray-700 hover:border-purple-500 transition-all disabled:opacity-40">
            {regenerating ? "🔄 Regenerating..." : "🔄 Regenerate Strategy"}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="text-white font-bold px-5 py-2 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "profile", label: "Brand Profile", icon: "🏷️" },
            { id: "strategy", label: "Brand Strategy", icon: "🧠" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as "profile" | "strategy")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
              style={{ background: activeTab === tab.id ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeTab === tab.id ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.05)"}` }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" ? (
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-black mb-1">Your Brand Profile</h2>
              <p className="text-gray-500 text-sm">This data powers all your AI-generated content. Keep it accurate for best results.</p>
            </div>

            {FIELDS.map((field) => (
              <div key={field.key} className="rounded-2xl p-6 border border-purple-900 border-opacity-20 transition-all"
                style={{ background: "rgba(26,5,51,0.4)", backdropFilter: "blur(10px)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{field.icon}</span>
                      <label className="text-purple-400 text-xs font-bold uppercase tracking-wider">{field.label}</label>
                    </div>
                    {editing === field.key ? (
                      <input
                        autoFocus
                        value={answers[field.key] || ""}
                        onChange={(e) => setAnswers({ ...answers, [field.key]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") setEditing(null); if (e.key === "Escape") setEditing(null); }}
                        placeholder={field.placeholder}
                        className="w-full bg-transparent text-white text-lg font-medium focus:outline-none border-b border-purple-500 pb-1"
                      />
                    ) : (
                      <p className="text-white text-lg font-medium">
                        {answers[field.key] || <span className="text-gray-600 font-normal">{field.placeholder}</span>}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setEditing(editing === field.key ? null : field.key)}
                    className="text-gray-600 hover:text-purple-400 text-sm transition-colors flex-shrink-0 mt-1">
                    {editing === field.key ? "✓ Done" : "✏️ Edit"}
                  </button>
                </div>
              </div>
            ))}

            <button onClick={handleSave} disabled={saving}
              className="w-full text-white font-black py-4 rounded-2xl text-lg transition-all hover:scale-105 disabled:opacity-40 mt-6"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}>
              {saving ? "Saving..." : saved ? "✅ Saved!" : "💾 Save All Changes"}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black mb-1">Brand Strategy</h2>
                <p className="text-gray-500 text-sm">AI-generated strategy based on your brand profile.</p>
              </div>
              <button onClick={handleRegenerate} disabled={regenerating}
                className="text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                {regenerating ? "🔄 Regenerating..." : "🔄 Regenerate"}
              </button>
            </div>

            {brandStrategy ? (
              <div className="rounded-2xl p-8 border border-purple-900 border-opacity-20" style={{ background: "rgba(26,5,51,0.4)", backdropFilter: "blur(10px)" }}>
                <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                  {brandStrategy}
                </pre>
              </div>
            ) : (
              <div className="rounded-2xl p-12 border border-purple-900 border-opacity-20 text-center" style={{ background: "rgba(26,5,51,0.4)" }}>
                <div className="text-5xl mb-4">🧠</div>
                <p className="text-gray-500 mb-4">No brand strategy yet</p>
                <button onClick={handleRegenerate} disabled={regenerating}
                  className="text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  Generate Brand Strategy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
