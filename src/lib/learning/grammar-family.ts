/** Explicit family grouping only; never fuzzy-merge unrelated explanations. */
export function grammarFamily(example:string,declared?:string){
 const text=example.trim().toLowerCase().replace(/[’]/g,"'");
 if(/^is it (?:a|an) .+\?$/.test(text)||/^yes,? it is\.?$/.test(text)||/^no,? it (?:isn't|is not)\.?$/.test(text))return 'be-it-yes-no';
 return declared?.trim().toLowerCase()||undefined;
}
