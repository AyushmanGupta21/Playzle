const quizCards = document.querySelectorAll(".quiz-card")
const quizContainer = document.querySelector(".quiz-container")
const quizSelection = document.querySelector(".quiz-selection")
const questionElement = document.getElementById("question")
const optionsElement = document.getElementById("options")
const resultElement = document.getElementById("result")
const nextQuestionButton = document.getElementById("nextQuestion")
const quizTypeElement = document.getElementById("quizType")
const scoreElement = document.getElementById("score")

let currentQuiz = null
let currentQuestion = null
let score = 0
let questionIndex = 0

const mathQuestions = [
  {
    question: "What is 15 + 27?",
    options: ["40", "42", "43", "45"],
    correctAnswer: 1,
  },
  {
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
  },
  {
    question: "What is 8 x 7?",
    options: ["54", "56", "58", "60"],
    correctAnswer: 1,
  },
  {
    question: "What is 72 ÷ 9?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 2,
  },
  {
    question: "What is 17 - 9?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 2,
  },
  {
    question: "What is 5^3?",
    options: ["75", "100", "125", "150"],
    correctAnswer: 2,
  },
  {
    question: "What is the next number in the sequence: 2, 4, 8, 16, ...?",
    options: ["24", "28", "30", "32"],
    correctAnswer: 3,
  },
  {
    question: "What is 30% of 200?",
    options: ["40", "50", "60", "70"],
    correctAnswer: 2,
  },
  {
    question: "If x + 5 = 12, what is x?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
  },
  {
    question: "What is the area of a rectangle with length 8 and width 5?",
    options: ["35", "38", "40", "45"],
    correctAnswer: 2,
  },
]

const codingQuestions = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Multi Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language",
    ],
    correctAnswer: 0,
  },
  {
    question: "Which of the following is not a programming language?",
    options: ["Python", "Java", "HTML", "C++"],
    correctAnswer: 2,
  },
  {
    question: "What is the correct way to declare a variable in JavaScript?",
    options: ["var x = 5;", "variable x = 5;", "x = 5;", "int x = 5;"],
    correctAnswer: 0,
  },
  {
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
    correctAnswer: 2,
  },
  {
    question: "Which symbol is used for comments in Python?",
    options: ["//", "/* */", "#", "<!-- -->"],
    correctAnswer: 2,
  },
  {
    question: "What is the result of 3 == '3' in JavaScript?",
    options: ["true", "false", "undefined", "NaN"],
    correctAnswer: 0,
  },
  {
    question: "Which method is used to add an element to the end of an array in JavaScript?",
    options: ["push()", "append()", "add()", "insert()"],
    correctAnswer: 0,
  },
  {
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Interface",
      "Automated Programming Interface",
      "Application Process Integration",
    ],
    correctAnswer: 0,
  },
  {
    question: "Which of the following is a valid way to create a function in JavaScript?",
    options: ["function myFunction() {}", "def myFunction():", "void myFunction() {}", "function: myFunction()"],
    correctAnswer: 0,
  },
  {
    question: "What is the purpose of the 'git clone' command?",
    options: [
      "To create a new repository",
      "To copy a repository from a remote source",
      "To merge branches",
      "To push changes to a remote repository",
    ],
    correctAnswer: 1,
  },
]

quizCards.forEach((card) => {
  card.addEventListener("click", () => startQuiz(card.dataset.quiz))
})

function startQuiz(quizType) {
  currentQuiz = quizType
  quizSelection.classList.add("hidden")
  quizContainer.classList.remove("hidden")
  quizTypeElement.textContent = quizType.charAt(0).toUpperCase() + quizType.slice(1) + " Quiz"
  score = 0
  questionIndex = 0
  showQuestion()
  updateScore()
}

function showQuestion() {
  currentQuestion = (currentQuiz === "math" ? mathQuestions : codingQuestions)[questionIndex]
  questionElement.textContent = currentQuestion.question
  optionsElement.innerHTML = ""
  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button")
    button.classList.add("option")
    button.textContent = option
    button.addEventListener("click", () => selectAnswer(index))
    optionsElement.appendChild(button)
  })
  resultElement.classList.add("hidden")
  nextQuestionButton.classList.add("hidden")
}

function selectAnswer(selectedIndex) {
  const options = document.querySelectorAll(".option")
  options.forEach((option, index) => {
    option.disabled = true
    if (index === currentQuestion.correctAnswer) {
      option.classList.add("correct")
    } else if (index === selectedIndex) {
      option.classList.add("incorrect")
    }
  })

  const correct = selectedIndex === currentQuestion.correctAnswer
  resultElement.textContent = correct
    ? "Congratulations! That's correct!"
    : `Sorry, that's incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}`
  resultElement.classList.remove("hidden")
  resultElement.classList.add(correct ? "correct" : "incorrect")
  nextQuestionButton.classList.remove("hidden")
  if (correct) score++
  updateScore()
}

function updateScore() {
  scoreElement.textContent = `Score: ${score}/${questionIndex + 1}`
}

nextQuestionButton.addEventListener("click", () => {
  questionIndex++
  if (questionIndex < 10) {
    showQuestion()
  } else {
    endQuiz()
  }
})

function endQuiz() {
  quizContainer.innerHTML = `
        <h2>${currentQuiz.charAt(0).toUpperCase() + currentQuiz.slice(1)} Quiz Completed!</h2>
        <p>Your final score is: ${score} out of 10</p>
        <button id="restartQuiz" class="btn">Restart Quiz</button>
    `
  document.getElementById("restartQuiz").addEventListener("click", () => {
    location.reload()
  })
}

