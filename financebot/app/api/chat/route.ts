// app/api/chat/route.ts
import OpenAI from "openai";

export const runtime = "nodejs"; // avoid edge surprises while you’re starting

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatRequest = {
  question: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest;

    const question = (body.question ?? "").trim();
    if (!question) {
      return Response.json({ error: "Missing question" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a finance Q&A assistant. Provide educational information only; do not give personalized financial advice. If asked for buy/sell or specific recommendations, explain risks and suggest consulting a professional.",
        },
        { role: "user", content: question },
      ],
    });

    // Extract a safe text output
    const text =
      response.output_text?.trim() ||
      "I couldn’t generate a response. Try rephrasing.";

    return Response.json({ answer: text });
  } catch (err: any) {
    return Response.json(
      { error: "Server error", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}