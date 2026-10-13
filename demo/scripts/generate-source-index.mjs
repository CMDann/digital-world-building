// Explicit public source roots only; never enumerate configuration, secrets, or .git.
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root=new URL('../',import.meta.url);
export async function generateSourceIndex(){const files=['index.html','README.md','package.json','server.mjs'];async function visit(folder){for(const entry of await fs.readdir(new URL(folder+'/',root),{withFileTypes:true})){if(entry.name.startsWith('.'))continue;const path=folder+'/'+entry.name;if(entry.isDirectory())await visit(path);else if(/\.(js|mjs|css|json|html|md)$/.test(entry.name))files.push(path);}}for(const folder of ['src','examples/demos','scripts','tests','levels','content/starters'])await visit(folder);files.push('examples/viewer.html','content/workshop-lessons.json','content/workbooks.json','content/starters.json');files.sort();await fs.writeFile(new URL('content/source-index.json',root),JSON.stringify(files,null,2)+'\n');return files;}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log('Indexed '+(await generateSourceIndex()).length+' source files.');
