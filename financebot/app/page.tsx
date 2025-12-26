"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");

      setAnswer(data.answer ?? "");
    } catch (e: any) {
      setAnswer(`Error: ${e.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Finance Bot (Local)</h1>

      <div className="mt-6 space-y-3">
        <textarea
          className="w-full border rounded p-3 min-h-28"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a finance question..."
        />
        <button
          className="px-4 py-2 rounded border"
          onClick={ask}
          disabled={loading || !question.trim()}
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium">Answer</h2>
        <pre className="mt-2 whitespace-pre-wrap border rounded p-3">
          {answer || "—"}
        </pre>
      </div>
    </main>
  );
}