(() => {
 if (document.getElementById('hh-mobile')) return;
 // Use the phone's viewport instead of WebView's desktop-width fallback.
 let viewport = document.querySelector('meta[name="viewport"]');
 if (!viewport) { viewport = document.createElement('meta'); viewport.name = 'viewport'; document.head.append(viewport); }
 viewport.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
 const sizing = document.createElement('style');
 sizing.textContent = 'html{margin:0!important;overflow:hidden!important;background:#123222}body{margin:0!important;transform-origin:0 0!important}';
 document.head.append(sizing);
 const host = document.createElement('div'); host.id = 'hh-mobile'; document.documentElement.append(host);
 const root = host.attachShadow({mode:'open'});
 function fitControls() {
  const v = window.visualViewport;
  const width = v ? v.width : window.innerWidth, height = v ? v.height : window.innerHeight;
  Object.assign(host.style, {position:'fixed',inset:'auto',left:`${v ? v.offsetLeft : 0}px`,top:`${v ? v.offsetTop : 0}px`,width:`${width}px`,height:`${height}px`});
  host.style.setProperty('--u', `${Math.min(width / 100, height / 50)}px`);
 }
 window.addEventListener('resize', fitControls);
 window.visualViewport?.addEventListener('resize', fitControls);
 window.visualViewport?.addEventListener('scroll', fitControls);
 fitControls();
 let pending=false;
 function fitPage(){
  pending=false;const body=document.body;if(!body)return;
  const w=window.innerWidth,h=window.innerHeight;
  body.style.transform='none';body.style.width=Math.max(980,w)+'px';
  const cw=Math.max(body.scrollWidth,body.offsetWidth),ch=Math.max(body.scrollHeight,body.offsetHeight,1);
  const scale=Math.min(1,w/cw,h/ch);
  body.style.transform='translate('+Math.max(0,(w-cw*scale)/2)+'px,'+Math.max(0,(h-ch*scale)/2)+'px) scale('+scale+')';
 }
 function scheduleFit(){if(!pending){pending=true;requestAnimationFrame(fitPage)}}
 window.addEventListener('resize',scheduleFit);
 window.visualViewport?.addEventListener('resize',scheduleFit);
 document.addEventListener('load',scheduleFit,true);
 new MutationObserver(scheduleFit).observe(document.body,{childList:true,subtree:true});
 new ResizeObserver(scheduleFit).observe(document.body);
 scheduleFit();
 const defaults = {Left:'ArrowLeft',Right:'ArrowRight',Up:'ArrowUp',Down:'ArrowDown',Jump:'Space',Attack:'KeyA',Block:'KeyS'};
 let keys; try { keys = {...defaults,...JSON.parse(localStorage.getItem('hh-mobile-keys') || '{}')}; } catch { keys = {...defaults}; }
 root.innerHTML = `<style>
 :host{position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:Arial,sans-serif;color:white;--u:min(1vw,2vh)}
 *{box-sizing:border-box}button{pointer-events:auto;touch-action:none;user-select:none;color:white;font-weight:900;font-style:italic;text-shadow:1px 2px #16350c;border:3px solid #22451b;background:radial-gradient(circle at 35% 25%,#bcf693,#49a62e 58%,#227b19);box-shadow:inset 0 0 0 2px #93cf70,0 2px 3px #102b19;cursor:pointer}
 button:active,button.held{filter:brightness(1.4);transform:scale(.94)}
 .pad{position:absolute;left:max(12px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom));width:calc(20*var(--u));height:calc(20*var(--u));border-radius:50%;background:#326f26a8;border:3px solid #244520;pointer-events:none}
 .pad button{position:absolute;width:36%;height:36%;border:0;box-shadow:none;background:transparent;font-size:calc(4*var(--u));padding:0}
 .up{left:32%;top:0}.down{left:32%;bottom:0}.left{top:32%;left:0}.right{top:32%;right:0}
 .actions{position:absolute;right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));display:flex;align-items:flex-end;gap:8px}
 .actions button{width:calc(15*var(--u));height:calc(15*var(--u));border-radius:50%;font-size:calc(2.4*var(--u))}.actions .block{width:calc(10*var(--u));height:calc(10*var(--u));align-self:flex-start;font-size:calc(1.8*var(--u))}
 .hidden{display:none!important}
 .settings{pointer-events:auto;position:absolute;inset:8% 18%;background:#163d25f5;border:3px solid #89bd55;border-radius:12px;padding:16px;overflow:auto}.settings label{display:inline-flex;flex-direction:column;margin:5px;font-size:13px}.settings input{width:110px;padding:6px}.settings button{padding:8px;margin:8px}.settings p{font-size:13px}
 </style><div class="pad"><button class="up" data-key="Up" aria-label="Move up">▲</button><button class="left" data-key="Left" aria-label="Move left">◀</button><button class="right" data-key="Right" aria-label="Move right">▶</button><button class="down" data-key="Down" aria-label="Move down">▼</button></div><div class="actions"><button class="block" data-key="Block">BLOCK</button><button data-key="Jump">JUMP</button><button data-key="Attack">ATTACK</button></div><button id="mapping" class="hidden" style="position:absolute;right:12px;top:8px;padding:8px">Controls ⚙</button><section class="settings hidden"><b>Control mappings</b><p>Match these keyboard codes to the game's settings. Examples: KeyA, Space, ArrowUp, Escape.</p>${Object.keys(defaults).map(x=>`<label>${x}<input data-map="${x}" aria-label="${x} keyboard code"></label>`).join('')}<div><button id="save">Save</button><button id="close">Close</button></div></section>`;
 const held = new Map();
 // Start unobstructed on every page load; the player enables controls after login.
 const toggle = document.createElement('button');
 toggle.id = 'visibility'; toggle.textContent = 'Show controls';
 toggle.setAttribute('aria-pressed', 'false');
 toggle.style.cssText = 'position:absolute;top:max(8px,env(safe-area-inset-top));left:max(8px,env(safe-area-inset-left));min-height:40px;padding:6px 12px;border-radius:20px;font-size:13px';
 root.append(toggle);
 const controlPanels = ['.pad', '.actions', '#mapping'].map(selector => root.querySelector(selector));
 let controlsVisible = false;
 function setControlsVisible(visible) {
  releaseAll();
  controlsVisible = visible;
  controlPanels.forEach(panel => panel.classList.toggle('hidden', !visible));

  root.querySelector('.settings').classList.add('hidden');

  toggle.textContent = visible ? 'Hide controls' : 'Show controls';
  toggle.setAttribute('aria-pressed', String(visible));
 }
 toggle.onclick = () => setControlsVisible(!controlsVisible);
 setControlsVisible(false);
 function emit(code,down) {
  const key = code === 'Space' ? ' ' : code.startsWith('Key') ? code.slice(3).toLowerCase() : code;
  const num = code === 'Space' ? 32 : code === 'Escape' ? 27 : ({ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40}[code] || key.toUpperCase().charCodeAt(0));
  const target = document.querySelector('canvas') || document.activeElement || document.body;
  target.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key,code,keyCode:num,which:num,bubbles:true,cancelable:true}));
 }
 function release(id){const item=held.get(id);if(!item)return;held.delete(id);item.button.classList.remove('held');if(![...held.values()].some(x=>x.code===item.code))emit(item.code,false);}
 root.querySelectorAll('[data-key]').forEach(button=>{
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);const code=keys[button.dataset.key];held.set(e.pointerId,{code,button});button.classList.add('held');emit(code,true);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,e=>release(e.pointerId)));
 });
 function releaseAll(){[...held.keys()].forEach(release)}
 window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',releaseAll);
 const settings=root.querySelector('.settings');
 root.querySelector('#mapping').onclick=()=>{releaseAll();settings.classList.remove('hidden');root.querySelectorAll('[data-map]').forEach(input=>input.value=keys[input.dataset.map]);};
 root.querySelector('#close').onclick=()=>settings.classList.add('hidden');
 root.querySelector('#save').onclick=()=>{root.querySelectorAll('[data-map]').forEach(input=>keys[input.dataset.map]=input.value.trim()||defaults[input.dataset.map]);try{localStorage.setItem('hh-mobile-keys',JSON.stringify(keys))}catch{}settings.classList.add('hidden');};
})();
