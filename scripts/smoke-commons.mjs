// Opt-in public network smoke; never sends a worksheet or writes a library.
import ts from 'typescript';
import sharp from 'sharp';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
if(!process.argv.includes('--live'))throw new Error('Pass --live to query public Wikimedia Commons.');
const contract=readFileSync('src/lib/media/contracts.ts','utf8');
const adapter=readFileSync('src/server/media/commons.ts','utf8');
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
// Run the real server adapter outside Next; auth/quota routes are checked separately.
const contracts=moduleUrl(contract.replace("from 'zod'",`from '${import.meta.resolve('zod')}'`));
const implementation=moduleUrl(adapter.replace("import 'server-only';",'').replace("from 'sharp'",`from '${import.meta.resolve('sharp')}'`).replace("from '@/lib/media/contracts'",`from '${contracts}'`));
const report={timestamp:new Date().toISOString(),query:'apple fruit illustration',scope:'public adapter smoke; no auth/quota route, no parent approval or library save',sourceHash:createHash('sha256').update(contract+adapter).digest('hex'),candidates:[],imported:null,status:'unavailable'};
try{
 const api=await import(implementation);
 report.candidates=await api.searchCommons('apple','fruit');
 if(!report.candidates.length)throw new Error('no-supported-candidate');
 const selected=report.candidates.find(c=>c.license==='Public domain')??report.candidates[0];
 const result=await api.importCommons(selected.id,selected.title);
 const metadata=await sharp(Buffer.from(result.base64,'base64')).metadata();
 report.imported={candidate:result.candidate,sha256:result.sha256,bytes:Buffer.from(result.base64,'base64').length,width:metadata.width,height:metadata.height,format:metadata.format};
 report.status='completed';
}catch(error){report.error=error instanceof Error?error.message:'unavailable';process.exitCode=1;}
writeFileSync('docs/evaluations/commons-live-smoke.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,candidates:report.candidates.length,imported:!!report.imported,error:report.error}));
