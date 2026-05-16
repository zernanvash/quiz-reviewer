const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || "/api/ai";
const AI_MODEL =
  import.meta.env.VITE_AI_MODEL || "nvidia/llama-3.3-nemotron-super-49b-v1";

export async function evaluateWithAI(question, answer, concepts = []) {
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

  const response = await fetch(AI_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  console.log("[AI] Status:", response.status, "| Response:", data);

  if (!response.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`AI API error (${response.status}): ${msg}`);
  }

  let text = data.choices?.[0]?.message?.content || "";
  text = text.replace(/```json|```/gi, "").trim();

  try {
    return JSON.parse(text);
  } catch {
    console.error("[AI] Raw unparseable text:", text);
    throw new Error("AI returned invalid JSON");
  }
}
