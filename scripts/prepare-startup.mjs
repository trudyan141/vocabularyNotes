import {mkdir,readFile} from 'node:fs/promises';
import sharp from 'sharp';
import ts from 'typescript';
const compiled=ts.transpileModule(await readFile('src/lib/startup-images.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {startupDevices}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
await mkdir('public/startup',{recursive:true});
const fox=await readFile('public/illustrations/fox.svg');
// Bounded generation: do not render every large iPad canvas concurrently.
for(const [width,height,ratio] of startupDevices)for(const orientation of ['portrait','landscape']){
 const w=(orientation==='portrait'?width:height)*ratio,h=(orientation==='portrait'?height:width)*ratio;
 const artWidth=160*ratio,artHeight=176*ratio;
 const art=await sharp(fox).resize(artWidth,artHeight).png().toBuffer();
 const label=await sharp({text:{text:'<span foreground="#38213d"><b>Đang tải…</b></span>',font:'Nunito 22',fontfile:'src/app/fonts/nunito-variable.woff2',rgba:true,dpi:72*ratio}}).png().toBuffer();
 const labelSize=await sharp(label).metadata(),top=Math.round((h-artHeight-50*ratio)/2);
 await sharp({create:{width:w,height:h,channels:3,background:'#fff8f8'}}).composite([
  {input:art,left:Math.round((w-artWidth)/2),top},
  {input:label,left:Math.round((w-labelSize.width)/2),top:top+artHeight+20*ratio},
 ]).png({palette:true}).toFile(`public/startup/fox-${width}x${height}-${ratio}-${orientation}.png`);
}
