// Пока посетитель выбирает машину, в фоне кладём в кэш главную: её HTML и первые кадры обоих роликов —
// после выбора главная откроется сразу с чёткой картинкой и плавным автостартом.
// Начинаем только после полной загрузки экрана выбора (и в свободное время браузера), чтобы не тормозить его.
// При экономии трафика (Save-Data) ничего не грузим.
(() => {
  const root = document.getElementById('choose');
  if (!root || !root.dataset.frames || (navigator.connection && navigator.connection.saveData)) return;
  const base = { truck: root.dataset.frames, bus: root.dataset.framesBus || root.dataset.frames };
  // тот же выбор набора кадров, что в ride.js (pickSet)
  const dir = () => (innerWidth / innerHeight < 0.9 ? 'port'
    : innerWidth * Math.min(devicePixelRatio || 1, 2) > 1500 ? 'hd' : 'land');
  const FIRST = 5; // как FIRST в ride.js: кадры автостарта
  const range = (from, to, step = 1) => { const a = []; for (let i = from; i < to; i += step) a.push(i); return a; };

  const queue = [], seen = new Set();
  let active = 0, started = false;
  function add(kind, idx, front) {
    const urls = idx.map((i) => `${base[kind]}/${dir()}/${String(i + 1).padStart(3, '0')}.webp`).filter((u) => !seen.has(u));
    urls.forEach((u) => seen.add(u));
    if (front) queue.unshift(...urls); else queue.push(...urls);
    pump();
  }
  function pump() {
    if (!started) return;
    while (active < 4 && queue.length) {
      const img = new Image();
      active++;
      img.onload = img.onerror = () => { active--; pump(); };
      img.src = queue.shift();
    }
  }
  function start() {
    started = true;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = root.dataset.next; // HTML главной
    document.head.appendChild(link);
    add('truck', range(0, FIRST)); add('bus', range(0, FIRST));
    add('truck', range(FIRST, 60, 4)); add('bus', range(FIRST, 60, 4));
  }
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 300));
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });

  // Выбрали машину: до перехода ~2 с — грузим в первую очередь её кадры (и чуть больше)
  root.addEventListener('click', (e) => {
    const side = e.target.closest('[data-side]')?.dataset.side;
    if (side !== 'truck' && side !== 'bus') return;
    started = true;
    add(side, range(0, 60, 2), true);
    add(side, range(0, FIRST), true);
  });
})();
