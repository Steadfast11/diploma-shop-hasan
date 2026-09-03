/* ============================================================
   motion.js — "wow" animatsiyalar (GSAP + ScrollTrigger + Lenis)
   Kutubxonalar js/vendor/ da, HTML <head> da <script defer> bilan
   yuklanadi -> window.gsap / window.ScrollTrigger / window.Lenis.

   USLUB: MAKSIMAL SILLIQ. Uzoq davomiylik, yumshoq egri chiziqlar
   (power2.out / expo.out), kichik siljish. Keskin/tez harakat yo'q.

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
  gsap.defaults({ ease: "power2.out" }); // yumshoq to'xtash
  document.documentElement.classList.add("has-motion");

  /* --- XAVFSIZLIK TO'RI ---
     ATAYLAB ENG BOSHDA ro'yxatdan o'tkazamiz: pastdagi animatsiya kodining
     birortasi xato bersa ham, to'r baribir qurilgan bo'ladi. (Aks holda
     to'r aynan u eng kerak bo'lgan holatda ro'yxatdan o'tmay qolardi.)

     Animatsiya negadir tugamay qolsa, kontent yashirin qolib ketmasin.
     Eng xavfli hol: sahifa FON TABDA ochilgan bo'lsa — brauzer animatsiya
     kadrlarini to'xtatib turadi va gsap.from(...) elementni "from"
     holatida (opacity 0 / visibility hidden) qoldiradi. `main` uchun bu
     ayniqsa yomon: ichidagi hamma narsa `visibility` ni meros oladi.

     Shuning uchun: 2s dan keyin VA sahifa har safar ko'rinadigan bo'lganda
     ekrandagi yashirin qolgan narsalarni majburan ochamiz.
     Ekrandan tashqaridagilarga tegmaymiz — ular skroll bilan chiqadi. */
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  };

  function safetyNet() {
    // 1) main — butun sahifani yashirib qo'yishi mumkin
    const mainEl = document.querySelector("main");
    if (mainEl && getComputedStyle(mainEl).visibility === "hidden") {
      gsap.set(mainEl, { autoAlpha: 1, clearProps: "transform" });
    }
    // 2) reveal bloklari
    document.querySelectorAll("[data-reveal], [data-reveal-stagger]").forEach((el) => {
      if (parseFloat(getComputedStyle(el).opacity) === 0 && inView(el)) {
        gsap.set(el, { autoAlpha: 1, y: 0 });
        gsap.set(el.children, { autoAlpha: 1, y: 0 });
      }
    });
    // 3) so'z-maska (hero + [data-split] sarlavhalar) — so'zlar maska
    //    ortida "osilib" qolmasin
    //    MUHIM: ScrollTrigger "top 92%" da ishga tushadi. Shuning uchun
    //    faqat SHU nuqtadan o'tgan sarlavhalarni tuzatamiz — ekran eng
    //    chetida turgan, hali navbati kelmagan sarlavhaga tegmaymiz.
    document.querySelectorAll("[data-hero-line], [data-split]").forEach((title) => {
      const r = title.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight * 0.92) {
        gsap.set(title.querySelectorAll(".m-word__in"), { yPercent: 0 });
      }
    });
    // 4) hero tugmasi — u kechikish (delay) bilan chiqadi, shuning uchun
    //    to'xtab qolish ehtimoli eng yuqori
    const btn = document.querySelector(".hero__btn");
    if (btn && inView(btn) && getComputedStyle(btn).visibility === "hidden") {
      gsap.set(btn, { autoAlpha: 1, y: 0 });
    }
  }

  setTimeout(safetyNet, 2000);
  // Fon tabda ochilgan sahifa ko'rinadigan bo'lganda ham tekshiramiz
  // (animatsiyalar o'sha payt qayta boshlanadi -> ularga vaqt beramiz).
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) setTimeout(safetyNet, 1500);
  });


  /* --- Lenis: yumshoq, sekin inersiyali skroll --- */
  const lenis = new Lenis({
    duration: 1.5,        // uzoqroq -> silliqroq to'xtash
    smoothWheel: true,
    wheelMultiplier: 0.9, // g'ildirak biroz "yengil"
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // expo.out
  });
  // Boshqa modullar (masalan telefon davlat ro'yxati) skrollни vaqtincha
  // to'xtata olsin: window.__lenis.stop() / .start().
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* --- Blok reveal: [data-reveal] / [data-reveal-stagger] ko'rinishga kirganda
     yumshoq pastdan chiqadi. Kichik siljish, uzoq davomiylik. --- */
  gsap.utils.toArray("[data-reveal], [data-reveal-stagger]").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 14, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      }
    );
  });

  /* --- Hero: sarlavha so'zlari maska ortidan SEKIN ko'tariladi --- */
  const heroLines = document.querySelectorAll("[data-hero-line]");
  if (heroLines.length) {
    heroLines.forEach(splitWords);
    gsap.fromTo(
      "[data-hero-line] .m-word__in",
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.055,
        delay: 0.25,
      }
    );
  }
  const heroBtn = document.querySelector(".hero__btn");
  if (heroBtn) {
    gsap.fromTo(
      heroBtn,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", delay: 1.4 }
    );
  }

  /* --- Bo'lim sarlavhalari: hero bilan AYNAN bir xil so'z-maska effekti,
     lekin skroll bilan ko'rinishga kirganda. [data-split] qo'yilgan
     sarlavhalarda ishlaydi (matni JS bilan almashadiganlarida EMAS —
     splitWords innerHTML'ni qayta yozadi). --- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    splitWords(el);
    gsap.fromTo(
      el.querySelectorAll(".m-word__in"),
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 92%" },
      }
    );
  });

  /* --- Hero foni: skroll bilan juda yengil parallaks (scrub 1s "kechikadi") --- */
  const heroBg = document.querySelector("[data-parallax]");
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: heroBg.closest(".hero"),
        start: "top top",
        end: "bottom top",
        scrub: 1, // 1s "quvib yetish" -> silliqroq
      },
    });
  }

  /* --- Sahifa ochilishi: main juda oz pastdan yumshoq paydo bo'ladi --- */
  gsap.from("main", {
    autoAlpha: 0,
    y: 8,
    duration: 0.9,
    ease: "power2.out",
    // Tugagach transform qolsa, main ichidagi position:fixed modal
    // viewportga emas, uzun main blokiga nisbatan joylashib qoladi.
    clearProps: "transform",
  });

  ScrollTrigger.refresh();
  window.addEventListener("load", () => ScrollTrigger.refresh());

  return true;
}
