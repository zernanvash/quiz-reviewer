# Quiz Reviewer — React + Firebase

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Groq API key
Open `src/groq.js` and replace `YOUR_GROQ_API_KEY_HERE` with your key from https://console.groq.com

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
- `short_answer_ai` — AI-graded open-ended answer (uses Groq)

### Example `short_answer_ai` question:
```json
{
  "type": "short_answer_ai",
  "question": "Explain what recursion is.",
  "expectedConcepts": ["function calls itself", "base case", "stack"]
}
```
