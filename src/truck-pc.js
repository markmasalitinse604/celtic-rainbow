// Тексты заказчика для блоков поверх ролика: только английский, только ПК, только фура (решение владельца;
// остальные языки, телефон и автобус — со старыми текстами из locales.js). Текст — как прислал заказчик.
// Включается в CSS по html[lang=en][data-vehicle=truck] + ПК (см. «Фура, ПК» в landing.css)
module.exports = {
  en: {
    // первый экран: заголовок переносится перед «a better future», под ним этот текст
    lead: 'We will train you to pass theory and CPC tests the very First Time! Next, the best driving instructors make you ready to successfully pass your road test!',
    // блоки 2–5 поверх ролика — только текст, без надзаголовка и заголовка
    cards: [
      'We will provide you with state of the art learning materials. We will book your theory and road tests and we will also book your driving lessons and medical exams. We will be guiding and assisting you until you obtain your full Category C & CE licence!',
      'We perfectly know that obtaining full driving licence Category C, CE & D can be quite expensive and therefore we prepared for you a loan with a very low interest rate! You can take out this loan for a year or even two years. A single month\'s salary as a truck driver will cover all the costs associated with obtaining the licence for these vehicles!',
      'When you have your licence category C, CE or D, our staff will make every effort to quickly find you a well-paid job. At the moment Ireland badly needs 3500 truck drivers and 1500 bus drivers.',
      'Having Irish driving licence category C, CE or D you can work as a driver all over the World. You can also exchange your Irish driving licence for one from any other European Union country.',
    ],
    endTitle: 'Your road starts with just one message',
  },
};
