/* ═══════════════════════════════════════════════════════════════════
   FLIGHT PATH — Curved route through the timeline dots, with a paper
   plane that follows the reading line as you scroll
═══════════════════════════════════════════════════════════════════ */
const READ_LINE = 0.6; /* plane sits where the viewport's 60% line crosses the route */
const SAMPLES   = 600;

export function initFlightPath() {
  const tl       = document.querySelector('.timeline');
  const base     = tl?.querySelector('.timeline-path-base');
  const progress = tl?.querySelector('.timeline-path-progress');
  const plane    = tl?.querySelector('.timeline-plane');
  if (!tl || !base || !progress || !plane) return;

  const items = [...tl.querySelectorAll('.timeline-item')];
  let samples = [], dotsY = [], length = 0;

  /* Layout positions (offset*), so GSAP reveal transforms don't skew the route */
  function build() {
    const pts = items.map(item => {
      const dot = item.querySelector('.timeline-dot');
      return {
        x: item.offsetLeft + dot.offsetLeft + dot.offsetWidth / 2,
        y: item.offsetTop + dot.offsetTop + dot.offsetHeight / 2,
      };
    });
    if (pts.length < 2) return;

    /* Each leg leaves a dot vertically and crosses sides through the middle of
       the gap between the two cards, so the route never runs over the text */
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], prev = items[i - 1];
      const contentEnd = prev.offsetTop + prev.offsetHeight - parseFloat(getComputedStyle(prev).paddingBottom);
      const m  = { x: (a.x + b.x) / 2, y: (contentEnd + items[i].offsetTop) / 2 };
      const tx = (b.x - a.x) * .15, ty = (b.y - a.y) * .15; /* diagonal tangent at the crossing */
      d += ` C ${a.x} ${a.y + (m.y - a.y) / 2} ${m.x - tx} ${m.y - ty} ${m.x} ${m.y}`;
      d += ` C ${m.x + tx} ${m.y + ty} ${b.x} ${b.y - (b.y - m.y) / 2} ${b.x} ${b.y}`;
    }
    base.setAttribute('d', d);
    progress.setAttribute('d', d);

    length = progress.getTotalLength();
    progress.style.strokeDasharray = length;
    samples = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const len = (i / SAMPLES) * length;
      const p = progress.getPointAtLength(len);
      return { len, x: p.x, y: p.y };
    });
    dotsY = pts.map(p => p.y);
    update();
  }

  function update() {
    if (!samples.length) return;
    const lineY = window.innerHeight * READ_LINE - tl.getBoundingClientRect().top;

    /* y grows monotonically along the route → binary search the sample */
    let lo = 0, hi = samples.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (samples[mid].y < lineY) lo = mid + 1; else hi = mid;
    }
    const s    = samples[lo];
    const prev = samples[Math.max(lo - 2, 0)];
    const next = samples[Math.min(lo + 2, samples.length - 1)];
    const angle = Math.atan2(next.y - prev.y, next.x - prev.x) * 180 / Math.PI;

    /* The icon points up-right (-45°), so offset by 45° to align with the route */
    plane.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${angle + 45}deg)`;
    progress.style.strokeDashoffset = length - s.len;
    items.forEach((item, i) => item.classList.toggle('is-active', lineY >= dotsY[i] - 1));
  }

  build();
  if (document.fonts) document.fonts.ready.then(build);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.addEventListener('refresh', build);
    ScrollTrigger.create({ trigger: tl, start: 'top bottom', end: 'bottom top', onUpdate: update });
  } else {
    window.addEventListener('scroll', update, { passive: true });
  }
}
