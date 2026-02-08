// app.js - Main application logic

let currentQuiz = null;
let currentQuestionIndex = 0;
let startTime = null;
let timerInterval = null;
let userAnswers = [];
let quizData = null;

// Load quizzes from external file
async function loadQuizzes() {
    try {
        // 1. Fetch the .json file instead of .js
        const response = await fetch('quizzes/data.json');
        
        // 2. Parse the JSON data directly
        allQuizzes = await response.json();
        
        if (allQuizzes && allQuizzes.length > 0) {
            displayQuizList(allQuizzes);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading quizzes:', error);
        showEmptyState();
    }
}

// Display quiz list
function displayQuizList(quizzes) {
    const quizList = document.getElementById('quiz-list');
    
    quizList.innerHTML = quizzes.map(quiz => `
    <button class="quiz-card" onclick="selectQuiz('${quiz.id}')" type="button">
            <div class="quiz-card-header">
                <div class="quiz-icon">${quiz.icon}</div>
                <div>
                    <h3>${quiz.title}</h3>
                </div>
            </div>
            <p>${quiz.description}</p>
            <div class="quiz-meta">
                <span>📝 ${quiz.questions.length} question${quiz.questions.length !== 1 ? 's' : ''}</span>
            </div>
        </div>
    `).join('');
}

// Show empty state
function showEmptyState() {
    const quizList = document.getElementById('quiz-list');
    quizList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>No Quizzes Available</h3>
            <p>Add quizzes to <code>quizzes/data.js</code> to get started!</p>
        </div>
    `;
}

function selectQuiz(quizId) {
    // 3. Reference the global allQuizzes variable we just populated
    const quiz = allQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    quizData = JSON.parse(JSON.stringify(quiz));
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData.questions.length).fill(null);
    
    currentQuiz = new Quiz(quizData.questions, quizData.title);
    document.getElementById('quiz-title').textContent = quizData.title;
    
    showScreen('quiz-screen');
    
    startTime = new Date();
    startTimer();
    currentQuiz.start();
    displayQuestion();
}

// Start timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Display current question
function displayQuestion() {
    const question = currentQuiz.getCurrentQuestion();
    const questionNumber = currentQuestionIndex + 1;
    const totalQuestions = currentQuiz.questions.length;
    
    // Update progress
    const progress = (questionNumber / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Update question number
    document.getElementById('question-number').textContent = 
        `Question ${questionNumber} of ${totalQuestions}`;
    
    // Update question indicator
    document.getElementById('question-indicator').textContent = `${questionNumber} / ${totalQuestions}`;
    
    // Update question text
    document.getElementById('question-text').textContent = question.question;
    
    // Render options based on question type
    const optionsContainer = document.getElementById('options');
    
    if (question.type === 'multiple_choice') {
        optionsContainer.innerHTML = ['A', 'B', 'C', 'D'].map(letter => `
            <div class="option ${userAnswers[currentQuestionIndex] === letter ? 'selected' : ''}" 
                 onclick="selectAnswer('${letter}')">
                <div class="option-label">${letter}</div>
                <div class="option-text">${question.options[letter]}</div>
            </div>
        `).join('');
    } else if (question.type === 'true_false') {
        optionsContainer.innerHTML = `
            <div class="option ${userAnswers[currentQuestionIndex] === 'true' ? 'selected' : ''}" 
                 onclick="selectAnswer('true')">
                <div class="option-label">T</div>
                <div class="option-text">True</div>
            </div>
            <div class="option ${userAnswers[currentQuestionIndex] === 'false' ? 'selected' : ''}" 
                 onclick="selectAnswer('false')">
                <div class="option-label">F</div>
                <div class="option-text">False</div>
            </div>
        `;
    } else if (question.type === 'short_answer' || question.type === 'fill_in_blank') {
        const value = userAnswers[currentQuestionIndex] || '';
        optionsContainer.innerHTML = `
            <input type="text" 
                   class="text-input" 
                   placeholder="Type your answer here..."
                   value="${value}"
                   oninput="selectAnswer(this.value)"
                   autofocus>
        `;
    }
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Select answer
function selectAnswer(answer) {
    userAnswers[currentQuestionIndex] = answer;
    currentQuiz.answerQuestion(answer);
    
    // Re-render to show selection (for multiple choice and true/false)
    const question = currentQuiz.getCurrentQuestion();
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
        displayQuestion();
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Previous button
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Next button
    const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
    if (isLastQuestion) {
        nextBtn.innerHTML = `
            Finish
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
        `;
        nextBtn.onclick = finishQuiz;
    } else {
        nextBtn.innerHTML = `
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        `;
        nextBtn.onclick = nextQuestion;
    }
}

// Next question
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        currentQuiz.currentQuestionIndex = currentQuestionIndex;
        displayQuestion();
    }
}

// Previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        currentQuiz.currentQuestionIndex = currentQuestionIndex;
        displayQuestion();
    }
}

// Finish quiz
function finishQuiz() {
    // Check for unanswered questions
    const unanswered = userAnswers.filter(a => a === null || a === '').length;
    
    if (unanswered > 0) {
        const confirmed = confirm(
            `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
        );
        if (!confirmed) return;
    }
    
    stopTimer();
    calculateResults();
}

