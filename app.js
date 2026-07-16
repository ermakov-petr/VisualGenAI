(() => {
  const doc = document.documentElement;
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const progressBar = document.querySelector(".page-progress span");
  const hero = document.querySelector(".hero");
  const timeline = document.querySelector("[data-timeline]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => body.classList.add("is-ready"));

  if (menuToggle && menu) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      body.classList.remove("menu-open");
    };

    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menu.classList.toggle("is-open", willOpen);
      body.classList.toggle("menu-open", willOpen);
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const timelineItems = document.querySelectorAll(".timeline-item");
  if (timelineItems.length && "IntersectionObserver" in window) {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-current");
          else entry.target.classList.remove("is-current");
        });
      },
      { rootMargin: "-38% 0px -42% 0px", threshold: 0 },
    );
    timelineItems.forEach((item) => timelineObserver.observe(item));
  }

  const examSections = document.querySelectorAll(".exam-topic[id]");
  const examNavLinks = document.querySelectorAll(".exam-nav a");
  if (examSections.length && examNavLinks.length && "IntersectionObserver" in window) {
    const examLinkById = new Map(
      [...examNavLinks].map((link) => [link.getAttribute("href")?.slice(1), link]),
    );
    const examObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        examNavLinks.forEach((link) => link.classList.remove("is-active"));
        examLinkById.get(visible.target.id)?.classList.add("is-active");
      },
      { rootMargin: "-20% 0px -62% 0px", threshold: [0.05, 0.25, 0.5] },
    );
    examSections.forEach((section) => examObserver.observe(section));
  }

  let ticking = false;
  const updateScrollState = () => {
    const scrollY = window.scrollY;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const pageProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    if (progressBar) progressBar.style.transform = `scaleX(${pageProgress})`;
    if (header) header.classList.toggle("is-scrolled", scrollY > 24);

    if (hero && !reduceMotion) {
      const heroProgress = Math.min(scrollY / Math.max(hero.offsetHeight, 1), 1);
      doc.style.setProperty("--hero-shift", `${heroProgress * 42}px`);
    }

    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const start = window.innerHeight * 0.58;
      const trackLength = Math.max(rect.height - window.innerHeight * 0.18, 1);
      const timelineProgress = Math.min(Math.max((start - rect.top) / trackLength, 0), 1);
      timeline.style.setProperty("--progress", timelineProgress.toFixed(4));
    }

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollState);
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  updateScrollState();
})();
