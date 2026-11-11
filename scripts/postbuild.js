import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

if (fs.existsSync(distDir)) {
  // Ensure .nojekyll exists in dist for GitHub Pages
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');

  // Ensure 404.html is a copy of index.html for GitHub Pages routing
  const indexHtml = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));
  }
  console.log('GitHub Pages readiness: .nojekyll and 404.html created in dist/');
}
