// Выбор транспорта: наведение показывает одну машину, клик — фары, звук мотора и переход к ролику
(() => {
  // Граница между машинами на исходных фото (доля ширины). Пустой промежуток между фурой и автобусом —
  // примерно от 0.52 (правое зеркало фуры) до 0.54 (задний угол автобуса), граница — посередине.
  const SPLIT = 0.53;
  const HYST = 0.01;          // «мёртвая зона» вокруг границы (доля ширины фото), чтобы не мигало
  const SWITCH_DELAY = 150;   // мс: задержка перед сменой стороны
  const LIT_HOLD = 1600;      // мс: сколько горят фары до затемнения
  const FADE_OUT = 500;       // мс: затемнение перед переходом (как .blackout в choose.css)
  const FADE_IN = 400;        // мс: проявление слоя (как transition у .layer в choose.css)
  const IMG_W = 2720, IMG_H = 1536; // размер исходных фото

  const root = document.getElementById('choose');
  const scene = document.getElementById('scene');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-aspect-ratio: 4/5)');
  const SOUNDS = JSON.parse(root.dataset.sounds || '{}'); // { truck: 'media/…mp3', bus: … } — только существующие

  root.style.setProperty('--split', `${SPLIT * 100}%`);

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

  // ---------- Наведение мышью (с задержкой и гистерезисом) ----------
  let shown = 'both', pending = null, timer = 0, chosen = false;

  // Доля ширины ФОТО под курсором. object-position по X = SPLIT, поэтому граница на экране всегда на SPLIT ширины.
  function imageX(clientX) {
    const r = scene.getBoundingClientRect();
    const dw = Math.max(r.width, r.height * IMG_W / IMG_H); // ширина фото при object-fit: cover
    return SPLIT + (clientX - r.left - SPLIT * r.width) / dw;
  }

  function want(side, delay) {
    if (chosen) return;
    if (side === shown) { clearTimeout(timer); pending = null; return; }
    if (side === pending) return;
    clearTimeout(timer);
    pending = side;
    const go = () => { pending = null; shown = side; showScene(side); };
    if (delay) timer = setTimeout(go, delay); else go();
  }

  scene.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return; // на тач-экранах наведения нет — только нажатие
    const x = imageX(e.clientX);
    let side;
    if (shown === 'truck') side = x < SPLIT + HYST ? 'truck' : 'bus';
    else if (shown === 'bus') side = x > SPLIT - HYST ? 'bus' : 'truck';
    else side = x < SPLIT ? 'truck' : 'bus';
    // первый вход в сцену — сразу, смена стороны — с задержкой
    want(side, shown === 'both' ? 0 : SWITCH_DELAY);
  });
  scene.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    const focused = scene.querySelector('.half:focus-visible'); // фокус с клавиатуры держит свою сторону
    want(focused ? focused.dataset.side : 'both', 0);
  });

  // ---------- Клавиатура: фокус работает как наведение ----------
  scene.querySelectorAll('.half').forEach((btn) => {
    btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) want(btn.dataset.side, 0); });
    btn.addEventListener('blur', () => {
      setTimeout(() => { if (!scene.contains(document.activeElement)) want('both', 0); });
    });
    btn.addEventListener('click', (e) => {
      // Мышью у самой границы показанная сторона (с гистерезисом) важнее, чем кнопка под курсором
      const side = e.detail > 0 && shown !== 'both' ? shown : btn.dataset.side;
      choose(side);
    });
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
