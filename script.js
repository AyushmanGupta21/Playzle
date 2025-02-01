// Mobile menu toggle
document.getElementById("menuToggle")?.addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("active")
})

// Modal functionality
const modal = document.getElementById("loginModal")
const modalTitle = document.getElementById("modalTitle")
const authForm = document.getElementById("authForm")
let isLoginMode = true

function openLoginModal() {
  modal.style.display = "block"
}

function closeLoginModal() {
  modal.style.display = "none"
  resetForm()
}

function toggleAuthMode(e) {
  e.preventDefault()
  isLoginMode = !isLoginMode
  modalTitle.textContent = isLoginMode ? "Login" : "Sign Up"
  const switchText = document.querySelector(".switch-form")
  switchText.innerHTML = isLoginMode
    ? 'Don\'t have an account? <a href="#" onclick="toggleAuthMode(event)">Sign Up</a>'
    : 'Already have an account? <a href="#" onclick="toggleAuthMode(event)">Login</a>'
  resetForm()
}

function resetForm() {
  authForm.reset()
}

function handleAuth(e) {
  e.preventDefault()
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  // Simulate authentication
  setTimeout(() => {
    // In a real app, you would validate credentials with a server
    localStorage.setItem("isLoggedIn", "true")
    updateUIForLoggedInUser()
    closeLoginModal()
  }, 1000)
}

function updateUIForLoggedInUser() {
  document.querySelector(".login-btn").style.display = "none"
  document.querySelector(".explore-btn").style.display = "none"
  document.getElementById("journeyBtn").classList.remove("hidden")
  document.getElementById("secondaryJourneyBtn").classList.remove("hidden")
}

// Check login status on page load
window.addEventListener("load", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    updateUIForLoggedInUser()
  }
})

// Handle contact form submission
function handleContact(e) {
  e.preventDefault()
  const name = document.getElementById("name")?.value
  const email = document.getElementById("contact-email")?.value
  const message = document.getElementById("message")?.value

  // In a real app, you would send this data to a server
  alert("Message sent successfully!")
  e.target.reset()
}

// Close modal when clicking outside
window.onclick = (event) => {
  if (event.target === modal) {
    closeLoginModal()
  }
}

