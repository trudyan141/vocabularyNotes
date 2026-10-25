import type {Mode} from '@/data/local/practice';
const cells:Record<Mode|'speaking',number>={speaking:0,flashcard:1,'picture-word':2,'word-picture':3,letters:4,spelling:5,'missing-letters':6,'match-pairs':7,'memory-pairs':8,'grammar-card':9,grammar:10,'grammar-cloze':11,'grammar-repair':12,'grammar-dialogue':13,'word-builder':14};
// Explicit viewports follow the generated layout and exclude neighboring art.
const columns=[25,335,640,940],rows=[70,370,650,930],canvas=1254,viewport=290;
export function GameMenuArt({mode}:{mode:Mode|'speaking'}){const cell=cells[mode];return <span aria-hidden="true" className="game-menu-art" style={{backgroundSize:`${canvas/viewport*100}% ${canvas/viewport*100}%`,backgroundPosition:`${columns[cell%4]/(canvas-viewport)*100}% ${rows[Math.floor(cell/4)]/(canvas-viewport)*100}%`}}/>;}
