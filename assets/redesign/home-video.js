// Muted looping video; restore playback on navigation and back/forward cache returns.
(() => {
  const video = document.getElementById('landscape-video');
  const button = document.getElementById('video-toggle');
  if (!video || !button) return;
  const home = video.closest('[data-page]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = false;
  let pendingPlay = false;
  let leavingPage = false;

  function setButton(paused) {
    const label = paused ? 'Play illustration' : 'Pause illustration';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('path').setAttribute('d', paused ? 'M6 4 15 10 6 16Z' : 'M7 5v10m6-10v10');
  }
  function shouldPlay() {
    return !leavingPage && !home.hidden && !document.hidden && !reducedMotion.matches && !manuallyPaused;
  }
  function resume(reset = false) {
    if (reset) manuallyPaused = false;
    if (!shouldPlay()) {
      video.pause();
      setButton(true);
      return;
    }
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    if (!video.paused || pendingPlay) return;
    pendingPlay = true;
    video.play().then(() => setButton(false)).catch(() => {
      // Browser policy may require a gesture; keep a usable play control.
      button.classList.add('needs-play');
      setButton(true);
    }).finally(() => {
      pendingPlay = false;
      if (!shouldPlay()) video.pause();
    });
  }
  button.addEventListener('click', () => {
    manuallyPaused = !video.paused;
    resume();
  });
  video.addEventListener('playing', () => {
    button.classList.remove('needs-play');
    setButton(false);
  });
  video.addEventListener('pause', () => {
    if (shouldPlay()) requestAnimationFrame(() => resume());
  });
  video.addEventListener('canplay', () => resume());
  video.addEventListener('ended', () => resume());
  window.addEventListener('pageshow', () => { leavingPage = false; resume(true); });
  window.addEventListener('pagehide', () => { leavingPage = true; video.pause(); });
  window.addEventListener('hashchange', () => resume(true));
  document.addEventListener('visibilitychange', () => resume(!document.hidden));
  reducedMotion.addEventListener('change', () => resume(true));
  // Retry blocked autoplay on the next normal interaction, without polling.
  for (const event of ['pointerdown', 'keydown']) {
    document.addEventListener(event, e => {
      if (!button.contains(e.target) && video.paused && !manuallyPaused) resume();
    }, {passive: true});
  }
  resume();
})();

(()=>{const video=document.getElementById('stitch-video'),button=document.getElementById('stitch-video-toggle');if(!video||!button)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=false;function sync(){if(reduced.matches||paused){video.pause();return}video.muted=true;video.playbackRate=0.8;video.play().catch(()=>{button.style.opacity='1';button.setAttribute('aria-label','Play stitching animation')})}button.addEventListener('click',()=>{paused=!video.paused;button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Resume stitching animation':'Pause stitching animation');button.firstElementChild.textContent=paused?'▶':'Ⅱ';sync()});window.addEventListener('pageshow',()=>{paused=false;sync()});document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});reduced.addEventListener('change',sync);sync()})();

(()=>{const v=document.getElementById('stitch-video'),canvas=document.getElementById('stitch-canvas');if(!v||!canvas)return;const ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=640;canvas.height=360;function frame(){if(v.readyState>=2){ctx.clearRect(0,0,640,360);ctx.drawImage(v,0,0,640,360);const img=ctx.getImageData(0,0,640,360),d=img.data;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],lum=.299*r+.587*g+.114*b;const chroma=Math.max(0,r-b);const strength=Math.max((170-lum)/45,(chroma-14)/25);d[i+3]=Math.round(Math.max(0,Math.min(1,strength))*255)}ctx.putImageData(img,0,0)}requestAnimationFrame(frame)}requestAnimationFrame(frame)})();
