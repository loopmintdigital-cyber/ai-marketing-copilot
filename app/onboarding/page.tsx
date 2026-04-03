"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const PALETTES = [
  { id: "royal", name: "Royal Purple", colors: ["#7c3aed", "#a855f7", "#c084fc", "#1a0533"], preview: ["#7c3aed", "#a855f7", "#c084fc"] },
  { id: "ocean", name: "Ocean Blue", colors: ["#1e40af", "#3b82f6", "#93c5fd", "#0c1445"], preview: ["#1e40af", "#3b82f6", "#93c5fd"] },
  { id: "fire", name: "Fire Red", colors: ["#dc2626", "#ef4444", "#fca5a5", "#450a0a"], preview: ["#dc2626", "#ef4444", "#fca5a5"] },
  { id: "forest", name: "Forest Green", colors: ["#15803d", "#22c55e", "#86efac", "#052e16"], preview: ["#15803d", "#22c55e", "#86efac"] },
  { id: "sunset", name: "Sunset Orange", colors: ["#ea580c", "#f97316", "#fdba74", "#431407"], preview: ["#ea580c", "#f97316", "#fdba74"] },
  { id: "rose", name: "Rose Pink", colors: ["#be185d", "#ec4899", "#f9a8d4", "#500724"], preview: ["#be185d", "#ec4899", "#f9a8d4"] },
  { id: "midnight", name: "Midnight Black", colors: ["#111827", "#374151", "#9ca3af", "#000000"], preview: ["#111827", "#374151", "#9ca3af"] },
  { id: "gold", name: "Luxury Gold", colors: ["#b45309", "#f59e0b", "#fde68a", "#451a03"], preview: ["#b45309", "#f59e0b", "#fde68a"] },
  { id: "cyber", name: "Cyber Teal", colors: ["#0f766e", "#14b8a6", "#99f6e4", "#042f2e"], preview: ["#0f766e", "#14b8a6", "#99f6e4"] },
];

const steps = [
  { id: 1, question: "What is your product or business name?", placeholder: "e.g. ShopEasy, DesignPro Agency, CloudSync SaaS", field: "productName" },
  { id: 2, question: "Describe your business in one sentence.", placeholder: "e.g. We help e-commerce stores grow with AI-powered ads", field: "description" },
  { id: 3, question: "Who is your ideal customer?", placeholder: "e.g. Small business owners, D2C brands, startup founders", field: "targetCustomer" },
  { id: 4, question: "Who are your top competitors?", placeholder: "e.g. Shopify, Webflow, Mailchimp, Fiverr, HubSpot", field: "competitors" },
  { id: 5, question: "What makes you stand out from competitors?", placeholder: "e.g. We are 3x cheaper, fully automated, built for non-tech users", field: "differentiator" },
  { id: 6, question: "What brand voice fits your business?", placeholder: "e.g. Bold & energetic, Friendly & approachable, Premium & professional", field: "brandVoice" },
  { id: 7, question: "Choose your brand color palette", placeholder: "", field: "colorPalette" },
];

type Message = { role: "user" | "assistant"; content: string };

