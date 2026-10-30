const $=id=>document.getElementById(id);
const ORDER=[18,9,4,22,11,2,24,15,7,20,13,5,1,12,19,23,10,8,21,14,6,3,16,17];
const REDS=new Set([1,4,6,7,10,11,13,16,18,19,21,24]);
const col=n=>REDS.has(n)?'#c8102e':'#141414';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Number(n).toLocaleString('id-ID');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const HID=uid();
const isAdm=()=>!!window.ADMIN_PAGE||(window.HASH_ADMIN!==false&&location.hash==='#admin');
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('s');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('s'),2600)}
async function H(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('rr:'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return'p:'+btoa(unescape(encodeURIComponent(s)))}}

/* ---------- Penyimpanan: db bersama, atau lokal jika tidak tersedia ---------- */
function apiDB(){
  if(!window.API_BASE||/NAMA|GANTI/.test(window.API_BASE)){document.body.innerHTML='<p style="padding:24px">Isi <b>config.js</b> dengan alamat backend (API_BASE), lalu muat ulang halaman.</p>';throw new Error('config')}
  const base=String(window.API_BASE).replace(/\/$/,''),cl=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x)),cache={},subs=[];
  let cursor=0,loaded=false,off=0,role='x',rid=null,timer=null,busy=false,again=false,fastMs=0,reset=false,full=false;
  const st=k=>{try{return sessionStorage.getItem(k)||localStorage.getItem(k)}catch(e){return null}};
  const tok=()=>window.ADMIN_PAGE?st('rratk'):st('rrtk');
  const fire=()=>subs.slice().forEach(f=>f());
  const call=async(path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,token:tok()})});return r.json()};
  function plan(){clearTimeout(timer);const g=cache['game/round'],now=Date.now()+off;let d=document.hidden?15000:(fastMs||(window.ADMIN_PAGE?3000:(window.POLL_MS||4000)));
    if(g&&!document.hidden)[g.next,g.rev,(g.at||0)+(g.ms||0)].forEach(t=>{if(t){const x=t-now+350;if(x>0&&x<d)d=x}});timer=setTimeout(sync,Math.max(400,d))}
  async function sync(){
    clearTimeout(timer);if(busy){again=true;return}busy=true;
    try{const since=full?0:cursor;full=false;const r=await call('/api/sync',{since});if(!r.ok)throw new Error('sync');
      if(r.authfail){(window.ADMIN_PAGE?['rratk']:['rrtk','rrme']).forEach(k=>{try{sessionStorage.removeItem(k);localStorage.removeItem(k)}catch(e){}});reset=true;cursor=0;again=true}
      if(reset||!since){if(reset){Object.keys(cache).forEach(k=>delete cache[k]);reset=false}}
      role=r.role;rid=r.id;off=r.now-Date.now();r.del.forEach(p=>delete cache[p]);Object.assign(cache,r.docs);if(!r.authfail)cursor=r.cursor;loaded=true;fire()}
    catch(e){}finally{busy=false;if(again){again=false;sync()}else plan()}}
  const kick=()=>sync();
  const op=async(m)=>{const r=await call('/api/op',m);if(!r.ok){full=true;kick();throw new Error(r.e||'Ditolak server')}kick();return r};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)kick()});
  setTimeout(sync,0);
  const sn=(p,d)=>({id:p.split('/').pop(),exists:d!==undefined,data:()=>cl(d)});
  const doc=p=>({async get(){return sn(p,cache[p])},
    async set(d){cache[p]=cl(d);fire();await op({t:'set',p,d})},
    async update(d){if(cache[p]===undefined)throw new Error('x');cache[p]=Object.assign({},cache[p],cl(d));fire();await op({t:'upd',p,d})},
    async delete(){delete cache[p];fire();await op({t:'del',p})},
    async acquire(){return{acquired:false}},
    onSnapshot(cb){let o;const f=()=>{if(!loaded)return;const s=JSON.stringify(cache[p]);if(s!==o){o=s;cb(sn(p,cl(cache[p])))}};subs.push(f);setTimeout(f,0);return()=>{}}});
  const col=p=>({doc:id=>doc(p+'/'+id),onSnapshot(cb){let o;const n=p.split('/').length+1,f=()=>{if(!loaded)return;const ks=Object.keys(cache).filter(k=>k.startsWith(p+'/')&&k.split('/').length===n).sort(),s=JSON.stringify(ks.map(k=>cache[k]));if(s!==o){o=s;cb({docs:ks.map(k=>sn(k,cl(cache[k])))})}};subs.push(f);setTimeout(f,0);return()=>{}}});
  return{doc,collection:col,serverNow:()=>Date.now()+off,cmd:t=>op({t}),op:(t,d)=>op({t,...d}),reauth:()=>{reset=true;cursor=0;loaded=false;kick()},role:()=>role,rid:()=>rid,fast:on=>{fastMs=on?2000:0;plan()}}}

const DEF={title:'Royal Roulette',sub:'Pasang chip, putar roda, dan lihat siapa yang beruntung.',acc:'#f5c542',bg1:'#3b0a1e',bg2:'#0b0612',felt:'#0a5c36',pn:23,pc:1,pd:2,reg:true,font:'klasik',rad:18,wsz:340,lay:'side',pat:'1',sec:30,rd:3,ms:6000,chips:[10,50,100,500],start:1000,foot:'Permainan hiburan dengan chip virtual.',appr:false,invite:'',maxp:0,minb:0,maxb:0,maint:false,maintMsg:'Permainan sedang ditutup sementara untuk pemeliharaan.',lgTitle:'Akun pemain',lgIntro:'',lgIn:'Masuk',lgUp:'Daftar',lgUser:'Username',lgPass:'Password',lgName:'Nama lengkap',lgPhone:'Nomor telepon',lgEmail:'Email',lgContactOn:true,lgContact:'Kontak atau HP (opsional)',lgBtnIn:'Masuk',lgBtnUp:'Buat akun',lgTerms:'',lgHelp:'Lupa password? Minta admin untuk membuatkan yang baru.',lgWelcome:'Akun dibuat. Selamat bermain!',lgSt:'box',logo:'🎰',showSub:true,heroOn:false,heroT:'',heroX:'',bgm:'grad',bgimg:'',cardSt:'glass',btnSt:'round',chipSt:'gold',w3:true,fxOn:true,fs:100,links:'',css:'',lvOn:true,lvBase:100,lvPow:1.6,lvMax:100,lvFlat:10,lvChip:10,lvRamp:300,lvTw:20000,lvBonus:25,lvTitles:'1|Pemula\n5|Perunggu\n10|Perak\n20|Emas\n35|Platinum\n50|Berlian\n75|Legenda'};
let D,SYNC=false,CF={...DEF},APW='',PL=[],RD={id:0,n:0,h:[],ms:6000};
let me=null,act=null,chip=10,spinning=false,adm=false,tab=(window.ADMIN_TAB===undefined?5:window.ADMIN_TAB),rot=0,mode='in',lastPw=null,delId=null,rsArm=false,left=30,phase='',rvId=0,W3on=false,W3ok=false,closed=false,retry=0,seen=-1,cfgOk=false,plOk=false,akey='',creating=false;
const P=id=>PL.find(p=>p.id===id);
const SEC=()=>Math.max(5,+CF.sec||30);
const Q={};
function W(path,data,full){const r=D.doc(path);Q[path]=(Q[path]||Promise.resolve()).then(()=>full?r.set(data):r.update(data)).catch(e=>{console.error(e);toast('Gagal menyimpan. Coba lagi.')});return Q[path]}
function wp(p,patch){Object.assign(p,patch);return W('players/'+p.id,patch)}
const wc=()=>W('app/cfg',{cfg:CF,pw:APW},true);

