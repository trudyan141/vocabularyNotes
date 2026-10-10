/* Original code-native illustrations for the T18 prototype; no remote media. */
window.WFK = {};
WFK.icon = function(name) {
  const shapes = {
    home:'<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    book:'<path d="M12 6c-3-3-7-3-10-2v16c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2Z"/><path d="M12 6v16"/>',
    play:'<path d="m8 4 12 8-12 8Z"/>',
    sound:'<path d="M3 9h4l5-5v16l-5-5H3Z"/><path d="M16 8c3 2 3 6 0 8M19 4c6 4 6 12 0 16"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
    camera:'<rect x="2" y="6" width="20" height="15" rx="4"/><circle cx="12" cy="13" r="4"/><path d="m7 6 2-3h6l2 3"/>',
    search:'<circle cx="10" cy="10" r="7"/><path d="m16 16 6 6"/>',
    back:'<path d="m14 4-8 8 8 8"/>',
    close:'<path d="m5 5 14 14M19 5 5 19"/>',
    pause:'<path d="M8 4v16M16 4v16"/>',
    check:'<path d="m4 12 5 5L20 5"/>',
    bulb:'<path d="M8 17c0-4-5-5-5-10a9 9 0 0 1 18 0c0 5-5 6-5 10ZM8 20h8M10 23h4"/>',
    image:'<rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="8" cy="8" r="2"/><path d="m3 19 6-6 4 4 4-6 5 8"/>',
    forward:'<path d="m10 4 8 8-8 8"/>',
    cards:'<rect x="3" y="4" width="13" height="17" rx="3"/><path d="m8 3 8-2 6 16-6 2"/>'
  };
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[name]||shapes.book)+'</svg>';
};
WFK.face = function(x=80,y=101) {
  return '<g fill="#38213d" stroke="none"><ellipse cx="'+(x-15)+'" cy="'+y+'" rx="3.5" ry="4.5"/><ellipse cx="'+(x+15)+'" cy="'+y+'" rx="3.5" ry="4.5"/></g><path d="M'+(x-6)+' '+(y+10)+'q6 8 12 0" fill="none"/><g fill="#ffada5" stroke="none"><ellipse cx="'+(x-26)+'" cy="'+(y+8)+'" rx="7" ry="4"/><ellipse cx="'+(x+26)+'" cy="'+(y+8)+'" rx="7" ry="4"/></g>';
};
WFK.art = function(kind,missing=false) {
  const face=WFK.face, leaf='<path d="M82 49q-1-34 35-32 1 29-35 32Z" fill="#79bf70"/><path d="m85 44 20-16" stroke="#40804d"/>';
  const drawings={
    apple:'<path d="M81 59C41 34 22 65 30 103c7 32 31 46 51 36 24 11 48-5 52-35 7-38-16-62-52-45Z" fill="#f64d63"/><path d="M79 58q3-16-5-29" stroke="#76472f" stroke-width="9"/>'+leaf+'<path d="M47 68q-12 10-8 24" stroke="#ffb2b1" stroke-width="8"/>',
    banana:'<path d="M31 80q76 27 91-45l12 4c14 73-39 110-92 77-10-7-16-19-11-36Z" fill="#ffd55e"/><path d="M40 95q53 29 82-23" stroke="#efae3f"/><path d="m120 35 3-14 14 3-3 15Z" fill="#855a3e"/>',
    grapes:'<path d="M87 46q-2-16-10-24" stroke="#875e3e" stroke-width="8"/>'+leaf+'<g fill="#9460cb"><circle cx="63" cy="61" r="21"/><circle cx="93" cy="61" r="21"/><circle cx="45" cy="89" r="21"/><circle cx="108" cy="89" r="21"/><circle cx="59" cy="116" r="21"/><circle cx="91" cy="116" r="21"/><circle cx="75" cy="139" r="17"/><circle cx="76" cy="89" r="23"/></g>',
    book:'<path d="M30 28h91q13 0 13 14v91H38q-15 0-15-13V42q0-14 7-14Z" fill="#f4777c"/><path d="M39 29v89h90M37 119h91v17H37q-14-8 0-17Z" fill="#fff0ce"/><rect x="53" y="44" width="58" height="26" rx="6" fill="#ffe49a" stroke="none"/>',
    pencil:'<g transform="rotate(35 80 80)"><path d="M65 27h30v97H65Z" fill="#ffd45f"/><path d="M65 27v-8q15-13 30 0v8Z" fill="#ee7d9c"/><path d="M66 27h29v14H66Z" fill="#b9add1"/><path d="m65 124 15 26 15-26Z" fill="#ffdab6"/><path d="m75 143 5 7 5-7Z" fill="#38213d"/><path d="M75 46v68" stroke="#fff4b7" stroke-width="5"/></g>',
    pen:'<g transform="rotate(28 80 80)"><rect x="65" y="22" width="30" height="101" rx="8" fill="#957bc8"/><path d="m65 123 15 25 15-25Z" fill="#ddd3ec"/><path d="M83 25v40h17v-28" fill="none"/></g>',
    bag:'<path d="M44 52C15 39 13 125 34 141l14-13C28 115 29 71 48 72m67-20c31-13 31 77 9 89l-14-14c18-13 16-55 0-55" fill="#b6d8cd"/><path d="M63 36V24q17-20 34 0v12" fill="none" stroke-width="7"/><rect x="22" y="86" width="25" height="47" rx="9" fill="#69b6a3"/><rect x="117" y="86" width="23" height="47" rx="9" fill="#69b6a3"/><path d="M39 57C39 26 122 26 122 57v75q0 13-14 13H53q-14 0-14-13Z" fill="#63b8aa"/><path d="M50 65h61m-4 0v11" stroke="#285e58"/><circle cx="107" cy="78" r="3" fill="#ffe49a" stroke-width="2.5"/><rect x="50" y="92" width="62" height="39" rx="10" fill="#ffe3a4"/><path d="M53 103h56m-8 0v10" stroke="#876139" stroke-width="3"/><path d="M48 51v30" stroke="#b8e2d4" stroke-width="5"/>',
    eraser:'<g transform="rotate(-28 80 80)"><rect x="25" y="51" width="111" height="64" rx="14" fill="#9683cf"/><path d="M27 52h54v61H27Z" fill="#f0a5ad"/><path d="M38 62v35" stroke="#ffdbdf" stroke-width="7"/></g>',
    ruler:'<g transform="rotate(-25 80 80)"><rect x="13" y="56" width="133" height="48" rx="8" fill="#ffd36f"/><path d="M31 57v23m18-23v12m18-12v23m18-23v12m18-12v23m18-23v12m18-12v23" stroke="#ad7641"/></g>',
    scissors:'<path d="M64 87 126 21 94 101 44 24Z" fill="#c6b7de"/><circle cx="70" cy="90" r="7" fill="#fff0ce"/><circle cx="49" cy="124" r="23" fill="#ee8194"/><circle cx="49" cy="124" r="11" fill="#fff8f8"/><circle cx="98" cy="124" r="23" fill="#ee8194"/><circle cx="98" cy="124" r="11" fill="#fff8f8"/>',
    glue:'<rect x="53" y="22" width="55" height="25" rx="8" fill="#a291d6"/><rect x="46" y="45" width="68" height="96" rx="16" fill="#fff1c7"/><rect x="47" y="71" width="66" height="50" fill="#f28b9e"/>',
    desk:'<rect x="22" y="58" width="116" height="22" rx="5" fill="#f0b574"/><path d="M32 80v62h14V80m69 0v62h14V80" fill="#b38bd5"/><path d="M49 45h56v12H49Z" fill="#ee8098"/>',
    chair:'<rect x="47" y="21" width="69" height="65" rx="13" fill="#a291d6"/><rect x="35" y="86" width="95" height="18" rx="5" fill="#f0b574"/><path d="M43 104v38m76-38v38" stroke-width="9"/>',
    notebook:'<rect x="37" y="22" width="94" height="116" rx="11" fill="#85c2a0"/><path d="M49 23v112M29 43h21M29 64h21M29 86h21M29 108h21"/><path d="M65 44h47M65 63h47" stroke="#def3e6" stroke-width="5"/>',
    orange:'<circle cx="80" cy="90" r="50" fill="#ffc15d"/>'+leaf,
    milk:'<path d="m49 28 14-13h37l15 16v110H44V40Z" fill="#fff"/><path d="m49 28 14 17h50l-13-30" fill="#9ccdd9"/><path d="M44 73h71v49H44Z" fill="#c7e9ec"/>',
    bread:'<path d="M40 67C15 35 47 17 80 28c35-12 66 10 40 39v72H40Z" fill="#edb278"/><path d="M52 71C28 48 56 34 80 43c25-8 49 6 28 28v55H52Z" fill="#ffe2af"/>',
    water:'<path d="M47 24h69l-8 116H56Z" fill="#fff"/><path d="M52 76h60l-4 62H57Z" fill="#9ed9e5"/>',
    egg:'<path d="M30 99C31 64 57 20 80 20s49 45 49 79c0 30-23 42-49 42s-50-12-50-42Z" fill="#fff1d8"/>',
    cat:'<path d="M35 75 31 26 63 48q18-6 36 0l29-23-4 52c18 52-8 66-45 66-35 0-63-20-44-68Z" fill="#ffbb6f"/><path d="m43 40 3 27 15-13m49-15-7 26-9-11" fill="#ffc8a8"/>'+face(80,91)+'<path d="m27 102 23 4m-21 8 23-3m58-5 25-5m-24 10 25 4"/>',
    dog:'<path d="M41 64C10 20 8 97 34 104m87-40c26-47 35 32 11 38" fill="#b58561"/><path d="M37 62q4-35 43-36 47 3 49 42v45q-4 29-49 30-41-3-43-29Z" fill="#f6cc92"/>'+face(80,92)+'<path d="m73 99 8 5 8-5Z" fill="#875235"/>',
    fish:'<path d="m112 75 30-25v65l-30-26" fill="#f8b383"/><ellipse cx="70" cy="82" rx="49" ry="36" fill="#90c9d2"/><path d="M65 75v27l-17-14Z" fill="#a8dfdb"/><circle cx="41" cy="75" r="4" fill="#38213d"/><path d="M28 91q5 5 10 0"/>',
    tree:'<path d="M69 71h24v74H69Z" fill="#b88966"/><path d="M29 74C10 48 37 26 58 34 56 6 101 6 103 34c38-9 57 28 29 47-12 30-54 29-65 12-30 17-53-8-38-19Z" fill="#80bf87"/>',
    bird:'<path d="M29 102q-10-57 47-48 1-36 34-33 38 12 6 50c15 45-17 61-54 55Z" fill="#a99bd8"/><path d="m111 40 29 11-30 11Z" fill="#ffc970"/><circle cx="104" cy="38" r="4" fill="#38213d"/><path d="m39 95 34-17q3 30-20 26m12 24-5 17m31-17 5 17" fill="#d0c4eb"/>',
    sun:'<circle cx="80" cy="81" r="40" fill="#ffd466"/><path d="M80 9v17m0 110v16M8 80h17m110 0h17M30 29l12 12m78 78 12 12M29 131l12-12m79-79 12-12" stroke="#e9ae3d" stroke-width="8"/>',
    car:'<path d="m31 70 21-34h43l27 34h18v48H21V82q0-12 10-12Z" fill="#aaa0dc"/><path d="M57 43h31l19 28H42Z" fill="#d8f0ee"/><circle cx="46" cy="120" r="16" fill="#75537e"/><circle cx="116" cy="120" r="16" fill="#75537e"/><circle cx="46" cy="120" r="6" fill="#fff"/><circle cx="116" cy="120" r="6" fill="#fff"/>',
    school:'<path d="M25 76h114v69H25Z" fill="#ffe49a"/><path d="m13 74 67-50 69 50Z" fill="#ee8d91"/><rect x="68" y="105" width="27" height="40" rx="8" fill="#e39177"/><path d="M38 93h17v17H38Zm69 0h17v17h-17Z" fill="#99cfd6"/><circle cx="82" cy="73" r="14" fill="#fff8f8"/><path d="M82 66v8h7M82 24V9h28v13H82" fill="#f3b1bc"/>'
  };
  let content=missing||!drawings[kind]?'<rect x="34" y="38" width="92" height="78" rx="15" fill="#ece3fb"/><path d="m40 105 23-23 20 14 17-28 20 37"/><circle cx="61" cy="59" r="8" fill="#ffe49a"/><path d="m125 27-9 21" stroke="#b52f60"/>':drawings[kind];
  return '<svg class="art" viewBox="0 0 160 160" fill="none" stroke="#38213d" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="81" cy="146" rx="52" ry="8" fill="#38213d0d" stroke="none"/>'+content+'</svg>';
};
WFK.fox=function() {
  return '<svg class="fox" viewBox="0 0 200 220" fill="none" stroke="#38213d" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="105" cy="209" rx="70" ry="8" fill="#38213d12" stroke="none"/><path d="M129 168q15-54 56-52 2 69-62 84" fill="#ff925c"/><path d="M167 149q9-11 18-12-1-15 0-21-20 0-32 17Z" fill="#fff0d8" stroke="none"/><path d="M63 144q-18 24-12 56h90q6-34-20-54Z" fill="#ff925c"/><ellipse cx="99" cy="177" rx="25" ry="29" fill="#fff0d8" stroke="none"/><path d="M34 98 24 25q-1-12 10-7l41 44q23-12 49 0l42-27q14-7 12 7l-8 58q24 41-13 54c-6 14-18 9-31 10q-31 19-54-2-31 8-39-12-17-10 1-52Z" fill="#ff925c"/><path d="m35 36 8 46 19-18Zm123 17-16 26 25 10Z" fill="#ffe4ca" stroke="none"/><path d="M42 112q13-35 39-23 11 6 18 22 7-23 31-23 24 3 33 27l-5 29q-26 16-37 17-22 22-44 0-21-1-40-23Z" fill="#fff0d8" stroke="none"/><path d="M58 110q10-18 19 0m45 0q10-18 19 0" stroke-width="7"/><ellipse cx="99" cy="120" rx="8" ry="6" fill="#38213d" stroke="none"/><path d="M86 133q13 7 25-1c-2 26-25 26-25 1Z" fill="#ee7087"/><path d="M99 125v10"/><g fill="#ffb1a2" stroke="none"><ellipse cx="54" cy="128" rx="10" ry="7"/><ellipse cx="147" cy="128" rx="10" ry="7"/></g><path d="M49 166q-14-7-20-25m106 27q21-8 22-25" stroke-width="18" stroke="#ff925c"/><path d="M61 201q-7 10-1 12h24m28-12q-7 10-1 12h24" fill="#ff925c"/><path d="m17 99-7-8m174 1 7-8" stroke="#f8c757" stroke-width="7"/></svg>';
};
WFK.logo=function() {
  return '<svg class="brand-mark" viewBox="0 0 42 48" aria-hidden="true"><g stroke="#38213d" stroke-width="2.5"><rect x="3" y="7" width="23" height="34" rx="5" transform="rotate(-13 3 7)" fill="#fff"/><rect x="20" y="6" width="21" height="32" rx="5" transform="rotate(12 20 6)" fill="#fff"/></g><text x="8" y="29" fill="#b52f60" font-size="19" font-weight="900">A</text><path d="M26 17c-10-3-9 12-3 13 3 2 9-1 10-6s-2-9-7-7" fill="#f64d63"/><path d="m26 16 3-5" stroke="#40804d" stroke-width="3"/></svg>';
};
