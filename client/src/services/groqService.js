import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || "your_fallback_key_development_only",
  dangerouslyAllowBrowser: true
});

export const generateStory = async (prompt) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a creative fiction writer. Generate a compelling short story based on the user's prompt in the style of a very short story."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant", // or "llama3-70b-8192" 
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("Failed to generate story. Please try again.");
  }
};