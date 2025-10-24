(function () {
  // ===== Constants =====
  const BS_LINK_ID = "bootstrap-css";
  const BS_RTL =
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css";
  const BS_LTR =
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
  const CAIRO = "Cairo:300,400,500,600,700&display=swap";
  const POPPINS = "Poppins:300,400,500,600,700&display=swap";

  // ===== Storage helpers with legacy bridge =====
  function migrateLegacyDarkMode() {
    // if legacy key exists, map it to theme and remove it
    const legacy = localStorage.getItem("darkMode");
    const currentTheme = localStorage.getItem("theme");
    if (legacy != null && !currentTheme) {
      const theme = legacy === "true" ? "dark" : "light";
      localStorage.setItem("theme", theme);
      // نحافظ عليه مؤقتًا للتوافق الخلفي لكن نقدر نحذفه:
      // localStorage.removeItem("darkMode");
    }
  }
  migrateLegacyDarkMode();

  const storage = {
    get lang() {
      return localStorage.getItem("lang") || "en";
    },
    set lang(v) {
      localStorage.setItem("lang", v);
    },
    get theme() {
      // read unified key; if missing, detect and persist
      let t = localStorage.getItem("theme");
      if (!t) {
        t = detectInitialTheme();
        localStorage.setItem("theme", t);
        // write legacy mirror for old pages
        localStorage.setItem("darkMode", (t === "dark").toString());
      }
      return t;
    },
    set theme(v) {
      localStorage.setItem("theme", v);
      // legacy mirror to keep old pages in sync
      localStorage.setItem("darkMode", (v === "dark").toString());
    },
  };

  // Detect initial theme
  function detectInitialTheme() {
    const html = document.documentElement;
    const body = document.body;

    const bs =
      html.getAttribute("data-bs-theme") || body.getAttribute("data-bs-theme");
    if (bs === "dark") return "dark";

    if (body.getAttribute("data-theme") === "dark") return "dark";
    if (
      body.classList.contains("dark") ||
      body.classList.contains("dark-mode") ||
      body.classList.contains("theme-dark") ||
      body.classList.contains("night")
    )
      return "dark";

    try {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
        return "dark";
    } catch (_) {}

    // legacy override: if old key exists and contradicts, respect it
    const legacy = localStorage.getItem("darkMode");
    if (legacy != null) return legacy === "true" ? "dark" : "light";

    return "light";
  }

  // ===== Bootstrap RTL/LTR swap =====
  function swapBootstrap(lang) {
    const link = document.getElementById(BS_LINK_ID);
    if (link) link.href = lang === "ar" ? BS_RTL : BS_LTR;
  }

  // ===== Fonts =====
  function ensureFontFor(lang) {
    const id = "lang-font-link";
    const href = `https://fonts.googleapis.com/css2?family=${
      lang === "ar" ? CAIRO : POPPINS
    }`;
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;

    document.documentElement.style.setProperty(
      "--app-font-family",
      lang === "ar"
        ? `'Cairo', system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`
        : `'Poppins', system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`
    );
    document.body.style.fontFamily = "var(--app-font-family)";
  }

  // ===== Language / Direction =====
  function setLangDir(lang) {
    const isAr = lang === "ar";
    const html = document.documentElement;
    html.lang = lang;
    html.dir = isAr ? "rtl" : "ltr";
    document.body.classList.toggle("is-rtl", isAr);
  }

  // ===== DOM Translations =====
  function applyTranslations(lang) {
    const textAttr = lang === "ar" ? "data-ar" : "data-en";
    const phAttr =
      lang === "ar" ? "data-ar-placeholder" : "data-en-placeholder";

    document.querySelectorAll("[data-en],[data-ar]").forEach((el) => {
      if (!/^(INPUT|TEXTAREA)$/.test(el.tagName)) {
        const v = el.getAttribute(textAttr);
        if (v != null) el.textContent = v;
      }
    });

    document.querySelectorAll(`[${phAttr}]`).forEach((el) => {
      const v = el.getAttribute(phAttr);
      if (v != null) {
        el.setAttribute("placeholder", v);
        el.setAttribute("title", v);
        el.setAttribute("aria-label", v);
      }
    });

    document
      .querySelectorAll(
        "input[placeholder][data-en], textarea[placeholder][data-en]"
      )
      .forEach((el) => {
        if (!el.hasAttribute(phAttr)) {
          const v = el.getAttribute(textAttr);
          if (v != null) el.setAttribute("placeholder", v);
        }
      });

    const titleEl = document.querySelector("title[data-en],[data-ar]");
    if (titleEl) {
      const t = titleEl.getAttribute(textAttr);
      if (t != null) document.title = t;
    }

    const flag = document.getElementById("current-lang-flag");
    const text = document.getElementById("current-lang-text");
    if (flag)
      flag.src =
        lang === "ar"
          ? "https://flagcdn.com/w40/sy.png"
          : "https://flagcdn.com/w40/us.png";
    if (text) text.textContent = lang === "ar" ? "العربية" : "English";
  }

  // ===== Theme helpers (single source of truth) =====
  function setButtonIcon(btn, isDark) {
    if (!btn) return;
    const icon = btn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-moon", !isDark);
      icon.classList.toggle("fa-sun", isDark);
    } else {
      btn.textContent = isDark ? "☀️" : "🌙";
    }
  }

  function setTheme(theme) {
    const isDark = theme === "dark";

    // write to both keys (new + legacy) so كل الصفحات تتزامن
    storage.theme = theme;

    // 1) Bootstrap hook
    document.documentElement.setAttribute("data-bs-theme", theme);
    document.body.setAttribute("data-bs-theme", theme);

    // 2) Compatibility attribute/classes
    document.body.setAttribute("data-theme", theme);
    document.body.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("theme-dark", isDark);
    document.body.classList.toggle("night", isDark);

    // 3) Buttons
    setButtonIcon(document.getElementById("darkModeToggle"), isDark);
    setButtonIcon(document.getElementById("dark-toggle"), isDark);

    // 4) Notify
    document.documentElement.dispatchEvent(
      new CustomEvent("app:themechange", { detail: { theme } })
    );
  }

  function applyAll() {
    const lang = storage.lang;
    setLangDir(lang);
    swapBootstrap(lang);
    ensureFontFor(lang);
    applyTranslations(lang);
    setTheme(storage.theme);
  }

  // ===== Bindings =====
  function bindControls() {
    document.querySelectorAll(".language-option[data-lang]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        storage.lang = a.getAttribute("data-lang");
        applyAll();
        document.documentElement.dispatchEvent(
          new CustomEvent("app:languagechange", {
            detail: { lang: storage.lang },
          })
        );
      });
    });

    const darkBtns = [
      document.getElementById("darkModeToggle"),
      document.getElementById("dark-toggle"),
    ].filter(Boolean);

    darkBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = storage.theme === "dark" ? "light" : "dark";
        setTheme(next);
      });
    });

    // sync across tabs/pages if someone still flips legacy key
    window.addEventListener("storage", (e) => {
      if (e.key === "theme" || e.key === "darkMode") {
        const t =
          e.key === "theme"
            ? e.newValue || "light"
            : e.newValue === "true"
            ? "dark"
            : "light";
        setTheme(t);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindControls();
    applyAll();
  });

  // Public API
  window.AppI18n = {
    getLang: () => storage.lang,
    getTheme: () => storage.theme,
    setTheme,
  };
})();
