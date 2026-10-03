// Главная: шапка над сценой и «дорога» — ролик, который едет вслед за прокруткой, и 10 карточек поверх него
(() => {
  // ---------- Шапка: прозрачная над роликом и финалом, тёмная с размытием над обычными секциями ----------
  const hud = document.getElementById('hud');
  const scenes = [...document.querySelectorAll('#ride, #final')];
  function overScene() { // что под серединой шапки
    if (!hud) return;
    const y = hud.offsetHeight / 2;
    const els = document.elementsFromPoint(innerWidth / 2, y);
    const onScene = els.some((el) => !hud.contains(el) && scenes.some((s) => s.contains(el)));
    hud.classList.toggle('is-solid', !onScene);
  }

  const ride = document.getElementById('ride');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = document.documentElement.classList.contains('save-data');
  // Экономия трафика: статичная версия (один кадр, карточки списком) — ролик не грузим
  if (!ride || saveData) {
    addEventListener('scroll', overScene, { passive: true });
    addEventListener('resize', overScene);
    overScene();
    return;
  }

  // Карточки появляются по доле прокрутки секции: 0 вступление, 1–5 шаги, 6–8 «профессия», 9 финал
  const AT = [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.67, 0.76, 0.87];
  // Автостарт: при открытии машина сама проезжает от 0 до AUTO_TO за AUTO_MS (ease-out), дальше — прокрутка.
  // AUTO_MS = 0 выключает. При «уменьшить движение» автостарта нет
  const AUTO_TO = 0.05;
  const AUTO_MS = 3200;
  // Через SNAP_DELAY после остановки прокрутки сцена доезжает до целого кадра: в покое нет двоения от смешивания
  const SNAP_DELAY = 120; // мс

  // Наборы кадров: полный размер для больших и Retina-экранов, облегчённый для небольших
  // и вертикальный (отдельный ролик 9:16) для телефонов. Каждое устройство грузит только свой.
  const SETS = {
    hd: { dir: 'hd', count: 120 },     // 1920×1086
    land: { dir: 'land', count: 120 }, // 1280×724
    port: { dir: 'port', count: 120, ay: 0.8 }, // 720×1274; машина в нижней трети — обрезаем больше неба, чем дороги
  };
  // Кадры автобуса (src/assets/ride-bus) — только если они есть (data-frames-bus ставит build.js)
  const isBus = window.SiteVehicle && window.SiteVehicle.kind === 'bus';
  const base = isBus && ride.dataset.framesBus ? ride.dataset.framesBus : ride.dataset.frames;

  const canvas = ride.querySelector('.ride__canvas');
  const ctx = canvas.getContext('2d');
  const cards = [...ride.querySelectorAll('.rcard')];
  const ring = ride.querySelector('.ring');
  const ringN = ring.querySelector('.ring__n');
  const dots = [...ride.querySelectorAll('.dots__dot')];
  ride.classList.add('ride--live');

  function getProgress() {
    const r = ride.getBoundingClientRect();
    const total = r.height - innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  }
  function pickSet() {
    if (innerWidth / innerHeight < 0.9) return SETS.port; // как (max-aspect-ratio: 9/10) в landing.css
    const devicePx = innerWidth * Math.min(devicePixelRatio || 1, 2);
    return devicePx > 1500 ? SETS.hd : SETS.land;
  }

  // ---------- Кадры ----------
  let set = null;
  let frames = [];
  let shown = null;
  let loaded = 0;

  // сначала каждый 8-й кадр (сцена сразу «живая»), потом всё более частые
  function load(s) {
    set = s;
    frames = new Array(s.count);
    shown = null;
    loaded = 0;
    const order = [], seen = new Set();
    for (const step of [8, 4, 2, 1]) {
      for (let i = 0; i < s.count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    }
    let next = 0;
    const worker = () => {
      if (set !== s || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = 'async';
      // Декодируем заранее, вне основного потока: иначе первая отрисовка кадра тормозит прокрутку
      const ready = () => {
        if (set === s) { frames[i] = img; loaded++; shown = null; request(); maybeAuto(); }
        worker();
      };
      img.onload = () => (img.decode ? img.decode().then(ready, ready) : ready());
      img.onerror = worker;
      img.src = `${base}/${s.dir}/${String(i + 1).padStart(3, '0')}.webp`;
    };
    for (let k = 0; k < 6; k++) worker(); // 6 загрузок параллельно
  }

  function nearest(i) {
    if (frames[i]) return frames[i];
    for (let d = 1; d < frames.length; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  function paint(img, alpha) {
    const w = canvas.width, h = canvas.height;
    const k = Math.max(w / img.naturalWidth, h / img.naturalHeight); // как object-fit: cover
    const dw = img.naturalWidth * k, dh = img.naturalHeight * k;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) * (set.ay || 0.5), dw, dh); // ay — как object-position по высоте
  }

  // Между соседними кадрами плавно смешиваем: движение без ступенек и «мигания»
  function draw(v) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; shown = null; }
    const pos = v * (set.count - 1);
    const key = pos.toFixed(3);
    if (key === shown) return; // кадр не изменился — не перерисовываем
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const i0 = Math.floor(pos), i1 = Math.min(set.count - 1, i0 + 1), mix = pos - i0;
    if (frames[i0] && frames[i1]) {
      paint(frames[i0], 1);
      if (mix > 0.01) paint(frames[i1], mix);
    } else {
      const img = nearest(Math.round(pos)); // кадры ещё грузятся — показываем ближайший
      if (!img) return;
      paint(img, 1);
    }
    ctx.globalAlpha = 1;
    shown = key;
    ride.classList.add('ride--ready');
  }

  // ---------- Карточки и счётчик ----------
  let active = -1;
  function setCard(p) {
    let i = 0;
    while (i + 1 < AT.length && p >= AT[i + 1]) i++;
    if (i === active) return;
    active = i;
    cards.forEach((c, k) => {
      const on = k === i;
      c.classList.toggle('is-on', on);
      c.toggleAttribute('inert', !on); // неактивные карточки — вне фокуса и вне дерева доступности
      if (on) c.removeAttribute('aria-hidden'); else c.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    ride.dataset.card = i; // .ride[data-card="0"] — вступление: плавающая кнопка и точки прячутся
    const step = Number(cards[i].dataset.step) || 0; // 1–5 только на шагах
    ring.classList.toggle('is-on', step > 0);
    if (step) {
      ringN.textContent = step;
      ring.style.setProperty('--ring-off', String(100 - step * 20));
    }
  }

  // ---------- «Далее» и точки: плавно докрутить до карточки ----------
  // Своя анимация прокрутки (а не behavior: 'smooth'): одинаковая скорость во всех браузерах, ролик успевает
  // проехать свой отрезок. Любое действие посетителя (колесо, касание, клавиша) сразу её останавливает
  const GO_MS = [900, 1600]; // мин. и макс. длительность, мс — по длине пути
  let go = 0;
  const stopGo = () => { cancelAnimationFrame(go); go = 0; };
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, stopGo, { passive: true }));
  function cardTop(i) { // начало карточки i (чуть дальше порога, чтобы она точно была активной); 10 — план
    if (i >= AT.length) return document.getElementById('plan').getBoundingClientRect().top + scrollY;
    const r = ride.getBoundingClientRect();
    return r.top + scrollY + Math.min(1, AT[i] + 0.012) * (r.height - innerHeight);
  }
  function goTo(i, focus) {
    stopGo();
    const from = scrollY, to = Math.round(cardTop(i)), dist = to - from;
    const done = () => {
      go = 0;
      if (i < AT.length) setCard(getProgress()); // карточка становится активной (снимается inert) до фокуса
      if (!focus) return;
      const el = i < AT.length ? cards[i].querySelector('.next') : document.getElementById('plan-title');
      if (el && !el.matches('button, a')) el.setAttribute('tabindex', '-1');
      el?.focus({ preventScroll: true });
    };
    if (reduceMotion || !dist) { scrollTo({ top: to, behavior: 'instant' }); done(); return; }
    const ms = Math.min(GO_MS[1], Math.max(GO_MS[0], Math.abs(dist) / innerHeight * 700));
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease-in-out
      scrollTo({ top: from + dist * e, behavior: 'instant' });
      if (t < 1) go = requestAnimationFrame(step); else done();
    };
    // клик тоже вызывает pointerdown → stopGo, поэтому анимацию запускаем кадром позже
    requestAnimationFrame(() => { go = requestAnimationFrame(step); });
  }
  ride.addEventListener('click', (e) => {
    const b = e.target.closest('[data-next]');
    if (!b) return;
    goTo(Number(b.dataset.next), b.classList.contains('next'));
  });

  // ---------- Автостарт ----------
  // Положение ролика v = auto + p · (1 − A): auto плавно растёт от 0 до A = AUTO_TO, поэтому после автостарта
  // прокрутка продолжает с того же места, а последний кадр — в самом конце секции
  const A = AUTO_MS > 0 && !reduceMotion ? AUTO_TO : 0;
  let auto = A;            // если страницу открыли не с начала — сразу «доехали»
  let autoStart = 0;       // момент старта (0 — не запущен)
  if (A && scrollY < 4) auto = 0;
  function maybeAuto() { // ждём первые кадры (каждый 8-й), чтобы машина поехала плавно
    if (auto >= A || autoStart || loaded < set.count / 8) return;
    autoStart = performance.now();
    request();
  }
  setTimeout(() => { if (!autoStart && auto < A) { autoStart = performance.now(); request(); } }, 2500);

  // ---------- Цикл ----------
  // Сцена идёт строго за прокруткой, с очень короткой инерцией (~0,1 с), чтобы сгладить рывки колеса мыши.
  // Ограничителя скорости по времени нет (пробовали — рассинхрон): скорость задаёт высота секции (--ride-vh).
  let cur = -1, raf = 0, last = 0, snap = false, snapTimer = 0;
  function tick(now) {
    raf = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    last = now;
    if (autoStart && auto < A) {
      const t = Math.min(1, (now - autoStart) / AUTO_MS);
      auto = A * (1 - Math.pow(1 - t, 3)); // ease-out
    }
    const p = getProgress();
    setCard(p);
    let target = auto + p * (1 - A);
    if (snap && set) target = Math.round(target * (set.count - 1)) / (set.count - 1);
    if (cur < 0 || reduceMotion) cur = target;
    else cur += (target - cur) * (1 - Math.pow(0.65, dt * 60));
    if (Math.abs(target - cur) < 0.0002) cur = target;
    draw(cur);
    if (cur !== target || (autoStart && auto < A)) raf = requestAnimationFrame(tick); else last = 0;
  }
  function request() { if (!raf) raf = requestAnimationFrame(tick); }

  addEventListener('scroll', () => {
    snap = false;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => { snap = true; request(); }, SNAP_DELAY);
    overScene();
    request();
  }, { passive: true });
  addEventListener('resize', () => {
    const s = pickSet();
    if (s !== set) load(s); else shown = null;
    overScene();
    request();
  });
  // Фоновый звук (если файл есть и звук включён): громкость и скорость следуют за прокруткой — см. shared/sound.js.
  // При «уменьшить движение» звука нет
  const ambient = JSON.parse(document.getElementById('site-data').textContent).ambient;
  if (ambient && !reduceMotion && window.SiteSound) window.SiteSound.setAmbient(ambient);

  load(pickSet()); // сцена — первый экран, кадры грузим сразу
  overScene();
  request();
})();
