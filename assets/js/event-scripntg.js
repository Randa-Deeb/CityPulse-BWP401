// ==================================================
// CityPulse - event-scripntg.js (no local theme logic)
// ==================================================
const LANGS = {
  ar: {
    dir: "rtl",
    name: "العربية",
    flag: "sy",
    bsHref:
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css",
  },
  en: {
    dir: "ltr",
    name: "English",
    flag: "us",
    bsHref:
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  },
};

function getLang() {
  const fromStorage = (localStorage.getItem("lang") || "").toLowerCase();
  const current =
    fromStorage || (document.documentElement.lang || "ar").toLowerCase();
  return current === "en" ? "en" : "ar";
}

function applyLang(lang) {
  const cfg = LANGS[lang] || LANGS.ar;
  document.documentElement.lang = lang;
  document.documentElement.dir = cfg.dir;

  const link = document.getElementById("bootstrap-css");
  if (link && link.href !== cfg.bsHref) link.href = cfg.bsHref;

  const flagImg = document.getElementById("current-lang-flag");
  const txt = document.getElementById("current-lang-text");
  if (flagImg) flagImg.src = `https://flagcdn.com/w40/${cfg.flag}.png`;
  if (txt) txt.textContent = cfg.name;

  const t = document.querySelector("title");
  if (t) {
    const en = t.getAttribute("data-en");
    const ar = t.getAttribute("data-ar");
    if (en || ar)
      t.textContent = lang === "en" ? en || t.textContent : ar || t.textContent;
  }

  document.documentElement.dispatchEvent(new Event("app:languagechange"));
}

function wireLanguageDropdown() {
  document.querySelectorAll(".language-option[data-lang]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const lang = a.getAttribute("data-lang");
      localStorage.setItem("lang", lang);
      applyLang(lang);
      renderEvent();
    });
  });
}

function pickLang(val, lang) {
  if (val && typeof val === "object" && ("ar" in val || "en" in val)) {
    return val[lang] ?? val.ar ?? "";
  }
  return val || "";
}

// (ICS helpers/ downloadICS / showToast / shareEvent) — نفس النسخة السابقة لديك
// ——— ضع هنا نفس الدوال التي لديك سلفًا دون أي تغيير ثيمي ———

