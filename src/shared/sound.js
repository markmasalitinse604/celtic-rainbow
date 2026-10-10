// Общее состояние звука экрана выбора и главной: localStorage 'sound' = 'on' | 'off' (по умолчанию 'off').
// Аудиоконтекст создаётся только по жесту пользователя (кнопка звука, выбор машины, клик или клавиша),
// иначе браузер его заблокирует.
// Экран выбора: свою кнопку и звук мотора ведёт choose.js (SiteSound.play).
// Главная: кнопка с data-sound-auto подключается здесь, фоновый звук включает ride.js (SiteSound.setAmbient):
// петля ветра или мотор (холостой ход + езда); всё следует за скоростью прокрутки, на скрытой вкладке звук на паузе.
window.SiteSound = (() => {
  const KEY = 'sound';
  const get = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (_) { /* приватный режим */ } };
  let ctx = null;
  const buffers = {};

  function unlock() { // вызывать только из обработчика клика/нажатия
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  async function load(url) {
    if (buffers[url]) return buffers[url];
    const c = unlock();
    if (!c) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    buffers[url] = await c.decodeAudioData(await res.arrayBuffer());
    return buffers[url];
  }

  // ---------- Фоновый звук главной ----------
  // Два режима (setAmbient):
  //  • одна петля (строка url) — ветер/гул: громкость и скорость воспроизведения растут со скоростью прокрутки;
  //  • мотор ({ idle, drive }) — две петли играют одновременно: стоим — слышен холостой ход, листают — мотор
  //    «разгоняется» (появляется петля езды, обороты растут), перестали — «тормозит» обратно к холостому.
  //    Разгон быстрее торможения, как у настоящего мотора.
  // Файлы бесшовные (конец сведён с началом при нарезке, см. assets-src/sound/make-loops.sh), каждый играет
  // одним источником с loop = true; тихие края от кодека AAC отрезаем (loopStart / loopEnd), чтобы на стыке не было провала.
  let amb = null; // { urls, mix, layers: [{ src, gain }], speed, lastY, lastT, raf }
  const MIX = {
    // одна петля: громкость 0.35…0.9, скорость 1…1.12
    loop: [(x) => [0.35 + x * 0.55, 1 + x * 0.12]],
    // мотор: холостой ход стихает, но не до нуля (он под ездой), езда появляется; обороты обеих петель растут
    engine: [
      (x) => [0.5 - x * 0.25, 1 + x * 0.18], // холостой: тише и «дальше» (владелец), под ездой не пропадает совсем
      (x) => [x * 0.95, 0.88 + x * 0.24],
    ],
  };
  const UP = 0.1, DOWN = 0.035; // доля приближения скорости за кадр: разгон быстрее, торможение плавнее
  function edges(buf) {
    const d = buf.getChannelData(0), n = d.length, lim = 1e-4, max = Math.min(n >> 2, 4800);
    let a = 0, b = n - 1;
    while (a < max && Math.abs(d[a]) < lim) a++;
    while (n - 1 - b < max && Math.abs(d[b]) < lim) b--;
    return [a / buf.sampleRate, (b + 1) / buf.sampleRate];
  }
  function ambApply(tc) { // текущая скорость → громкость и обороты каждой петли
    const t = ctx.currentTime;
    amb.layers.forEach((l, k) => {
      const [g, r] = amb.mix[k](amb.speed);
      l.gain.gain.setTargetAtTime(g, t, tc);
      l.src.playbackRate.setTargetAtTime(r, t, tc);
    });
  }
  function ambTick(now) { // скорость прокрутки → громкость и скорость воспроизведения
    if (!amb || !amb.layers) return;
    const dt = Math.max(0.001, (now - amb.lastT) / 1000);
    const pps = Math.abs(scrollY - amb.lastY) / dt;
    amb.lastY = scrollY; amb.lastT = now;
    const target = Math.min(1, pps / 2500);
    amb.speed += (target - amb.speed) * (target > amb.speed ? UP : DOWN);
    ambApply(0.05);
    // прокрутка стоит и скорость затухла — цикл засыпает до следующей прокрутки (не крутим JS 60 раз в секунду впустую);
    // петли продолжают играть сами, без JS
    if (pps === 0 && amb.speed < 0.002) { amb.speed = 0; ambApply(0.2); amb.raf = 0; return; }
    amb.raf = requestAnimationFrame(ambTick);
  }
  addEventListener('scroll', () => {
    if (!amb || !amb.layers || amb.raf) return;
    // проснулись: lastY не трогаем — это место, где прокрутка стояла, и путь от него и есть скорость
    // (раньше lastY сбрасывался на новое место, и скорость всегда выходила нулевой); время — как будто прошёл кадр
    amb.lastT = performance.now() - 16;
    amb.raf = requestAnimationFrame(ambTick);
  }, { passive: true });
  async function ambStart() {
    if (!amb || amb.layers || amb.loading || !isOn() || document.hidden || !ctx) return;
    amb.loading = true;
    try {
      const bufs = await Promise.all(amb.urls.map(load));
      if (bufs.some((b) => !b) || amb.layers || !isOn()) return;
      amb.speed = 0;
      amb.layers = bufs.map((buf, k) => {
        const [a, b] = edges(buf);
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true; src.loopStart = a; src.loopEnd = b;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.setTargetAtTime(amb.mix[k](0)[0], ctx.currentTime, 0.15); // мягкое появление
        src.playbackRate.value = amb.mix[k](0)[1];
        src.connect(gain).connect(ctx.destination);
        src.start(0, a);
        return { src, gain };
      });
      amb.lastY = scrollY; amb.lastT = performance.now();
      amb.raf = requestAnimationFrame(ambTick);
    } catch (_) { /* без звука */ } finally { if (amb) amb.loading = false; }
  }
  function ambStop() {
    if (!amb || !amb.layers) return;
    const layers = amb.layers;
    amb.layers = null;
    cancelAnimationFrame(amb.raf); amb.raf = 0;
    layers.forEach(({ src, gain }) => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      setTimeout(() => { try { src.stop(); } catch (_) { /* уже остановлен */ } src.disconnect(); }, 400);
    });
  }
  // Звук включён ещё с прошлого раза: браузер даст его запустить только после первого жеста на странице
  function onGesture() {
    removeEventListener('pointerdown', onGesture, true);
    removeEventListener('keydown', onGesture, true);
    if (isOn()) { unlock(); ambStart(); }
  }
  document.addEventListener('visibilitychange', () => {
    if (!amb || !ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else if (isOn()) { ctx.resume().catch(() => {}); ambStart(); }
  });
  const isOn = () => get(KEY) === 'on';

  // Кнопка звука главной (data-sound-auto): иконка, aria-pressed, золотое кольцо до первого нажатия
  function bindButton(btn) {
    const iconUse = btn.querySelector('use');
    const render = () => {
      const on = isOn();
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? btn.dataset.offAria : btn.dataset.onAria);
      iconUse.setAttribute('href', on ? '#i-sound' : '#i-mute');
      btn.classList.toggle('is-fresh', get(KEY) === null);
    };
    btn.addEventListener('click', () => {
      const on = !isOn();
      set(KEY, on ? 'on' : 'off');
      if (on) { unlock(); ambStart(); } else ambStop();
      render();
    });
    addEventListener('pageshow', render); // вернулись «Назад» или меняли звук на другой странице
    render();
  }
  const autoBtn = document.querySelector('#sound-btn[data-sound-auto]');
  if (autoBtn) bindButton(autoBtn);

  return {
    isOn,
    // Фоновый звук главной: url — одна петля, { idle, drive } — мотор (см. выше). Играет, пока звук включён и вкладка видна
    setAmbient(spec) {
      if (!spec || amb) return;
      const engine = typeof spec === 'object';
      amb = { urls: engine ? [spec.idle, spec.drive] : [spec], mix: engine ? MIX.engine : MIX.loop, layers: null };
      if (isOn()) {
        if (ctx) ambStart();
        else { addEventListener('pointerdown', onGesture, true); addEventListener('keydown', onGesture, true); }
      }
    },
    touched: () => get(KEY) !== null, // пользователь уже нажимал кнопку звука
    setOn(on) { set(KEY, on ? 'on' : 'off'); if (on) unlock(); },
    unlock,
    // Заранее подготовить файл, чтобы play() звучал сразу: после жеста — декодируем, до жеста — только скачиваем в кэш
    async warm(url) {
      try { if (ctx) await load(url); else await fetch(url); } catch (_) { /* без звука */ }
    },
    // Проиграть файл; если файла нет или звук недоступен — молча ничего.
    // pan: −1 (лево) … 1 (право) — откуда звучит, например со стороны машины на экране.
    // Возвращает { fade(ms) } — плавно заглушить звук за ms (например, вместе с затемнением экрана)
    async play(url, { pan = 0 } = {}) {
      try {
        const buf = await load(url);
        if (!buf) return null;
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        src.buffer = buf;
        let out = src.connect(gain);
        if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; out = out.connect(p); }
        out.connect(ctx.destination);
        src.start();
        return {
          fade(ms) { // плавная S-кривая (косинус): без резкого начала и без обрыва в конце
            const t = ctx.currentTime, d = ms / 1000, v = gain.gain.value;
            const curve = Float32Array.from({ length: 64 }, (_, i) => v * (1 + Math.cos(Math.PI * i / 63)) / 2);
            gain.gain.cancelScheduledValues(t);
            gain.gain.setValueCurveAtTime(curve, t, d);
            src.stop(t + d + 0.05);
          },
        };
      } catch (_) { return null; /* без звука */ }
    },
  };
})();
