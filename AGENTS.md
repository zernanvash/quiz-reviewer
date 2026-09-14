# AGENTS.md

## Project overview

Quiz Reviewer is a personal, browser-only study app. It presents a catalog of JSON-defined quizzes, records answers one question at a time, times the attempt, grades the submission, and shows a per-question review. Most questions are graded locally. Questions with the `short_answer_ai` type are sent to an OpenAI-compatible NVIDIA chat-completions endpoint through `/api/ai`.

Production is available at:

- `https://zernanvash.dev/quiz-reviewer/`
- `https://zernanvash.github.io/quiz-reviewer/` (redirects to the custom domain)

The app is a React 18 single-page application built with Vite. There is no test framework, router, state library, or application backend in this repository.

## Repository map

- `src/main.jsx` mounts the React application.
- `src/App.jsx` owns the selection, quiz, and results screens; timer; navigation; keyboard shortcuts; answer state; and AI grading workflow.
- `src/quizEngine.js` contains pure grading and result-formatting functions. Keep grading rules here when possible.
- `src/ai.js` builds the grading prompt, calls the configured AI proxy, and parses its JSON response.
- `src/index.css` contains all current React UI styles, including responsive rules.
- `public/quizzes/index.json` is the runtime quiz catalog.
- `public/quizzes/*.json` are the quiz payloads copied by Vite into the build output.
- `vite.config.js` configures React and a development-only `/api/ai` proxy that keeps the NVIDIA API key out of browser code.
- `.env.example` documents the AI environment variables.
- `firebase.json` deploys `dist/` to Firebase Hosting and rewrites unknown paths to `index.html`.
- `assets/` and the root `index.html` are the checked-in GitHub Pages bundle currently served in production.
- `quizzes/`, `js/`, and `css/` contain older/static copies and extra quiz material. They are not the React/Vite runtime source of truth. Some files exist only under `quizzes/` and are not listed in the active catalog.
- `*.pdf` and `FINALS.docx` are source study materials, not runtime dependencies.

## Development commands

Use Node.js and npm:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
npm run build
npm run preview
```

Set a real `NVIDIA_API_KEY` in `.env` only when testing AI-graded questions. Never commit `.env` or an API key. `AI_API_URL` and `AI_MODEL` override the server-side development proxy defaults. Browser-side deployments may set `VITE_AI_PROXY_URL` and `VITE_AI_MODEL`, but a public static host still needs a separately deployed proxy at that URL; Vite's `configureServer` middleware exists only during local development.

There are no automated tests or lint scripts. For code changes, run `npm run build` and manually exercise quiz selection, navigation, submission, results, and the affected question types. Test at a `/quiz-reviewer/` base path before publishing.

## Important build and deployment constraint

Updated build workflow: `dev.html` is now the Vite source entry and imports `src/main.jsx`. Vite builds with base `/quiz-reviewer/`; `scripts/finalize-build.mjs` copies the generated `dist/dev.html` to `dist/index.html`. For the checked-in static preview, copy the generated `dist/index.html` to root `index.html` and generated `dist/assets/` files to root `assets/`. For source development, open `/quiz-reviewer/dev.html` on the Vite server. The paragraph below describes why these separate entries are necessary.

The current root `index.html` imports hashed files from `/quiz-reviewer/assets/` instead of importing `/src/main.jsx`. Those files were committed for GitHub Pages. As a result, editing `src/` and running the current build does not guarantee that a new React bundle is produced.

Treat `src/` as the editable application source and `assets/` as generated output. Do not hand-edit minified files in `assets/`. Before a source-code release, make the Vite entry/build path explicit: the build input must import `/src/main.jsx`, Vite must emit URLs for the `/quiz-reviewer/` base path, and the newly generated bundle plus `index.html` must be published together. Verify both production URLs after deployment. Do not assume `npm run deploy` updates GitHub Pages; that script targets Firebase Hosting.

## Quiz data contract

The active catalog is an array in `public/quizzes/index.json`. Each entry has:

```json
{
  "id": "stable-slug",
  "title": "Display title",
  "description": "Short catalog description",
  "icon": "Two or three characters",
  "file": "quiz-file.json"
}
```

Each referenced file contains `{ "questions": [...] }`. Every question needs `type` and `question`. Supported types and answer fields are:

- `multiple_choice`: `options` is an object keyed by letters and `correctAnswer` is one letter.
- `multiple_response`: `options` is keyed by letters and `correctAnswer` is an array of letters. Grading requires an exact set match.
- `true_false`: `correctAnswer` is a JSON boolean.
- `short_answer` and `fill_in_blank`: `correctAnswers` is an array of accepted strings. Matching ignores case and surrounding whitespace but is otherwise exact.
- `short_answer_ai`: `expectedConcepts` is an array of grading concepts. The AI returns `score` from 0 to 3, `feedback`, and `missingConcepts`; a score of 2 or 3 counts as correct.

When adding a quiz, add its JSON file under `public/quizzes/` and add exactly one catalog entry to `public/quizzes/index.json`. Keep any legacy top-level `quizzes/` copy synchronized only if the deployment workflow still consumes it. Validate JSON syntax, referenced filenames, option keys, and answer keys. Preserve UTF-8 text.

## Application behavior to preserve

- `enumeration` uses `answerGroups` (one array of accepted aliases per item). Students enter one item per line or separate items with semicolons. Order and case are ignored; duplicates, missing items and extra items fail the exact-set check.
- `essay` uses `modelAnswer`, `rubric`, and `source`. Written answers are reviewed after submission and excluded from the automatic percentage and correct/incorrect totals. These essays require no AI service.
- Run `rtk node scripts/check-written-questions.mjs` after changes to written-answer grading or the Elective 3 banks.

- The screen flow is selection -> quiz -> results.
- Answer state is held in memory; refreshing the page resets an attempt.
- Leaving an AI short-answer question starts background grading. Finishing waits for all remaining AI questions and then calculates results.
- AI failures are surfaced to the user and currently score that answer as zero.
- Keyboard controls support left/right navigation, up/down option movement, and Enter to advance while avoiding interference with text entry.
- The question jump field and sticky navigation must remain usable on narrow screens.
- Results include percentage, correct/incorrect counts, elapsed time, the submitted answer, correct answer, and AI feedback where applicable.

## Change guidelines

Keep the project lightweight and suitable for static hosting. Prefer plain React and the existing CSS over adding libraries for small features. Put deterministic grading logic in `src/quizEngine.js`, UI/state behavior in `src/App.jsx`, and provider/proxy handling in `src/ai.js` or server configuration.

Never expose `NVIDIA_API_KEY` through a `VITE_` variable or embed it in client assets. Treat all AI output as untrusted: retain strict JSON parsing and validate any new fields before rendering or grading. Preserve the existing question schema unless all quiz files and render/grading branches are migrated together.

Before finishing a change, inspect `git diff`, avoid modifying source documents or unrelated legacy files, and report any limitation that prevented a production-like build or AI test.
