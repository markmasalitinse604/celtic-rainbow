// Сборка сайта: node build.js  →  dist/pl, dist/pt, dist/ru, dist/en
const fs = require('fs');
const crypto = require('crypto');

const SITE_URL = 'https://example.ie';   // заменить на настоящий домен
const PHONE = '353000000000';            // для WhatsApp и звонков: только цифры, без + и пробелов
const PHONE_DISPLAY = '+353 [номер]';   // как номер выглядит на странице
const FACEBOOK_URL = 'https://www.facebook.com/'; // ссылка на страницу; '' — ссылка не показывается
const LANGS = { pl: 'pl', pt: 'pt-BR', ru: 'ru', en: 'en' }; // папка → код языка
const DEFAULT_LANG = 'en';
// Корень сайта: сохранённый язык (localStorage 'lang') → язык браузера (только если true) → английский
const DETECT_BROWSER_LANGUAGE = false;
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
      phone: PHONE, lic: t.lic, ageC: t.ageC, ageD: t.ageD, waPlan: t.waPlan, waCat: t.waCat,
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

for (const f of ['styles.css', 'ride.js', 'route.js', 'vehicle.js', 'gallery.js', 'menu.js']) fs.copyFileSync(`src/${f}`, `dist/${f}`);
if (fs.existsSync('src/assets')) fs.cpSync('src/assets', 'dist/assets', { recursive: true }); // фото и кадры ролика: ../assets/…

// Экран выбора транспорта: src/choose/index.html — шаблон → dist/<язык>/choose/index.html.
// Общие файлы (стили, скрипты, кадры, звуки) — один раз в dist/choose-assets/.
// Звуки мотора подключаются, только если файлы есть
const SOUND_FILES = { truck: 'engine-truck.mp3', bus: 'engine-bus.mp3' };
fs.mkdirSync('dist/choose-assets', { recursive: true });
for (const f of ['choose.css', 'hud.css', 'choose.js', 'sound.js']) fs.copyFileSync(`src/choose/${f}`, `dist/choose-assets/${f}`);
for (const d of ['img', 'media']) {
  fs.cpSync(`src/choose/${d}`, `dist/choose-assets/${d}`, { recursive: true, filter: (src) => !src.endsWith('.gitkeep') });
}
const sounds = Object.fromEntries(Object.entries(SOUND_FILES)
  .filter(([, f]) => fs.existsSync(`src/choose/media/${f}`))
  .map(([k, f]) => [k, `../../choose-assets/media/${f}`]));
const chooseTpl = fs.readFileSync('src/choose/index.html', 'utf8');
if (!chooseTpl.includes('data-sounds="{}"')) throw new Error('choose/index.html: нет атрибута data-sounds="{}"');
// ?v=<хэш содержимого> у картинок: поменяли кадр — меняется ссылка, браузер не покажет старый из кэша
const stamp = (file) => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
for (const lang of Object.keys(LANGS)) {
  const t = locales[lang];
  const b = {
    htmlLang: LANGS[lang],
    langCode: lang.toUpperCase(),
    brandName: esc(BRAND.name),
    brandSub: esc(BRAND.sub),
    brandFull: esc(BRAND_FULL),
    waHref: esc(wa(t.waHello)),
    telHref: `tel:+${PHONE}`,
    langItems: Object.keys(LANGS).map((dir) =>
      `<li><a href="../../${dir}/choose/" lang="${LANGS[dir]}" hreflang="${LANGS[dir]}" data-lang="${dir}"${dir === lang ? ' aria-current="page"' : ''}><span>${esc(locales[dir].langName)}</span>${dir === lang ? icon('i-check', 'icon icon--sm') : ''}</a></li>`).join(''),
  };
  const html = chooseTpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in b) return b[key];
    if (!(key in t)) throw new Error(`choose, ${lang}: в словаре нет ключа "${key}"`);
    return esc(t[key]);
  })
    .replace('data-sounds="{}"', `data-sounds="${esc(JSON.stringify(sounds))}"`)
    .replace(/choose-assets\/img\/[\w-]+\.webp/g, (src) => `${src}?v=${stamp(`dist/${src}`)}`)
    .replace(/choose-assets\/[\w-]+\.(css|js)/g, (src) => `${src}?v=${stamp(`dist/${src}`)}`);
  fs.mkdirSync(`dist/${lang}/choose`, { recursive: true });
  fs.writeFileSync(`dist/${lang}/choose/index.html`, html);
}

// Корень: сохранённый язык → (если DETECT_BROWSER_LANGUAGE) язык браузера → английский; всегда на экран выбора.
// Без JS показывает ссылки
const dirs = Object.keys(LANGS);
fs.writeFileSync('dist/index.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(BRAND_FULL)}</title><link rel="icon" href="assets/favicon.png">
<script>(function(){var L=${JSON.stringify(dirs)},l=null;try{l=localStorage.getItem('lang')}catch(e){}
if(L.indexOf(l)<0){l=null;if(${DETECT_BROWSER_LANGUAGE}){var b=(navigator.language||'').slice(0,2).toLowerCase();if(L.indexOf(b)>-1)l=b;}}
location.replace((l||'${DEFAULT_LANG}')+'/choose/'+location.search);})();</script>
</head><body>${dirs.map((d) => `<p><a href="${d}/choose/">${esc(locales[d].langName)}</a></p>`).join('')}</body></html>
`);

console.log('Готово: dist/');
