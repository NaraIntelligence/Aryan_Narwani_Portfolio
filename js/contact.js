/* ═══════════════════════════════════════════════════════════════════
   CONTACT — Form handler + smooth anchor scroll
═══════════════════════════════════════════════════════════════════ */

/* Publishable key (public by design): RLS only lets it INSERT into portfolio_contacts */
const SUPABASE_URL   = 'https://mmhhsocuxrrwttkiugby.supabase.co';
const SUPABASE_KEY   = 'sb_publishable_bL0VZGgogunMYhDuzRFSBA_l4ohHVYJ';
const SUPABASE_TABLE = 'portfolio_contacts';
const FORMSPREE_ID   = 'meewzbpo';

export function initContact(lenis) {
  /* ─── Form submit ─── */
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"] span');
      btn.textContent = 'Sending...';

      const data = {
        name:    form.querySelector('[name="name"]').value,
        email:   form.querySelector('[name="email"]').value,
        subject: form.querySelector('[name="subject"]').value,
        message: form.querySelector('[name="message"]').value,
      };

      try {
        /* ── 1. Guardar en Supabase (si falla, el email se envía igualmente) ── */
        const saved = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey':       SUPABASE_KEY,
            'Prefer':       'return=minimal',
          },
          body: JSON.stringify(data),
        }).then(r => r.ok).catch(() => false);
        if (!saved) console.warn('Contact form: could not save to Supabase, sending email only');

        /* ── 2. Enviar email via Formspree ── */
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method:  'POST',
          headers: { 'Accept': 'application/json' },
          body:    new FormData(form),
        });

        if (res.ok) {
          btn.textContent = 'Sent ✓';
          form.reset();
          if (status) {
            status.style.display = 'block';
            status.style.color   = '#00ffb3';
            status.textContent   = "Message received. I'll get back to you soon.";
          }
        } else {
          throw new Error('Formspree error');
        }

      } catch (err) {
        btn.textContent = 'Send message →';
        if (status) {
          status.style.display = 'block';
          status.style.color   = '#ff4d4d';
          status.textContent   = 'Something went wrong. Try again or email directly.';
        }
      }
    });
  }

  /* ─── Smooth anchor scroll via Lenis ─── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -20, duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}