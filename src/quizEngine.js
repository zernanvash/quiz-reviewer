// src/quizEngine.js — pure logic, no DOM

export function checkAnswer(question) {
  if (!question.userAnswer && question.type !== "short_answer_ai") return false;

  switch (question.type) {
    case "multiple_response": {
      if (!Array.isArray(question.userAnswer) || !question.correctAnswer) return false;
      if (question.userAnswer.length !== question.correctAnswer.length) return false;
      const a = [...question.userAnswer].sort();
      const b = [...question.correctAnswer].sort();
      return b.every((v, i) => v === a[i]);
    }
    case "multiple_choice":
      if (!question.correctAnswer) return false;
      return question.userAnswer.toUpperCase() === question.correctAnswer.toUpperCase();

    case "true_false": {
      if (question.correctAnswer === null || question.correctAnswer === undefined) return false;
      const normalized = String(question.userAnswer).toLowerCase().trim();
      const userBool = normalized === "true" || normalized === "t" || normalized === "1" || normalized === "yes";
      return userBool === question.correctAnswer;
    }
    case "short_answer":
    case "fill_in_blank":
      if (!question.correctAnswers?.length) return false;
      return question.correctAnswers.some(
        (ans) => ans.toLowerCase() === question.userAnswer.trim().toLowerCase()
      );

    case "short_answer_ai":
      if (!question.aiEvaluated) return false;
      return question.aiScore >= 2;

    default:
      return false;
  }
}

export function calculateResults(questions, startTime, endTime, title) {
  const scored = questions.map((q) => ({ ...q, isCorrect: checkAnswer(q) }));
  const correctCount = scored.filter((q) => q.isCorrect).length;
  const totalQuestions = scored.length;
  const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  return {
    title,
    totalQuestions,
    correctCount,
    incorrectCount: totalQuestions - correctCount,
    percentage: Math.round(percentage * 10) / 10,
    duration: endTime - startTime,
    questions: scored,
  };
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

export function getCorrectAnswerText(question) {
  switch (question.type) {
    case "multiple_choice":
      return question.correctAnswer
        ? `${question.correctAnswer}. ${question.options[question.correctAnswer]}`
        : "Not provided";
    case "true_false":
      return question.correctAnswer !== null && question.correctAnswer !== undefined
        ? String(question.correctAnswer)
        : "Not provided";
    case "short_answer":
    case "fill_in_blank":
      return question.correctAnswers?.length ? question.correctAnswers.join(", ") : "Not provided";
    case "multiple_response":
      return Array.isArray(question.correctAnswer)
        ? question.correctAnswer.map((k) => `${k}: ${question.options[k]}`).join(", ")
        : "Not provided";
    case "short_answer_ai":
      return question.aiEvaluated ? `AI Score: ${question.aiScore}/3` : "Not evaluated";
    default:
      return "Unknown";
  }
}
