/**
 * Skill-up Learning Academy — script.js
 * Vanilla JS only. No frameworks. Deferred (non-blocking).
 *
 * Features:
 * 1. Sticky header — adds .scrolled class on scroll
 * 2. Mobile nav toggle — hamburger open/close + close on link click
 * 3. Contact form — fetch() progressive enhancement with success message
 * 4. Reveal on scroll — IntersectionObserver for .reveal elements
 * 5. Footer year — sets current year in #year span
 */

(function () {
  'use strict';

  /* ============================================================
     1. FOOTER YEAR
     ============================================================ */
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* ============================================================
     2. STICKY HEADER
     ============================================================ */
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    const onScroll = () => {
      siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ============================================================
     3. MOBILE NAV TOGGLE
     ============================================================ */
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openMobileNav() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('active');
      isOpen ? closeMobileNav() : openMobileNav();
    });

    // Close on any nav link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('active')) {
        closeMobileNav();
        hamburger.focus();
      }
    });
  }

  /* ============================================================
     4. CONTACT FORM — fetch() progressive enhancement
     ============================================================ */
  const form        = document.getElementById('enquiry-form');
  const submitBtn   = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');

  if (form && submitBtn && formSuccess) {
    form.addEventListener('submit', async (e) => {
      // Bail out if the action URL still has the placeholder — let native form submission handle it
      if (form.action.includes('YOUR_FORMSPREE_FORM_ID')) return;

      e.preventDefault();

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const data     = new FormData(form);
        const response = await fetch(form.action, {
          method:  'POST',
          body:    data,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.style.display        = 'none';
          formSuccess.classList.add('visible');
        } else {
          const json = await response.json().catch(() => ({}));
          const msg  = (json.errors || []).map(err => err.message).join(', ') || 'Something went wrong. Please try again or WhatsApp us.';
          alert(msg);
          submitBtn.disabled    = false;
          submitBtn.textContent = originalText;
        }
      } catch (_) {
        alert('Network error. Please check your connection and try again, or WhatsApp us directly.');
        submitBtn.disabled    = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  /* ============================================================
     6. REVEAL ON SCROLL — IntersectionObserver
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately (no IntersectionObserver support)
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

})();
