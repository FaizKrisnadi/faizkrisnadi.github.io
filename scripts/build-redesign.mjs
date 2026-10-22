import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import {createHash} from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, '_site-source');
const output = resolve(root, 'assets/redesign');
mkdirSync(output, {recursive: true});
const assetVersion = createHash('sha256').update(readFileSync(resolve(source, 'style.css'))).update(readFileSync(resolve(source, 'script.js'))).digest('hex').slice(0, 10);

const links = new Map([
  ['#home', 'index.html'], ['#about', 'about.html'], ['#migunani', 'migunani.html'], ['#news', 'news.html'],
  ['#work', 'research.html'], ['#work/research', 'research.html'],
  ['#work/projects', 'projects.html'], ['#work/cv', 'cv.html'], ['#work/services', 'services.html'],
  ...['reports', 'journals', 'writing', 'talks'].map(id => [`#work/research/${id}`, `research.html#${id}`]),
]);
function translateLinks(html) {
  return html.replace(/href="([^"]+)"/g, (whole, href) => {
    if (links.has(href)) return `href="${links.get(href)}"`;
    if (href === 'assets/faiz-academic-cv.pdf') return 'href="faiz-cv.pdf"';
    if (href === 'assets/faiz-cv.pdf') return 'href="faiz-professional-cv.pdf"';
    return whole;
  });
}
const news = JSON.parse(readFileSync(resolve(source, 'news.json'), 'utf8'));
const newsItems = entries => `<ol class="news-list">${entries.map(item => `<li><time datetime="${item.date}">${item.label}</time><p>${item.html}</p></li>`).join('\n')}</ol>`;
const years = [...new Set(news.map(item => item.date.slice(0, 4)))];
const newsArchive = years.map(year => `<section class="news-year" aria-labelledby="year-${year}"><h2 id="year-${year}">${year}</h2>${newsItems(news.filter(item => item.date.startsWith(year)))}</section>`).join('\n');
let template = translateLinks(readFileSync(resolve(source, 'index.html'), 'utf8')
  .replace('<!-- NEWS_PREVIEW -->', newsItems(news.slice(0, 4)))
  .replace('<!-- NEWS_ARCHIVE -->', newsArchive))
  .replaceAll('src="assets/', 'src="assets/redesign/')
  .replace('href="style.css"', `href="assets/redesign/site.css?v=${assetVersion}"`)
  .replace('src="script.js"', `src="assets/redesign/site.js?v=${assetVersion}"`)
  .replaceAll('href="assets/newsreader.ttf"', 'href="assets/redesign/newsreader.ttf"')
  .replace('href="faiz-professional-cv.pdf">View CV ↗', 'href="cv.html">View CV →')
  .replace(/data="(landscape|migunani-motif|community-motif)\.svg"/g, `data="assets/redesign/$1.svg?v=${assetVersion}"`);

const pages = [
  {file: 'index.html', page: 'home', title: 'Policy researcher', description: 'Faiz Krisnadi is a policy researcher working on investment, sustainability, and political economy in Southeast Asia.'},
  {file: 'about.html', page: 'about', title: 'About', description: 'About Faiz Krisnadi: policy research, education, public projects, and selected coverage.'},
  {file: 'migunani.html', page: 'migunani', title: 'Migunani', description: 'Community work, research, and policy: the people and experiences behind Faiz Krisnadi’s work.'},
  {file: 'research.html', page: 'work', panel: 'research', title: 'Research', description: 'Policy reports, peer-reviewed articles, public writing, and presentations by Faiz Krisnadi.'},
  {file: 'projects.html', page: 'work', panel: 'projects', title: 'Projects', description: 'Public maps and tools by Faiz Krisnadi, including Peta Banjir Indonesia and Paper to Power.'},
  {file: 'cv.html', page: 'work', panel: 'cv', title: 'CV', description: 'Download Faiz Krisnadi’s academic CV or professional CV.'},
  {file: 'services.html', page: 'work', panel: 'services', title: 'Services', description: 'Mentoring, talks, workshops, and policy research support from Faiz Krisnadi.'},
  {file: 'news.html', page: 'news', title: 'News', description: 'Updates on Faiz Krisnadi’s research, publications, projects, and activities.'},
];

