// Keep ambiguous headwords bound to their sense during web picture search.
export function pictureSearchQuery(word:string,sense=''){
 const context=sense.replace(/\s+/g,' ').trim().slice(0,140);
 return [word.trim(),context].filter(Boolean).join(' ');
}
