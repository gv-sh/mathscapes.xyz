import {spawn, spawnSync} from 'node:child_process';
import {watch} from 'node:fs';
const build=()=>{const result=spawnSync(process.execPath,['scripts/build-ui.mjs'],{stdio:'inherit'});return result.status===0;};
if(!build()) process.exit(1);
const server=spawn(process.execPath,['node_modules/@11ty/eleventy/cmd.js','--serve','--watch','--port=4178'],{stdio:'inherit'});
let timer;
const watcher=watch('ui',{recursive:true},()=>{clearTimeout(timer);timer=setTimeout(build,150);});
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>{watcher.close();server.kill(signal);process.exit();});
server.on('exit',code=>{watcher.close();process.exit(code??0);});
