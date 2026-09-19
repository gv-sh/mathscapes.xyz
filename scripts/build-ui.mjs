import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
await Promise.all([
  build({entryPoints:['ui/client.jsx'],bundle:true,minify:true,format:'esm',target:'es2020',outfile:'src/assets/ui/home.js',jsx:'automatic',external:['/assets/*'],define:{'process.env.NODE_ENV':'"production"'}}),
  build({entryPoints:['ui/render.jsx'],bundle:true,platform:'node',format:'cjs',target:'node22',outfile:'.cache/render-home.cjs',jsx:'automatic',packages:'external'})
]);

const assets=await Promise.all([readFile('src/assets/ui/home.js'),readFile('src/assets/ui/home.css')]);
const version=createHash('sha256').update(Buffer.concat(assets)).digest('hex').slice(0,12);
await writeFile('.cache/ui-version.json',JSON.stringify({version}));
