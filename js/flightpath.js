/* ═══════════════════════════════════════════════════════════════════
   FLIGHT PATH — Curved route from under the section title through every
   timeline dot. A paper plane eases along it as you scroll, cards fade in
   one by one as it approaches, and each dot lights up when it arrives.
═══════════════════════════════════════════════════════════════════ */
const READ_LINE = 0.62;  /* the plane chases this viewport line */
const REVEAL_AT = 0.88;  /* a card fades in when its top reaches this viewport line */
const SAMPLES   = 800;
const START     = { x: 14, y: -34 }; /* just under "so far." */
const GAP       = 12;                /* min distance between route and card text */

export function initFlightPath() {
  const tl       = document.querySelector('.timeline');
  const base     = tl?.querySelector('.timeline-path-base');
  const progress = tl?.querySelector('.timeline-path-progress');
  const plane    = tl?.querySelector('.timeline-plane');
  if (!tl || !base || !progress || !plane) return;

  const items  = [...tl.querySelectorAll('.timeline-item')];
  const calm   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE   = calm ? 1 : 0.1;
  let samples = [], dotLens = [], knots = [], length = 0, cur = 0, target = 0;

  function lenForLine(y) {
    if (y <= knots[0].y) return 0;
    for (let k = 1; k < knots.length; k++) {
      const a = knots[k - 1], b = knots[k];
      if (y <= b.y) return a.len + (b.len - a.len) * (y - a.y) / (b.y - a.y);
    }
    return knots[knots.length - 1].len;
  }

  /* Length along the route where it reaches height y (y only grows along it) */
  function lenAtY(y) {
    let lo = 0, hi = samples.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (samples[mid].y < y) lo = mid + 1; else hi = mid;
    }
    return samples[lo].len;
  }

  /* Layout positions (offset*), so the cards' reveal transforms don't skew the route */
  function build() {
    const pts = items.map(item => {
      const dot = item.querySelector('.timeline-dot');
      return {
        x: item.offsetLeft + dot.offsetLeft + dot.offsetWidth / 2,
        y: item.offsetTop + dot.offsetTop + dot.offsetHeight / 2,
      };
    });
    if (!pts.length) return;

    /* Take-off: from under the title down to the first dot */
    const p0 = pts[0], h0 = (p0.y - START.y) / 2;
    let d = `M ${START.x} ${START.y} C ${START.x} ${START.y + h0} ${p0.x} ${p0.y - h0} ${p0.x} ${p0.y}`;

    /* Each leg leaves a dot vertically and crosses to the other side without
       ever running over a card's text */
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], cardA = items[i - 1], cardB = items[i];
      const endA = cardA.offsetTop + cardA.offsetHeight - parseFloat(getComputedStyle(cardA).paddingBottom);
      const topB = cardB.offsetTop;
      const dir  = Math.sign(b.x - a.x);
      /* How far towards b the route may go beside card A, and from where it may run beside card B */
      const reachA = dir > 0 ? cardA.offsetLeft - GAP : cardA.offsetLeft + cardA.offsetWidth + GAP;
      const fromB  = dir > 0 ? cardB.offsetLeft + cardB.offsetWidth + GAP : cardB.offsetLeft - GAP;

      if ((reachA - fromB) * dir >= 0) {
        /* Wide screens: a free middle lane → one S-curve through the gap's centre */
        const m  = { x: (a.x + b.x) / 2, y: (endA + topB) / 2 };
        const tx = (b.x - a.x) * .15, ty = (b.y - a.y) * .15;
        d += ` C ${a.x} ${a.y + (m.y - a.y) / 2} ${m.x - tx} ${m.y - ty} ${m.x} ${m.y}`;
        d += ` C ${m.x + tx} ${m.y + ty} ${b.x} ${b.y - (b.y - m.y) / 2} ${b.x} ${b.y}`;
      } else {
        /* Narrow screens: run down the side strip, cross inside the gap, run down the other strip */
        const q1 = { x: reachA, y: endA + GAP }, q2 = { x: fromB, y: topB - GAP };
        const t  = { x: (q2.x - q1.x) * .3, y: (q2.y - q1.y) * .3 };
        d += ` C ${a.x} ${a.y + (q1.y - a.y) / 2} ${q1.x - t.x / 2} ${q1.y - t.y / 2} ${q1.x} ${q1.y}`;
        d += ` C ${q1.x + t.x} ${q1.y + t.y} ${q2.x - t.x} ${q2.y - t.y} ${q2.x} ${q2.y}`;
        d += ` C ${q2.x + t.x / 2} ${q2.y + t.y / 2} ${b.x} ${b.y - (b.y - q2.y) / 2} ${b.x} ${b.y}`;
      }
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
    dotLens = pts.map(p => lenAtY(p.y));
    /* Knots: the plane is at the start / each dot exactly when that height hits the
       reading line, and moves at constant speed along the route in between */
    knots = [{ y: START.y, len: 0 }, ...pts.map((p, k) => ({ y: p.y, len: dotLens[k] }))];
    cur = target = lenForLine(window.innerHeight * READ_LINE - tl.getBoundingClientRect().top);
    render(performance.now());
  }

  function render(now) {
    const f = Math.min(cur / length, 1) * SAMPLES;
    const i = Math.min(Math.floor(f), SAMPLES - 1), t = f - i;
    const a = samples[i], b = samples[i + 1];
    const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;

    const p = samples[Math.max(i - 3, 0)], n = samples[Math.min(i + 4, SAMPLES)];
    const ang = Math.atan2(n.y - p.y, n.x - p.x);
    /* Gentle bob perpendicular to the route so it feels like it's flying */
    const bob = calm ? 0 : Math.sin(now / 420) * 2.5;
    const bx = x - Math.sin(ang) * bob, by = y + Math.cos(ang) * bob;

    /* The icon points up-right (-45°), so offset by 45° to align with the route */
    plane.style.transform = `translate(${bx}px, ${by}px) rotate(${ang * 180 / Math.PI + 45}deg)`;
    progress.style.strokeDashoffset = length - cur;
    items.forEach((item, k) => item.classList.toggle('is-active', cur >= dotLens[k] - 1));
  }

  function tick() {
    if (!length) return;
    const top = tl.getBoundingClientRect().top;
    const vh  = window.innerHeight;
    const onScreen = top < vh * 1.2 && top + tl.offsetHeight > -vh * .2;
    if (!onScreen && Math.abs(target - cur) < .5) return;

    target = lenForLine(vh * READ_LINE - top);
    cur += (target - cur) * EASE;
    if (Math.abs(target - cur) < .05) cur = target;
    render(performance.now());

    const revealLine = vh * REVEAL_AT - top;
    items.forEach(item => item.classList.toggle('is-visible', revealLine >= item.offsetTop));
  }

  tl.classList.add('is-ready');
  build();
  tick();

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.addEventListener('refresh', build); /* resize, fonts, layout changes */
  } else {
    window.addEventListener('resize', build);
  }
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add(tick);
  } else {
    (function loop() { tick(); requestAnimationFrame(loop); })();
  }
}
