import {expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {NextRequest} from 'next/server';
import {audioWord,englishAudioFile,commonsWordAudio} from '@/lib/audio/word-audio';
import {lookupWordAudio} from '@/server/word-audio';
import {approximateIpaReading} from '@/lib/speaking/articulation';
import {POST} from '@/app/api/audio/word/route';
const raw="==English==\n===Pronunciation===\n* {{IPA|en|/ˈsnəʊi/|a=UK}}\n* {{IPA|en|/ˈsnoʊi/|a=US}}\n** {{audio|en|en-us-snowy.ogg|a=US}}\n===Adjective===\n# snow\n==Polish==\n===Pronunciation===\n{{audio|pl|snowy.wav}}";
const metadata=()=>({title:'File:En-us-snowy.ogg',videoinfo:[{mime:'application/ogg',url:'https://upload.wikimedia.org/wikipedia/commons/8/87/En-us-snowy.ogg',descriptionurl:'https://commons.wikimedia.org/wiki/File:En-us-snowy.ogg',derivatives:[{type:'audio/mpeg',src:'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/87/En-us-snowy.ogg/En-us-snowy.ogg.mp3'}],extmetadata:{Artist:{value:'<a>Neskaya</a>'},LicenseShortName:{value:'CC BY-SA 3.0'},LicenseUrl:{value:'http://creativecommons.org/licenses/by-sa/3.0/'},Restrictions:{value:''}}}]});
it('selects only an exact English US file and pairs the US IPA without another language leaking in',()=>{
 expect(englishAudioFile('snowy',raw)).toEqual({file:'en-us-snowy.ogg',ipa:'/ˈsnoʊi/'});
 expect(englishAudioFile('nut',raw)).toBeNull();expect(englishAudioFile('snowy',raw.replaceAll('en-us-snowy','en-uk-snowy'))).toBeNull();
 expect(englishAudioFile('snowy',raw.replace('===Adjective===','* {{IPA|en|/other/|a=US}}\n===Adjective==='))).toBeNull();
 expect(englishAudioFile('snowy',raw.replace('===Adjective===','===Pronunciation===\n{{IPA|en|/other/}}\n===Adjective==='))).toBeNull();
});
it('accepts reusable audio with credit and a real MP3 derivative, rejects unsafe or unlicensed media',()=>{
 expect(commonsWordAudio('snowy','en-us-snowy.ogg','/ˈsnoʊi/',metadata())).toMatchObject({creator:'Neskaya',license:'CC BY-SA 3.0',accent:'US',audioUrl:expect.stringContaining('.ogg.mp3')});
 for(const mutate of [(p:ReturnType<typeof metadata>)=>p.videoinfo[0].extmetadata.LicenseShortName.value='All rights reserved',(p:ReturnType<typeof metadata>)=>p.videoinfo[0].extmetadata.LicenseUrl.value='https://other.test/license',(p:ReturnType<typeof metadata>)=>p.videoinfo[0].derivatives[0].src='https://evil.test/a.mp3',(p:ReturnType<typeof metadata>)=>p.videoinfo[0].extmetadata.Artist.value='',(p:ReturnType<typeof metadata>)=>p.videoinfo[0].extmetadata.Restrictions.value='restricted',(p:ReturnType<typeof metadata>)=>p.title='File:Other.ogg']){const page=metadata();mutate(page);expect(commonsWordAudio('snowy','en-us-snowy.ogg',null,page)).toBeNull();}
});
it('looks up metadata only, bounds upstream bytes, and returns no sample for missing words',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(Response.json({parse:{title:'snowy',wikitext:{'*':raw}}})).mockResolvedValueOnce(Response.json({query:{pages:{1:metadata()}}}));
 expect(await lookupWordAudio('snowy',fetcher)).toMatchObject({word:'snowy',creator:'Neskaya'});expect(fetcher).toHaveBeenCalledTimes(2);expect(String(fetcher.mock.calls[1][0])).toContain('prop=videoinfo');
 expect(await lookupWordAudio('unknown',vi.fn().mockResolvedValue(Response.json({error:{code:'missingtitle'}})))).toBeNull();
 await expect(lookupWordAudio('snowy',vi.fn().mockResolvedValue(new Response('x'.repeat(500001))))).rejects.toThrow('too-large');
 expect(await lookupWordAudio('I like snowy days.',fetcher)).toBeNull();expect(fetcher).toHaveBeenCalledTimes(2);
});
it('same-origin route rejects arbitrary URLs, extra fields and oversized requests without upstream I/O',async()=>{
 const make=(body:unknown,origin='http://localhost:3000')=>new NextRequest('http://localhost:3000/api/audio/word',{method:'POST',headers:{Origin:origin},body:JSON.stringify(body)});
 expect((await POST(make({word:'snowy'},'https://evil.test'))).status).toBe(403);
 for(const body of [{word:'https://evil.test'}, {word:'snowy',url:'https://evil.test'},{word:'x'.repeat(201)}])expect((await POST(make(body))).status).toBe(400);
 expect(audioWord(' Snowy ')).toBe('snowy');expect(audioWord('snowy/other')).toBeNull();
});
it('creates only a labelled reading aid and refuses IPA it cannot map completely',()=>{
 expect(approximateIpaReading('/ˈsnoʊi/')).toBe('snâui');expect(approximateIpaReading('/nʌt/')).toBe('nât');expect(approximateIpaReading('/ˈæp.əl/')).toBe('a-ep-ờl');
 expect(approximateIpaReading('/unknown͜/')).toBeNull();
});
