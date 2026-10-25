export function AdventureMenuArt({cell}:{cell:number}){return <span className="adventure-menu-art" aria-hidden="true" style={{backgroundPosition:`${cell%4/3*100}% ${Math.floor(cell/4)*100}%`}}/>;}
