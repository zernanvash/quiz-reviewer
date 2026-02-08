// quiz.js - Quiz state management and logic

class Quiz {
    constructor(questions, title = 'Quiz') {
        this.questions = questions;
        this.title = title;
        this.currentQuestionIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.timerInterval = null;
    }
    
    start() {
        this.startTime = new Date();
        this.startTimer();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((new Date() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }
    
    answerQuestion(answer) {
        const question = this.getCurrentQuestion();
        question.userAnswer = answer;
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }
    
    canGoNext() {
        return this.currentQuestionIndex < this.questions.length - 1;
    }
    
    canGoPrevious() {
        return this.currentQuestionIndex > 0;
    }
    
    isLastQuestion() {
        return this.currentQuestionIndex === this.questions.length - 1;
    }
    
    getProgress() {
        return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    }
    
    finish() {
        this.endTime = new Date();
        this.stopTimer();
        return this.calculateResults();
    }
    
    calculateResults() {
        let correctCount = 0;
        
        this.questions.forEach(question => {
            question.isCorrect = this.checkAnswer(question);
            if (question.isCorrect) {
                correctCount++;
            }
        });
        
        const totalQuestions = this.questions.length;
        const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
        const duration = this.endTime - this.startTime;
        
        return {
            title: this.title,
            totalQuestions,
            correctCount,
            incorrectCount: totalQuestions - correctCount,
            percentage: Math.round(percentage * 10) / 10,
            duration,
            startTime: this.startTime,
            endTime: this.endTime,
            questions: this.questions
        };
    }
    
    checkAnswer(question) {
        if (!question.userAnswer) return false;
        
        switch (question.type) {
            case 'multiple_choice':
                if (!question.correctAnswer) return false;
                return question.userAnswer.toUpperCase() === question.correctAnswer.toUpperCase();
            
            case 'true_false':
                if (question.correctAnswer === null || question.correctAnswer === undefined) return false;
                const userBool = this.parseBooleanAnswer(question.userAnswer);
                return userBool === question.correctAnswer;
            
            case 'short_answer':
            case 'fill_in_blank':
                if (!question.correctAnswers || question.correctAnswers.length === 0) return false;
                const userAnswer = question.userAnswer.trim().toLowerCase();
                return question.correctAnswers.some(ans => 
                    ans.toLowerCase() === userAnswer
                );
            
            default:
                return false;
        }
    }
    
    parseBooleanAnswer(answer) {
        const normalized = String(answer).toLowerCase().trim();
        return normalized === 'true' || normalized === 't' || normalized === '1' || normalized === 'yes';
    }
    
    reset() {
        this.currentQuestionIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.questions.forEach(q => {
            q.userAnswer = null;
            q.isCorrect = false;
        });
    }
    
    exportResults(results) {
        const data = {
            title: results.title,
            date: results.endTime.toISOString(),
            score: `${results.correctCount}/${results.totalQuestions}`,
            percentage: `${results.percentage}%`,
            duration: this.formatDuration(results.duration),
            questions: results.questions.map((q, idx) => ({
                number: idx + 1,
                type: q.type,
                question: q.question,
                userAnswer: q.userAnswer,
                correctAnswer: this.getCorrectAnswerText(q),
                isCorrect: q.isCorrect
            }))
        };
        
        return data;
    }
    
    getCorrectAnswerText(question) {
        switch (question.type) {
            case 'multiple_choice':
                return question.correctAnswer ? 
                    `${question.correctAnswer}. ${question.options[question.correctAnswer]}` : 
                    'Not provided';
            
            case 'true_false':
                return question.correctAnswer !== null && question.correctAnswer !== undefined ? 
                    String(question.correctAnswer) : 
                    'Not provided';
            
            case 'short_answer':
            case 'fill_in_blank':
                return question.correctAnswers && question.correctAnswers.length > 0 ? 
                    question.correctAnswers.join(', ') : 
                    'Not provided';
            
            default:
                return 'Unknown';
        }
    }
    
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
}

// Export for use in other modules
window.Quiz = Quiz;
