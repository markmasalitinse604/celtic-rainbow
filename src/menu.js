// Меню на телефоне (боковая панель) и список языков на десктопе
(() => {
  const drawer = document.getElementById('drawer');
  const burger = document.querySelector('.burger');

  if (drawer && drawer.showModal && burger) {
    const close = () => drawer.close();
    burger.addEventListener('click', () => {
      drawer.showModal();
      burger.setAttribute('aria-expanded', 'true');
    });
    drawer.addEventListener('close', () => burger.setAttribute('aria-expanded', 'false'));
    drawer.querySelector('.drawer__close').addEventListener('click', close);
    drawer.addEventListener('click', (e) => {
      const r = drawer.getBoundingClientRect();
      const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (outside) return close(); // клик по затемнению
      const link = e.target.closest('a');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (hash.startsWith('#')) {
        // пункт меню: закрыть панель и только потом прокрутить к разделу
        e.preventDefault();
        close();
        document.querySelector(hash)?.scrollIntoView();
        history.replaceState(null, '', hash);
      } else {
        close();
      }
    });
  }

  // Список языков: закрывается кликом мимо и клавишей Esc
  const menus = document.querySelectorAll('details.lang-menu');
  document.addEventListener('click', (e) => {
    menus.forEach((d) => { if (d.open && !d.contains(e.target)) d.open = false; });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    menus.forEach((d) => {
      if (d.open) { d.open = false; d.querySelector('summary').focus(); }
    });
  });
})();
