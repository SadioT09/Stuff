"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
  time: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function getTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.answer ?? "No response received.",
          time: getTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error retrieving response.",
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/nyc-4k.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#081425]/60 to-black/75" />

      <div className="relative z-10 w-full max-w-3xl h-[70vh] flex flex-col rounded-xl bg-[#0b1324]/85 border border-white/15 shadow-xl">

        {/* Header with Icon */}
        <header className="flex items-center justify-center gap-2 py-4 border-b border-white/15">
          <Image
            src="/chatbox.svg"
            alt="Chatbot Icon"
            width={22}
            height={22}
            className="opacity-90"
          />
          <h1 className="text-2xl font-semibold text-white">
            Finance Assistant
          </h1>
        </header>

        {/* Messages */}
        <section className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[60%] ${
                msg.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white text-black shadow-md"
                    : "bg-[#111827] text-white border border-white/10"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ ...props }) => (
                      <h3 className="text-sm font-semibold mt-4 mb-2" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc ml-5 my-2 space-y-1" {...props} />
                    ),
                    li: ({ ...props }) => (
                      <li className="text-sm leading-relaxed" {...props} />
                    ),
                    p: ({ ...props }) => (
                      <p className="text-sm leading-relaxed mb-2" {...props} />
                    ),
                    strong: ({ ...props }) => (
                      <strong className="font-semibold" {...props} />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              <div
                className={`text-[10px] mt-1 text-gray-400 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                {msg.time}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mr-auto max-w-[60%]">
              <div className="px-4 py-3 rounded-lg bg-[#111827] border border-white/10 text-gray-400 text-sm animate-pulse">
                Analyzing…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        {/* Input */}
        <footer className="relative p-3 border-t border-white/15">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={loading}
            placeholder="Ask a finance question…"
            className="w-full resize-none rounded-lg bg-black/40 text-white placeholder-gray-400 p-3 pr-14 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-60"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="absolute right-5 bottom-7 px-3 py-1.5 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            Send
          </button>
        </footer>
      </div>
    </main>
  );
}
