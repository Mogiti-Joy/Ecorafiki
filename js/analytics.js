// Google Analytics 4 with a consent banner.
// Paste your Measurement ID below (Google Analytics > Admin > Data streams). Until then nothing loads and no banner shows.
const GA_ID = 'G-XXXXXXXXXX';

const ready = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX';
const KEY = 'er-consent';
const getChoice = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const setChoice = v => { try { localStorage.setItem(KEY, v); } catch {} };

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
window.gtag = gtag;

// Nothing is stored until the visitor says yes
gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });

let loaded = false;
const load = () => {
  if (loaded || !ready) return;
  loaded = true;
  gtag('consent', 'update', { analytics_storage: 'granted' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
};

// Consent banner
const banner = () => {
  if (document.querySelector('.consent')) return;
  const b = document.createElement('div');
  b.className = 'consent';
  b.setAttribute('role', 'dialog');
  b.setAttribute('aria-label', 'Cookie consent');
  b.innerHTML = `<p>We use cookies to understand how people use our site so we can improve it. <a href="privacy">Privacy policy</a></p>
    <div class="consent-btns"><button type="button" class="consent-no">Decline</button><button type="button" class="consent-yes">Accept</button></div>`;
  document.body.appendChild(b);
  requestAnimationFrame(() => b.classList.add('show'));
  const close = v => { setChoice(v); b.classList.remove('show'); setTimeout(() => b.remove(), 300); if (v === 'yes') load(); };
  b.querySelector('.consent-yes').addEventListener('click', () => close('yes'));
  b.querySelector('.consent-no').addEventListener('click', () => close('no'));
};

if (ready) {
  if (getChoice() === 'yes') load();
  else if (!getChoice()) addEventListener('DOMContentLoaded', banner);
}

// "Cookie settings" link in the footer reopens the banner
document.addEventListener('click', e => {
  if (e.target.closest('[data-consent-open]')) { e.preventDefault(); if (ready) banner(); }
});

// Key actions, sent as events once analytics is running
const track = (name, params) => { if (loaded) gtag('event', name, params); };
document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  const label = a.textContent.trim().slice(0, 60);
  if (href.startsWith('donate')) track('donate_click', { link_text: label, page: location.pathname });
  else if (href.startsWith('mailto:')) track('contact', { method: 'email', link_text: label });
  else if (href.startsWith('tel:')) track('contact', { method: 'phone', link_text: label });
  else if (href.includes('wa.me')) track('contact', { method: 'whatsapp', link_text: label });
  if (a.classList.contains('wd-btn')) track('view_details', { step: a.closest('.wd-step')?.querySelector('h3')?.textContent || label });
  if (/\.pdf($|\?)/i.test(href)) track('file_download', { file_name: href.split('/').pop() });
  if (a.closest('.socials, .social-big')) track('social_click', { network: a.getAttribute('aria-label') || label });
});
