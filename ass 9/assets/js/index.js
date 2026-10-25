// ============================================
//  1) Dark / Light theme
// ============================================
const html = document.documentElement;
const themeBtn = document.getElementById("theme-toggle-button");

function applyTheme(isDark) {
  html.classList.toggle("dark", isDark);
  themeBtn.setAttribute("aria-pressed", isDark);
}

themeBtn.addEventListener("click", function () {
  const goDark = !html.classList.contains("dark");
  applyTheme(goDark);
  localStorage.setItem("theme", goDark ? "dark" : "light");
});

// لو المستخدم اختار ثيم قبل كده نرجعهوله
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  applyTheme(savedTheme === "dark");
} else {
  applyTheme(html.classList.contains("dark"));
}

// ============================================
//  2) Settings sidebar (font + theme color)
// ============================================
const settingsBtn = document.getElementById("settings-toggle");
const sidebar = document.getElementById("settings-sidebar");
const closeSettingsBtn = document.getElementById("close-settings");
const resetBtn = document.getElementById("reset-settings");
const fontButtons = document.querySelectorAll(".font-option");
const colorsGrid = document.getElementById("theme-colors-grid");

function openSettings() {
  sidebar.classList.remove("translate-x-full");
  sidebar.setAttribute("aria-hidden", "false");
  settingsBtn.setAttribute("aria-expanded", "true");
  // الزرار يمشي مع السايد بار
  settingsBtn.style.transform = "translate(-" + sidebar.offsetWidth + "px, -50%)";
}

function closeSettings() {
  sidebar.classList.add("translate-x-full");
  sidebar.setAttribute("aria-hidden", "true");
  settingsBtn.setAttribute("aria-expanded", "false");
  settingsBtn.style.transform = "translateY(-50%)";
}

settingsBtn.addEventListener("click", function () {
  const isOpen = settingsBtn.getAttribute("aria-expanded") === "true";
  if (isOpen) {
    closeSettings();
  } else {
    openSettings();
  }
});

closeSettingsBtn.addEventListener("click", closeSettings);

// نقفل لما نضغط برة السايد بار أو نداس Escape
document.addEventListener("click", function (e) {
  const isOpen = settingsBtn.getAttribute("aria-expanded") === "true";
  if (isOpen && !sidebar.contains(e.target) && !settingsBtn.contains(e.target)) {
    closeSettings();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeSettings();
});

// ---------- Fonts ----------
const fontClasses = ["font-alexandria", "font-tajawal", "font-cairo"];

function applyFont(name) {
  fontClasses.forEach(function (c) {
    document.body.classList.remove(c);
  });
  document.body.classList.add("font-" + name);

  fontButtons.forEach(function (btn) {
    const isActive = btn.dataset.font === name;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-checked", isActive);
    btn.style.borderColor = isActive ? "var(--color-primary)" : "";
    btn.style.backgroundColor = isActive
      ? "color-mix(in srgb, var(--color-primary) 10%, transparent)"
      : "";
  });
}

fontButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    applyFont(btn.dataset.font);
    localStorage.setItem("font", btn.dataset.font);
  });
});

// ---------- Theme colors ----------
const colors = [
  { name: "بنفسجي", primary: "#6366f1", secondary: "#8b5cf6", accent: "#a855f7" },
  { name: "وردي", primary: "#ec4899", secondary: "#f43f5e", accent: "#f97316" },
  { name: "أخضر", primary: "#10b981", secondary: "#14b8a6", accent: "#22c55e" },
  { name: "أزرق", primary: "#0ea5e9", secondary: "#3b82f6", accent: "#6366f1" },
  { name: "أحمر", primary: "#ef4444", secondary: "#f43f5e", accent: "#ec4899" },
  { name: "برتقالي", primary: "#f97316", secondary: "#f59e0b", accent: "#ef4444" },
];

const activeRing = [
  "ring-2",
  "ring-offset-2",
  "ring-primary",
  "ring-offset-white",
  "dark:ring-offset-slate-900",
];

