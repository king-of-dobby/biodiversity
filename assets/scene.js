/* Hand-drawn vector habitat: symbolic illustration, not a spatial population model. */
'use strict';
window.BiomeScene = (() => {
  const drawings = [
    '<path d="M25 43Q24 27 27 10" fill="none" stroke="#4f7340" stroke-width="2"/><path d="M25 32Q8 33 7 18Q22 17 25 32M26 24Q42 25 44 9Q28 10 26 24M27 15Q15 15 17 3Q28 3 27 15" fill="#88ab5d"/><path d="M25 34Q35 29 43 34Q34 41 25 39" fill="#5f8b4d"/>',
    '<path d="M19 28L9 38M29 28l12 9M18 24L8 16M30 24l12-9" stroke="#6c8144" stroke-width="2" fill="none"/><ellipse cx="24" cy="24" rx="12" ry="7" fill="#a4b66c"/><ellipse cx="25" cy="23" rx="6" ry="5" fill="#739452"/><circle cx="35" cy="21" r="5" fill="#a9bd73"/><circle cx="37" cy="19" r="1.2" fill="#284d37"/><path d="M36 16L39 9M34 16L32 10" stroke="#6b8944" fill="none"/>',
    '<ellipse cx="25" cy="33" rx="17" ry="5" fill="#426c4a" opacity=".15"/><path d="M12 30Q6 21 17 21L33 21Q44 23 38 32" fill="#6e9954"/><ellipse cx="25" cy="26" rx="13" ry="9" fill="#8eaf64"/><circle cx="18" cy="17" r="5" fill="#a4c079"/><circle cx="32" cy="17" r="5" fill="#a4c079"/><circle cx="19" cy="17" r="2" fill="#243d31"/><circle cx="31" cy="17" r="2" fill="#243d31"/><path d="M21 25Q25 28 29 25" stroke="#4f7541" fill="none"/><path d="M14 31L8 35M36 31l6 4" stroke="#6b904f" stroke-width="4" stroke-linecap="round"/>',
    '<path d="M22 32L21 43M28 32l2 11" stroke="#b59c6e" stroke-width="1.5"/><path d="M12 24Q5 19 3 13L18 19Q29 14 34 23Q32 34 22 33Q16 32 12 24" fill="#e8e7cf"/><path d="M17 22Q22 16 28 23Q25 30 18 28" fill="#93aaa0"/><path d="M30 23Q31 16 35 11" fill="none" stroke="#e8e7cf" stroke-width="6" stroke-linecap="round"/><circle cx="36" cy="10" r="5" fill="#f4f0db"/><path d="M40 10L48 13L40 14" fill="#d4a65b"/><circle cx="37" cy="9" r="1" fill="#315044"/>',
    '<path d="M12 32Q-1 28 3 19" stroke="#a59e87" stroke-width="2" fill="none"/><ellipse cx="24" cy="27" rx="14" ry="10" fill="#b1aa91"/><path d="M32 22Q39 20 45 29Q38 36 31 32" fill="#bfb69b"/><circle cx="32" cy="20" r="6" fill="#c8bba1"/><circle cx="32" cy="20" r="3" fill="#e4cfb2"/><circle cx="39" cy="26" r="1.4" fill="#3c4d3c"/><circle cx="45" cy="29" r="1.7" fill="#686f55"/><path d="M18 35L16 38M30 35l3 3" stroke="#8f8c74" stroke-width="2"/>'
  ];
  function icon(i, className = '') {
    return `<svg class="${className}" viewBox="0 0 50 50" aria-hidden="true">${drawings[i]}</svg>`;
  }
  function scene(id, counts, condition, step) {
    const p = id + '-', pollution = condition.poll / 100, loss = 1 - condition.area / 100, heat = condition.heat / 4;
    const tree = (x,y,s,tone='#477855') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-2 0L-2-42H3V0" fill="#6b7150"/><path d="M0-96Q-36-67-23-49Q-45-23-8-22Q24-12 28-36Q44-60 12-75Q13-95 0-96" fill="${tone}"/><path d="M0-72L0-27M0-50L-13-60M0-42L13-53" fill="none" stroke="#a0b480" stroke-width="1" opacity=".3"/></g>`;
    let trees='';
    for(let j=0;j<13;j++) trees+=tree(12+j*40,166+(j%3)*9,.6+(j%4)*.12,j%2?'#4d7d59':'#5c8860');
    const sprites=counts.map((n,i)=>Array.from({length:Math.min(30,Math.round(n/10))},(_,j)=>{
      const x=25+(j*79+i*61)%450;
      let y=180+(j*31+i*17)%110;
      if(i===0)y=190+(j*37)%100;
      if(i===1)y=166+(j*43)%95;
      if(i===2)y=244+(j*23)%45;
      if(i===3)y=197+(j*29)%80;
      if(i===4)y=181+(j*37)%41;
      const scale=i===0?.58:i===1?.48:.65;
      return `<g data-species="${i}" transform="translate(${x} ${y}) scale(${scale})"><g class="${i===0?'scene-grass':i===1?'scene-insect':i===3?'scene-bird':''}" style="animation-delay:-${j%5}s">${drawings[i]}</g></g>`;
    }).join('')).join('');
    const stumps=Array.from({length:8},(_,i)=>`<g transform="translate(${315+(i*41)%170} ${175+(i*23)%95})"><path d="M-5 0L-4-11L4-12L6 0" fill="#a18c6b"/><ellipse cy="-11" rx="4" ry="2" fill="#c9b28b"/></g>`).join('');
    const svg=`<svg viewBox="0 0 520 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${p}sky" x2="0" y2="1"><stop stop-color="${heat>.4?'#e6ccad':'#c6ddd4'}"/><stop offset="1" stop-color="#eff1cc"/></linearGradient><linearGradient id="${p}water" x2=".7" y2="1"><stop stop-color="${pollution>.3?'#9aa99b':'#8eb9ad'}"/><stop offset="1" stop-color="${pollution>.3?'#89947d':'#508b7d'}"/></linearGradient><linearGradient id="${p}ground" x2="0" y2="1"><stop stop-color="#a8bf80"/><stop offset="1" stop-color="#527654"/></linearGradient><radialGradient id="${p}light"><stop stop-color="#fffbd3" stop-opacity=".65"/><stop offset="1" stop-color="#fffbd3" stop-opacity="0"/></radialGradient><clipPath id="${p}clearing"><rect x="${520-loss*410}" y="100" width="520" height="240"/></clipPath></defs>
    <rect width="520" height="340" fill="url(#${p}sky)"/><circle cx="390" cy="63" r="29" fill="#f9f4cc"/><circle cx="390" cy="63" r="90" fill="url(#${p}light)"/>
    <g fill="#fffef0" opacity=".4" class="scene-cloud"><ellipse cx="105" cy="51" rx="57" ry="7"/><ellipse cx="455" cy="99" rx="70" ry="5"/></g>
    <path d="M-20 155Q37 86 103 123Q164 75 248 132Q315 89 389 124Q458 94 550 149V230H-20Z" fill="#a4bca4" opacity=".7"/><path d="M-10 169Q80 113 165 159Q253 103 330 160Q453 116 530 156V240H-10Z" fill="#7fa185"/>
    <path d="M0 183Q155 145 280 179Q394 143 520 178V340H0Z" fill="url(#${p}ground)"/>${trees}
    <path d="M0 253Q109 206 212 229Q278 249 360 213Q435 184 520 222V340H0Z" fill="#97b385"/>
    <path d="M-20 298Q91 212 228 250Q298 269 366 234Q441 211 546 257L546 350H-20Z" fill="#c2d2a2"/>
    <path d="M-10 310Q105 228 218 265Q294 289 376 251Q449 234 530 272V350H-10Z" fill="url(#${p}water)"/>
    <g fill="none" stroke="#d9e8c5" stroke-width="1.2" opacity=".5"><path d="M56 295q23-7 48-2M195 292q40 8 81 4M390 279q32-9 73 0M113 321q40-5 74 1"/><ellipse class="scene-ripple" cx="325" cy="307" rx="30" ry="5"/><ellipse class="scene-ripple" style="animation-delay:-2s" cx="80" cy="302" rx="25" ry="4"/></g>
    <g clip-path="url(#${p}clearing)"><path d="M0 156Q180 140 270 171Q401 131 520 166V340H0Z" fill="#b5ac86" opacity=".85"/><path d="M-10 310Q105 228 218 265Q294 289 376 251Q449 234 530 272V350H-10Z" fill="url(#${p}water)"/>${stumps}</g>
    <path d="M-10 310Q105 228 218 265Q294 289 376 251Q449 234 530 272V350H-10Z" fill="#b6a071" opacity="${pollution*.32}"/>
    <g fill="none" stroke="#456c48" stroke-width="2.5" class="scene-grass"><path d="M30 335Q28 304 17 295M31 335Q38 299 48 289M31 335V290M486 336Q476 304 463 303M486 336Q493 296 500 295"/></g><g fill="#655b3f"><rect x="28" y="283" width="5" height="17" rx="2"/><rect x="45" y="283" width="4" height="14" rx="2"/><rect x="498" y="287" width="4" height="13" rx="2"/></g>
    ${sprites}<g stroke="#426c58" fill="none" stroke-width="1.3" class="scene-bird"><path d="M160 80q6-7 12 0q6-7 12 0M210 65q4-5 8 0q4-5 8 0"/></g>
    <g fill="#e8f4af" class="scene-glow"><circle cx="63" cy="197" r="1.5"/><circle cx="445" cy="187" r="1.5"/><circle cx="293" cy="240" r="1"/></g><rect width="520" height="340" fill="#dc9c55" opacity="${heat*.09}"/>
    </svg><span class="scene-counter">${counts.reduce((a,b)=>a+b,0)} 개체 · ${step}단계</span>`;
    return svg;
  }
  return {icon,scene};
})();
