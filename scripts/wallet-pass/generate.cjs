const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PASS_TYPE_ID = 'pass.pass.com.logicsupplies.loyalty';
const TEAM_ID = 'D8SXYV7QXP';
const CERT_PATH = '/tmp/pass-cert.pem';
const KEY_PATH = '/tmp/pass-key.pem';
const WWDR_PATH = '/tmp/wwdr.pem';

const LOGO_MAP = {
  'smith-cafe': '/Users/oli/institutepilation-points/public/logos/smith-cafe.png',
  'la-peltrie': '/Users/oli/institutepilation-points/public/logos/la-peltrie.png',
  'institut-epilation': '/Users/oli/institutepilation-points/public/logo-dark.png',
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function resizeImage(src, dest, w, h) {
  try {
    execSync(`sips -z ${h} ${w} "${src}" --out "${dest}" 2>/dev/null`, { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function generatePass({ clientId, clientName, businessName, points, tier, color, slug }) {
  const serial = `loyalty-${clientId}-${Date.now()}`;
  const outputDir = `/tmp/pass-${serial}`;
  const outputFile = `/tmp/${serial}.pkpass`;
  fs.mkdirSync(outputDir, { recursive: true });

  const tierEmoji = tier === 'Platine' ? '💎' : tier === 'Or' ? '🥇' : tier === 'Argent' ? '🥈' : '🥉';

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: PASS_TYPE_ID,
    teamIdentifier: TEAM_ID,
    organizationName: businessName,
    description: `Carte fidélité ${businessName}`,
    serialNumber: serial,
    backgroundColor: hexToRgb(color || '#1a1a2e'),
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(200, 200, 200)',
    logoText: businessName,
    storeCard: {
      headerFields: [
        { key: 'points', label: 'POINTS', value: points || 0, textAlignment: 'PKTextAlignmentRight' }
      ],
      primaryFields: [
        { key: 'name', label: 'MEMBRE', value: clientName || 'Client' }
      ],
      secondaryFields: [
        { key: 'tier', label: 'NIVEAU', value: `${tierEmoji} ${tier || 'Bronze'}` },
        { key: 'status', label: 'STATUT', value: 'Actif', textAlignment: 'PKTextAlignmentRight' }
      ],
      auxiliaryFields: [
        { key: 'business', label: 'COMMERCE', value: businessName }
      ],
      backFields: [
        { key: 'program', label: 'Programme de fidélité', value: `Accumulez des points à chaque visite chez ${businessName} et échangez-les contre des récompenses exclusives!\n\n🥉 Bronze: x1 points\n🥈 Argent (500+ pts): x1.5 points\n🥇 Or (2000+ pts): x2 points\n💎 Platine (5000+ pts): x3 points` },
        { key: 'contact', label: 'Contact', value: 'Propulsé par LogicSupplies\ninfo@logicsupplies.com' }
      ]
    },
    barcode: { format: 'PKBarcodeFormatQR', message: clientId, messageEncoding: 'iso-8859-1', altText: `ID: ${clientId.substring(0, 8)}` },
    barcodes: [{ format: 'PKBarcodeFormatQR', message: clientId, messageEncoding: 'iso-8859-1', altText: `ID: ${clientId.substring(0, 8)}` }],
  };

  fs.writeFileSync(path.join(outputDir, 'pass.json'), JSON.stringify(passJson));

  // Business logo as icon/logo
  const logoSrc = LOGO_MAP[slug] || LOGO_MAP['institut-epilation'];
  if (logoSrc && fs.existsSync(logoSrc)) {
    resizeImage(logoSrc, path.join(outputDir, 'icon.png'), 29, 29);
    resizeImage(logoSrc, path.join(outputDir, 'icon@2x.png'), 58, 58);
    resizeImage(logoSrc, path.join(outputDir, 'logo.png'), 160, 50);
    resizeImage(logoSrc, path.join(outputDir, 'logo@2x.png'), 320, 100);
  } else {
    const px = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    for (const f of ['icon.png','icon@2x.png','logo.png','logo@2x.png']) fs.writeFileSync(path.join(outputDir, f), px);
  }

  // Manifest
  const manifest = {};
  const files = fs.readdirSync(outputDir);
  for (const f of files) {
    manifest[f] = crypto.createHash('sha1').update(fs.readFileSync(path.join(outputDir, f))).digest('hex');
  }
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest));

  // Sign
  execSync(`openssl smime -binary -sign -certfile ${WWDR_PATH} -signer ${CERT_PATH} -inkey ${KEY_PATH} -in ${path.join(outputDir, 'manifest.json')} -out ${path.join(outputDir, 'signature')} -outform DER -passin pass:""`, { stdio: 'pipe' });

  // Zip
  const allFiles = [...files, 'manifest.json', 'signature'];
  execSync(`cd ${outputDir} && zip -q ${outputFile} ${allFiles.join(' ')}`, { stdio: 'pipe' });
  fs.rmSync(outputDir, { recursive: true });
  console.log(`Pass generated: ${outputFile}`);
  return outputFile;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const file = generatePass({
    clientId: args[0] || 'demo-client',
    clientName: args[1] || 'Oli Martel',
    businessName: args[2] || 'La Maison Smith',
    points: parseInt(args[3] || '0'),
    tier: args[4] || 'Bronze',
    color: args[5] || '#a97f61',
    slug: args[6] || 'smith-cafe',
  });
  console.log('Done:', file);
}

module.exports = { generatePass };
