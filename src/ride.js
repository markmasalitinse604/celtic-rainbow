// Первый экран: кадры ролика прокручиваются вслед за скроллом, заголовок уходит в начале прокрутки
(() => {
  const ride = document.getElementById('ride');
  const canvas = ride.querySelector('.ride__canvas');
  const ctx = canvas.getContext('2d');
  const bar = ride.querySelector('.ride__progress span');
  const base = ride.dataset.frames; // путь к папке с наборами кадров

  // Наборы кадров: полный размер для больших и Retina-экранов, облегчённый для небольших
  // и вертикальный (отдельный ролик 9:16) для телефонов. Каждое устройство грузит только свой.
  const SETS = {
    hd: { dir: 'hd', count: 120 },     // 1920×1086, ~10 МБ
    land: { dir: 'land', count: 120 }, // 1280×724, ~6 МБ
    port: { dir: 'port', count: 120 }, // 720×1274, ~4 МБ
  };
  const FADE = 0.06; // доля прокрутки, за которую уходит заголовок

  // Ролик идёт только за прокруткой (сам не проигрывается), поэтому показываем его всем, в том числе
  // при «уменьшить движение» — тогда без инерции, кадр строго по прокрутке. Выключаем только при экономии трафика.
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) return;
  ride.classList.add('ride--live');

  function getProgress() {
    const r = ride.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  }
  function pickSet() {
    if (window.innerWidth / window.innerHeight < 0.9) return SETS.port;
    const devicePx = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    return devicePx > 1500 ? SETS.hd : SETS.land;
  }

  let set = null;
  let frames = [];
  let shown = null;

  // сначала каждый 8-й кадр (сцена сразу «живая»), потом всё более частые
  function load(s) {
    set = s;
    frames = new Array(s.count);
    shown = null;
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
      const ready = () => { if (set === s) { frames[i] = img; shown = null; request(); } worker(); };
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
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  // Между соседними кадрами плавно смешиваем: движение без ступенек и «мигания»
  function draw(p) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; shown = null; }
    const pos = p * (set.count - 1);
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

  // Сцена идёт строго за прокруткой, с очень короткой инерцией (~0,1 с), чтобы сгладить рывки колеса мыши.
  // Во время прокрутки соседние кадры смешиваются (плавно), а когда прокрутка остановилась на SNAP_DELAY,
  // сцена мягко доезжает до ближайшего целого кадра: в покое на экране всегда один чёткий кадр, без двоения
  // (колесо с щелчками почти всегда останавливает прокрутку между кадрами).
  const SNAP_DELAY = 120; // мс
  let cur = getProgress(), raf = 0, last = 0, snap = false, snapTimer = 0;
  function tick(now) {
    raf = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    last = now;
    let target = getProgress();
    if (snap && set) target = Math.round(target * (set.count - 1)) / (set.count - 1);
    cur = reduceMotion ? target : cur + (target - cur) * (1 - Math.pow(0.65, dt * 60));
    if (Math.abs(target - cur) < 0.0002) cur = target;
    draw(cur);
    bar.style.width = `${(cur * 100).toFixed(1)}%`;
    const fade = Math.min(1, cur / FADE);
    ride.style.setProperty('--fade', fade.toFixed(3));
    ride.classList.toggle('ride--passed', fade >= 1); // заголовок ушёл: убираем его из-под клика
    if (cur !== target) raf = requestAnimationFrame(tick); else last = 0;
  }
  function request() { if (!raf) raf = requestAnimationFrame(tick); }

  window.addEventListener('scroll', () => {
    snap = false;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => { snap = true; request(); }, SNAP_DELAY);
    request();
  }, { passive: true });
  window.addEventListener('resize', () => {
    const s = pickSet();
    if (s !== set) load(s); else shown = null;
    request();
  });
  load(pickSet()); // сцена — первый экран, кадры грузим сразу
  request();
})();
