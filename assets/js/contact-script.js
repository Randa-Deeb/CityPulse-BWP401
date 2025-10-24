// ===== CONTACT FORM FUNCTIONALITY =====

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'success' or 'error'
 */
function showToast(message, type = "success") {
  const toastEl =
    type === "success"
      ? document.getElementById("successToast")
      : document.getElementById("errorToast");

  const toastMessageEl =
    type === "success"
      ? document.getElementById("successToastMessage")
      : document.getElementById("errorToastMessage");

  toastMessageEl.textContent = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate contact form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateContactForm(form) {
  const result = {
    isValid: true,
    errors: [],
  };

  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const subjectInput = document.getElementById("contactSubject");
  const messageInput = document.getElementById("contactMessage");

  // Reset validation states
  [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
    input.classList.remove("is-invalid", "is-valid");
  });

  // Validate Name
  if (!nameInput.value.trim()) {
    result.isValid = false;
    result.errors.push("Full name is required");
    nameInput.classList.add("is-invalid");
  } else if (nameInput.value.trim().length < 2) {
    result.isValid = false;
    result.errors.push("Name must be at least 2 characters long");
    nameInput.classList.add("is-invalid");
  } else {
    nameInput.classList.add("is-valid");
  }

  // Validate Email
  if (!emailInput.value.trim()) {
    result.isValid = false;
    result.errors.push("Email address is required");
    emailInput.classList.add("is-invalid");
  } else if (!isValidEmail(emailInput.value)) {
    result.isValid = false;
    result.errors.push("Please enter a valid email address");
    emailInput.classList.add("is-invalid");
  } else {
    emailInput.classList.add("is-valid");
  }

  // Validate Subject
  if (!subjectInput.value) {
    result.isValid = false;
    result.errors.push("Please select a subject");
    subjectInput.classList.add("is-invalid");
  } else {
    subjectInput.classList.add("is-valid");
  }

  // Validate Message
  if (!messageInput.value.trim()) {
    result.isValid = false;
    result.errors.push("Message is required");
    messageInput.classList.add("is-invalid");
  } else if (messageInput.value.trim().length < 10) {
    result.isValid = false;
    result.errors.push("Message must be at least 10 characters long");
    messageInput.classList.add("is-invalid");
  } else if (messageInput.value.trim().length > 1000) {
    result.isValid = false;
    result.errors.push("Message must not exceed 1000 characters");
    messageInput.classList.add("is-invalid");
  } else {
    messageInput.classList.add("is-valid");
  }

  return result;
}

/**
 * Real-time form validation
 */
function setupRealTimeValidation() {
  const form = document.getElementById("contactForm");
  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    // Validate on blur
    input.addEventListener("blur", () => {
      if (input.value.trim()) {
        validateContactForm(form);
      }
    });

    // Validate on input for textarea character count
    if (input.id === "contactMessage") {
      input.addEventListener("input", () => {
        const charCount = input.value.length;
        const maxChars = 1000;

        // Update or create character counter
        let counter = input.parentNode.querySelector(".char-counter");
        if (!counter) {
          counter = document.createElement("div");
          counter.className = "char-counter small mt-1";
          input.parentNode.appendChild(counter);
        }

        counter.textContent = `${charCount}/${maxChars} characters`;

        if (charCount > maxChars) {
          counter.classList.add("text-danger");
          counter.classList.remove("text-muted");
        } else {
          counter.classList.remove("text-danger");
          counter.classList.add("text-muted");
        }

        // Validate message length in real-time
        if (input.value.trim()) {
          validateContactForm(form);
        }
      });
    }

    // Real-time validation for other fields
    input.addEventListener("input", () => {
      if (input.value.trim() && input.id !== "contactMessage") {
        validateContactForm(form);
      }
    });
  });
}

/**
 * Handle form submission
 */
