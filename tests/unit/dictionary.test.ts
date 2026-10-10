import {describe,it,expect,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {bilingualSenses,vietnameseExamples,dictionaryText,readingHint} from '@/lib/learning/dictionary';
import {dictionaryArt} from '@/lib/media/dictionary-art';
import {lookupWord,suggestWords} from '@/server/dictionary';
const english=`==English==
===Pronunciation===
{{IPA|en|/ˈhæn.səm/}}
===Adjective===
{{trans-top-see|of man: attractive|beautiful}}
* Vietnamese: {{t+|vi|đẹp trai}}
{{trans-bottom}}
{{trans-top|generous}}
* Vietnamese: {{t|vi|hào phóng}}
{{trans-bottom}}
==French==
{{trans-top|other language}}
* Vietnamese: {{t|vi|wrong}}
{{trans-bottom}}`;
const vietnamese=`{{-eng-}}
{{-adj-}}
# [[đẹp|Đẹp]].
#: ''a '''handsome''' man'' — người đẹp trai
# [[hào phóng|Hào phóng]].
#: ''a '''handsome''' gift'' — một món quà hào phóng`;
describe('real dictionary parsing',()=>{
  it('keeps bilingual translation glosses paired with POS and never combines languages or senses',()=>{const senses=bilingualSenses('handsome',english);expect(senses).toHaveLength(2);expect(senses[0]).toMatchObject({vi:'đẹp trai',definition:'of man: attractive',pos:'adjective',ipa:'/ˈhæn.səm/'});expect(senses[1].vi).toBe('hào phóng');expect(dictionaryArt('handsome','adjective',senses[0].definition)).toBe('openmoji-1F468');expect(dictionaryArt('handsome','adjective','generous')).toBeNull();expect(dictionaryArt('orange','adjective','a color')).toBeNull();expect(dictionaryArt('pretty','adverb','quite')).toBeNull();expect(dictionaryArt('orange','noun','a fruit')).toBe('orange');});
  it('reads native bilingual examples and strips markup',()=>{expect(vietnameseExamples(vietnamese)[0]).toMatchObject({en:'a handsome man',vi:'người đẹp trai',pos:'adjective'});expect(dictionaryText('[[pear|quả lê]] <script>data only</script> {{unknown}}')).toBe('quả lê data only');expect(readingHint('/ˈhæn.səm/')).toBe('hen-sơm');});
  it('fills dictionary content from bounded upstreams while tolerating a corpus failure',async()=>{const mock=vi.fn(async(url:URL|string|Request)=>{const u=new URL(String(url));if(u.hostname==='api.tatoeba.org')return new Response('unavailable',{status:503});return Response.json({parse:{wikitext:{'*':u.hostname.startsWith('en.')?english:vietnamese}}});});const result=await lookupWord('handsome',mock as typeof fetch);expect(result[0].vi).toBe('đẹp trai');expect(result[0].examples[0].vi).toBe('người đẹp trai');expect(result[1].examples[0].vi).toContain('hào phóng');});
  it('filters malformed suggestions and does not fetch supplied remote URLs',async()=>{const mock=vi.fn(async()=>Response.json([{word:'handsome'},{word:'https://evil.test'},{word:99}]));expect(await suggestWords('handsom',mock as typeof fetch)).toEqual([{word:'handsome',source:'Datamuse spelling suggestions'}]);expect(mock.mock.calls).toHaveLength(1);});
});
