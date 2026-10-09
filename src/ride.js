// Главная: шапка над сценой и «дорога» — ролик, который едет вслед за прокруткой, и 10 карточек поверх него
(() => {
  // ---------- Шапка: прозрачная над роликом и финалом, тёмная с размытием над обычными секциями ----------
  const hud = document.getElementById('hud');
  const scenes = [...document.querySelectorAll('#ride, #final')];
  let hudRaf = 0;
  function overScene() { // что под серединой шапки; не чаще раза за кадр (scroll бывает чаще кадров)
    if (!hud || hudRaf) return;
    hudRaf = requestAnimationFrame(() => { hudRaf = 0; checkHud(); });
  }
  function checkHud() {
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

  // Карточки появляются по доле прокрутки секции: 0 вступление, 1–3 «профессия», 4 финал (шаги — только в плане).
  // Поровну: на каждую карточку ~четверть ролика
  const AT = [0, 0.2, 0.4, 0.6, 0.8];
  // Автостарт: при открытии машина сама проезжает от 0 до AUTO_TO за AUTO_MS (ease-out), дальше — прокрутка.
  // AUTO_MS = 0 выключает. При «уменьшить движение» автостарта нет
  const AUTO_TO = 6 / 119; // ~5%, ровно 7-й кадр из 120: в покое на экране целый кадр, без смешивания двух
  const AUTO_MS = 0; // выключен по просьбе владельца: при открытии — неподвижный первый кадр (было 3200)
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
  const dots = [...ride.querySelectorAll('.dots__dot')];
  const nextBtn = document.getElementById('ride-next');
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

  // Порядок загрузки: сначала первые FIRST кадров подряд и каждый 8-й (сцена сразу «живая» по всей длине),
  // дальше — подряд ВПЕРЁД от того места, где сейчас посетитель (потом назад). Так кадры впереди готовы раньше,
  // чем до них доедут, и машина не перескакивает через кадры. want(a, b) ставит кадры a..b в начало очереди
  // (так делает «Далее» перед переходом). Экран выбора заранее кладёт первые кадры в кэш (preload-home.js)
  const FIRST = 9;
  let pending = new Set(), prio = [];
  function want(a, b) {
    const add = [];
    for (let i = Math.max(0, a); i <= Math.min(set.count - 1, b); i++) if (pending.has(i)) add.push(i);
    prio = add.concat(prio);
  }
  function nextIndex() {
    while (prio.length) { const i = prio.shift(); if (pending.has(i)) return i; }
    if (!pending.size) return -1;
    const c = Math.max(0, Math.round(Math.max(0, cur) * (set.count - 1)));
    for (let i = c; i < set.count; i++) if (pending.has(i)) return i;
    for (let i = c - 1; i >= 0; i--) if (pending.has(i)) return i;
    return -1;
  }
  function load(s) {
    set = s;
    frames = new Array(s.count);
    shown = null;
    loaded = 0;
    pending = new Set(Array.from({ length: s.count }, (_, i) => i));
    prio = [];
    for (let i = 0; i < FIRST; i++) prio.push(i);
    for (let i = FIRST; i < s.count; i += 8) prio.push(i);
    const worker = () => {
      if (set !== s) return;
      const i = nextIndex();
      if (i < 0) return;
      pending.delete(i);
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

  // Куда ведёт «Далее» с последней карточки: план, а если он скрыт (тексты заказчика на ПК в английском) — финал
  function afterRide() {
    const plan = document.getElementById('plan');
    return plan.getClientRects().length
      ? { s: plan, h: document.getElementById('plan-title') }
      : { s: document.getElementById('final'), h: document.getElementById('final-title') };
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
    // «Далее»: доступное имя — куда ведёт (следующая карточка, с последней — план)
    // (на ПК в английском у карточек может не быть заголовка и нет плана — тогда просто «Далее» / финал, см. src/client-pc.js)
    const vis = (e) => e.getClientRects().length > 0;
    const to = i + 1 < cards.length ? [...cards[i + 1].querySelectorAll('.rcard__title')].find(vis) : afterRide().h;
    const shown = to && ([...to.querySelectorAll('.tpc, .tpc-def')].find(vis) || to);
    nextBtn.setAttribute('aria-label', shown ? `${nextBtn.dataset.label}: ${shown.textContent.trim()}` : nextBtn.dataset.label);
    // стрелка «Далее» снова подпрыгивает 3 раза (анимация конечная, см. landing.css)
    nextBtn.querySelector('.icon')?.getAnimations().forEach((a) => { a.cancel(); a.play(); });
  }

  // ---------- «Далее» и точки: плавно докрутить до карточки ----------
  // Своя анимация прокрутки (а не behavior: 'smooth'): одинаковая скорость во всех браузерах, ролик успевает
  // проехать свой отрезок. Колесо, касание или клавиша посетителя сразу её останавливают
  // Длительность перехода, мс: по длине пути (GO_PER — на один экран прокрутки), в пределах GO_MS.
  // Карточек 5: между соседними ~1,1 с (как было при 10 карточках, ~0,9 с), машина проезжает ~24 кадра
  const GO_MS = [700, 2400];
  const GO_PER = 700;
  const GO_WAIT = 1500;        // мс: сколько «Далее» ждёт кадры отрезка перед переходом (медленная сеть)
  let go = 0, goToken = 0;
  const stopGo = () => { cancelAnimationFrame(go); go = 0; goToken++; };
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, stopGo, { passive: true }));
  function cardTop(i) { // начало карточки i (чуть дальше порога, чтобы она точно стала активной); за последней — план
    if (i >= AT.length) return afterRide().s.getBoundingClientRect().top + scrollY;
    const r = ride.getBoundingClientRect();
    return r.top + scrollY + Math.min(1, AT[i] + 0.012) * (r.height - innerHeight);
  }
  function goTo(i) {
    stopGo();
    const from = scrollY, to = Math.round(cardTop(i)), dist = to - from;
    const done = () => {
      go = 0;
      if (i >= AT.length) { // ушли к плану — фокус на его заголовок
        const h = afterRide().h;
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }
    };
    if (reduceMotion || !dist) { scrollTo({ top: to, behavior: 'instant' }); done(); return; }
    const ms = Math.min(GO_MS[1], Math.max(GO_MS[0], Math.abs(dist) / innerHeight * GO_PER));
    // кадры, через которые проедет машина: грузим их первыми и ждём (не дольше GO_WAIT), чтобы не было прыжков
    const n = set.count - 1, r = ride.getBoundingClientRect(), total = r.height - innerHeight;
    const frameAt = (y) => Math.round((auto + Math.min(1, Math.max(0, (y - (r.top + scrollY)) / total)) * (1 - A)) * n);
    const f0 = frameAt(from), f1 = frameAt(to), lo = Math.min(f0, f1), hi = Math.max(f0, f1);
    want(lo, hi + 4);
    const ready = () => { for (let k = lo; k <= hi; k++) if (!frames[k]) return false; return true; };
    const token = ++goToken, asked = performance.now();
    const step = (t0) => (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = (1 - Math.cos(Math.PI * t)) / 2; // мягкий разгон и торможение (синус): пик скорости ×1,6 от средней, а не ×3, как у кубической — без рывка посередине
      scrollTo({ top: from + dist * e, behavior: 'instant' });
      if (t < 1) go = requestAnimationFrame(step(t0)); else done();
    };
    const wait = () => {
      if (token !== goToken) return; // посетитель сам крутит колесо или нажал что-то ещё
      if (ready() || performance.now() - asked > GO_WAIT) { const t0 = performance.now(); go = requestAnimationFrame(step(t0)); }
      else go = requestAnimationFrame(wait);
    };
    // нажатие само вызывает pointerdown/keydown → stopGo, поэтому старт — кадром позже
    requestAnimationFrame(() => { if (token === goToken) go = requestAnimationFrame(wait); });
  }
  nextBtn.addEventListener('click', () => goTo(Math.max(0, active) + 1));
  dots.forEach((d) => d.addEventListener('click', () => goTo(Number(d.dataset.go))));
  // «Собрать план» на карточках ролика — тот же переход к плану, что у «Далее» с последней карточки (решение владельца)
  ride.querySelectorAll('.rcard a[href="#plan"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    goTo(AT.length);
  }));

  // ---------- Автостарт ----------
  // Положение ролика v = auto + p · (1 − A): auto плавно растёт от 0 до A = AUTO_TO, поэтому после автостарта
  // прокрутка продолжает с того же места, а последний кадр — в самом конце секции
  const A = AUTO_MS > 0 && !reduceMotion ? AUTO_TO : 0;
  let auto = A;            // если страницу открыли не с начала — сразу «доехали»
  let autoStart = 0;       // момент старта (0 — не запущен)
  if (A && scrollY < 4) auto = 0;
  function maybeAuto() { // ждём все кадры автостарта подряд, чтобы машина поехала плавно, без рывков
    if (auto >= A || autoStart) return;
    for (let i = 0; i < FIRST; i++) if (!frames[i]) return;
    autoStart = performance.now();
    request();
  }
  // медленная сеть: не ждём дольше 4 с (дальше машина поедет по тем кадрам, что есть)
  setTimeout(() => { if (!autoStart && auto < A) { autoStart = performance.now(); request(); } }, 4000);

  // ---------- Цикл ----------
  // Сцена идёт строго за прокруткой, с очень короткой инерцией (~0,1 с), чтобы сгладить рывки колеса мыши.
  // Ограничителя скорости по времени нет (пробовали — рассинхрон): скорость задаёт высота секции (--ride-vh).
  // Доводка: прокрутка остановилась между кадрами — сцена доезжает до СЛЕДУЮЩЕГО целого кадра по ходу движения
  // (вперёд — вверх по номеру, назад — вниз), а не до ближайшего: так фура никогда не откатывается назад.
  // Пока посетитель продолжает листать в ту же сторону, сцена держит доведённый кадр (hold) и не отступает от него.
  let cur = -1, raf = 0, last = 0, snap = false, snapTimer = 0;
  let dir = 1, lastY = scrollY, hold = null;
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
    const raw = auto + p * (1 - A);
    let target = raw;
    if (set) {
      const n = set.count - 1;
      if (snap) {
        target = (dir > 0 ? Math.ceil(raw * n - 1e-6) : Math.floor(raw * n + 1e-6)) / n;
        hold = target;
      } else if (hold !== null) {
        if (dir > 0 ? raw >= hold : raw <= hold) hold = null; else target = hold;
      }
    }
    if (cur < 0 || reduceMotion) cur = target;
    else cur += (target - cur) * (1 - Math.pow(0.65, dt * 60));
    if (Math.abs(target - cur) < 0.0002) cur = target;
    draw(cur);
    if (cur !== target || (autoStart && auto < A)) raf = requestAnimationFrame(tick); else last = 0;
  }
  function request() { if (!raf) raf = requestAnimationFrame(tick); }

  addEventListener('scroll', () => {
    const d = scrollY - lastY;
    lastY = scrollY;
    if (d) {
      const nd = d > 0 ? 1 : -1;
      if (nd !== dir) hold = null; // повернули назад — сцена сразу идёт за прокруткой
      dir = nd;
    }
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
