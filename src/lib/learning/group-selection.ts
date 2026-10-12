/** Bulk operations only affect pending additions; saved membership is immutable here. */
export function selectNewMembers(current:string[],targets:string[],selected:boolean,saved:readonly string[]){
 const protectedIds=new Set(saved),editable=targets.filter(id=>!protectedIds.has(id));
 return selected?[...new Set([...saved,...current,...editable])]:[...new Set([...saved,...current.filter(id=>!editable.includes(id))])];
}
