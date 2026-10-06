/* ═══════════════════════════════════════════════════════════════════
   ANIMATIONS — Scroll reveals, timeline fill, hero parallax
═══════════════════════════════════════════════════════════════════ */
export function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  /* ─── DATA-ANIM SCROLL REVEALS ─── */
  gsap.utils.toArray('[data-anim="title"]').forEach(el => {
    if (el.closest('#hero')) return;
    gsap.from(el, {
      yPercent: 110, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  gsap.utils.toArray('[data-anim="fade"]').forEach(el => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  gsap.utils.toArray('[data-anim="slide"]').forEach((el, i) => {
    gsap.from(el, {
      x: -30, opacity: 0, duration: .9, ease: 'power3.out', delay: i * .05,
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  gsap.utils.toArray('[data-anim="card"]').forEach((el, i) => {
    gsap.from(el, {
      y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: (i % 3) * .08,
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  /* (Timeline cards, route & plane are driven by flightpath.js) */

  /* ─── HERO PARALLAX (subtle) ─── */
  gsap.to('.hero-grid', {
    yPercent: 25, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero-photo-bg img', {
    yPercent: 8, scale: 1.08, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero-left', {
    yPercent: -15, opacity: .3, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}