// بنرسم الدواير من الـ array
colors.forEach(function (c, i) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className =
    "color-option w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer";
  btn.style.background =
    "linear-gradient(135deg, " + c.primary + ", " + c.secondary + ")";
  btn.style.justifySelf = "center";
  btn.setAttribute("aria-label", c.name);
  btn.dataset.index = i;

  btn.addEventListener("click", function () {
    applyColor(i);
    localStorage.setItem("color", i);
  });

  colorsGrid.appendChild(btn);
});

function applyColor(index) {
  const c = colors[index];
  html.style.setProperty("--color-primary", c.primary);
  html.style.setProperty("--color-secondary", c.secondary);
  html.style.setProperty("--color-accent", c.accent);

  colorsGrid.querySelectorAll(".color-option").forEach(function (btn) {
    const isActive = Number(btn.dataset.index) === index;
    activeRing.forEach(function (cls) {
      btn.classList.toggle(cls, isActive);
    });
    btn.setAttribute("aria-pressed", isActive);
  });

  // الخط المحدد لازم ياخد اللون الجديد
  applyFont(currentFont());
}

function currentFont() {
  const activeBtn = document.querySelector(".font-option.active");
  return activeBtn ? activeBtn.dataset.font : "tajawal";
}

// ---------- Reset ----------
resetBtn.addEventListener("click", function () {
  localStorage.removeItem("theme");
  localStorage.removeItem("font");
  localStorage.removeItem("color");

  applyTheme(true);
  applyFont("tajawal");
  applyColor(0);
});

// أول ما الصفحة تفتح نرجّع الإعدادات المحفوظة
const savedFont = localStorage.getItem("font") || "tajawal";
const savedColor = Number(localStorage.getItem("color")) || 0;
applyFont(savedFont);
applyColor(savedColor);

// ============================================
//  3) Active link في الـ Navbar حسب الـ scroll
// ============================================
const navLinks = document.querySelectorAll(".nav-links a");
const navItems = [];

navLinks.forEach(function (link) {
  const section = document.querySelector(link.getAttribute("href"));
  if (section) {
    navItems.push({ link: link, section: section });
  }
});

function updateActiveLink() {
  let current = navItems[0];

  navItems.forEach(function (item) {
    // لو الـ section وصل لتحت الـ navbar يبقى هو الحالي
    if (item.section.getBoundingClientRect().top <= 150) {
      current = item;
    }
  });

  // لو وصلنا لآخر الصفحة نخلي آخر لينك هو الـ active
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5;
  if (atBottom) {
    current = navItems[navItems.length - 1];
  }

  navLinks.forEach(function (link) {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });
  current.link.classList.add("active");
  current.link.setAttribute("aria-current", "page");
}

window.addEventListener("scroll", updateActiveLink);
updateActiveLink();

// ============================================
//  4) Portfolio filter (Tabs)
// ============================================
const filterButtons = document.querySelectorAll(".portfolio-filter");
const portfolioItems = document.querySelectorAll(".portfolio-item");

const filterActive = [
  "bg-linear-to-r",
  "from-primary",
  "to-secondary",
  "text-white",
  "hover:shadow-lg",
  "hover:shadow-primary/50",
];

const filterNormal = [
  "bg-white",
  "dark:bg-slate-800",
  "text-slate-600",
  "dark:text-slate-300",
  "hover:bg-slate-100",
  "dark:hover:bg-slate-700",
  "border",
  "border-slate-300",
  "dark:border-slate-700",
];

function setActiveFilter(activeBtn) {
  filterButtons.forEach(function (btn) {
    const isActive = btn === activeBtn;
    filterActive.forEach(function (c) {
      btn.classList.toggle(c, isActive);
    });
    filterNormal.forEach(function (c) {
      btn.classList.toggle(c, !isActive);
    });
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive);
  });
}

