import 'fake-indexeddb/auto';
import {it,expect} from 'vitest';
import sharp from 'sharp';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {saveContent,type LearningContent} from '@/data/local/content';
import {updateWord,type ContentSnapshot} from '@/data/local/edit-word';
import {approvedMedia} from '@/data/local/media';
import type {MediaAsset} from '@/lib/media/contracts';
import {catalog} from '@/lib/learning/catalog';
const seedContent=(id:string,revision:string):LearningContent=>({senseId:id,targetRevision:revision,example:'Is it a book?',exampleVi:'Đó có phải quyển sách không?',exampleIpa:'/ɪz ɪt ə bʊk/',readingHintVi:'',pattern:'Is it + noun?',patternExplanation:'Hỏi tên vật.',grammarTitle:'Is it…?',grammarFamily:'be-it-yes-no',grammarVariants:[{formula:'Yes + it + is.',example:'Yes, it is.',exampleVi:'Vâng, đúng vậy.',analysis:'Giữ it và is.',exampleIpa:'/jɛs ɪt ɪz/'}],conditions:'Hỏi một vật.',formula:'Is + it + a + noun?',analysis:'Đặt is trước it.',commonError:'Is it book?',correction:'Is it a book?',approved:true,origin:'user',source:'Fixture',sourceEvidenceText:'Is it a book?',lessonId:'set'});
async function fixture(run:(repo:LocalRepository)=>Promise<void>,empty=false){const db=new LibraryDatabase(`edit-${crypto.randomUUID()}`),repo=new LocalRepository(db,{kind:'guest',id:'guest:edit'});try{await repo.saveLesson({operationId:'seed',lessonId:'set',title:'Fixture',learnedOn:'2026-10-12',sourceType:'manual',items:[{...catalog[0],id:'apple',...(empty?{example:'',exampleVi:'',examplePronunciations:[],additionalExamples:[]}:{}),approved:true}]});await run(repo);}finally{db.close();await db.delete();}}
async function image(word:string,revision:string):Promise<MediaAsset>{const bytes=await sharp({create:{width:16,height:16,channels:3,background:'red'}}).jpeg().toBuffer();return {candidate:{id:'upload:'+ 'a'.repeat(64),title:'File:fixture.jpg',sourceUrl:'https://fixture.example/art',imageUrl:'',creator:'User supplied' as const,license:'User supplied' as const,licenseUrl:'',credit:'Fixture art'},senseId:'apple',word,revision,base64:bytes.toString('base64'),sha256:Buffer.from(await crypto.subtle.digest('SHA-256',bytes)).toString('hex'),checkedAt:new Date().toISOString(),receipt:'local-fixture',status:'ready' as const,approved:true};}
it('one save stages picture + word + supplemental edits atomically and preserves variants, evidence and IPA',()=>fixture(async repo=>{
 const old=(await repo.word('apple'))!,content=seedContent(old.id,old.revision),row=await saveContent(repo,'extra-apple',null,content),snapshots:ContentSnapshot[]=[{id:row.id,version:row.version,content}];
 const result=await updateWord(repo,old.id,old.revision,{...catalog[0],id:old.id,vi:'táo đỏ',approved:true},snapshots,{...content,analysis:'Giải thích mới'},await image(old.word,old.revision));
 expect(result.word.vi).toBe('táo đỏ');expect(result.word.approved).toBe(true);expect(await approvedMedia(repo,result.word.art!,result.word.word)).not.toBeNull();expect(result.rows[0].content).toMatchObject({analysis:'Giải thích mới',grammarFamily:'be-it-yes-no',grammarVariants:content.grammarVariants,exampleIpa:content.exampleIpa,sourceEvidenceText:content.sourceEvidenceText,targetRevision:result.word.revision});
 await expect(updateWord(repo,old.id,old.revision,{...catalog[0],id:old.id,approved:true},snapshots,content)).rejects.toThrow('conflict');
}));
it('rolls back word, image and content on invalid fields or a concurrently changed supplemental row',()=>fixture(async repo=>{
 const old=(await repo.word('apple'))!,content=seedContent(old.id,old.revision),row=await saveContent(repo,'extra-apple',null,content),snapshot=[{id:row.id,version:row.version,content}];
 await expect(updateWord(repo,old.id,old.revision,{...catalog[0],id:old.id,vi:'changed',approved:true},snapshot,{...content,exampleVi:''},await image(old.word,old.revision))).rejects.toThrow('invalid');expect((await repo.word(old.id))?.revision).toBe(old.revision);expect(await repo.db.table('mediaAssets').count()).toBe(0);
 await saveContent(repo,row.id,row.version,{...content,analysis:'Other tab'});await expect(updateWord(repo,old.id,old.revision,{...catalog[0],id:old.id,approved:true},snapshot,content)).rejects.toThrow('conflict');expect((await repo.word(old.id))?.revision).toBe(old.revision);
}));
it('image-only edit works for an already saved word without an example, and a renamed word can receive its picture in the same save',()=>fixture(async repo=>{
 const old=(await repo.word('apple'))!;const result=await updateWord(repo,old.id,old.revision,{...catalog[0],id:old.id,word:'pear',example:'',exampleVi:'',examplePronunciations:[],approved:true},[],null,await image('pear',old.revision));expect(result.word.word).toBe('pear');expect(result.word.approved).toBe(true);expect(await approvedMedia(repo,result.word.art!,'pear')).not.toBeNull();
},true));
it('clearing the supplemental form removes only its row and retains the separate grammar records',()=>fixture(async repo=>{
 const old=(await repo.word('apple'))!,content=seedContent(old.id,old.revision),extra=await saveContent(repo,'extra-apple',null,content),other=await saveContent(repo,'source-grammar',null,content);
 const saved=await updateWord(repo,old.id,old.revision,{...catalog[0],id:old.id,approved:true},[extra,other].map(row=>({id:row.id,version:row.version,content})),null);
 expect((await repo.db.table('sentences').get([repo.scope.id,extra.id])).deletedAt).toBeTruthy();expect(saved.rows).toHaveLength(1);expect(saved.rows[0].id).toBe(other.id);expect(saved.rows[0].content.grammarVariants).toEqual(content.grammarVariants);expect(saved.rows[0].content.targetRevision).toBe(saved.word.revision);
}));
