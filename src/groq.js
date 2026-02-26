// src/groq.js
// 🔑 Replace with your key from https://console.groq.com
//const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";
const GROQ_MODEL = "llama3-8b-8192";

export async function evaluateWithGroq(question, answer, concepts = []) {
  if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
    throw new Error("Groq API key not set. Open src/groq.js and replace YOUR_GROQ_API_KEY_HERE.");
  }

  const prompt = `You are grading a short-answer exam.
Question: ${question}
Expected concepts: ${concepts.join(", ")}
Student answer: ${answer}

Score from 0 to 3:
3 = complete, 2 = mostly correct, 1 = partial, 0 = incorrect

Respond ONLY with a raw JSON object. No markdown, no backticks.
{
  "score": number,
  "feedback": "brief explanation",
  "missingConcepts": ["list of missing concepts"]
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + GROQ_API_KEY,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  console.log("[Groq] Status:", response.status, "| Response:", data);

  if (!response.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Groq API error (${response.status}): ${msg}`);
  }

  let text = data.choices[0].message.content;
  text = text.replace(/```json|```/gi, "").trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("[Groq] Raw unparseable text:", text);
    throw new Error("AI returned invalid JSON");
  }
}
