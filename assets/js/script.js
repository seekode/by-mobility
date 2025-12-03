/**
 * ByMobility - Main JavaScript
 * Optimized for performance and readability
 */

// ===== Utility Functions =====
const debounce = (func, wait = 10) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ===== DOM Cache =====
const DOM = {
  nav: document.getElementById("nav"),
  navToggle: document.getElementById("navToggle"),
  navMenu: document.getElementById("navMenu"),
  navLinks: document.querySelectorAll(".nav-link"),
  sections: document.querySelectorAll("section[id]"),
  scrollIndicator: document.querySelector(".scroll-indicator"),
  videoBtn: document.getElementById("videoBtn"),
  videoModal: document.getElementById("videoModal"),
  videoModalClose: document.getElementById("videoModalClose"),
  videoIframe: document.getElementById("videoIframe"),
  parallaxElements: document.querySelectorAll(".gradient-orb"),
  statsCards: document.querySelectorAll(".stat-highlight"),
  statNumbers: document.querySelectorAll(".stat-number"),
  forms: document.querySelectorAll("form"),
  animatedElements: document.querySelectorAll(
    ".service-card, .benefit-card, .testimonial-card, .pricing-plan, .process-step, .stat-highlight, .gallery-item, .team-member, .pricing-toggle-wrapper, .pricing-showcase, .contact-info, .contact-form-wrapper, .contact-detail",
  ),
};

// ===== Navigation Module =====
const Navigation = {
  closeMenu() {
    DOM.navToggle.classList.remove("active");
    DOM.navMenu.classList.remove("active");
    document.body.style.overflow = "";
  },

  toggleMenu() {
    DOM.navToggle.classList.toggle("active");
    DOM.navMenu.classList.toggle("active");
    document.body.style.overflow = DOM.navMenu.classList.contains("active")
      ? "hidden"
      : "";
  },

  handleScroll() {
    DOM.nav.classList.toggle("scrolled", window.pageYOffset > 100);
  },

  highlightActiveLink() {
    const scrollY = window.pageYOffset;

    DOM.sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        DOM.navLinks.forEach((link) => link.classList.remove("active"));
        const activeLink = document.querySelector(
          `.nav-link[href="#${sectionId}"]`,
        );
        if (activeLink) activeLink.classList.add("active");
      }
    });
  },

  init() {
    // Toggle menu
    DOM.navToggle.addEventListener("click", () => this.toggleMenu());

    // Close menu on link click
    DOM.navLinks.forEach((link) => {
      link.addEventListener("click", () => this.closeMenu());
    });

    // Close menu on outside click
    document.addEventListener("click", (e) => {
      if (
        !DOM.nav.contains(e.target) &&
        DOM.navMenu.classList.contains("active")
      ) {
        this.closeMenu();
      }
    });

    // Initial state
    this.handleScroll();
    this.highlightActiveLink();
  },
};

// ===== Smooth Scroll Module =====
const SmoothScroll = {
  scrollTo(target, offset = 80) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (element) {
      window.scrollTo({
        top: element.offsetTop - offset,
        behavior: "smooth",
      });
    }
  },

  init() {
    // Scroll indicator
    if (DOM.scrollIndicator) {
      DOM.scrollIndicator.addEventListener("click", () => {
        this.scrollTo("#services");
      });
    }

    // Anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (href === "#") return;

        e.preventDefault();
        this.scrollTo(href);
      });
    });
  },
};

// ===== Video Modal Module =====
const VideoModal = {
  videoUrl: "https://www.youtube.com/embed/PH6dQ59Oayg?autoplay=1",

  open() {
    DOM.videoModal.classList.add("active");
    DOM.videoIframe.src = this.videoUrl;
    document.body.style.overflow = "hidden";
  },

  close() {
    DOM.videoModal.classList.remove("active");
    DOM.videoIframe.src = "";
    document.body.style.overflow = "";
  },

  init() {
    if (!DOM.videoBtn || !DOM.videoModal) return;

    DOM.videoBtn.addEventListener("click", () => this.open());
    DOM.videoModalClose.addEventListener("click", () => this.close());
    DOM.videoModal
      .querySelector(".video-modal-backdrop")
      .addEventListener("click", () => this.close());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && DOM.videoModal.classList.contains("active")) {
        this.close();
      }
    });
  },
};

