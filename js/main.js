/* ═══════════════════════════════════════════════════
   ByMobility – Vanilla JS
   Navbar, Mobile Menu, Parallax, Reveal, Counters, Carousel
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Navbar Scroll ───
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Mobile Menu ───
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

    function toggleMenu() {
      const isOpen = mobileMenu.classList.toggle('active');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.classList.toggle('no-scroll', isOpen);
    }

    function closeMenu() {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.classList.remove('no-scroll');
    }

    hamburger.addEventListener('click', toggleMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    const mobileCta = mobileMenu.querySelector('.btn');
    if (mobileCta) {
      mobileCta.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ─── Parallax (Hero) ───
  const heroParallax = document.getElementById('hero-parallax');
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

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }

  // ─── Reveal on Scroll (IntersectionObserver) ───
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReduced) {
    revealElements.forEach((el) => {
      el.classList.add('in-view');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // ─── Animated Counters ───
  const counters = document.querySelectorAll('.counter[data-target]');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix !== undefined ? el.dataset.prefix : '+';
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
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix !== undefined ? el.dataset.prefix : '+';
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
      { threshold: 0.5 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  }

  // ─── Testimonials Carousel ───
  const slides = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot[data-slide-to]');
  const prevBtn = document.querySelector('[data-carousel="prev"]');
  const nextBtn = document.querySelector('[data-carousel="next"]');
  let activeSlide = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    slides.forEach((s) => s.classList.remove('active'));
    dots.forEach((d) => d.classList.remove('active'));

    activeSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    slides[activeSlide].classList.add('active');
    dots[activeSlide].classList.add('active');
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(activeSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(activeSlide + 1));

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slideTo, 10));
    });
  });
});
