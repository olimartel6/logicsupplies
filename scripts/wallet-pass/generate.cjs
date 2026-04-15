const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Config
const PASS_TYPE_ID = 'pass.pass.com.logicsupplies.loyalty';
const TEAM_ID = 'D8SXYV7QXP';
const CERT_PATH = '/tmp/pass-cert.pem';
const KEY_PATH = '/tmp/pass-key.pem';
const WWDR_PATH = '/tmp/wwdr.pem';

function generatePass({ clientId, clientName, businessName, points, tier, color }) {
  const serial = `loyalty-${clientId}-${Date.now()}`;
  const outputDir = `/tmp/pass-${serial}`;
  const outputFile = `/tmp/${serial}.pkpass`;

  fs.mkdirSync(outputDir, { recursive: true });

  // RGB from hex
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: PASS_TYPE_ID,
    teamIdentifier: TEAM_ID,
    organizationName: businessName,
    description: `Carte fidélité ${businessName}`,
    serialNumber: serial,
    backgroundColor: hexToRgb(color || '#a97f61'),
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(255, 255, 255)',
    storeCard: {
      headerFields: [
        { key: 'points', label: 'POINTS', value: points || 0 }
      ],
      primaryFields: [
        { key: 'name', label: 'MEMBRE', value: clientName || 'Client' }
      ],
      secondaryFields: [
        { key: 'tier', label: 'NIVEAU', value: tier || 'Bronze' },
        { key: 'business', label: 'COMMERCE', value: businessName }
      ],
      backFields: [
        { key: 'info', label: 'Programme fidélité', value: 'Accumulez des points à chaque visite et échangez-les contre des récompenses!' }
      ]
    },
    barcode: {
      format: 'PKBarcodeFormatQR',
      message: clientId,
      messageEncoding: 'iso-8859-1',
    },
    barcodes: [
      { format: 'PKBarcodeFormatQR', message: clientId, messageEncoding: 'iso-8859-1' }
    ],
  };

  // Write pass.json
  fs.writeFileSync(path.join(outputDir, 'pass.json'), JSON.stringify(passJson));

  // Create simple icon (1x1 white pixel as placeholder — real icon should be the business logo)
  const pngHeader = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(path.join(outputDir, 'icon.png'), pngHeader);
  fs.writeFileSync(path.join(outputDir, 'icon@2x.png'), pngHeader);
  fs.writeFileSync(path.join(outputDir, 'logo.png'), pngHeader);
  fs.writeFileSync(path.join(outputDir, 'logo@2x.png'), pngHeader);

  // Create manifest.json (SHA1 of each file)
  const manifest = {};
  const files = ['pass.json', 'icon.png', 'icon@2x.png', 'logo.png', 'logo@2x.png'];
  for (const f of files) {
    const content = fs.readFileSync(path.join(outputDir, f));
    manifest[f] = crypto.createHash('sha1').update(content).digest('hex');
  }
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest));

  // Sign manifest with openssl
  try {
    execSync(`openssl smime -binary -sign -certfile ${WWDR_PATH} -signer ${CERT_PATH} -inkey ${KEY_PATH} -in ${path.join(outputDir, 'manifest.json')} -out ${path.join(outputDir, 'signature')} -outform DER -passin pass:""`, { stdio: 'pipe' });
  } catch (e) {
    console.error('Signing error:', e.stderr?.toString());
    throw e;
  }

  // Create .pkpass (zip)
  const allFiles = [...files, 'manifest.json', 'signature'];
  execSync(`cd ${outputDir} && zip -q ${outputFile} ${allFiles.join(' ')}`, { stdio: 'pipe' });

  // Cleanup
  fs.rmSync(outputDir, { recursive: true });

  console.log(`Pass generated: ${outputFile}`);
  return outputFile;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const clientId = args[0] || 'demo-client';
  const clientName = args[1] || 'Oli Martel';
  const businessName = args[2] || 'La Maison Smith';
  const points = parseInt(args[3] || '0');
  const tier = args[4] || 'Bronze';
  const color = args[5] || '#a97f61';

  const file = generatePass({ clientId, clientName, businessName, points, tier, color });
  console.log('Done:', file);
}

module.exports = { generatePass };
