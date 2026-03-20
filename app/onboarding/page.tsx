"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const steps = [
  { id: 1, question: "What is your product or business name?", placeholder: "e.g. ShopEasy, DesignPro Agency, CloudSync SaaS", field: "productName" },
  { id: 2, question: "Describe your business in one sentence.", placeholder: "e.g. We help e-commerce stores grow with AI-powered ads", field: "description" },
  { id: 3, question: "Who is your ideal customer?", placeholder: "e.g. Small business owners, D2C brands, startup founders", field: "targetCustomer" },
  { id: 4, question: "Who are your top competitors?", placeholder: "e.g. Shopify, Webflow, Mailchimp, Fiverr, HubSpot", field: "competitors" },
  { id: 5, question: "What makes you stand out from competitors?", placeholder: "e.g. We are 3x cheaper, fully automated, built for non-tech users", field: "differentiator" },
  { id: 6, question: "What brand voice fits your business?", placeholder: "e.g. Bold & energetic, Friendly & approachable, Premium & professional", field: "brandVoice" },
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const meta = user.publicMetadata as { onboardingComplete?: boolean };
      if (meta?.onboardingComplete) {
        router.push("/dashboard");
      }
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
          if (line.startsWith('| ')) return <p key={i} className="text-gray-400 text-xs font-mono">{line}</p>;
          if (line.startsWith('`')) return null;
          return <p key={i} className="text-gray-300">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
        })}
      </div>
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
            className="ml-auto text-gray-500 hover:text-gray-300 text-sm">
            Start Over
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-200"
              }`}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-900 rounded-2xl px-5 py-4 text-gray-400 text-sm">Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-gray-800 px-4 py-4 max-w-3xl mx-auto w-full">
          <div className="flex gap-3 mb-3 flex-wrap">
            {["Write a LinkedIn post", "Create ad copy", "Write email subject lines", "Make tagline bolder"].map((suggestion) => (
              <button key={suggestion} onClick={() => setChatInput(suggestion)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleChat(); } }}
              placeholder="Ask anything about your brand..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
            <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-xl">
              Send
            </button>
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
          <p className="text-gray-400 mb-8">Our AI just read your answers and is ready to cook up something 🔥<br/>Here's what we're working with:</p>

          <div className="bg-gray-900 bg-opacity-60 border border-gray-700 rounded-2xl p-6 text-left space-y-4 mb-8 backdrop-blur">
            {steps.map((s) => (
              <div key={s.field} className="flex gap-3 items-start">
                <span className="text-purple-400 text-lg mt-0.5">→</span>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">{s.question}</p>
                  <p className="text-white font-medium mt-0.5">{answers[s.field]}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm mb-4">⚡ Takes about 10 seconds. No PhD required.</p>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-purple-900">
            {loading ? "🧠 Cooking your brand strategy..." : "✨ Generate My Brand Strategy →"}
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
          {currentStep === steps.length - 1 ? "Finish →" : "Next →"}
        </button>
      </div>
    </main>
  );
}
