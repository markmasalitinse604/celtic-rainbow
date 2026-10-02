// Галерея: по клику открывает фото на весь экран; Esc, крестик или клик — закрыть
(() => {
  const dialog = document.getElementById('lightbox');
  if (!dialog || !dialog.showModal) return;
  const big = dialog.querySelector('img');

  document.querySelectorAll('.gallery__item[data-full]').forEach((item) => {
    item.addEventListener('click', () => {
      big.src = item.dataset.full;
      big.alt = item.querySelector('img').alt;
      dialog.showModal();
    });
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target === big) dialog.close();
  });
})();
