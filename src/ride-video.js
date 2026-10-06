// ПРОБНЫЙ видео-движок «дороги» (включается только адресом ?engine=video, только ПК и фура — см. ride.js).
// Вместо 60 картинок — один MP4 (H.264, все 24 кадра в секунду, опорный кадр каждые 12 кадров, без B-кадров).
// Всё — в фоновом потоке (Web Worker; этот же файл), включая РИСОВАНИЕ: странице холст отдаётся целиком
// (OffscreenCanvas), она только сообщает, какой кадр показать. Раньше готовые кадры передавались странице и рисовались
// в её основном потоке — при прокрутке видео основной поток был занят, и вся прокрутка сайта шла с задержкой.
// Файл качается потоком, кадры разжимает WebCodecs VideoDecoder (видеоблок устройства, если есть), в кэше — готовые
// картинки около текущего места (бюджет памяти). Быстрая ручная прокрутка — только опорные кадры, остановились — все.
// Разбор MP4 — свой, без библиотек: нужны только таблицы сэмплов и avcC (vp09 — для тестов в Chromium без H.264).

if (typeof window !== 'undefined') {
  // ================= Страница: обёртка над фоновым потоком =================
  window.RideVideo = (() => {
    const SELF = document.currentScript && document.currentScript.src;
    // opts: { url, canvas (свежий <canvas> без контекста — уходит фоновому потоку), size() → [ширина, высота] холста
    //         в точках, onInfo(info), onDrawn() — первый кадр на холсте, onFail(err) — откатиться на картинки }
    function start(opts) {
      return new Promise((resolve, reject) => {
        if (!('VideoDecoder' in window) || !('Worker' in window) || !SELF || !opts.canvas.transferControlToOffscreen) { reject(new Error('no WebCodecs/Worker/OffscreenCanvas')); return; }
        const w = new Worker(SELF);
        const off = opts.canvas.transferControlToOffscreen();
        const have = new Set(); // какие кадры готовы (сами картинки — в фоновом потоке)
        let info = null, dl = 0, failed = false, drawn = false;
        const fail = (e) => { if (failed) return; failed = true; w.terminate(); opts.onFail(e); };
        w.onerror = (e) => { e.preventDefault(); fail(new Error(e.message || 'worker error')); };
        w.onmessage = ({ data: m }) => {
          if (m.type === 'info') { info = m; opts.onInfo(m); resolve(api); }
          else if (m.type === 'cached') have.add(m.i);
          else if (m.type === 'evict') m.list.forEach((i) => have.delete(i));
          else if (m.type === 'dl') dl = m.n;
          else if (m.type === 'drawn') { if (!drawn) { drawn = true; opts.onDrawn(); } }
          else if (m.type === 'fail') { if (!info) reject(new Error(m.msg)); fail(new Error(m.msg)); }
        };
        let lastKey = '';
        const api = {
          // показать кадр (дробная позиция; рисуется ближайший готовый), куда едем и едем ли сами («Далее»)
          draw(pos, d, auto) {
            const key = `${pos.toFixed(2)}|${d > 0 ? 1 : -1}|${auto ? 1 : 0}`;
            if (key === lastKey) return;
            lastKey = key;
            w.postMessage({ type: 'draw', pos, dir: d > 0 ? 1 : -1, auto: !!auto });
          },
          // заранее готовить кадры от i в сторону d («Далее» перед переходом)
          need(i, d, auto) { w.postMessage({ type: 'need', i, dir: d > 0 ? 1 : -1, auto: !!auto }); },
          has: (i) => have.has(i),
          // «Далее»: кадры a..b скачаны, а первые из них уже готовы
          ready(a, b) {
            if (!info) return false;
            for (let i = a; i <= Math.min(b, a + 3); i++) if (!have.has(i)) return false;
            return dl > Math.min(b, info.count - 1);
          },
          resize() { const [cw, ch] = opts.size(); w.postMessage({ type: 'size', cw, ch }); },
        };
        const [cw, ch] = opts.size();
        w.postMessage({ type: 'start', url: new URL(opts.url, location.href).href, canvas: off, cw, ch }, [off]);
      });
    }
    return { start };
  })();
} else {
  // ================= Фоновый поток =================
  const BUDGET = 160 * 1024 * 1024; // байт на кэш готовых кадров (RGBA)
  const FPS = 24;

  // ---------- Разбор MP4 ----------
  function boxes(u8, start, end) { // [{type, body, end}]
    const dv = new DataView(u8.buffer, u8.byteOffset), out = [];
    let p = start;
    while (p + 8 <= end) {
      let size = dv.getUint32(p), head = 8;
      const type = String.fromCharCode(u8[p + 4], u8[p + 5], u8[p + 6], u8[p + 7]);
      if (size === 1) { size = Number(dv.getBigUint64(p + 8)); head = 16; } else if (size === 0) size = end - p;
      if (size < head) break;
      out.push({ type, body: p + head, end: p + size });
      p += size;
    }
    return out;
  }
  const child = (u8, box, type) => boxes(u8, box.body, box.end).find((b) => b.type === type);
  function parseMoov(u8, moov) {
    const dv = new DataView(u8.buffer, u8.byteOffset);
    for (const trak of boxes(u8, moov.body, moov.end).filter((b) => b.type === 'trak')) {
      const mdia = child(u8, trak, 'mdia'), hdlr = mdia && child(u8, mdia, 'hdlr');
      if (!hdlr || String.fromCharCode(...u8.subarray(hdlr.body + 8, hdlr.body + 12)) !== 'vide') continue;
      const stbl = child(u8, child(u8, mdia, 'minf'), 'stbl');
      const stsd = child(u8, stbl, 'stsd');
      const entry = boxes(u8, stsd.body + 8, stsd.end)[0]; // первая запись: avc1 (сайт) или vp09 (тесты)
      const width = dv.getUint16(entry.body + 24), height = dv.getUint16(entry.body + 26);
      const kids = boxes(u8, entry.body + 78, entry.end);
      const hex = (x) => x.toString(16).padStart(2, '0'), dec = (x) => String(x).padStart(2, '0');
      let codec, description;
      if (entry.type === 'vp09') {
        const c = kids.find((x) => x.type === 'vpcC').body + 4; // после version/flags: profile, level, bitDepth(4 бита)…
        codec = `vp09.${dec(u8[c])}.${dec(u8[c + 1])}.${dec(u8[c + 2] >> 4)}`;
      } else {
        const avcC = kids.find((x) => x.type === 'avcC');
        description = u8.slice(avcC.body, avcC.end);
        codec = `avc1.${hex(description[1])}${hex(description[2])}${hex(description[3])}`;
      }
      const stsz = child(u8, stbl, 'stsz'); // размеры сэмплов
      const fixed = dv.getUint32(stsz.body + 4), count = dv.getUint32(stsz.body + 8);
      const sizes = Array.from({ length: count }, (_, i) => fixed || dv.getUint32(stsz.body + 12 + i * 4));
      const stco = child(u8, stbl, 'stco'), co64 = child(u8, stbl, 'co64'); // смещения чанков
      const nch = dv.getUint32((stco || co64).body + 4);
      const chunks = Array.from({ length: nch }, (_, i) => (stco ? dv.getUint32(stco.body + 8 + i * 4) : Number(dv.getBigUint64(co64.body + 8 + i * 8))));
      const stsc = child(u8, stbl, 'stsc'), nsc = dv.getUint32(stsc.body + 4); // сэмплов в чанке
      const runs = Array.from({ length: nsc }, (_, i) => [dv.getUint32(stsc.body + 8 + i * 12), dv.getUint32(stsc.body + 12 + i * 12)]);
      const offsets = new Array(count);
      let s = 0;
      for (let c = 0; c < nch && s < count; c++) {
        let per = runs[0][1];
        for (const [first, n] of runs) if (c + 1 >= first) per = n;
        let off = chunks[c];
        for (let k = 0; k < per && s < count; k++) { offsets[s] = off; off += sizes[s]; s++; }
      }
      const stss = child(u8, stbl, 'stss'); // опорные кадры (без stss — все опорные)
      const keys = stss
        ? Array.from({ length: dv.getUint32(stss.body + 4) }, (_, i) => dv.getUint32(stss.body + 8 + i * 4) - 1)
        : Array.from({ length: count }, (_, i) => i);
      return { codec, description, width, height, count, sizes, offsets, keys };
    }
    throw new Error('no video track');
  }

  // ---------- Состояние ----------
  let buf = new Uint8Array(0), have = 0, info = null, decoder = null;
  let gops = [], gopOf = [], dlCount = 0;
  let cw = 1920, ch = 1080, focus = 0, dir = 1;
  let canvas = null, c2d = null, target = 0, drawnIdx = -1;
  const cache = new Map();    // кадр → готовая картинка (ImageBitmap размером под холст)
  const busy = new Set();     // ГОПы в очереди на разжатие
  let queue = Promise.resolve();
  const fail = (e) => postMessage({ type: 'fail', msg: String(e && e.message ? e.message : e) });

  const scale = () => Math.min(1, Math.max(cw / info.width, ch / info.height)); // кадр не крупнее нужного холсту
  const frameBytes = () => { const k = scale(); return Math.round(info.width * k) * Math.round(info.height * k) * 4; };
  const downloaded = (i) => i < dlCount;

  function setup() {
    info = parseMoov(buf, boxes(buf, 0, have).find((b) => b.type === 'moov'));
    gops = info.keys.map((k, g) => [k, (info.keys[g + 1] ?? info.count) - 1]);
    gopOf = new Array(info.count);
    gops.forEach(([a, b], g) => { for (let i = a; i <= b; i++) gopOf[i] = g; });
  }
  async function makeDecoder() {
    // видеоблок браузер выберет сам (требовать его нельзя: без него — отказ)
    const config = { codec: info.codec, ...(info.description ? { description: info.description } : {}), codedWidth: info.width, codedHeight: info.height, optimizeForLatency: true };
    const sup = await VideoDecoder.isConfigSupported(config).catch(() => ({ supported: false }));
    if (!sup.supported) throw new Error(`codec ${info.codec} not supported`);
    decoder = new VideoDecoder({
      output: (vf) => {
        const i = Math.round(vf.timestamp * FPS / 1e6);
        if (cache.has(i) || !inWindow(i)) { vf.close(); return; }
        const k = scale();
        const o = k < 1 ? { resizeWidth: Math.round(info.width * k), resizeHeight: Math.round(info.height * k), resizeQuality: 'medium' } : {};
        createImageBitmap(vf, o).then((bmp) => {
          vf.close();
          if (cache.has(i)) { bmp.close(); return; }
          cache.set(i, bmp);
          postMessage({ type: 'cached', i });
          trim();
          const t = Math.round(target); // новый кадр ближе к нужному, чем нарисованный, — перерисовать
          if (drawnIdx < 0 || Math.abs(i - t) < Math.abs(drawnIdx - t)) paint();
        }, () => vf.close());
      },
      error: fail,
    });
    decoder.configure(config);
    postMessage({ type: 'info', count: info.count, width: info.width, height: info.height });
  }

  // Окно кэша — в кадрах от текущего места: впереди по ходу движения две трети бюджета, позади треть
  // (во время «Далее» позади всего пара кадров — всё на путь впереди). Разжимаем ГОПы, которые задевают окно:
  // сначала тот, где посетитель, потом впереди по порядку, потом позади
  let win = new Set(), winFrames = new Set();
  const maxFrames = () => Math.max(24, Math.floor(BUDGET / frameBytes()));
  function computeWindow() {
    const M = maxFrames(), back = auto ? 2 : Math.floor(M / 3), ahead = M - back;
    const lo = Math.max(0, dir > 0 ? focus - back : focus - ahead), hi = Math.min(info.count - 1, dir > 0 ? focus + ahead : focus + back);
    winFrames = new Set();
    for (let i = lo; i <= hi; i++) winFrames.add(i);
    const g0 = gopOf[Math.min(info.count - 1, Math.max(0, focus))], gl = gopOf[lo], gh = gopOf[hi];
    const list = [g0];
    if (dir > 0) { for (let g = g0 + 1; g <= gh; g++) list.push(g); for (let g = g0 - 1; g >= gl; g--) list.push(g); }
    else { for (let g = g0 - 1; g >= gl; g--) list.push(g); for (let g = g0 + 1; g <= gh; g++) list.push(g); }
    win = new Set(list);
    return list;
  }
  const inWindow = (i) => winFrames.has(i);
  // Кэш переполнен — выгружаем самые дальние от текущего места кадры (а не всё вне окна сразу: при быстрой
  // прокрутке кэш иначе пустел раньше, чем готовились новые кадры, и сцена замирала)
  function trim() {
    const max = maxFrames();
    if (cache.size <= max) return;
    const cost = (i) => { const d = (i - focus) * dir; return d < 0 ? -d * 2 : d; }; // позади — в первую очередь
    const far = [...cache.keys()].filter((i) => i !== drawnIdx).sort((a, b) => cost(b) - cost(a)).slice(0, cache.size - max);
    far.forEach((i) => { cache.get(i).close(); cache.delete(i); });
    postMessage({ type: 'evict', list: far });
  }
  function decodeGop(g, keyOnly) {
    const tag = keyOnly ? -1 - g : g; // опорный кадр отдельно помечаем в busy
    busy.add(tag);
    queue = queue.then(async () => {
      if (!win.has(g)) return; // пока ждали очереди, посетитель уехал
      const [a, b0] = gops[g], b = keyOnly ? a : b0;
      let any = false;
      for (let i = a; i <= b; i++) {
        if (!downloaded(i)) break;
        decoder.decode(new EncodedVideoChunk({ type: i === a ? 'key' : 'delta', timestamp: Math.round(i * 1e6 / FPS), data: buf.subarray(info.offsets[i], info.offsets[i] + info.sizes[i]) }));
        any = true;
      }
      if (any) await decoder.flush().catch(() => {});
    }).catch(() => {}).finally(() => { busy.delete(tag); pump(); });
  }
  // Быстрая ручная прокрутка (быстрее FAST кадров/с; «Далее» не в счёт — его кадры готовятся заранее): разжимаем только опорные кадры — каждый сам по себе, мгновенно,
  // без очереди из целых ГОПов, которую потом пришлось бы бросать (сброс декодера на ПК дорогой — были рывки).
  // Прокрутка замедлилась или встала (SETTLE мс без движения) — разжимаем все кадры вокруг места
  const FAST = 30, SETTLE = 150;
  let speed = 0, settleTimer = 0, auto = false;
  const hist = []; // [время, кадр] за последние 250 мс — скорость по ним, а не по соседним сообщениям (те скачут)
  function onNeed(i, d, a) {
    auto = a;
    const now = performance.now();
    if (a) hist.length = 0; // «Далее» в замер ручной прокрутки не попадает
    hist.push([now, i]);
    while (hist.length > 1 && now - hist[0][0] > 250) hist.shift();
    const span = now - hist[0][0];
    speed = span > 60 ? Math.abs(i - hist[0][1]) * 1000 / span : 0; // кадров в секунду
    focus = i; dir = d;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { speed = 0; hist.length = 0; pump(); }, SETTLE);
    pump();
  }
  function pump() {
    if (!decoder || decoder.state !== 'configured') return;
    const list = computeWindow();
    if (!auto && speed > FAST) { // только опорные кадры, ближайшие к месту и впереди по ходу
      for (const g of list) {
        if (busy.size >= 2) break;
        const k = gops[g][0];
        if (!cache.has(k) && !busy.has(-1 - g) && downloaded(k)) decodeGop(g, true);
      }
      return;
    }
    for (const g of list) {
      if (busy.size >= 2) break; // не больше двух заданий в очереди: новое место посетителя важнее старых планов
      if (busy.has(g)) continue;
      const [a, b] = gops[g];
      let missing = false;
      for (let i = a; i <= b; i++) if (!cache.has(i) && downloaded(i)) { missing = true; break; }
      if (missing) decodeGop(g);
    }
  }

  async function run(url) {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const total = Number(res.headers.get('content-length')) || 0;
    buf = new Uint8Array(total || 8 << 20);
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (have + value.length > buf.length) { const nb = new Uint8Array(Math.max(buf.length * 2, have + value.length)); nb.set(buf.subarray(0, have)); buf = nb; }
      buf.set(value, have); have += value.length;
      if (!info) {
        const moov = boxes(buf, 0, have).find((b) => b.type === 'moov');
        if (moov && moov.end <= have) { setup(); await makeDecoder(); }
      }
      if (info) { // сэмплы лежат подряд по порядку кадров: считаем, сколько уже скачано целиком
        let n = dlCount;
        while (n < info.count && info.offsets[n] + info.sizes[n] <= have) n++;
        if (n !== dlCount) { dlCount = n; postMessage({ type: 'dl', n }); }
      }
      pump();
    }
    if (!info) throw new Error('moov not found');
  }

  // Рисуем нужный кадр (или ближайший готовый) как object-fit: cover
  function paint() {
    if (!c2d || !info || !cache.size) return;
    const t = Math.min(info.count - 1, Math.max(0, Math.round(target)));
    let j = t;
    if (!cache.has(t)) {
      j = -1;
      for (let d = 1; d < info.count && j < 0; d++) j = cache.has(t - d) ? t - d : cache.has(t + d) ? t + d : -1;
      if (j < 0) return;
    }
    if (j === drawnIdx) return;
    const bmp = cache.get(j), w = canvas.width, h = canvas.height;
    const k = Math.max(w / bmp.width, h / bmp.height), dw = bmp.width * k, dh = bmp.height * k;
    c2d.drawImage(bmp, (w - dw) / 2, (h - dh) / 2, dw, dh);
    drawnIdx = j;
    postMessage({ type: 'drawn', i: j });
  }
  function setSize(w, h) {
    cw = w; ch = h;
    if (canvas && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; drawnIdx = -1; paint(); }
  }

  onmessage = ({ data: m }) => {
    if (m.type === 'start') {
      canvas = m.canvas; c2d = canvas.getContext('2d', { alpha: false });
      setSize(m.cw, m.ch);
      run(m.url).catch(fail);
    } else if (m.type === 'draw') { target = m.pos; onNeed(Math.round(m.pos), m.dir, m.auto); paint(); }
    else if (m.type === 'need') onNeed(m.i, m.dir, m.auto);
    else if (m.type === 'size') setSize(m.cw, m.ch);
  };
}
