"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function WebsiteBuilder() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brandStrategy, setBrandStrategy] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [style, setStyle] = useState("modern");
  const [pages, setPages] = useState("landing");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("answers");
    const strategy = localStorage.getItem("brandStrategy");
    if (!saved) { router.push("/onboarding"); return; }
    setAnswers(JSON.parse(saved));
    setBrandStrategy(strategy || "");
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleGenerate() {
    setLoading(true);
    setGeneratedHTML("");
    setChatMessages([]);
    try {
      const res = await fetch("/api/website-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, brandStrategy, style, pages }),
      });
      const data = await res.json();
      setGeneratedHTML(data.result);
      setChatMessages([{
        role: "assistant",
        content: `✅ Your website is ready! You can now edit it by telling me what to change.\n\nTry saying:\n• "Make the headline bigger"\n• "Change to dark theme"\n• "Add a pricing section"\n• "Make the button red"`
      }]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleChatEdit() {
    if (!chatInput.trim() || chatLoading || !generatedHTML) return;
    const userMessage = chatInput.trim();
    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: userMessage }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/website-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentHTML: generatedHTML,
          editRequest: userMessage,
          answers,
          chatHistory: newMessages,
        }),
      });
      const data = await res.json();
      if (data.html) {
        setGeneratedHTML(data.html);
        setChatMessages([...newMessages, { role: "assistant", content: data.message || "✅ Done! I've updated your website." }]);
      } else {
        setChatMessages([...newMessages, { role: "assistant", content: data.message || "I couldn't make that change. Try describing it differently." }]);
      }
    } catch (e) {
      setChatMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setChatLoading(false);
  }

  function downloadHTML() {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${answers.productName || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const QUICK_EDITS = [
    "Make it dark theme",
    "Make headline bigger",
    "Add pricing section",
    "Change CTA button color to red",
    "Add testimonials section",
    "Make it more minimal",
    "Add FAQ section",
    "Make fonts bolder",
  ];

  return (
    <main className="min-h-screen text-white flex flex-col" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)", height: "100vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-30 flex-shrink-0" style={{ background: "rgba(10,5,20,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-xl">🌐</span>
          <span className="font-bold text-white">Website Builder</span>
          <span className="text-gray-600 text-sm">— {answers.productName}</span>
        </div>
        {generatedHTML && (
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl overflow-hidden border border-purple-900 border-opacity-30">
              <button onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === "preview" ? "text-white" : "text-gray-500"}`}
                style={{ background: activeTab === "preview" ? "rgba(124,58,237,0.4)" : "transparent" }}>
                👁 Preview
              </button>
              <button onClick={() => setActiveTab("code")}
                className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === "code" ? "text-white" : "text-gray-500"}`}
                style={{ background: activeTab === "code" ? "rgba(124,58,237,0.4)" : "transparent" }}>
                {"</>"} Code
              </button>
            </div>
            <button onClick={downloadHTML}
              className="text-white font-bold px-5 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              ⬇ Download
            </button>
            <button onClick={handleGenerate}
              className="text-gray-300 font-medium px-4 py-2 rounded-xl text-sm border border-gray-700 hover:border-purple-500 transition-all">
              🔄 Regenerate
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">🌐</div>
            <div className="text-white font-black text-2xl mb-3">Building Your Website...</div>
            <div className="text-gray-400 text-sm mb-6">AI is writing all the code for {answers.productName}</div>
            <div className="flex gap-2 justify-center flex-wrap">
              {["Writing HTML", "Styling CSS", "Adding Copy", "Making it ✨"].map((step, i) => (
                <div key={step} className="text-xs px-3 py-1.5 rounded-full font-medium animate-pulse"
                  style={{ background: "rgba(124,58,237,0.2)", color: "#c084fc", animationDelay: `${i * 300}ms` }}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!generatedHTML && !loading ? (
        /* Setup Form */
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">🌐</div>
              <h1 className="text-4xl font-black mb-3">Build Your Website</h1>
              <p className="text-gray-400 text-lg">AI generates a complete branded website for <span className="text-purple-400">{answers.productName}</span> in seconds</p>
            </div>

            <div className="space-y-6 rounded-2xl p-8 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.5)", backdropFilter: "blur(10px)" }}>
              <div>
                <label className="text-sm text-purple-400 mb-3 block font-medium uppercase tracking-wider">Website Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "modern", label: "Modern", emoji: "⚡", desc: "Clean & minimal" },
                    { id: "bold", label: "Bold", emoji: "🔥", desc: "Dark & dramatic" },
                    { id: "professional", label: "Professional", emoji: "💼", desc: "Corporate & clean" },
                  ].map((s) => (
                    <button key={s.id} onClick={() => setStyle(s.id)}
                      className={`p-4 rounded-xl border transition-all text-left ${style === s.id ? "border-purple-500 bg-purple-900 bg-opacity-30" : "border-gray-800 hover:border-gray-600"}`}>
                      <div className="text-2xl mb-2">{s.emoji}</div>
                      <div className="font-bold text-sm text-white">{s.label}</div>
                      <div className="text-gray-500 text-xs">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-purple-400 mb-3 block font-medium uppercase tracking-wider">Page Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "landing", label: "Landing Page", emoji: "🚀", desc: "Hero + features + CTA" },
                    { id: "saas", label: "SaaS Page", emoji: "💻", desc: "Pricing + features + FAQ" },
                    { id: "agency", label: "Agency Page", emoji: "🎯", desc: "Services + portfolio + CTA" },
                    { id: "ecommerce", label: "Product Page", emoji: "🛍️", desc: "Product showcase + buy" },
                  ].map((p) => (
                    <button key={p.id} onClick={() => setPages(p.id)}
                      className={`p-4 rounded-xl border transition-all text-left ${pages === p.id ? "border-purple-500 bg-purple-900 bg-opacity-30" : "border-gray-800 hover:border-gray-600"}`}>
                      <div className="text-2xl mb-2">{p.emoji}</div>
                      <div className="font-bold text-sm text-white">{p.label}</div>
                      <div className="text-gray-500 text-xs">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={loading}
                className="w-full text-white font-black py-5 rounded-2xl text-lg transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
                🌐 Generate My Website →
              </button>
            </div>
          </div>
        </div>
      ) : generatedHTML && (
        /* Split view — Preview + Chat */
        <div className="flex-1 flex overflow-hidden">
          {/* Website Preview */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "preview" ? (
              <iframe
                key={generatedHTML}
                srcDoc={generatedHTML}
                className="w-full h-full border-0"
                title="Website Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="h-full overflow-auto p-6" style={{ background: "#0d0d0d" }}>
                <pre className="text-green-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">{generatedHTML}</pre>
              </div>
            )}
          </div>

          {/* Edit Chat Panel */}
          <div className="w-80 flex flex-col border-l border-purple-900 border-opacity-30 flex-shrink-0" style={{ background: "rgba(10,5,20,0.95)", backdropFilter: "blur(20px)" }}>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-purple-900 border-opacity-20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-bold text-white text-sm">AI Editor</span>
              </div>
              <p className="text-gray-600 text-xs mt-0.5">Tell me what to change</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user" ? "text-white rounded-tr-sm" : "text-gray-300 rounded-tl-sm"
                  }`} style={msg.role === "user"
                    ? { background: "linear-gradient(135deg, #7c3aed, #ec4899)" }
                    : { background: "rgba(26,5,51,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3 py-2.5" style={{ background: "rgba(26,5,51,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <div className="flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick edits */}
            <div className="px-4 py-2 border-t border-purple-900 border-opacity-20">
              <p className="text-gray-600 text-xs mb-2 font-medium">Quick edits:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_EDITS.map((edit) => (
                  <button key={edit} onClick={() => setChatInput(edit)}
                    className="text-xs px-2.5 py-1 rounded-lg transition-all hover:scale-105 font-medium"
                    style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#c084fc" }}>
                    {edit}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-purple-900 border-opacity-20">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleChatEdit(); }}
                  placeholder="e.g. Make it dark theme..."
                  className="flex-1 bg-transparent text-white text-xs placeholder-gray-600 focus:outline-none rounded-xl px-3 py-2.5 border border-gray-700 focus:border-purple-500 transition-colors"
                />
                <button onClick={handleChatEdit} disabled={!chatInput.trim() || chatLoading}
                  className="text-white font-bold px-3 py-2.5 rounded-xl text-xs transition-all hover:scale-105 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
