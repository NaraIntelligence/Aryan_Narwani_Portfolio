/* ═══════════════════════════════════════════════════════════════════
   CAROUSEL — Swiper coverflow for projects & skills
═══════════════════════════════════════════════════════════════════ */
export function initCarousels() {
  if (typeof Swiper === 'undefined') return;

  document.querySelectorAll('.carousel .swiper').forEach(el => {
    new Swiper(el, {
      effect: 'coverflow',
      coverflowEffect: { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true },
      grabCursor: true,
      centeredSlides: true,
      loop: true,
      speed: 600,
      /* forceToAxis: only horizontal wheel moves it, so page scroll (Lenis) isn't trapped */
      mousewheel: { forceToAxis: true },
      keyboard: { enabled: true, onlyInViewport: true },
      pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
      slidesPerView: 1,
      breakpoints: {
        640:  { slidesPerView: 2 },
        1100: { slidesPerView: 3 },
      },
    });
  });
}
