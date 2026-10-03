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

// Тонкие линейные значки, общие для экрана выбора и главной: {{icons}} в начале <body>
const ICONS = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sound: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
};
const iconSprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${
  Object.entries(ICONS).map(([id, d]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${d}</symbol>`).join('')}</svg>`;
const hudIcon = (id) => icon(`i-${id}`, 'hud__icon');

// Общая шапка (HUD) экрана выбора и главной: {{header}}.
// root — путь до корня сайта; langHref(dir) — куда ведёт пункт языка; landing — кнопка категории и «Контакты»
function renderHeader(lang, t, { root, home, langHref, landing }) {
  const langs = Object.keys(LANGS).map((dir) =>
    `<li><a href="${langHref(dir)}" lang="${LANGS[dir]}" hreflang="${LANGS[dir]}" data-lang="${dir}"${dir === lang ? ' aria-current="page"' : ''}><span>${esc(locales[dir].langName)}</span>${dir === lang ? icon('i-check', 'icon icon--sm') : ''}</a></li>`).join('');
  const chip = landing
    ? `<a class="hud__pill hud__chip" id="vehicle-chip" href="choose/" aria-label="${esc(t.changeVehicle)}: C / D"
      data-label="${esc(t.changeVehicle)}" data-truck="${esc(t.chooseTruck)}" data-bus="${esc(t.chooseBus)}">
      ${hudIcon('swap')}<span class="hud__chip-long">C / D</span><span class="hud__chip-short" aria-hidden="true">C·D</span></a>
    <a class="hud__link" href="#final">${esc(t.toContacts)}</a>`
    : '';
  return `<header class="hud${landing ? ' hud--landing' : ''}" id="hud">
  <a class="hud__brand" href="${home}">
    <img class="hud__logo" src="${root}assets/logo.png" alt="${esc(BRAND_FULL)}" width="44" height="44">
    <span class="hud__brand-text" aria-hidden="true"><span class="hud__name">${esc(BRAND.name)}</span><span class="hud__sub">${esc(BRAND.sub)}</span></span>
  </a>
  <div class="hud__actions">
    ${chip}
    <details class="lang-menu hud__lang">
      <summary class="hud__pill" aria-label="${esc(t.langLabel)}: ${esc(t.langName)}">
        ${hudIcon('globe')}
        <span class="hud__lang-name">${esc(t.langName)}</span><span class="hud__lang-code" aria-hidden="true">${lang.toUpperCase()}</span>
        ${icon('i-chevron', 'hud__icon hud__chev')}
      </summary>
      <ul class="lang-menu__list">${langs}</ul>
    </details>
    <button type="button" class="hud__pill hud__sound" id="sound-btn" aria-pressed="false"
      aria-label="${esc(t.soundOnAria)}" data-on-aria="${esc(t.soundOnAria)}" data-off-aria="${esc(t.soundOffAria)}"${landing ? ' data-sound-auto' : ''}>
      ${hudIcon('mute')}
      <span class="hud__sound-label">${esc(t.soundLabel)}</span>
    </button>
    <a class="hud__pill hud__wa" href="${esc(wa(t.waHello))}" target="_blank" rel="noopener" data-track="whatsapp">
      ${hudIcon('chat')}<span>WhatsApp</span>
    </a>
  </div>
</header>`;
}

// Нижняя панель на телефоне (WhatsApp + звонок): {{dock}}
const renderDock = (t) => `<nav class="dock" aria-label="${esc(BRAND_FULL)}">
  <a class="dock__wa" href="${esc(wa(t.waHello))}" target="_blank" rel="noopener" data-track="whatsapp">
    ${hudIcon('chat')}<span>WhatsApp</span>
  </a>
  <a class="dock__call" href="tel:+${PHONE}" aria-label="${esc(t.call)}">${hudIcon('phone')}</a>
</nav>`;

// ?v=<хэш содержимого> у общих файлов: поменяли файл — меняется ссылка, браузер не возьмёт старый из кэша
const stamp = (file) => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
// (все свои .css и .js, а также картинки экрана выбора; путь в HTML — относительный, от ../ до корня dist)
const stampRefs = (html) => html
  .replace(/"((?:\.\.\/)+)([\w/-]+\.(?:css|js))"/g, (_, up, src) => `"${up}${src}?v=${stamp(`dist/${src}`)}"`)
  .replace(/choose-assets\/img\/[\w-]+\.webp/g, (src) => `${src}?v=${stamp(`dist/${src}`)}`);

// {cat} в текстах: в статичном HTML — вариант «оба» (C / D), vehicle.js меняет на C или D
const CAT_BOTH = 'C / D';
const txt = (s) => esc(s).split('{cat}').join(`<span data-cat>${CAT_BOTH}</span>`);
const OG_LOCALE = { pl: 'pl_PL', pt: 'pt_BR', ru: 'ru_RU', en: 'en_IE' };

// Кадры ролика: src/assets/ride/{hd,land,port} — фура. Если появится src/assets/ride-bus/{hd,land,port},
// ride.js возьмёт его для ?vehicle=bus; пока его нет — везде фура и пометка busSoon для автобуса
const hasBusFrames = ['hd', 'land', 'port'].every((d) => fs.existsSync(`src/assets/ride-bus/${d}/001.webp`));
if (!hasBusFrames) console.warn('Внимание: нет кадров автобуса (src/assets/ride-bus/{hd,land,port}) — для автобуса показываем фуру');
// Фоновый звук главной: подключается, только если файл есть
const AMBIENT = 'assets/media/ambient.m4a';
const hasAmbient = fs.existsSync(`src/${AMBIENT}`);

// Блоки главной, которые собираются из словаря
function blocks(lang, t) {
  const plan = withV(t.waPlan.split('{L}').join(t.lic.eu), CAT_BOTH);
  const steps = [1, 2, 3, 4, 5].map((n) => `<li class="rcard rcard--step" data-i="${n}" data-step="${n}">
          <p class="eyebrow">${esc(t.jStepLabel.split('{n}').join(n))}</p>
          <h2 class="rcard__title">${txt(t[`jS${n}Title`])}</h2>
          <p>${txt(t[`jS${n}Text`])}</p>
        </li>`).join('\n        ');

  return {
    htmlLang: LANGS[lang],
    brandFull: esc(BRAND_FULL),
    canonical: `${SITE_URL}/${lang}/`,
    ogLocale: OG_LOCALE[lang],
    ogImage: `${SITE_URL}/assets/og.jpg`,
    year: String(new Date().getFullYear()),
    icons: iconSprite,
    header: renderHeader(lang, t, { root: '../', home: '#top', langHref: (dir) => `../${dir}/`, landing: true }),
    dock: renderDock(t),
    iconChat: icon('i-chat'),
    iconPhone: icon('i-phone'),
    iconDown: icon('i-down'),
    iconInfo: icon('i-info'),
    framesBus: hasBusFrames ? ' data-frames-bus="../assets/ride-bus"' : '',
    rideSteps: steps,
    telHref: `tel:+${PHONE}`,
    phoneDisplay: esc(PHONE_DISPLAY),
    waHref: esc(wa(t.waHello)),
    planHref: esc(wa(plan)),
    fbLink: FACEBOOK_URL
      ? `<a class="btn btn--link" href="${esc(FACEBOOK_URL)}" target="_blank" rel="noopener">${icon('i-facebook')}<span>Facebook</span></a>`
      : '',
    teacherPhoto: teacherFile
      ? `<img src="../assets/${encodeURI(teacherFile)}" alt="${esc(t.name)}" loading="lazy">`
      : `<span class="teacher__ph">${icon('i-person')}<span>${esc(t.photo)}</span></span>`,
    langChips: Object.keys(LANGS).map((dir) => `<li lang="${LANGS[dir]}">${esc(locales[dir].langName)}</li>`).join(''),
    licOptions: ['eu', 'nonEu', 'none'].map((k, i) =>
      `<label class="opt"><input type="radio" name="lic" value="${k}"${i === 0 ? ' checked' : ''}><span class="opt__box"><span class="opt__dot" aria-hidden="true"></span>${esc(t.lic[k])}</span></label>`).join('\n            '),
    planSteps: t.stepsEu.map(([title, text]) =>
      `<li><strong>${esc(withV(title, CAT_BOTH))}</strong><p>${esc(withV(text, CAT_BOTH))}</p></li>`).join(''),
    faq: t.faq.map(([q, a], i) =>
      `<details${i === 0 ? ' open' : ''}><summary><span>${esc(q)}</span>${icon('i-plus')}</summary><p>${esc(a)}</p></details>`).join(''),
    // Галерея: секции нет совсем, пока в src/assets/gallery нет картинок
    gallery: galleryFiles.length ? `<section class="sec sec--alt" id="gallery" aria-labelledby="gallery-title">
    <div class="wrap">
      <h2 class="sec__title" id="gallery-title">${esc(t.galleryTitle)}</h2>
      <div class="gallery">${galleryFiles.map((f, i) => `<button type="button" class="gallery__item" data-full="../assets/gallery/${encodeURI(f)}"><img src="../assets/gallery/${encodeURI(f)}" alt="${esc(t.galleryAlt)} ${i + 1}" loading="lazy"></button>`).join('')}</div>
    </div>
  </section>
  <dialog class="lightbox" id="lightbox">
    <img alt="">
    <form method="dialog"><button class="lightbox__close" aria-label="${esc(t.galleryClose)}">${icon('i-plus')}</button></form>
  </dialog>` : '',
    galleryScript: galleryFiles.length ? '<script src="../gallery.js" defer></script>' : '',
    hreflang: Object.entries(LANGS)
      .map(([dir, code]) => `<link rel="alternate" hreflang="${code}" href="${SITE_URL}/${dir}/">`)
      .concat(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/${DEFAULT_LANG}/">`)
      .join('\n  '),
    siteJson: JSON.stringify({
      phone: PHONE, lic: t.lic, waPlan: t.waPlan, waCat: t.waCat,
      steps: { eu: t.stepsEu, nonEu: t.stepsNonEu, none: t.stepsNone },
      ambient: hasAmbient ? `../${AMBIENT}` : null,
    }).replace(/</g, '\\u003c'),
  };
}

fs.rmSync('dist', { recursive: true, force: true });
fs.cpSync('src/shared', 'dist/shared', { recursive: true }); // общие файлы шапки и звука
for (const f of ['landing.css', 'ride.js', 'plan.js', 'vehicle.js', 'gallery.js']) fs.copyFileSync(`src/${f}`, `dist/${f}`);
// фото, кадры ролика, звук: ../assets/…
fs.cpSync('src/assets', 'dist/assets', { recursive: true, filter: (src) => !src.endsWith('.gitkeep') });

for (const lang of Object.keys(LANGS)) {
  const t = locales[lang];
  if (!t) throw new Error(`В locales.js нет языка "${lang}"`);
  for (const k of Object.keys(locales.en)) if (!(k in t)) throw new Error(`${lang}: в словаре нет ключа "${k}"`);
  const b = blocks(lang, t);
  const html = tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in b) return b[key];
    if (!(key in t)) throw new Error(`${lang}: в словаре нет ключа "${key}"`);
    return txt(t[key]);
  });
  fs.mkdirSync(`dist/${lang}`, { recursive: true });
  fs.writeFileSync(`dist/${lang}/index.html`, stampRefs(html));
}

// Экран выбора транспорта: src/choose/index.html — шаблон → dist/<язык>/choose/index.html.
// Общие файлы (стили, скрипты, кадры, звуки) — один раз в dist/choose-assets/.
// Звуки мотора подключаются, только если файлы есть
const SOUND_FILES = { truck: 'engine-truck.mp3', bus: 'engine-bus.mp3' };
fs.mkdirSync('dist/choose-assets', { recursive: true });
for (const f of ['choose.css', 'choose.js']) fs.copyFileSync(`src/choose/${f}`, `dist/choose-assets/${f}`);
for (const d of ['img', 'media']) {
  fs.cpSync(`src/choose/${d}`, `dist/choose-assets/${d}`, { recursive: true, filter: (src) => !src.endsWith('.gitkeep') });
}
const sounds = Object.fromEntries(Object.entries(SOUND_FILES)
  .filter(([, f]) => fs.existsSync(`src/choose/media/${f}`))
  .map(([k, f]) => [k, `../../choose-assets/media/${f}`]));
const chooseTpl = fs.readFileSync('src/choose/index.html', 'utf8');
if (!chooseTpl.includes('data-sounds="{}"')) throw new Error('choose/index.html: нет атрибута data-sounds="{}"');
for (const lang of Object.keys(LANGS)) {
  const t = locales[lang];
  const b = {
    htmlLang: LANGS[lang],
    brandFull: esc(BRAND_FULL),
    icons: iconSprite,
    header: renderHeader(lang, t, { root: '../../', home: '../', langHref: (dir) => `../../${dir}/choose/`, landing: false }),
    dock: renderDock(t),
  };
  let html = chooseTpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in b) return b[key];
    if (!(key in t)) throw new Error(`choose, ${lang}: в словаре нет ключа "${key}"`);
    return esc(t[key]);
  })
    .replace('data-sounds="{}"', `data-sounds="${esc(JSON.stringify(sounds))}"`);
  html = stampRefs(html);
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