/* ---------- Tampilan ---------- */
const FONTS={klasik:["'Bodoni Moda',Georgia,serif","Figtree,system-ui,sans-serif"],neon:["Orbitron,system-ui,sans-serif","Poppins,system-ui,sans-serif"],elegan:["'Playfair Display',Georgia,serif","Poppins,system-ui,sans-serif"]};
function theme(){lvCss();const r=document.documentElement.style,c=CF,f=FONTS[c.font]||FONTS.klasik,ad=isAdm();
  ['acc','bg1','bg2','felt'].forEach(k=>r.setProperty('--'+k,c[k]));r.setProperty('--fd',f[0]);r.setProperty('--fb',f[1]);r.setProperty('--rad',(+c.rad||0)+'px');r.setProperty('--wsz',Math.max(220,+c.wsz||340)+'px');
  r.fontSize=ad?'':Math.min(125,Math.max(85,+c.fs||100))+'%';r.setProperty('--bgimg',c.bgimg&&/^https?:/.test(c.bgimg)?'url("'+String(c.bgimg).replace(/["\\]/g,'')+'")':'none');
  W3on=W3ok&&c.w3!==false;$('w3d').hidden=!W3on;$('wheel').hidden=W3on;document.querySelector('.wheelbox').classList.toggle('is3d',W3on);
  document.body.className='pat'+c.pat+(ad?' isadm admpage':' card-'+(c.cardSt||'glass')+' btn-'+(c.btnSt||'round')+' chip-'+(c.chipSt||'gold')+' bg-'+(c.bgm||'grad'));
  const nb=$('notice'),nt=c.maint?(c.maintMsg||'Permainan sedang ditutup sementara.'):c.notice;nb.hidden=!nt;nb.textContent=nt||'';document.querySelector('main').className=c.lay;
  const lg=c.logo||'';$('logo').innerHTML=/^https?:/.test(lg)?'<img class="lg" alt="" src="'+esc(lg)+'">':esc(lg?lg+' ':'');
  $('ttl').textContent=c.title;$('sub').textContent=c.sub;$('sub').hidden=c.showSub===false;
  const ln=String(c.links||'').split('\n').map(x=>x.split('|')).filter(x=>x[0].trim()&&/^https?:/.test((x[1]||'').trim())).map(x=>'<a href="'+esc(x[1].trim())+'" target="_blank" rel="noopener">'+esc(x[0].trim())+'</a>').join(' &middot; ');
  $('foot').innerHTML=esc(c.foot||'')+(ln?'<br>'+ln:'');
  const hr=$('hero');hr.hidden=!(c.heroOn&&(c.heroT||c.heroX));hr.innerHTML='<b>'+esc(c.heroT||'')+'</b>'+esc(c.heroX||'');
  let st=$('ccss');if(!st){st=document.createElement('style');st.id='ccss';document.head.appendChild(st)}st.textContent=ad?'':String(c.css||'');
  document.title=c.title;drawWheel()}
const shade=(h,p)=>{const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v*(1+p))));return'rgb('+f(n>>16)+','+f(n>>8&255)+','+f(n&255)+')'};
function drawWheel(){if(W3on)W3.setAccent(CF.acc);const x=$('wheel').getContext('2d'),C=180,n=ORDER.length,seg=2*Math.PI/n,A=CF.acc;x.clearRect(0,0,360,360);
  let g=x.createRadialGradient(C,C,150,C,C,178);g.addColorStop(0,'#5a3418');g.addColorStop(.55,'#2b140a');g.addColorStop(1,'#120804');x.beginPath();x.arc(C,C,178,0,7);x.fillStyle=g;x.fill();
  g=x.createRadialGradient(C,C,128,C,C,160);g.addColorStop(0,'#0c0910');g.addColorStop(1,'#2a232f');x.beginPath();x.arc(C,C,158,0,7);x.fillStyle=g;x.fill();
  ORDER.forEach((v,i)=>{const a=-Math.PI/2+i*seg,gg=x.createRadialGradient(C,C,40,C,C,128),b=col(v);gg.addColorStop(0,shade(b,-.4));gg.addColorStop(1,b);x.beginPath();x.moveTo(C,C);x.arc(C,C,128,a,a+seg);x.closePath();x.fillStyle=gg;x.fill();
    x.save();x.translate(C,C);x.rotate(a+seg/2);x.fillStyle='#f6e7b0';x.font='bold 13px Figtree,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(v,104,1);x.restore()});
  x.strokeStyle=A;x.lineWidth=2;ORDER.forEach((v,i)=>{const a=-Math.PI/2+i*seg;x.beginPath();x.moveTo(C+46*Math.cos(a),C+46*Math.sin(a));x.lineTo(C+128*Math.cos(a),C+128*Math.sin(a));x.stroke()});
  x.beginPath();x.arc(C,C,128,0,7);x.lineWidth=4;x.stroke();x.beginPath();x.arc(C,C,160,0,7);x.lineWidth=5;x.stroke();
  g=x.createRadialGradient(C-10,C-10,4,C,C,52);g.addColorStop(0,'#fff');g.addColorStop(.35,A);g.addColorStop(1,'#2a1a05');x.beginPath();x.arc(C,C,46,0,7);x.fillStyle=g;x.fill();
  [0,1,2,3].forEach(k=>{const a=k*Math.PI/2+Math.PI/4,px=C+40*Math.cos(a),py=C+40*Math.sin(a);x.beginPath();x.moveTo(C,C);x.lineTo(px,py);x.lineWidth=5;x.strokeStyle='#e9d9a8';x.stroke();x.beginPath();x.arc(px,py,5,0,7);x.fillStyle=A;x.fill()});
  x.beginPath();x.arc(C,C,12,0,7);x.fillStyle='#fff';x.fill()}
const resHTML=n=>`<b style="background:${col(n)};box-shadow:0 0 30px ${col(n)}">${n}</b><div class="note">${(REDS.has(n)?'Merah':'Hitam')+', '+(n%2?'ganjil':'genap')}</div>`;

function balView(){const p=P(act),b=$('bal');
  if(!p){b.className='out';b.innerHTML='<a class="btn" href="login.html">Masuk</a>'+(CF.reg?'<a class="btn gold" href="daftar.html">Daftar</a>':'');return}b.className='';
  const t=(p.bets||[]).reduce((s,x)=>s+x.a,0);
  b.innerHTML=`<span class="bn"><i class="av">${esc((p.name[0]||'?').toUpperCase())}</i>${esc(p.name)}</span>${lvBadge(p)}<span class="bv">${fmt(p.chips)}<small> chip</small></span>${t?`<span class="bt">Sedang dipasang: ${fmt(t)}</span>`:''}`}
const LGK=['lgName','lgPhone','lgEmail','lgTitle','lgIn','lgUp','lgUser','lgPass','lgContact','lgBtnIn','lgBtnUp','lgHelp','lgIntro','lgTerms','lgContactOn','lgSt'];
const LGS=()=>CF.lgSt==='gold'?'goldb':CF.lgSt==='plain'?'plainb':'';
function acctHTML(up,pv){const R=k=>esc(CF[k]||DEF[k]||''),O=k=>esc(CF[k]||''),d='disabled',I=(id,type,ph,ac,ex)=>`<input type="${type}" ${pv?d:`id="${id}" autocomplete="${ac}" ${ex||''}`} placeholder="${ph}" aria-label="${ph}">`;
  return`<div class="acct ${LGS()}">${CF.lgIntro?`<p class="note" style="width:100%;opacity:.9;margin:0 0 8px">${O('lgIntro')}</p>`:''}<div class="tabs"><button class="${up?'':'on'}" ${pv?d:`onclick="mode='in';akey='';acctView()"`}>${R('lgIn')}</button>${CF.reg?`<button class="${up?'on':''}" ${pv?d:`onclick="mode='up';akey='';acctView()"`}>${R('lgUp')}</button>`:''}</div><div class="fld">${up?I('an','text',R('lgName'),'name','maxlength="40"'):''}${I('au','text',up?R('lgUser'):R('lgUser')+' atau email','username','maxlength="40" autocapitalize="none"')}${up?I('aph','tel',R('lgPhone'),'tel')+I('aem','email',R('lgEmail'),'email'):''}${I('ap','password',R('lgPass'),up?'new-password':'current-password',`onkeydown="if(event.key==='Enter')acctGo()"`)}</div>${up&&CF.lgTerms?`<p class="note" style="width:100%">${O('lgTerms')}</p>`:''}<button class="gold" style="width:100%" ${pv?d:'onclick="acctGo()"'}>${R(up?'lgBtnUp':'lgBtnIn')}</button>${!up?`<div class="lnk"><button class="link" ${pv?d:'onclick="forgotView()"'}>Lupa password?</button></div>`:''}${!up&&CF.lgHelp?`<p class="note">${O('lgHelp')}</p>`:''}</div>`}
function acctView(){const m=P(me),A=$('acct'),k=m?'m'+m.id+m.name+(m.user||'')+CF.lgTitle+CF.lgSt:'o'+mode+CF.reg+LGK.map(x=>CF[x]).join('|');if(k===akey)return;akey=k;if(!CF.reg)mode='in';$('acctTitle').textContent=m?'Profil saya':(CF.lgTitle||DEF.lgTitle);
  if(m){A.innerHTML=`<div class="acct ${LGS()}"><div class="pfs"><i class="av big">${esc((m.name[0]||'?').toUpperCase())}</i><div style="min-width:0;flex:1"><b>${esc(m.name)}</b><small style="display:block;opacity:.7">@${esc(m.user||m.name)}</small></div></div><div class="row" style="width:100%;margin:8px 0 0"><button class="gold" style="flex:1" onclick="profileView()">Profil</button><button onclick="logout()">Keluar</button></div></div>`;return}
  A.innerHTML=`<div class="acct ${LGS()}">${CF.lgIntro?`<p class="note" style="width:100%;opacity:.9;margin:0 0 8px">${esc(CF.lgIntro)}</p>`:''}<p class="note" style="width:100%;opacity:.9;margin:0 0 10px">Masuk atau daftar untuk memasang taruhan dan menyimpan chip Anda.</p><div class="row" style="width:100%;margin:0"><a class="btn gold" href="login.html" style="flex:1">${esc(CF.lgIn||DEF.lgIn)}</a>${CF.reg?`<a class="btn" href="daftar.html" style="flex:1">${esc(CF.lgUp||DEF.lgUp)}</a>`:''}</div><div class="lnk"><a class="link" href="lupa.html">Lupa password?</a></div></div>`}
function renderPlayers(){balView();
  const vis=PL.filter(p=>me?p.id===me:!p.ph);$('plCard').hidden=!!me||!vis.length;
  $('players').innerHTML=vis.length?vis.map(p=>{const b=(p.bets||[]).reduce((s,x)=>s+x.a,0);
    return`<button class="pl ${p.id===act?'on':''}" onclick="pick('${p.id}')"><span class="nm"><i class="av">${esc((p.name[0]||'?').toUpperCase())}</i><span>${p.ph?'🔒 ':''}${esc(p.name)}<small>${b?'Taruhan: '+fmt(b):'Ketuk untuk memilih'}</small></span></span><span class="c">${fmt(p.chips)} chip</span></button>`}).join(''):'<p class="note">Masuk atau daftar akun untuk mulai bermain.</p>';
  $('chipsel').innerHTML=CF.chips.map(v=>`<button class="chipb ${v===chip?'on':''}" onclick="chip=${v};renderPlayers()">${v}</button>`).join('')}
function renderTable(){const mine=(P(act)||{}).bets||[],tot=k=>mine.filter(b=>b.k===k).reduce((s,b)=>s+b.a,0),bd=k=>tot(k)?`<i>${fmt(tot(k))}</i>`:'';
  let h='';
  for(let r=0;r<8;r++)for(let c=1;c<=3;c++){const n=r*3+c;h+=`<button class="cell ${REDS.has(n)?'r':'k'}" onclick="bet('n${n}')">${n}${bd('n'+n)}</button>`}
  $('nums').innerHTML=h;
  const o=[['d1','1–8'],['d2','9–16'],['d3','17–24'],['low','1–12'],['even','Genap'],['red','Merah'],['black','Hitam'],['odd','Ganjil'],['high','13–24']];
  $('outs').innerHTML=o.map(([k,t])=>`<button class="cell" onclick="bet('${k}')">${t}${bd(k)}</button>`).join('')}
function renderHist(){const h=hv(),cl=n=>(REDS.has(n)?'Merah':'Hitam')+', '+(n%2?'ganjil':'genap');
  $('hist').innerHTML=h.slice(0,30).map(n=>`<span style="background:${col(n)}">${n}</span>`).join('')||'<span class="note" style="width:auto">Belum ada putaran.</span>';
  const r=h.filter(x=>REDS.has(x)).length,z=0;$('hstat').textContent=h.length?`${h.length} putaran terakhir: merah ${r}, hitam ${h.length-r-z}.`:'';
  $('hrows').innerHTML=h.slice(0,30).map((n,i)=>`<div class="hr"><i style="background:${col(n)}">${n}</i><span>${cl(n)}</span><small>Putaran ${Math.max(0,rvId-i)}</small></div>`).join('');
  $('log').innerHTML=((P(act)||{}).log||[]).map(l=>`<li class="${l.d>=0?'win':'lose'}">${esc(l.t)}</li>`).join('')||'<li class="note">Belum ada riwayat.</li>'}
function cdView(){$('cdt').textContent=!cfgOk?'Menghubungkan…':spinning?(phase==='wait'?'Menunggu hasil…':'Roda berputar…'):closed?'Taruhan ditutup. Menunggu roda…':CF.paused?'Putaran dijeda admin':'Taruhan ditutup dalam '+left+' dtk';$('cdb').style.width=(spinning||closed||!cfgOk?0:100*left/SEC())+'%'}
function render(){chatView();cdView();acctView();renderPlayers();renderTable();renderHist();const p=P(act);const sh=spinning||closed||!!CF.maint;$('rep').disabled=sh||!(p&&p.last&&p.last.length);$('clr').disabled=sh;document.querySelector('.felt').classList.toggle('shut',sh);$('dock').classList.toggle('shut',sh)}

/* ---------- Taruhan ---------- */
function pick(id){if(me&&id!==me)return toast('Keluar dulu untuk ganti akun');act=id;render()}
function wins(k,n){if(k[0]==='n')return +k.slice(1)===n;return{red:REDS.has(n),black:!REDS.has(n),even:n%2===0,odd:n%2===1,low:n<=12,high:n>=13,d1:n<=8,d2:n>8&&n<=16,d3:n>16}[k]}
const mult=k=>k[0]==='n'?CF.pn:k[0]==='d'?CF.pd:CF.pc;
function bet(k){if(spinning||closed)return toast('Taruhan ditutup. Tunggu hitungan berikutnya.');settle();const p=P(act);if(!p)return toast('Pilih pemain dulu');if(p.blocked)return toast('Akun diblokir. Hubungi admin.');if(p.pending)return toast('Akun menunggu persetujuan admin.');if(CF.maint)return toast(CF.maintMsg||'Permainan sedang ditutup sementara.');if(CF.minb&&chip<CF.minb)return toast('Taruhan minimal '+fmt(CF.minb)+' chip.');if(CF.maxb&&(((p.bets||[]).find(b=>b.k===k)||{a:0}).a+chip)>CF.maxb)return toast('Batas taruhan per pilihan: '+fmt(CF.maxb)+' chip.');if(p.chips<chip)return toast('Chip '+p.name+' tidak cukup');
  const bs=(p.bets||[]).map(b=>({...b})),e=bs.find(b=>b.k===k);e?e.a+=chip:bs.push({k,a:chip});wp(p,{chips:p.chips-chip,bets:bs,tgt:RD.id+1});render()}
function clearBets(){if(spinning||closed)return toast('Taruhan sudah ditutup.');const p=P(act);if(!p||!(p.bets||[]).length)return;wp(p,{chips:p.chips+p.bets.reduce((s,b)=>s+b.a,0),bets:[],tgt:0});render()}
function repeatBets(){if(spinning||closed)return toast('Taruhan ditutup. Tunggu hitungan berikutnya.');settle();const p=P(act);if(!p)return toast('Pilih pemain dulu');if(p.blocked)return toast('Akun diblokir. Hubungi admin.');if(p.pending)return toast('Akun menunggu persetujuan admin.');if(CF.maint)return toast(CF.maintMsg||'Permainan sedang ditutup sementara.');const L=p.last||[];if(!L.length)return toast('Belum ada taruhan sebelumnya');
  const need=L.reduce((s,b)=>s+b.a,0);if(p.chips<need)return toast('Chip tidak cukup untuk mengulang ('+fmt(need)+' chip)');
  const bs=(p.bets||[]).map(b=>({...b}));L.forEach(m=>{const e=bs.find(b=>b.k===m.k);e?e.a+=m.a:bs.push({k:m.k,a:m.a})});wp(p,{chips:p.chips-need,bets:bs,tgt:RD.id+1});render()}
function settle(){if(window.CF_MODE||spinning)return;const p=P(act);if(!p||!(p.bets||[]).length||!p.tgt||p.tgt>RD.id)return;
  const n=RD.h[RD.id-p.tgt],bs=p.bets;let d=0,g=0;
  if(n===undefined)g=bs.reduce((s,b)=>s+b.a,0);else bs.forEach(b=>{d-=b.a;if(wins(b.k,n)){const x=b.a*(mult(b.k)+1);g+=x;d+=x}});
  const wg=n===undefined?0:bs.reduce((s,b)=>s+b.a,0),k=lvK(),add=lvGain(p,wg,k),a0=lvOf(p.xp,k),a1=lvOf((p.xp||0)+add,k);let bonus=0;for(let L=a0.lv+1;L<=a1.lv;L++)bonus+=k.bonus*L;
  let lg=[{d,t:n===undefined?'Taruhan dikembalikan':'Angka '+n+': '+(d>=0?'+':'')+fmt(d)+' chip'}];if(a1.lv>a0.lv)lg.unshift({d:bonus,t:'Naik ke level '+a1.lv+' ('+lvTitle(a1.lv)+')'+(bonus?'! Bonus +'+fmt(bonus)+' chip':'!')});
  lg=lg.concat(p.log||[]).slice(0,6);
  wp(p,{chips:p.chips+g+bonus,bets:[],tgt:0,last:bs,log:lg,tw:(p.tw||0)+wg,tn:(p.tn||0)+(n===undefined?0:d),xp:(p.xp||0)+add,lv:a1.lv,rn:(p.rn||0)+(wg>0?1:0),seen:Date.now()})}

/* ---------- Putaran sinkron ---------- */
const rdMs=()=>Math.min(30,Math.max(0,+CF.rd||0))*1000;
const hv=()=>RD.h.slice(Math.max(0,RD.id-rvId));
function place(n){if(n===undefined)return;if(W3on){W3.place(n);return}const i=ORDER.indexOf(n),seg=360/24,w=$('wheel');rot=(360-(i+.5)*seg)%360;w.style.transition='none';w.style.transform=`rotate(${rot}deg)`}
function showLast(){if(!RD.h.length)return;place(RD.h[0]);$('res').innerHTML=resHTML(RD.h[0])}
function reveal(r){phase='';rvId=r.id;spinning=false;closed=false;left=Math.max(0,Math.ceil(((RD.next||0)-SNOW())/1000));const p=P(act),bs=(p&&p.bets)||[];let net=0;if(bs.length&&p.tgt&&p.tgt<=r.id)bs.forEach(b=>{net+=wins(b.k,r.n)?b.a*mult(b.k):-b.a});$('res').innerHTML=resHTML(r.n)+(bs.length?`<div class="net ${net>=0?'win':'lose'}">${net>=0?'Menang ':'Kalah '}${net>=0?'+':''}${fmt(net)} chip</div>`:'');if(bs.length){if(net>0){confetti();winSound()}else if(net<0)loseSound()}settle();render()}
function startSpin(r){spinning=true;phase='spin';const i=ORDER.indexOf(r.n),seg=360/24,des=(360-(i+.5)*seg)%360;rot=Math.ceil(rot/360)*360+5*360+des;
  if(W3on)W3.spin(r.n,r.ms);else{const w=$('wheel');w.style.transition=`transform ${r.ms}ms cubic-bezier(.12,.6,.1,1)`;w.style.transform=`rotate(${rot}deg)`}spinSound(r.ms);$('res').innerHTML='<span class="note">Roda berputar…</span>';render();
  setTimeout(()=>{phase='wait';$('res').innerHTML='<span class="note">Roda berhenti. Menunggu hasil…</span>';cdView();setTimeout(()=>reveal(r),rdMs())},r.ms+150)}
const SNOW=()=>D&&D.serverNow?D.serverNow():Date.now();
async function advance(){if(D&&D.cmd)await D.cmd('spin')}
setInterval(()=>{if(!cfgOk||seen<0)return;if(!spinning){left=Math.max(0,Math.ceil(((RD.next||0)-SNOW())/1000));closed=!CF.paused&&RD.next>0&&left<=0}cdView();autoTick();if(adm&&tab===5&&!/INPUT|SELECT/.test((document.activeElement||{}).tagName))admView()},1000);

/* ---------- Akun pemain ---------- */
const normPh=s=>{let d=String(s||'').replace(/\D/g,'');if(d.startsWith('62'))d='0'+d.slice(2);return d};
const okEm=s=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const V=id=>($(id)||{value:''}).value.trim();
const uname=p=>(p.user||p.name).toLowerCase();
async function acctGo(){const u=V('au'),w=($('ap')||{value:''}).value;
  if(mode==='up'){const nm=V('an'),us=u.toLowerCase(),ph=normPh(V('aph')),em=V('aem').toLowerCase();
    if(nm.length<2)return toast('Isi nama lengkap');if(!/^[a-z0-9_.]{3,16}$/.test(us))return toast('Username 3-16 karakter: huruf, angka, titik, atau garis bawah');
    if(ph.length<9||ph.length>15)return toast('Nomor telepon tidak valid');if(!okEm(em))return toast('Email tidak valid');if(w.length<4)return toast('Password minimal 4 karakter');
    if(PL.some(p=>uname(p)===us))return toast('Username sudah dipakai');if(PL.some(p=>p.email===em))return toast('Email sudah terdaftar');
    const id=uid(),t=Date.now();await W('players/'+id,{name:nm,user:us,phone:ph,email:em,chips:CF.start,ph:await H('pl:'+w),bets:[],tgt:0,log:[],last:[],created:t,seen:t,blocked:false,tw:0,tn:0,contact:'',note:''},true);setMe(id);toast(CF.lgWelcome||'Akun dibuat. Selamat bermain!')}
  else{const k=u.toLowerCase(),p=PL.find(p=>uname(p)===k||p.email===k);if(!p||!p.ph||await H('pl:'+w)!==p.ph)return toast('Username atau password salah');if(p.blocked)return toast('Akun diblokir. Hubungi admin.');wp(p,{seen:Date.now()});setMe(p.id)}}
function openPm(h){$('pmb').innerHTML=h;$('pm').hidden=false}
function closePm(){$('pm').hidden=true}
function forgotView(){openPm(`<div class="mh"><b>Reset password</b><button onclick="closePm()" aria-label="Tutup">✕</button></div><p class="note">Masukkan email dan nomor telepon yang terdaftar di akun Anda, lalu buat password baru.</p><label class="lbl">Email</label><input type="email" id="fe" autocomplete="email"><label class="lbl">Nomor telepon</label><input type="tel" id="fp" autocomplete="tel"><label class="lbl">Password baru</label><input type="password" id="fw" autocomplete="new-password"><label class="lbl">Ulangi password baru</label><input type="password" id="fw2" autocomplete="new-password"><button class="gold" style="width:100%;margin-top:12px" onclick="doReset()">Atur password baru</button>`)}
async function doReset(){const em=V('fe').toLowerCase(),ph=normPh(V('fp')),w=$('fw').value,w2=$('fw2').value,p=PL.find(p=>p.email&&p.email===em&&normPh(p.phone)===ph);
  if(!p)return toast('Email atau nomor telepon tidak cocok');if(p.blocked)return toast('Akun diblokir. Hubungi admin.');if(w.length<4)return toast('Password minimal 4 karakter');if(w!==w2)return toast('Ulangan password tidak sama');
  await wp(p,{ph:await H('pl:'+w)});closePm();toast('Password diganti. Silakan masuk.')}
function profileView(){const p=P(me);if(!p)return;const n=p.tn||0;
  openPm(`<div class="mh"><b>Profil saya</b><button onclick="closePm()" aria-label="Tutup">✕</button></div><div class="pf"><i class="av big">${esc((p.name[0]||'?').toUpperCase())}</i><div><b>${esc(p.name)}</b><small>@${esc(p.user||p.name)}</small></div></div>${lvBox(p)}<div class="dg" style="margin-bottom:10px">${kpi('Saldo chip',fmt(p.chips))}${kpi('Total taruhan',fmt(p.tw||0))}${kpi('Hasil bersih',sg(n))}</div>
  <label class="lbl">Nama lengkap</label><input id="pn" value="${esc(p.name)}" maxlength="40"><label class="lbl">Username</label><input value="${esc(p.user||p.name)}" disabled><label class="lbl">Nomor telepon</label><input type="tel" id="pph" value="${esc(p.phone||'')}"><label class="lbl">Email</label><input type="email" id="pem" value="${esc(p.email||'')}"><button class="gold" style="width:100%;margin-top:8px" onclick="saveProfile()">Simpan profil</button>
  <h3>Ganti password</h3><input type="password" id="po" placeholder="Password lama" autocomplete="current-password"><input type="password" id="pnw" placeholder="Password baru (minimal 4 karakter)" autocomplete="new-password"><button style="width:100%" onclick="changePw()">Ganti password</button>`)}
async function saveProfile(){const p=P(me);if(!p)return;const nm=V('pn'),ph=normPh(V('pph')),em=V('pem').toLowerCase();
  if(nm.length<2)return toast('Isi nama lengkap');if(ph.length<9||ph.length>15)return toast('Nomor telepon tidak valid');if(!okEm(em))return toast('Email tidak valid');
  try{await D.op('profile',{name:nm,phone:ph,email:em});toast('Profil disimpan');profileView()}catch(e){toast(e.message)}}
async function changePw(){const o=$('po').value,n=$('pnw').value;if(n.length<4)return toast('Password baru minimal 4 karakter');
  try{await D.op('chpw',{old:await H('pl:'+o),ph:await H('pl:'+n)});$('po').value='';$('pnw').value='';toast('Password diganti')}catch(e){toast(e.message)}}
function setMe(id){me=id;act=id;akey='';try{sessionStorage.setItem('rrme',id)}catch(e){}render()}
function logout(){me=null;act=null;akey='';try{D.op('logout',{}).catch(()=>{}).then(()=>{['rrme','rrtk'].forEach(k=>{try{sessionStorage.removeItem(k);localStorage.removeItem(k)}catch(e){}});D.reauth()})}catch(e){}render()}

/* ---------- Admin ---------- */
const PRE=[{n:'Kasino klasik',acc:'#f5c542',bg1:'#3b0a1e',bg2:'#0b0612',felt:'#0a5c36',font:'klasik'},{n:'Neon malam',acc:'#00e5ff',bg1:'#2b0a4a',bg2:'#05030f',felt:'#0b2a5c',font:'neon'},{n:'Zamrud',acc:'#e8d9a0',bg1:'#06382c',bg2:'#020d0a',felt:'#0d6b4a',font:'elegan'},{n:'Sakura',acc:'#ff8fb1',bg1:'#4a1230',bg2:'#12060e',felt:'#7a1f4a',font:'elegan'},{n:'Samudra',acc:'#ffd166',bg1:'#0b3a66',bg2:'#030b17',felt:'#0f4c75',font:'neon'},{n:'Vegas',acc:'#ffcf40',bg1:'#5a0c12',bg2:'#140306',felt:'#7a1020',font:'klasik'},{n:'Midnight',acc:'#8ab4ff',bg1:'#111a3a',bg2:'#04060f',felt:'#14305c',font:'neon'},{n:'Cyber',acc:'#ff3df2',bg1:'#2a0a3a',bg2:'#06020c',felt:'#3a0a5c',font:'neon'}];
function sel(k,l,o){return`<label class="lbl">${l}</label><div class="row"><select onchange="cf('${k}',this.value,'text')" style="flex:1;padding:9px;border-radius:9px;background:#0006;color:var(--ink);border:1px solid var(--line)">${o.map(([v,t])=>`<option value="${v}" ${CF[k]==v?'selected':''}>${t}</option>`).join('')}</select></div>`}
function preset(i){const{n,...t}=PRE[i];Object.assign(CF,t);wc();theme();admView()}
function gen(){const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';crypto.getRandomValues(new Uint32Array(6)).forEach(x=>s+=a[x%a.length]);return s}
function openAdm(){$('ov').classList.add('s');admView()}
function closeAdm(){$('ov').classList.remove('s');adm=false;lastPw=null;delId=null;rsArm=false;render();if(window.ADMIN_PAGE)location.href='index.html';else if(location.hash==='#admin')location.hash='pemain'}
function admView(){const P2=$('pan');P2.className='pan'+(isAdm()&&!adm?' lg':'');if(!adm)lastPw=null;
  if(!adm){P2.innerHTML=`<div class="row"><h2 style="margin:0;flex:1;color:var(--acc)">Masuk admin</h2><button onclick="closeAdm()">Tutup</button></div><label class="lbl" for="lp">Password</label><div class="row"><input type="password" id="lp" autocomplete="current-password" onkeydown="if(event.key==='Enter')login()"><button class="gold" onclick="login()">Masuk</button></div><p class="note">Password awal: <b>admin123</b>. Segera ganti di tab Keamanan.</p>`;return}
  const cu=PL.reduce((s,p)=>s+unread(p.id,'a','a'+p.id),0),pn=PL.filter(p=>p.pending).length,T=['Pemain','Tampilan','Aturan','Keamanan','Chat'+(cu?' ('+cu+')':''),'Dashboard','Pengguna','Login & Daftar','Pendaftaran'+(pn?' ('+pn+')':''),'Aktivitas','Desain','Level'],c=CF,f=(k,l,t='text')=>`<label class="lbl">${l}</label><div class="row"><input type="${t}" value="${esc(c[k])}" onchange="cf('${k}',this.value,'${t}')"></div>`;
  const HD=`<div class="row"><h2 style="margin:0;flex:1;color:var(--acc)">Panel admin</h2><button onclick="admOut()">Keluar</button><button class="gold" onclick="closeAdm()">Selesai</button></div>`,TB=`<div class="tabs">${[5,0,6,8,4,1,7,2,9,3].map(i=>`<button class="${i===tab?'on':''}" onclick="tab=${i};admView()">${T[i]}</button>`).join('')}</div>`;let h=HD+TB;const hl=h.length;
  if(tab===0){if(lastPw)h+=`<div class="note" style="opacity:1;border:1px solid var(--acc);border-radius:10px;padding:10px">Password baru untuk <b>${esc(lastPw.n)}</b>: <b style="font-size:1.2rem;color:var(--acc);user-select:all">${esc(lastPw.w)}</b><br>Catat dan berikan ke pemain.</div>`;
    h+=`<label class="lbl">Jumlah untuk tombol tambah/kurang</label><div class="row"><input type="number" id="amt" value="100" min="1"></div><label class="lbl">Password baru untuk tombol Reset (kosongkan untuk acak)</label><div class="row"><input type="text" id="npw" maxlength="20"></div>`;
    h+=PL.map(p=>`<div class="row"><input type="text" value="${esc(p.name)}" onchange="pe('${p.id}','name',this.value)" aria-label="Nama pemain"><input type="number" value="${p.chips}" min="0" onchange="pe('${p.id}','chips',this.value)" aria-label="Chip"><button onclick="ac('${p.id}',1)">＋</button><button onclick="ac('${p.id}',-1)">−</button><button onclick="rp('${p.id}')">Reset password</button><button onclick="dp('${p.id}')" style="background:#7a1020;border-color:#ff6b6b">${delId===p.id?'Yakin hapus?':'Hapus'}</button></div>${lastPw&&lastPw.id===p.id?`<div class="note" style="opacity:1;color:var(--acc)">Password baru ${esc(p.name)}: <b style="font-size:1.1rem;user-select:all">${esc(lastPw.w)}</b></div>`:''}`).join('')||'<p class="note">Belum ada pemain.</p>';
    h+=`<div class="row"><button class="gold" onclick="np()">Tambah pemain</button><button onclick="allc()">Beri jumlah di atas ke semua</button></div>`}
  if(tab===1)h+=`<label class="lbl">Tema siap pakai</label><div class="row">${PRE.map((t,i)=>`<button onclick="preset(${i})" style="background:linear-gradient(135deg,${t.bg1},${t.felt});border-color:${t.acc}">${t.n}</button>`).join('')}</div>`+sel('font','Gaya huruf',[['klasik','Klasik'],['neon','Neon'],['elegan','Elegan']])+sel('lay','Tata letak',[['side','Berdampingan'],['flip','Roda di kanan'],['stack','Satu kolom']])+sel('pat','Pola latar',[['0','Polos'],['1','Berlian'],['2','Titik']])+f('rad','Kebulatan sudut kartu (px)','number')+f('wsz','Ukuran roda (px)','number')+f('title','Judul')+f('sub','Subjudul')+f('foot','Teks bawah')+
    `<label class="lbl">Warna</label><div class="row">${['acc:Aksen','bg1:Latar atas','bg2:Latar bawah','felt:Meja'].map(s=>{const[k,l]=s.split(':');return`<label>${l} <input type="color" value="${c[k]}" onchange="cf('${k}',this.value,'text')"></label>`}).join('')}</div>`;
  if(tab===2)h+=f('chips','Nilai chip (pisahkan dengan koma)')+f('sec','Jeda putaran otomatis (detik, minimal 5)','number')+f('start','Chip awal pemain baru','number')+`<label class="lbl"><input type="checkbox" ${c.reg?'checked':''} onchange="cf('reg',this.checked,'bool')"> Izinkan pemain mendaftar sendiri</label>`+f('pn','Bayaran angka tunggal (x)','number')+f('pc','Bayaran warna, ganjil/genap, 1–12/13–24 (x)','number')+f('pd','Bayaran sepertiga: 1–8, 9–16, 17–24 (x)','number')+f('ms','Lama putaran (milidetik)','number')+f('rd','Jeda hasil muncul setelah roda berhenti (detik)','number')+f('minb','Taruhan minimal per ketukan (0 = bebas)','number')+f('maxb','Batas total per pilihan taruhan (0 = bebas)','number')+`<label class="lbl"><input type="checkbox" ${c.maint?'checked':''} onchange="cf('maint',this.checked,'bool')"> Mode pemeliharaan (tutup permainan sementara)</label>`+f('maintMsg','Pesan pemeliharaan')+
    `<div class="row" style="margin-top:12px"><button onclick="W('game/round',{h:[]});toast('Riwayat dihapus')">Hapus riwayat</button><button onclick="rsAll()">${rsArm?'Yakin reset semua?':'Reset semua'}</button></div>`;
  if(tab===3)h+=`<label class="lbl">Password lama</label><div class="row"><input type="password" id="p0"></div><label class="lbl">Password baru (minimal 4 karakter)</label><div class="row"><input type="password" id="p1"></div><label class="lbl">Ulangi password baru</label><div class="row"><input type="password" id="p2"></div><div class="row"><button class="gold" onclick="chpw()">Simpan password</button></div><p class="note">Password disimpan di server sebagai hash bergaram dan tidak pernah dikirim ke browser. Sesi admin berlaku 12 jam dan percobaan masuk yang salah dibatasi.</p><h3>Cadangan pengaturan</h3><div class="row"><button onclick="exportCfg()">Unduh pengaturan (JSON)</button></div><div class="row"><input type="file" accept=".json" onchange="importCfg(this.files[0])"></div><h3>Sesi pemain</h3><div class="row"><button onclick="revokeAll()">Keluarkan semua pemain</button></div><p class="note">Mengeluarkan pemain memaksa semua pemain masuk ulang.</p>`;
  if(tab===4)h+=chatTab();if(tab===5)h+=dashTab();if(tab===6)h+=userTab();if(tab===7)h+=loginTab();if(tab===8)h+=regTab();if(tab===9)h+=logTab();if(tab===10)h+=dsgTab();if(tab===11)h+=lvTab();P2.innerHTML=isAdm()?shell(h.slice(hl),T):h;if(tab===4&&achat){const t=thread(achat);if(t.length)seenSet('a'+achat,t[t.length-1].at);const m=$('amsgs');if(m)m.scrollTop=m.scrollHeight}}
async function login(){try{const r=await D.op('alogin',{ph:await H($('lp').value)});try{sessionStorage.setItem('rratk',r.token)}catch(e){}adm=true;D.reauth();admView()}catch(e){toast(e.message||'Password salah')}}
async function chpw(){const[a,b,c]=['p0','p1','p2'].map(i=>$(i).value);if(b.length<4)return toast('Password baru terlalu pendek');if(b!==c)return toast('Ulangan password tidak sama');
  try{const r=await D.op('achpw',{old:await H(a),ph:await H(b)});try{sessionStorage.setItem('rratk',r.token)}catch(e){}D.reauth();toast('Password diubah');admView()}catch(e){toast(e.message)}}
function cf(k,v,t){if(k==='chips'){const a=String(v).split(',').map(x=>parseInt(x)).filter(x=>x>0);if(a.length){CF.chips=a;chip=a[0]}}else CF[k]=t==='number'?Math.max(0,+v||0):v;wc();theme();render()}
function pe(id,k,v){const p=P(id);if(p){const val=(k==='chips'||k==='xp')?Math.max(0,Math.floor(+v||0)):v;wp(p,k==='xp'?{xp:val,lv:lvOf(val).lv}:{[k]:val})}}
function ac(id,s){const a=Math.floor(+$('amt').value)||0,p=P(id);if(p){wp(p,{chips:Math.max(0,p.chips+s*a)});alog((s>0?'Menambah ':'Mengurangi ')+fmt(a)+' chip untuk '+p.name);admView()}}
function allc(){const a=Math.floor(+$('amt').value)||0;PL.forEach(p=>wp(p,{chips:p.chips+a}));alog('Memberi '+fmt(a)+' chip ke semua pemain ('+PL.length+')');admView();toast('Chip ditambahkan ke semua pemain')}
function np(){const id=uid();W('players/'+id,{name:'Pemain '+(PL.length+1),chips:CF.start,ph:'',bets:[],tgt:0,log:[],last:[],created:Date.now(),seen:0,blocked:false,tw:0,tn:0,contact:'',note:''},true).then(admView)}
function dp(id){if(delId!==id){delId=id;admView();return}delId=null;alog('Menghapus akun '+((P(id)||{}).name||id));D.doc('players/'+id).delete().then(()=>{PL=PL.filter(p=>p.id!==id);if(act===id)act=null;if(me===id)logout();admView();render()})}
function rp(id){const p=P(id),i=$('npw'),c=i?i.value.trim():'',v=c||gen();if(!p)return;if(v.length<4)return toast('Password minimal 4 karakter');(async()=>{await D.op('setpw',{pid:id,ph:await H('pl:'+v)});lastPw={id,n:p.name,w:v};alog('Reset password '+p.name);admView();toast('Password '+p.name+' diganti: '+v)})()}
function rsAll(){if(!rsArm){rsArm=true;admView();return}PL.forEach(p=>D.doc('players/'+p.id).delete());D.doc('app/cfg').delete();D.doc('game/round').delete();setTimeout(()=>location.reload(),900)}

async function spinNow(){if(spinning)return toast('Roda sedang berputar');closed=true;alog('Memutar roda secara manual');await advance();toast('Putaran dimulai')}
function kpi(l,v,s){return`<div class="stat"><small>${l}</small><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`}
const ago=t=>{if(!t)return'-';const m=Math.round((Date.now()-t)/60000);return m<1?'Baru saja':m<60?m+' mnt lalu':m<1440?Math.round(m/60)+' jam lalu':Math.round(m/1440)+' hari lalu'};
const dd=t=>t?new Date(t).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}):'-';
const dt=t=>t?new Date(t).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'-';
const sg=n=>(n>=0?'+':'')+fmt(n);
function dashTab(){const h=hv(),now=Date.now(),sum=f=>PL.reduce((s,p)=>s+f(p),0),tc=sum(p=>p.chips),tw=sum(p=>p.tw||0),tn=sum(p=>p.tn||0),pend=sum(p=>(p.bets||[]).reduce((a,b)=>a+b.a,0)),ap=PL.filter(p=>(p.bets||[]).length).length,
  on=PL.filter(p=>p.seen&&now-p.seen<9e5).length,nw=PL.filter(p=>p.created&&now-p.created<864e5).length,bl=PL.filter(p=>p.blocked).length,cnt=Array(24).fill(0);h.forEach(x=>{if(x>=1&&x<=24)cnt[x-1]++});
  const mx=Math.max(1,...cnt),bars=cnt.map((c,j)=>{const i=j+1;return `<rect x="${j*23+4}" y="${96-c/mx*84}" width="17" height="${c/mx*84}" rx="3" fill="${REDS.has(i)?'#c8102e':'#7b86a8'}"/><text x="${j*23+12}" y="110" font-size="9" text-anchor="middle" fill="#9aa3c4">${i}</text>`}).join(''),
  top=PL.slice().sort((a,b)=>b.chips-a.chips).slice(0,6),tm=Math.max(1,...top.map(p=>p.chips)),
  tb=top.map(p=>`<div class="hb"><span>${esc(p.name)}</span><i style="width:${Math.max(2,p.chips/tm*100)}%"></i><b>${fmt(p.chips)}</b></div>`).join('')||'<p class="note">Belum ada pemain.</p>',rc=h.filter(x=>REDS.has(x)).length,zc=0;
  return`<div class="stats">${kpi('Total pengguna',PL.length,bl+' diblokir')}${kpi('Aktif 15 menit',on)}${kpi('Baru 24 jam',nw,PL.filter(p=>p.pending).length+' menunggu')}${kpi('Chip beredar',fmt(tc))}${kpi('Total taruhan',fmt(tw))}${kpi('Hasil kasino',sg(-tn),'selisih chip pemain')}${kpi('Taruhan terpasang',fmt(pend),ap+' pemain')}${kpi('Putaran ke '+RD.id,CF.paused?'Dijeda':spinning?'Berputar':closed?'Ditutup':left+' dtk','status taruhan')}</div>
  <div class="row" style="margin-top:14px"><button class="gold" onclick="spinNow()">Putar sekarang</button><button onclick="togglePause()">${CF.paused?'Lanjutkan putaran otomatis':'Jeda putaran otomatis'}</button></div>
  <div class="grid2"><div class="panelbox"><h3>Distribusi angka (${h.length} putaran terakhir)</h3><svg viewBox="0 0 556 118" style="width:100%;height:auto" role="img" aria-label="Grafik distribusi angka">${bars}</svg><div class="note">Merah ${rc}, Hitam ${h.length-rc-zc}</div></div><div class="panelbox"><h3>Chip terbanyak</h3>${tb}</div></div>
  ${quickPanel()}${expoPanel()}${regChart()}<div class="panelbox" style="margin-top:14px"><h3>Pengumuman untuk semua pemain</h3><div class="row"><input type="text" id="ntc" maxlength="140" value="${esc(CF.notice||'')}" placeholder="Contoh: Bonus chip dibagikan jam 8 malam"><button class="gold" onclick="cf('notice',$('ntc').value.trim(),'text');toast('Pengumuman diperbarui')">Tampilkan</button><button onclick="cf('notice','','text');admView()">Hapus</button></div></div>
  <div class="panelbox" style="margin-top:14px"><h3>Hasil terakhir</h3><div class="hist">${h.slice(0,30).map(x=>`<span style="background:${col(x)}">${x}</span>`).join('')||'<span class="note" style="width:auto">Belum ada putaran.</span>'}</div></div>`}
let uq='',uf='all',us='new',upg=0,udet=null;
const badge=p=>p.pending?'<span class="bd warn">Menunggu</span>':p.blocked?'<span class="bd bad">Diblokir</span>':p.ph?'<span class="bd ok">Aktif</span>':'<span class="bd warn">Tanpa password</span>';
function userDetail(p){const n=p.tn||0,lg=(p.log||[]).map(l=>`<li class="${l.d>=0?'win':'lose'}">${esc(l.t)}</li>`).join('')||'<li class="note">Belum ada riwayat.</li>',bs=(p.bets||[]).map(b=>b.k+': '+fmt(b.a)).join(', ')||'tidak ada',fl=(k,l,v)=>`<div><label class="lbl">${l}</label><div class="row"><input type="text" value="${esc(v||'')}" onchange="pe('${p.id}','${k}',this.value)"></div></div>`;
  return`<div class="detail"><div class="row" style="margin:0 0 12px"><i class="av">${esc((p.name[0]||'?').toUpperCase())}</i><h3 style="margin:0;flex:1">${esc(p.name)}</h3>${badge(p)}<button onclick="udet=null;admView()">Tutup</button></div>
  <div class="dg">${kpi('Saldo chip',fmt(p.chips))}${kpi('Level','Lv '+lvOf(p.xp).lv,lvTitle(lvOf(p.xp).lv))}${kpi('XP',fmt(p.xp||0),fmt(p.rn||0)+' putaran')}${kpi('Total taruhan',fmt(p.tw||0))}${kpi('Hasil bersih',sg(n))}${kpi('Terdaftar',dd(p.created),dt(p.created))}${kpi('Terakhir aktif',ago(p.seen),dt(p.seen))}${kpi('Taruhan aktif',fmt((p.bets||[]).reduce((s,b)=>s+b.a,0)),esc(bs))}</div>
  <div class="dg" style="margin-top:12px">${fl('name','Nama',p.name)}${fl('phone','Telepon',p.phone)}${fl('email','Email',p.email)}${fl('contact','Kontak lain',p.contact)}${fl('note','Catatan admin',p.note)}${fl('xp','XP (admin)',p.xp||0)}</div>
  <label class="lbl">Atur chip</label><div class="row"><input type="number" id="uamt" value="100" min="1"><button onclick="uac('${p.id}',1)">Tambah</button><button onclick="uac('${p.id}',-1)">Kurangi</button></div>
  <div class="row"><button onclick="blk('${p.id}')">${p.blocked?'Buka blokir':'Blokir akun'}</button><button onclick="rp('${p.id}')">Reset password</button><button onclick="dp('${p.id}')" style="background:#7a1020;border-color:#ff6b6b">${delId===p.id?'Yakin hapus?':'Hapus akun'}</button></div>
  ${lastPw&&lastPw.id===p.id?`<div class="note" style="opacity:1;color:#9db6ff">Password baru: <b style="font-size:1.1rem;user-select:all">${esc(lastPw.w)}</b></div>`:''}<h3>Riwayat terakhir</h3><ul class="log">${lg}</ul></div>`}
function uac(id,s){const a=Math.floor(+$('uamt').value)||0,p=P(id);if(p){wp(p,{chips:Math.max(0,p.chips+s*a)});alog((s>0?'Menambah ':'Mengurangi ')+fmt(a)+' chip untuk '+p.name);admView()}}
function userTab(){const a=PL.filter(p=>(!uq||(p.name+' '+(p.user||'')+' '+(p.phone||'')+' '+(p.email||'')+' '+(p.contact||'')).toLowerCase().includes(uq.toLowerCase()))&&(uf==='all'||(uf==='blocked'?p.blocked:uf==='pending'?p.pending:uf==='active'?!p.blocked&&!p.pending:!p.ph))).sort((x,y)=>us==='name'?x.name.localeCompare(y.name):us==='chips'?y.chips-x.chips:(y.created||0)-(x.created||0)),
  PS=12,pages=Math.max(1,Math.ceil(a.length/PS));if(upg>=pages)upg=pages-1;if(upg<0)upg=0;const pg=a.slice(upg*PS,upg*PS+PS),op=(v,t,c)=>`<option value="${v}" ${c===v?'selected':''}>${t}</option>`,sty='padding:9px;border-radius:9px;background:#0b0e1a;color:var(--ink);border:1px solid var(--line)',
  rows=pg.map(p=>{const n=p.tn||0;return`<tr class="rw ${udet===p.id?'sel':''}" onclick="udet=udet==='${p.id}'?null:'${p.id}';admView()"><td><b>${esc(p.name)}</b></td><td>${CF.lvOn===false?'-':'Lv '+lvOf(p.xp).lv}</td><td>${esc(p.phone||p.contact||'-')}<br><small style="opacity:.65">${esc(p.email||'')}</small></td><td class="n">${fmt(p.chips)}</td><td class="n">${fmt(p.tw||0)}</td><td class="n ${n>=0?'pos':'neg'}">${sg(n)}</td><td>${badge(p)}</td><td>${dd(p.created)}</td><td>${ago(p.seen)}</td></tr>`}).join('')||'<tr><td colspan="9" style="padding:20px;opacity:.7">Tidak ada pengguna.</td></tr>',d=P(udet);
  return`<div class="row"><input type="text" placeholder="Cari nama atau kontak" value="${esc(uq)}" onchange="uq=this.value;upg=0;admView()"><select style="${sty}" onchange="uf=this.value;upg=0;admView()">${op('all','Semua status',uf)+op('active','Aktif',uf)+op('blocked','Diblokir',uf)+op('pending','Menunggu',uf)+op('nopw','Tanpa password',uf)}</select><select style="${sty}" onchange="us=this.value;admView()">${op('new','Terbaru',us)+op('name','Nama',us)+op('chips','Chip terbanyak',us)}</select><button class="gold" onclick="exportCSV()">Unduh CSV</button><button onclick="exportJSON()">Cadangkan JSON</button></div>
  <div class="note">${a.length} dari ${PL.length} pengguna. Klik baris untuk melihat detail.</div><div class="tw"><table class="tbl"><thead><tr><th>Pengguna</th><th>Level</th><th>Telepon / Email</th><th>Chip</th><th>Taruhan</th><th>Hasil bersih</th><th>Status</th><th>Terdaftar</th><th>Terakhir aktif</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="pg"><span class="note" style="margin:0 auto 0 0">Halaman ${upg+1} dari ${pages}</span><button ${upg<=0?'disabled':''} onclick="upg--;admView()">Sebelumnya</button><button ${upg>=pages-1?'disabled':''} onclick="upg++;admView()">Berikutnya</button></div>`+(d?userDetail(d):'')+
  `<label class="lbl">Pulihkan dari file cadangan (JSON)</label><div class="row"><input type="file" accept=".json" onchange="importJSON(this.files[0])"></div>`}
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove()}
function exportCSV(){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"',h=['nama','username','telepon','email','kontak','chip','total_taruhan','hasil_bersih','status','tanggal_daftar','terakhir_aktif','catatan'],iso=t=>t?new Date(t).toISOString():'';
  const r=PL.map(p=>[p.name,p.user,p.phone,p.email,p.contact,p.chips,p.tw||0,p.tn||0,p.blocked?'diblokir':p.ph?'aktif':'tanpa_password',iso(p.created),iso(p.seen),p.note].map(q).join(','));dl('pengguna.csv','\ufeff'+[h.join(',')].concat(r).join('\n'),'text/csv')}
