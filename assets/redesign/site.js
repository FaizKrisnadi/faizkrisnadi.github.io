const pages = [...document.querySelectorAll('[data-page]')];
const pageNames = {home: 'Policy researcher', work: 'Work', migunani: 'Migunani', about: 'About', news: 'News'};
const fileRoutes = {'index.html': 'home', 'about.html': 'about', 'migunani.html': 'migunani', 'research.html': 'work/research', 'projects.html': 'work/projects', 'cv.html': 'work/cv', 'services.html': 'work/services', 'news.html': 'news'};
function currentRoute() {
  const fragment = location.hash.slice(1);
  // Keep links shared during the prototype working alongside the permanent URLs.
  if (/^(home|about|migunani|work|news)(\/|$)/.test(fragment)) return fragment;
  const file = location.pathname.split('/').pop() || 'index.html';
  const route = fileRoutes[file] || 'home';
  if (route === 'work/research' && ['reports', 'journals', 'writing', 'talks'].includes(fragment)) return `${route}/${fragment}`;
  return route;
}
function showPage({focus = true} = {}) {
  const [requested = 'home', workView = 'research', section] = currentRoute().split('/');
  const name = Object.hasOwn(pageNames, requested) ? requested : 'home';
  const panel = ['research', 'projects', 'cv', 'services'].includes(workView) ? workView : 'research';
  const workTitles = {research: 'Research', projects: 'Projects', cv: 'CV', services: 'Services'};
  pages.forEach(page => { page.hidden = page.dataset.page !== name; });
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === (name === 'news' ? 'about' : name)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-work-panel]').forEach(view => { view.hidden = view.dataset.workPanel !== panel; });
  document.querySelectorAll('[data-work-nav]').forEach(link => {
    if (link.dataset.workNav === panel) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.getElementById('work-title').textContent = workTitles[panel];
  document.getElementById('work-description').textContent = panel === 'projects'
    ? 'Maps and tools for exploring public data.'
    : panel === 'cv' ? 'Academic and professional versions.'
    : panel === 'services' ? 'Mentoring, speaking, workshops, and research support.'
    : 'Investment, sustainability, and political economy in Southeast Asia.';
  document.title = `Faiz Krisnadi — ${name === 'work' ? workTitles[panel] : pageNames[name]}`;
  const target = name === 'work' && panel === 'research' && ['reports', 'journals', 'writing', 'talks'].includes(section)
    ? document.getElementById(section) : null;
  if (target) {
    requestAnimationFrame(() => {
      target.setAttribute('tabindex', '-1');
      if (focus) target.focus({preventScroll: true});
      target.scrollIntoView({behavior: 'instant', block: 'start'});
    });
  } else if (focus) {
    window.scrollTo({top: 0, behavior: 'instant'});
    document.getElementById('main').focus({preventScroll: true});
  }
}
window.addEventListener('hashchange', () => showPage());
showPage({focus: false});
document.querySelector('.about-layout .text-link').setAttribute('href', 'cv.html');
document.querySelector('.about-layout .text-link').textContent = 'View CV →';

document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault(); document.getElementById('main').focus();
});

// Short, self-contained movement: play once on entry, or again by request.
const visibleMotifs = new WeakMap();
const playedMotifs = new WeakSet();
function animateMotif(motif, replay = false) {
  const svg = motif.contentDocument?.documentElement;
  if (svg?.localName !== 'svg' || (!replay && (!visibleMotifs.get(motif) || playedMotifs.has(motif)))) return;
  playedMotifs.add(motif);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  svg.classList.remove('play');
  svg.getBoundingClientRect();
  svg.classList.add('play');
}
const motifObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    visibleMotifs.set(entry.target, entry.isIntersecting);
    animateMotif(entry.target);
    if (playedMotifs.has(entry.target)) motifObserver.unobserve(entry.target);
  });
}, {threshold: .3});
document.querySelectorAll('.motion-illustration').forEach(motif => {
  motif.addEventListener('load', () => animateMotif(motif));
  motifObserver.observe(motif);
});
document.querySelectorAll('[data-replay]').forEach(button => button.addEventListener('click', () => {
  animateMotif(document.getElementById(button.dataset.replay), true);
}));

/* Keep the full service list on desktop; fold only the categories on phones. */
const mobileServiceLayout = matchMedia('(max-width: 620px)');
const serviceGroups = document.querySelectorAll('.service-audiences .service-group');
function syncServiceGroups(event) {
  serviceGroups.forEach(group => { group.open = !event.matches; });
}
syncServiceGroups(mobileServiceLayout);
mobileServiceLayout.addEventListener('change', syncServiceGroups);
