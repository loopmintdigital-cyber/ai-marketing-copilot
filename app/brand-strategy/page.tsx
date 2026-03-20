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
      body: JSON.stringify({ messages: newMessages, brandStrategy, answers }),
    });
    const data = await res.json();
    const updatedStrategy = data.result;
    setMessages([...newMessages, { role: "assistant", content: updatedStrategy }]);
    localStorage.setItem("brandStrategy", updatedStrategy);
    setBrandStrategy(updatedStrategy);
    setChatLoading(false);
  }

  function renderTable(lines: string[], startIndex: number) {
    const tableLines = [];
    let i = startIndex;
    while (i < lines.length && lines[i].startsWith('|')) {
      tableLines.push(lines[i]);
      i++;
    }
    const headers = tableLines[0]?.split('|').filter(h => h.trim()) || [];
    const rows = tableLines.slice(2).map(row => row.split('|').filter(c => c.trim()));
    return { jsx: (
      <div className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-purple-800">
              {headers.map((h, i) => <th key={i} className="text-left text-purple-400 font-semibold py-2 px-3">{h.trim()}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-800 hover:bg-purple-900 hover:bg-opacity-20 transition-colors">
                {row.map((cell, j) => <td key={j} className="py-2 px-3 text-gray-300">{cell.trim().replace(/\*\*(.*?)\*\*/g, '$1')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ), endIndex: i };
  }

  function renderContent(content: string) {
    const lines = content.split('\n');
    const elements = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
if (line.startsWith('| ') && !line.startsWith('|---') && lines[i+1]?.startsWith('|---')) {        const { jsx, endIndex } = renderTable(lines, i);
        elements.push(<div key={i}>{jsx}</div>);
        i = endIndex;
        continue;
      }
      if (line.startsWith('|---')) { i++; continue; }
      if (line.startsWith('# ')) elements.push(<h2 key={i} className="text-xl font-bold text-white mt-6 mb-2">{line.replace('# ', '')}</h2>);
      else if (line.startsWith('## ')) elements.push(<h3 key={i} className="text-lg font-bold text-purple-400 mt-4 mb-1">{line.replace('## ', '')}</h3>);
      else if (line.startsWith('### ')) elements.push(<h4 key={i} className="text-base font-semibold text-purple-300 mt-3 mb-1">{line.replace('### ', '')}</h4>);
      else if (line.startsWith('---')) elements.push(<hr key={i} className="border-gray-700 my-4" />);
      else if (line.startsWith('> ')) elements.push(<blockquote key={i} className="border-l-2 border-purple-500 pl-4 text-purple-200 italic my-2">{line.replace('> ', '').replace(/\*/g, '')}</blockquote>);
      else if (line.trim() === '') elements.push(<div key={i} className="h-1" />);
      else elements.push(<p key={i} className="text-gray-300 text-sm leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>);
      i++;
    }
    return <div className="space-y-1">{elements}</div>;
  }

  return (
    <main className="min-h-screen text-white flex flex-col" style={{ height: "100vh", background: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 50%, #0f0f0f 100%)" }}>
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3" style={{ background: "rgba(15, 15, 15, 0.8)", backdropFilter: "blur(10px)" }}>
        <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
        <div className="w-px h-4 bg-gray-700" />
        <span className="text-2xl">🧠</span>
        <h1 className="font-semibold text-white">Brand Strategy Engine</h1>
        <span className="text-gray-500 text-sm">— {answers.productName}</span>
        <button onClick={() => { localStorage.clear(); router.push("/onboarding"); }}
          className="ml-auto text-gray-500 hover:text-gray-300 text-sm transition-colors">
          Redo Strategy
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${
              msg.role === "user" ? "bg-purple-600 text-white" : "border border-purple-900 border-opacity-40"
            }`} style={msg.role === "assistant" ? { background: "rgba(26, 5, 51, 0.6)", backdropFilter: "blur(10px)" } : {}}>
              {renderContent(msg.content)}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-5 py-4 text-gray-400 text-sm" style={{ background: "rgba(26, 5, 51, 0.6)" }}>✨ Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 px-4 py-4 max-w-3xl mx-auto w-full" style={{ background: "rgba(26, 5, 51, 0.8)", backdropFilter: "blur(10px)" }}>
        <div className="flex gap-3 mb-3 flex-wrap">
          {["Make brand voice bolder", "Rewrite the tagline", "Add more ICP detail", "Make it more friendly"].map((s) => (
            <button key={s} onClick={() => setChatInput(s)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-all">
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleChat(); } }}
            placeholder="Ask to refine your brand strategy..."
            className="flex-1 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" style={{ background: "rgba(17, 24, 39, 0.8)" }} />
          <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-purple-900">
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