function setupFormSubmission() {
  const contactForm = document.getElementById("contactForm");
  const contactAlert = document.getElementById("contactAlert");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset alert
    contactAlert.innerHTML = "";

    // Validate form
    const validationResult = validateContactForm(contactForm);

    if (!validationResult.isValid) {
      // Show validation errors
      const errorHTML = validationResult.errors
        .map(
          (error) =>
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>${error}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>`
        )
        .join("");

      contactAlert.innerHTML = errorHTML;
      return;
    }

    // Get form data
    const formData = {
      name: document.getElementById("contactName").value.trim(),
      email: document.getElementById("contactEmail").value.trim(),
      subject: document.getElementById("contactSubject").value,
      message: document.getElementById("contactMessage").value.trim(),
      newsletter: document.getElementById("contactNewsletter").checked,
      timestamp: new Date().toISOString(),
    };

    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    submitBtn.disabled = true;

    try {
      // Simulate API call (replace with actual API endpoint)
      await simulateAPICall(formData);

      // Show success message
      contactAlert.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    Your message has been sent successfully! We'll get back to you as soon as possible.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                `;

      // Add success animation
      contactForm.classList.add("submit-success");
      setTimeout(() => {
        contactForm.classList.remove("submit-success");
      }, 600);

      // Show toast
      showToast("Message sent successfully!", "success");

      // Reset form
      contactForm.reset();

      // Remove validation classes
      contactForm.querySelectorAll(".is-valid").forEach((el) => {
        el.classList.remove("is-valid");
      });

      // Reset character counter
      const charCounter = document.querySelector(".char-counter");
      if (charCounter) {
        charCounter.textContent = "0/1000 characters";
        charCounter.classList.remove("text-danger");
        charCounter.classList.add("text-muted");
      }
    } catch (error) {
      // Show error message
      contactAlert.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    An error occurred while sending your message. Please try again.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                `;

      showToast("Error sending message", "error");
    } finally {
      // Restore button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

/**
 * Simulate API call (replace with actual API integration)
 * @param {Object} formData - Form data to send
 * @returns {Promise} Simulated API response
 */
function simulateAPICall(formData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate random success (90% success rate for demo)
      if (Math.random() > 0.1) {
        // Log form data to console (for demo purposes)
        console.log("Form submitted:", formData);
        resolve({ success: true, message: "Message sent successfully" });
      } else {
        reject(new Error("Network error"));
      }
    }, 2000);
  });
}

// ===== DARK MODE FUNCTIONALITY =====

/**
 * Initialize dark mode functionality
 */
function initializeDarkMode() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;

  // Check for saved dark mode preference
  const isDarkMode = localStorage.getItem("darkMode") === "true";

  // Apply dark mode if previously enabled
  if (isDarkMode) {
    body.classList.add("dark-mode");
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // Toggle dark mode
  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    // Update icon and save preference
    if (body.classList.contains("dark-mode")) {
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem("darkMode", "true");
    } else {
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem("darkMode", "false");
    }
  });
}

// ===== SMOOTH SCROLL FUNCTIONALITY =====

/**
 * Initialize smooth scroll functionality
 */
function initializeSmoothScroll() {
  const scrollToTopBtn = document.getElementById("scrollToTop");

  // Show/hide scroll to top button based on scroll position
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.style.display = "flex";
    } else {
      scrollToTopBtn.style.display = "none";
    }
  });

  // Scroll to top function
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ===== INITIALIZATION =====

/**
 * Main initialization function
 */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initializeDarkMode();
  initializeSmoothScroll();
  setupRealTimeValidation();
  setupFormSubmission();

  // Add keyboard shortcut for dark mode (Alt + D)
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "d") {
      e.preventDefault();
      document.getElementById("darkModeToggle").click();
    }
  });

  console.log("Contact page initialized successfully");
});

// FAQ Search Functionality
function initializeFAQSearch() {
  const searchInput = document.getElementById("faqSearch");
  const clearButton = document.getElementById("clearSearch");
  const accordionItems = document.querySelectorAll(".accordion-item");

  if (!searchInput) return;

  // Search functionality
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();

    if (searchTerm.length === 0) {
      clearSearch();
      return;
    }

    let foundResults = false;

    accordionItems.forEach((item) => {
      const question = item
        .querySelector(".accordion-button")
        .textContent.toLowerCase();
      const answer = item
        .querySelector(".accordion-body")
        .textContent.toLowerCase();

      if (question.includes(searchTerm) || answer.includes(searchTerm)) {
        item.style.display = "block";
        foundResults = true;

        // Highlight matching text
        highlightText(item, searchTerm);

        // Auto-expand matching items
        const collapse = item.querySelector(".accordion-collapse");
        if (!collapse.classList.contains("show")) {
          const button = item.querySelector(".accordion-button");
          button.classList.remove("collapsed");
          collapse.classList.add("show");
        }
      } else {
        item.style.display = "none";
      }
    });

    // Show no results message
    const noResults = document.getElementById("noResults");
    if (!foundResults) {
      if (!noResults) {
        const noResultsDiv = document.createElement("div");
        noResultsDiv.id = "noResults";
        noResultsDiv.className = "alert alert-info text-center";
        noResultsDiv.innerHTML = `
                <i class="fas fa-search me-2"></i>
                No results found for "${searchTerm}". Try different keywords.
                `;
        document.querySelector("#faqAccordion").appendChild(noResultsDiv);
      }
    } else if (noResults) {
      noResults.remove();
    }
  });

  // Clear search functionality
  clearButton.addEventListener("click", function () {
    searchInput.value = "";
    clearSearch();
    searchInput.focus();
  });

  function clearSearch() {
    accordionItems.forEach((item) => {
      item.style.display = "block";
      removeHighlights(item);

      // Collapse all items except the first one
      const isFirst = item === accordionItems[0];
      const collapse = item.querySelector(".accordion-collapse");
      const button = item.querySelector(".accordion-button");

      if (!isFirst) {
        button.classList.add("collapsed");
        collapse.classList.remove("show");
      }
    });

    const noResults = document.getElementById("noResults");
    if (noResults) {
      noResults.remove();
    }
  }

  function highlightText(element, searchTerm) {
    const question = element.querySelector(".accordion-button");
    const answer = element.querySelector(".accordion-body");

    [question, answer].forEach((el) => {
      const text = el.textContent;
      const regex = new RegExp(`(${searchTerm})`, "gi");
      const highlighted = text.replace(
        regex,
        '<span class="highlight">$1</span>'
      );
      el.innerHTML = highlighted;
    });
  }

  function removeHighlights(element) {
    const question = element.querySelector(".accordion-button");
    const answer = element.querySelector(".accordion-body");

    [question, answer].forEach((el) => {
      el.innerHTML = el.textContent;
    });
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeFAQSearch();
});

// ====== DARK MODE FUNCTIONALITY ======

let darkModeToggle = document.getElementById("darkModeToggle");
let body = document.body;

/**
 * Apply dark mode with smooth transition
 * @param {boolean} isDark - Whether to apply dark mode
 */
function applyDarkMode(isDark) {
  // Add transition class for smooth animation
  body.classList.add("mode-transitioning");

  // Small delay to ensure CSS transition starts
  setTimeout(() => {
    if (isDark) {
      body.classList.add("dark-mode");
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      // Add animation class for the toggle button
      darkModeToggle.classList.add("dark-mode-active");
    } else {
      body.classList.remove("dark-mode");
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      darkModeToggle.classList.remove("dark-mode-active");
    }

    // Remove transition class after animation completes
    setTimeout(() => {
      body.classList.remove("mode-transitioning");
    }, 500);
  }, 10);
}

/**
 * Enhanced toggle function with animation
 */
function toggleDarkMode() {
  const willBeDarkMode = !body.classList.contains("dark-mode");

  // Add click animation to toggle button
  darkModeToggle.style.transform = "scale(0.9)";
  setTimeout(() => {
    darkModeToggle.style.transform = "scale(1)";
  }, 150);

  applyDarkMode(willBeDarkMode);
  localStorage.setItem("darkMode", willBeDarkMode.toString());
}

// Check for saved dark mode preference
let isDarkMode = localStorage.getItem("darkMode") === "true";

// Apply dark mode if previously enabled
applyDarkMode(isDarkMode);

// Toggle dark mode with smooth transition
darkModeToggle.addEventListener("click", toggleDarkMode);

// Add keyboard shortcut for dark mode (Alt + D)
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "d") {
    e.preventDefault();
    toggleDarkMode();
  }
});

// ====== SMOOTH SCROLL FUNCTIONALITY ======

const scrollToTopBtn = document.getElementById("scrollToTop");
const scrollToBottomBtn = document.getElementById("scrollToBottom");

// Show/hide scroll buttons based on scroll position
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // Show scroll to top button when scrolled down
  if (scrollY > 300) {
    scrollToTopBtn.style.display = "flex";
  } else {
    scrollToTopBtn.style.display = "none";
  }

  // Show scroll to bottom button when not at bottom
  if (scrollY + windowHeight < documentHeight - 100) {
    scrollToBottomBtn.style.display = "flex";
  } else {
    scrollToBottomBtn.style.display = "none";
  }
}); // Scroll to top function
scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Scroll to bottom function
scrollToBottomBtn.addEventListener("click", () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth",
  });
});
