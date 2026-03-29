"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string; html?: string; isWebsite?: boolean };

const SUGGESTIONS = [
  "Write a LinkedIn post about our product",
  "Create 5 email subject lines",
  "Write a Google ad for our homepage",
  "Build me a landing page website",
  "Write a hero headline for our landing page",
  "Create a cold outreach email",
  "Write 3 Twitter/X threads",
  "Give me 10 blog topic ideas",
];

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brandStrategy, setBrandStrategy] = useState("");
  const [previewHTML, setPreviewHTML] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("answers");
    const strategy = localStorage.getItem("brandStrategy");
    if (!saved) { router.push("/onboarding"); return; }
    const parsedAnswers = JSON.parse(saved);
    setAnswers(parsedAnswers);
    setBrandStrategy(strategy || "");
    setMessages([{
      role: "assistant",
      content: `Hey! I'm your AI marketing expert for ${parsedAnswers.productName}. I know your brand inside out.\n\nI can write social posts, emails, ads, blog articles, landing page copy — and even BUILD you a complete website! Just ask.\n\nWhat would you like to create today?`
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })), brandStrategy, answers }),
    });
    const data = await res.json();
    
    const assistantMessage: Message = {
      role: "assistant",
      content: data.result,
      html: data.html,
      isWebsite: data.isWebsite,
    };
    
    setMessages([...newMessages, assistantMessage]);
    if (data.isWebsite && data.html) {
      setPreviewHTML(data.html);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content);
  }

  function downloadHTML(html: string) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${answers.productName || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen text-white flex flex-col" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)", height: "100vh" }}>
      
      {/* Website Preview Modal */}
      {showPreview && previewHTML && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.95)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <span className="font-bold text-white text-lg">🌐 Website Preview — {answers.productName}</span>
            <div className="flex gap-3">
              <button onClick={() => downloadHTML(previewHTML)}
                className="text-white font-bold px-5 py-2 rounded-xl text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                ⬇ Download HTML
              </button>
              <button onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white px-4 py-2 rounded-xl border border-gray-700 text-sm">
                ✕ Close
              </button>
            </div>
          </div>
          <iframe
            srcDoc={previewHTML}
            className="flex-1 border-0 bg-white"
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900 border-opacity-30" style={{ background: "rgba(10,5,20,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-bold text-white">AI Marketing Chat</span>
          </div>
          <span className="text-gray-600 text-sm">— {answers.productName}</span>
        </div>
        <div className="flex gap-3">
          {previewHTML && (
            <button onClick={() => setShowPreview(true)}
              className="text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              🌐 View Website
            </button>
          )}
          <button onClick={() => { setMessages([{ role: "assistant", content: `Hey! What would you like to create for ${answers.productName} today?` }]); setPreviewHTML(""); }}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors px-3 py-1.5 rounded-lg border border-gray-800">
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 text-sm" style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  🤖
                </div>
              )}
              <div className={`max-w-2xl group relative`}>
                <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  msg.role === "user" ? "text-white rounded-tr-sm" : "text-gray-200 rounded-tl-sm"
                }`} style={msg.role === "user"
                  ? { background: "linear-gradient(135deg, #7c3aed, #ec4899)" }
                  : { background: "rgba(26,5,51,0.6)", border: "1px solid rgba(124,58,237,0.15)", backdropFilter: "blur(10px)" }}>
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                  {msg.isWebsite && msg.html && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-purple-800 border-opacity-30">
                      <button onClick={() => { setPreviewHTML(msg.html!); setShowPreview(true); }}
                        className="text-white font-bold px-4 py-2 rounded-xl text-xs transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                        👁 Preview Website
                      </button>
                      <button onClick={() => downloadHTML(msg.html!)}
                        className="text-purple-300 font-medium px-4 py-2 rounded-xl text-xs border border-purple-700 hover:border-purple-500 transition-all">
                        ⬇ Download HTML
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === "assistant" && !msg.isWebsite && (
                  <button onClick={() => copyMessage(msg.content)}
                    className="absolute -bottom-6 right-0 text-xs text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                    📋 Copy
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 text-sm bg-gray-800">👤</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>🤖</div>
              <div className="rounded-2xl rounded-tl-sm px-5 py-4" style={{ background: "rgba(26,5,51,0.6)", border: "1px solid rgba(124,58,237,0.15)" }}>
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4 max-w-4xl mx-auto w-full">
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => setInput(s)}
                className="text-xs px-3 py-2 rounded-xl transition-all hover:scale-105 font-medium"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#c084fc" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 max-w-4xl mx-auto w-full">
        <div className="flex gap-3 items-end rounded-2xl p-3" style={{ background: "rgba(26,5,51,0.6)", border: "1px solid rgba(124,58,237,0.2)", backdropFilter: "blur(20px)" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask me anything or say "build me a website"...`}
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
            style={{ maxHeight: 120 }}
          />
          <button onClick={handleSend} disabled={!input.trim() || loading}
            className="text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-40 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
            {loading ? "..." : "Send →"}
          </button>
        </div>
        <p className="text-center text-gray-700 text-xs mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </main>
  );
}
