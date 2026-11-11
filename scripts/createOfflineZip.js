import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function createZip() {
  const zip = new JSZip();
  const distDir = path.resolve('dist');
  const publicDir = path.resolve('public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Generate the all-in-one standalone HTML file
  const assetsDir = path.join(distDir, 'assets');
  let jsContent = '';
  let cssContent = '';

  if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir);
    const jsFile = assets.find((f) => f.endsWith('.js'));
    const cssFile = assets.find((f) => f.endsWith('.css'));

    if (jsFile) {
      jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
    }
    if (cssFile) {
      cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
    }
  }

  const indexHtmlPath = path.join(distDir, 'index.html');
  let originalHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Inlined standalone HTML (no external file:// CORS fetch blocked by Google Chrome)
  let standaloneHtml = originalHtml;
  // Replace stylesheet link using function callback to prevent $& replacement issues
  standaloneHtml = standaloneHtml.replace(
    /<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*index-[^"']*\.css["'][^>]*>/i,
    () => `<style>\n/* Inlined QuickCard Stylesheet */\n${cssContent}\n</style>`
  );
  // Replace module script using function callback to prevent $& replacement issues
  standaloneHtml = standaloneHtml.replace(
    /<script[^>]*type=["']module["'][^>]*src=["'][^"']*index-[^"']*\.js["'][^>]*><\/script>/i,
    () => `<script>\n/* Inlined QuickCard App Logic - Runs offline on file:// protocol */\n${jsContent}\n</script>`
  );

  // Write standalone HTML to dist and public
  const distStandalonePath = path.join(distDir, 'QuickCard-Standalone.html');
  fs.writeFileSync(distStandalonePath, standaloneHtml, 'utf8');

  const publicStandalonePath = path.join(publicDir, 'QuickCard-Standalone.html');
  fs.writeFileSync(publicStandalonePath, standaloneHtml, 'utf8');

  // 2. Add files from dist to ZIP
  function addFolderToZip(folderPath, zipFolder) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addFolderToZip(fullPath, zipFolder.folder(file));
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(file, content);
      }
    }
  }

  addFolderToZip(distDir, zip);

  // 3. Add Windows 1-Click launcher
  const windowsBat = `@echo off
echo ===================================================
echo Starting QuickCard Offline...
echo Opening QuickCard in your browser
echo ===================================================
if exist "%~dp0run_with_python.py" (
  python "%~dp0run_with_python.py"
  if errorlevel 1 py "%~dp0run_with_python.py"
  if errorlevel 1 start "" "%~dp0QuickCard-Standalone.html"
) else (
  start "" "%~dp0QuickCard-Standalone.html"
)
exit
`;
  zip.file('Double-Click-Windows.bat', windowsBat);

  // 4. Add Python auto-browser opener script (Works on Windows, Mac, Linux)
  const pythonScript = `import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print("=" * 60)
print("  QUICKCARD OFFLINE LOCAL SERVER")
print("=" * 60)
print(f"Serving folder: {DIRECTORY}")
print(f"Address: http://localhost:{PORT}")
print("Opening your browser automatically...")
print("Press Ctrl+C anytime to stop.")
print("=" * 60)

# Open browser automatically
webbrowser.open(f"http://localhost:{PORT}")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\\nServer stopped.")
    sys.exit(0)
except Exception as e:
    print(f"Error starting on port {PORT}: {e}")
    # Try port 8080 if 8000 is busy
    try:
        with socketserver.TCPServer(("", 8080), Handler) as httpd:
            webbrowser.open("http://localhost:8080")
            httpd.serve_forever()
    except Exception:
        pass
`;
  zip.file('run_with_python.py', pythonScript);
  fs.writeFileSync(path.join(distDir, 'run_with_python.py'), pythonScript);
  fs.writeFileSync(path.join(publicDir, 'run_with_python.py'), pythonScript);

  // 5. Add Mac 1-Click launcher
  const macCommand = `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
if which python3 >/dev/null 2>&1; then
  python3 "$DIR/run_with_python.py"
else
  open "$DIR/QuickCard-Standalone.html"
fi
`;
  zip.file('Double-Click-Mac.command', macCommand);

  // 5. Add beginner-friendly instructions
  const instructions = `===================================================================
QUICKCARD OFFLINE - WHY CHROME SHOWS A BLANK SCREEN & HOW TO FIX IT
===================================================================

WHY DID GOOGLE CHROME NOT OPEN index.html?
-----------------------------------------
When you double-click index.html directly from your computer folders,
Google Chrome and Microsoft Edge use the "file://" address.
Modern browsers block JavaScript files loaded via <script type="module">
on "file://" for security (this is called the CORS security policy).
Because the script is blocked, the browser displays a blank white screen.

HOW TO OPEN QUICKCARD (3 EASY SOLUTIONS):
-----------------------------------------

SOLUTION 1 (FASTEST & RECOMMENDED):
Double-click "QuickCard-Standalone.html" inside this folder!
We bundled the entire app into this single file so Google Chrome
will NEVER block it. It runs instantly on any computer (Windows,
Mac, Linux, or Chromebook) even with Wi-Fi completely turned off!

If you are on Windows, you can also just double-click:
  "Double-Click-Windows.bat"

If you are on Mac, you can double-click:
  "Double-Click-Mac.command"


SOLUTION 2 (RUNNING A LOCAL MINI-SERVER):
If you prefer running index.html as a web server on your computer:
- With Python installed:
    Open terminal / cmd in this folder and type:
    python -m http.server 3000
    Then open http://localhost:3000 in Chrome.

- With Node installed:
    npx serve .
    Then open the link shown in terminal.


SOLUTION 3 (ON YOUR ANDROID PHONE / 100% AIRPLANE MODE):
1. Open QuickCard in Chrome on your Android phone.
2. Tap the 3 dots (⋮) in the top right of Chrome.
3. Tap "Add to Home screen" or "Install App".
4. Turn on Airplane Mode (no Wi-Fi, no mobile data).
5. Open QuickCard from your home screen icon — it works 100% offline!

===================================================================`;

  zip.file('HOW-TO-RUN-OFFLINE.txt', instructions);

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const outputPath = path.join(publicDir, 'QuickCard-Offline-Package.zip');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Created standalone HTML (${(standaloneHtml.length / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Created ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

createZip().catch(console.error);
