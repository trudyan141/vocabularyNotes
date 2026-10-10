import {expect,it} from 'vitest';
import {validatePronunciationSuggestions} from '@/lib/learning/enrichment';
const input={text:'nut',contentVersion:1,accent:'UK',ipa:'/nʌt/',sourceUrl:null,readingHintVi:'nất',origin:'ai_generated'};
it('never treats generated IPA or hints as verified and rejects stale text, revision or accents',()=>{expect(validatePronunciationSuggestions([input],'nut',1)[0].verified).toBe(false);expect(()=>validatePronunciationSuggestions([input],'bank',1)).toThrow();expect(()=>validatePronunciationSuggestions([input],'nut',2)).toThrow();expect(()=>validatePronunciationSuggestions([input,input],'nut',1)).toThrow();expect(()=>validatePronunciationSuggestions([{...input,verified:true}],'nut',1)).toThrow();});
