/* ═══════════════════════════════════════════════════
   ByMobility – Vanilla JS
   Navbar, Mobile Menu, Parallax, Reveal, Counters, Carousel
   ═══════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ─── Navbar Scroll ───
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ─── Mobile Menu ───
  const hamburger = document.querySelector(".navbar__hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  if (hamburger && mobileMenu) {
    const mobileLinks = mobileMenu.querySelectorAll(".mobile-menu__link");

    function toggleMenu() {
      const isOpen = mobileMenu.classList.toggle("active");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      hamburger.setAttribute(
        "aria-label",
        isOpen ? "Fermer le menu" : "Ouvrir le menu",
      );
      document.body.classList.toggle("no-scroll", isOpen);
    }

    function closeMenu() {
      mobileMenu.classList.remove("active");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "Ouvrir le menu");
      document.body.classList.remove("no-scroll");
    }

    hamburger.addEventListener("click", toggleMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    const mobileCta = mobileMenu.querySelector(".btn");
    if (mobileCta) {
      mobileCta.addEventListener("click", closeMenu);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
        closeMenu();
      }
    });
  }

  // ─── Parallax (Hero) ───
  const heroParallax = document.getElementById("hero-parallax");
  if (heroParallax && !prefersReduced) {
    let ticking = false;

    function updateParallax() {
      const rect = heroParallax.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      if (rect.bottom >= 0 && rect.top <= viewHeight) {
        const scrolled = rect.top / viewHeight;
        const yOffset = scrolled * 0.3 * 100;
        heroParallax.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true },
    );

    updateParallax();
  }

  // ─── Reveal on Scroll (IntersectionObserver) ───
  const revealElements = document.querySelectorAll(".reveal");

  if (prefersReduced) {
    revealElements.forEach((el) => {
      el.classList.add("in-view");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            // Only hide when element exits below the viewport (scrolling back up)
            if (entry.boundingClientRect.top > 0) {
              entry.target.classList.remove("in-view");
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // ─── Animated Counters ───
  const counters = document.querySelectorAll(".counter[data-target]");

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix !== undefined ? el.dataset.prefix : "+";
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  if (prefersReduced) {
    counters.forEach((el) => {
      const target = el.dataset.target;
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix !== undefined ? el.dataset.prefix : "+";
      el.textContent = `${prefix}${target}${suffix}`;
    });
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((el) => counterObserver.observe(el));
  }

  // ─── Testimonials Carousel ───
  const slides = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".dot[data-slide-to]");
  const prevBtn = document.querySelector('[data-carousel="prev"]');
  const nextBtn = document.querySelector('[data-carousel="next"]');
  let activeSlide = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    slides.forEach((s) => s.classList.remove("active"));
    dots.forEach((d) => d.classList.remove("active"));

    activeSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    slides[activeSlide].classList.add("active");
    dots[activeSlide].classList.add("active");
  }

  if (prevBtn)
    prevBtn.addEventListener("click", () => goToSlide(activeSlide - 1));
  if (nextBtn)
    nextBtn.addEventListener("click", () => goToSlide(activeSlide + 1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goToSlide(parseInt(dot.dataset.slideTo, 10));
    });
  });

  // ─── Custom Luxury Cursor ───
  const isFinePointer = window.matchMedia("(hover: fine)").matches;

  if (!prefersReduced && isFinePointer) {
    const ring = document.createElement("div");
    ring.className = "cursor-ring cursor--hidden";
    document.body.appendChild(ring);

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);

    let mx = -100,
      my = -100;
    let rx = -100,
      ry = -100;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.classList.remove("cursor--hidden");
    });

    document.addEventListener("mouseleave", () =>
      ring.classList.add("cursor--hidden"),
    );

    document
      .querySelectorAll(
        "a, button, .btn, .service-card, .advantage-card, .property-card",
      )
      .forEach((el) => {
        el.addEventListener("mouseenter", () =>
          ring.classList.add("cursor--hover"),
        );
        el.addEventListener("mouseleave", () =>
          ring.classList.remove("cursor--hover"),
        );
      });

    (function animateRing() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    })();
  }

  // ─── Contact Form ───
  const contactForm = document.getElementById("contact-form");
  const formWrapper = document.querySelector(".contact__form-wrapper");

  if (contactForm && formWrapper) {
    // ── Injecter le panneau de succès ──
    const successPanel = document.createElement("div");
    successPanel.className = "contact__success";
    successPanel.setAttribute("role", "status");
    successPanel.setAttribute("aria-live", "polite");
    successPanel.innerHTML = `
      <div class="contact__success__icon">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      </div>
      <h3>Message envoy\u00e9\u00a0!</h3>
      <p>Merci <strong class="success-name"></strong>, nous avons bien re\u00e7u votre demande.<br>
         Nous vous r\u00e9pondrons dans les <strong>24\u00a0heures</strong>.</p>
    `;
    formWrapper.appendChild(successPanel);

    // ── Injecter la bannière d'erreur ──
    const errorBanner = document.createElement("div");
    errorBanner.className = "form-banner form-banner--error";
    errorBanner.setAttribute("role", "alert");
    errorBanner.setAttribute("aria-live", "assertive");
    contactForm.insertBefore(errorBanner, contactForm.firstChild);

    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // ── Helpers ──
    function setLoading(isLoading) {
      submitBtn.disabled = isLoading;
      if (isLoading) {
        submitBtn.dataset.label = submitBtn.textContent.trim();
        submitBtn.innerHTML =
          '<span class="btn-spinner" aria-hidden="true"></span>Envoi en cours\u2026';
        submitBtn.classList.add("btn--loading");
      } else {
        submitBtn.textContent = submitBtn.dataset.label || "Envoyer ma demande";
        submitBtn.classList.remove("btn--loading");
      }
    }

    function showError(msg) {
      errorBanner.textContent = msg;
      errorBanner.classList.add("visible");
      errorBanner.classList.remove("shake");
      void errorBanner.offsetWidth; // force reflow pour re-trigger l'animation
      errorBanner.classList.add("shake");
    }

    function hideError() {
      errorBanner.classList.remove("visible", "shake");
    }

    function showSuccess(name) {
      successPanel.querySelector(".success-name").textContent = name;
      // 1 – faire disparaître le formulaire
      contactForm.style.transition = "opacity 0.35s ease, transform 0.35s ease";
      contactForm.style.opacity = "0";
      contactForm.style.transform = "translateY(-14px)";
      // 2 – après la transition, cacher le form et afficher le succès
      setTimeout(() => {
        contactForm.style.display = "none";
        successPanel.classList.add("visible");
      }, 360);
    }

    // ── Regex email basique ──
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ── Handler de soumission ──
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideError();

      const name = contactForm.querySelector("#name").value.trim();
      const email = contactForm.querySelector("#email").value.trim();
      const message = contactForm.querySelector("#message").value.trim();

      // Validation côté client
      if (name.length < 2) {
        showError("Veuillez renseigner votre nom complet.");
        contactForm.querySelector("#name").focus();
        return;
      }
      if (!emailRe.test(email)) {
        showError("Veuillez entrer une adresse e-mail valide.");
        contactForm.querySelector("#email").focus();
        return;
      }
      if (message.length < 10) {
        showError("Votre message est trop court (minimum 10 caract\u00e8res).");
        contactForm.querySelector("#message").focus();
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("contact.php", {
          method: "POST",
          body: new FormData(contactForm),
        });

        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error("R\u00e9ponse inattendue du serveur.");
        }

        if (data.success) {
          showSuccess(name);
        } else {
          showError(
            data.message ?? "Une erreur est survenue. Veuillez r\u00e9essayer.",
          );
          setLoading(false);
        }
      } catch {
        showError(
          "Impossible d'envoyer le message. V\u00e9rifiez votre connexion et r\u00e9essayez.",
        );
        setLoading(false);
      }
    });
  }

  // ─── Subtle 3D Card Tilt ───
  if (!prefersReduced) {
    document
      .querySelectorAll(".service-card, .advantage-card")
      .forEach((card) => {
        let animFrame;

        card.addEventListener("mousemove", (e) => {
          cancelAnimationFrame(animFrame);
          animFrame = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const cx = (e.clientX - rect.left) / rect.width - 0.5;
            const cy = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(900px) rotateY(${cx * 6}deg) rotateX(${-cy * 6}deg) translateY(-4px)`;
          });
        });

        card.addEventListener("mouseleave", () => {
          cancelAnimationFrame(animFrame);
          card.style.transform = "";
        });
      });
  }
});
