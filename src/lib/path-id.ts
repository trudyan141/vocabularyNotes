// Next route params may carry an encoded path segment (notably ':' in imported IDs).
// Decode exactly once: literal percent sequences in IDs must remain literal.
export function pathId(segment:string){try{return decodeURIComponent(segment);}catch{return segment;}}
