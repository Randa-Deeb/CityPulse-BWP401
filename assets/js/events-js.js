// === Event Filtering Logic ===
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const locationFilter = document.getElementById("locationFilter");
    const dateFilter = document.getElementById("dateFilter");
    const events = document.querySelectorAll(".event-card");

    function filterEvents() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedLocation = locationFilter.value;
    const selectedDate = dateFilter.value;

    events.forEach(event => {
    const title = event.querySelector(".card-title").textContent.toLowerCase();
    const category = event.dataset.category;
    const location = event.dataset.location;
    const date = event.dataset.date;

    const matchesSearch = title.includes(searchText);
    const matchesCategory = !selectedCategory || category === selectedCategory;
    const matchesLocation = !selectedLocation || location === selectedLocation;
    const matchesDate = !selectedDate || date === selectedDate;

    if (matchesSearch && matchesCategory && matchesLocation && matchesDate) {
    event.classList.remove("fade-out");
    event.classList.add("fade-in");
    event.style.display = "block";
    } else {
    event.classList.remove("fade-in");
    event.classList.add("fade-out");
    setTimeout(() => event.style.display = "none", 400);
    }
    });
    }

    [searchInput, categoryFilter, locationFilter, dateFilter].forEach(input => {
    input.addEventListener("input", filterEvents);
    });


    // ====== DARK MODE FUNCTIONALITY ======

    let darkModeToggle = document.getElementById('darkModeToggle')
    let body = document.body

    /**
    * Apply dark mode with smooth transition
    * @param {boolean} isDark - Whether to apply dark mode
    */
    function applyDarkMode(isDark) {
    // Add transition class for smooth animation
    body.classList.add('mode-transitioning')

    // Small delay to ensure CSS transition starts
    setTimeout(() => {
    if (isDark) {
    body.classList.add('dark-mode')
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    // Add animation class for the toggle button
    darkModeToggle.classList.add('dark-mode-active')
    } else {
    body.classList.remove('dark-mode')
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'
    darkModeToggle.classList.remove('dark-mode-active')
    }

    // Remove transition class after animation completes
    setTimeout(() => {
    body.classList.remove('mode-transitioning')
    }, 500)
    }, 10)
    }

    /**
    * Enhanced toggle function with animation
    */
    function toggleDarkMode() {
    const willBeDarkMode = !body.classList.contains('dark-mode')

    // Add click animation to toggle button
    darkModeToggle.style.transform = 'scale(0.9)'
    setTimeout(() => {
    darkModeToggle.style.transform = 'scale(1)'
    }, 150)

    applyDarkMode(willBeDarkMode)
    localStorage.setItem('darkMode', willBeDarkMode.toString())
    }

    // Check for saved dark mode preference
    let isDarkMode = localStorage.getItem('darkMode') === 'true'

    // Apply dark mode if previously enabled
    applyDarkMode(isDarkMode)

    // Toggle dark mode with smooth transition
    darkModeToggle.addEventListener('click', toggleDarkMode)

    // Add keyboard shortcut for dark mode (Alt + D)
    document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'd') {
    e.preventDefault()
    toggleDarkMode()
    }
    })

    // ====== SMOOTH SCROLL FUNCTIONALITY ======

    const scrollToTopBtn = document.getElementById('scrollToTop')
    const scrollToBottomBtn = document.getElementById('scrollToBottom')

    // Show/hide scroll buttons based on scroll position
    window.addEventListener('scroll', () => {
    const scrollY = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // Show scroll to top button when scrolled down
    if (scrollY > 300) {
    scrollToTopBtn.style.display = 'flex'
    } else {
    scrollToTopBtn.style.display = 'none'
    }

    // Show scroll to bottom button when not at bottom
    if (scrollY + windowHeight < documentHeight - 100) {
        scrollToBottomBtn.style.display = 'flex';
    } else {
        scrollToBottomBtn.style.display = 'none';
    }
    });

    // Scroll to top function
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

        // Scroll to bottom function
        scrollToBottomBtn.addEventListener('click', () => {
        window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
        });
    });
