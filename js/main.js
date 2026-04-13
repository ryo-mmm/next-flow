// ============================================================
// NextFlow AI — main.js
// ============================================================

(function () {
  'use strict';

  // ============================================================
  // 1. Dark Mode Toggle
  // ============================================================
  const darkToggleInput = document.getElementById('darkToggle');
  const darkIcon = document.getElementById('darkIcon');
  const body = document.body;

  function applyTheme(isDark) {
    body.classList.toggle('dark', isDark);
    if (darkToggleInput) darkToggleInput.checked = isDark;
    if (darkIcon) darkIcon.src = isDark ? 'img/icon-moon.svg' : 'img/icon-sun.svg';
  }

  // Restore saved preference (also respect OS preference)
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));

  if (darkToggleInput) {
    darkToggleInput.addEventListener('change', () => {
      applyTheme(darkToggleInput.checked);
      localStorage.setItem('theme', darkToggleInput.checked ? 'dark' : 'light');
    });
  }

  // ============================================================
  // 2. Scroll-triggered reveal animations (IntersectionObserver)
  // ============================================================
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  // ============================================================
  // 3. Pricing Toggle (monthly ↔ yearly)
  // ============================================================
  const billingToggle  = document.getElementById('billingToggle');
  const monthlyLabel   = document.getElementById('labelMonthly');
  const yearlyLabel    = document.getElementById('labelYearly');
  const discountBadge  = document.getElementById('discountBadge');

  // price data: { monthly, yearly, yearlySaving }
  const priceData = [
    { monthly: '0',      yearly: '0',      yearlySaving: null        }, // Free
    { monthly: '1,480',  yearly: '1,180',  yearlySaving: '20% OFF'   }, // Pro
    { monthly: '4,280',  yearly: '3,380',  yearlySaving: '21% OFF'   }, // Team
  ];

  function updatePrices(isYearly) {
    const amountEls = document.querySelectorAll('.plan-card__amount');
    const billingEls = document.querySelectorAll('.plan-card__billing');

    amountEls.forEach((el, i) => {
      const data = priceData[i];
      if (!data) return;

      const newVal = isYearly ? data.yearly : data.monthly;

      // Flip animation
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';

      setTimeout(() => {
        el.textContent = newVal;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      }, 120);
    });

    billingEls.forEach((el, i) => {
      const data = priceData[i];
      if (!data) return;

      if (isYearly && data.yearlySaving) {
        el.textContent = `年額払い · ${data.yearlySaving}`;
        el.classList.add('plan-card__billing--saving');
      } else if (isYearly) {
        el.textContent = '年額払い';
        el.classList.remove('plan-card__billing--saving');
      } else {
        el.textContent = '月額払い · いつでも解約可';
        el.classList.remove('plan-card__billing--saving');
      }
    });

    // Labels
    if (monthlyLabel) monthlyLabel.classList.toggle('active', !isYearly);
    if (yearlyLabel)  yearlyLabel.classList.toggle('active',  isYearly);

    // Discount badge
    if (discountBadge) {
      discountBadge.classList.toggle('visible', isYearly);
    }
  }

  if (billingToggle) {
    billingToggle.addEventListener('change', () => {
      updatePrices(billingToggle.checked);
    });
    // init
    updatePrices(false);
  }

  // ============================================================
  // 4. FAQ Accordion
  // ============================================================
  document.querySelectorAll('.faq-item__header').forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.faq-item');
      const isOpen = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item.active').forEach((el) => {
        el.classList.remove('active');
        el.querySelector('.faq-item__header').setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });

    // Keyboard support
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  // ============================================================
  // 5. Efficiency chart bars — animate on scroll
  // ============================================================
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.efficiency__chart-row-bar').forEach((bar, i) => {
            setTimeout(() => bar.classList.add('animated'), 100 + i * 150);
          });
          chartObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.efficiency__chart').forEach((el) => {
    chartObserver.observe(el);
  });

  // ============================================================
  // 6. Counter animation (stat numbers)
  // ============================================================
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || el.textContent);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease out quart
      const current = target * eased;

      // Format: if decimal, show 1 decimal place
      el.textContent = Number.isInteger(target)
        ? Math.floor(current) + suffix
        : current.toFixed(1) + suffix;

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

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

  document.querySelectorAll('[data-counter]').forEach((el) => {
    counterObserver.observe(el);
  });

  // ============================================================
  // 7. Smooth-scroll nav links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ============================================================
  // 8. Nav scroll effect
  // ============================================================
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }
})();
