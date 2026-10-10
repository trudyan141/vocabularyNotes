import {it,expect} from 'vitest';
import {dictionary} from 'cmu-pronouncing-dictionary';
import {NextRequest} from 'next/server';
import {sentenceFromLexicon} from '@/lib/pronunciation/sentence';
import {POST} from '@/app/api/pronunciation/route';
it('transcribes every clause with a source, without claiming verified connected speech',()=>{
 expect(sentenceFromLexicon('I like this story book.',dictionary)).toMatchObject({ipa:'/aɪ laɪk ðɪs stɔɹi bʊk/',accent:'US',verified:false});
 expect(sentenceFromLexicon('Is it a book? Yes, it is.',dictionary).ipa).toBe('/ɪz ɪt ə bʊk | jɛs ɪt ɪz/');
 expect(sentenceFromLexicon("It's an apple.",dictionary).ipa).toBe('/ɪts ən æpəl/');
});
it('never returns an incomplete or invented IPA for unknown words, numbers or markup',()=>{
 for(const text of ['I like zzunknownword.', 'I read 25 books.', 'I read a book.', '<script>book</script>', 'I'.repeat(2001)])expect(sentenceFromLexicon(text,dictionary).ipa).toBeNull();
});
it('bounds same-origin batches and keeps lesson text out of public caches',async()=>{
 const make=(body:unknown,origin='http://localhost:3000')=>new NextRequest('http://localhost:3000/api/pronunciation',{method:'POST',headers:{Origin:origin},body:JSON.stringify(body)});
 const response=await POST(make({texts:['Is it a book? Yes, it is.']}));expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toContain('no-store');expect((await response.json()).results[0].ipa).toContain('jɛs');
 expect((await POST(make({texts:Array(17).fill('book')}))).status).toBe(400);expect((await POST(make({texts:['book']},'https://other.test'))).status).toBe(403);
});

it('keeps manually supplied IPA distinct from a prepared lexicon source',async()=>{
 const {pronunciation}=await import('@/lib/learning/catalog');
 expect(pronunciation('I like this story book.',null,'/custom/')).toMatchObject({ipa:'/custom/',sourceUrl:null,origin:'user',verified:false});
 expect(pronunciation('I like this story book.',null)).toMatchObject({accent:'US',origin:'source',verified:false});
});
