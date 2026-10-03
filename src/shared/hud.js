// Общий скрипт шапки (экран выбора и главная).
// 1) Список языков: запоминаем выбор (localStorage 'lang'), сохраняем строку запроса (?vehicle=…),
//    закрываем кликом мимо и клавишей Esc.
// 2) Аналитика: клик по любой ссылке с data-track="whatsapp" → fbq('trackCustom', 'WhatsAppClick'),
//    только если пиксель Facebook подключён (window.fbq). Сам пиксель не ставим — см. CLAUDE.md.
(() => {
  window.track = (name) => { if (typeof window.fbq === 'function') window.fbq('trackCustom', name); };
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[data-track="whatsapp"]')) window.track('WhatsAppClick');
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('.lang-menu__list a[data-lang]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    try { localStorage.setItem('lang', a.dataset.lang); } catch (_) { /* приватный режим — не страшно */ }
    if (location.search) {
      e.preventDefault();
      const url = new URL(a.href);
      url.search = location.search;
      location.assign(url);
    }
  });

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
