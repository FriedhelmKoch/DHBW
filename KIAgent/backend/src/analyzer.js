import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeEmail(email) {
  const prompt = `Fasse diese E-Mail kurz zusammen und identifiziere den Typ (z.B. Anfrage, Rechnung, Werbung, Support):\n\n${email.text}`;
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });
  return response.choices[0].message.content;
}