// ===== Animations Module =====
const Animations = {
  prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches,

  animateCounter(element, target, duration = 2000) {
    const isMoney = element.parentElement
      ?.querySelector(".stat-label")
      ?.textContent.includes("M€");
    const increment = target / (duration / 16);
    let current = 0;

    const update = () => {
      current += increment;
      if (current < target) {
        element.textContent = isMoney ? current.toFixed(1) : Math.ceil(current);
        requestAnimationFrame(update);
      } else {
        element.textContent = isMoney ? target.toFixed(1) : target;
      }
    };

    update();
  },

  handleParallax() {
    if (this.prefersReducedMotion) return;

    const scrolled = window.pageYOffset;
    DOM.parallaxElements.forEach((element, index) => {
      const speed = 0.3 + index * 0.1;
      element.style.transform = `translateY(${-(scrolled * speed)}px)`;
    });
  },

  init() {
    // Respect reduced motion preference
    if (this.prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = "auto";
      DOM.animatedElements.forEach((el) => {
        el.style.transition = "none";
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Scroll animations observer - bidirectional (animate in and out)
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    DOM.animatedElements.forEach((element) => {
      element.classList.add("animate-on-scroll");
      scrollObserver.observe(element);
    });

    // Counter animation observer
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !entry.target.classList.contains("counted")
          ) {
            const target = parseInt(entry.target.getAttribute("data-target"));
            this.animateCounter(entry.target, target);
            entry.target.classList.add("counted");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
    );

    DOM.statNumbers.forEach((counter) => counterObserver.observe(counter));

    // Stats cards staggered animation delay
    DOM.statsCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.2}s`;
    });

    // Initial parallax
    this.handleParallax();
  },
};

// ===== Pricing Toggle Module =====
const PricingToggle = {
  wrapper: document.querySelector(".pricing-toggle-wrapper"),
  toggleBtns: document.querySelectorAll(".pricing-toggle-btn"),
  showcase: document.querySelector(".pricing-showcase"),
  plans: document.querySelectorAll(".pricing-plan"),
  slider: null,
  currentPlan: "courte-duree",

  createSlider() {
    if (!this.wrapper) return;

    this.slider = document.createElement("div");
    this.slider.className = "pricing-toggle-slider";
    this.wrapper.appendChild(this.slider);

    // Set initial slider position
    this.updateSliderPosition();
  },

  updateSliderPosition() {
    const activeBtn = this.wrapper.querySelector(".pricing-toggle-btn.active");
    if (!activeBtn || !this.slider) return;

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    this.slider.style.width = `${btnRect.width}px`;
    this.slider.style.left = `${btnRect.left - wrapperRect.left}px`;
  },

  switchPlan(planId) {
    if (planId === this.currentPlan) return;

    this.currentPlan = planId;

    // Update toggle buttons
    this.toggleBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.plan === planId);
    });

    // Update slider position
    this.updateSliderPosition();

    // Update showcase class for 3D carousel effect
    if (this.showcase) {
      this.showcase.classList.toggle(
        "bail-active",
        planId === "bail-mobilite",
      );
    }
  },

  init() {
    if (!this.toggleBtns.length) return;

    this.createSlider();

    // Toggle button clicks
    this.toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.switchPlan(btn.dataset.plan);
      });
    });

    // Card clicks - switch to clicked card
    this.plans.forEach((plan) => {
      plan.addEventListener("click", () => {
        const planId = plan.dataset.plan;
        if (planId !== this.currentPlan) {
          this.switchPlan(planId);
        }
      });
    });

    // Update slider on resize
    window.addEventListener("resize", debounce(() => {
      this.updateSliderPosition();
    }, 100));
  },
};

// ===== Form Module =====
const Form = {
  showSuccess() {
    const message = document.createElement("div");
    message.className = "form-success-message";
    message.textContent = "Merci ! Nous vous contacterons bientôt.";
    document.body.appendChild(message);

    setTimeout(() => {
      message.classList.add("fade-out");
      setTimeout(() => message.remove(), 300);
    }, 3000);
  },

  init() {
    DOM.forms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        // Add form submission logic here (API call, etc.)
        form.reset();
        this.showSuccess();
      });
    });
  },
};

// ===== Unified Scroll Handler =====
const handleScroll = debounce(() => {
  Navigation.handleScroll();
  Navigation.highlightActiveLink();
  Animations.handleParallax();
}, 10);

// ===== Hero Load Animation =====
const initHeroAnimation = () => {
  document.body.classList.add("loaded");
};

// ===== Initialize App =====
const init = () => {
  Navigation.init();
  SmoothScroll.init();
  VideoModal.init();
  Animations.init();
  PricingToggle.init();
  Form.init();

  // Single scroll listener for all scroll-related functions
  window.addEventListener("scroll", handleScroll);

  // Load animation
  window.addEventListener("load", initHeroAnimation);
};

init();
