const fs = require('fs');
const path = require('path');

const config = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://yqzqorlqjwfbppntaefh.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxenFvcmxxandmYnBwbnRhZWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMzQxOTUsImV4cCI6MjA5OTgxMDE5NX0.2bZiLhuuL0yCcgBkTCT1mwFU0IIqTXtmRQikeuLVLww',
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || ''
};

const outputPath = path.join(__dirname, '../assets/js/config.js');
const content = `// Auto-generado en build time - NO EDITAR MANUALMENTE
window.REDMIA_CONFIG = ${JSON.stringify(config, null, 2)};`;

fs.writeFileSync(outputPath, content);
console.log('✅ Config inyectada en assets/js/config.js');