function filterProjects(category) {
  portfolioItems.forEach(function (item) {
    const match = category === "all" || item.dataset.category === category;

    if (!match) {
      item.classList.add("hidden");
      return;
    }

    // نظهر الكارت مع fade بسيط
    item.classList.remove("hidden");
    item.style.opacity = "0";
    item.style.transform = "translateY(15px)";
    void item.offsetWidth; // عشان الـ transition تشتغل
    item.style.opacity = "";
    item.style.transform = "";
  });
}

filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    setActiveFilter(btn);
    filterProjects(btn.dataset.filter);
  });
});

// ============================================
//  5) Testimonials Carousel
// ============================================
const track = document.getElementById("testimonials-carousel");
const cards = track.querySelectorAll(".testimonial-card");
const nextBtn = document.getElementById("next-testimonial");
const prevBtn = document.getElementById("prev-testimonial");
const dotsBox = document.querySelector(".carousel-indicator").parentElement;
const carouselBox = track.parentElement;

const AUTOPLAY_DELAY = 5000; // خليها 0 لو عاوز توقف التشغيل التلقائي
let currentIndex = 0;
let autoplayTimer = null;

// عدد الكروت الظاهرة حسب حجم الشاشة (نفس breakpoints بتاعة الـ CSS)
function cardsPerView() {
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

function lastIndex() {
  return cards.length - cardsPerView();
}

function buildDots() {
  dotsBox.innerHTML = "";

  for (let i = 0; i <= lastIndex(); i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className =
      "carousel-indicator w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer";
    dot.dataset.index = i;
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "التوصية " + (i + 1));

    dot.addEventListener("click", function () {
      goToSlide(i);
      restartAutoplay();
    });

    dotsBox.appendChild(dot);
  }
}

function updateDots() {
  dotsBox.querySelectorAll(".carousel-indicator").forEach(function (dot) {
    const isActive = Number(dot.dataset.index) === currentIndex;
    dot.classList.toggle("bg-accent", isActive);
    dot.classList.toggle("bg-slate-400", !isActive);
    dot.classList.toggle("dark:bg-slate-600", !isActive);
    dot.setAttribute("aria-selected", isActive);
  });
}

function goToSlide(index) {
  // لو عدينا الآخر نرجع للأول وبالعكس
  if (index > lastIndex()) index = 0;
  if (index < 0) index = lastIndex();
  currentIndex = index;

  // الصفحة RTL فالكروت بتتحرك لليمين
  const direction = html.dir === "rtl" ? 1 : -1;
  const distance = currentIndex * cards[0].offsetWidth * direction;
  track.style.transform = "translateX(" + distance + "px)";

  updateDots();
}

nextBtn.addEventListener("click", function () {
  goToSlide(currentIndex + 1);
  restartAutoplay();
});

prevBtn.addEventListener("click", function () {
  goToSlide(currentIndex - 1);
  restartAutoplay();
});

// تشغيل تلقائي
function startAutoplay() {
  if (!AUTOPLAY_DELAY) return;
  autoplayTimer = setInterval(function () {
    goToSlide(currentIndex + 1);
  }, AUTOPLAY_DELAY);
}

function stopAutoplay() {
  clearInterval(autoplayTimer);
}

function restartAutoplay() {
  stopAutoplay();
  startAutoplay();
}

carouselBox.addEventListener("mouseenter", stopAutoplay);
carouselBox.addEventListener("mouseleave", startAutoplay);

// swipe للموبايل (الأزرار مخفية هناك)
let touchStartX = 0;

carouselBox.addEventListener(
  "touchstart",
  function (e) {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  },
  { passive: true }
);

carouselBox.addEventListener("touchend", function (e) {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) > 50) {
    // سحب لليسار = التالي
    goToSlide(diff < 0 ? currentIndex + 1 : currentIndex - 1);
  }
  startAutoplay();
});

// لما حجم الشاشة يتغير نعيد حساب كل حاجة
window.addEventListener("resize", function () {
  buildDots();
  goToSlide(Math.min(currentIndex, lastIndex()));
});

buildDots();
goToSlide(0);
startAutoplay();
