// «Твой путь»: перерисовывает шаги плана и ссылку на WhatsApp
(() => {
  const data = JSON.parse(document.getElementById('route-data').textContent);
  const form = document.getElementById('route-form');
  const list = document.getElementById('steps');
  const age = document.getElementById('age');
  const link = document.getElementById('plan-link');

  function render() {
    const lic = form.elements.lic.value;   // eu | nonEu | none
    const V = form.elements.veh.value;     // C | D
    const sub = (s) => s.split('{V}').join(V);

    list.replaceChildren(...data.steps[lic].map(([title, text]) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      const p = document.createElement('p');
      strong.textContent = sub(title);
      p.textContent = sub(text);
      li.append(strong, p);
      return li;
    }));

    age.textContent = V === 'D' ? data.ageD : data.ageC;
    const msg = data.waPlan.split('{L}').join(data.lic[lic]).split('{V}').join(V);
    link.href = `https://wa.me/${data.phone}?text=${encodeURIComponent(msg)}`;
  }

  form.addEventListener('change', render);
  form.addEventListener('submit', (e) => e.preventDefault());
  render(); // браузер мог восстановить выбор после «Назад»
})();
