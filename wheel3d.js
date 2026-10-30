/* Roda roulette 3D realistis (Three.js r128): mangkuk kayu, jalur bola miring, sekat krom, turret dan gagang emas,
   pantulan lingkungan, bayangan lembut. Roda 24 kantong (1-24). Jika WebGL tidak tersedia, tampilan 2D dipakai. */
(function(){
const ORDER=[18,9,4,22,11,2,24,15,7,20,13,5,1,12,19,23,10,8,21,14,6,3,16,17],REDS=new Set([1,4,6,7,10,11,13,16,18,19,21,24]),N=24,TAU=Math.PI*2,SEG=TAU/N;
let R,S,C,wheel,ball,host,anim=null;const gold=[];
const colOf=n=>REDS.has(n)?0xb3121f:0x141414;
const thetaFor=i=>Math.PI/2-(i+.5)*SEG;
const norm=a=>((a%TAU)+TAU)%TAU;
const sm=t=>t*t*(3-2*t);
function numTex(n){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.font='bold 76px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(0,0,0,.55)';x.fillText(n,66,72);x.fillStyle='#f6e7b0';x.fillText(n,64,69);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t}
function woodTex(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,512,0);g.addColorStop(0,'#5a3418');g.addColorStop(.5,'#7a4a24');g.addColorStop(1,'#4a2a12');x.fillStyle=g;x.fillRect(0,0,512,512);
  for(let i=0;i<260;i++){x.strokeStyle='rgba('+(20+Math.random()*30|0)+','+(8+Math.random()*14|0)+',4,'+(.05+Math.random()*.12)+')';x.lineWidth=.5+Math.random()*2;const y=Math.random()*512;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(170,y+(Math.random()-.5)*14,340,y+(Math.random()-.5)*14,512,y+(Math.random()-.5)*8);x.stroke()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,1);t.encoding=THREE.sRGBEncoding;return t}
function envTex(){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#fff6e0');g.addColorStop(.45,'#6b5a45');g.addColorStop(.5,'#1a1410');g.addColorStop(1,'#0a0806');x.fillStyle=g;x.fillRect(0,0,512,256);
  x.fillStyle='rgba(255,244,214,.95)';[[60,50,120,40],[250,30,150,36],[420,55,90,40]].forEach(r=>x.fillRect(r[0],r[1],r[2],r[3]));const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;return t}
function draw(){R.render(S,C)}
function size(){const w=host.clientWidth||340,h=Math.round(w*.86);R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix();draw()}
function sy(r){if(r>=4.75)return .55;if(r>=4.45)return .38+(r-4.45)/.3*.17;if(r>=4.1)return .16+(r-4.1)/.35*.22;if(r>=3.85)return .04+(r-3.85)/.25*.12;if(r>=3.75)return .04;return 0}
function ballAt(psi,r,hop){ball.position.set(r*Math.cos(psi),sy(r)+.13+(hop||0),-r*Math.sin(psi))}
function ballR(k){if(k<.55)return 4.55-.12*(k/.55);if(k<.82)return 4.43-.61*sm((k-.55)/.27);return 3.82-.82*sm(Math.min(1,(k-.82)/.18))}
function init(h){
  if(!window.THREE)return false;host=h;
  try{R=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){return false}
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(R.domElement);
  S=new THREE.Scene();C=new THREE.PerspectiveCamera(30,1/.86,.1,120);C.position.set(0,13.4,16.2);C.lookAt(0,-.3,.4);
  try{const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromEquirectangular(envTex()).texture}catch(e){}
  S.add(new THREE.HemisphereLight(0xfff1d6,0x2a1a0a,.5));
  const dl=new THREE.DirectionalLight(0xfff3dd,1.05);dl.position.set(5,12,6);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);const sc=dl.shadow.camera;sc.left=-8;sc.right=8;sc.top=8;sc.bottom=-8;sc.near=1;sc.far=40;dl.shadow.bias=-.0004;S.add(dl);
  const fl=new THREE.PointLight(0xffc77a,.55,40);fl.position.set(-6,5,-3);S.add(fl);
  const goldMat=()=>{const m=new THREE.MeshStandardMaterial({color:0xf5c542,metalness:1,roughness:.24,envMapIntensity:1.4});gold.push(m);return m};
  const chrome=new THREE.MeshStandardMaterial({color:0xdfe3ea,metalness:1,roughness:.18,envMapIntensity:1.5});
  const wood=new THREE.MeshPhysicalMaterial({map:woodTex(),roughness:.38,clearcoat:1,clearcoatRoughness:.12,side:THREE.DoubleSide});
  const prof=[[.01,-1],[5.3,-1],[5.55,-.55],[5.6,.1],[5.5,.5],[5.25,.62],[4.95,.62],[4.75,.55],[4.45,.38],[4.1,.16],[3.85,.04],[3.75,-.02],[3.75,-.2],[.01,-.2]].map(p=>new THREE.Vector2(p[0],p[1]));
  S.add(new THREE.Mesh(new THREE.LatheGeometry(prof,96),wood));
  const tor=(r,t,y,m)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,14,120),m);o.rotation.x=Math.PI/2;o.position.y=y;S.add(o)};
  tor(4.9,.09,.62,goldMat());tor(3.83,.05,.05,goldMat());tor(5.52,.05,.38,chrome);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.38}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.02;ground.receiveShadow=true;S.add(ground);
  wheel=new THREE.Group();S.add(wheel);
  ORDER.forEach((n,i)=>{
    const w=new THREE.Mesh(new THREE.RingGeometry(1.5,3.72,4,1,i*SEG,SEG),new THREE.MeshPhysicalMaterial({color:colOf(n),roughness:.42,clearcoat:.85,clearcoatRoughness:.2,side:THREE.DoubleSide}));w.rotation.x=-Math.PI/2;wheel.add(w);
    const phi=(i+.5)*SEG,g=new THREE.Group();g.position.set(3.0*Math.cos(phi),.012,-3.0*Math.sin(phi));g.rotation.y=Math.PI/2-phi;
    const t=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:numTex(n),transparent:true}));t.rotation.x=-Math.PI/2;g.add(t);wheel.add(g);
    const a=i*SEG,f=new THREE.Mesh(new THREE.BoxGeometry(2.25,.15,.05),chrome);f.position.set(2.6*Math.cos(a),.075,-2.6*Math.sin(a));f.rotation.y=a;wheel.add(f)});
  const lip=new THREE.Mesh(new THREE.TorusGeometry(3.74,.07,12,120),chrome);lip.rotation.x=Math.PI/2;lip.position.y=.1;wheel.add(lip);
  const dish=new THREE.Mesh(new THREE.CylinderGeometry(.6,1.55,.5,64,1,true),wood);dish.position.y=.22;wheel.add(dish);
  const turret=new THREE.Mesh(new THREE.LatheGeometry([[.62,.4],[.5,.55],[.36,.7],[.3,1],[.24,1.3],[.14,1.6],[.01,1.7]].map(p=>new THREE.Vector2(p[0],p[1])),48),goldMat());wheel.add(turret);
  [0,Math.PI/2].forEach(a=>{const arm=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,1.9,16),goldMat());arm.rotation.z=Math.PI/2;arm.rotation.y=a;arm.position.y=1.05;wheel.add(arm)});
  [[.95,0],[-.95,0],[0,.95],[0,-.95]].forEach(p=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.11,20,20),goldMat());s.position.set(p[0],1.05,p[1]);wheel.add(s)});
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.17,24,24),goldMat());knob.position.y=1.72;wheel.add(knob);
  const pt=new THREE.Mesh(new THREE.ConeGeometry(.2,.55,16),goldMat());pt.rotation.x=Math.PI;pt.position.set(0,.95,-5.15);S.add(pt);
  ball=new THREE.Mesh(new THREE.SphereGeometry(.13,32,32),new THREE.MeshPhysicalMaterial({color:0xfafaf5,roughness:.1,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.3}));S.add(ball);
  S.traverse(o=>{if(o.isMesh&&o!==ground){o.castShadow=true;o.receiveShadow=true}});
  wheel.rotation.y=thetaFor(0);ballAt(Math.PI/2,3.0);
  size();if(window.ResizeObserver)new ResizeObserver(size).observe(host);else addEventListener('resize',size);
  return true}
