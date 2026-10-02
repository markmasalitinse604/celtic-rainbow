// Выбор транспорта: наведение показывает одну машину, клик — фары, звук мотора и переход к ролику
(() => {
  // Два набора кадров. Для каждого: размер исходника, кадрирование слоёв (object-position, доли) и рамки машин
  // [лево, верх, право, низ] в долях кадра (с зеркалами и колёсами). Наведение и клик — только внутри рамок.
  // Поменяли фото — перемерьте рамки. Горизонтальный: по X кадрирование — середина промежутка между машинами.
  const SETS = {
    h: { w: 2720, h: 1536, pos: [0.53, 0.6], sizes: 'max(100vw, 177vh)',
      boxes: { truck: [0.112, 0.302, 0.525, 0.826], bus: [0.540, 0.408, 0.876, 0.798] } },
    v: { w: 1536, h: 2720, pos: [0.49, 0.57], sizes: 'max(100vw, 56.5vh)', // телефон в портрете
      boxes: { truck: [0.068, 0.468, 0.526, 0.676], bus: [0.551, 0.503, 0.906, 0.660] } },
  };
  const HYST = 0.012;         // рамку показанной машины расширяем на столько (доля фото), чтобы у края не мигало
  const SWITCH_DELAY = 150;   // мс: задержка перед уходом из рамки / сменой машины
  const LIT_HOLD = 1600;      // мс: сколько горят фары до затемнения
  const FADE_OUT = 500;       // мс: затемнение перед переходом (как .blackout в choose.css)
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
    }, reduceMotion ? 0 : FADE_IN);
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
  function placeZones() {
    const f = frame();
    zones.forEach((z) => {
      const [x0, y0, x1, y1] = set.boxes[z.dataset.side];
      z.style.left = `${f.x + x0 * f.dw}px`;
      z.style.top = `${f.y + y0 * f.dh}px`;
      z.style.width = `${(x1 - x0) * f.dw}px`;
      z.style.height = `${(y1 - y0) * f.dh}px`;
    });
  }
  placeZones();
  addEventListener('resize', placeZones);

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

  scene.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return; // на тач-экранах наведения нет — только нажатие
    const zone = e.target.closest('.zone'); // рамка машины или её подпись
    const side = insideShown(e) ? shown : zone ? zone.dataset.side : 'both';
    // из общего кадра на машину — сразу; уход из рамки и смена машины — с задержкой
    want(side, shown === 'both' ? 0 : SWITCH_DELAY);
  });
  scene.addEventListener('pointerleave', (e) => {
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

  // На телефоне наведения нет: нажатие на машину сразу запускает весь сценарий (click выше)

  // ---------- Выбор ----------
  function playSound(side) {
    if (reduceMotion || !SOUNDS[side]) return; // файла нет или анимации выключены — без звука
    try {
      const a = new Audio(SOUNDS[side]);
      a.play().catch(() => {});
    } catch (_) { /* без звука */ }
  }

  function choose(side) {
    if (chosen) return;
    chosen = true;
    clearTimeout(timer);
    root.classList.add('is-chosen');
    try { localStorage.setItem('vehicle', side); } catch (_) { /* приватный режим — не страшно */ }

    shown = side;
    showScene(`${side}-lit`); // вторая машина исчезает, у выбранной загораются фары
    playSound(side);

    const url = `${root.dataset.next}?vehicle=${side}#ride`;
    if (reduceMotion) { setTimeout(() => location.assign(url), 700); return; }
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
})();
