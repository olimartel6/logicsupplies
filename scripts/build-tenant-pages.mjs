// Generate per-tenant HTML pages with correct OG meta tags + current build asset hashes
// Reads src/config.js, writes dist/t/<slug>/index.html for each tenant
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = join(ROOT, 'src/config.js');
const DIST = join(ROOT, 'dist');
const SITE_URL = 'https://demo.logiccsupplies.ca';

// Find current build assets
const assets = readdirSync(join(DIST, 'assets'));
const jsAsset = assets.find((f) => /^index-.+\.js$/.test(f));
const cssAsset = assets.find((f) => /^index-.+\.css$/.test(f));
if (!jsAsset || !cssAsset) {
  console.error('Missing JS or CSS asset in dist/assets');
  process.exit(1);
}

// Parse config.js for tenant entries
const src = readFileSync(CONFIG_PATH, 'utf-8');

// Match each tenant block by slug key, extract relevant fields
const tenantRegex = /'([a-z0-9-]+)':\s*\{([\s\S]*?)\n\s\s\},/g;
const tenants = [];
let m;
while ((m = tenantRegex.exec(src)) !== null) {
  const slug = m[1];
  const body = m[2];
  const get = (key) => {
    const r = new RegExp(`${key}:\\s*["']([^"']*?)["']`);
    const mm = body.match(r);
    return mm ? mm[1] : '';
  };
  const getPath = (key) => {
    // matches: heroImage: import.meta.env.BASE_URL + 'images/foo/bar.jpg'
    // OR: heroImage: 'https://...'
    const r1 = new RegExp(`${key}:\\s*import\\.meta\\.env\\.BASE_URL\\s*\\+\\s*['"]([^'"]+)['"]`);
    const r2 = new RegExp(`${key}:\\s*['"](https?://[^'"]+)['"]`);
    const r3 = new RegExp(`${key}:\\s*['"](\\./[^'"]+)['"]`);
    const m1 = body.match(r1);
    if (m1) return SITE_URL + '/' + m1[1];
    const m2 = body.match(r2);
    if (m2) return m2[1];
    const m3 = body.match(r3);
    if (m3) return SITE_URL + '/' + m3[1].replace(/^\.\//, '');
    return '';
  };
  tenants.push({
    slug,
    businessName: get('businessName') || slug,
    tagline: get('tagline') || 'Programme de fidélité',
    favicon: get('favicon') || '⭐',
    heroImage: getPath('heroImage'),
  });
}

console.log(`Found ${tenants.length} tenants`);
console.log(`Using JS=${jsAsset}  CSS=${cssAsset}`);

const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const stripQuotes = (s) => (s || '').replace(/^['"]|['"]$/g, '');

const template = (t) => `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <base href="/" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <title>${escape(t.businessName)} — Programme Fidélité</title>
  <meta name="description" content="${escape(t.tagline)}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}/t/${t.slug}/" />
  <meta property="og:title" content="${escape(t.businessName)} — Programme Fidélité" />
  <meta property="og:description" content="${escape(t.tagline)}" />
  <meta property="og:image" content="${escape(t.heroImage)}" />
  <meta property="og:image:secure_url" content="${escape(t.heroImage)}" />
  <meta property="og:locale" content="fr_CA" />
  <meta property="og:site_name" content="${escape(t.businessName)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escape(t.businessName)} — Programme Fidélité" />
  <meta name="twitter:description" content="${escape(t.tagline)}" />
  <meta name="twitter:image" content="${escape(t.heroImage)}" />

  <link rel="apple-touch-icon" href="${escape(t.heroImage)}" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${t.favicon}</text></svg>" />

  <link rel="manifest" href="/manifest.json" />

  <script>
    (function() {
      var url = new URL(window.location.href);
      if (url.searchParams.get('tenant') !== '${t.slug}') {
        url.searchParams.set('tenant', '${t.slug}');
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    })();
  </script>

  <script type="module" crossorigin src="/assets/${jsAsset}"></script>
  <link rel="stylesheet" crossorigin href="/assets/${cssAsset}">
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;

for (const t of tenants) {
  const dir = join(DIST, 't', t.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), template(t));
}

console.log(`Generated ${tenants.length} per-tenant pages in dist/t/`);
