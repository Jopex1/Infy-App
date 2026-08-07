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
        content: `You are Infy AI Doctor, an expert pediatric consultant in the Infy Baby Tracker app. Provide warm, accurate advice on newborn care, baby growth, nutrition, sleep, and vaccinations. Be dynamic, conversational, and highly helpful.
        
FORMATTING RULES:
1. Provide your entire response in clean HTML format. NEVER use markdown — absolutely NO asterisks (* or **), NO hashes (#). Use standard HTML tags only.
2. For main headings or key takeaways, use <strong style="color: #027027; display: block; margin-top: 8px;"> to give them a nice green color.
3. For bullet points, use <ul> or <ol> and <li> tags.
4. If providing links to external articles, use <a href="..." style="color: #027027; text-decoration: underline;">.
5. Explain stuff with images when relevant. Use HTML <img> tags with 100% width and rounded corners (e.g. <img src='/images/thumbnails/nutrition.jpg.jpeg' style='width: 100%; border-radius: 12px; margin-top: 8px; margin-bottom: 8px;' />). 
   Available images you can use: /images/thumbnails/nutrition.jpg.jpeg, /images/thumbnails/Newborn Care.jpeg, /images/thumbnails/health and wellness.jpg.jpeg, /images/thumbnails/Growth Milestone.jpg.jpeg, /images/thumbnails/Sleep and Rest .jpeg, /images/thumbnails/Hygein and Care.jpg.jpeg, /images/thumbnails/Learning And Play.jpeg, /images/thumbnails/Parenting.jpeg.
6. MANDATORY ENCOURAGEMENT: Always encourage the user to visit a health center or use the app's professional medical contact feature by saying something like: "For a personalized medical opinion, please send a message to a doctor using the button on the right side of the app, or visit your nearest health center."
7. Always end your response by politely asking the user a question related to their query to keep the conversation going.
8. Ensure your response is fully complete and never cuts off mid-sentence.`
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