function setAccent(hex){if(!R)return;gold.forEach(m=>m.color.set(hex));draw()}
function place(n){if(!R)return;const i=ORDER.indexOf(n);if(i<0)return;anim=null;wheel.rotation.y=thetaFor(i);ballAt(Math.PI/2,3.0);draw()}
function spin(n,ms){if(!R)return;const i=ORDER.indexOf(n);if(i<0)return;const th0=norm(wheel.rotation.y),tgt=norm(thetaFor(i)),th1=th0+norm(tgt-th0)+TAU*(5+Math.floor(Math.random()*2));
  anim={t0:performance.now(),ms:Math.max(1000,ms),th0,th1,bt:7+Math.random()*2};requestAnimationFrame(frame)}
function frame(now){if(!anim)return;const k=Math.min(1,(now-anim.t0)/anim.ms),e1=1-Math.pow(1-k,3),e2=1-Math.pow(1-k,4);
  wheel.rotation.y=anim.th0+(anim.th1-anim.th0)*e1;
  const b=k>.82?(k-.82)/.18:0,hop=k>.82?Math.abs(Math.sin(b*Math.PI*3.5))*(1-b)*.28:0;
  ballAt(Math.PI/2+anim.bt*TAU*(1-e2),ballR(k),hop);draw();if(k<1)requestAnimationFrame(frame);else anim=null}
window.W3={init,spin,place,setAccent};
})();
