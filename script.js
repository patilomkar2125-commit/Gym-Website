// ============================================================
// APEX GYM — Main JavaScript
// Features: Theme toggle, scroll animations, nav, page transitions
// ============================================================

'use strict';

// ── Page Transition Overlay ──────────────────────────────────
const transitionOverlay = document.createElement('div');
transitionOverlay.className = 'page-transition';
document.body.appendChild(transitionOverlay);

// ── Init: Theme + Scroll Animations ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initPageTransitions();
  markActiveNavLink();
  initCounters();
  initContactForm();
  // Trigger page-loaded animation
  document.body.classList.add('page-loaded');
});

// ============================================================
// THEME — Day (Light) / Night (Dark)
// ============================================================
function initTheme() {
  const saved = localStorage.getItem('apexGymTheme') || 'dark';
  applyTheme(saved);

  // Wire up all theme toggle buttons on the page
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('apexGymTheme', theme);

  // Update icon aria-labels for accessibility
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Day mode' : 'Switch to Night mode');
    btn.setAttribute('title', theme === 'dark' ? 'Switch to Day mode' : 'Switch to Night mode');
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ============================================================
// NAVBAR — scroll shadow + active link
// ============================================================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // initial check
}

function markActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu-links a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ============================================================
// MOBILE MENU — hamburger toggle
// ============================================================
function initMobileMenu() {
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ============================================================
// SCROLL ANIMATIONS — Intersection Observer
// ============================================================
function initScrollAnimations() {
  const targets = document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

// ============================================================
// PAGE TRANSITIONS — smooth fade between pages
// ============================================================
function initPageTransitions() {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');

    // Only animate same-site page links
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('http') || link.target === '_blank') {
      return;
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();
      transitionOverlay.classList.add('active');
      setTimeout(() => {
        window.location.href = href;
      }, 280);
    });
  });

  // Fade out overlay on page show
  window.addEventListener('pageshow', () => {
    transitionOverlay.classList.remove('active');
  });
}

// ============================================================
// ANIMATED COUNTERS — count up to final value
// ============================================================
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-count'), 10);
  const suffix   = el.getAttribute('data-suffix') || '';
  const duration = 1800; // ms
  const start    = performance.now();

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOutQuart(progress) * target);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ============================================================
// CONTACT FORM — validation + submission
// ============================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Real-time validation on blur
  form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) validateField(input);
    });
  });

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const isValid = validateAll(form);
    if (!isValid) return;

    // Show loading state
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner">⏳</span> Sending...';

    // Simulate network request
    setTimeout(() => {
      form.style.display = 'none';
      const success = document.getElementById('form-success');
      if (success) {
        success.classList.add('visible');
      }
      btn.disabled = false;
      btn.innerHTML = originalText;
    }, 1800);
  });
}

function validateField(input) {
  const value = input.value.trim();
  const type  = input.type || input.tagName.toLowerCase();
  const name  = input.name;
  let   error = '';

  if (!value) {
    error = 'This field is required.';
  } else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error = 'Please enter a valid email address.';
  } else if (name === 'phone' && value && !/^[\d\s\+\-\(\)]{7,15}$/.test(value)) {
    error = 'Please enter a valid phone number.';
  } else if (name === 'message' && value.length < 10) {
    error = 'Message must be at least 10 characters.';
  }

  const group = input.closest('.form-group');
  const errEl = group?.querySelector('.form-error');

  if (error) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    if (errEl) { errEl.textContent = error; errEl.classList.add('visible'); }
  } else {
    input.classList.remove('invalid');
    input.classList.add('valid');
    if (errEl) { errEl.classList.remove('visible'); }
  }

  return !error;
}

function validateAll(form) {
  let valid = true;
  form.querySelectorAll('.form-input[required], .form-textarea[required]').forEach(input => {
    if (!validateField(input)) valid = false;
  });
  return valid;
}

// ============================================================
// FAQ ACCORDION (Services page)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const body    = item.querySelector('.accordion-body');
    if (!trigger || !body) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-body').style.maxHeight = '0';
      });

      // Open clicked
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
});
