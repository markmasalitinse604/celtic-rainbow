// Тексты заказчика для блоков поверх ролика: только английский и только ПК (решение владельца), отдельно для фуры
// и для автобуса; телефон, другие языки и вариант «оба» — со старыми текстами из locales.js. Текст — как прислал
// заказчик. Включается в CSS по html[lang=en][data-vehicle=truck|bus] + ПК (см. «Тексты заказчика» в landing.css)
const LOAN = (cat, driver) => `We perfectly know that obtaining full driving licence Category ${cat} can be quite expensive and therefore we prepared for you a loan with a very low interest rate! You can take out this loan for a year or even two years. A single month's salary as a ${driver} driver will cover all the costs associated with obtaining the licence for these vehicles!`;

module.exports = {
  en: {
    truck: {
      // первый экран: заголовок переносится перед «a better future», под ним этот текст
      lead: 'We will train you to pass theory and CPC tests the very First Time! Next, the best driving instructors make you ready to successfully pass your road test!',
      // блоки 2–5 поверх ролика: [заголовок (пусто — только текст), текст]
      cards: [
        ['Non-stop assistance', 'We will provide you with state of the art learning materials. We will book your theory and road tests and we will also book your driving lessons and medical exams. We will be guiding and assisting you until you obtain your full Category C & CE licence!'],
        ['Financial help', LOAN('C, CE & D', 'truck')],
        ['Finding a job assistance', 'When you have your licence category C, CE or D, our staff will make every effort to quickly find you a well-paid job. At the moment Ireland badly needs 3500 truck drivers and 1500 bus drivers.'],
        ['Irish driving licence is world recognizable', 'Having Irish driving licence category C, CE or D you can work as a driver all over the World. You can also exchange your Irish driving licence for one from any other European Union country.'],
      ],
    },
    bus: {
      lead: 'We will train you to pass theory and CPC tests the very First Time! Next, the best driving instructors make you ready to successfully pass your BUS road test!',
      cards: [
        ['Non-stop assistance', 'We will provide you with state of the art learning materials. We will book your theory and road tests and we will also book your driving lessons and medical exams. We will be guiding and assisting you until you obtain your full Category D licence!'],
        ['Financial help', LOAN('D', 'bus')],
        ['Finding a job assistance', 'When you have your licence category D, our staff will make every effort to quickly find you a well-paid job. At the moment Ireland badly needs 3500 truck drivers and 1500 bus drivers.'],
        ['Irish driving licence is world recognizable', 'Having Irish driving licence category D you can work as a driver all over the World. You can also exchange your Irish driving licence for one from any other European Union country.'],
      ],
    },
    endTitle: 'Your road starts with just one message',
  },
};
