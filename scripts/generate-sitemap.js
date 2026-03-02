const fs = require('fs');
const path = require('path');

// Mock da estrutura de dados (simplificado do competency.model.ts)
const competencies = [
    'cs-fundamentals', 'algorithms', 'logic', 'binary',
    'networking', 'tcp-ip', 'http-rest', 'api-tools',
    'databases', 'sql-relational', 'postgres', 'other-sql', 'nosql',
    'devops-infra', 'linux-basics', 'docker', 'version-control', 'observability', 'grafana', 'opentelemetry',
    'backend-hub', 'java-ecosystem', 'spring-boot', 'spring-data', 'spring-security', 'kotlin', 'build-tools', 'other-languages', 'backend-patterns',
    'frontend-basics', 'web-fundamentals', 'react-next', 'typescript',
    'cloud-hosting', 'aws-cloud', 'k8s', 'hosting-automation',
    'professional-env', 'intellij', 'agile-management'
];

const baseUrl = 'https://job-ready-developer.pages.dev'; // Atualize se necessário

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/sobre</loc>
    <priority>0.8</priority>
  </url>
  ${competencies.map(id => `
  <url>
    <loc>${baseUrl}/mapa/${id}</loc>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>
`;

const outputPath = path.join(__dirname, '../src/sitemap.xml');
fs.writeFileSync(outputPath, sitemap);
console.log('Sitemap gerado em src/sitemap.xml');
