const fs = require('fs');
const path = require('path');

const mappings = {
  'simulador-de-business-case.html': '/finanzas/simulador-business-case',
  'extractor-de-data-mini.html': '/finanzas/extractor-data',
  'ads-to-crm-sync.html': '/marketing/agentes/ads-crm',
  'prompt-inspector.html': '/marketing/agentes/prompt-inspector',
  'guiones-de-venta.html': '/marketing/agentes/guiones-venta',
  'pre-aprobador-hip.html': '/inmobiliario/pre-aprobador',
  'corredor-virtual-3d.html': '/inmobiliario/corredor-3d',
  'soporte-multi-intenci-n.html': '/soporte/multi-intencion',
  'dashboard-predictivo.html': '/soporte/dashboard',
  'test-de-madurez-tecnol-gica.html': '/soporte/madurez',
  'scanner-de-stack.html': '/soporte/scanner',
  'licitador-ia.html': '/govtech/licitador',
  'starty-automatizador.html': '/startups/starty',
  'agendador-cl-nicas-vets.html': '/saas-masivo/agendador'
};

const publicDir = 'C:\\Users\\josed\\Proyectos\\nodepath';

// Update index.html
const indexPath = path.join(publicDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  let updated = false;
  
  for (const [file, appLink] of Object.entries(mappings)) {
    // Regex to match data-app-link="/" href="agentes/filename.html"
    // We'll just replace the data-app-link="/" near the href
    // Actually, safer to match the whole a tag
    const regex = new RegExp(`(<a[^>]*class="mega-item"[^>]*data-app-link=)"/"([^>]*href="agentes/${file.replace('.', '\\.')}")`, 'g');
    const regex2 = new RegExp(`(<a[^>]*href="agentes/${file.replace('.', '\\.')}")`, 'g'); // if data-app-link doesn't exist
    
    if (content.match(regex)) {
      content = content.replace(regex, `$1"${appLink}"$2`);
      updated = true;
    } else if (content.match(regex2) && !content.includes(`data-app-link="${appLink}"`)) {
       // if it has no data-app-link, maybe just add it
       content = content.replace(regex2, `$1 data-app-link="${appLink}"`);
       updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Updated index.html');
  }
}

// Update files in agentes/
const agentesDir = path.join(publicDir, 'agentes');
if (fs.existsSync(agentesDir)) {
  for (const [file, appLink] of Object.entries(mappings)) {
    const filePath = path.join(agentesDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      // replace data-app-link="/" with the specific link
      const newContent = content.replace(/data-app-link="\/"/g, `data-app-link="${appLink}"`);
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated data-app-link in ${file}`);
      }
    }
  }
}
