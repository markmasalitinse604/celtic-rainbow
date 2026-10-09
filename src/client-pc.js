// Тексты заказчика для блоков поверх ролика (ПК и телефон, решение владельца), отдельно для фуры и для автобуса.
// Английский — как прислал заказчик; русский — перевод по просьбе владельца. Другие языки и вариант «оба» —
// со старыми текстами из locales.js. Включается в CSS по html[data-tpc][data-vehicle=truck|bus]
// (см. «Тексты заказчика» в landing.css). titleBreak — начало заголовка первого экрана, после него перенос строки
const NB = ' ';
const CE = `C${NB}&${NB}CE`, CED = `C,${NB}CE${NB}&${NB}D`;

const en = (() => {
  const H = ['Non-stop assistance', 'Financial help', 'Finding a job assistance', 'Irish driving licence is world recognizable'];
  const loan = (cat, driver) => `We perfectly know that obtaining full driving licence Category ${cat} can be quite expensive and therefore we prepared for you a loan with a very low interest rate! You can take out this loan for a year or even two years. A single month's salary as a ${driver} driver will cover all the costs associated with obtaining the licence for these vehicles!`;
  const assist = (cat) => `We will provide you with state of the art learning materials. We will book your theory and road tests and we will also book your driving lessons and medical exams. We will be guiding and assisting you until you obtain your full Category ${cat} licence!`;
  const job = (cat) => `When you have your licence category ${cat}, our staff will make every effort to quickly find you a well-paid job. At the moment Ireland badly needs 3500 truck drivers and 1500 bus drivers.`;
  const world = (cat) => `Having Irish driving licence category ${cat} you can work as a driver all over the World. You can also exchange your Irish driving licence for one from any other European Union country.`;
  const lead = (bus) => `We will train you to pass theory and CPC tests the very First Time! Next, the best driving instructors make you ready to successfully pass your ${bus ? 'BUS ' : ''}road test!`;
  return {
    titleBreak: 'Your road to',
    // блоки 2–5 поверх ролика: [заголовок (пусто — только текст), текст]
    truck: { lead: lead(false), cards: [[H[0], assist(CE)], [H[1], loan(CED, 'truck')], [H[2], job('C, CE or D')], [H[3], world('C, CE or D')]] },
    bus: { lead: lead(true), cards: [[H[0], assist('D')], [H[1], loan('D', 'bus')], [H[2], job('D')], [H[3], world('D')]] },
    endTitle: 'Your road starts with just one message',
  };
})();

const ru = (() => {
  const H = ['Поддержка на каждом шаге', 'Финансовая помощь', 'Помощь в поиске работы', 'Ирландские права признают во всём мире'];
  const loan = (cat, driver) => `Мы прекрасно понимаем, что получить полные права категории ${cat} недёшево, поэтому подготовили для вас кредит с очень низкой ставкой! Его можно взять на год или даже на два. Зарплата ${driver} всего за один месяц покроет все расходы на получение прав на эти машины!`;
  const assist = (cat) => `Мы дадим вам современные учебные материалы. Мы запишем вас на экзамены по теории и вождению, а также на уроки вождения и медкомиссию. Мы будем сопровождать и поддерживать вас, пока вы не получите полные права категории ${cat}!`;
  const job = (cat) => `Когда у вас будут права категории ${cat}, наши сотрудники сделают всё, чтобы быстро найти вам хорошо оплачиваемую работу. Сейчас Ирландии очень не хватает 3500 водителей грузовиков и 1500 водителей автобусов.`;
  const world = (cat) => `С ирландскими правами категории ${cat} вы можете работать водителем по всему миру. Ирландские права также можно обменять на права любой другой страны Европейского союза.`;
  const lead = (bus) => `Мы подготовим вас к сдаче теории и CPC с первого раза! А затем лучшие инструкторы подготовят вас к успешной сдаче экзамена по вождению${bus ? ' автобуса' : ''}!`;
  return {
    titleBreak: 'Ваша дорога',
    truck: { lead: lead(false), cards: [[H[0], assist(CE)], [H[1], loan(CED, 'водителя грузовика')], [H[2], job('C, CE или D')], [H[3], world('C, CE или D')]] },
    bus: { lead: lead(true), cards: [[H[0], assist('D')], [H[1], loan('D', 'водителя автобуса')], [H[2], job('D')], [H[3], world('D')]] },
    endTitle: 'Ваша дорога начинается всего с одного сообщения',
  };
})();

module.exports = { en, ru };
