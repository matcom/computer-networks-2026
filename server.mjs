import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = '/site';
const port = Number(process.env.PORT || 8080);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = normalize(decoded).replace(/^([/\\])+/, '');
  if (relative.startsWith('..')) return null;
  let file = join(root, relative);
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    return file;
  } catch {
    if (!extname(file)) {
      try {
        const html = `${file}.html`;
        if (statSync(html).isFile()) return html;
      } catch {}
    }
    return null;
  }
}

createServer((req, res) => {
  const file = resolvePath(req.url || '/');
  if (!file) {
    res.statusCode = 404;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Not found');
    return;
  }
  res.statusCode = 200;
  res.setHeader('content-type', types[extname(file)] || 'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(port, '0.0.0.0', () => {
  console.log(`Computer Networks site listening on :${port}`);
});
