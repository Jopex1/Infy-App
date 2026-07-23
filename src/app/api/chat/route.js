import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: "Hello! I am Infy AI Doctor. To activate my full AI powers, please add your free GEMINI_API_KEY to your environment variables in Netlify or .env.local!"
      });
    }

    // Format conversation history for Gemini API
    const contents = [
      {
        role: "user",
        parts: [{ text: "System Instruction: You are Infy AI Doctor, a compassionate, expert virtual pediatric and child-care consultant in the Infy Baby Tracker app. Provide warm, accurate, easy-to-understand advice on newborn care, baby growth, nutrition, sleep, and vaccinations. Keep responses concise and friendly (under 120 words). Always remind parents to consult a qualified pediatrician for emergency or severe medical symptoms." }]
      },
      {
        role: "model",
        parts: [{ text: "Understood! I am ready to assist parents with warm, concise, and expert guidance on child care as the Infy AI Doctor." }]
      },
      ...messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const reply = data.candidates[0].content.parts[0].text;
      return NextResponse.json({ reply });
    } else {
      console.error("Gemini API Error:", data);
      return NextResponse.json({
        reply: `API Error: ${data.error?.message || JSON.stringify(data)}`
      });
    }
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { reply: `Fetch Error: ${error.message}` },
      { status: 500 }
    );
  }
}
