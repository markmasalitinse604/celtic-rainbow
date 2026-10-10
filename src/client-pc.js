// Тексты заказчика для блоков поверх ролика (ПК и телефон, решение владельца), отдельно для фуры и для автобуса.
// Английский — как прислал заказчик; ru, pl, pt, es — наш перевод по просьбе владельца. Вариант «оба» —
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

// Польский — нейтральный императив и «Ty / Twój» (как весь польский сайт), без «Pan/Pani»
const pl = (() => {
  const H = ['Wsparcie na każdym etapie', 'Pomoc finansowa', 'Pomoc w znalezieniu pracy', 'Irlandzkie prawo jazdy uznawane na całym świecie'];
  const loan = (cat, driver) => `Doskonale wiemy, że zdobycie pełnego prawa jazdy kategorii ${cat} może być dość kosztowne, dlatego przygotowaliśmy dla Ciebie pożyczkę z bardzo niskim oprocentowaniem! Możesz ją wziąć na rok, a nawet na dwa lata. Jedna miesięczna pensja ${driver} pokryje wszystkie koszty zdobycia prawa jazdy na te pojazdy!`;
  const assist = (cat) => `Zapewnimy Ci nowoczesne materiały do nauki. Zapiszemy Cię na egzaminy teoretyczne i praktyczne, a także na lekcje jazdy i badania lekarskie. Będziemy Cię prowadzić i wspierać, aż zdobędziesz pełne prawo jazdy kategorii ${cat}!`;
  const job = (cat) => `Gdy będziesz mieć prawo jazdy kategorii ${cat}, nasz zespół zrobi wszystko, aby szybko znaleźć Ci dobrze płatną pracę. Obecnie w Irlandii brakuje 3500 kierowców ciężarówek i 1500 kierowców autobusów.`;
  const world = (cat) => `Z irlandzkim prawem jazdy kategorii ${cat} możesz pracować jako kierowca na całym świecie. Irlandzkie prawo jazdy możesz też wymienić na prawo jazdy dowolnego innego kraju Unii Europejskiej.`;
  const lead = (bus) => `Przygotujemy Cię do zdania egzaminu teoretycznego i CPC za pierwszym razem! Następnie najlepsi instruktorzy przygotują Cię do zdania egzaminu praktycznego${bus ? ' na autobus' : ''}!`;
  return {
    titleBreak: 'Twoja droga',
    truck: { lead: lead(false), cards: [[H[0], assist(CE)], [H[1], loan(CED, 'kierowcy ciężarówki')], [H[2], job('C, CE lub D')], [H[3], world('C, CE lub D')]] },
    bus: { lead: lead(true), cards: [[H[0], assist('D')], [H[1], loan('D', 'kierowcy autobusu')], [H[2], job('D')], [H[3], world('D')]] },
    endTitle: 'Twoja droga zaczyna się od zaledwie jednej wiadomości',
  };
})();

// Португальский (Бразилия) — «você»
const pt = (() => {
  const H = ['Apoio em cada etapa', 'Ajuda financeira', 'Ajuda para encontrar trabalho', 'A carteira irlandesa é reconhecida no mundo todo'];
  const loan = (cat, driver) => `Sabemos muito bem que tirar a carteira completa da categoria ${cat} pode sair caro, por isso preparamos para você um empréstimo com juros muito baixos! Você pode fazer esse empréstimo por um ano ou até por dois. Um único salário mensal de ${driver} cobre todos os custos para tirar a carteira desses veículos!`;
  const assist = (cat) => `Vamos oferecer a você materiais de estudo modernos. Vamos agendar suas provas teórica e prática e também suas aulas de direção e exames médicos. Vamos orientar e apoiar você até você conseguir a carteira completa da categoria ${cat}!`;
  const job = (cat) => `Quando você tiver a carteira da categoria ${cat}, nossa equipe vai fazer de tudo para encontrar rapidamente um trabalho bem pago para você. Hoje a Irlanda precisa muito de 3500 motoristas de caminhão e 1500 motoristas de ônibus.`;
  const world = (cat) => `Com a carteira irlandesa da categoria ${cat}, você pode trabalhar como motorista no mundo todo. Você também pode trocar a carteira irlandesa pela de qualquer outro país da União Europeia.`;
  const lead = (bus) => `Vamos preparar você para passar nas provas de teoria e CPC de primeira! Depois, os melhores instrutores vão deixar você pronto para passar na prova prática${bus ? ' de ônibus' : ''}!`;
  return {
    titleBreak: 'Seu caminho',
    truck: { lead: lead(false), cards: [[H[0], assist(CE)], [H[1], loan(CED, 'motorista de caminhão')], [H[2], job('C, CE ou D')], [H[3], world('C, CE ou D')]] },
    bus: { lead: lead(true), cards: [[H[0], assist('D')], [H[1], loan('D', 'motorista de ônibus')], [H[2], job('D')], [H[3], world('D')]] },
    endTitle: 'Seu caminho começa com apenas uma mensagem',
  };
})();

// Испанский — «tú»
const es = (() => {
  const H = ['Apoyo en cada paso', 'Ayuda financiera', 'Ayuda para encontrar trabajo', 'El carné irlandés se reconoce en todo el mundo'];
  const loan = (cat, driver) => `Sabemos muy bien que sacarse el carné completo de la categoría ${cat} puede salir caro, ¡por eso hemos preparado para ti un préstamo con un interés muy bajo! Puedes pedirlo para un año o incluso para dos. ¡Un solo sueldo mensual de ${driver} cubre todos los gastos para sacarte el carné de estos vehículos!`;
  const assist = (cat) => `Te daremos materiales de estudio modernos. Reservaremos tus exámenes teórico y práctico, y también tus clases de conducir y los reconocimientos médicos. ¡Te guiaremos y apoyaremos hasta que consigas tu carné completo de la categoría ${cat}!`;
  const job = (cat) => `Cuando tengas el carné de la categoría ${cat}, nuestro equipo hará todo lo posible para encontrarte rápido un trabajo bien pagado. Ahora mismo Irlanda necesita con urgencia 3500 camioneros y 1500 conductores de autobús.`;
  const world = (cat) => `Con el carné irlandés de la categoría ${cat} puedes trabajar como conductor en todo el mundo. También puedes canjear tu carné irlandés por el de cualquier otro país de la Unión Europea.`;
  const lead = (bus) => `¡Te preparamos para aprobar los exámenes de teoría y CPC a la primera! ¡Después, los mejores instructores te dejarán listo para aprobar el examen práctico${bus ? ' de autobús' : ''}!`;
  return {
    titleBreak: 'Tu camino',
    truck: { lead: lead(false), cards: [[H[0], assist(CE)], [H[1], loan(CED, 'camionero')], [H[2], job('C, CE o D')], [H[3], world('C, CE o D')]] },
    bus: { lead: lead(true), cards: [[H[0], assist('D')], [H[1], loan('D', 'conductor de autobús')], [H[2], job('D')], [H[3], world('D')]] },
    endTitle: 'Tu camino empieza con solo un mensaje',
  };
})();

module.exports = { en, ru, pl, pt, es };
