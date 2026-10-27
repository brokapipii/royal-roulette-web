/* Berkas bersama untuk login.html dan panduan.html */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmt=n=>Number(n).toLocaleString('id-ID');
async function H(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('rr:'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return'p:'+btoa(unescape(encodeURIComponent(s)))}}
const normPh=s=>{let d=String(s||'').replace(/\D/g,'');if(d.startsWith('62'))d='0'+d.slice(2);return d};
const okEm=s=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const uname=p=>(p.user||p.name).toLowerCase();
const DEF={title:'Royal Roulette',sub:'Pasang chip, putar roda, dan lihat siapa yang beruntung.',acc:'#f5c542',bg1:'#3b0a1e',bg2:'#0b0612',felt:'#0a5c36',pn:24,pc:1,pd:2,reg:true,font:'klasik',rad:18,wsz:340,lay:'side',pat:'1',sec:30,rd:3,ms:6000,chips:[10,50,100,500],start:1000,foot:'Permainan hiburan dengan chip virtual.',appr:false,invite:'',maxp:0,minb:0,maxb:0,maint:false,maintMsg:'Permainan sedang ditutup sementara untuk pemeliharaan.',lgTitle:'Akun pemain',lgIntro:'',lgIn:'Masuk',lgUp:'Daftar',lgUser:'Username',lgPass:'Password',lgName:'Nama lengkap',lgPhone:'Nomor telepon',lgEmail:'Email',lgContactOn:true,lgContact:'Kontak atau HP (opsional)',lgBtnIn:'Masuk',lgBtnUp:'Buat akun',lgTerms:'',lgHelp:'Lupa password? Minta admin untuk membuatkan yang baru.',lgWelcome:'Akun dibuat. Selamat bermain!',lgSt:'box',logo:'🎰',showSub:true,heroOn:false,heroT:'',heroX:'',bgm:'grad',bgimg:'',cardSt:'glass',btnSt:'round',chipSt:'gold',w3:true,fxOn:true,fs:100,links:'',css:''};
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
const FONTS={klasik:["'Bodoni Moda',Georgia,serif","Figtree,system-ui,sans-serif"],neon:["Orbitron,system-ui,sans-serif","Poppins,system-ui,sans-serif"],elegan:["'Playfair Display',Georgia,serif","Poppins,system-ui,sans-serif"]};
function applyTheme(c){const r=document.documentElement.style,f=FONTS[c.font]||FONTS.klasik;['acc','bg1','bg2','felt'].forEach(k=>r.setProperty('--'+k,c[k]));r.setProperty('--fd',f[0]);r.setProperty('--fb',f[1]);r.setProperty('--rad',(+c.rad||18)+'px');
  r.fontSize=Math.min(125,Math.max(85,+c.fs||100))+'%';r.setProperty('--bgimg',c.bgimg&&/^https?:/.test(c.bgimg)?'url("'+String(c.bgimg).replace(/["\\]/g,'')+'")':'none');
  document.body.className=document.body.className.replace(/\b(pat\d|card-\S+|btn-\S+|chip-\S+|bg-\S+)\b/g,'').replace(/\s+/g,' ').trim();document.body.classList.add('pat'+c.pat,'card-'+(c.cardSt||'glass'),'btn-'+(c.btnSt||'round'),'bg-'+(c.bgm||'grad'));
  document.querySelectorAll('[data-t]').forEach(e=>{e.textContent=c[e.dataset.t]||''});
  let st=document.getElementById('ccss');if(!st){st=document.createElement('style');st.id='ccss';document.head.appendChild(st)}st.textContent=String(c.css||'');
  document.title=(document.body.dataset.page||'')+' | '+c.title}
function getSession(){try{return sessionStorage.getItem('rrme')||localStorage.getItem('rrme')||null}catch(e){return null}}