for (const page of pages) {
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>Faiz Krisnadi — ${page.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${page.description}">`)
    .replace(/<section\b[^>]*data-page="([^"]+)"[^>]*>/g, (tag, name) => {
      const clean = tag.replace(/ hidden(?=>)/, '');
      return name === page.page ? clean : clean.replace(/>$/, ' hidden>');
    })
    .replace(/<div\b[^>]*data-work-panel="([^"]+)"[^>]*>/g, (tag, name) => {
      const clean = tag.replace(/ hidden(?=>)/, '');
      return name === (page.panel || 'research') ? clean : clean.replace(/>$/, ' hidden>');
    })
    .replace(/(<a\b[^>]*data-nav="([^"]+)")/g, (match, tag, name) => name === (page.page === 'news' ? 'about' : page.page) ? `${tag} aria-current="page"` : tag)
    .replace(/(<a\b[^>]*data-work-nav="([^"]+)")/g, (match, tag, name) => name === (page.panel || 'research') ? `${tag} aria-current="page"` : tag);
  const workTitle = page.panel === 'projects' ? 'Projects' : page.panel === 'cv' ? 'CV' : page.panel === 'services' ? 'Services' : 'Research';
  const workDescription = page.panel === 'projects' ? 'Maps and tools for exploring public data.' : page.panel === 'cv' ? 'Academic and professional versions.' : page.panel === 'services' ? 'Mentoring, speaking, workshops, and research support.' : 'Investment, sustainability, and political economy in Southeast Asia.';
  html = html.replace(/(<h1 id="work-title">)[^<]+/, `$1${workTitle}`)
    .replace(/(<p class="page-deck" id="work-description">)[^<]+/, `$1${workDescription}`);
  const canonical = `https://faizkrisnadi.com/${page.file === 'index.html' ? '' : page.file}`;
  const metadata = `  <link rel="canonical" href="${canonical}">\n  <meta property="og:type" content="website">\n  <meta property="og:title" content="Faiz Krisnadi — ${page.title}">\n  <meta property="og:description" content="${page.description}">\n  <meta property="og:url" content="${canonical}">\n  <meta property="og:image" content="https://faizkrisnadi.com/assets/redesign/portrait.jpg">\n`;
  html = html.replace('</head>', `${metadata}</head>`);
  if (page.page !== 'home') html = html.replace(/(<video id="landscape-video"[^>]*)(>)/, (_, tag, end) => tag.replace(' autoplay', '').replace('preload="auto"', 'preload="none"') + end);
  writeFileSync(resolve(root, page.file), html);
}

writeFileSync(resolve(output, 'site.css'), readFileSync(resolve(source, 'style.css'), 'utf8').replaceAll("url('assets/", "url('"));
writeFileSync(resolve(output, 'site.js'), readFileSync(resolve(source, 'script.js')));
for (const name of ['home-video.js', 'home-video.css', 'conversation-photos.css', 'desk-lamp.svg', 'brand.css']) writeFileSync(resolve(output, name), readFileSync(resolve(source, name)));
writeFileSync(resolve(root, 'favicon.svg'), readFileSync(resolve(source, 'favicon.svg')));
for (const name of ['landscape', 'migunani-motif', 'community-motif']) {
  let svg = readFileSync(resolve(source, `${name}.svg`), 'utf8');
  if (name === 'landscape') svg = svg.replaceAll('href="index.html#about"', 'href="../../about.html"').replaceAll('href="index.html#migunani"', 'href="../../migunani.html"').replaceAll('href="index.html#work"', 'href="../../research.html"');
  writeFileSync(resolve(output, `${name}.svg`), svg);
}
for (const [file, target] of [['resources.html', 'projects.html'], ['contact.html', 'about.html#contact']]) {
  writeFileSync(resolve(root, file), `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="https://faizkrisnadi.com/${target.split('#')[0]}"><title>Faiz Krisnadi</title></head><body><p>This page has moved. <a href="${target}">Continue →</a></p></body></html>\n`);
}
writeFileSync(resolve(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>https://faizkrisnadi.com/${p.file === 'index.html' ? '' : p.file}</loc></url>`).join('\n')}\n  <url><loc>https://faizkrisnadi.com/thesis-materials/</loc></url>\n</urlset>\n`);
writeFileSync(resolve(root, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: https://faizkrisnadi.com/sitemap.xml\n');
console.log(`Built ${pages.length} pages, 2 compatibility redirects, assets, and sitemap.`);
