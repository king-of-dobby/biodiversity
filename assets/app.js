
'use strict';
const $=id=>document.getElementById(id);
const species=[{name:'습지풀',icon:'🌿',r:.23,k:180,area:.65,poll:.09,heat:.04},{name:'풀벌레',icon:'🦗',r:.24,k:130,area:.55,poll:.24,heat:.06},{name:'개구리',icon:'🐸',r:.17,k:85,area:.9,poll:.32,heat:.19},{name:'물새',icon:'🐦',r:.14,k:65,area:.85,poll:.16,heat:.1},{name:'들쥐',icon:'🐁',r:.21,k:75,area:.65,poll:.1,heat:.07}];
const base={area:100,poll:0,heat:0};
const defs=[{id:'area',label:'남아 있는 서식지',min:20,max:100,step:5,unit:'%',help:'면적 감소 → 수용 가능한 개체 수 감소'},{id:'poll',label:'오염 스트레스',min:0,max:100,step:5,unit:'%',help:'가상 강도 · 높을수록 생존·증식에 불리'},{id:'heat',label:'기온 상승',min:0,max:4,step:.5,unit:'℃',help:'기본 환경 대비 상승 · 종별 민감도 차이'}];
const presets={base:{...base},habitat:{...base,area:40},pollution:{...base,poll:70},crisis:{area:40,poll:70,heat:1},restore:{area:80,poll:20,heat:1}};
let step=0,A=[],B=[],history=[],conditions={...base},timer=null,runSeed=42;
let chartMode='h', selectedSpecies=null;
$('controls').innerHTML=defs.map(d=>`<div class="control"><label for="${d.id}">${d.label}<output id="${d.id}Value" for="${d.id}"></output></label><input type="range" id="${d.id}" min="${d.min}" max="${d.max}" step="${d.step}" value="${base[d.id]}"><small>${d.help}</small></div>`).join('');
const roles=['생산자','1차 소비자','2차 소비자','상위 소비자','1차 소비자'];
const descriptions=[
 '습지 생태계의 생산자입니다. 풀벌레와 들쥐의 먹이가 되어 에너지 흐름의 출발점이 됩니다.',
 '습지풀을 먹는 1차 소비자입니다. 개구리와 물새에게 먹이를 제공하며 이 모형에서는 오염에 민감합니다.',
 '풀벌레를 먹는 2차 소비자입니다. 먹이 부족뿐 아니라 오염과 기온 상승의 영향을 비교적 크게 받습니다.',
 '풀벌레와 개구리를 먹는 상위 소비자입니다. 직접적인 환경 변화와 먹이의 감소를 함께 살펴보세요.',
 '습지풀을 먹는 1차 소비자입니다. 같은 먹이를 이용하더라도 종에 따라 환경 변화의 영향은 다를 수 있습니다.'
];
$('speciesLegend').innerHTML=species.map((s,i)=>`<button class="species-card" data-species="${i}" aria-expanded="false" aria-controls="speciesDetail">${BiomeScene.icon(i)}<span><b>${s.name}</b><small>${roles[i]}</small></span></button>`).join('');
function stats(n){const total=n.reduce((a,b)=>a+b,0),rich=n.filter(x=>x>0).length;return{total,rich,h:total?-n.reduce((s,v)=>v?s+v/total*Math.log(v/total):s,0):0};}
function noise(t,i){let x=(Math.imul(runSeed,374761393)^Math.imul(t+1,668265263)^Math.imul(i+1,1274126177))>>>0;x=Math.imul(x^(x>>>13),1274126177)>>>0;return ((x^(x>>>16))>>>0)/4294967296-.5;}
function evolve(n,c,t){return n.map((v,i)=>{if(v===0)return 0;const s=species[i],area=c.area/100,k=s.k*Math.pow(area,s.area);let food=1;if(i===1)food=Math.min(1,n[0]/65);if(i===2)food=Math.min(1,n[1]/50);if(i===3)food=Math.min(1,(n[1]+n[2])/80);if(i===4)food=Math.min(1,n[0]/65);const growth=s.r*(1-v/k),stress=s.poll*c.poll/100+s.heat*c.heat/4+.15*(1-food);const val=v*(1+growth-stress+.035*noise(t,i));return val<1?0:Math.max(1,Math.round(val));});}
function setPhase(n){for(let i=0;i<4;i++)$('phase'+i).classList.toggle('active',i===n);}
function updateConditions(){defs.forEach(d=>{conditions[d.id]=Number($(d.id).value);$(d.id+'Value').textContent=conditions[d.id]+d.unit;});$('conditionLabel').textContent=conditions.area===100&&conditions.poll===0&&conditions.heat===0?'기본 조건':`서식지 ${conditions.area}% · 오염 ${conditions.poll}% · +${conditions.heat}℃`;if(step===0)setPhase(1); updateScenePreview();}
function remember(){history.push({step,a:[...A],b:[...B],sa:stats(A),sb:stats(B)});}
function world(id,n){
  $(id).innerHTML=BiomeScene.scene(id,n,id==='worldA'?base:conditions,step);
  $(id).setAttribute('aria-label',n.map((v,i)=>species[i].name+' '+v+'개체').join(', '));
}
function render(){
  const sa=stats(A),sb=stats(B);
  world('worldA',A);world('worldB',B);
  for(const [id,s] of [['metricsA',sa],['metricsB',sb]])$(id).innerHTML=`<div><strong>${s.rich}<small>종 수</small></strong></div><div><strong>${s.total}<small>전체 개체 수</small></strong></div><div><strong>${s.h.toFixed(2)}<small>다양성 H′</small></strong></div>`;
  $('population').innerHTML=species.map((s,i)=>{const diff=B[i]-A[i];return `<tr><th scope="row">${BiomeScene.icon(i)}${s.name}</th><td>${A[i]}</td><td>${B[i]}</td><td><span class="diff ${diff<0?'negative':diff>0?'positive':''}">${diff>0?'+':''}${diff}</span></td></tr>`;}).join('');
  $('stepLabel').innerHTML=`<b>${String(step).padStart(2,'0')}</b> / 20 단계`;
  $('censusStep').textContent=step+'단계';
  $('progressFill').style.width=step*5+'%';
  document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',step);
  $('next').disabled=step>=20;$('play').disabled=step>=20;
  $('chartSummary').textContent=chartMode==='h'?`${step}단계 H′ · 대조군 ${sa.h.toFixed(3)} / 실험군 ${sb.h.toFixed(3)} · 차이 ${(sb.h-sa.h).toFixed(3)}`:`${step}단계 전체 개체 수 · 대조군 ${sa.total} / 실험군 ${sb.total} · 차이 ${sb.total-sa.total}`;
  $('historyRows').innerHTML=history.map(row=>`<tr><th scope="row">${row.step}</th><td>${row.sa.total}</td><td>${row.sb.total}</td><td>${row.sa.rich}</td><td>${row.sb.rich}</td><td>${row.sa.h.toFixed(3)}</td><td>${row.sb.h.toFixed(3)}</td></tr>`).join('');
  if(selectedSpecies!==null)showSpecies(selectedSpecies,false);
  draw();
}
function draw(){
  const canvas=$('chart'),box=canvas.getBoundingClientRect();if(!box.width)return;
  const dpr=window.devicePixelRatio||1;canvas.width=box.width*dpr;canvas.height=box.height*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  const w=box.width,h=box.height,l=36,r=16,top=18,bottom=34;
  const max=chartMode==='h'?1.7:Math.max(300,Math.ceil(Math.max(...history.flatMap(x=>[x.sa.total,x.sb.total]))/100)*100);
  const x=t=>l+t/20*(w-l-r),y=v=>top+(1-v/max)*(h-top-bottom);
  ctx.font='10px system-ui';ctx.textAlign='right';
  for(let i=0;i<=4;i++){
   const v=chartMode==='h'?i*.4:i*max/4;
   ctx.strokeStyle='#e6eadf';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(l,y(v));ctx.lineTo(w-r,y(v));ctx.stroke();
   ctx.fillStyle='#8a957e';ctx.fillText(chartMode==='h'?v.toFixed(1):Math.round(v),l-9,y(v)+3);
  }
  ctx.setLineDash([]);ctx.textAlign='center';
  for(let t=0;t<=20;t+=5)ctx.fillText(t,x(t),h-17);
  ctx.textAlign='right';ctx.font='8px system-ui';ctx.fillText('단계',w-r,h-2);
  for(const [key,color]of [['sa','#4d8158'],['sb','#d88655']]){
   const grad=ctx.createLinearGradient(0,top,0,h-bottom);grad.addColorStop(0,key==='sa'?'#71986018':'#d8865525');grad.addColorStop(1,'#ffffff00');
   ctx.beginPath();history.forEach((row,i)=>{i?ctx.lineTo(x(row.step),y(row[key][chartMode])):ctx.moveTo(x(row.step),y(row[key][chartMode]));});
   ctx.lineTo(x(step),h-bottom);ctx.lineTo(l,h-bottom);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
   ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.setLineDash(key==='sa'?[5,4]:[]);ctx.beginPath();history.forEach((row,i)=>{i?ctx.lineTo(x(row.step),y(row[key][chartMode])):ctx.moveTo(x(row.step),y(row[key][chartMode]));});ctx.stroke();
   ctx.setLineDash([]);const last=history.at(-1);ctx.beginPath();ctx.arc(x(step),y(last[key][chartMode]),4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fffef9';ctx.lineWidth=2;ctx.stroke();
  }
}
function pause(){if(timer)clearInterval(timer);timer=null;$('play').textContent='▶ 자동 진행';}
function advance(){if(step>=20)return;if(step===0){updateConditions();runSeed=Math.min(9999,Math.max(1,Math.round(Number($('seed').value)||42)));$('seed').value=runSeed;defs.forEach(d=>$(d.id).disabled=true);$('seed').disabled=true;document.querySelectorAll('[data-preset]').forEach(b=>b.disabled=true);}const before=[...B];A=evolve(A,base,step);B=evolve(B,conditions,step);step++;remember();setPhase(step===20?3:2);const losses=B.map((v,i)=>before[i]>0&&v===0?species[i].name:null).filter(Boolean);let j=0;B.forEach((v,i)=>{if(v-before[i]<B[j]-before[j])j=i;});$('eventTitle').textContent=step===20?'실험 완료 · 근거를 모아 토의하세요':`${step}단계 · 함께 확인하기`;$('eventText').textContent=losses.length?`${losses.join(', ')}의 개체 수가 0이 되었습니다. 이전 단계의 추세와 대조군을 비교해 원인을 토의하세요.`:`${species[j].name}: ${before[j]} → ${B[j]}개체. ${conditions.area<100?'서식지 감소는 종별 수용력을 낮춥니다. ':''}${conditions.poll>0?'오염에 대한 종별 민감도가 다르게 설정되어 있습니다. ':''}${conditions.heat>0?'기온 상승의 영향은 종마다 다릅니다. ':''}먹이 생물의 개체 수도 함께 비교하세요.`;$('runLabel').textContent=step===20?'완료 · CSV를 저장하고 다른 조건과 비교하세요':'조건 고정 · 단계별 결과를 관찰하세요';if(step===20)pause();render();}
function reset(){pause();step=0;A=[80,60,45,30,25];B=[...A];history=[];remember();defs.forEach(d=>$(d.id).disabled=false);$('seed').disabled=false;document.querySelectorAll('[data-preset]').forEach(b=>b.disabled=false);$('runLabel').textContent='가설을 적고 실험을 시작하세요';$('eventTitle').textContent='관찰 준비';$('eventText').textContent='두 집단의 종별 개체 수는 같습니다. 조건을 바꾸고 다음 단계의 변화를 예측하세요.';setPhase(0);render();}
defs.forEach(d=>$(d.id).addEventListener('input',()=>{document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('selected'));$('scenarioHint').textContent='직접 설정한 조건입니다. 바꾼 변인과 예상 결과를 탐구 노트에 적어보세요.';updateConditions();}));
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{const p=presets[b.dataset.preset];defs.forEach(d=>$(d.id).value=p[d.id]);document.querySelectorAll('[data-preset]').forEach(x=>x.classList.toggle('selected',x===b));updateConditions();$('scenarioHint').textContent=scenarioHints[b.dataset.preset];}));
$('next').onclick=advance;$('play').onclick=()=>{if(timer){pause();return;}advance();if(step<20){timer=setInterval(advance,1100);$('play').textContent='Ⅱ 일시 정지';}};$('reset').onclick=()=>{if(step&&!confirm('현재 실험 수치를 초기화할까요? 탐구 노트는 유지됩니다. 필요한 경우 먼저 CSV를 저장하세요.'))return;reset();};
function saveFile(name,content,type){const url=URL.createObjectURL(new Blob(['\ufeff',content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='파일을 저장했습니다. 다운로드 폴더를 확인하세요.';}
$('csv').onclick=()=>{const seed=step?runSeed:Math.min(9999,Math.max(1,Math.round(Number($('seed').value)||42)));const head=['실험번호','단계','집단','서식지(%)','오염(%)','기온상승(℃)',...species.map(s=>s.name),'전체개체수','종수','Shannon_H'];let rows=[head];history.forEach(row=>{for(const key of ['a','b']){const c=key==='a'?base:conditions,s=row['s'+key];rows.push([seed,row.step,key==='a'?'대조군':'실험군',c.area,c.poll,c.heat,...row[key],s.total,s.rich,s.h.toFixed(6)]);}});saveFile('생물다양성_실험기록.csv',rows.map(row=>row.join(',')).join('\r\n'),'text/csv;charset=utf-8');};
const fields=['hypothesis','evidence','conclusion'];let storageOK=true;try{const data=JSON.parse(localStorage.getItem('biodiversity-notes-v1')||'{}');fields.forEach(id=>$(id).value=typeof data[id]==='string'?data[id]:'');}catch{storageOK=false;}$('status').textContent=storageOK?'탐구 노트는 이 브라우저에 자동 저장됩니다.':'브라우저 자동 저장을 사용할 수 없습니다. 탐구 노트 저장 버튼을 이용하세요.';
fields.forEach(id=>$(id).addEventListener('input',()=>{try{localStorage.setItem('biodiversity-notes-v1',JSON.stringify(Object.fromEntries(fields.map(k=>[k,$(k).value]))));$('status').textContent='탐구 노트를 브라우저에 저장했습니다.';}catch{$('status').textContent='자동 저장 실패 · 탐구 노트 저장 버튼으로 파일을 저장하세요.';}}));
$('download').onclick=()=>saveFile('생물다양성_탐구노트.txt',`생물다양성 탐구실\n${step} / 20 단계 · 실험 번호 ${step?runSeed:$('seed').value}\n조건: 서식지 ${conditions.area}%, 오염 ${conditions.poll}%, 기온 +${conditions.heat}℃\n${$('chartSummary').textContent}\n\n`+fields.map((id,i)=>['질문과 가설','관찰과 근거','해석과 보전 제안'][i]+'\n'+$(id).value).join('\n\n'),'text/plain;charset=utf-8');$('print').onclick=()=>{pause();window.print();};window.addEventListener('resize',draw);
const scenarioHints={
 base:'대조군과 실험군이 같은 환경입니다. 먼저 기준 실험을 해보세요.',
 habitat:'서식지만 40%로 줄였습니다. 수용력의 변화는 어떤 종에 더 크게 작용할까요?',
 pollution:'오염 강도만 70%로 높였습니다. 종마다 민감도가 같은지 관찰하세요.',
 crisis:'서식지 감소·오염·기온 상승이 함께 일어납니다. 보전 비교 전에 CSV를 저장해 두세요.',
 restore:'복합 위기 실험을 기록한 후 이 조건과 비교하세요. 서식지와 오염이 함께 달라지므로 개별 원인의 효과를 분리할 수 없습니다.'
};
function updateScenePreview(){
  if(A.length){world('worldA',A);world('worldB',B);}
  const stress=(100-conditions.area)/100+conditions.poll/100+conditions.heat/4;
  $('environmentBadge').textContent=stress>1.2?'● 높은 환경 스트레스':stress>0?'● 환경 변화 관찰 중':'● 기본 환경';
}
function showSpecies(i,focus=true){
  selectedSpecies=i;
  document.querySelectorAll('.species-card').forEach((b,j)=>{b.classList.toggle('selected',i===j);b.setAttribute('aria-expanded',String(i===j));});
  $('speciesDetail').hidden=false;
  $('speciesDetail').innerHTML=`<strong>${species[i].name} · ${roles[i]}</strong><p>${descriptions[i]}</p><p>현재 ${step}단계 — 대조군 ${A[i]}개체 / 실험군 ${B[i]}개체. 같은 조건의 기준 실험과 비교해 해석하세요.</p><button id="closeSpecies" aria-label="생물 설명 닫기">×</button>`;
  $('closeSpecies').onclick=()=>{selectedSpecies=null;$('speciesDetail').hidden=true;document.querySelectorAll('.species-card').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-expanded','false');});document.querySelector(`[data-species="${i}"]`).focus();};
  if(focus)$('speciesDetail').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
$('speciesLegend').addEventListener('click',e=>{const button=e.target.closest('[data-species]');if(button)showSpecies(Number(button.dataset.species));});
for(const id of ['worldA','worldB'])$(id).addEventListener('click',e=>{const target=e.target.closest('[data-species]');if(target)showSpecies(Number(target.dataset.species));});
for(const [id,focus]of [['compareView',false],['focusView',true]])$(id).onclick=()=>{
 $('ecosystems').classList.toggle('focus-mode',focus);
 for(const key of ['compareView','focusView']){const selected=key===id;$(key).classList.toggle('selected',selected);$(key).setAttribute('aria-pressed',String(selected));}
};
for(const [id,mode]of [['diversityChart','h'],['totalChart','total']])$(id).onclick=()=>{
 chartMode=mode;
 for(const key of ['diversityChart','totalChart']){const selected=key===id;$(key).classList.toggle('selected',selected);$(key).setAttribute('aria-pressed',String(selected));}
 $('chartUnit').textContent=mode==='h'?'SHANNON H′':'INDIVIDUALS';
 $('chart').setAttribute('aria-label',mode==='h'?'단계별 Shannon 다양성 지수 그래프':'단계별 전체 개체 수 그래프');
 $('chartTooltip').hidden=true;render();
};
$('chart').addEventListener('pointermove',e=>{
 const box=$('chart').getBoundingClientRect();const t=Math.max(0,Math.min(step,Math.round((e.clientX-box.left-36)/(box.width-52)*20)));
 const row=history[t];if(!row)return;
 const value=s=>chartMode==='h'?s.h.toFixed(3):s.total+'개체';
 $('chartTooltip').textContent=`${t}단계 · A ${value(row.sa)} / B ${value(row.sb)}`;$('chartTooltip').hidden=false;
});
$('chart').addEventListener('pointerleave',()=>$('chartTooltip').hidden=true);
$('capture').onclick=()=>{
 pause();const sa=stats(A),sb=stats(B);
 const entry=`[${step}단계 · 실험 ${step?runSeed:$('seed').value}] 서식지 ${conditions.area}%, 오염 ${conditions.poll}%, 기온 +${conditions.heat}℃\nA: ${sa.total}개체 / ${sa.rich}종 / H′ ${sa.h.toFixed(3)}\nB: ${sb.total}개체 / ${sb.rich}종 / H′ ${sb.h.toFixed(3)}\n${species.map((s,i)=>s.name+' A '+A[i]+' / B '+B[i]).join(' · ')}`;
 $('evidence').value+=($('evidence').value?'\n\n':'')+entry;
 $('evidence').dispatchEvent(new Event('input'));
 $('capture').textContent='기록 완료 ✓';setTimeout(()=>$('capture').textContent='관찰 기록 +',1600);
};
if('IntersectionObserver' in window){
 const sections=['lab','journal','guide'];const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('.masthead nav a').forEach(a=>a.classList.toggle('nav-active',a.hash==='#'+entry.target.id));});},{rootMargin:'-15% 0px -65% 0px'});
 sections.forEach(id=>observer.observe($(id)));
}
updateConditions();reset();
