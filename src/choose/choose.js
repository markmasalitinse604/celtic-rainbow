// Выбор транспорта: наведение показывает одну машину, клик — фары, звук мотора и переход на главную /<язык>/?vehicle=
(() => {
  // Два набора кадров. Для каждого: размер исходника, кадрирование слоёв (object-position, доли) и рамки машин
  // [лево, верх, право, низ] в долях кадра (с зеркалами и колёсами). Наведение и клик — только внутри рамок.
  // Поменяли фото — перемерьте рамки. Горизонтальный: по X кадрирование — середина промежутка между машинами.
  // Промежуток между машинами (доля ширины кадра), замерен по фото: фура кончается / автобус начинается.
  // Рамки машин обрезаются по нему, чтобы зоны нажатия никогда не перекрывались.
  const SPLIT = 0.533;        // горизонтальный кадр: фура до 0.525, автобус с 0.540
  const SPLIT_MOBILE = 0.538; // вертикальный кадр: фура до 0.526, автобус с 0.551
  const SETS = {
    h: { w: 2720, h: 1536, pos: [0.53, 0.6], split: SPLIT, sizes: 'max(100vw, 177vh)', // кадрирование (pos) не трогать
      boxes: { truck: [0.112, 0.302, 0.525, 0.826], bus: [0.540, 0.408, 0.876, 0.798] } },
    // телефон в портрете: кадрирование (pos) не трогать — сцена выверена под этот кадр
    v: { w: 1536, h: 2720, pos: [0.49, 0.57], split: SPLIT_MOBILE, sizes: 'max(100vw, 56.5vh)',
      boxes: { truck: [0.068, 0.468, 0.526, 0.676], bus: [0.551, 0.503, 0.906, 0.660] } },
  };
  for (const s of Object.values(SETS)) { // зоны не заходят за промежуток
    s.boxes.truck[2] = Math.min(s.boxes.truck[2], s.split);
    s.boxes.bus[0] = Math.max(s.boxes.bus[0], s.split);
  }
  const HYST = 0.012;         // рамку показанной машины расширяем на столько (доля фото), чтобы у края не мигало
  const SWITCH_DELAY = 150;   // мс: задержка перед уходом из рамки / сменой машины
  const LIT_HOLD = 1400;      // мс: сколько горят фары до затемнения (владелец: было 1600, потом 800, ×1,5 = 1200, +0,2 с)
  const FADE_OUT = 375;       // мс: затемнение перед переходом (как .blackout в choose.css; было 500, потом 250)
  const SOUND_FADE = 1200;    // мс: мотор стихает дольше затемнения — начинает раньше и заканчивает вместе с ним
  const SOUND_PAN = 0.35;     // насколько звук мотора смещён к своей машине (0 — по центру, 1 — только в одном ухе)
  const FADE_IN = 400;        // мс: проявление слоя (как transition у .layer в choose.css)

  const root = document.getElementById('choose');
  const scene = document.getElementById('scene');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const portrait = matchMedia('(max-aspect-ratio: 4/5)'); // как media у <source> в index.html
  let set = portrait.matches ? SETS.v : SETS.h;
  const SOUNDS = JSON.parse(root.dataset.sounds || '{}'); // { truck: 'media/…mp3', bus: … } — только существующие

  // ---------- Слои ----------
  const sceneLayers = {};
  scene.querySelectorAll('.layer').forEach((img) => { sceneLayers[img.dataset.layer] = img; });

  // Без мерцания: нижний слой (обе машины) всегда непрозрачный, новый слой проявляется ПОВЕРХ текущего,
  // и только после этого слои под ним мгновенно прячутся. Двух полупрозрачных слоёв над тёмным фоном не бывает.
  let zTop = 1, hideTimer = 0;
  function hideInstantly(img) {
    img.classList.add('is-instant');
    img.classList.remove('is-on');
    void img.offsetWidth; // применить без анимации
    img.classList.remove('is-instant');
  }
  const order = Object.values(sceneLayers);
  // Лежит ли слой a выше слоя b (z-index, при равенстве — порядок в разметке)
  const above = (a, b) => {
    const za = +a.style.zIndex || 0, zb = +b.style.zIndex || 0;
    return za > zb || (za === zb && order.indexOf(a) > order.indexOf(b));
  };
  function showScene(name) {
    root.dataset.shown = name;
    clearTimeout(hideTimer);
    const top = sceneLayers[name];
    if (name === 'both') { // верхние слои плавно гаснут, под ними уже готовый кадр
      for (const [k, img] of Object.entries(sceneLayers)) if (k !== 'both') img.classList.remove('is-on');
      return;
    }
    // Полностью скрытый слой можно поднять наверх — это незаметно. Слой, который ещё виден (быстро вернулись
    // «туда-обратно»), поднимать нельзя: он резко выскочит поверх. Вместо этого плавно гасим всё, что над ним.
    if (+getComputedStyle(top).opacity < 0.01) top.style.zIndex = ++zTop;
    for (const [k, img] of Object.entries(sceneLayers)) {
      if (k !== 'both' && img !== top && above(img, top)) img.classList.remove('is-on');
    }
    top.classList.add('is-on');
    hideTimer = setTimeout(() => {
      for (const [k, img] of Object.entries(sceneLayers)) if (k !== 'both' && img !== top) hideInstantly(img);
      top.style.zIndex = zTop = 2; // под ним никого не осталось — сбрасываем счётчик
    }, FADE_IN);
  }

  // Остальные кадры текущего набора — сразу после загрузки страницы: при наведении не будет пустого кадра
  function preload() {
    const key = set === SETS.v ? 'v' : 'h';
    Object.values(sceneLayers).forEach((img) => {
      if (!img.dataset[key] || img.dataset.loaded === key) return;
      img.sizes = set.sizes;
      img.srcset = img.dataset[key];
      img.dataset.loaded = key;
      img.decode().catch(() => {}); // декодируем заранее, чтобы первый показ не дал пустой кадр
    });
  }
  function applySet() {
    set = portrait.matches ? SETS.v : SETS.h;
    root.style.setProperty('--pos', `${set.pos[0] * 100}% ${set.pos[1] * 100}%`);
  }
  applySet();
  if (document.readyState === 'complete') preload(); else addEventListener('load', preload);
  portrait.addEventListener('change', () => { applySet(); preload(); placeZones(); }); // повернули телефон

  // ---------- Рамки: кнопки ровно над машинами ----------
  const zones = [...scene.querySelectorAll('.zone')];

  // Как кадр лежит на экране при object-fit: cover и object-position текущего набора
  function frame() {
    const r = scene.getBoundingClientRect();
    const k = Math.max(r.width / set.w, r.height / set.h), dw = set.w * k, dh = set.h * k;
    return { r, dw, dh, x: (r.width - dw) * set.pos[0], y: (r.height - dh) * set.pos[1] };
  }
  const labels = [...root.querySelectorAll('.label')];
  const heading = root.querySelector('.heading');
  const title = root.querySelector('.heading__title');
  const GAP = 24; // мин. отступ: шапка → подсказка и заголовок → машины

  function placeZones() {
    const f = frame();
    const vh = innerHeight, vw = innerWidth;
    let carsTop = Infinity, carsBottom = 0;
    zones.forEach((z) => {
      const [x0, y0, x1, y1] = set.boxes[z.dataset.side];
      const left = f.x + x0 * f.dw, top = f.y + y0 * f.dh, w = (x1 - x0) * f.dw, h = (y1 - y0) * f.dh;
      z.style.left = `${left}px`;
      z.style.top = `${top}px`;
      z.style.width = `${w}px`;
      z.style.height = `${h}px`;
      carsTop = Math.min(carsTop, top);
      carsBottom = Math.max(carsBottom, top + h);
      // подпись — по центру видимой части машины, не ближе 12px к краю экрана
      const label = labels.find((l) => l.dataset.side === z.dataset.side);
      const cx = (Math.max(0, left) + Math.min(vw, left + w)) / 2;
      const half = label.offsetWidth / 2;
      label.style.setProperty('--x', `${Math.min(vw - 12 - half, Math.max(12 + half, cx))}px`);
    });

    // Подписи: один ряд на одной линии. ПК — около 85% высоты, телефон — центр около 72%; всегда ниже машин
    const mobile = set === SETS.v;
    const lh = labels[0].offsetHeight;
    let y = Math.max(carsBottom + 12, mobile ? vh * 0.72 - lh / 2 : vh * 0.85);
    // нижняя граница ряда — там, где раньше была ссылка «Пока не знаю» (ПК 92%, телефон 81% — над нижней панелью)
    y = Math.min(y, vh * (mobile ? 0.81 : 0.92) - 10 - lh - 8);
    root.style.setProperty('--labels-y', `${Math.round(y)}px`);

    // Заголовок: не ближе GAP к машинам. Сначала поднимаем блок (не выше шапки + GAP), потом уменьшаем шрифт
    root.style.removeProperty('--heading-top');
    title.style.removeProperty('font-size');
    const hudH = document.querySelector('.hud').offsetHeight;
    const minTop = hudH + GAP;
    let hb = heading.getBoundingClientRect();
    if (hb.bottom + GAP > carsTop) {
      root.style.setProperty('--heading-top', `${Math.max(minTop, carsTop - GAP - hb.height)}px`);
      hb = heading.getBoundingClientRect();
      let size = parseFloat(getComputedStyle(title).fontSize);
      while (hb.bottom + GAP > carsTop && size > 18) {
        size -= 1;
        title.style.fontSize = `${size}px`;
        hb = heading.getBoundingClientRect();
      }
    }
  }
  placeZones();
  addEventListener('resize', placeZones);
  if (document.fonts) document.fonts.ready.then(placeZones); // Oswald догрузился — размеры заголовка другие

  // ---------- Наведение мышью (с задержкой и гистерезисом) ----------
  let shown = 'both', pending = null, timer = 0, chosen = false;

  function want(side, delay) {
    if (chosen) return;
    if (side === shown) { clearTimeout(timer); pending = null; return; }
    if (side === pending) return;
    clearTimeout(timer);
    pending = side;
    const go = () => { pending = null; shown = side; showScene(side); };
    if (delay) timer = setTimeout(go, delay); else go();
  }

  // Курсор внутри (расширенной) рамки показанной машины?
  function insideShown(e) {
    if (shown !== 'truck' && shown !== 'bus') return false;
    const f = frame();
    const fx = (e.clientX - f.r.left - f.x) / f.dw, fy = (e.clientY - f.r.top - f.y) / f.dh;
    const [x0, y0, x1, y1] = set.boxes[shown];
    return fx > x0 - HYST && fx < x1 + HYST && fy > y0 - HYST && fy < y1 + HYST;
  }

  root.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return; // на тач-экранах наведения нет — только нажатие
    const zone = e.target.closest('.zone, .label'); // рамка машины или её подпись
    const side = insideShown(e) ? shown : zone ? zone.dataset.side : 'both';
    // из общего кадра на машину — сразу; уход из рамки и смена машины — с задержкой
    want(side, shown === 'both' ? 0 : SWITCH_DELAY);
  });
  root.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    const focused = scene.querySelector('.zone:focus-visible'); // фокус с клавиатуры держит свою машину
    want(focused ? focused.dataset.side : 'both', 0);
  });

  // ---------- Клавиатура: фокус работает как наведение ----------
  zones.forEach((btn) => {
    btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) want(btn.dataset.side, 0); });
    btn.addEventListener('blur', () => {
      setTimeout(() => { if (!scene.contains(document.activeElement)) want('both', 0); });
    });
    btn.addEventListener('click', () => choose(btn.dataset.side));
  });
  // подпись — тоже часть кнопки своей машины (для мыши и пальца; с клавиатуры фокус на самой кнопке)
  labels.forEach((l) => l.addEventListener('click', () => choose(l.dataset.side)));

  // На телефоне наведения нет: нажатие на машину сразу запускает весь сценарий (click выше)

  // ---------- Выбор ----------
  function playSound(side) {
    // только если звук включён; при уменьшенной анимации и без файла — тишина; при наведении — никогда
    if (reduceMotion || !SOUNDS[side] || !window.SiteSound || !SiteSound.isOn()) return null;
    // со стороны машины: фура стоит слева, автобус справа (немного, не до упора)
    return SiteSound.play(SOUNDS[side], { pan: side === 'truck' ? -SOUND_PAN : SOUND_PAN }); // обещание { fade(ms) }
  }

  function choose(side) {
    if (chosen) return;
    chosen = true;
    clearTimeout(timer);
    root.classList.add('is-chosen');
    try { localStorage.setItem('vehicle', side); } catch (_) { /* приватный режим — не страшно */ }

    shown = side;
    showScene(`${side}-lit`); // вторая машина исчезает, у выбранной загораются фары
    const sound = playSound(side);

    const url = `${root.dataset.next}?vehicle=${side}`;
    if (reduceMotion) { setTimeout(() => location.assign(url), 350); return; }
    // мотор плавно стихает и замолкает вместе с концом затемнения: на главную приходят в тишине (файл не обрезаем)
    if (sound) setTimeout(() => sound.then((s) => s && s.fade(SOUND_FADE)), LIT_HOLD + FADE_OUT - SOUND_FADE);
    setTimeout(() => {
      root.classList.add('is-leaving');
      setTimeout(() => location.assign(url), FADE_OUT);
    }, LIT_HOLD);
  }

  // Вернулись кнопкой «Назад» (страница из кэша) — начинаем заново
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    chosen = false; shown = 'both'; pending = null;
    root.classList.remove('is-chosen', 'is-leaving');
    for (const [k, img] of Object.entries(sceneLayers)) if (k !== 'both') hideInstantly(img);
    root.dataset.shown = 'both';
  });

  // ---------- Кнопка звука и подсказка ----------
  const btn = document.getElementById('sound-btn');
  const tip = document.getElementById('sound-tip');
  const iconUse = btn.querySelector('use');
  function renderSound() {
    const on = SiteSound.isOn();
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? btn.dataset.offAria : btn.dataset.onAria);
    iconUse.setAttribute('href', on ? '#i-sound' : '#i-mute');
    btn.classList.toggle('is-fresh', !SiteSound.touched()); // золотое кольцо, пока кнопку не трогали
  }
  let tipTimer = 0;
  const hideTip = () => { clearTimeout(tipTimer); tip.hidden = true; };
  // звуки мотора — заранее, чтобы при выборе машины играли без задержки (только если звук включён)
  const warmSounds = () => {
    if (reduceMotion || !SiteSound.isOn()) return;
    Object.values(SOUNDS).forEach((u) => SiteSound.warm(u));
  };
  btn.addEventListener('click', () => {
    SiteSound.setOn(!SiteSound.isOn()); // жест пользователя — здесь же создаётся аудиоконтекст
    renderSound();
    hideTip();
    warmSounds();
  });
  if (document.readyState === 'complete') warmSounds(); else addEventListener('load', warmSounds);
  renderSound();
  addEventListener('pageshow', renderSound); // вернулись «Назад» или меняли звук на другой странице

  // Подсказка — только при первом визите: ПК ~6 с, телефон 4 с, или пока не нажали кнопку звука
  let seen = null;
  try { seen = localStorage.getItem('soundTipSeen'); } catch (_) { seen = '1'; }
  if (!seen && !SiteSound.touched()) {
    try { localStorage.setItem('soundTipSeen', '1'); } catch (_) { /* приватный режим */ }
    tip.hidden = false;
    placeTip();
    addEventListener('resize', placeTip);
    tipTimer = setTimeout(hideTip, portrait.matches ? 4000 : 6000);
  }
  function placeTip() { // ПК: стрелка пузыря — точно под серединой кнопки звука
    if (tip.hidden) return;
    const b = btn.getBoundingClientRect();
    const right = innerWidth - (b.left + b.width / 2) - tip.offsetWidth / 2;
    tip.style.setProperty('--tip-right', `${Math.max(8, right)}px`);
  }
})();
