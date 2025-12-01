// ===========================
// UTILITY FUNCTIONS
// ===========================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
        rect.bottom >= 0
    );
}

// ===========================
// NAVIGATION
// ===========================

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', debounce(() => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
}, 10));

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        // Animate hamburger icon
        const spans = mobileMenuToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // navbar height
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// ANIMATED COUNTERS
// ===========================

function animateCounter(element, target, duration = 2000, decimals = 0) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = decimals > 0 ? target.toFixed(decimals) : Math.ceil(target);
            clearInterval(timer);
        } else {
            element.textContent = decimals > 0 ? current.toFixed(decimals) : Math.ceil(current);
        }
    }, 16);
}

// Initialize counters when they come into view
const statNumbers = document.querySelectorAll('.stat-number');
let countersAnimated = false;

function initCounters() {
    if (countersAnimated) return;

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats && isInViewport(heroStats, 100)) {
        countersAnimated = true;
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.dataset.target);
            const decimals = target % 1 !== 0 ? 1 : 0;
            animateCounter(stat, target, 2000, decimals);
        });
    }
}

window.addEventListener('scroll', debounce(initCounters, 100));
// Try to animate immediately if already in view
setTimeout(initCounters, 500);

// ===========================
// SCROLL ANIMATIONS
// ===========================

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');

            // Add staggered animation delay for service cards
            if (entry.target.classList.contains('service-card')) {
                const cards = document.querySelectorAll('.service-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate');
                    }, index * 150);
                });
            }

            // Add staggered animation for process steps
            if (entry.target.classList.contains('process-step')) {
                const steps = document.querySelectorAll('.process-step');
                steps.forEach((step, index) => {
                    setTimeout(() => {
                        step.classList.add('animate');
                    }, index * 200);
                });
            }

            // Add staggered animation for advantage items
            if (entry.target.classList.contains('advantage-item')) {
                const items = document.querySelectorAll('.advantage-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('animate');
                    }, index * 150);
                });
            }
        }
    });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
    // Service cards
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });

    // Process steps
    document.querySelectorAll('.process-step').forEach(step => {
        observer.observe(step);
    });

    // Advantage items
    document.querySelectorAll('.advantage-item').forEach(item => {
        observer.observe(item);
    });

    // Testimonial cards
    document.querySelectorAll('.testimonial-card').forEach(card => {
        observer.observe(card);
    });

    // Pricing cards
    document.querySelectorAll('.pricing-card').forEach(card => {
        observer.observe(card);
    });
});

// ===========================
// PARALLAX EFFECT
// ===========================

window.addEventListener('scroll', debounce(() => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-background::before, .hero-background::after');

    // Hero background parallax
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }

    // Visual cards parallax
    const visualCards = document.querySelectorAll('.visual-card');
    visualCards.forEach((card, index) => {
        const speed = 0.05 + (index * 0.02);
        const offset = scrolled * speed;
        if (isInViewport(card.parentElement, 200)) {
            card.style.transform = `translateY(${-offset}px)`;
        }
    });
}, 10));

// ===========================
// DYNAMIC TEXT EFFECT
// ===========================

function createTextReveal() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    // Add text reveal animation
    heroTitle.style.opacity = '1';
}

document.addEventListener('DOMContentLoaded', createTextReveal);

// ===========================
// PERFORMANCE OPTIMIZATION
// ===========================

// Lazy load images
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ===========================
// FORM VALIDATION (if needed)
// ===========================

// Add form validation if you add a contact form later
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// ===========================
// PAGE LOAD ANIMATIONS
// ===========================

window.addEventListener('load', () => {
    // Remove loading class if present
    document.body.classList.remove('loading');

    // Trigger initial animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ===========================
// PREVENT FLASH OF UNSTYLED CONTENT
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.visibility = 'visible';
});

// ===========================
// ACCESSIBILITY ENHANCEMENTS
// ===========================

// Keyboard navigation for mobile menu
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            mobileMenuToggle.click();
        }
    });
}

// Focus trap for mobile menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// ===========================
// CONSOLE MESSAGE
// ===========================

console.log('%cByMobility', 'font-size: 24px; font-weight: bold; color: #A8977B;');
console.log('%cVotre expert en gestion locative', 'font-size: 14px; color: #666;');
console.log('%c🏠 https://bymobility.fr', 'font-size: 12px; color: #999;');