function exportJSON(){dl('cadangan-pengguna.json',JSON.stringify(PL,null,1),'application/json')}
function importJSON(f){if(!f)return;f.text().then(t=>{const a=JSON.parse(t);if(!Array.isArray(a))throw 0;a.forEach(p=>{if(p&&p.id&&p.name){const o={};Object.keys(p).forEach(k=>{if(k!=='id')o[k]=p[k]});W('players/'+p.id,o,true)}});toast('Data pengguna dipulihkan: '+a.length)}).catch(()=>toast('File tidak valid'))}
function loginTab(){const g=(k,l)=>`<label class="lbl">${l}</label><div class="row"><input type="text" value="${esc(CF[k]||'')}" onchange="cf('${k}',this.value,'text');admView()"></div>`,sty='flex:1;padding:9px;border-radius:9px;background:#0006;color:var(--ink);border:1px solid var(--line)';
  return`<div class="stats"><div><h3>Pratinjau: Masuk</h3>${acctHTML(false,true)}</div><div><h3>Pratinjau: Daftar</h3>${acctHTML(true,true)}</div></div>`+
  g('lgTitle','Judul kotak')+g('lgIntro','Teks pengantar (opsional)')+g('lgIn','Nama tab Masuk')+g('lgUp','Nama tab Daftar')+g('lgUser','Teks kolom nama pengguna')+g('lgPass','Teks kolom password')+
  g('lgName','Teks kolom nama lengkap')+g('lgPhone','Teks kolom nomor telepon')+g('lgEmail','Teks kolom email')+g('lgBtnIn','Teks tombol masuk')+g('lgBtnUp','Teks tombol daftar')+g('lgTerms','Syarat atau aturan di form daftar (opsional)')+g('lgHelp','Teks bantuan di form masuk (opsional)')+g('lgWelcome','Pesan setelah akun dibuat')+
  `<label class="lbl">Gaya kotak</label><div class="row"><select style="${sty}" onchange="cf('lgSt',this.value,'text');admView()">${[['box','Kotak biasa'],['gold','Bingkai emas'],['plain','Tanpa kotak']].map(([v,t])=>`<option value="${v}" ${CF.lgSt===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="row" style="margin-top:12px"><button onclick="loginReset()">Kembalikan ke bawaan</button></div>`}
function loginReset(){LGK.concat(['lgWelcome']).forEach(k=>CF[k]=DEF[k]);wc();theme();render();admView()}
const ADM_PAGES={5:'admin.html',0:'admin-pemain.html',6:'admin-pengguna.html',8:'admin-pendaftaran.html',4:'admin-chat.html',1:'admin-tampilan.html',7:'admin-halaman-masuk.html',2:'admin-aturan.html',9:'admin-aktivitas.html',10:'admin-desain.html',11:'admin-level.html',3:'admin-keamanan.html'};
const admSess=()=>{try{return sessionStorage.getItem('rradm')}catch(e){return null}};
function go(i){if(window.ADMIN_PAGE&&ADM_PAGES[i])location.href=ADM_PAGES[i];else{tab=i;admView()}}
function admOut(){adm=false;D.op('logout',{}).catch(()=>{}).then(()=>{try{sessionStorage.removeItem('rratk')}catch(e){}D.reauth()});admView()}
const NAV={5:['📊','Dashboard'],0:['👥','Pemain'],6:['🗂','Pengguna'],4:['💬','Chat'],1:['🎨','Tampilan'],7:['🔑','Login & Daftar'],2:['⚙','Aturan'],3:['🔒','Keamanan'],8:['📝','Pendaftaran'],9:['🧾','Aktivitas'],10:['🖌','Desain'],11:['🏅','Level']};
const GRP=[['Ikhtisar',[5]],['Pengguna',[0,6,8,4]],['Konfigurasi',[1,10,11,7,2]],['Sistem',[9,3]]];
const NAVCSS=`
.ap-brand{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px 14px}
.ap-brand .bt{display:flex;flex-direction:column;min-width:0}
.ap-brand .bt b{font-size:1.05rem;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ap-brand .bt small{opacity:.6}
.ap-col{background:none;border:1px solid #2a3150;color:#b8c0dc;border-radius:8px;padding:2px 9px;font-size:1rem;cursor:pointer}
.ap-side nav{display:flex;flex-direction:column;gap:3px;flex:1}
.ap-side nav a,.ap-side nav button,.ap-side .fl{position:relative;display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;border-radius:10px;color:#b8c0dc;font-weight:600;font-size:.95rem;text-decoration:none;background:none;border:0;text-align:left;cursor:pointer}
.ap-side nav a:hover,.ap-side nav button:hover,.ap-side .fl:hover{background:#171c32;color:#fff}
.ap-side nav .on{background:#27315c;color:#fff;box-shadow:inset 3px 0 0 #5b8def}
.ap-side nav a:focus-visible,.ap-side nav button:focus-visible,.ap-side .fl:focus-visible,.ap-col:focus-visible,.ap-burger:focus-visible{outline:2px solid #8fb1ff;outline-offset:-2px}
.ap-side .ni{width:24px;text-align:center;font-size:1.1rem;flex:none}
.ap-side .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ap-foot{display:flex;flex-direction:column;gap:3px;padding-top:10px;border-top:1px solid #1f2540}
.ap-top{flex-wrap:nowrap;gap:10px}
.crumb{display:flex;flex-direction:column;margin-right:auto;min-width:0}
.crumb small{font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:#6f7aa3}
.crumb h1{margin:0;font-size:1.25rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0}
.tb-out{display:none}
@media(min-width:821px){
 .ap{transition:grid-template-columns .2s}
 .ap.col{grid-template-columns:72px minmax(0,1fr)}
 .ap.col .ap-side{padding-left:8px;padding-right:8px}
 .ap.col .ap-brand{flex-direction:column;padding-left:0;padding-right:0}
 .ap.col .ap-brand .bt{display:none}
 .ap.col .ap-col{transform:rotate(180deg)}
 .ap.col .t{display:none}
 .ap.col .ap-side nav a,.ap.col .ap-side nav button,.ap.col .ap-side .fl{justify-content:center;padding-left:0;padding-right:0}
 .ap.col .nb{position:absolute;top:2px;right:4px;margin:0;padding:0 5px;font-size:.6rem}
 .ap.col .ap-grp{font-size:0;height:1px;background:#1f2540;margin:10px 6px;padding:0}
}
@media(max-width:820px){
 .ap{grid-template-columns:1fr}
 .ap-side{position:fixed;left:0;top:0;bottom:0;width:min(300px,86vw);height:100vh;height:100dvh;transform:translateX(-102%);transition:transform .22s;z-index:70;overflow-y:auto;padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))}
 .ap-side.open{transform:none;box-shadow:0 0 60px #000}
 .ap-side nav{flex-direction:column;overflow:visible;flex:1}
 .ap-grp{display:block}
 .ap-burger{display:inline-flex;align-items:center}
 .ap-col{display:none}
 .ap-side.open+.ap-scrim{display:block;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:65}
 .ap-top{padding:10px 14px;gap:8px}
 .ap-top .pill:not(.warnb){display:none}
 .tb-out{display:inline-flex}
}
html.navopen,html.navopen body{overflow:hidden}
`;
function injectNavCss(){
  if(document.getElementById('navcss'))return;
  const s=document.createElement('style');s.id='navcss';s.textContent=NAVCSS;document.head.appendChild(s);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')navClose()});
  addEventListener('resize',()=>{if(innerWidth>820)navClose()});
}
function navCollapsed(){try{const p=localStorage.getItem('rrnav');if(p!==null)return p==='1'}catch(e){}return innerWidth<1100}
function navToggle(){const ap=document.querySelector('.ap');if(!ap)return;const c=ap.classList.toggle('col');try{localStorage.setItem('rrnav',c?'1':'0')}catch(e){}}
function navOpen(){const s=document.getElementById('apside');if(!s)return;s.classList.add('open');document.documentElement.classList.add('navopen');const b=document.getElementById('apburger');if(b)b.setAttribute('aria-expanded','true');const a=s.querySelector('nav .on');if(a)s.scrollTop=Math.max(0,a.offsetTop-s.clientHeight/2)}
function navClose(){const s=document.getElementById('apside');if(s)s.classList.remove('open');document.documentElement.classList.remove('navopen');const b=document.getElementById('apburger');if(b)b.setAttribute('aria-expanded','false')}
function shell(body,T){injectNavCss();
  const cnt={4:PL.reduce((s,p)=>s+unread(p.id,'a','a'+p.id),0),8:PL.filter(p=>p.pending).length},col=navCollapsed(),pn=cnt[8],
  item=i=>{const lab=NAV[i][1],inner=`<span class="ni" aria-hidden="true">${NAV[i][0]}</span><span class="t">${lab}</span>${cnt[i]?`<em class="nb">${cnt[i]}</em>`:''}`,cur=i===tab?' aria-current="page"':'';
    return window.ADMIN_PAGE?`<a class="${i===tab?'on':''}" href="${ADM_PAGES[i]}" title="${lab}"${cur}>${inner}</a>`:`<button class="${i===tab?'on':''}" onclick="tab=${i};admView();navClose()" title="${lab}"${cur}>${inner}</button>`},
  nav=GRP.map(([g,ids])=>`<div class="ap-grp">${g}</div>`+ids.map(item).join('')).join(''),
  site=window.ADMIN_PAGE?'<a class="fl" href="index.html" target="_blank" rel="noopener" title="Situs pemain"><span class="ni" aria-hidden="true">🌐</span><span class="t">Situs pemain</span></a>':'<button class="fl" onclick="closeAdm()" title="Kembali ke situs"><span class="ni" aria-hidden="true">🌐</span><span class="t">Kembali ke situs</span></button>';
  setTimeout(()=>{const s=document.getElementById('apside'),a=s&&s.querySelector('nav .on');if(s&&a&&s.scrollHeight>s.clientHeight)s.scrollTop=Math.max(0,a.offsetTop-s.clientHeight/2)},0);
  return`<div class="ap${col?' col':''}"><aside class="ap-side" id="apside"><div class="ap-brand"><div class="bt"><b>${esc(CF.title)}</b><small>Panel admin</small></div><button class="ap-col" aria-label="Ciutkan atau lebarkan menu" title="Ciutkan atau lebarkan menu" onclick="navToggle()">«</button></div><nav aria-label="Menu admin">${nav}</nav><div class="ap-foot">${site}<button class="fl" onclick="admOut()" title="Keluar"><span class="ni" aria-hidden="true">🚪</span><span class="t">Keluar</span></button></div></aside><div class="ap-scrim" onclick="navClose()"></div><div class="ap-main"><header class="ap-top"><button class="ap-burger" id="apburger" aria-label="Buka menu" aria-expanded="false" aria-controls="apside" onclick="navOpen()">☰</button><div class="crumb"><small>Panel admin</small><h1>${NAV[tab][0]} ${NAV[tab][1]}</h1></div><span class="pill ${SYNC?'g':''}">● ${SYNC?'Online':'Lokal'}</span><span class="pill">${PL.length} pengguna</span><span class="pill">Putaran ${RD.id}</span>${pn?`<button class="pill warnb" onclick="go(8)">📝 ${pn} menunggu</button>`:''}${CF.maint?'<span class="pill warnb">Mode pemeliharaan</span>':''}<button class="tb-out" onclick="admOut()" aria-label="Keluar">Keluar</button></header><div class="ap-body">${body}</div></div></div>`}
let LG=[],lgq='',lgArm=false;
function alog(m){if(!D)return;W('logs/'+uid(),{t:Date.now(),m},true)}
function regChart(){const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-6+i);return d.getTime()}),c=days.map(t=>PL.filter(p=>p.created>=t&&p.created<t+864e5).length),m=Math.max(1,...c);
  return`<div class="panelbox" style="margin-top:14px"><h3>Pendaftar 7 hari terakhir</h3><svg viewBox="0 0 320 110" style="width:100%;height:auto" role="img" aria-label="Grafik pendaftar per hari">${c.map((v,i)=>`<rect x="${i*44+10}" y="${84-v/m*66}" width="28" height="${v/m*66}" rx="5" fill="#5b8def"/><text x="${i*44+24}" y="${80-v/m*66}" font-size="10" text-anchor="middle" fill="#cfd8ff">${v||''}</text><text x="${i*44+24}" y="102" font-size="9" text-anchor="middle" fill="#9aa3c4">${new Date(days[i]).toLocaleDateString('id-ID',{weekday:'short'})}</text>`).join('')}</svg></div>`}
function regTab(){const pend=PL.filter(p=>p.pending).sort((a,b)=>(b.created||0)-(a.created||0)),
  chk=(k,l)=>`<label class="lbl"><input type="checkbox" ${CF[k]?'checked':''} onchange="cf('${k}',this.checked,'bool');admView()"> ${l}</label>`,
  f=(k,l,t='text')=>`<label class="lbl">${l}</label><div class="row"><input type="${t}" value="${esc(CF[k]===undefined?'':CF[k])}" onchange="cf('${k}',this.value,'${t}')"></div>`,
  rows=pend.map(p=>`<tr><td><b>${esc(p.name)}</b><br><small style="opacity:.65">@${esc(p.user||p.name)}</small></td><td>${esc(p.phone||'-')}<br><small style="opacity:.65">${esc(p.email||'')}</small></td><td>${ago(p.created)}</td><td><button class="gold" onclick="approve('${p.id}')">Setujui</button> <button onclick="reject('${p.id}')" style="background:#7a1020;border-color:#ff6b6b">${delId===p.id?'Yakin tolak?':'Tolak'}</button></td></tr>`).join('')||'<tr><td colspan="4" style="padding:20px;opacity:.7">Tidak ada pendaftar yang menunggu.</td></tr>';
  return`<div class="grid2"><div class="panelbox"><h3>Pengaturan pendaftaran</h3>${chk('reg','Pendaftaran terbuka untuk umum')}${chk('appr','Akun baru perlu persetujuan admin')}${f('invite','Kode undangan (kosongkan jika tidak dipakai)')}${f('start','Chip bonus untuk pendaftar baru','number')}${f('maxp','Batas jumlah pemain (0 = tanpa batas)','number')}</div>${regChart().replace('margin-top:14px','margin-top:0')}</div><div class="row" style="margin-top:16px"><h3 style="margin:0;flex:1">Menunggu persetujuan (${pend.length})</h3>${pend.length?'<button class="gold" onclick="approveAll()">Setujui semua</button>':''}</div><div class="tw"><table class="tbl"><thead><tr><th>Pendaftar</th><th>Kontak</th><th>Mendaftar</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div>`}
function approve(id){const p=P(id);if(!p)return;wp(p,{pending:false});alog('Menyetujui pendaftaran '+p.name);admView()}
function approveAll(){PL.filter(p=>p.pending).forEach(p=>wp(p,{pending:false}));alog('Menyetujui semua pendaftar yang menunggu');admView()}
function reject(id){const p=P(id);if(!p)return;if(delId!==id){delId=id;admView();return}delId=null;alog('Menolak pendaftaran '+p.name);D.doc('players/'+id).delete().then(()=>{PL=PL.filter(q=>q.id!==id);admView()})}
function blk(id){const p=P(id);if(!p)return;const nb=!p.blocked;wp(p,{blocked:nb});alog((nb?'Memblokir ':'Membuka blokir ')+p.name);admView()}
function togglePause(){cf('paused',!CF.paused,'bool');alog(CF.paused?'Putaran otomatis dijeda':'Putaran otomatis dilanjutkan');admView()}
function logTab(){const a=LG.filter(l=>!lgq||l.m.toLowerCase().includes(lgq.toLowerCase())).slice(0,100);
  return`<div class="row"><input type="text" placeholder="Cari aktivitas" value="${esc(lgq)}" onchange="lgq=this.value;admView()"><button onclick="clearLogs()">${lgArm?'Yakin hapus semua?':'Hapus semua log'}</button></div><div class="note">${a.length} dari ${LG.length} catatan. Maksimal 200 catatan terakhir disimpan.</div><div class="tw"><table class="tbl"><thead><tr><th>Waktu</th><th>Aktivitas</th></tr></thead><tbody>${a.map(l=>`<tr><td>${dt(l.t)}</td><td style="white-space:normal">${esc(l.m)}</td></tr>`).join('')||'<tr><td colspan="2" style="padding:20px;opacity:.7">Belum ada aktivitas.</td></tr>'}</tbody></table></div>`}
function clearLogs(){if(!lgArm){lgArm=true;admView();return}lgArm=false;LG.forEach(l=>D.doc('logs/'+l.id).delete());LG=[];admView()}
const SFX={on:(()=>{try{return localStorage.getItem('rrsfx')!=='0'}catch(e){return true}})(),ctx:null};
let autoRep=false,lastAuto=-1;try{autoRep=localStorage.getItem('rrauto')==='1'}catch(e){}
function audio(){if(!SFX.ctx){try{SFX.ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(SFX.ctx.state==='suspended')SFX.ctx.resume();return SFX.ctx}
function beep(f,d,v,t0,type){const c=audio();if(!c||!SFX.on)return;const t=c.currentTime+(t0||0),o=c.createOscillator(),g=c.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(v||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02)}
function spinSound(ms){if(!SFX.on)return;for(let i=1;i<=34;i++)beep(700+(i%2)*140,.03,.04,ms*(1-Math.pow(1-i/34,1/3))/1000,'square')}
function winSound(){[523,659,784,1047].forEach((f,i)=>beep(f,.18,.07,i*.1,'triangle'))}
function loseSound(){beep(196,.3,.06,0,'sawtooth')}
function confetti(){const c=$('fx');if(!c||CF.fxOn===false||(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches))return;const x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
  const P=[...Array(140)].map(()=>({x:innerWidth/2,y:innerHeight*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*13-4,s:4+Math.random()*6,c:['#f5c542','#ff5d73','#5b8def','#6ee7a0','#fff'][Math.random()*5|0],r:Math.random()*6}));let f=0;
  (function t(){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=.2;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});if(++f<110)requestAnimationFrame(t);else x.clearRect(0,0,c.width,c.height)})()}
function autoTick(){if(!autoRep||spinning||closed||CF.maint||CF.paused||lastAuto===RD.id)return;const p=P(act);if(!p||p.blocked||p.pending||!p.last||!p.last.length||(p.bets||[]).length)return;
  lastAuto=RD.id;const n=p.last.reduce((s,b)=>s+b.a,0);if(p.chips<n){autoRep=false;$('auto').setAttribute('aria-pressed','false');toast('Auto ulang dihentikan: chip tidak cukup');return}repeatBets()}
function expoPanel(){const B={};let tot=0;PL.forEach(p=>(p.bets||[]).forEach(b=>{B[b.k]=(B[b.k]||0)+b.a;tot+=b.a}));
  const net=[...Array(24).keys()].map(k=>{const n=k+1;let g=0;Object.keys(B).forEach(k=>{if(wins(k,n))g+=B[k]*(mult(k)+1)});return tot-g}),mx=Math.max(1,...net.map(Math.abs)),
  bars=net.map((v,i)=>`<rect x="${i*23+4}" y="${v>=0?50-v/mx*44:50}" width="16" height="${Math.max(1,Math.abs(v)/mx*44)}" rx="2" fill="${v>=0?'#4cd37b':'#ff6b6b'}"/><text x="${i*23+12}" y="112" font-size="9" text-anchor="middle" fill="#9aa3c4">${i+1}</text>`).join(''),
  lab=k=>k[0]==='n'?'Angka '+k.slice(1):({red:'Merah',black:'Hitam',even:'Genap',odd:'Ganjil',low:'1-12',high:'13-24',d1:'1-8',d2:'9-16',d3:'17-24'})[k]||k,mb=Math.max(1,...Object.values(B)),
  top=Object.entries(B).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`<div class="hb"><span>${lab(k)}</span><i style="width:${Math.max(2,v/mb*100)}%"></i><b>${fmt(v)}</b></div>`).join('')||'<p class="note">Belum ada taruhan terpasang.</p>';
  return`<div class="panelbox" style="margin-top:14px"><h3>Eksposur putaran berikutnya</h3><div class="note">Total terpasang ${fmt(tot)} chip. Hijau: kasino untung jika angka itu keluar, merah: rugi. Terburuk ${sg(Math.min(0,...net))}, terbaik ${sg(Math.max(0,...net))}.</div><svg viewBox="0 0 556 118" style="width:100%;height:auto" role="img" aria-label="Eksposur per angka"><line x1="0" x2="556" y1="50" y2="50" stroke="#2a3150"/>${bars}</svg>${top}</div>`}
async function revokeAll(){try{await D.op('revoke',{});alog('Mengeluarkan semua pemain (sesi dicabut)');toast('Semua sesi pemain dicabut')}catch(e){toast(e.message)}}
function exportCfg(){dl('pengaturan.json',JSON.stringify(CF,null,1),'application/json')}
function importCfg(f){if(!f)return;f.text().then(t=>{const o=JSON.parse(t);if(!o||typeof o!=='object'||Array.isArray(o))throw 0;Object.assign(CF,o);wc();theme();alog('Memulihkan pengaturan dari cadangan');toast('Pengaturan dipulihkan');admView()}).catch(()=>toast('File tidak valid'))}
function quickPanel(){const rows=LG.slice(0,6).map(l=>`<li style="padding:6px 0;border-top:1px solid #232a4a"><small style="opacity:.6">${ago(l.t)}</small><br>${esc(l.m)}</li>`).join('')||'<li style="opacity:.7">Belum ada aktivitas.</li>';
  return`<div class="grid2"><div class="panelbox"><h3>Kontrol cepat</h3><div class="row"><button class="${CF.maint?'warnb':''}" onclick="cf('maint',!CF.maint,'bool');alog(CF.maint?'Mode pemeliharaan aktif':'Mode pemeliharaan mati');admView()">${CF.maint?'Matikan pemeliharaan':'Aktifkan pemeliharaan'}</button><button onclick="cf('reg',!CF.reg,'bool');alog(CF.reg?'Pendaftaran dibuka':'Pendaftaran ditutup');admView()">${CF.reg?'Tutup pendaftaran':'Buka pendaftaran'}</button></div><div class="row"><button onclick="revokeAll()">Keluarkan semua pemain</button></div></div><div class="panelbox"><h3>Aktivitas terbaru</h3><ul style="list-style:none;margin:0;padding:0;font-size:.88rem">${rows}</ul></div></div>`}
function dsgTab(){const ta='width:100%;padding:10px;border-radius:10px;background:#0b0e1a;color:var(--ink);border:1px solid var(--line);font-family:monospace',sel='flex:1;padding:9px;border-radius:9px;background:#0b0e1a;color:var(--ink);border:1px solid var(--line)',
  t=(k,l,ph)=>`<label class="lbl">${l}</label><div class="row"><input type="text" value="${esc(CF[k]===undefined?'':CF[k])}" placeholder="${esc(ph||'')}" onchange="cf('${k}',this.value,'text');admView()"></div>`,
  ck=(k,l,d)=>`<label class="lbl"><input type="checkbox" ${(CF[k]===undefined?d:CF[k])?'checked':''} onchange="cf('${k}',this.checked,'bool');admView()"> ${l}</label>`,
  ar=(k,l,ph,rows)=>`<label class="lbl">${l}</label><textarea rows="${rows||4}" style="${ta}" placeholder="${esc(ph||'')}" onchange="cf('${k}',this.value,'text')">${esc(CF[k]||'')}</textarea>`,
  se=(k,l,o)=>`<label class="lbl">${l}</label><div class="row"><select style="${sel}" onchange="cf('${k}',this.value,'text');admView()">${o.map(([v,n])=>`<option value="${v}" ${(CF[k]||o[0][0])===v?'selected':''}>${n}</option>`).join('')}</select></div>`;
  return`<div class="grid2"><div class="panelbox"><h3>Identitas dan banner</h3>${t('logo','Logo (emoji atau URL gambar)','🎰')}${ck('showSub','Tampilkan subjudul',true)}${ck('heroOn','Tampilkan banner sambutan',false)}${t('heroT','Judul banner')}${t('heroX','Teks banner')}</div>
  <div class="panelbox"><h3>Latar dan gaya</h3>${se('bgm','Jenis latar',[['grad','Gradasi tema'],['solid','Warna polos'],['img','Gambar (URL)']])}${t('bgimg','URL gambar latar','https://...')}${se('cardSt','Gaya kartu',[['glass','Kaca'],['solid','Solid'],['outline','Garis tepi']])}${se('btnSt','Gaya tombol',[['round','Membulat'],['pill','Kapsul'],['square','Kotak']])}${se('chipSt','Gaya chip',[['gold','Warna aksen'],['rainbow','Warna-warni']])}</div></div>
  <div class="grid2"><div class="panelbox"><h3>Roda dan efek</h3>${ck('w3','Roda 3D (jika perangkat mendukung)',true)}${ck('fxOn','Efek konfeti saat menang',true)}${t('fs','Ukuran huruf (persen, 85 sampai 125)','100')}</div><div class="panelbox"><h3>Tautan di footer</h3>${ar('links','Satu tautan per baris, format Nama|https://alamat','Instagram|https://instagram.com/akun',4)}</div></div>
  <div class="panelbox" style="margin-top:14px"><h3>CSS kustom (lanjutan)</h3>${ar('css','Aturan CSS tambahan untuk halaman pemain','.card{border-radius:30px}',6)}</div>
  <p class="note">Warna, tema siap pakai, gaya huruf, dan tata letak ada di halaman Tampilan.</p><div class="row"><a class="btn gold" href="index.html" target="_blank" rel="noopener">Buka pratinjau halaman pemain</a></div>`}
/* ---------- Level dan XP ---------- */
const LV_TITLES_DEF='1|Pemula\n5|Perunggu\n10|Perak\n20|Emas\n35|Platinum\n50|Berlian\n75|Legenda';
const lvK=()=>({on:CF.lvOn!==false,base:Math.max(1,+CF.lvBase||100),pow:Math.max(1,+CF.lvPow||1.6),max:Math.max(2,Math.min(500,+CF.lvMax||100)),flat:Math.max(0,CF.lvFlat===undefined?10:+CF.lvFlat),chipPer:Math.max(1,+CF.lvChip||10),ramp:Math.max(1,+CF.lvRamp||300),twRef:Math.max(1,+CF.lvTw||20000),bonus:Math.max(0,CF.lvBonus===undefined?25:+CF.lvBonus)});
const lvNeed=(L,k)=>Math.round(k.base*Math.pow(L,k.pow));
function lvOf(xp,k){k=k||lvK();let L=1,r=Math.max(0,Math.floor(xp||0));while(L<k.max&&r>=lvNeed(L,k)){r-=lvNeed(L,k);L++}return{lv:L,cur:r,need:L>=k.max?0:lvNeed(L,k)}}
function lvTitle(L){const rows=String(CF.lvTitles||LV_TITLES_DEF).split('\n').map(x=>x.split('|')).filter(x=>+x[0]>0&&(x[1]||'').trim()).map(x=>[+x[0],x[1].trim()]).sort((a,b)=>a[0]-b[0]);let t='Pemula';rows.forEach(r=>{if(L>=r[0])t=r[1]});return t}
function lvMult(p,k){k=k||lvK();return 1+Math.min(1,(p.rn||0)/k.ramp)+.5*Math.min(1,(p.tw||0)/k.twRef)}
function lvGain(p,wg,k){k=k||lvK();return k.on&&wg>0?Math.round((k.flat+wg/k.chipPer)*lvMult(p,k)):0}
function lvCss(){if(document.getElementById('lvcss'))return;const s=document.createElement('style');s.id='lvcss';s.textContent=`.lvb{display:flex;flex-direction:column;gap:3px;min-width:56px;font-size:.78rem;line-height:1}.lvb b{color:var(--acc)}.xpb{display:block;height:5px;border-radius:9px;background:rgba(255,255,255,.18);overflow:hidden}.xpb u{display:block;height:100%;text-decoration:none;background:linear-gradient(90deg,var(--acc),#fff8)}.xpb.big{height:10px;margin:6px 0}.lvbox{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px}.lvh{display:flex;justify-content:space-between;align-items:baseline}.lvh b{font-size:1.15rem;color:var(--acc)}.lvs{display:flex;flex-wrap:wrap;gap:6px 14px;margin:6px 0;font-size:.8rem;opacity:.85}`;document.head.appendChild(s)}
function lvBadge(p){if(CF.lvOn===false)return'';const a=lvOf(p.xp),pc=a.need?Math.min(100,a.cur/a.need*100):100;return`<span class="lvb" title="${esc(lvTitle(a.lv))}: ${fmt(a.cur)} / ${fmt(a.need)} XP"><b>Lv ${a.lv}</b><i class="xpb"><u style="width:${pc}%"></u></i></span>`}
function lvBox(p){if(CF.lvOn===false)return'';const k=lvK(),a=lvOf(p.xp,k),pc=a.need?Math.min(100,a.cur/a.need*100):100,m=lvMult(p,k),nx=a.need?`${fmt(a.cur)} / ${fmt(a.need)} XP menuju level ${a.lv+1}`:'Level maksimum';
  return`<div class="lvbox"><div class="lvh"><b>Level ${a.lv}</b><span>${esc(lvTitle(a.lv))}</span></div><div class="xpb big"><u style="width:${pc}%"></u></div><small>${nx}</small><div class="lvs"><span>Total ${fmt(p.xp||0)} XP</span><span>${fmt(p.rn||0)} putaran</span><span>Pengali XP ${m.toFixed(2)}x</span></div><small>Naik level memberi bonus chip sebesar ${fmt(k.bonus)} x nomor level.</small></div>`}
let lastLv=null,lastLvId=null;
function lvWatch(){const p=me?P(me):null;if(!p){lastLv=null;lastLvId=null;return}const L=p.lv||lvOf(p.xp).lv;if(lastLvId!==p.id){lastLvId=p.id;lastLv=L;return}if(L>lastLv){lastLv=L;if(CF.lvOn!==false){toast('Naik ke level '+L+' ('+lvTitle(L)+')!');confetti();winSound()}}else lastLv=L}
function lvTab(){const k=lvK(),f=(key,l,t)=>`<label class="lbl">${l}</label><div class="row"><input type="${t||'text'}" value="${esc(CF[key]===undefined?'':CF[key])}" onchange="cf('${key}',this.value,'${t||'text'}');admView()"></div>`;
  const rows=[];let cum=0;for(let L=1;L<=Math.min(k.max,30);L++){const nd=L>=k.max?0:lvNeed(L,k);rows.push(`<tr><td>${L}</td><td>${esc(lvTitle(L))}</td><td class="n">${nd?fmt(nd):'-'}</td><td class="n">${fmt(cum)}</td><td class="n">${fmt(k.bonus*L)}</td></tr>`);cum+=nd}
  const ex=(r,tw,w)=>Math.round((k.flat+w/k.chipPer)*(1+Math.min(1,r/k.ramp)+.5*Math.min(1,tw/k.twRef))),a=ex(0,0,100),b=ex(k.ramp/2,k.twRef/2,100),c=ex(k.ramp,k.twRef,100),ta='width:100%;padding:10px;border-radius:10px;background:#0b0e1a;color:var(--ink);border:1px solid var(--line);font-family:monospace';
  return`<div class="grid2"><div class="panelbox"><h3>Pengaturan level</h3><label class="lbl"><input type="checkbox" ${CF.lvOn!==false?'checked':''} onchange="cf('lvOn',this.checked,'bool');admView()"> Sistem level aktif</label>${f('lvBase','XP untuk naik dari level 1 ke 2','number')}${f('lvPow','Kelengkungan kurva (1 = kebutuhan naik rata, 2 = makin berat)','number')}${f('lvMax','Level maksimum','number')}${f('lvFlat','XP dasar per putaran yang diikuti','number')}${f('lvChip','Jumlah chip taruhan untuk 1 XP','number')}${f('lvRamp','Jumlah putaran sampai pengali waktu bermain penuh','number')}${f('lvTw','Total taruhan sampai pengali chip penuh','number')}${f('lvBonus','Bonus chip per level (dikali nomor level)','number')}</div>
  <div class="panelbox"><h3>Contoh XP per putaran (taruhan 100 chip)</h3><ul style="margin:0;padding-left:18px;line-height:1.7"><li>Pemain baru: <b>+${a} XP</b>, sekitar ${Math.ceil(lvNeed(1,k)/Math.max(1,a))} putaran ke level 2</li><li>Pemain menengah (setengah pengali): <b>+${b} XP</b></li><li>Pemain lama (pengali penuh ${(2.5).toFixed(1)}x): <b>+${c} XP</b></li></ul><div class="note">XP = (XP dasar + chip taruhan / chip per XP) x pengali. Pengali naik dari 1x sampai 2,5x seiring lama bermain (jumlah putaran) dan total chip yang dipertaruhkan, sehingga level naik makin cepat.</div>
  <h3>Gelar (satu baris per gelar: level|nama)</h3><textarea rows="7" style="${ta}" onchange="cf('lvTitles',this.value,'text')">${esc(CF.lvTitles||LV_TITLES_DEF)}</textarea></div></div>
  <h3>Tabel level (30 pertama)</h3><div class="tw"><table class="tbl"><thead><tr><th>Level</th><th>Gelar</th><th>XP ke level berikutnya</th><th>XP kumulatif</th><th>Bonus chip</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
/* ---------- Chat pemain dan admin ---------- */
let CH=[],chatOpen=false,cinit=false,achat=null,SEEN={};try{SEEN=JSON.parse(localStorage.getItem('rrseen')||'{}')}catch(e){}
function seenSet(k,at){SEEN[k]=at;try{localStorage.setItem('rrseen',JSON.stringify(SEEN))}catch(e){}}
const thread=pid=>CH.filter(m=>m.pid===pid).sort((a,b)=>a.at-b.at);
const unread=(pid,side,k)=>thread(pid).filter(m=>m.from!==side&&m.at>(SEEN[k]||0)).length;
const msgsHTML=(pid,side)=>thread(pid).map(m=>`<div class="m ${m.from===side?'me':''}"><small>${m.from==='a'?'Admin':esc(m.name||'Pemain')}</small>${esc(m.text)}</div>`).join('')||'<p class="note">Belum ada pesan.</p>';
function sendChat(pid,from,name,input){const t=input.value.trim();if(!t)return;input.value='';const th=thread(pid);if(th.length>60)th.slice(0,th.length-50).forEach(m=>D.doc('chat/'+m.id).delete());W('chat/'+uid(),{pid,from,name,text:t.slice(0,300),at:Date.now()},true)}
function clearChat(pid){thread(pid).forEach(m=>D.doc('chat/'+m.id).delete());toast('Chat dihapus')}
function chatView(){const p=P(act),b=$('chatBadge'),u=p?unread(p.id,'p','p'+p.id):0;b.hidden=!u||chatOpen;b.textContent=u;if(!chatOpen)return;
  $('chatTitle').textContent=p?'Chat admin: '+p.name:'Chat dengan admin';const M=$('chatMsgs');
  if(!p){M.innerHTML='<p class="note">Masuk atau pilih pemain dulu untuk chat dengan admin.</p>';return}
  M.innerHTML=msgsHTML(p.id,'p');M.scrollTop=M.scrollHeight;const t=thread(p.id);if(t.length)seenSet('p'+p.id,t[t.length-1].at)}
function chatTab(){if(!achat||!P(achat))achat=(PL[0]||{}).id||null;const p=P(achat);if(!p)return'<p class="note">Belum ada pemain.</p>';
  const bs=PL.map(q=>{const u=unread(q.id,'a','a'+q.id);return`<button class="${q.id===achat?'on':''}" onclick="achat='${q.id}';admView()">${esc(q.name)}${u?' ('+u+')':''}</button>`}).join('');
  return`<div class="tabs" style="margin-top:0">${bs}</div><div class="msgs" id="amsgs">${msgsHTML(p.id,'a')}</div><div class="row"><input type="text" id="ain" maxlength="300" placeholder="Balas ${esc(p.name)}…" onkeydown="if(event.key==='Enter')sendChat('${p.id}','a','Admin',this)"><button class="gold" onclick="sendChat('${p.id}','a','Admin',$('ain'))">Kirim</button><button onclick="clearChat('${p.id}')">Hapus chat</button></div>`}
/* ---------- Mulai ---------- */
$('rep').onclick=repeatBets;$('clr').onclick=clearBets;$('admBtn').onclick=openAdm;
$('auto').setAttribute('aria-pressed',autoRep);$('snd').textContent=SFX.on?'🔊':'🔇';$('snd').setAttribute('aria-pressed',SFX.on);
$('auto').onclick=()=>{autoRep=!autoRep;try{localStorage.setItem('rrauto',autoRep?'1':'0')}catch(e){}$('auto').setAttribute('aria-pressed',autoRep);toast(autoRep?'Auto ulang taruhan aktif':'Auto ulang taruhan mati')};
$('snd').onclick=()=>{SFX.on=!SFX.on;try{localStorage.setItem('rrsfx',SFX.on?'1':'0')}catch(e){}$('snd').textContent=SFX.on?'🔊':'🔇';$('snd').setAttribute('aria-pressed',SFX.on);if(SFX.on){audio();beep(880,.08,.05)}};
$('histBtn').onclick=()=>{$('hm').hidden=false;renderHist()};$('hmx').onclick=()=>{$('hm').hidden=true};
$('ht1').onclick=()=>{$('hp1').hidden=false;$('hp2').hidden=true;$('ht1').classList.add('on');$('ht2').classList.remove('on')};
$('ht2').onclick=()=>{$('hp1').hidden=true;$('hp2').hidden=false;$('ht2').classList.add('on');$('ht1').classList.remove('on')};
['hm','pm'].forEach(i=>$(i).addEventListener('click',e=>{if(e.target===$(i))$(i).hidden=true}));
$('chatFab').onclick=()=>{chatOpen=!chatOpen;$('chatBox').hidden=!chatOpen;chatView();if(D&&D.fast)D.fast(chatOpen);if(chatOpen)$('chatIn').focus()};
$('chatX').onclick=()=>{chatOpen=false;$('chatBox').hidden=true;chatView();if(D&&D.fast)D.fast(false)};
$('chatSend').onclick=()=>{const p=P(act);if(!p)return toast('Masuk dulu untuk chat');sendChat(p.id,'p',p.name,$('chatIn'))};
$('chatIn').onkeydown=e=>{if(e.key==='Enter')$('chatSend').click()};
const hb=()=>{const a=isAdm();$('admBtn').hidden=!a;$('chatFab').hidden=a;document.body.classList.toggle('isadm',a);document.body.classList.toggle('admpage',a);if(a){chatOpen=false;$('chatBox').hidden=true;if(!$('ov').classList.contains('s'))openAdm()}else $('ov').classList.remove('s')};hb();addEventListener('hashchange',hb);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('hm').hidden=true;$('pm').hidden=true;if($('ov').classList.contains('s'))closeAdm()}});
(async()=>{
  theme();render();
  W3ok=!!(window.W3&&W3.init($('w3d')));theme();
  D=apiDB();SYNC=true;
  
  try{me=sessionStorage.getItem('rrme')||localStorage.getItem('rrme')||null}catch(e){}act=me;
  D.doc('app/cfg').onSnapshot(s=>{
    if(s.exists){const d=s.data();CF={...DEF,...d.cfg};APW=d.pw||'';cfgOk=true;if(isAdm()){if(!adm&&D.role&&D.role()==='a')adm=true;if(!/INPUT|SELECT/.test((document.activeElement||{}).tagName))admView()}if(!chip||!CF.chips.includes(chip))chip=CF.chips[0]||10;theme();render()}
    else if(!creating){creating=true;(async()=>{APW=await H('admin123');CF={...DEF};cfgOk=true;await wc();theme();render()})()}},e=>toast('Koneksi database terputus'));
  D.collection('players').onSnapshot(s=>{PL=s.docs.map(d=>({...d.data(),id:d.id}));plOk=true;lvWatch();if(me&&!P(me)){me=null;act=null;akey=''}if(!act&&!me){const o=PL.find(p=>!p.ph);act=o?o.id:null}settle();render();if(adm&&(tab===0||tab===5||tab===6||tab===8)&&!/INPUT|SELECT/.test((document.activeElement||{}).tagName))admView()},e=>toast('Koneksi database terputus'));
  if(isAdm())D.collection('logs').onSnapshot(s=>{LG=s.docs.map(d=>({...d.data(),id:d.id})).sort((a,b)=>b.t-a.t);if(LG.length>200)LG.slice(200).forEach(l=>D.doc('logs/'+l.id).delete());if(adm&&tab===9&&!/INPUT|SELECT/.test((document.activeElement||{}).tagName))admView()},e=>{});
  D.collection('chat').onSnapshot(s=>{const old=new Set(CH.map(m=>m.id));CH=s.docs.map(d=>({...d.data(),id:d.id}));
    if(cinit){const isA=isAdm();CH.filter(m=>!old.has(m.id)).forEach(m=>{if(isA&&m.from==='p'&&!(adm&&tab===4&&achat===m.pid))toast('Pesan baru dari '+(m.name||'pemain'));else if(!isA&&m.from==='a'&&m.pid===act&&!chatOpen)toast('Pesan baru dari admin')})}
    cinit=true;chatView();if(adm&&tab===4){const M=$('amsgs');if(M&&achat){M.innerHTML=msgsHTML(achat,'a');M.scrollTop=M.scrollHeight;const t=thread(achat);if(t.length)seenSet('a'+achat,t[t.length-1].at)}}},e=>toast('Koneksi database terputus'));
  D.doc('game/round').onSnapshot(s=>{const d=s.exists?s.data():{id:0,n:0,h:[]},nr={id:d.id||0,n:d.n||0,h:d.h||[],ms:d.ms||6000,at:d.at||0,next:d.next||0,rev:d.rev||0};
    if(seen===-1){RD=nr;seen=nr.id;left=SEC();const el=SNOW()-nr.at,tot=nr.ms+150+rdMs();
      if(nr.at&&el>=0&&el<tot){rvId=nr.id-1;spinning=true;phase=el<nr.ms+150?'spin':'wait';place(nr.h[1]);$('res').innerHTML='<span class="note">'+(phase==='spin'?'Roda berputar…':'Roda berhenti. Menunggu hasil…')+'</span>';setTimeout(()=>reveal(nr),tot-el)}else{rvId=nr.id;showLast()}settle();render();return}
    if(nr.id>seen){RD=nr;seen=nr.id;startSpin(nr)}else if(nr.id<seen){RD=nr;seen=nr.id;rvId=nr.id;showLast();render()}else{RD=nr;renderHist()}},e=>toast('Koneksi database terputus'));
})();
