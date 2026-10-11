import {worksheetPatterns} from '@/lib/learning/worksheet-patterns';
export const familyWord={literal:'family',word:'family',vi:'gia đình',en:'A group of people who are related to each other.',pos:'noun',sense:'related people',example:'They are a family.',exampleVi:'Họ là một gia đình.',exampleIpa:'/ðeɪ ɑɹ ə ˈfæməli/'};
export const familyText='Who are they?\nThey are a family.';
export const familyWorksheet={text:familyText,warnings:[],words:[familyWord],learning:worksheetPatterns(familyWord,familyText).map(item=>{const {approved,origin,...content}=item.content;void approved;void origin;return {...content,word:'family',sourceEvidenceText:content.sourceEvidenceText!,exampleIpa:null};})};
