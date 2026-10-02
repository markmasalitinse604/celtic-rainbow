// Пришли со страницы выбора (/choose/ → ?vehicle=truck|bus): категория в плане и в сообщениях WhatsApp,
// для автобуса — пометка, что ролик пока с грузовиком
(() => {
  const vehicle = new URLSearchParams(location.search).get('vehicle');
  if (vehicle !== 'truck' && vehicle !== 'bus') return;
  const V = vehicle === 'bus' ? 'D' : 'C';
  const data = JSON.parse(document.getElementById('route-data').textContent);

  // «Ваш путь»: выбираем транспорт — route.js сам перестроит шаги и ссылку плана
  const form = document.getElementById('route-form');
  if (form) {
    form.elements.veh.value = V;
    form.dispatchEvent(new Event('change'));
  }

  // Остальные кнопки WhatsApp: дописываем категорию в текст
  const cat = data.waCat.split('{V}').join(V);
  document.querySelectorAll('a[href^="https://wa.me/"]:not(#plan-link)').forEach((a) => {
    const text = new URL(a.href).searchParams.get('text') || '';
    a.href = `https://wa.me/${data.phone}?text=${encodeURIComponent(`${text} ${cat}`.trim())}`;
  });

  if (vehicle === 'bus') document.getElementById('ride-note')?.removeAttribute('hidden');
})();
