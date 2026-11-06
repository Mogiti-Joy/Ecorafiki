"""Fill in the website address once the domain is known.

Usage (from the website folder):
    python3 tools/set-domain.py https://www.your-domain.org

It adds canonical links and full share-image URLs to every page, sets the
organisation URL for search engines, writes sitemap.xml and points robots.txt
to it. Safe to run again with a new address.
"""
import datetime
import glob
import json
import os
import re
import sys

if len(sys.argv) != 2 or not re.match(r'^https?://[^/\s]+$', sys.argv[1].rstrip('/')):
    sys.exit('Usage: python3 tools/set-domain.py https://www.your-domain.org')
site = sys.argv[1].rstrip('/')
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

SKIP = {'contact.html', 'get-involved.html', '404.html'}
pages = sorted(f for f in glob.glob('*.html') if f not in SKIP)
today = datetime.date.today().isoformat()
page_url = lambda f: site + '/' if f == 'index.html' else f'{site}/{f[:-5]}'  # clean URLs (vercel.json)

for f in pages:
    h = open(f).read()
    url = page_url(f)
    h = re.sub(r'\n<link rel="canonical" href="[^"]*">', '', h)
    h = re.sub(r'\n<meta property="og:url" content="[^"]*">', '', h)
    h = re.sub(r'(<meta property="og:type" content="website">)',
               rf'<link rel="canonical" href="{url}">\n<meta property="og:url" content="{url}">\n\1', h, count=1)
    h = re.sub(r'content="(?:https?://[^"]*/)?images/share\.jpg"', f'content="{site}/images/share.jpg"', h)
    m = re.search(r'<script type="application/ld\+json">\n(.*?)\n</script>', h, re.S)
    if m:
        data = json.loads(m.group(1))
        data['url'] = site + '/'
        data['logo'] = f'{site}/images/logo-ecorafiky-full.png'
        h = h.replace(m.group(1), json.dumps(data, indent=2))
    open(f, 'w').write(h)

priority = {'index.html': '1.0', 'donate.html': '0.9', 'our-work.html': '0.8', 'nutripop.html': '0.8', 'about.html': '0.8'}
rows = ''.join(
    f'  <url><loc>{page_url(f)}</loc><lastmod>{today}</lastmod><priority>{priority.get(f, "0.6")}</priority></url>\n'
    for f in pages)
open('sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rows + '</urlset>\n')

robots = re.sub(r'\nSitemap: .*', '', open('robots.txt').read().rstrip('\n'))
open('robots.txt', 'w').write(robots + f'\nSitemap: {site}/sitemap.xml\n')
print(f'Done: {len(pages)} pages, sitemap.xml and robots.txt now use {site}')
