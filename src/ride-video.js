// ПРОБНЫЙ видео-движок «дороги» (включается только адресом ?engine=video, только ПК и фура — см. ride.js).
// Вместо 60 картинок — один MP4 (H.264, все 24 кадра в секунду, опорный кадр каждые 12 кадров, без B-кадров).
// Вся работа — в фоновом потоке (Web Worker; этот же файл): файл качается потоком, нужные кадры разжимает
// WebCodecs VideoDecoder (видеоблок устройства, если есть), готовые картинки (ImageBitmap размером с холст)
// передаются странице без копирования. В основном потоке только рисование: перевод кадра в картинку там занимал
// ~24 мс на кадр и давал рывки. В кэше — кадры около текущего места (бюджет памяти), дальние выгружаются.
// Разбор MP4 — свой, без библиотек: нужны только таблицы сэмплов и avcC (vp09 — для тестов в Chromium без H.264).

if (typeof window !== 'undefined') {
  // ================= Страница: обёртка над фоновым потоком =================
  window.RideVideo = (() => {
    const SELF = document.currentScript && document.currentScript.src;
    // opts: { url, frames (массив ride.js: сюда кладём готовые кадры), size() → [ширина, высота] холста в точках,
    //         onFrame(i), onInfo(info), onFail(err) — откатиться на картинки }
    function start(opts) {
      return new Promise((resolve, reject) => {
        if (!('VideoDecoder' in window) || !('Worker' in window) || !SELF) { reject(new Error('no WebCodecs/Worker')); return; }
        const w = new Worker(SELF);
        const frames = opts.frames;
        let info = null, dl = 0, failed = false;
        const fail = (e) => { if (failed) return; failed = true; w.terminate(); opts.onFail(e); };
        w.onerror = (e) => { e.preventDefault(); fail(new Error(e.message || 'worker error')); };
        w.onmessage = ({ data: m }) => {
          if (m.type === 'info') { info = m; opts.onInfo(m); resolve(api); }
          else if (m.type === 'frame') { if (frames[m.i]) frames[m.i].close(); frames[m.i] = m.bmp; opts.onFrame(m.i); }
          else if (m.type === 'evict') m.list.forEach((i) => { if (frames[i]) { frames[i].close(); frames[i] = undefined; } });
          else if (m.type === 'dl') dl = m.n;
          else if (m.type === 'fail') { if (!info) reject(new Error(m.msg)); fail(new Error(m.msg)); }
        };
        let lastNeed = -1, lastDir = 0;
        const api = {
          need(i, d) { // какой кадр нужен и куда едем
            const dir = d ? (d > 0 ? 1 : -1) : lastDir || 1;
            if (i === lastNeed && dir === lastDir) return;
            lastNeed = i; lastDir = dir;
            w.postMessage({ type: 'need', i, dir });
          },
          // «Далее»: кадры a..b скачаны, а первые из них уже готовы
          ready(a, b) {
            if (!info) return false;
            for (let i = a; i <= Math.min(b, a + 3); i++) if (!frames[i]) return false;
            return dl > Math.min(b, info.count - 1);
          },
          resize() { const [cw, ch] = opts.size(); w.postMessage({ type: 'size', cw, ch }); },
        };
        const [cw, ch] = opts.size();
        w.postMessage({ type: 'start', url: new URL(opts.url, location.href).href, cw, ch });
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
  let buf = new Uint8Array(0), have = 0, info = null, decoder = null, config = null;
  let gops = [], gopOf = [], dlCount = 0;
  let cw = 1920, ch = 1080, focus = 0, dir = 1;
  const sent = new Set();     // кадры, отданные странице (лежат у неё в кэше)
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
    config = { codec: info.codec, ...(info.description ? { description: info.description } : {}), codedWidth: info.width, codedHeight: info.height, optimizeForLatency: true };
    const sup = await VideoDecoder.isConfigSupported(config).catch(() => ({ supported: false }));
    if (!sup.supported) throw new Error(`codec ${info.codec} not supported`);
    decoder = new VideoDecoder({
      output: (vf) => {
        const i = Math.round(vf.timestamp * FPS / 1e6);
        if (sent.has(i) || !inWindow(i)) { vf.close(); return; }
        const k = scale();
        const o = k < 1 ? { resizeWidth: Math.round(info.width * k), resizeHeight: Math.round(info.height * k), resizeQuality: 'medium' } : {};
        createImageBitmap(vf, o).then((bmp) => {
          vf.close();
          if (sent.has(i)) { bmp.close(); return; }
          sent.add(i);
          postMessage({ type: 'frame', i, bmp }, [bmp]);
          trim();
        }, () => vf.close());
      },
      error: fail,
    });
    decoder.configure(config);
    postMessage({ type: 'info', count: info.count, width: info.width, height: info.height });
  }

  // Окно кэша: ГОПы вокруг текущего места, впереди вдвое больше, чем позади; сколько влезет в бюджет
  let win = new Set(), winFrames = new Set();
  function computeWindow() {
    const maxFrames = Math.max(24, Math.floor(BUDGET / frameBytes()));
    const g0 = gopOf[Math.min(info.count - 1, Math.max(0, focus))];
    const order = [g0];
    for (let d = 1; d <= gops.length; d++) {
      order.push(g0 + d * dir);
      if (d % 2 === 1) order.push(g0 - ((d + 1) / 2) * dir);
    }
    const list = [];
    let n = 0;
    for (const g of order) {
      if (g < 0 || g >= gops.length) continue;
      const len = gops[g][1] - gops[g][0] + 1;
      if (n + len > maxFrames) break;
      list.push(g); n += len;
    }
    win = new Set(list);
    winFrames = new Set();
    list.forEach((g) => { for (let i = gops[g][0]; i <= gops[g][1]; i++) winFrames.add(i); });
    return list;
  }
  const inWindow = (i) => winFrames.has(i);
  // Кэш переполнен — выгружаем самые дальние от текущего места кадры (а не всё вне окна сразу: при быстрой
  // прокрутке кэш иначе пустел раньше, чем готовились новые кадры, и сцена замирала)
  function trim() {
    const max = Math.max(24, Math.floor(BUDGET / frameBytes()));
    if (sent.size <= max) return;
    const far = [...sent].sort((a, b) => Math.abs(b - focus) - Math.abs(a - focus)).slice(0, sent.size - max);
    far.forEach((i) => sent.delete(i));
    postMessage({ type: 'evict', list: far });
  }
  let epoch = 0; // растёт при сбросе декодера: старые задания очереди ничего не делают
  function decodeGop(g, keyOnly) {
    const tag = keyOnly ? -1 - g : g; // опорный кадр отдельно помечаем в busy
    busy.add(tag);
    const my = epoch;
    queue = queue.then(async () => {
      if (my !== epoch) return;
      if (!win.has(g)) return; // пока ждали очереди, посетитель уехал
      const [a, b0] = gops[g], b = keyOnly ? a : b0;
      let any = false;
      for (let i = a; i <= b; i++) {
        if (!downloaded(i)) break;
        decoder.decode(new EncodedVideoChunk({ type: i === a ? 'key' : 'delta', timestamp: Math.round(i * 1e6 / FPS), data: buf.subarray(info.offsets[i], info.offsets[i] + info.sizes[i]) }));
        any = true;
      }
      if (any) await decoder.flush().catch(() => {});
    }).catch(() => {}).finally(() => { if (my === epoch) { busy.delete(tag); pump(); } });
  }
  // Посетитель резко прыгнул (быстрая прокрутка, точки): бросаем разжатие ГОПов, которые уже не нужны рядом
  let lastReset = 0;
  function jump() {
    if (!decoder || !busy.size || performance.now() - lastReset < 300) return; // не чаще раза в 0,3 с — иначе при
    const g0 = gopOf[Math.min(info.count - 1, Math.max(0, focus))];         // быстрой прокрутке ничего не успеет
    for (const t of busy) { const g = t < 0 ? -1 - t : t; if (Math.abs(g - g0) <= 1) return; } // рядом уже в работе
    lastReset = performance.now();
    epoch++;
    busy.clear();
    queue = Promise.resolve();
    try { decoder.reset(); decoder.configure(config); } catch (e) { fail(e); }
  }
  function pump() {
    if (!decoder || decoder.state !== 'configured') return;
    const list = computeWindow();
    // нужного кадра нет, а его ГОП ещё не в работе — сперва один опорный кадр этого места (быстро), потом весь ГОП
    const g0 = list[0];
    let near = false; // готовый кадр в пределах 6 от нужного — это не прыжок, срочный опорный кадр не нужен
    for (let d = 0; d <= 6 && !near; d++) near = sent.has(focus - d) || sent.has(focus + d);
    if (!near && !sent.has(gops[g0][0]) && !busy.has(g0) && !busy.has(-1 - g0) && downloaded(gops[g0][0])) decodeGop(g0, true);
    for (const g of list) {
      if (busy.size >= 2) break; // не больше двух ГОПов в очереди: новое место посетителя важнее старых планов
      if (busy.has(g)) continue;
      const [a, b] = gops[g];
      let missing = false;
      for (let i = a; i <= b; i++) if (!sent.has(i) && downloaded(i)) { missing = true; break; }
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

  onmessage = ({ data: m }) => {
    if (m.type === 'start') { cw = m.cw; ch = m.ch; run(m.url).catch(fail); }
    else if (m.type === 'need') { focus = m.i; dir = m.dir; jump(); pump(); }
    else if (m.type === 'size') { cw = m.cw; ch = m.ch; }
  };
}
