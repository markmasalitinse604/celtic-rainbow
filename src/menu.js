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

  // Смена языка (список на ПК и плитки в панели): запоминаем язык (localStorage 'lang') и сохраняем строку запроса
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.lang-menu__list a[hreflang], .lang-grid a[hreflang]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const lang = a.dataset.lang || a.getAttribute('hreflang').slice(0, 2).toLowerCase();
    try { localStorage.setItem('lang', lang); } catch (_) { /* приватный режим — не страшно */ }
    if (location.search) {
      e.preventDefault();
      const url = new URL(a.href);
      url.search = location.search;
      location.assign(url);
    }
  });

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
