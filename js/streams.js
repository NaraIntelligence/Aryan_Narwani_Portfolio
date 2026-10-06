/* ═══════════════════════════════════════════════════════════════════
   SKILL STREAMS — Vertical infinite columns, alternating direction
═══════════════════════════════════════════════════════════════════ */
const MIN_FILL = 480; /* tallest stream window (desktop) + margin */

export function initSkillStreams() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.skills-stream').forEach((col, i) => {
    const track = col.querySelector('.skills-stream-track');
    if (!track) return;

    /* Repeat the set until it overfills the window, then double it for a seamless -50% loop */
    const set = [...track.children];
    const clone = n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); };
    while (track.scrollHeight < MIN_FILL) set.forEach(clone);
    [...track.children].forEach(clone);

    const up    = i % 2 === 0;
    const speed = 22 + (i % 3) * 6; /* px per second — slightly different per column */
    const tween = gsap.fromTo(track,
      { yPercent: up ? 0 : -50 },
      { yPercent: up ? -50 : 0, duration: track.scrollHeight / 2 / speed, ease: 'none', repeat: -1 });

    /* Ease to a stop on hover so tags can be read */
    col.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: 0, duration: .5 }));
    col.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: .5 }));
  });
}
