import type { NextApiRequest, NextApiResponse } from "next";

// Vercel serverless function — proxies requests to the Anthropic API
// so the API key stays on the server and never reaches the browser.
//
// Set ANTHROPIC_API_KEY in your Vercel project's Environment Variables.
// (Project Settings → Environment Variables → add ANTHROPIC_API_KEY)

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  system?: string;
  messages?: AnthropicMessage[];
  model?: string;
  max_tokens?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server is missing ANTHROPIC_API_KEY environment variable",
    });
  }

  try {
    const { system, messages, model, max_tokens } =
      (req.body || {}) as ChatRequestBody;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing or invalid messages array" });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: max_tokens || 1000,
        system,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error("Anthropic API error:", data);
      return res.status(anthropicRes.status).json({
        error: "Anthropic API error",
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
