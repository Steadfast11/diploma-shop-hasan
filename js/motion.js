/* ============================================================
   motion.js — "wow" animatsiyalar (GSAP + ScrollTrigger + Lenis)
   Kutubxonalar js/vendor/ da, HTML <head> da <script defer> bilan
   yuklanadi -> window.gsap / window.ScrollTrigger / window.Lenis.

   Agar kutubxona yo'q yoki prefers-reduced-motion -> false qaytaradi,
   shunda components.js oddiy CSS reveal (reveal.js) ni ishlatadi.
   ============================================================ */

// Satrni "so'z > ichki span" ga bo'ladi (mask-reveal uchun).
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w) => `<span class="m-word"><span class="m-word__in">${w}</span></span>`)
    .join(" ");
}

export function initMotion() {
  const { gsap, ScrollTrigger, Lenis } = window;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !gsap || !ScrollTrigger || !Lenis) return false;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("has-motion");

  /* --- Lenis: yumshoq ("smooth") skroll --- */
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* --- Blok reveal: [data-reveal] va [data-reveal-stagger] ko'rinishga
     kirganda pastdan chiqadi. Grid bolalarini alohida animatsiya qilmaymiz —
     ular API'dan keyin qo'shiladi, poyga (race) bo'lib qolardi. --- */
  gsap.utils.toArray("[data-reveal], [data-reveal-stagger]").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 26, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      }
    );
  });

  /* --- Hero: sarlavha so'zlari maska ortidan ko'tariladi --- */
  const heroLines = document.querySelectorAll("[data-hero-line]");
  if (heroLines.length) {
    heroLines.forEach(splitWords);
    gsap.fromTo(
      "[data-hero-line] .m-word__in",
      { yPercent: 115 },
      { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.035, delay: 0.12 }
    );
  }
  const heroBtn = document.querySelector(".hero__btn");
  if (heroBtn) {
    gsap.fromTo(
      heroBtn,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.9 }
    );
  }

  /* --- Hero foni: skroll bilan parallaks --- */
  const heroBg = document.querySelector("[data-parallax]");
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 16,
      ease: "none",
      scrollTrigger: {
        trigger: heroBg.closest(".hero"),
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* --- Sahifa ochilishi: main biroz pastdan paydo bo'ladi --- */
  gsap.from("main", { autoAlpha: 0, y: 14, duration: 0.5, ease: "power2.out" });

  ScrollTrigger.refresh();
  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* Xavfsizlik to'ri: 2s dan keyin EKRANDA ko'rinib turgan, lekin hali
     yashirin bloklarni majburan ko'rsatamiz (ScrollTrigger ishlamay qolsa). */
  setTimeout(() => {
    document.querySelectorAll("[data-reveal], [data-reveal-stagger]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const hidden = parseFloat(getComputedStyle(el).opacity) === 0;
      if (hidden && r.top < window.innerHeight && r.bottom > 0) {
        gsap.set(el, { autoAlpha: 1, y: 0 });
        gsap.set(el.children, { autoAlpha: 1, y: 0 });
      }
    });
  }, 2000);

  return true;
}
