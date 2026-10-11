import './prepare-speaking.mjs';
import './prepare-brand.mjs';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),nextRequire=createRequire(require.resolve('next/package.json')),sharp=nextRequire('sharp');
await mkdir('public/icons',{recursive:true});
for(const size of [192,512])await sharp('public/illustrations/fox.svg').resize(Math.round(size*.7),Math.round(size*.7),{fit:'contain',background:'#fff8f8'}).extend({top:Math.floor(size*.15),bottom:size-Math.round(size*.7)-Math.floor(size*.15),left:Math.floor(size*.15),right:size-Math.round(size*.7)-Math.floor(size*.15),background:'#fff8f8'}).png().toFile(`public/icons/app-${size}.png`);
const files=['public/offline.html','public/offline.css','public/offline.js','public/offline-games.js','public/offline-srs.js','scripts/sw.template.js','public/offline-parent.js','public/offline-identity.js','public/open-illustrations.js','public/offline-prepared-ipa.js','public/offline-pronunciation.js','public/offline-voices.js'];const bytes=await Promise.all(files.map(file=>readFile(file)));const hash=createHash('sha256');for(const b of bytes)hash.update(b);const version=hash.digest('hex').slice(0,16);await writeFile('public/sw.js',bytes[5].toString().replace('__BUILD__',version));
