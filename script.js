/**
 * Skill-up Learning Academy — script.js
 * Vanilla JS only. No frameworks. Deferred (non-blocking).
 *
 * Features:
 *  1.  Footer year
 *  2.  Sticky header + scrolled class
 *  3.  Mobile nav toggle
 *  4.  Contact form (fetch progressive enhancement)
 *  5.  Reveal on scroll (IntersectionObserver, variants + stagger)
 *  6.  Hero text entrance animation
 *  7.  Animated stat counters
 *  8.  Cursor glow (desktop)
 *  9.  Scroll progress indicator
 * 10.  Back-to-top button
 * 11.  Ripple effect on all .btn elements
 * 12.  Service card 3D tilt (mouse move)
 * 14.  Active nav link on scroll (section spy)
 * 15.  FAQ smooth accordion
 */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. FOOTER YEAR
     ============================================================ */
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();


  /* ============================================================
     2. STICKY HEADER
     ============================================================ */
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    const onScroll = () => siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
    hamburger.addEventListener('click', () =>
      hamburger.classList.contains('active') ? closeMobileNav() : openMobileNav()
    );
    mobileNav.querySelectorAll('a').forEach(l => l.addEventListener('click', closeMobileNav));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && hamburger.classList.contains('active')) {
        closeMobileNav();
        hamburger.focus();
      }
    });
  }


  /* ============================================================
     4. CONTACT FORM
     ============================================================ */
  const form        = document.getElementById('enquiry-form');
  const submitBtn   = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');

  if (form && submitBtn && formSuccess) {
    form.addEventListener('submit', async e => {
      if (form.action.includes('YOUR_FORMSPREE_FORM_ID')) return;
      e.preventDefault();
      const original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          form.style.display = 'none';
          formSuccess.classList.add('visible');
        } else {
          const json = await res.json().catch(() => ({}));
          const msg  = (json.errors || []).map(e => e.message).join(', ') || 'Something went wrong.';
          alert(msg);
          submitBtn.disabled    = false;
          submitBtn.textContent = original;
        }
      } catch (_) {
        alert('Network error. Please check your connection.');
        submitBtn.disabled    = false;
        submitBtn.textContent = original;
      }
    });
  }


  /* ============================================================
     5. REVEAL ON SCROLL — IntersectionObserver
     ============================================================ */
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const revealEls = document.querySelectorAll(revealSelectors);

  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }


  /* ============================================================
     6. HERO TEXT ENTRANCE
     ============================================================ */
  const heroText = document.querySelector('.hero-text');
  if (heroText) {
    // Small delay so CSS transitions fire after first paint
    requestAnimationFrame(() => {
      setTimeout(() => heroText.classList.add('animated'), 80);
    });
  }


  /* ============================================================
     7. ANIMATED STAT COUNTERS
     ============================================================ */
  function animateCounter(el, target, duration) {
    const isFloat   = String(target).includes('.');
    const suffix    = el.dataset.suffix || '';
    const prefix    = el.dataset.prefix || '';
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = isFloat
        ? (eased * target).toFixed(1)
        : Math.round(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else {
        el.textContent = prefix + target + suffix;
        el.closest('.hero-stat')?.classList.add('popped');
        setTimeout(() => el.closest('.hero-stat')?.classList.remove('popped'), 400);
      }
    }
    requestAnimationFrame(step);
  }

  const statBar = document.querySelector('.hero-stat-bar');
  if (statBar) {
    const statData = [
      { el: statBar.querySelectorAll('.hero-stat strong')[0], target: 12, suffix: ''    },
      { el: statBar.querySelectorAll('.hero-stat strong')[1], target: 8,  suffix: '+'   },
      { el: statBar.querySelectorAll('.hero-stat strong')[2], target: '1:1', raw: true  },
      { el: statBar.querySelectorAll('.hero-stat strong')[3], target: 2,  suffix: ' Boards' },
    ];
    let countersStarted = false;

    if ('IntersectionObserver' in window) {
      const counterObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !countersStarted) {
          countersStarted = true;
          statData.forEach(({ el, target, suffix, raw }, i) => {
            if (!el) return;
            setTimeout(() => {
              if (raw) return; // already correct text
              const num = parseFloat(String(target));
              el.dataset.suffix = suffix || '';
              animateCounter(el, num, 2600);
            }, i * 120);
          });
        }
      }, { threshold: 0.5 });
      counterObs.observe(statBar);
    }
  }


  /* ============================================================
     8. CURSOR GLOW (desktop only)
     ============================================================ */
  const glowEl = document.getElementById('cursor-glow');
  if (glowEl && !prefersReduced && window.matchMedia('(pointer:fine)').matches) {
    let gx = 0, gy = 0, cx = 0, cy = 0;
    let rafGlow;

    document.addEventListener('mousemove', e => { gx = e.clientX; gy = e.clientY; });

    function animGlow() {
      cx += (gx - cx) * 0.1;
      cy += (gy - cy) * 0.1;
      glowEl.style.left = cx + 'px';
      glowEl.style.top  = cy + 'px';
      rafGlow = requestAnimationFrame(animGlow);
    }
    animGlow();

    document.addEventListener('mouseleave', () => { glowEl.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { glowEl.style.opacity = '1'; });
  } else if (glowEl) {
    glowEl.style.display = 'none';
  }


  /* ============================================================
    10. SCROLL PROGRESS INDICATOR
     ============================================================ */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    function updateProgress() {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }


  /* ============================================================
    11. BACK-TO-TOP BUTTON
     ============================================================ */
  const btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'smooth' })
    );
  }


  /* ============================================================
    12. RIPPLE EFFECT ON BUTTONS
     ============================================================ */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      if (prefersReduced) return;
      const rect  = this.getBoundingClientRect();
      const size  = Math.max(rect.width, rect.height);
      const x     = e.clientX - rect.left - size / 2;
      const y     = e.clientY - rect.top  - size / 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-el';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });


  /* ============================================================
    13. SERVICE CARD 3D TILT (desktop)
     ============================================================ */
  if (!prefersReduced && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width / 2;
        const cy     = rect.top  + rect.height / 2;
        const rotX   = ((e.clientY - cy) / (rect.height / 2)) * -6;
        const rotY   = ((e.clientX - cx) / (rect.width  / 2)) * 6;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }


  /* ============================================================
    14. ACTIVE NAV LINK (section spy)
     ============================================================ */
  const navLinks   = document.querySelectorAll('.primary-nav a[href^="#"]');
  const sections   = [];

  navLinks.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ id, el, link });
  });

  if (sections.length && 'IntersectionObserver' in window) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const match = sections.find(s => s.el === entry.target);
        if (!match) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          match.link.classList.add('active');
        }
      });
    }, { threshold: 0.3, rootMargin: `-${siteHeader ? siteHeader.offsetHeight : 72}px 0px -40% 0px` });

    sections.forEach(({ el }) => navObs.observe(el));
  }


  /* ============================================================
    15. FAQ SMOOTH ACCORDION (animated height)
     ============================================================ */
  document.querySelectorAll('details').forEach(detail => {
    const summary = detail.querySelector('summary');
    const content = detail.querySelector('.faq-answer');
    if (!summary || !content) return;

    // Set initial max-height for animation
    content.style.overflow   = 'hidden';
    content.style.maxHeight  = '0';
    content.style.transition = prefersReduced
      ? 'none'
      : 'max-height 0.35s ease, opacity 0.25s ease, padding 0.3s ease';
    content.style.opacity    = '0';
    content.style.paddingTop = '0';

    // Prevent native toggle and handle manually
    summary.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = detail.hasAttribute('open');

      if (!isOpen) {
        detail.setAttribute('open', '');
        requestAnimationFrame(() => {
          content.style.maxHeight  = content.scrollHeight + 'px';
          content.style.opacity    = '1';
          content.style.paddingTop = '8px';
        });
      } else {
        content.style.maxHeight  = '0';
        content.style.opacity    = '0';
        content.style.paddingTop = '0';
        const dur = prefersReduced ? 0 : 350;
        setTimeout(() => detail.removeAttribute('open'), dur);
      }
    });
  });

})();
