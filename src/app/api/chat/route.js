import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY?.replace(/['"]/g, '').trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured. Please add GROQ_API_KEY to your environment variables." },
        { status: 503 }
      );
    }

    // Format conversation history for Groq (OpenAI compatible)
    const formattedMessages = [
      {
        role: "system",
        content: `You are Infy AI Doctor, an expert pediatric consultant in the Infy Baby Tracker app. Provide warm, accurate advice on newborn care, baby growth, nutrition, sleep, and vaccinations.
        
FORMATTING RULES:
1. Provide your entire response in clean HTML format. NEVER use markdown — no asterisks, no ** bold syntax, no # headings.
2. For main headings or key takeaways, use <strong style="color: #027027; display: block; margin-top: 8px;"> to give them a nice green color.
3. For bullet points, use <ul> and <li style="margin-left: 16px; margin-top: 4px; margin-bottom: 4px;"> tags.
4. If providing links to external articles, use <a href="..." style="color: #027027; text-decoration: underline;">.
5. Always end your response by politely asking the user if they want further explanation or links to related articles.
6. Keep responses concise (under 150 words) and friendly. Always remind parents to consult a pediatrician for emergencies.
7. Think carefully about the user's question before answering. Give specific, helpful pediatric advice — never give a generic greeting.`
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
        max_tokens: 400
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
