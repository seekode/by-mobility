// ===== Utility Functions =====
const debounce = (func, wait = 10) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ===== Particles Animation =====
const createParticles = () => {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            pointer-events: none;
        `;
        particlesContainer.appendChild(particle);
    }

    // Add CSS animation for particles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

// Initialize particles
createParticles();

// ===== Navigation =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Sticky navigation on scroll
let lastScroll = 0;

const handleScroll = () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
};

window.addEventListener('scroll', debounce(handleScroll, 10));

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href === '#') {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');

const highlightNavLink = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
};

window.addEventListener('scroll', debounce(highlightNavLink, 10));

// ===== Counter Animation =====
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const isMoney = element.parentElement.querySelector('.stat-label')?.textContent.includes('M€');

    const updateCounter = () => {
        start += increment;

        if (start < target) {
            if (isMoney) {
                element.textContent = start.toFixed(1);
            } else {
                element.textContent = Math.ceil(start);
            }
            requestAnimationFrame(updateCounter);
        } else {
            if (isMoney) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target;
            }
        }
    };

    updateCounter();
};

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

// Animate elements on scroll
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements
const elementsToAnimate = document.querySelectorAll(`
    .service-card,
    .benefit-card,
    .testimonial-card,
    .pricing-card,
    .process-step,
    .stat-highlight,
    .gallery-item
`);

elementsToAnimate.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    animateOnScroll.observe(element);
});

// Counter animation on scroll
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            animateCounter(entry.target, target);
            entry.target.classList.add('counted');
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(counter => {
    counterObserver.observe(counter);
});

// ===== Parallax Effect =====
const parallaxElements = document.querySelectorAll('.gradient-orb');

const handleParallax = () => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach((element, index) => {
        const speed = 0.3 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
};

window.addEventListener('scroll', debounce(handleParallax, 10));

// ===== Card Tilt Effect =====
const cards = document.querySelectorAll('.service-card, .pricing-card, .benefit-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ===== Lazy Loading Images =====
const lazyImages = document.querySelectorAll('img[loading="lazy"]');

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===== Stats Cards Pulse Animation =====
const statsCards = document.querySelectorAll('.stat-highlight');

statsCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
});

// ===== Form Validation (if contact form exists) =====
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        console.log('Form submitted:', data);

        // Add your form submission logic here
        form.reset();

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Merci ! Nous vous contacterons bientôt.';
        successMessage.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #856e53 0%, #c9a961 100%);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(successMessage);

        setTimeout(() => {
            successMessage.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => successMessage.remove(), 300);
        }, 3000);
    });
});

// ===== Video Player Enhancement =====
const videoWrapper = document.querySelector('.video-wrapper');
if (videoWrapper) {
    const iframe = videoWrapper.querySelector('iframe');

    videoWrapper.addEventListener('click', () => {
        if (iframe && !iframe.src.includes('autoplay=1')) {
            iframe.src += '&autoplay=1';
        }
    });
}

// ===== Testimonials Auto-Rotate (Optional) =====
const testimonialCards = document.querySelectorAll('.testimonial-card');
let currentTestimonial = 0;

const rotateTestimonials = () => {
    testimonialCards.forEach((card, index) => {
        card.style.opacity = index === currentTestimonial ? '1' : '0.5';
        card.style.transform = index === currentTestimonial ? 'scale(1.02)' : 'scale(1)';
    });

    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
};

// Uncomment to enable auto-rotation
// setInterval(rotateTestimonials, 5000);

// ===== Performance Optimization =====
// Reduce motion for users who prefer it
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    document.documentElement.style.scrollBehavior = 'auto';

    elementsToAnimate.forEach(element => {
        element.style.transition = 'none';
        element.style.opacity = '1';
        element.style.transform = 'none';
    });
}

// ===== Loading Animation =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger animations for hero section
    const heroElements = document.querySelectorAll('.hero .animate-in');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// ===== Easter Egg: Konami Code =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;

        if (konamiIndex === konamiCode.length) {
            // Easter egg activated!
            document.body.style.animation = 'rotate 2s ease-in-out';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 2000);
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// ===== Console Message =====
console.log(
    '%c🏠 ByMobility',
    'font-size: 40px; font-weight: bold; background: linear-gradient(135deg, #856e53 0%, #c9a961 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
);
console.log(
    '%cExpert en gestion locative à Paris',
    'font-size: 14px; color: #856e53;'
);
console.log(
    '%cWebsite built with ❤️',
    'font-size: 12px; color: #666;'
);

// ===== Service Worker Registration (for PWA - Optional) =====
if ('serviceWorker' in navigator) {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js')
    //     .then(registration => console.log('SW registered:', registration))
    //     .catch(error => console.log('SW registration failed:', error));
}

// ===== Analytics Tracking (Placeholder) =====
const trackEvent = (category, action, label) => {
    console.log('Event tracked:', { category, action, label });
    // Add your analytics code here (Google Analytics, Matomo, etc.)
};

// Track CTA clicks
document.querySelectorAll('.btn, .service-cta').forEach(button => {
    button.addEventListener('click', (e) => {
        const text = e.target.textContent.trim();
        trackEvent('CTA', 'click', text);
    });
});

// Track scroll depth
let scrollDepth = 0;
const trackScrollDepth = debounce(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset;
    const currentDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);

    if (currentDepth > scrollDepth && currentDepth % 25 === 0) {
        scrollDepth = currentDepth;
        trackEvent('Scroll', 'depth', `${scrollDepth}%`);
    }
}, 500);

window.addEventListener('scroll', trackScrollDepth);

// ===== Accessibility Enhancements =====
// Skip to content link
const skipLink = document.createElement('a');
skipLink.href = '#accueil';
skipLink.textContent = 'Aller au contenu principal';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
    position: absolute;
    top: -100px;
    left: 0;
    background: #856e53;
    color: white;
    padding: 0.5rem 1rem;
    z-index: 10000;
    transition: top 0.3s;
`;

skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});

skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-100px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// Keyboard navigation for cards
cards.forEach(card => {
    card.setAttribute('tabindex', '0');

    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const link = card.querySelector('a');
            if (link) {
                link.click();
            }
        }
    });
});

// ===== Live Chat Integration (Placeholder) =====
// Add your live chat code here (Intercom, Crisp, etc.)

// ===== Cookie Consent (Placeholder) =====
// Add your cookie consent code here

// ===== Initialize all features =====
const init = () => {
    handleScroll();
    highlightNavLink();
    handleParallax();
};

// Run initialization
init();
