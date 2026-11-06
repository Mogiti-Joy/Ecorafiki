# EcoRafiky Africa website

Static website, no build step needed. Open `index.html` in a browser to view it, or upload the whole folder to any web host (Netlify, GitHub Pages, cPanel, etc.).

## Pages
| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About us, mission/vision, the challenge, team |
| `our-work.html` | Four areas of work, 4-step restoration, business model, Kenya's ASALs |
| `nutripop.html` (menu: Food Innovation) | NutriPop porridge for ECD school children, pricing, FAQ |
| `impact.html` | Pilot results, 2026 targets, roadmap, expected outcomes |
| `gallery.html` | Photos and videos (with filters) and social media links |
| `get-involved.html` | Ways to partner, fund, buy or collaborate |
| `donate.html` | Ways to give (M-Pesa, bank, monthly, grants), where gifts go, contact details |
| `work-identify.html`, `work-restore.html`, `work-connect.html` | Detail pages for the first three steps on Our Work |
| `privacy.html` | Privacy policy (analytics, cookies, Kenya Data Protection Act rights) |
| `404.html` | Page shown when a link is broken |
| `contact.html`, `get-involved.html` | Old addresses that forward to `donate.html` |
| `newsroom.html` | News and updates (under the Impact menu) |
| `booklets.html` | Downloadable deck, concept note and booklets (under the Impact menu) |

`docs/` holds the PDFs linked from the Booklets page. Anything in this folder becomes public once the site is online.

## Shared files
- `css/style.css`: all styling. Brand colours are at the top under `:root`:
  - `--forest: #2B4B31` (main dark forest green)
  - `--orange: #C8541A` (burnt orange)
  - `--lime: #8DB84A` (light lime green)
  - `--gold: #E8A020` (golden yellow, small touches)
- `js/main.js`: mobile menu, scroll animations, contact form, FAQ.
- `images/`: put your photos here.

## Adding photos and videos
Every photo spot is an empty box like this, with a label describing what should go there:

```html
<div class="ph"><span><svg><use href="#i-photo"/></svg>Photo: sorghum harvest</span></div>
```

To use a real photo, replace the `<span>…</span>` inside the box with an image, and keep the box:

```html
<div class="ph" style="padding:0;border:0"><img src="images/sorghum-harvest.jpg" alt="Women farmers harvesting sorghum" style="width:100%;height:100%;object-fit:cover"></div>
```

For a YouTube video, replace the inner `<span>` with an `<iframe>` embed in the same way.

## Header and footer
The header, menu and footer are repeated in every page. If you change one (e.g. add a menu item), make the same change in all eight `.html` files.

## Contact form
The form has no server. When someone clicks send, it opens their email app with the message addressed to ecorafikiafrica@gmail.com. To receive messages directly instead, connect it to a free service such as Formspree.

## Hosting and heavy traffic
The site is static, so it holds up to large crowds (1,000+ people at once) as long as it sits on a host with a CDN. **Cloudflare Pages** is recommended: free, no bandwidth cap, and servers in Nairobi and Mombasa. Netlify also works, but its free plan caps bandwidth at 100 GB a month. Avoid plain shared/cPanel hosting for launches or campaigns: the showreel streams at about 6 Mbps per visitor, which saturates a single server quickly.

The bandwidth is mostly the home page showreel (about 11 MB desktop, 7 MB phone). 1,000 visitors ≈ 7–11 GB.

Caching is set up in `_headers` (Cloudflare Pages, Netlify) and `.htaccess` (Apache/cPanel). CSS, JS and videos are cached for a year, so **whenever you change one, bump its `?v=` number** in every page that links it (e.g. `css/style.css?v=78` → `?v=79`), or visitors keep the old copy.

## Analytics (Google Analytics 4)
Open `js/analytics.js` and replace `G-XXXXXXXXXX` with your Measurement ID (Google Analytics > Admin > Data streams > your web stream). Then bump `js/analytics.js?v=1` to `?v=2` in every page.
Until then nothing is tracked and no cookie banner appears. Once the ID is in:
- Visitors see a cookie banner and analytics only starts if they press **Accept** (Google Consent Mode).
- "Cookie settings" in the footer reopens the banner.
- These actions are recorded as events: `donate_click`, `contact` (email / phone / WhatsApp), `view_details`, `file_download`, `social_click`.

## Web address (domain)
When the domain is ready, run this once from the website folder:

```
python3 tools/set-domain.py https://www.your-domain.org
```

It adds canonical links and full share-image URLs to every page, sets the organisation URL for Google, writes `sitemap.xml` and adds it to `robots.txt`. Then submit `https://www.your-domain.org/sitemap.xml` in Google Search Console.

## Built in
- Favicon, app icons and `site.webmanifest` (icon made from the logo figure)
- Link previews for WhatsApp, Facebook, LinkedIn and X (`images/share.jpg`)
- Organisation details for Google search (JSON-LD on the home page)
- `robots.txt`, `404.html`, privacy policy, skip-to-content link for keyboard users
- Photos compressed and lazy-loaded for mobile data
