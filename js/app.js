// app.js - Main application logic

let currentQuiz = null;
let currentQuestionIndex = 0;
let startTime = null;
let timerInterval = null;
let userAnswers = [];
let quizData = null;
let allQuizzes = []; // Store quiz metadata

// Load quiz index
async function loadQuizzes() {
    try {
        const response = await fetch('quizzes/index.json');
        allQuizzes = await response.json();
        
        if (allQuizzes && allQuizzes.length > 0) {
            displayQuizList(allQuizzes);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading quiz index:', error);
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
                <span class="quiz-badge">Click to start</span>
            </div>
        </button>
    `).join('');
}

// Show empty state
function showEmptyState() {
    const quizList = document.getElementById('quiz-list');
    quizList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>No Quizzes Available</h3>
            <p>Add quiz files to <code>quizzes/</code> folder and update <code>index.json</code></p>
        </div>
    `;
}

// Select and load quiz
async function selectQuiz(quizId) {
    const quizMeta = allQuizzes.find(q => q.id === quizId);
    if (!quizMeta) return;
    
    try {
        // Show loading
        showLoadingOverlay('Loading quiz...');
        
        // Load the specific quiz file
        const response = await fetch(`quizzes/${quizMeta.file}`);
        const quizContent = await response.json();
        
        hideLoadingOverlay();
        
        // Initialize quiz
        quizData = {
            id: quizMeta.id,
            title: quizMeta.title,
            description: quizMeta.description,
            icon: quizMeta.icon,
            questions: quizContent.questions
        };
        
        currentQuestionIndex = 0;
        userAnswers = new Array(quizData.questions.length).fill(null);
        
        currentQuiz = new Quiz(quizData.questions, quizData.title);
        document.getElementById('quiz-title').textContent = quizData.title;
        
        showScreen('quiz-screen');
        
        startTime = new Date();
        startTimer();
        currentQuiz.start();
        displayQuestion();
        
    } catch (error) {
        hideLoadingOverlay();
        console.error('Error loading quiz:', error);
        alert('Failed to load quiz. Please try again.');
    }
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
    const container = document.getElementById('options');
    
    // Update question info
    const questionNum = currentQuestionIndex + 1;
    const totalQuestions = currentQuiz.questions.length;
    document.getElementById('question-number').textContent = `Question ${questionNum} of ${totalQuestions}`;
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-indicator').textContent = `${questionNum} / ${totalQuestions}`;
    
    // Update progress bar
    const progress = (questionNum / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Render based on question type
    if (question.type === 'multiple_response') {
        // Multiple response with checkboxes
        const userAnswer = userAnswers[currentQuestionIndex] || [];
        
        container.innerHTML = `
            <div class="question-hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Select all that apply
            </div>
            ${Object.keys(question.options).map(letter => {
                const isChecked = userAnswer.includes(letter);
                return `
                    <label class="option checkbox-option ${isChecked ? 'selected' : ''}" for="option-${letter}">
                        <input type="checkbox" 
                               id="option-${letter}" 
                               name="quiz-option" 
                               value="${letter}"
                               ${isChecked ? 'checked' : ''}
                               onchange="toggleMultipleAnswer('${letter}')">
                        <div class="checkbox-custom">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <div class="option-content">
                            <span class="option-label">${letter}</span>
                            <span class="option-text">${question.options[letter]}</span>
                        </div>
                    </label>
                `;
            }).join('')}
        `;
        
    } else if (question.type === 'multiple_choice') {
        // Single choice with radio buttons
        container.innerHTML = Object.keys(question.options).map(letter => {
            const isSelected = userAnswers[currentQuestionIndex] === letter;
            return `
                <div class="option ${isSelected ? 'selected' : ''}" 
                     onclick="selectAnswer('${letter}')">
                    <div class="option-label">${letter}</div>
                    <div class="option-text">${question.options[letter]}</div>
                </div>
            `;
        }).join('');
        
    } else if (question.type === 'true_false') {
        container.innerHTML = `
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
        const placeholder = question.type === 'fill_in_blank' ? 
            'Fill in the blank...' : 'Type your answer...';
        container.innerHTML = `
            <input type="text" 
                   class="text-input" 
                   placeholder="${placeholder}"
                   value="${value}"
                   oninput="selectAnswer(this.value)"
                   autofocus>
        `;
    }
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Select answer for single choice questions
function selectAnswer(answer) {
    userAnswers[currentQuestionIndex] = answer;
    currentQuiz.answerQuestion(answer);
    
    // Re-render for visual feedback
    const question = currentQuiz.getCurrentQuestion();
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
        displayQuestion();
    }
}

// Toggle answer for multiple response questions
function toggleMultipleAnswer(letter) {
    if (!Array.isArray(userAnswers[currentQuestionIndex])) {
        userAnswers[currentQuestionIndex] = [];
    }
    
    const answers = userAnswers[currentQuestionIndex];
    const index = answers.indexOf(letter);
    
    if (index === -1) {
        answers.push(letter);
    } else {
        answers.splice(index, 1);
    }
    
    // Sort to maintain consistent order
    answers.sort();
    
    currentQuiz.answerQuestion(answers);
    displayQuestion();
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
            Finish Quiz
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
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        currentQuiz.currentQuestionIndex = currentQuestionIndex;
        displayQuestion();
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Finish quiz
function finishQuiz() {
    // Check for unanswered questions
    const unanswered = userAnswers.filter(a => 
        a === null || a === '' || (Array.isArray(a) && a.length === 0)
    ).length;
    
    if (unanswered > 0) {
        const confirmed = confirm(
            `⚠️ You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.\n\nSubmit quiz anyway?`
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
    const percentage = Math.round(results.percentage);
    document.getElementById('score-percent').textContent = `${percentage}%`;
    
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
        
        // Format user answer
        let userAnswerText = 'Not answered';
        if (q.type === 'multiple_response' && Array.isArray(q.userAnswer)) {
            if (q.userAnswer.length > 0) {
                userAnswerText = q.userAnswer.map(letter => 
                    `${letter}. ${q.options[letter]}`
                ).join(', ');
            }
        } else if (q.type === 'multiple_choice' && q.userAnswer) {
            userAnswerText = `${q.userAnswer}. ${q.options[q.userAnswer]}`;
        } else if (q.userAnswer) {
            userAnswerText = q.userAnswer;
        }
        
        // Format correct answer for incorrect questions
        let correctAnswerHTML = '';
        if (!q.isCorrect) {
            let correctAnswerText = '';
            if (q.type === 'multiple_response' && Array.isArray(q.correctAnswer)) {
                correctAnswerText = q.correctAnswer.map(letter => 
                    `${letter}. ${q.options[letter]}`
                ).join(', ');
            } else if (q.type === 'multiple_choice') {
                const correct = q.correctAnswer;
                correctAnswerText = `${correct}. ${q.options[correct]}`;
            } else if (q.type === 'true_false') {
                correctAnswerText = String(q.correctAnswer);
            } else {
                correctAnswerText = q.correctAnswers ? q.correctAnswers.join(', ') : 'N/A';
            }
            correctAnswerHTML = `<div class="result-correct">Correct answer: ${correctAnswerText}</div>`;
        }
        
        return `
            <div class="result-item ${statusClass}">
                <div class="result-header">
                    <div class="result-icon">${icon}</div>
                    <div class="result-question">${idx + 1}. ${q.question}</div>
                </div>
                <div class="result-answer">Your answer: <strong>${userAnswerText}</strong></div>
                ${correctAnswerHTML}
            </div>
        `;
    }).join('');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Retake quiz
function retakeQuiz() {
    if (!quizData) return;
    
    if (confirm('🔄 Retake this quiz?\n\nYour current results will be lost.')) {
        selectQuiz(quizData.id);
    }
}

// Back to selection
function backToSelection() {
    if (confirm('🏠 Return to quiz selection?\n\nYour results will be cleared.')) {
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
    if (confirm('⚠️ Exit quiz?\n\nYour progress will be lost.')) {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Loading overlay
function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Only in quiz screen
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (!document.getElementById('prev-btn').disabled) {
                previousQuestion();
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextQuestion();
        }
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadQuizzes();
    setupSVGGradient();
});
