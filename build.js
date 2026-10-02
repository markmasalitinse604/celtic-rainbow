// Сборка сайта: node build.js  →  dist/pl, dist/pt, dist/ru, dist/en
const fs = require('fs');

const SITE_URL = 'https://example.ie';   // заменить на настоящий домен
const PHONE = '353000000000';            // для WhatsApp и звонков: только цифры, без + и пробелов
const PHONE_DISPLAY = '+353 [номер]';   // как номер выглядит на странице
const FACEBOOK_URL = 'https://www.facebook.com/'; // ссылка на страницу; '' — ссылка не показывается
const LANGS = { pl: 'pl', pt: 'pt-BR', ru: 'ru', en: 'en' }; // папка → код языка
const DEFAULT_LANG = 'en';
const BRAND = { name: 'Celtic Rainbow', sub: 'Truck & Bus School' }; // название в шапке и подвале
const BRAND_FULL = `${BRAND.name} ${BRAND.sub}`;

// Фото преподавателя: src/assets/teacher.jpg (или .png/.webp). Галерея: любые картинки в src/assets/gallery/
const IMG = /\.(jpe?g|png|webp)$/i;
const teacherFile = fs.existsSync('src/assets')
  ? fs.readdirSync('src/assets').find((f) => /^teacher\.(jpe?g|png|webp)$/i.test(f)) : null;
const galleryFiles = fs.existsSync('src/assets/gallery')
  ? fs.readdirSync('src/assets/gallery').filter((f) => IMG.test(f)).sort() : [];

const locales = require('./src/locales.js');
const tpl = fs.readFileSync('src/template.html', 'utf8');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wa = (msg) => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
const withV = (s, V) => s.split('{V}').join(V);
const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"></use></svg>`;

// Блоки, которые собираются из массивов словаря
function blocks(lang, t) {
  const whyIcons = ['i-d-speech', 'i-d-route', 'i-d-person'];
  const plan = t.waPlan.split('{L}').join(t.lic.eu).split('{V}').join('C');

  return {
    htmlLang: LANGS[lang],
    brandName: esc(BRAND.name),
    telHref: `tel:+${PHONE}`,
    phoneDisplay: esc(PHONE_DISPLAY),
    fbLink: FACEBOOK_URL
      ? `<a class="fb-link" href="${esc(FACEBOOK_URL)}" target="_blank" rel="noopener">${icon('i-facebook')}<span>Facebook</span></a>`
      : '',
    brandSub: esc(BRAND.sub),
    brandFull: esc(BRAND_FULL),
    teacherPhoto: teacherFile
      ? `<img src="../assets/${encodeURI(teacherFile)}" alt="${esc(t.name)}">`
      : `${icon('i-person')}${esc(t.photo)}`,
    gallery: galleryFiles.length
      ? galleryFiles.map((f, i) => `<button type="button" class="gallery__item" data-full="../assets/gallery/${encodeURI(f)}"><img src="../assets/gallery/${encodeURI(f)}" alt="${esc(t.galleryAlt)} ${i + 1}" loading="lazy"></button>`).join('')
      : Array.from({ length: 6 }, () => `<div class="gallery__item gallery__item--empty">${esc(t.photo)}</div>`).join(''),
    hreflang: Object.entries(LANGS)
      .map(([dir, code]) => `<link rel="alternate" hreflang="${code}" href="${SITE_URL}/${dir}/">`)
      .concat(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/${DEFAULT_LANG}/">`)
      .join('\n  '),
    langItems: Object.keys(LANGS).map((dir) =>
      `<li><a href="../${dir}/" lang="${LANGS[dir]}" hreflang="${LANGS[dir]}"${dir === lang ? ' aria-current="page"' : ''}><span>${esc(locales[dir].langName)}</span>${dir === lang ? icon('i-check', 'icon icon--sm') : ''}</a></li>`).join(''),
    langGrid: Object.keys(LANGS).map((dir) =>
      `<a class="lang-tile" href="../${dir}/" lang="${LANGS[dir]}" hreflang="${LANGS[dir]}"${dir === lang ? ' aria-current="page"' : ''}><span>${esc(locales[dir].langName)}</span>${dir === lang ? icon('i-check', 'icon icon--sm') : ''}</a>`).join(''),
    why: t.why.map(([title, text], i) =>
      `<div class="why">${icon(whyIcons[i], 'why__icon')}<h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join(''),
    course: t.course.map(([badge, title, text]) =>
      `<div class="card"><span class="badge">${esc(badge)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join(''),
    licOptions: ['eu', 'nonEu', 'none'].map((k, i) =>
      `<label class="opt"><input type="radio" name="lic" value="${k}"${i === 0 ? ' checked' : ''}><span class="opt__box"><span class="opt__dot" aria-hidden="true"></span>${esc(t.lic[k])}</span></label>`).join(''),
    vehOptions: [['c', 'C', 'i-truck'], ['d', 'D', 'i-bus']].map(([k, V, ic], i) =>
      `<label class="opt"><input type="radio" name="veh" value="${V}"${i === 0 ? ' checked' : ''}><span class="opt__box">${icon(ic, 'icon icon--lg')}${esc(t.veh[k])}</span></label>`).join(''),
    steps: t.stepsEu.map(([title, text]) =>
      `<li><strong>${esc(withV(title, 'C'))}</strong><p>${esc(withV(text, 'C'))}</p></li>`).join(''),
    faq: t.faq.map(([q, a], i) =>
      `<details${i === 0 ? ' open' : ''}><summary><span>${esc(q)}</span>${icon('i-plus')}</summary><p>${esc(a)}</p></details>`).join(''),
    waHref: esc(wa(t.waHello)),
    planHref: esc(wa(plan)),
    routeJson: JSON.stringify({
      phone: PHONE, lic: t.lic, ageC: t.ageC, ageD: t.ageD, waPlan: t.waPlan,
      steps: { eu: t.stepsEu, nonEu: t.stepsNonEu, none: t.stepsNone },
    }).replace(/</g, '\\u003c'),
  };
}

fs.rmSync('dist', { recursive: true, force: true });

for (const lang of Object.keys(LANGS)) {
  const t = locales[lang];
  if (!t) throw new Error(`В locales.js нет языка "${lang}"`);
  if (!('galleryAlt' in t)) throw new Error(`${lang}: в словаре нет ключа "galleryAlt"`);
  const b = blocks(lang, t);
  const html = tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in b) return b[key];
    if (!(key in t)) throw new Error(`${lang}: в словаре нет ключа "${key}"`);
    return esc(t[key]);
  });
  fs.mkdirSync(`dist/${lang}`, { recursive: true });
  fs.writeFileSync(`dist/${lang}/index.html`, html);
}

for (const f of ['styles.css', 'ride.js', 'route.js', 'gallery.js', 'menu.js']) fs.copyFileSync(`src/${f}`, `dist/${f}`);
if (fs.existsSync('src/assets')) fs.cpSync('src/assets', 'dist/assets', { recursive: true }); // фото и кадры ролика: ../assets/…

// Корень: отправляет на язык браузера, без JS показывает ссылки
const dirs = Object.keys(LANGS);
fs.writeFileSync('dist/index.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(BRAND_FULL)}</title><link rel="icon" href="assets/favicon.png">
<script>var l=(navigator.language||'').slice(0,2).toLowerCase();location.replace((${JSON.stringify(dirs)}.indexOf(l)>-1?l:'${DEFAULT_LANG}')+'/');</script>
</head><body>${dirs.map((d) => `<p><a href="${d}/">${esc(locales[d].langName)}</a></p>`).join('')}</body></html>
`);

console.log('Готово: dist/');
