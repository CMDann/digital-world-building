// Local-only editor server. No packages or build step required.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLevel, levelFilename } from './src/level-format.js';
const root = path.dirname(fileURLToPath(import.meta.url));
const levels = path.join(root, 'levels');
await fs.mkdir(levels, { recursive: true });
const port = Number(process.env.PORT || 8080);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.glb':'model/gltf-binary', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.pdf':'application/pdf', '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.ttf':'font/ttf', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp' };
const reply = (res, status, value) => { res.writeHead(status, {'Content-Type':'application/json', 'Cache-Control':'no-store'}); res.end(JSON.stringify(value)); };
http.createServer(async (req, res) => {
  try {
    if (!['127.0.0.1', 'localhost'].includes((req.headers.host || '').split(':')[0])) return reply(res, 403, {error:'Local access only.'});
    if (req.headers.origin && ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(req.headers.origin)) return reply(res, 403, {error:'Same-origin requests only.'});
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/api/levels') {
      if (req.method === 'GET') return reply(res, 200, (await fs.readdir(levels)).filter(n => n !== 'index.json' && /^[a-z0-9_-]+\.json$/.test(n)).sort());
      if (req.method !== 'POST') return reply(res, 405, {error:'Method not allowed.'});
      let size = 0; const chunks = [];
      for await (const chunk of req) { size += chunk.length; if (size > 40 * 1024 * 1024) return reply(res, 413, {error:'Scene exceeds 40 MB. Use fewer or smaller models.'}); chunks.push(chunk); }
      const data = validateLevel(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      const filename = levelFilename(data.name);
      const destination = path.join(levels, filename);
      if (url.searchParams.get('overwrite') !== '1') {
        try { await fs.access(destination); return reply(res, 409, {error:`${filename} already exists.`}); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      const temp = path.join(levels, `.${filename}.${crypto.randomUUID()}.tmp`);
      await fs.writeFile(temp, JSON.stringify(data, null, 2));
      await fs.rename(temp, destination);
      return reply(res, 200, {filename});
    }
    if (!['GET','HEAD'].includes(req.method)) return reply(res, 405, {error:'Method not allowed.'});
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (relative.split(/[\\/]/).some(segment => segment.startsWith('.'))) return reply(res, 403, {error:'Not available.'});
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) return reply(res, 403, {error:'Not available.'});
    const real = await fs.realpath(file);
    if (!real.startsWith(root + path.sep)) return reply(res, 403, {error:'Not available.'});
    const content = await fs.readFile(real);
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch(error) { reply(res, error.code === 'ENOENT' ? 404 : 400, {error:error.code === 'ENOENT' ? 'File not found.' : error.message}); }
}).listen(port, '127.0.0.1', () => console.log(`World Seed editor: http://127.0.0.1:${port}`));


