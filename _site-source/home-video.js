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
