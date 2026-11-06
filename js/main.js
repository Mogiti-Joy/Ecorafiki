// Mobile menu
const burger = document.getElementById('burger'), menu = document.getElementById('menu');
const setMenu = open => {
  menu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });
addEventListener('resize', () => { if (innerWidth > 1000) setMenu(false); });

// Quick contact links at the foot of the phone menu
menu.insertAdjacentHTML('beforeend', `<div class="menu-extra">
  <div class="quick">
    <a href="https://wa.me/254719614800" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>WhatsApp</a>
    <a href="tel:+254719614800"><svg><use href="#i-phone"/></svg>Call us</a>
  </div>
  ${document.querySelector('footer .socials')?.outerHTML || ''}
</div>`);

// Highlight the current page in the menu
const page = location.pathname.split('/').pop().replace(/\.html$/, '') || '/';
menu.querySelectorAll('a:not(.btn)').forEach(a => {
  if (a.getAttribute('href') === page) a.classList.add('active');
});
if (['newsroom', 'booklets'].includes(page)) menu.querySelector('.dd-top').classList.add('active');
if (page.startsWith('work-')) menu.querySelector('a[href="our-work"]').classList.add('active');

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Hero headline types itself out on page load, keeping its coloured words
const typeEl = document.querySelector('[data-type]');
if (typeEl && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const html = typeEl.innerHTML;
  typeEl.setAttribute('aria-label', typeEl.textContent.trim());
  typeEl.innerHTML = `<span class="typed" aria-hidden="true">${html}</span><span class="ghost" aria-hidden="true">${html}</span>`;
  const walker = document.createTreeWalker(typeEl.querySelector('.typed'), NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push({ node: walker.currentNode, text: walker.currentNode.data });
  nodes.forEach(n => n.node.data = '');
  let n = 0, i = 0;
  const tick = () => {
    while (n < nodes.length && i >= nodes[n].text.length) { n++; i = 0; }
    if (n === nodes.length) return typeEl.classList.add('done');
    const ch = nodes[n].text[i++];
    nodes[n].node.data += ch;
    setTimeout(tick, ch === '.' ? 350 : 65);
  };
  setTimeout(tick, 500);
}

// Contact form: sends the message to our inbox through FormSubmit, falling back to the visitor's email app
const form = document.getElementById('contactForm');
if (form) {
  const topic = new URLSearchParams(location.search).get('topic');
  if (topic) [...form.topic.options].forEach(o => { if (o.value === topic) o.selected = true; });
  const status = form.querySelector('.form-status'), send = form.querySelector('.form-send');
  const say = (msg, err) => { status.textContent = msg; status.classList.toggle('err', !!err); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const d = Object.fromEntries(new FormData(form));
    send.disabled = true; say('Sending…');
    try {
      const res = await fetch('https://formsubmit.co/ajax/ecorafikiafrica@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: d.name, email: d.email, 'inquiry type': d.topic, subject: d.subject, message: d.message,
          _subject: `${d.topic}: ${d.subject}`, _replyto: d.email, _template: 'table', _captcha: 'false' })
      });
      if (!res.ok) throw new Error(res.status);
      form.reset(); say("Thank you. Your message has been sent and we'll be in touch soon.");
    } catch {
      say('We could not send your message here, so we opened your email app instead.', true);
      const body = `Name: ${d.name}\nEmail: ${d.email}\nInquiry type: ${d.topic}\n\n${d.message}`;
      location.href = `mailto:ecorafikiafrica@gmail.com?subject=${encodeURIComponent(d.topic + ': ' + d.subject)}&body=${encodeURIComponent(body)}`;
    } finally { send.disabled = false; }
  });
}

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => {
  const item = q.parentElement, open = item.classList.toggle('open');
  q.setAttribute('aria-expanded', open);
}));

document.querySelectorAll('.yr').forEach(el => el.textContent = new Date().getFullYear());

// Hold the hero showreel on its poster frame for visitors who prefer reduced motion
const reel = document.querySelector('video.hero-bg');
if (reel && matchMedia('(prefers-reduced-motion: reduce)').matches) { reel.removeAttribute('autoplay'); reel.pause(); }

// About slideshow: photos slide right to left on autoplay, pause on hover, swipe and arrow-key support
document.querySelectorAll('[data-slider]').forEach(slider => {
  const slides = [...slider.querySelectorAll('.slide')];
  const ms = 5500, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer;
  const show = n => {
    const prev = i;
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle('is-leaving', k === prev && k !== i);
      s.classList.toggle('is-active', k === i);
    });
    play();
  };
  const play = () => { clearTimeout(timer); if (!still && !slider.classList.contains('paused')) timer = setTimeout(() => show(i + 1), ms); };
  const pause = on => { slider.classList.toggle('paused', on); on ? clearTimeout(timer) : show(i); };
  slider.addEventListener('mouseenter', () => pause(true));
  slider.addEventListener('mouseleave', () => pause(false));
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  let x0 = null;
  slider.addEventListener('pointerdown', e => { x0 = e.clientX; });
  slider.addEventListener('pointerup', e => {
    if (x0 !== null && Math.abs(e.clientX - x0) > 40) show(i + (e.clientX < x0 ? 1 : -1));
    x0 = null;
  });
  play();
});

