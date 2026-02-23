import OpenAI from "openai";

export async function getAIResponse(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("API key not loaded");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful personal finance assistant." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}