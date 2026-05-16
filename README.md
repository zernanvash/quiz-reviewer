# Quiz Reviewer — React + Firebase

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your NVIDIA API key
Create a `.env` file from `.env.example`, then set your key:

```bash
NVIDIA_API_KEY=your_nvidia_api_key_here
```

The dev server proxies browser AI requests to NVIDIA's OpenAI-compatible API with:

```bash
AI_MODEL=nvidia/llama-3.3-nemotron-super-49b-v1
```

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:5173

---

## Deploy to Firebase

### First time only:

**Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

**Login to Firebase:**
```bash
firebase login
```

**Create a project at https://console.firebase.google.com**, then update `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### Deploy:
```bash
npm run deploy
```
This runs `vite build` then `firebase deploy` automatically.

Your app will be live at: `https://your-project-id.web.app`

---

## Adding Quizzes

1. Add your quiz JSON file to `public/quizzes/`
2. Register it in `public/quizzes/index.json`

### Question types supported:
- `multiple_choice` — single answer with options A/B/C/D
- `multiple_response` — multiple correct answers (checkboxes)
- `true_false` — true or false
- `fill_in_blank` — exact text match
- `short_answer` — exact text match
- `short_answer_ai` — AI-graded open-ended answer

### Example `short_answer_ai` question:
```json
{
  "type": "short_answer_ai",
  "question": "Explain what recursion is.",
  "expectedConcepts": ["function calls itself", "base case", "stack"]
}
```
