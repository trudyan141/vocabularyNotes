import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
await Promise.all([mkdir('public/icons',{recursive:true}),mkdir('public/images',{recursive:true})]);
// Existing original vector mascot: no remote media or generated learning content.
const fox=await readFile('public/illustrations/fox.svg');
const sizes=[16,32,48,180];const icons=[];
for(const size of sizes){
  const inset=Math.round(size*.08),side=size-2*inset;
  const image=await sharp(fox).resize(side,side,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).extend({top:inset,bottom:inset,left:inset,right:inset,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  await writeFile(size===180?'public/icons/apple-touch-icon.png':`public/icons/favicon-${size}.png`,image);if(size<180)icons.push({size,image});
}
const header=Buffer.alloc(6+16*icons.length);header.writeUInt16LE(1,2);header.writeUInt16LE(icons.length,4);let offset=header.length;
for(const [i,{size,image}] of icons.entries()){const at=6+i*16;header[at]=size;header[at+1]=size;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(image.length,at+8);header.writeUInt32LE(offset,at+12);offset+=image.length;}
await writeFile('public/favicon.ico',Buffer.concat([header,...icons.map(icon=>icon.image)]));
await writeFile('src/app/icon.svg',fox);
const canvas=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#fff8f8"/><rect x="34" y="34" width="1132" height="562" rx="42" fill="#fff" stroke="#e5d7e9" stroke-width="2"/>
<circle cx="922" cy="315" r="190" fill="#ffe59a"/><path d="M84 113h60" stroke="#b52f60" stroke-width="8" stroke-linecap="round"/>
<g font-family="Arial, Helvetica, sans-serif" fill="#38213d"><text x="84" y="225" font-size="72" font-weight="800">Words for Kids</text>
<text x="84" y="297" font-size="36" font-weight="700">Cùng con học tiếng Anh</text><text x="84" y="387" font-size="27">Bố mẹ chuẩn bị bài.</text><text x="84" y="427" font-size="27">Con vui học, nhớ từng ngày.</text></g>
<rect x="84" y="483" width="340" height="54" rx="27" fill="#b52f60"/><text x="110" y="518" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" fill="#fff">words-for-kids.vercel.app</text></svg>`);
const mascot=await sharp(fox).resize(326,392,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
await sharp(canvas).composite([{input:mascot,left:760,top:122}]).png().toFile('public/images/words-for-kids-share.png');
