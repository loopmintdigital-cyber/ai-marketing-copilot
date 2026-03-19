"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string };

export default function BrandStrategy() {
  const router = useRouter();
  const [brandStrategy, setBrandStrategy] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("brandStrategy");
    const savedAnswers = localStorage.getItem("answers");
    if (!saved) router.push("/onboarding");
    else {
      setBrandStrategy(saved);
      setAnswers(JSON.parse(savedAnswers || "{}"));
      setMessages([{ role: "assistant", content: saved }]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      body: JSON.stringify({
        messages: newMessages,
        brandStrategy,
        answers,
      }),
    });
    const data = await res.json();
    const updatedStrategy = data.result;
    setMessages([...newMessages, { role: "assistant", content: updatedStrategy }]);
    localStorage.setItem("brandStrategy", updatedStrategy);
    setBrandStrategy(updatedStrategy);
    setChatLoading(false);
  }

  function renderContent(content: string) {
    return (
      <div className="space-y-2">
        {content.split('\n').map((line, i) => {
          if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-white mt-4">{line.replace('# ', '')}</h2>;
          if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-purple-400 mt-3">{line.replace('## ', '')}</h3>;
          if (line.startsWith('### ')) return <h4 key={i} className="text-base font-semibold text-purple-300 mt-2">{line.replace('### ', '')}</h4>;
          if (line.startsWith('---')) return <hr key={i} className="border-gray-700 my-4" />;
          if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-purple-500 pl-4 text-purple-200 italic my-2">{line.replace('> ', '')}</blockquote>;
          if (line.trim() === '') return <div key={i} className="h-1" />;
          return <p key={i} className="text-gray-300 text-sm">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
        })}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col" style={{ height: "100vh" }}>
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")}
          className="text-gray-500 hover:text-white text-sm">← Dashboard</button>
        <div className="w-px h-4 bg-gray-700" />
        <h1 className="font-semibold text-white">Brand Strategy Engine</h1>
        <span className="text-gray-500 text-sm">— {answers.productName}</span>
        <button onClick={() => { localStorage.clear(); router.push("/onboarding"); }}
          className="ml-auto text-gray-500 hover:text-gray-300 text-sm">
          Redo Strategy
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
          {["Make brand voice bolder", "Rewrite the tagline", "Add more ICP detail", "Make it more friendly"].map((s) => (
            <button key={s} onClick={() => setChatInput(s)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleChat(); } }}
            placeholder="Ask to refine your brand strategy..."
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