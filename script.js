// Hamburger Menu Toggle
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("nav-menu")

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active")
  navMenu.classList.toggle("active")
})

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  }),
)

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Navbar background change on scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(255, 255, 255, 0.95)"
    navbar.style.backdropFilter = "blur(10px)"
  } else {
    navbar.style.background = "#fff"
    navbar.style.backdropFilter = "none"
  }
})

// Set minimum date for appointment to today
const dateInput = document.getElementById("date")
if (dateInput) {
  const today = new Date().toISOString().split("T")[0]
  dateInput.setAttribute("min", today)
}

// Form submission with AJAX
const appointmentForm = document.getElementById("appointmentForm")
const alertContainer = document.getElementById("alert-container")

function showAlert(message, type) {
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type}`

  // Format message untuk success dengan nomor antrian
  if (type === "success") {
    alertDiv.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 15px;">
        <i class="fas fa-check-circle" style="font-size: 1.5rem; margin-top: 5px; color: #28a745;"></i>
        <div style="flex: 1;">
          <div style="white-space: pre-line; line-height: 1.6; font-size: 14px;">${message}</div>
        </div>
      </div>
    `
  } else {
    alertDiv.innerHTML = `
      <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
      ${message}
    `
  }

  alertContainer.innerHTML = ""
  alertContainer.appendChild(alertDiv)

  // Auto-hide alert after 10 seconds for success (longer for queue number), 5 seconds for error
  const hideDelay = type === "success" ? 10000 : 5000
  setTimeout(() => {
    alertDiv.style.opacity = "0"
    alertDiv.style.transform = "translateY(-20px)"
    setTimeout(() => {
      alertDiv.remove()
    }, 300)
  }, hideDelay)

  // Scroll to alert
  alertContainer.scrollIntoView({ behavior: "smooth", block: "center" })
}

function validateForm(formData) {
  const name = formData.get("name").trim()
  const email = formData.get("email").trim()
  const phone = formData.get("phone").trim()
  const service = formData.get("service")
  const date = formData.get("date")
  const time = formData.get("time")

  if (!name || !email || !phone || !service || !date || !time) {
    showAlert("Mohon lengkapi semua field yang wajib diisi (*)", "error")
    return false
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showAlert("Format email tidak valid", "error")
    return false
  }

  // Validate phone number (Indonesian format)
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
  if (!phoneRegex.test(phone.replace(/\s|-/g, ""))) {
    showAlert("Format nomor telepon tidak valid", "error")
    return false
  }

  // Validate date (not in the past)
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (selectedDate < today) {
    showAlert("Tanggal tidak boleh di masa lalu", "error")
    return false
  }

  return true
}

if (appointmentForm) {
  appointmentForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    const formData = new FormData(this)

    // Validate form
    if (!validateForm(formData)) {
      return
    }

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.disabled = true
    submitBtn.innerHTML = '<div class="loading"></div> Memproses...'

    try {
      const { data, error } = await supabase.from('appointments').insert([{
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      service: formData.get("service"),
      doctor: formData.get("doctor"),
      date: formData.get("date"),
      time: formData.get("time"),
      message: formData.get("message")
    }]);
    
      if (error) {
        showAlert("Gagal menyimpan data: " + error.message, "error");
      } else {
        showAlert("Janji berhasil dibuat!", "success");
        appointmentForm.reset();
      }
    } catch (error) {
      showAlert("Terjadi kesalahan koneksi ke database.", "error");
    } finally {
      // Reset button state
      submitBtn.disabled = false
      submitBtn.innerHTML = originalText
    }
  })
}

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1"
      entry.target.style.transform = "translateY(0)"
    }
  })
}, observerOptions)

// Observe elements for animation
document.querySelectorAll(".service-card, .feature, .stat").forEach((el) => {
  el.style.opacity = "0"
  el.style.transform = "translateY(30px)"
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
  observer.observe(el)
})

// Counter animation for stats
const animateCounter = (element, target) => {
  let current = 0
  const increment = target / 100
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current) + (target >= 1000 ? "+" : "+")
  }, 20)
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector(".about-stats")
if (statsSection) {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const stats = entry.target.querySelectorAll(".stat h3")
          stats.forEach((stat) => {
            const target = Number.parseInt(stat.textContent)
            animateCounter(stat, target)
          })
          statsObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.5 },
  )

  statsObserver.observe(statsSection)
}
