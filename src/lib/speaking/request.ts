import type {TargetWord} from './assessment';
import {observationProviderSchema} from './observation';
import {speakingGeminiPrompt} from './prompt';
export const speakingRequestTimeoutMs=6000;
export function speakingRequestBody(targets:TargetWord[],audioBase64:string){
 const expectedCount=targets.reduce((sum,target)=>sum+Math.max(...target.variants.map(variant=>variant.length)),0);
 return {systemInstruction:{parts:[{text:speakingGeminiPrompt}]},contents:[{role:'user',parts:[{inlineData:{mimeType:'audio/wav',data:audioBase64}},{text:JSON.stringify({wordCount:targets.length})}]}],generationConfig:{responseMimeType:'application/json',responseJsonSchema:observationProviderSchema(targets),thinkingConfig:{thinkingLevel:'minimal'},maxOutputTokens:Math.min(4096,256+expectedCount*32),temperature:0}};
}
