# Quiz Reviewer 📚

A beautiful, interactive quiz reviewer with a stunning dark theme UI. Users can select from pre-loaded quizzes and review their knowledge.

![Quiz Reviewer](https://via.placeholder.com/1200x400/0f0f1a/6366f1?text=Quiz+Reviewer)

## ✨ Features

- 🎨 **Beautiful Dark Theme** - Modern, eye-friendly interface
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Instant Feedback** - Get results immediately after completion
- 📊 **Detailed Results** - See which questions you got right/wrong
- ⏱️ **Time Tracking** - Track how long it takes to complete
- 🔄 **Retake Quizzes** - Practice as many times as you want

## 🚀 Quick Start

### Option 1: Use GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/root` folder
5. Click Save
6. Your site will be live at `https://yourusername.github.io/quiz-reviewer`

### Option 2: Run Locally

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quiz-reviewer.git
cd quiz-reviewer
```

2. Open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

## 📝 Adding Your Own Quizzes

### Step 1: Open `quizzes/data.js`

### Step 2: Add a new quiz object:

```javascript
{
    id: 'your-quiz-id',              // Unique identifier
    title: 'Your Quiz Title',         // Display name
    description: 'Quiz description',  // Short description
    icon: '📚',                       // Emoji icon
    questions: [
        // Your questions here
    ]
}
```

### Step 3: Add questions

#### Multiple Choice Question:
```javascript
{
    type: 'multiple_choice',
    question: 'What is the capital of France?',
    options: {
        A: 'London',
        B: 'Paris',
        C: 'Berlin',
        D: 'Madrid'
    },
    correctAnswer: 'B'
}
```

#### True/False Question:
```javascript
{
    type: 'true_false',
    question: 'The Earth is flat.',
    correctAnswer: false
}
```

#### Short Answer (Advanced):
```javascript
{
    type: 'short_answer',
    question: 'What is the capital of Japan?',
    correctAnswers: ['Tokyo', 'tokyo']  // Accept multiple variations
}
```

#### Fill in the Blank (Advanced):
```javascript
{
    type: 'fill_in_blank',
    question: 'The largest planet is _____.',
    correctAnswers: ['Jupiter', 'jupiter']
}
```

## 📁 Project Structure

```
quiz-reviewer/
├── index.html           # Main HTML file
├── css/
│   └── styles.css      # All styles (dark theme)
├── js/
│   ├── quiz.js         # Quiz logic
│   └── app.js          # Application logic
├── quizzes/
│   └── data.js         # Quiz data (ADD YOUR QUIZZES HERE!)
└── README.md           # This file
```

## 🎨 Customization

### Change Colors

Edit `css/styles.css` (lines 1-10):

```css
:root {
    --primary: #6366f1;      /* Main color */
    --secondary: #ec4899;    /* Accent color */
    --success: #10b981;      /* Correct answers */
    --error: #ef4444;        /* Wrong answers */
}
```

### Change Title

Edit `index.html`:

```html
<title>Your Quiz App Name</title>
<h1>Your Quiz App Name</h1>
```

## 🎯 Question Types Supported

| Type | Description | Example |
|------|-------------|---------|
| **Multiple Choice** | 4 options (A-D) | "What is 2+2?" |
| **True/False** | Binary choice | "The sky is blue." |
| **Short Answer** | Text input | "Capital of France?" |
| **Fill-in-Blank** | Complete sentence | "Water is ___." |

## 🔧 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 📱 Mobile Friendly

Fully responsive design that works on:
- 📱 Phones
- 📱 Tablets
- 💻 Desktops

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for any purpose!

## 🙏 Acknowledgments

- Beautiful dark theme design
- Smooth animations and transitions
- Mobile-first responsive layout

## 📞 Support

- Open an issue for bug reports
- Star the repo if you find it useful!
- Share with others

---

**Made with ❤️ for learners**

[Live Demo](#) | [Report Bug](#) | [Request Feature](#)
