import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY?.replace(/['"]/g, '').trim();

    if (!apiKey) {
      return NextResponse.json({
        reply: "Hello! I am Infy AI Doctor. Please add your free GROQ_API_KEY to your environment variables in Netlify to activate my powers!"
      });
    }

    // Format conversation history for Groq (OpenAI compatible)
    const formattedMessages = [
      {
        role: "system",
        content: "You are Infy AI Doctor, a compassionate, expert virtual pediatric and child-care consultant in the Infy Baby Tracker app. Provide warm, accurate, easy-to-understand advice on newborn care, baby growth, nutrition, sleep, and vaccinations. Keep responses concise and friendly (under 120 words). Always remind parents to consult a qualified pediatrician for emergency or severe medical symptoms."
      },
      ...messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      const reply = data.choices[0].message.content;
      return NextResponse.json({ reply });
    } else {
      console.error("Groq API Error:", data);
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
