import illustrations from './open-illustrations.json';
// Only vendored, licensed SVGs or approved imported media can become paths.
export const readyArt=new Set(['apple','bag','banana','bird','book','bread','car','cat','chair','desk','dog','egg','eraser','fish','glue','grapes','milk','notebook','orange','pen','pencil','ruler','scissors','sun','tree','water']);
export function safeArt(value:string|null|undefined){return value&&(readyArt.has(value)||illustrations.some(item=>item.id===value)||/^media-[0-9a-f-]{36}$/.test(value))?value:null;}
