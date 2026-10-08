// Транспорт главной: ?vehicle=truck|bus (с экрана выбора) → localStorage 'vehicle' → 'both' («пока не знаю»).
// Статичный HTML собран в варианте «оба» (C, CE & D); здесь подставляем «C & CE» или D: тексты с {cat} (<span data-cat>),
// строка возраста, кнопка категории в шапке, сообщения WhatsApp (waCat), пометка «ролик автобуса скоро».
// Результат — window.SiteVehicle = { kind, V }: его читают plan.js и ride.js.
(() => {
  const CAT = { truck: 'C & CE', bus: 'D', both: 'C, CE & D' }; // грузовик — категории C & CE
  const fromUrl = new URLSearchParams(location.search).get('vehicle');
  let kind = fromUrl;
  if (!CAT[kind] || kind === 'both') {
    try { kind = localStorage.getItem('vehicle'); } catch (_) { kind = null; }
  } else {
    try { localStorage.setItem('vehicle', kind); } catch (_) { /* приватный режим */ }
  }
  if (kind !== 'truck' && kind !== 'bus') kind = 'both';
  const V = CAT[kind];
  window.SiteVehicle = { kind, V };
  document.documentElement.dataset.vehicle = kind;

  // Кнопка категории в шапке: ПК — «Грузовик · C & CE», телефон — «C & CE»; в варианте «оба» — «C, CE & D»
  const chip = document.getElementById('vehicle-chip');
  if (chip && kind !== 'both') {
    const name = chip.dataset[kind];
    chip.querySelector('.hud__chip-long').textContent = `${name} · ${V}`;
    chip.querySelector('.hud__chip-short').textContent = V;
    chip.setAttribute('aria-label', `${chip.dataset.label}: ${name} · ${V}`);
  }
  if (kind === 'both') return;

  document.querySelectorAll('[data-cat]').forEach((el) => { el.textContent = V; });
  const ageKey = kind === 'bus' ? 'D' : 'C'; // строки возраста: data-age="C" (C & CE) и "D"
  document.querySelectorAll('[data-age]').forEach((el) => { el.hidden = el.dataset.age !== ageKey; });

  // Сообщения WhatsApp: дописываем категорию (ссылку плана собирает plan.js)
  const data = JSON.parse(document.getElementById('site-data').textContent);
  const cat = data.waCat.split('{V}').join(V);
  document.querySelectorAll('a[data-track="whatsapp"]:not(#plan-link)').forEach((a) => {
    const text = new URL(a.href).searchParams.get('text') || '';
    a.href = `https://wa.me/${data.phone}?text=${encodeURIComponent(`${text} ${cat}`.trim())}`;
  });

  // Автобус, а кадров автобуса ещё нет — показываем фуру и пометку
  const ride = document.getElementById('ride');
  if (kind === 'bus' && ride && !ride.dataset.framesBus) document.getElementById('ride-note')?.removeAttribute('hidden');
  // Автобус с кадрами: фон финала — последний кадр автобуса (заглушку «дороги» меняет скрипт в шаблоне)
  if (kind === 'bus' && ride && ride.dataset.framesBus) {
    document.querySelectorAll('.final__bg source, .final__bg img').forEach((e) => {
      ['srcset', 'src'].forEach((a) => { const v = e.getAttribute(a); if (v) e.setAttribute(a, v.split('/assets/ride/').join('/assets/ride-bus/')); });
    });
  }
})();