// ---------- Phone experience ----------
const phone = matchMedia('(max-width:640px)');
const header = document.querySelector('header.nav');

// Header hides while scrolling down and returns on scroll up; progress line tracks the page
const bar = document.createElement('div');
bar.className = 'progress';
header.appendChild(bar);
let lastY = scrollY, ticking = false;
const onScroll = () => {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  header.classList.toggle('scrolled', y > 10);
  if (!menu.classList.contains('open')) header.classList.toggle('hide', y > lastY && y > 160);
  lastY = y; ticking = false;
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

// Card rows become swipeable carousels with dots on phones
document.querySelectorAll('.pillars, .ways, .booklets').forEach(row => {
  const dots = document.createElement('div');
  dots.className = 'dots';
  const items = [...row.children];
  items.forEach((item, k) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Show item ${k + 1} of ${items.length}`);
    b.addEventListener('click', () => row.scrollTo({ left: item.offsetLeft - row.offsetLeft - 16, behavior: 'smooth' }));
    dots.appendChild(b);
  });
  row.after(dots);
  const mark = () => {
    const k = Math.round(row.scrollLeft / (items[1] ? items[1].offsetLeft - items[0].offsetLeft : 1));
    [...dots.children].forEach((d, j) => d.classList.toggle('on', j === Math.min(k, items.length - 1)));
  };
  row.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
  const apply = () => {
    row.classList.toggle('swipe', phone.matches);
    dots.style.display = phone.matches ? '' : 'none';
    if (phone.matches) { row.classList.add('in'); mark(); }
  };
  phone.addEventListener('change', apply);
  apply();
});

// Footer link columns fold away on phones
document.querySelectorAll('.fgrid > div').forEach(col => {
  const h = col.querySelector('h4');
  if (!h) return;
  col.classList.add('fold');
  h.setAttribute('role', 'button');
  h.tabIndex = 0;
  const toggle = () => { if (phone.matches) h.setAttribute('aria-expanded', col.classList.toggle('open')); };
  h.addEventListener('click', toggle);
  h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

// Photo lightbox: tap a photo to view it full screen, swipe or use arrow keys to move through the set
const photos = [...document.querySelectorAll('.gallery img, .np-photos img, .detail-media img')];
if (photos.length) {
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML = `<div class="lb-top"><span class="lb-count"></span><button class="lb-close" aria-label="Close">×</button></div>
    <div class="lb-stage"><img alt=""></div><p class="lb-cap"></p>
    <button class="lb-nav lb-prev" aria-label="Previous photo">‹</button><button class="lb-nav lb-next" aria-label="Next photo">›</button>`;
  document.body.appendChild(lb);
  const img = lb.querySelector('.lb-stage img'), cap = lb.querySelector('.lb-cap'), count = lb.querySelector('.lb-count');
  let at = 0, opener = null;
  const show = n => {
    at = (n + photos.length) % photos.length;
    img.src = photos[at].currentSrc || photos[at].src;
    img.alt = cap.textContent = photos[at].alt;
    count.textContent = `${at + 1} / ${photos.length}`;
  };
  const open = n => { opener = document.activeElement; show(n); lb.classList.add('open'); document.body.classList.add('menu-open'); lb.querySelector('.lb-close').focus(); };
  const close = () => { lb.classList.remove('open'); document.body.classList.remove('menu-open'); opener?.focus(); };
  photos.forEach((p, k) => {
    p.classList.add('zoomable');
    p.tabIndex = 0;
    p.addEventListener('click', () => open(k));
    p.addEventListener('keydown', e => { if (e.key === 'Enter') open(k); });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(at - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(at + 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });
  let sx = null, sy = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchmove', e => { if (sx !== null) img.style.transform = `translateX(${e.touches[0].clientX - sx}px)`; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    img.style.transform = '';
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(at + (dx < 0 ? 1 : -1));
    else if (dy > 90) close();
    sx = sy = null;
  });
}

// Impact numbers count up from zero when they scroll into view
const counters = document.querySelectorAll('[data-count]');
if (counters.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const countIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  counters.forEach(el => { el.textContent = '0'; countIO.observe(el); });
}

// Copy buttons, e.g. the bank account number on the donate page
document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
  navigator.clipboard?.writeText(b.dataset.copy).then(() => {
    b.textContent = 'Copied';
    setTimeout(() => { b.textContent = 'Copy'; }, 2000);
  });
}));
