const fs = require('fs');
const path = require('path');

const config = {
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || ''
};

const outputPath = path.join(__dirname, '../assets/js/config.js');
const content = `// Auto-generado en build time - NO EDITAR MANUALMENTE
window.REDMIA_CONFIG = ${JSON.stringify(config, null, 2)};`;

fs.writeFileSync(outputPath, content);
console.log('✅ Config inyectada en assets/js/config.js');