// Calculate and display results
function calculateResults() {
    const results = currentQuiz.finish();
    displayResults(results);
}

// Display results screen
function displayResults(results) {
    showScreen('results-screen');
    
    // Update score
    document.getElementById('score-percent').textContent = `${Math.round(results.percentage)}%`;
    
    // Animate score circle
    const circumference = 2 * Math.PI * 85;
    const offset = circumference - (results.percentage / 100) * circumference;
    setTimeout(() => {
        document.getElementById('score-ring').style.strokeDashoffset = offset;
    }, 100);
    
    // Update summary
    document.getElementById('correct-count').textContent = results.correctCount;
    document.getElementById('incorrect-count').textContent = results.incorrectCount;
    document.getElementById('total-time').textContent = currentQuiz.formatDuration(results.duration);
    
    // Display detailed results
    const detailsContainer = document.getElementById('results-details');
    detailsContainer.innerHTML = results.questions.map((q, idx) => {
        const icon = q.isCorrect ? '✓' : '✗';
        const statusClass = q.isCorrect ? 'correct' : 'incorrect';
        
        let userAnswerText = q.userAnswer || 'Not answered';
        if (q.type === 'multiple_choice' && q.userAnswer) {
            userAnswerText = `${q.userAnswer}. ${q.options[q.userAnswer]}`;
        }
        
        let correctAnswerText = '';
        if (!q.isCorrect) {
            if (q.type === 'multiple_choice') {
                const correct = q.correctAnswer;
                correctAnswerText = `${correct}. ${q.options[correct]}`;
            } else if (q.type === 'true_false') {
                correctAnswerText = String(q.correctAnswer);
            } else {
                correctAnswerText = q.correctAnswers ? q.correctAnswers.join(', ') : 'N/A';
            }
        }
        
        return `
            <div class="result-item ${statusClass}">
                <div class="result-header">
                    <div class="result-icon">${icon}</div>
                    <div class="result-question">${idx + 1}. ${q.question}</div>
                </div>
                <div class="result-answer">Your answer: <strong>${userAnswerText}</strong></div>
            </div>
        `;
    }).join('');
}

// Retake quiz
function retakeQuiz() {
    if (!quizData) return;
    
    if (confirm('Retake this quiz? Your current results will be lost.')) {
        selectQuiz(quizData.id);
    }
}

// Back to selection
function backToSelection() {
    if (confirm('Go back to quiz selection?')) {
        stopTimer();
        currentQuiz = null;
        quizData = null;
        currentQuestionIndex = 0;
        userAnswers = [];
        showScreen('selection-screen');
    }
}

// Exit quiz
function exitQuiz() {
    if (confirm('Exit quiz? Your progress will be lost.')) {
        stopTimer();
        currentQuiz = null;
        quizData = null;
        currentQuestionIndex = 0;
        userAnswers = [];
        showScreen('selection-screen');
    }
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Setup SVG gradient for score ring
function setupSVGGradient() {
    const svg = document.querySelector('.score-ring');
    if (!svg) return;
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'scoreGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#6366f1');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#ec4899');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadQuizzes();
    setupSVGGradient();
});
