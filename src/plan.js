// «Соберите свой план»: права (ЕС / не ЕС / нет) → шаги к категории и ссылка WhatsApp с готовым текстом.
// Категория — из выбора транспорта (window.SiteVehicle, vehicle.js): «C, CE», D или «C, CE / D»
(() => {
  const data = JSON.parse(document.getElementById('site-data').textContent);
  const form = document.getElementById('plan-form');
  const list = document.getElementById('plan-steps');
  const link = document.getElementById('plan-link');
  const V = (window.SiteVehicle && window.SiteVehicle.V) || 'C, CE / D';
  const sub = (s) => s.split('{V}').join(V);

  function render() {
    const lic = form.elements.lic.value; // eu | nonEu | none
    list.replaceChildren(...data.steps[lic].map(([title, text]) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      const p = document.createElement('p');
      strong.textContent = sub(title);
      p.textContent = sub(text);
      li.append(strong, p);
      return li;
    }));
    const msg = sub(data.waPlan.split('{L}').join(data.lic[lic]));
    link.href = `https://wa.me/${data.phone}?text=${encodeURIComponent(msg)}`;
  }

  form.addEventListener('change', render);
  form.addEventListener('submit', (e) => e.preventDefault());
  render(); // браузер мог восстановить выбор после «Назад»
})();