export default function Onboarding() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [brandStrategy, setBrandStrategy] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Color palette states
  const [colorTab, setColorTab] = useState<"preset" | "website" | "custom">("preset");
  const [selectedPalette, setSelectedPalette] = useState<string>("");
  const [customColors, setCustomColors] = useState({ primary: "#7c3aed", secondary: "#ec4899", accent: "#3b82f6" });
  const [websiteURL, setWebsiteURL] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [extractError, setExtractError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const meta = user.publicMetadata as { onboardingComplete?: boolean };
      if (meta?.onboardingComplete) router.push("/dashboard");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const step = steps[currentStep];
  const progress = (currentStep / steps.length) * 100;

  function handleNext() {
    if (!input.trim()) return;
    setAnswers({ ...answers, [step.field]: input });
    setInput("");
    setCurrentStep(currentStep + 1);
  }

  // Extract colors from website using Claude API
  async function handleExtractColors() {
    if (!websiteURL.trim()) return;
    setExtracting(true);
    setExtractError("");
    setExtractedColors([]);
    try {
      let url = websiteURL.trim();
      if (!url.startsWith("http")) url = "https://" + url;

      const res = await fetch("/api/extract-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.colors && data.colors.length > 0) {
        setExtractedColors(data.colors);
      } else {
setExtractError(data.error || "Could not extract colors. Try Presets.");      }
        } catch (e) {
      setExtractError("Could not connect. Try Presets or Custom tab.");
    }
    setExtracting(false);
  }

  function getSelectedColors(): string[] {
    if (colorTab === "preset" && selectedPalette) {
      return PALETTES.find(p => p.id === selectedPalette)?.preview || [];
    }
    if (colorTab === "website" && extractedColors.length > 0) {
      return extractedColors.slice(0, 3);
    }
    if (colorTab === "custom") {
      return [customColors.primary, customColors.secondary, customColors.accent];
    }
    return [];
  }

  function canProceed() {
    if (colorTab === "preset") return !!selectedPalette;
    if (colorTab === "website") return extractedColors.length > 0;
    if (colorTab === "custom") return true;
    return false;
  }

  function handlePaletteNext() {
    if (!canProceed()) return;
    setAnswers({ ...answers, colorPalette: JSON.stringify(getSelectedColors()) });
    setCurrentStep(currentStep + 1);
  }

  async function handleGenerate() {
    setLoading(true);
    localStorage.setItem("answers", JSON.stringify(answers));
    const res = await fetch("/api/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    const data = await res.json();
    localStorage.setItem("brandStrategy", data.result);
    await fetch("/api/save-onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, brandStrategy: data.result }),
    });
    setLoading(false);
    router.push("/dashboard");
  }

  async function handleChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput;
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages, brandStrategy, answers }),
    });
    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.result }]);
    setChatLoading(false);
    router.push("/dashboard");
  }

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  function renderContent(content: string) {
    return (
      <div className="space-y-2">
        {content.split('\n').map((line, i) => {
          if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white mt-4">{line.replace('# ', '')}</h1>;
          if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-purple-400 mt-3">{line.replace('## ', '')}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-purple-300 mt-2">{line.replace('### ', '')}</h3>;
          if (line.startsWith('---')) return <hr key={i} className="border-gray-700 my-3" />;
          if (line.trim() === '') return <div key={i} className="h-1" />;
          if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-purple-500 pl-4 text-purple-200 italic my-2">{line.replace('> ', '').replace(/\*/g, '')}</blockquote>;
          return <p key={i} className="text-gray-300">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
        })}
      </div>
    );
  }

  // ✅ COLOR PALETTE STEP
  if (currentStep === 6) {
    const selectedColors = getSelectedColors();
    return (
      <main className="min-h-screen text-white flex flex-col items-center justify-center px-6 py-12"
        style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
        <div className="max-w-2xl w-full">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-10">
            <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-gray-500 text-sm mb-2">Step 7 of 7</p>
          <h2 className="text-3xl font-bold mb-2">🎨 Choose your brand color palette</h2>
          <p className="text-gray-500 mb-6">This will be used across all your generated content, posters & website.</p>

          {/* 3 Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { id: "preset", label: "🎨 Presets", desc: "Pick a palette" },
              { id: "website", label: "🌐 From Website", desc: "Extract from URL" },
              { id: "custom", label: "🖌️ Custom", desc: "Pick your own" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setColorTab(tab.id as any)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${colorTab === tab.id ? "text-white" : "text-gray-600 hover:text-gray-400"}`}
                style={{ background: colorTab === tab.id ? "rgba(124,58,237,0.4)" : "transparent", border: colorTab === tab.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* PRESET TAB */}
          {colorTab === "preset" && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PALETTES.map((palette) => (
                <button key={palette.id} onClick={() => setSelectedPalette(palette.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left hover:scale-105 ${selectedPalette === palette.id ? "border-purple-500 bg-purple-900 bg-opacity-30" : "border-gray-800 hover:border-gray-600"}`}>
                  <div className="flex gap-1.5 mb-3">
                    {palette.preview.map((color, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg shadow-lg flex-1" style={{ background: color }} />
                    ))}
                  </div>
                  <p className="text-white text-sm font-bold">{palette.name}</p>
                  {selectedPalette === palette.id && <p className="text-purple-400 text-xs mt-1">✓ Selected</p>}
                </button>
              ))}
            </div>
          )}

          {/* WEBSITE TAB */}
          {colorTab === "website" && (
            <div className="mb-6 space-y-4">
              <div className="rounded-2xl p-6 border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-white font-bold mb-1">🌐 Extract colors from your website</p>
                <p className="text-gray-500 text-sm mb-4">Paste your website URL and our AI will extract your brand colors automatically.</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={websiteURL}
                    onChange={(e) => setWebsiteURL(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleExtractColors()}
                    placeholder="e.g. apple.com or https://stripe.com"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button onClick={handleExtractColors} disabled={!websiteURL.trim() || extracting}
                    className="relative overflow-hidden bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all whitespace-nowrap">
                    {extracting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="animate-pulse">Reading...</span>
                      </span>
                    ) : "Extract Colors →"}
                  </button>
                </div>

                {extractError && (
                  <p className="text-red-400 text-sm mt-3">⚠️ {extractError}</p>
                )}

                {extractedColors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-green-400 text-sm font-bold mb-3">✅ Colors extracted successfully!</p>
                    <div className="flex gap-2 flex-wrap">
                      {extractedColors.map((color, i) => (
                        <div key={i} className="text-center">
                          <div className="w-14 h-14 rounded-xl shadow-lg mb-1" style={{ background: color }} />
                          <p className="text-gray-600 text-xs font-mono">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-4 border border-gray-800 text-center" style={{ background: "rgba(255,255,255,0.01)" }}>
                <p className="text-gray-600 text-xs">Works with any public website — Shopify stores, landing pages, portfolios, brand sites</p>
              </div>
            </div>
          )}

          {/* CUSTOM TAB */}
          {colorTab === "custom" && (
            <div className="rounded-2xl p-6 border border-purple-900 border-opacity-30 mb-6" style={{ background: "rgba(26,5,51,0.4)" }}>
              <p className="text-white font-bold mb-1">🖌️ Pick your own brand colors</p>
              <p className="text-gray-500 text-sm mb-5">Click any color swatch to open the color picker.</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Primary", key: "primary" },
                  { label: "Secondary", key: "secondary" },
                  { label: "Accent", key: "accent" },
                ].map(({ label, key }) => (
                  <div key={key} className="text-center">
                    <div className="relative mb-2 group">
                      <div className="w-full h-20 rounded-2xl shadow-lg cursor-pointer group-hover:scale-105 transition-all border-2 border-transparent group-hover:border-white group-hover:border-opacity-20"
                        style={{ background: customColors[key as keyof typeof customColors] }} />
                      <input type="color" value={customColors[key as keyof typeof customColors]}
                        onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-2xl" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded-lg">Click to change</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">{label}</p>
                    <p className="text-gray-600 text-xs font-mono">{customColors[key as keyof typeof customColors]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedColors.length > 0 && (
            <div className="rounded-2xl p-4 mb-6 border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Preview</p>
              <div className="flex gap-3 items-center">
                {selectedColors.map((color, i) => (
                  <div key={i} className="flex-1 h-12 rounded-xl shadow-lg" style={{ background: color }} />
                ))}
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: selectedColors[0] }}>{answers.productName}</div>
                  <div className="text-xs text-gray-500">Brand preview</div>
                </div>
              </div>
            </div>
          )}

          <button onClick={handlePaletteNext} disabled={!canProceed()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-purple-900">
            {!canProceed() ? "Select colors to continue" : "Finish →"}
          </button>
        </div>
      </main>
    );
  }

  if (brandStrategy) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col" style={{ height: "100vh" }}>
        <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <h1 className="font-semibold text-white">AI Marketing Co-Pilot</h1>
          <span className="text-gray-500 text-sm">— {answers.productName}</span>
          <button onClick={() => { setBrandStrategy(""); setCurrentStep(0); setAnswers({}); setMessages([]); }}
            className="ml-auto text-gray-500 hover:text-gray-300 text-sm">Start Over</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-200"}`}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-900 rounded-2xl px-5 py-4 text-sm">
                <span className="flex items-center gap-3 text-purple-300">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="animate-pulse">✨ Thinking & Generating</span>
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-gray-800 px-4 py-4 max-w-3xl mx-auto w-full">
          <div className="flex gap-3 mb-3 flex-wrap">
            {["Write a LinkedIn post", "Create ad copy", "Write email subject lines", "Make tagline bolder"].map((s) => (
              <button key={s} onClick={() => setChatInput(s)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">{s}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleChat(); } }}
              placeholder="Ask anything about your brand..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
            <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-xl">Send</button>
          </div>
        </div>
      </main>
    );
  }

  if (currentStep >= steps.length) {
    return (
      <main className="min-h-screen text-white flex flex-col items-center justify-center px-6"
        style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
        <div className="max-w-xl w-full text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-4xl font-bold mb-2">Buckle up, <span className="text-purple-400">{answers.productName}!</span></h2>
          <p className="text-gray-400 mb-8">Our AI just read your answers and is ready to cook 🔥</p>

          {answers.colorPalette && (
            <div className="mb-6 p-4 rounded-2xl border border-purple-900 border-opacity-30" style={{ background: "rgba(26,5,51,0.4)" }}>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Your Brand Colors</p>
              <div className="flex gap-2 justify-center">
                {JSON.parse(answers.colorPalette).map((color: string, i: number) => (
                  <div key={i} className="w-12 h-12 rounded-xl shadow-lg" style={{ background: color }} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-900 bg-opacity-60 border border-gray-700 rounded-2xl p-6 text-left space-y-4 mb-8 backdrop-blur">
            {steps.slice(0, 6).map((s) => (
              <div key={s.field} className="flex gap-3 items-start">
                <span className="text-purple-400 text-lg mt-0.5">→</span>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">{s.question}</p>
                  <p className="text-white font-medium mt-0.5">{answers[s.field]}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full relative overflow-hidden bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-purple-900">
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
            ) : "✨ Generate My Brand Strategy →"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="max-w-xl w-full">
        <div className="w-full bg-gray-800 rounded-full h-2 mb-10">
          <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-gray-500 text-sm mb-2">Step {currentStep + 1} of {steps.length}</p>
        <h2 className="text-3xl font-bold mb-8">{step.question}</h2>
        <input autoFocus type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNext()} placeholder={step.placeholder}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-purple-500 mb-6" />
        <button onClick={handleNext} disabled={!input.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-8 py-4 rounded-lg text-lg">
          Next →
        </button>
      </div>
    </main>
  );
}