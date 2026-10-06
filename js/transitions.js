/* ═══════════════════════════════════════════════════════════════════
   TRANSITIONS — Section title overlay animations
═══════════════════════════════════════════════════════════════════ */
const sectionMeta = {
  'about':      { label: '01 — About',      title: 'ABOUT',   counter: '01 / 06' },
  'skills':     { label: '02 — Stack',      title: 'STACK',   counter: '02 / 06' },
  'projects':   { label: '03 — Work',       title: 'WORK',    counter: '03 / 06' },
  /* experience: no overlay — the paper-plane flight path is its entrance */
  'focus':      { label: '05 — Value',      title: 'BUILD',   counter: '05 / 06' },
  'contact':    { label: '06 — Contact',    title: 'CONTACT', counter: '06 / 06', fontSize: 'clamp(3rem,10vw,12rem)' },
};

function playTitleTransition(meta) {
  if (typeof gsap === 'undefined') return;

  const overlay      = document.getElementById('section-overlay');
  const overlayTitle = document.getElementById('section-overlay-title');
  const overlayLabel = document.getElementById('section-overlay-label');
  const overlayLine  = document.getElementById('section-overlay-line');
  const overlayCtr   = document.getElementById('section-overlay-counter');

  /* Reset overlay state fully */
  gsap.killTweensOf([overlay, overlayTitle, overlayLabel, overlayCtr, overlayLine]);
  overlayTitle.textContent = meta.title;
  overlayLabel.textContent = meta.label;
  overlayCtr.textContent   = meta.counter;

  /* Apply custom font size if defined, otherwise reset to CSS default */
  overlayTitle.style.fontSize = meta.fontSize || '';

  gsap.set(overlay,      { visibility: 'visible', opacity: 0 });
  gsap.set(overlayTitle, { y: '60%', opacity: 0, scale: 1, x: 0 });
  gsap.set(overlayLabel, { opacity: 0 });
  gsap.set(overlayCtr,   { opacity: 0 });
  gsap.set(overlayLine,  { scaleX: 0, transformOrigin: 'left' });

  const tl = gsap.timeline({
    onComplete: () => {
      overlay.style.visibility = 'hidden';
      gsap.set(overlay, { opacity: 0 });
    }
  });

  /* 1 — black bg flashes in */
  tl.to(overlay, { opacity: 1, duration: .2, ease: 'none' }, 0)
  /* 2 — accent line sweeps */
  .to(overlayLine, { scaleX: 1, duration: .35, ease: 'expo.out' }, 0)
  /* 3 — word slams up from below */
  .to(overlayTitle, { y: '0%', opacity: 1, duration: .45, ease: 'expo.out' }, 0.05)
  /* 4 — meta info fades in */
  .to([overlayLabel, overlayCtr], { opacity: 1, duration: .3 }, 0.15)
  /* 5 — hold */
  .to({}, { duration: .35 })
  /* 6 — everything fades out cleanly */
  .to(overlayTitle, { y: '-30%', opacity: 0, duration: .4, ease: 'expo.in' })
  .to([overlayLabel, overlayCtr, overlayLine, overlay],
      { opacity: 0, duration: .35, ease: 'power2.in' }, '-=.3');
}

export function initTransitions() {
  if (typeof ScrollTrigger === 'undefined') return;

  Object.keys(sectionMeta).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      onEnter: () => playTitleTransition(sectionMeta[id]),
      once: true,
    });
  });
}