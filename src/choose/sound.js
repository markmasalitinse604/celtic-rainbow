// Общее состояние звука: localStorage 'sound' = 'on' | 'off' (по умолчанию 'off').
// Главная потом может прочитать то же значение. Аудиоконтекст создаётся только по жесту пользователя
// (кнопка звука или выбор машины) — иначе браузер его заблокирует.
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

  return {
    isOn: () => get(KEY) === 'on',
    touched: () => get(KEY) !== null, // пользователь уже нажимал кнопку звука
    setOn(on) { set(KEY, on ? 'on' : 'off'); if (on) unlock(); },
    unlock,
    // Проиграть файл; если файла нет или звук недоступен — молча ничего
    async play(url) {
      try {
        const buf = await load(url);
        if (!buf) return;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
      } catch (_) { /* без звука */ }
    },
  };
})();
