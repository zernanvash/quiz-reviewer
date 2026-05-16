import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.NVIDIA_API_KEY || env.VITE_NVIDIA_API_KEY;
  const apiUrl = env.AI_API_URL || env.VITE_AI_API_URL || "https://integrate.api.nvidia.com/v1/chat/completions";
  const model = env.AI_MODEL || env.VITE_AI_MODEL || "nvidia/llama-3.3-nemotron-super-49b-v1";

  return {
    plugins: [
      react(),
      {
        name: "ai-api-dev-middleware",
        configureServer(server) {
          server.middlewares.use("/api/ai", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "AI API key not set. Add NVIDIA_API_KEY to your .env file." }));
              return;
            }

            try {
              const body = await parseJsonBody(req);
              const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  ...body,
                  model: body.model || model,
                }),
              });
              const data = await response.text();

              res.statusCode = response.status;
              res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
              res.end(data);
            } catch (error) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: error.message || "AI request failed" }));
            }
          });
        },
      },
    ],
  };
})
