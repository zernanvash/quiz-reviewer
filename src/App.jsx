import { useState, useEffect, useCallback, useRef } from "react";
import { evaluateWithAI } from "./ai";
import { calculateResults, formatDuration, getCorrectAnswerText } from "./quizEngine";

// ─── Screens ────────────────────────────────────────────────────────────────
const SCREEN = { SELECTION: "selection", QUIZ: "quiz", RESULTS: "results" };

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SELECTION);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizMeta, setQuizMeta] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState(null);
  const [gradingOverlay, setGradingOverlay] = useState(null); // { done, total }
  const [toast, setToast] = useState(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // ── Load quiz index ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("quizzes/index.json")
      .then((r) => r.json())
      .then(setAllQuizzes)
      .catch(() => setAllQuizzes([]));
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === SCREEN.QUIZ) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const timerDisplay = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 6000);
  }, []);

  // ── Select quiz ────────────────────────────────────────────────────────────
  async function selectQuiz(meta) {
    try {
      const res = await fetch(`quizzes/${meta.file}`);
      const content = await res.json();
      const qs = content.questions.map((q) => ({
        ...q,
        userAnswer: null,
        aiEvaluated: false,
        aiPending: false,
        aiScore: null,
        aiFeedback: null,
        aiMissingConcepts: null,
      }));
      setQuestions(qs);
      setUserAnswers(new Array(qs.length).fill(null));
      setQuizMeta(meta);
      setCurrentIndex(0);
      setElapsed(0);
      setScreen(SCREEN.QUIZ);
    } catch {
      showToast("Failed to load quiz. Please try again.");
    }
  }

  // ── Answer helpers ─────────────────────────────────────────────────────────
  function setAnswer(value) {
    setUserAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
    setQuestions((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], userAnswer: value };
      return next;
    });
  }

  function toggleMultiAnswer(letter) {
    const current = Array.isArray(userAnswers[currentIndex]) ? [...userAnswers[currentIndex]] : [];
    const idx = current.indexOf(letter);
    const next = idx === -1 ? [...current, letter].sort() : current.filter((l) => l !== letter);
    setAnswer(next);
  }

  // ── Background AI evaluation ───────────────────────────────────────────────
  const triggerBackgroundEval = useCallback(async (qIndex, qs, answers) => {
    const q = qs[qIndex];
    const answer = answers[qIndex];
    if (!answer || answer.trim() === "") return;
    if (q.aiEvaluated || q.aiPending) return;

    // Mark as pending
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], aiPending: true };
      return next;
    });

    try {
      const result = await evaluateWithAI(q.question, answer, q.expectedConcepts || []);
      setQuestions((prev) => {
        const next = [...prev];
        next[qIndex] = {
          ...next[qIndex],
          userAnswer: answer,
          aiScore: result.score,
          aiFeedback: result.feedback,
          aiMissingConcepts: result.missingConcepts,
          aiEvaluated: true,
          aiPending: false,
        };
        return next;
      });
    } catch (err) {
      showToast(`AI evaluation failed: ${err.message}`);
      setQuestions((prev) => {
        const next = [...prev];
        next[qIndex] = {
          ...next[qIndex],
          aiScore: 0,
          aiFeedback: `⚠️ Evaluation failed: ${err.message}`,
          aiMissingConcepts: [],
          aiEvaluated: true,
          aiPending: false,
        };
        return next;
      });
    }
  }, [showToast]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  function goNext() {
    const q = questions[currentIndex];
    if (q.type === "short_answer_ai" && !q.aiEvaluated && !q.aiPending) {
      triggerBackgroundEval(currentIndex, questions, userAnswers);
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goToQuestion(index) {
    const nextIndex = Math.max(0, Math.min(index, questions.length - 1));
    setCurrentIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function moveChoiceSelection(direction) {
    const q = questions[currentIndex];
    if (!q) return false;

    if (q.type === "multiple_choice") {
      const letters = Object.keys(q.options || {});
      if (letters.length === 0) return false;

      const current = userAnswers[currentIndex];
      const currentChoiceIndex = letters.indexOf(current);
      const startIndex = direction > 0 ? -1 : 0;
      const nextIndex = (currentChoiceIndex === -1 ? startIndex : currentChoiceIndex) + direction;
      const wrappedIndex = (nextIndex + letters.length) % letters.length;
      setAnswer(letters[wrappedIndex]);
      return true;
    }

    if (q.type === "true_false") {
      const choices = ["true", "false"];
      const current = userAnswers[currentIndex];
      const currentChoiceIndex = choices.indexOf(current);
      const startIndex = direction > 0 ? -1 : 0;
      const nextIndex = (currentChoiceIndex === -1 ? startIndex : currentChoiceIndex) + direction;
      const wrappedIndex = (nextIndex + choices.length) % choices.length;
      setAnswer(choices[wrappedIndex]);
      return true;
    }

    if (q.type === "multiple_response") {
      const inputs = Array.from(document.querySelectorAll(".options-list input[type='checkbox']"));
      if (inputs.length === 0) return false;

      const currentChoiceIndex = inputs.indexOf(document.activeElement);
      const startIndex = direction > 0 ? -1 : 0;
      const nextIndex = (currentChoiceIndex === -1 ? startIndex : currentChoiceIndex) + direction;
      const wrappedIndex = (nextIndex + inputs.length) % inputs.length;
      inputs[wrappedIndex].focus();
      return true;
    }

    return false;
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== SCREEN.QUIZ) return;
    function onKey(e) {
      const target = e.target;
      const isTextEntry =
        (target instanceof HTMLInputElement && !["checkbox", "radio"].includes(target.type)) ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (!isTextEntry && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        const handled = moveChoiceSelection(e.key === "ArrowDown" ? 1 : -1);
        if (handled) e.preventDefault();
      }
      if (!isTextEntry && e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      if (!isTextEntry && e.key === "ArrowLeft")  { e.preventDefault(); goPrev(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, currentIndex, questions, userAnswers]);

  // ── Finish quiz ────────────────────────────────────────────────────────────
  async function finishQuiz() {
    const unanswered = userAnswers.filter(
      (a) => a === null || a === "" || (Array.isArray(a) && a.length === 0)
    ).length;
    if (unanswered > 0 && !confirm(`⚠️ ${unanswered} unanswered question(s). Submit anyway?`)) return;

    clearInterval(timerRef.current);

    // Trigger eval for current question if needed
    const curQ = questions[currentIndex];
    if (curQ.type === "short_answer_ai" && !curQ.aiEvaluated && !curQ.aiPending) {
      const ans = userAnswers[currentIndex];
      if (ans?.trim()) triggerBackgroundEval(currentIndex, questions, userAnswers);
    }

    // Find all unevaluated AI questions
    const pending = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.type === "short_answer_ai" && !q.aiEvaluated);

    if (pending.length === 0) {
      finalize();
      return;
    }

    setGradingOverlay({ done: 0, total: pending.length });
    let done = 0;

    await Promise.all(
      pending.map(async ({ q, i }) => {
        const ans = userAnswers[i];
        if (ans?.trim()) {
          try {
            const result = await evaluateWithAI(q.question, ans, q.expectedConcepts || []);
            setQuestions((prev) => {
              const next = [...prev];
              next[i] = {
                ...next[i],
                userAnswer: ans,
                aiScore: result.score,
                aiFeedback: result.feedback,
                aiMissingConcepts: result.missingConcepts,
                aiEvaluated: true,
                aiPending: false,
              };
              return next;
            });
          } catch (err) {
            setQuestions((prev) => {
              const next = [...prev];
              next[i] = {
                ...next[i],
                aiScore: 0,
                aiFeedback: `⚠️ ${err.message}`,
                aiMissingConcepts: [],
                aiEvaluated: true,
                aiPending: false,
              };
              return next;
            });
          }
        }
        done++;
        setGradingOverlay({ done, total: pending.length });
      })
    );

    setGradingOverlay(null);
    finalize();
  }

  function finalize() {
    // Use latest questions state via callback
    setQuestions((latestQs) => {
      const endTime = Date.now();
      const res = calculateResults(latestQs, startTimeRef.current, endTime, quizMeta?.title || "Quiz");
      setResults(res);
      setScreen(SCREEN.RESULTS);
      return latestQs;
    });
  }

  function retakeQuiz() {
    if (confirm("🔄 Retake this quiz? Your results will be lost.")) selectQuiz(quizMeta);
  }

  function backToSelection() {
    if (confirm("🏠 Return to quiz selection?")) {
      clearInterval(timerRef.current);
      setScreen(SCREEN.SELECTION);
    }
  }

  function exitQuiz() {
    if (confirm("⚠️ Exit quiz? Your progress will be lost.")) {
      clearInterval(timerRef.current);
      setScreen(SCREEN.SELECTION);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="bg-pattern" />

      {screen === SCREEN.SELECTION && (
        <SelectionScreen quizzes={allQuizzes} onSelect={selectQuiz} />
      )}
      {screen === SCREEN.QUIZ && (
        <QuizScreen
          questions={questions}
          currentIndex={currentIndex}
          userAnswers={userAnswers}
          timerDisplay={timerDisplay}
          quizTitle={quizMeta?.title || "Quiz"}
          onAnswer={setAnswer}
          onToggleMulti={toggleMultiAnswer}
          onNext={goNext}
          onPrev={goPrev}
          onJump={goToQuestion}
          onFinish={finishQuiz}
          onExit={exitQuiz}
        />
      )}
      {screen === SCREEN.RESULTS && results && (
        <ResultsScreen
          results={results}
          onRetake={retakeQuiz}
          onBack={backToSelection}
        />
      )}

      {gradingOverlay && <GradingOverlay done={gradingOverlay.done} total={gradingOverlay.total} />}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ─── Selection Screen ────────────────────────────────────────────────────────
function SelectionScreen({ quizzes, onSelect }) {
  return (
    <div className="screen">
      <div className="container">
        <div className="header">
          <div className="logo">
            <div className="logo-icon">📚</div>
            <div className="logo-text">
              <h1>Test Reviewer</h1>
              <p>Exam review machine</p>
            </div>
          </div>
          <p className="header-subtitle">Select a quiz to begin your review session</p>
        </div>
        <div className="quiz-list">
          {quizzes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Quizzes Available</h3>
              <p>Add quiz files to <code>public/quizzes/</code> and update <code>index.json</code></p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <button key={quiz.id} className="quiz-card" onClick={() => onSelect(quiz)}>
                <div className="quiz-card-header">
                  <div className="quiz-icon">{quiz.icon}</div>
                  <div><h3>{quiz.title}</h3></div>
                </div>
                <p>{quiz.description}</p>
                <div className="quiz-meta">
                  <span className="quiz-badge">Click to start</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Screen ─────────────────────────────────────────────────────────────
function getQuestionSection(question) {
  switch (question?.type) {
    case "multiple_choice":
    case "multiple_response":
    case "true_false":
      return "Multiple Choice";
    case "fill_in_blank":
    case "short_answer":
      return "Identification / Matching";
    case "short_answer_ai":
      return "Reasoning / Essay";
    default:
      return "Questions";
  }
}

function getSectionMarkers(questions) {
  return questions.reduce((sections, question, index) => {
    const label = getQuestionSection(question);
    const last = sections[sections.length - 1];

    if (!last || last.label !== label) {
      sections.push({ label, start: index, end: index });
    } else {
      last.end = index;
    }

    return sections;
  }, []);
}

function QuizScreen({ questions, currentIndex, userAnswers, timerDisplay, quizTitle,
  onAnswer, onToggleMulti, onNext, onPrev, onJump, onFinish, onExit }) {

  const question = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex + 1) / total) * 100;
  const isLast = currentIndex === total - 1;
  const [jumpValue, setJumpValue] = useState(String(currentIndex + 1));
  const currentSection = getQuestionSection(question);
  const sectionMarkers = getSectionMarkers(questions);

  useEffect(() => {
    setJumpValue(String(currentIndex + 1));
  }, [currentIndex]);

  function submitJump() {
    const parsed = Number.parseInt(jumpValue, 10);
    if (Number.isNaN(parsed)) {
      setJumpValue(String(currentIndex + 1));
      return;
    }

    onJump(parsed - 1);
  }

  return (
    <div className="screen" id="quiz-screen">
      <div className="quiz-header">
        <button className="back-btn" onClick={onExit}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <div className="quiz-info">
          <h2>{quizTitle}</h2>
          <div className="quiz-meta-header">
            <div className="timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {timerDisplay}
            </div>
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="section-markers">
        {sectionMarkers.map((section) => {
          const active = currentIndex >= section.start && currentIndex <= section.end;
          return (
            <button
              key={`${section.label}-${section.start}`}
              className={`section-marker ${active ? "active" : ""}`}
              onClick={() => onJump(section.start)}
              type="button"
            >
              <span>{section.label}</span>
              <strong>{section.start + 1}-{section.end + 1}</strong>
            </button>
          );
        })}
      </div>

      <div className="question-container">
        <div className="question-header">
          <div className="question-number">Question {currentIndex + 1} of {total}</div>
          <div className="section-pill">{currentSection}</div>
        </div>
        <div className="question-text">{question.question}</div>
        <div className="options-list">
          <QuestionInput
            question={question}
            userAnswer={userAnswers[currentIndex]}
            onAnswer={onAnswer}
            onToggleMulti={onToggleMulti}
          />
        </div>
      </div>

      <div className="keyboard-hint">
        <span>Tip: Left/Right changes questions, Up/Down changes choices, click the number to jump</span>
      </div>

      <div className="quiz-controls">
        <button className="btn btn-secondary nav-btn nav-btn-prev" onClick={onPrev} disabled={currentIndex === 0}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>
        <form className="question-jump" onSubmit={(e) => { e.preventDefault(); submitJump(); }}>
          <input
            aria-label="Jump to question number"
            inputMode="numeric"
            type="number"
            min="1"
            max={total}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={submitJump}
          />
          <span>/ {total}</span>
        </form>
        <button className="btn btn-primary nav-btn nav-btn-next" onClick={isLast ? onFinish : onNext}>
          <span>{isLast ? "Finish Quiz" : "Next"}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isLast
              ? <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>
              : <path d="M5 12h14M12 5l7 7-7 7" />}
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Question Input ───────────────────────────────────────────────────────────
function QuestionInput({ question, userAnswer, onAnswer, onToggleMulti }) {
  if (question.type === "multiple_response") {
    const selected = Array.isArray(userAnswer) ? userAnswer : [];
    return (
      <>
        <div className="question-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          Select all that apply
        </div>
        {Object.keys(question.options).map((letter) => (
          <label key={letter} className={`option checkbox-option ${selected.includes(letter) ? "selected" : ""}`}>
            <input type="checkbox" value={letter} checked={selected.includes(letter)}
              onChange={() => onToggleMulti(letter)} />
            <div className="checkbox-custom">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="option-content">
              <span className="option-label">{letter}</span>
              <span className="option-text">{question.options[letter]}</span>
            </div>
          </label>
        ))}
      </>
    );
  }

  if (question.type === "multiple_choice") {
    return Object.keys(question.options).map((letter) => (
      <div key={letter} className={`option ${userAnswer === letter ? "selected" : ""}`}
        onClick={() => onAnswer(letter)}>
        <div className="option-label">{letter}</div>
        <div className="option-text">{question.options[letter]}</div>
      </div>
    ));
  }

  if (question.type === "true_false") {
    return (
      <>
        {["true", "false"].map((val) => (
          <div key={val} className={`option ${userAnswer === val ? "selected" : ""}`}
            onClick={() => onAnswer(val)}>
            <div className="option-label">{val === "true" ? "T" : "F"}</div>
            <div className="option-text">{val === "true" ? "True" : "False"}</div>
          </div>
        ))}
      </>
    );
  }

  if (question.type === "short_answer_ai") {
    const { aiEvaluated, aiPending, aiScore, aiFeedback, aiMissingConcepts } = question;
    const isPassing = aiEvaluated && aiScore >= 2;

    return (
      <>
        {question.hint && (
          <div className="question-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            {question.hint}
          </div>
        )}
        <textarea
          className="short-answer-input"
          placeholder="Type your explanation here..."
          rows={5}
          value={userAnswer || ""}
          onChange={(e) => onAnswer(e.target.value)}
          readOnly={aiEvaluated || aiPending}
        />
        {aiPending && (
          <div className="ai-feedback-panel ai-pending">
            <div className="ai-verdict ai-evaluating">⏳ AI is evaluating your answer...</div>
          </div>
        )}
        {aiEvaluated && (
          <div className="ai-feedback-panel">
            <div className={`ai-verdict ${isPassing ? "ai-correct" : "ai-incorrect"}`}>
              {isPassing ? "✅ Correct" : "❌ Incorrect"} — Score: {aiScore}/3
            </div>
            <div className="ai-feedback-body">
              <p>{aiFeedback}</p>
              {aiMissingConcepts?.length > 0 && (
                <p className="ai-missing">
                  <strong>Missing concepts:</strong> {aiMissingConcepts.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // short_answer / fill_in_blank
  return (
    <>
      {question.hint && (
        <div className="question-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          {question.hint}
        </div>
      )}
      <input
        type="text"
        className="text-input"
        placeholder={question.type === "fill_in_blank" ? "Fill in the blank..." : "Type your answer..."}
        value={userAnswer || ""}
        onChange={(e) => onAnswer(e.target.value)}
        autoFocus
      />
    </>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ results, onRetake, onBack }) {
  const pct = Math.round(results.percentage);
  const circumference = 2 * Math.PI * 85;
  const offset = circumference - (results.percentage / 100) * circumference;

  return (
    <div className="screen">
      <div className="container">
        <div className="results-header">
          <div className="score-circle">
            <svg className="score-ring" width="200" height="200">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle className="ring-bg" cx="100" cy="100" r="85" />
              <circle className="ring-fill" cx="100" cy="100" r="85"
                style={{ strokeDashoffset: offset }} />
            </svg>
            <div className="score-text">
              <div className="score-percent">{pct}%</div>
              <div className="score-label">Score</div>
            </div>
          </div>
          <h2>Quiz Complete! 🎉</h2>
          <div className="results-summary">
            <div className="summary-item">
              <span className="summary-icon">✓</span>
              <span className="summary-label">Correct</span>
              <span className="summary-value correct">{results.correctCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">✗</span>
              <span className="summary-label">Incorrect</span>
              <span className="summary-value incorrect">{results.incorrectCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⏱</span>
              <span className="summary-label">Time</span>
              <span className="summary-value">{formatDuration(results.duration)}</span>
            </div>
          </div>
        </div>

        <div className="results-section">
          <h3>Detailed Review</h3>
          <div className="results-details">
            {results.questions.map((q, idx) => (
              <ResultItem key={idx} q={q} idx={idx} />
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button className="btn btn-primary" onClick={onRetake}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Retake Quiz
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Choose Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultItem({ q, idx }) {
  const icon = q.isCorrect ? "✓" : "✗";
  const statusClass = q.isCorrect ? "correct" : "incorrect";

  let userAnswerText = "Not answered";
  if (q.type === "multiple_response" && Array.isArray(q.userAnswer) && q.userAnswer.length > 0) {
    userAnswerText = q.userAnswer.map((l) => `${l}. ${q.options[l]}`).join(", ");
  } else if (q.type === "multiple_choice" && q.userAnswer) {
    userAnswerText = `${q.userAnswer}. ${q.options[q.userAnswer]}`;
  } else if (q.userAnswer) {
    userAnswerText = q.userAnswer;
  }

  const correctText = !q.isCorrect ? getCorrectAnswerText(q) : null;

  return (
    <div className={`result-item ${statusClass}`}>
      <div className="result-header">
        <div className="result-icon">{icon}</div>
        <div className="result-question">{idx + 1}. {q.question}</div>
      </div>
      <div className="result-answer">Your answer: <strong>{userAnswerText}</strong></div>
      {correctText && <div className="result-correct">Correct answer: {correctText}</div>}
      {q.type === "short_answer_ai" && q.aiFeedback && (
        <div className="result-ai">
          <strong>AI Score:</strong> {q.aiScore}/3<br />
          <strong>Feedback:</strong> {q.aiFeedback}
        </div>
      )}
    </div>
  );
}

// ─── Grading Overlay ──────────────────────────────────────────────────────────
function GradingOverlay({ done, total }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div id="ai-grading-overlay">
      <div className="ai-grading-content">
        <div className="ai-grading-icon">🤖</div>
        <h2>Grading your answers...</h2>
        <p>AI is evaluating your written responses. Please wait.</p>
        <div className="ai-grading-bar-wrap">
          <div className="ai-grading-bar" style={{ width: `${pct}%` }} />
        </div>
        <p className="ai-grading-status">{done} / {total} evaluated</p>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? "#dc2626" : "#16a34a",
      color: "white", padding: "14px 22px", borderRadius: 12,
      fontSize: "0.9rem", fontWeight: 600, zIndex: 99999,
      maxWidth: "90vw", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
    }}>
      {msg}
    </div>
  );
}