// ---------- Rendering ----------
function renderEvent() {
  const lang = getLang();
  const params = new URLSearchParams(location.search);
  const id = params.get("event") || params.get("id") || "1";

  const src =
    window.EVENTS_DATA && Object.keys(window.EVENTS_DATA).length
      ? window.EVENTS_DATA
      : {};
  const ev = src[id];

  const headerEl = document.getElementById("eventHeader");
  const detailsEl = document.getElementById("eventDetails");
  const galleryGrid = document.getElementById("galleryGrid");
  const mapHolder = document.getElementById("mapHolder");
  const sideDate = document.getElementById("sideDate");
  const sideLocation = document.getElementById("sideLocation");
  const relatedEl = document.getElementById("relatedEvents");

  if (!headerEl || !detailsEl) return;

  if (!ev) {
    headerEl.innerHTML = `<div class="alert alert-warning">${
      lang === "en" ? "Event not found." : "الفعالية غير موجودة."
    }</div>`;
    detailsEl.innerHTML = "";
    return;
  }

  const title = pickLang(ev.title, lang);
  const dateStr = pickLang(ev.dateStr, lang);
  const locationTxt = pickLang(ev.location, lang);
  const description = pickLang(ev.description, lang);
  const images = ev.images || [];
  const map = ev.map || { lat: 0, lng: 0 };

  headerEl.innerHTML = `
        <div class="position-relative mb-3">
            <img src="${
              images[0] || ""
            }" alt="${title}" class="hero-img w-100 shadow-sm">
        </div>
        <h1 class="fw-bold">${title}</h1>
        <p class="text-muted mb-0"><i class="fa-solid fa-calendar-days me-1"></i> ${dateStr}</p>
        <p class="text-muted"><i class="fa-solid fa-location-dot me-1"></i> ${locationTxt}</p>
        `;

  document.title =
    lang === "en" ? "CityPulse | Event Details" : "CityPulse | تفاصيل الفعالية";

  detailsEl.innerHTML = `
        <h4>${lang === "en" ? "Description" : "الوصف"}</h4>
        <p>${description}</p>
        <div class="d-flex gap-2 mt-3">
            <button id="addCalendarBtn" class="btn btn-outline-primary">
                <i class="fa-regular fa-calendar-plus me-1"></i>${
                  lang === "en" ? "Add to Calendar" : "أضف إلى التقويم"
                }
            </button>
            <button id="shareBtn" class="btn btn-outline-success">
                <i class="fa-solid fa-share-nodes me-1"></i>${
                  lang === "en" ? "Share" : "مشاركة"
                }
            </button>
            <a href="#bookingModal" data-bs-toggle="modal" class="btn btn-primary">
                <i class="fa-solid fa-ticket-simple me-1"></i>${
                  lang === "en" ? "Book" : "احجز"
                }
            </a>
        </div>
        `;

  if (sideDate)
    sideDate.innerHTML = `<i class="fa-solid fa-calendar-days me-1"></i> ${dateStr}`;
  if (sideLocation)
    sideLocation.innerHTML = `<i class="fa-solid fa-location-dot me-1"></i> ${locationTxt}`;

  galleryGrid.innerHTML = "";
  images.forEach((img, idx) => {
    const g = document.createElement("img");
    g.src = img;
    g.alt = `${title} ${idx + 1}`;
    g.setAttribute("data-bs-toggle", "modal");
    g.setAttribute("data-bs-target", "#galleryModal");
    g.addEventListener("click", () => {
      const m = document.getElementById("modalImage");
      if (m) m.src = img;
    });
    galleryGrid.appendChild(g);
  });

  mapHolder.innerHTML = "";
  const mapFrame = document.createElement("iframe");
  mapFrame.width = "100%";
  mapFrame.height = "260";
  mapFrame.style.border = 0;
  mapFrame.loading = "lazy";
  mapFrame.allowFullscreen = true;
  mapFrame.referrerPolicy = "no-referrer-when-downgrade";
  mapFrame.src = `https://www.google.com/maps?q=${map.lat},${map.lng}&z=14&output=embed`;
  mapHolder.appendChild(mapFrame);

  if (relatedEl) {
    relatedEl.innerHTML = "";
    let added = 0;
    Object.keys(src).some((k) => {
      if (k === String(id)) return false;
      const r = src[k];
      const rTitle = pickLang(r.title, lang);
      const rDate = pickLang(r.dateStr, lang);
      const thumb = (r.images && r.images[0]) || (images && images[0]) || "";
      relatedEl.insertAdjacentHTML(
        "beforeend",
        `
        <div class="col-12">
            <div class="card related-event-card h-100">
                <div class="row g-0 align-items-center h-100">
                    <div class="col-auto" style="width:110px">
                        <img src="${thumb}" class="img-fluid h-100" alt="${rTitle}" style="object-fit:cover;">
                    </div>
                    <div class="col">
                        <div class="card-body py-2">
                            <h6 class="card-title mb-1">${rTitle}</h6>
                            <p class="text-muted small mb-1"><i class="fa-solid fa-calendar-days me-1"></i> ${rDate}</p>
                            <a href="event.html?event=${k}" class="btn btn-sm btn-outline-primary">
                                ${
                                  lang === "en"
                                    ? "View details"
                                    : "عرض التفاصيل"
                                }
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
      );
      added++;
      return added >= 3;
    });
  }

  const addCalendarBtn = document.getElementById("addCalendarBtn");
  const shareBtn = document.getElementById("shareBtn");
  if (addCalendarBtn) {
    addCalendarBtn.onclick = () => {
      downloadICS(ev);
      showToast(
        getLang() === "en"
          ? "Event added to your calendar!"
          : "تمت إضافة الفعالية إلى تقويمك!",
        "success"
      );
    };
  }
  if (shareBtn) {
    shareBtn.onclick = () =>
      shareEvent(
        location.href,
        title,
        `${title} — ${dateStr} — ${locationTxt}`
      );
  }
}

// ---------- Theme icon sync ----------
function refreshDarkToggleIcon() {
  const btn = document.getElementById("darkModeToggle");
  if (!btn) return;
  const theme =
    (window.AppI18n && window.AppI18n.getTheme && window.AppI18n.getTheme()) ||
    document.documentElement.getAttribute("data-bs-theme") ||
    "light";
  const isDark = theme === "dark";
  const icon = btn.querySelector("i");
  if (icon) {
    icon.classList.toggle("fa-sun", isDark);
    icon.classList.toggle("fa-moon", !isDark);
  }
}
document.addEventListener("DOMContentLoaded", refreshDarkToggleIcon);
document.documentElement.addEventListener(
  "app:themechange",
  refreshDarkToggleIcon
);

// ---------- Scroll buttons (مطابق لـ events.html) ----------
const scrollToTopBtn = document.getElementById("scrollToTop");
const scrollToBottomBtn = document.getElementById("scrollToBottom");
function updateScrollButtons() {
  const y = window.scrollY;
  const h = window.innerHeight;
  const dh = document.documentElement.scrollHeight;
  if (scrollToTopBtn) scrollToTopBtn.style.display = y > 300 ? "flex" : "none";
  if (scrollToBottomBtn)
    scrollToBottomBtn.style.display = y + h < dh - 100 ? "flex" : "none";
}
window.addEventListener("scroll", updateScrollButtons);
window.addEventListener("resize", updateScrollButtons);
document.addEventListener("DOMContentLoaded", updateScrollButtons);
scrollToTopBtn &&
  scrollToTopBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
scrollToBottomBtn &&
  scrollToBottomBtn.addEventListener("click", () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    })
  );

// ---------- Boot ----------
function boot() {
  applyLang(getLang());
  wireLanguageDropdown();
  renderEvent();
}
document.addEventListener("DOMContentLoaded", boot);
document.documentElement.addEventListener("app:languagechange", renderEvent);
