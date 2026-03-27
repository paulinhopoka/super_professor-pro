const fs = require('fs');
const { execSync } = require('child_process');

// Ensure zip exists
try {
  execSync('npx -y bestzip public/codigo-fonte.zip src index.html style.css script.js detalhes-turma.js detalhes-turma.css vite.config.ts package.json tsconfig.json manifest.json pwabuilder-sw.js firebase.js firebase-applet-config.js');
} catch (e) {
  console.error(e);
}

const zipBuffer = fs.readFileSync('public/codigo-fonte.zip');
const base64Zip = zipBuffer.toString('base64');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Download Código-Fonte</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 90%; }
    button { background: #007bff; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 8px; cursor: pointer; margin-top: 1rem; }
    button:hover { background: #0056b3; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Código-Fonte Pronto!</h2>
    <p>Clique no botão abaixo para baixar o arquivo .zip com todo o código do seu aplicativo.</p>
    <button id="downloadBtn">Baixar codigo-fonte.zip</button>
  </div>
  <script>
    document.getElementById('downloadBtn').addEventListener('click', () => {
      const base64 = "${base64Zip}";
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codigo-fonte.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('public/download.html', htmlContent);
console.log('download.html created successfully!');
