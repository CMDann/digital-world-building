// Stage only public editor files; regenerate the bundled level catalog for Pages.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLevel } from '../src/level-format.js';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output=path.join(root,'dist-pages');
await fs.mkdir(output,{recursive:true});
for(const file of ['index.html','src','vendor/three','levels'])await fs.cp(path.join(root,file),path.join(output,file),{recursive:true});
const files=(await fs.readdir(path.join(root,'levels'))).filter(name=>name!=='index.json'&&/^[a-z0-9_-]+\.json$/.test(name));
for(const file of files)validateLevel(JSON.parse(await fs.readFile(path.join(root,'levels',file),'utf8')));
await fs.writeFile(path.join(output,'levels/index.json'),JSON.stringify(files,null,2));
await fs.writeFile(path.join(output,'.nojekyll'),'');
console.log(`Packaged editor with ${files.length} bundled scene(s) in dist-pages.`);
