import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const docsDir = path.resolve('docs');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(distDir)) {
  // 1. Ensure .nojekyll exists in dist for GitHub Pages
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');

  // 2. Ensure 404.html is a copy of index.html for GitHub Pages routing
  const indexHtml = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));
  }

  // 3. Mirror complete production build into docs/ folder
  // GitHub Pages natively allows choosing "/docs" as the publishing source in branch settings!
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  copyDirRecursive(distDir, docsDir);

  console.log('GitHub Pages readiness:');
  console.log(' - dist/.nojekyll and dist/404.html generated');
  console.log(' - docs/ folder generated with full build (for GitHub Pages /docs folder setting)');
}
