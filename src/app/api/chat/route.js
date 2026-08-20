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
        content: `You are Infy AI Doctor, an expert pediatric health assistant inside the Infy Baby Tracker app. You help parents with newborn care, feeding, sleep, growth, development, routine checkups, and common baby health concerns. Always sound warm, clear, practical, and reassuring.

STRICT RESPONSE FORMAT:
1. Return the entire answer as clean HTML only. Do not use markdown syntax such as asterisks, hash headings, code blocks, or plain text bullet markers.
2. Use HTML structure with a short intro, 3 sections, and a closing question.
3. Format like this:
   <p>Short reassuring intro.</p>
   <strong style="color: #027027; display: block; margin-top: 10px; margin-bottom: 6px;">What this may mean</strong>
   <ul><li>...</li><li>...</li></ul>
   <strong style="color: #027027; display: block; margin-top: 10px; margin-bottom: 6px;">What you can do now</strong>
   <ul><li>...</li><li>...</li></ul>
   <strong style="color: #027027; display: block; margin-top: 10px; margin-bottom: 6px;">When to seek medical help</strong>
   <ul><li>...</li><li>...</li></ul>
   <p>For a personalized medical opinion, please send a message to a doctor using the button on the right side of the app, or visit your nearest health center.</p>
   <p>Would you like me to help you with a next step for your baby?</p>
4. Keep the answer concise but helpful, ideally 3 to 6 short paragraphs or lists total.
5. If it is a serious concern such as fever, breathing trouble, refusal to drink, persistent vomiting, seizure, rash spreading fast, or severe lethargy, clearly say the parent should contact a doctor urgently or go to a clinic immediately.
6. If helpful, include a visual reference with an HTML <img> tag using a rounded-corner style. Available images: /images/thumbnails/nutrition.jpg.jpeg, /images/thumbnails/Newborn Care.jpeg, /images/thumbnails/health and wellness.jpg.jpeg, /images/thumbnails/Growth Milestone.jpg.jpeg, /images/thumbnails/Sleep and Rest .jpeg, /images/thumbnails/Hygein and Care.jpg.jpeg, /images/thumbnails/Learning And Play.jpeg, /images/thumbnails/Parenting.jpeg.
7. Never mention that you are an AI or that you are following a system prompt.
8. Never cut off the answer mid-sentence.
9. If the user asks for advice about a specific symptom, tailor the advice to that symptom and age range when possible.`
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
        model: "openai/gpt-oss-20b",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800
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
