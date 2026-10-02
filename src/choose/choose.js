// Выбор транспорта: наведение показывает одну машину, клик — фары, звук мотора и переход к ролику
(() => {
  // Рамки машин на исходных фото: [лево, верх, право, низ] в долях ширины/высоты фото (с зеркалами и колёсами).
  // Наведение и клик работают только внутри рамок. Поменяли фото — перемерьте.
  const BOXES = {
    truck: [0.112, 0.302, 0.525, 0.826],
    bus: [0.540, 0.408, 0.876, 0.798],
  };
  // Кадрирование слоёв (как object-position в choose.css): по X — середина промежутка между машинами,
  // поэтому на любом экране он остаётся на той же доле ширины.
  const SPLIT = 0.53, POS_Y = 0.6;
  const HYST = 0.012;         // рамку показанной машины расширяем на столько (доля фото), чтобы у края не мигало
  const SWITCH_DELAY = 150;   // мс: задержка перед уходом из рамки / сменой машины
  const LIT_HOLD = 1600;      // мс: сколько горят фары до затемнения
  const FADE_OUT = 500;       // мс: затемнение перед переходом (как .blackout в choose.css)
  const FADE_IN = 400;        // мс: проявление слоя (как transition у .layer в choose.css)
  const IMG_W = 2720, IMG_H = 1536; // размер исходных фото

  const root = document.getElementById('choose');
  const scene = document.getElementById('scene');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-aspect-ratio: 4/5)');
  const SOUNDS = JSON.parse(root.dataset.sounds || '{}'); // { truck: 'media/…mp3', bus: … } — только существующие

  root.style.setProperty('--pos', `${SPLIT * 100}% ${POS_Y * 100}%`);

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
  function showScene(name) {
    root.dataset.shown = name;
    clearTimeout(hideTimer);
    const top = sceneLayers[name];
    if (name === 'both') { // верхние слои плавно гаснут, под ними уже готовый кадр
      for (const [k, img] of Object.entries(sceneLayers)) if (k !== 'both') img.classList.remove('is-on');
      return;
    }
    top.style.zIndex = ++zTop;
    top.classList.add('is-on');
    hideTimer = setTimeout(() => {
      for (const [k, img] of Object.entries(sceneLayers)) if (k !== 'both' && img !== top) hideInstantly(img);
      top.style.zIndex = zTop = 2; // под ним никого не осталось — сбрасываем счётчик
    }, reduceMotion ? 0 : FADE_IN);
  }

  // Подгрузка остальных кадров сразу после загрузки страницы: при наведении не будет пустого кадра
  function preload() {
    const box = phone.matches ? document.getElementById('panels') : scene;
    box.querySelectorAll('img[data-srcset]').forEach((img) => {
      img.srcset = img.dataset.srcset;
      img.removeAttribute('data-srcset');
      img.loading = 'eager';
      img.decode().catch(() => {}); // декодируем заранее, чтобы первый показ не дал пустой кадр
    });
  }
  if (document.readyState === 'complete') preload(); else addEventListener('load', preload);
  phone.addEventListener('change', preload); // повернули телефон — догружаем другой набор

  // ---------- Рамки: кнопки ровно над машинами ----------
  const zones = [...scene.querySelectorAll('.zone')];

  // Как фото лежит на экране при object-fit: cover и object-position SPLIT / POS_Y
  function frame() {
    const r = scene.getBoundingClientRect();
    const k = Math.max(r.width / IMG_W, r.height / IMG_H), dw = IMG_W * k, dh = IMG_H * k;
    return { r, dw, dh, x: (r.width - dw) * SPLIT, y: (r.height - dh) * POS_Y };
  }
  function placeZones() {
    const f = frame();
    zones.forEach((z) => {
      const [x0, y0, x1, y1] = BOXES[z.dataset.side];
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
    const [x0, y0, x1, y1] = BOXES[shown];
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

  // ---------- Телефон: одно нажатие — весь сценарий ----------
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.addEventListener('click', () => choose(panel.dataset.side, panel));
  });

  // Кадрирование панели по машине: точка data-focus (доли фото) — в центре панели
  function focusPanels() {
    document.querySelectorAll('.panel .layer').forEach((img) => {
      const [fx, fy] = img.dataset.focus.split(' ').map(Number);
      const W = img.clientWidth, H = img.clientHeight;
      if (!W || !H) return;
      const k = Math.max(W / IMG_W, H / IMG_H), dw = IMG_W * k, dh = IMG_H * k;
      const px = dw > W ? Math.min(1, Math.max(0, (W / 2 - fx * dw) / (W - dw))) : 0.5;
      const py = dh > H ? Math.min(1, Math.max(0, (H / 2 - fy * dh) / (H - dh))) : 0.5;
      img.style.objectPosition = `${(px * 100).toFixed(2)}% ${(py * 100).toFixed(2)}%`;
    });
  }
  focusPanels();
  addEventListener('resize', focusPanels);

  // ---------- Выбор ----------
  function playSound(side) {
    if (reduceMotion || !SOUNDS[side]) return; // файла нет или анимации выключены — без звука
    try {
      const a = new Audio(SOUNDS[side]);
      a.play().catch(() => {});
    } catch (_) { /* без звука */ }
  }

  function choose(side, panel) {
    if (chosen) return;
    chosen = true;
    clearTimeout(timer);
    root.classList.add('is-chosen');
    try { localStorage.setItem('vehicle', side); } catch (_) { /* приватный режим — не страшно */ }

    if (panel) {
      document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('is-hidden', p !== panel));
      panel.querySelector(`.layer[data-layer="${side}-lit"]`).classList.add('is-on'); // поверх кадра без фар
    } else {
      shown = side;
      showScene(`${side}-lit`);
    }
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
    document.querySelectorAll('.panel').forEach((p) => {
      p.classList.remove('is-hidden');
      p.querySelectorAll('.layer[data-layer$="-lit"]').forEach(hideInstantly);
    });
  });
})();
