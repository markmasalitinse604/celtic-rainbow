// ─────────────────────────────────────────────────────────────
//  СЛОВАРЬ: все тексты сайта на 4 языках (pl, pt, ru, en)
//
//  Каждый язык — отдельный блок ниже, ключи во всех блоках одинаковые.
//  Твоё наполнение — в полях с [квадратными скобками], в каждом языке:
//    name   — имя и фамилия
//    about  — пара предложений о себе (блок «Ваш преподаватель»)
//    photo  — подпись заглушки; не видна, если есть src/assets/teacher.jpg
//  Телефон, Facebook и домен — в build.js (PHONE, PHONE_DISPLAY, FACEBOOK_URL, SITE_URL).
//
//  Меняешь текст — меняй во всех пяти языках, потом npm run build.
// ─────────────────────────────────────────────────────────────

module.exports = {
  pl: {
    langName: "Polski",
    wa: "Napisz na WhatsApp",
    waHello: "Dzień dobry! Chcę zapytać o kurs teorii na kategorie C, CE & D.",
    waPlan: "Dzień dobry! Moje prawo jazdy: {L}. Chcę zdobyć kategorię {V}. Chcę zapisać się na kurs teorii.",
    waCat: "Interesuje mnie kategoria {V}.",
    chooseTitle: "Wybierz kategorię",
    chooseHint: "Testy z teorii i CPC, kategoria C & D",
    chooseTruck: "Ciężarówka",
    chooseCatC: "kategoria C & CE",
    chooseBus: "Autobus",
    chooseCatD: "kategoria D",
    soundLabel: "Dźwięk",
    soundTip: "Włącz dźwięk",
    soundOnAria: "Włącz dźwięk",
    soundOffAria: "Wyłącz dźwięk",
    busSoon: "Film z autobusem już wkrótce — na razie pokazujemy ciężarówkę.",
    jTitle: "Twoja droga do lepszej przyszłości",
    jLead: "Teoria na kategorię {cat} w Irlandii, w Twoim języku: krok po kroku, od pierwszego pytania do karty CPC.",
    jCtaPlan: "Ułóż swój plan",
    jNext: "Dalej",
    jWhyLabel: "Zawód",
    jW1Title: "Miejsce pracy z widokiem",
    jW1Text: "Góry, jeziora i nadmorskie drogi zamiast czterech ścian biura.",
    jW2Title: "Pracodawcy szukają kierowców",
    jW2Text: "Irlandzkie firmy transportowe regularnie zgłaszają trudności ze znalezieniem wystarczającej liczby kierowców ciężarówek i autobusów.",
    jW3Title: "Możliwość rozwoju",
    jW3Text: "Zacznij od jednej kategorii i dodaj kolejne później, na przykład przyczepę lub drugi rodzaj pojazdu.",
    jFinalLabel: "Twoja droga",
    jFinalTitle: "Twoja droga zaczyna się tutaj",
    jFinalText: "Powiedz, jakie masz prawo jazdy, a pokażę plan ułożony właśnie dla Ciebie.",
    jPlanTitle: "Ułóż swój plan",
    jPlanLead: "Wybierz swoje prawo jazdy i zobacz kroki do kategorii {cat}.",
    jTeacherLabel: "Twój nauczyciel",
    jT1Title: "W Twoim języku",
    jT1Text: "Po polsku, portugalsku, rosyjsku, hiszpańsku lub angielsku. Egzamin jest po angielsku, dlatego razem rozkładamy każdy termin.",
    jT2Title: "Bezpośrednio z nauczycielem",
    jT2Text: "Piszesz do mnie na WhatsApp i odpowiadam osobiście.",
    jDoubtsTitle: "Szczere odpowiedzi na częste wątpliwości",
    faq: [
      [
        "Czy mój angielski wystarczy?",
        "Pytania na ekranie są po angielsku, ale sformułowania się powtarzają. Uczymy się terminów i typowych zwrotów, aż staną się znajome. Dla niektórych egzaminów dostępny jest lektor w innych językach, a Twój sprawdzamy przy rezerwacji."
      ],
      [
        "Minęło wiele lat od nauki. Czy dam radę?",
        "Zajęcia są krótkie i prowadzą krok po kroku: zawsze wiesz, czego uczyć się dziś i co będzie dalej."
      ],
      [
        "Czy muszę wymieniać prawo jazdy z UE?",
        "Nie. Z ważnym prawem jazdy z UE możesz od razu złożyć wniosek o learner permit C lub D."
      ],
      [
        "Od ilu lat mogę zacząć?",
        "Kategorie C & CE od 18 lat, D od 21, jeśli robisz CPC. Bez CPC: od 21 i 24 lat."
      ],
      [
        "Czy potrzebuję badań lekarskich?",
        "Tak. Do learner permit C, CE & D potrzebny jest raport medyczny od lekarza, nie starszy niż 3 miesiące."
      ]
    ],
    jEndTitle: "Twoja droga zaczyna się od jednej wiadomości",
    jEndText: "Napisz, jakie masz prawo jazdy i czym chcesz jeździć.",
    jMetaTitle: "Twoja droga do zawodu kierowcy w Irlandii | Celtic Rainbow International Driving School",
    jMetaDesc: "Teoria na prawo jazdy na ciężarówkę (C & CE) i autobus (D) w Irlandii po polsku, portugalsku, rosyjsku, hiszpańsku lub angielsku: od egzaminu teoretycznego do karty CPC. Napisz do nauczyciela na WhatsApp.",
    jStillAlt: "Biały pojazd na górskiej drodze w Irlandii o zachodzie słońca",
    changeVehicle: "Zmień pojazd",
    photo: "[Zdjęcie]",
    name: "[Imię i nazwisko]",
    qLic: "Moje prawo jazdy",
    lic: {
      eu: "Z UE (kat. B)",
      nonEu: "Spoza UE",
      none: "Nie mam prawa jazdy"
    },
    ageC: "Kategoria C & CE: od 18 lat z CPC, bez CPC od 21.",
    ageD: "Kategoria D: od 21 lat z CPC, bez CPC od 24.",
    planTitle: "Twój plan",
    planCta: "Wyślij ten plan na WhatsApp",
    stepsEu: [
      [
        "Teoria kat. {V}",
        "W centrum egzaminacyjnym. Pytania są po angielsku, lektora po polsku zamawiasz przy rezerwacji."
      ],
      [
        "Learner permit kat. {V}",
        "Online w NDLS, z raportem medycznym od lekarza. Prawa jazdy z UE nie trzeba wymieniać."
      ],
      [
        "Case study CPC",
        "Obowiązkowe, jeśli chcesz pracować jako kierowca."
      ],
      [
        "Jazdy i egzaminy praktyczne",
        "Lekcje z instruktorem ADI kat. {V}, potem egzamin praktyczny i walkaround."
      ],
      [
        "Prawo jazdy i karta CPC",
        "Z kartą CPC możesz pracować jako kierowca."
      ]
    ],
    stepsNonEu: [
      [
        "Najpierw irlandzkie prawo jazdy B",
        "Prawa jazdy z Brazylii nie da się wymienić w Irlandii. Dla innych krajów sprawdzę, czy wymiana jest możliwa."
      ],
      [
        "Teoria kat. B",
        "Na teście B jest lektor po polsku, portugalsku i rosyjsku."
      ],
      [
        "Learner permit B i skrócone EDT",
        "Z zagranicznym prawem jazdy możesz ubiegać się o 6 lekcji EDT zamiast 12."
      ],
      [
        "Egzamin praktyczny B",
        "Po zdaniu dostajesz pełne irlandzkie prawo jazdy B."
      ],
      [
        "Teraz droga na kat. {V}",
        "Teoria {V}, learner permit, CPC i egzaminy praktyczne. Tu prowadzę Cię dalej."
      ]
    ],
    stepsNone: [
      [
        "Teoria kat. B",
        "Pierwszy krok do każdego prawa jazdy w Irlandii."
      ],
      [
        "Learner permit B i 12 lekcji EDT",
        "Lekcje z instruktorem ADI. Na egzamin możesz podejść najwcześniej po 6 miesiącach."
      ],
      [
        "Egzamin praktyczny B",
        "Po zdaniu masz pełne prawo jazdy B."
      ],
      [
        "Teraz droga na kat. {V}",
        "Teoria {V}, learner permit, CPC i egzaminy praktyczne. Tu prowadzę Cię dalej."
      ]
    ],
    about: "[Kilka zdań o sobie: skąd jesteś, jakie masz prawo jazdy i doświadczenie, dlaczego uczysz.]",
    footer: "Niezależny kurs teorii. Nie jest powiązany z RSA, NDLS ani theorytest.ie.",
    galleryTitle: "Galeria",
    galleryAlt: "Zdjęcie",
    galleryClose: "Zamknij",
    call: "Zadzwoń",
    langLabel: "Język"
  },
  pt: {
    langName: "Português",
    wa: "Falar no WhatsApp",
    waHello: "Olá! Quero saber sobre o curso de teoria para as categorias C, CE & D.",
    waPlan: "Olá! Minha carteira: {L}. Quero tirar a categoria {V}. Quero me inscrever no curso de teoria.",
    waCat: "Tenho interesse na categoria {V}.",
    chooseTitle: "Escolha a categoria",
    chooseHint: "Provas de teoria e CPC, categoria C & D",
    chooseTruck: "Caminhão",
    chooseCatC: "categoria C & CE",
    chooseBus: "Ônibus",
    chooseCatD: "categoria D",
    soundLabel: "Som",
    soundTip: "Ligue o som",
    soundOnAria: "Ligar o som",
    soundOffAria: "Desligar o som",
    busSoon: "Vídeo com o ônibus em breve — por enquanto mostramos o caminhão.",
    jTitle: "Seu caminho para um futuro melhor",
    jLead: "Teoria para a categoria {cat} na Irlanda, no seu idioma: passo a passo, da primeira pergunta ao cartão CPC.",
    jCtaPlan: "Montar meu plano",
    jNext: "Próximo",
    jWhyLabel: "A profissão",
    jW1Title: "Um local de trabalho com vista",
    jW1Text: "Montanhas, lagos e estradas costeiras no lugar de quatro paredes de escritório.",
    jW2Title: "Empresas procuram motoristas",
    jW2Text: "Empresas de transporte da Irlanda relatam com frequência dificuldade para encontrar motoristas de caminhão e ônibus.",
    jW3Title: "Espaço para crescer",
    jW3Text: "Comece com uma categoria e acrescente outras depois, como reboque ou outro tipo de veículo.",
    jFinalLabel: "Seu caminho",
    jFinalTitle: "Seu caminho começa aqui",
    jFinalText: "Diga qual carteira você tem e eu mostro o plano feito para você.",
    jPlanTitle: "Monte seu plano",
    jPlanLead: "Escolha sua carteira e veja os passos para a categoria {cat}.",
    jTeacherLabel: "Seu professor",
    jT1Title: "No seu idioma",
    jT1Text: "Em polonês, português, russo, espanhol ou inglês. A prova é em inglês, por isso vamos juntos por cada termo.",
    jT2Title: "Direto com o professor",
    jT2Text: "Você fala comigo no WhatsApp e quem responde sou eu.",
    jDoubtsTitle: "Respostas honestas às dúvidas mais comuns",
    faq: [
      [
        "Meu inglês é suficiente?",
        "As perguntas na tela são em inglês, mas as formulações se repetem. Estudamos os termos e as frases típicas até ficarem familiares. Para alguns testes há áudio em outros idiomas, e confirmamos o seu na hora da marcação."
      ],
      [
        "Faz anos que não estudo. Consigo?",
        "As aulas são curtas e seguem passo a passo: você sempre sabe o que estudar hoje e o que vem depois."
      ],
      [
        "Preciso trocar minha carteira da UE?",
        "Não. Com uma carteira da UE válida, você já pode pedir o learner permit C ou D."
      ],
      [
        "Com que idade posso começar?",
        "Categorias C & CE a partir de 18 anos e D a partir de 21, com CPC. Sem CPC: 21 e 24 anos."
      ],
      [
        "Preciso de exame médico?",
        "Sim. Para o learner permit C, CE & D é preciso um laudo médico de um GP, com no máximo 3 meses."
      ]
    ],
    jEndTitle: "Seu caminho começa com uma mensagem",
    jEndText: "Conte qual carteira você tem e o que quer dirigir.",
    jMetaTitle: "Seu caminho para a profissão de motorista na Irlanda | Celtic Rainbow International Driving School",
    jMetaDesc: "Teoria para as categorias de caminhão (C & CE) e ônibus (D) na Irlanda, em polonês, português, russo, espanhol ou inglês: da prova teórica ao cartão CPC. Fale com o professor no WhatsApp.",
    jStillAlt: "Um veículo branco em uma estrada de montanha na Irlanda ao pôr do sol",
    changeVehicle: "Trocar veículo",
    photo: "[Foto]",
    name: "[Nome e sobrenome]",
    qLic: "Minha carteira",
    lic: {
      eu: "Europeia (cat. B)",
      nonEu: "De fora da UE",
      none: "Ainda não tenho carteira"
    },
    ageC: "Categoria C & CE: a partir de 18 anos com CPC; sem CPC, a partir de 21.",
    ageD: "Categoria D: a partir de 21 anos com CPC; sem CPC, a partir de 24.",
    planTitle: "Seu plano",
    planCta: "Enviar este plano no WhatsApp",
    stepsEu: [
      [
        "Prova teórica {V}",
        "No centro de provas. As perguntas aparecem em inglês; a opção de áudio em português confirmamos na marcação."
      ],
      [
        "Learner permit {V}",
        "Online no NDLS, com laudo médico de um GP. Carteira europeia não precisa ser trocada."
      ],
      [
        "Case study do CPC",
        "Obrigatório para trabalhar como motorista."
      ],
      [
        "Aulas práticas e provas",
        "Aulas com instrutor ADI da categoria {V}, depois a prova prática e o walkaround."
      ],
      [
        "Carteira e cartão CPC",
        "Com o cartão CPC você pode trabalhar como motorista."
      ]
    ],
    stepsNonEu: [
      [
        "Primeiro, a carteira irlandesa B",
        "A CNH brasileira não pode ser trocada na Irlanda, então começamos pela categoria B."
      ],
      [
        "Prova teórica B",
        "A prova B tem áudio em português do Brasil."
      ],
      [
        "Learner permit B e EDT reduzido",
        "Com carteira estrangeira, você pode pedir 6 aulas de EDT em vez de 12."
      ],
      [
        "Prova prática B",
        "Aprovado, você recebe a carteira irlandesa B definitiva."
      ],
      [
        "Agora, o caminho para {V}",
        "Teoria {V}, learner permit, CPC e provas práticas. Daqui em diante, eu te acompanho."
      ]
    ],
    stepsNone: [
      [
        "Prova teórica B",
        "O primeiro passo para qualquer carteira na Irlanda."
      ],
      [
        "Learner permit B e 12 aulas de EDT",
        "Aulas com instrutor ADI. A prova prática só pode ser feita depois de 6 meses."
      ],
      [
        "Prova prática B",
        "Aprovado, você tem a carteira B definitiva."
      ],
      [
        "Agora, o caminho para {V}",
        "Teoria {V}, learner permit, CPC e provas práticas. Daqui em diante, eu te acompanho."
      ]
    ],
    about: "[Algumas frases sobre você: de onde é, que carteira e experiência tem, por que dá aulas.]",
    footer: "Curso de teoria independente. Sem vínculo com RSA, NDLS ou theorytest.ie.",
    galleryTitle: "Galeria",
    galleryAlt: "Foto",
    galleryClose: "Fechar",
    call: "Ligar",
    langLabel: "Idioma"
  },
  ru: {
    langName: "Русский",
    wa: "Написать в WhatsApp",
    waHello: "Здравствуйте! Хочу узнать про курс теории на категории C, CE & D.",
    waPlan: "Здравствуйте! Мои права: {L}. Хочу получить категорию {V}. Хочу записаться на курс теории.",
    waCat: "Интересует категория {V}.",
    chooseTitle: "Выберите категорию",
    chooseHint: "Теория и тесты CPC, категория C & D",
    chooseTruck: "Грузовик",
    chooseCatC: "категория C & CE",
    chooseBus: "Автобус",
    chooseCatD: "категория D",
    soundLabel: "Звук",
    soundTip: "Включите звук",
    soundOnAria: "Включить звук",
    soundOffAria: "Выключить звук",
    busSoon: "Видео с автобусом скоро появится — пока показываем грузовик.",
    jTitle: "Ваша дорога к лучшему будущему",
    jLead: "Теория на категорию {cat} в Ирландии, на вашем языке: шаг за шагом, от первого вопроса до карты CPC.",
    jCtaPlan: "Собрать план",
    jNext: "Далее",
    jWhyLabel: "Профессия",
    jW1Title: "Рабочее место с видом",
    jW1Text: "Горы, озёра и прибрежные дороги вместо четырёх стен офиса.",
    jW2Title: "Работодатели ищут водителей",
    jW2Text: "Транспортные компании Ирландии регулярно сообщают, что им не хватает водителей грузовиков и автобусов.",
    jW3Title: "Возможность расти",
    jW3Text: "Начните с одной категории и добавляйте другие позже, например прицеп или второй тип транспорта.",
    jFinalLabel: "Ваша дорога",
    jFinalTitle: "Ваша дорога начинается здесь",
    jFinalText: "Скажите, какие у вас права, и я покажу план именно для вас.",
    jPlanTitle: "Соберите свой план",
    jPlanLead: "Выберите свои права, и вы увидите шаги к категории {cat}.",
    jTeacherLabel: "Ваш преподаватель",
    jT1Title: "На вашем языке",
    jT1Text: "На польском, португальском, русском, испанском или английском. Экзамен на английском, поэтому каждый термин мы разбираем вместе.",
    jT2Title: "Напрямую с преподавателем",
    jT2Text: "Вы пишете мне в WhatsApp, и отвечаю я сам.",
    jDoubtsTitle: "Честные ответы на частые сомнения",
    faq: [
      [
        "Хватит ли мне английского?",
        "Вопросы на экране на английском, но формулировки повторяются. Мы учим термины и типичные фразы, пока они не станут привычными. Для некоторых экзаменов есть озвучка на других языках, а вашу мы уточняем при записи."
      ],
      [
        "Прошло много лет с последней учёбы. Справлюсь?",
        "Занятия короткие и идут шаг за шагом: вы всегда знаете, что учить сегодня и что дальше."
      ],
      [
        "Нужно менять права из ЕС?",
        "Нет. С действующими правами ЕС можно сразу подать на learner permit C или D."
      ],
      [
        "С какого возраста можно начать?",
        "Категории C & CE — с 18 лет, D — с 21, если вы проходите CPC. Без CPC — с 21 и 24 лет."
      ],
      [
        "Нужна медкомиссия?",
        "Да. Для learner permit C, CE & D нужен медицинский отчёт от врача, не старше 3 месяцев."
      ]
    ],
    jEndTitle: "Ваша дорога начинается с одного сообщения",
    jEndText: "Свяжитесь с нами, и мы ответим на все интересующие вас вопросы.",
    jMetaTitle: "Ваша дорога в профессию водителя в Ирландии | Celtic Rainbow International Driving School",
    jMetaDesc: "Теория на права на грузовик (C & CE) и автобус (D) в Ирландии на польском, португальском, русском, испанском или английском: от теоретического экзамена до карты CPC. Напишите преподавателю в WhatsApp.",
    jStillAlt: "Белая машина на горной дороге в Ирландии на закате",
    changeVehicle: "Сменить транспорт",
    photo: "[Фото]",
    name: "[Имя и фамилия]",
    qLic: "Мои права",
    lic: {
      eu: "Из ЕС (кат. B)",
      nonEu: "Не из ЕС",
      none: "Прав пока нет"
    },
    ageC: "Категория C & CE: с 18 лет с CPC, без CPC — с 21.",
    ageD: "Категория D: с 21 года с CPC, без CPC — с 24.",
    planTitle: "Ваш план",
    planCta: "Отправить этот план в WhatsApp",
    stepsEu: [
      [
        "Теория категории {V}",
        "В тестовом центре. Вопросы на экране по-английски; озвучку на русском уточняем при записи."
      ],
      [
        "Learner permit категории {V}",
        "Онлайн в NDLS, с медсправкой от врача. Права из ЕС менять не нужно."
      ],
      [
        "Case study CPC",
        "Обязательно, если хотите работать водителем."
      ],
      [
        "Вождение и практические экзамены",
        "Уроки с инструктором ADI категории {V}, затем практический экзамен и walkaround."
      ],
      [
        "Права и карта CPC",
        "С картой CPC можно работать водителем."
      ]
    ],
    stepsNonEu: [
      [
        "Сначала ирландские права B",
        "Бразильские права в Ирландии не обменять. Для других стран проверю, возможен ли обмен."
      ],
      [
        "Теория B",
        "На экзамене B есть озвучка на русском."
      ],
      [
        "Learner permit B и сокращённый EDT",
        "С иностранными правами можно запросить 6 уроков EDT вместо 12."
      ],
      [
        "Практический экзамен B",
        "После сдачи получаете полные ирландские права B."
      ],
      [
        "Теперь путь к категории {V}",
        "Теория {V}, learner permit, CPC и практические экзамены. Дальше веду вас я."
      ]
    ],
    stepsNone: [
      [
        "Теория B",
        "Первый шаг к любым правам в Ирландии."
      ],
      [
        "Learner permit B и 12 уроков EDT",
        "Уроки с инструктором ADI. Сдавать экзамен можно не раньше чем через 6 месяцев."
      ],
      [
        "Практический экзамен B",
        "После сдачи у вас полные права B."
      ],
      [
        "Теперь путь к категории {V}",
        "Теория {V}, learner permit, CPC и практические экзамены. Дальше веду вас я."
      ]
    ],
    about: "[Пара предложений о себе: откуда вы, какие у вас права и опыт, почему преподаёте.]",
    footer: "Независимый курс теории. Не связан с RSA, NDLS и theorytest.ie.",
    galleryTitle: "Галерея",
    galleryAlt: "Фото",
    galleryClose: "Закрыть",
    call: "Позвонить",
    langLabel: "Язык"
  },
  en: {
    langName: "English",
    wa: "Message on WhatsApp",
    waHello: "Hi! I'd like to ask about the C, CE & D theory course.",
    waPlan: "Hi! My licence: {L}. I want category {V}. I'd like to join the theory course.",
    waCat: "I'm interested in category {V}.",
    chooseTitle: "Choose your category",
    chooseHint: "Theory and CPC tests category C & D",
    chooseTruck: "Truck",
    chooseCatC: "category C & CE",
    chooseBus: "Bus",
    chooseCatD: "category D",
    soundLabel: "Sound",
    soundTip: "Turn on sound",
    soundOnAria: "Turn sound on",
    soundOffAria: "Turn sound off",
    busSoon: "Bus video coming soon — showing the truck for now.",
    jTitle: "Your road to a better future",
    jLead: "Theory for category {cat} in Ireland, in your language: step by step, from the first question to the CPC card.",
    jCtaPlan: "Build your plan",
    jNext: "Next",
    jWhyLabel: "The profession",
    jW1Title: "A workplace with a view",
    jW1Text: "Mountains, lakes and coast roads instead of four office walls.",
    jW2Title: "Employers are looking",
    jW2Text: "Irish transport companies regularly report difficulty finding enough truck and bus drivers.",
    jW3Title: "Room to grow",
    jW3Text: "Start with one category and add others later, such as a trailer or a second type of vehicle.",
    jFinalLabel: "Your road",
    jFinalTitle: "Your road starts here",
    jFinalText: "Tell me which licence you hold, and I will show you the plan made for you.",
    jPlanTitle: "Build your plan",
    jPlanLead: "Choose your licence and see the steps for category {cat}.",
    jTeacherLabel: "Your teacher",
    jT1Title: "In your language",
    jT1Text: "Polish, Portuguese, Russian, Spanish or English. The exam is in English, so we go through every term together.",
    jT2Title: "Directly with the teacher",
    jT2Text: "You message me on WhatsApp, and I answer myself.",
    jDoubtsTitle: "Honest answers to common doubts",
    faq: [
      [
        "Is my English good enough?",
        "The questions on the screen are in English, but the wording repeats. We learn the terms and typical phrases until they feel familiar. Voiceover in other languages is available for some tests, and we check yours when booking."
      ],
      [
        "I have not studied for years. Can I manage?",
        "Sessions are short and go step by step: you always know what to study today and what comes next."
      ],
      [
        "Do I need to exchange my EU licence?",
        "No. With a valid EU licence you can apply for a category C or D learner permit straight away."
      ],
      [
        "How old do I need to be?",
        "Categories C & CE from 18 and D from 21 if you do the CPC. Without it, 21 and 24."
      ],
      [
        "Do I need a medical?",
        "Yes. A category C, CE & D learner permit needs a medical report from a doctor, dated within the last 3 months."
      ]
    ],
    jEndTitle: "Your road starts with one message",
    jEndText: "Tell me which licence you hold and which vehicle you want to drive.",
    jMetaTitle: "Your road to a driver's career in Ireland | Celtic Rainbow International Driving School",
    jMetaDesc: "Theory for truck (C & CE) and bus (D) licences in Ireland, in Polish, Portuguese, Russian, Spanish or English: from the theory test to the CPC card. Message the teacher on WhatsApp.",
    jStillAlt: "A white vehicle on a mountain road in Ireland at sunset",
    changeVehicle: "Change vehicle",
    photo: "[Photo]",
    name: "[Full name]",
    qLic: "My licence",
    lic: {
      eu: "EU (category B)",
      nonEu: "Non-EU",
      none: "No licence yet"
    },
    ageC: "Category C & CE: from 18 with CPC, or 21 without.",
    ageD: "Category D: from 21 with CPC, or 24 without.",
    planTitle: "Your plan",
    planCta: "Send this plan on WhatsApp",
    stepsEu: [
      [
        "Category {V} theory test",
        "At a test centre. Questions are shown in English."
      ],
      [
        "Category {V} learner permit",
        "Online through NDLS, with a medical report from your GP. EU licences don't need exchanging."
      ],
      [
        "CPC case study",
        "Required if you'll drive for work."
      ],
      [
        "Lessons and practical tests",
        "Lessons with a category {V} ADI, then the driving test and walkaround."
      ],
      [
        "Licence and CPC card",
        "With the CPC card, you can work as a professional driver."
      ]
    ],
    stepsNonEu: [
      [
        "First, an Irish B licence",
        "Brazilian licences can't be exchanged in Ireland. From somewhere else? I'll check whether yours can be."
      ],
      [
        "Car theory test (B)",
        "Voiceover is available in 21 languages."
      ],
      [
        "Learner permit and reduced EDT",
        "With a foreign licence you can apply for 6 EDT lessons instead of 12."
      ],
      [
        "Car driving test",
        "Pass it and you get a full Irish B licence."
      ],
      [
        "Now the road to category {V}",
        "Category {V} theory, learner permit, CPC and practical tests. I'll guide you from here."
      ]
    ],
    stepsNone: [
      [
        "Car theory test (B)",
        "The first step to any Irish licence."
      ],
      [
        "Learner permit and 12 EDT lessons",
        "Lessons with an ADI. You can take the test after 6 months at the earliest."
      ],
      [
        "Car driving test",
        "Pass it and you hold a full B licence."
      ],
      [
        "Now the road to category {V}",
        "Category {V} theory, learner permit, CPC and practical tests. I'll guide you from here."
      ]
    ],
    about: "[A few lines about you: where you're from, your licence and experience, why you teach.]",
    footer: "Independent theory course. Not affiliated with the RSA, NDLS or theorytest.ie.",
    galleryTitle: "Gallery",
    galleryAlt: "Photo",
    galleryClose: "Close",
    call: "Call",
    langLabel: "Language"
  },
  es: {
    langName: "Español",
    wa: "Escribir por WhatsApp",
    waHello: "¡Hola! Quiero preguntar por el curso de teoría para las categorías C, CE & D.",
    waPlan: "¡Hola! Mi carné: {L}. Quiero la categoría {V}. Me gustaría apuntarme al curso de teoría.",
    waCat: "Me interesa la categoría {V}.",
    chooseTitle: "Elige tu categoría",
    chooseHint: "Teoría y tests CPC, categoría C & D",
    chooseTruck: "Camión",
    chooseCatC: "categoría C & CE",
    chooseBus: "Autobús",
    chooseCatD: "categoría D",
    soundLabel: "Sonido",
    soundTip: "Activa el sonido",
    soundOnAria: "Activar el sonido",
    soundOffAria: "Desactivar el sonido",
    busSoon: "El vídeo del autobús llega pronto: por ahora mostramos el camión.",
    jTitle: "Tu camino hacia un futuro mejor",
    jLead: "Teoría para la categoría {cat} en Irlanda, en tu idioma: paso a paso, desde la primera pregunta hasta la tarjeta CPC.",
    jCtaPlan: "Arma tu plan",
    jNext: "Siguiente",
    jWhyLabel: "La profesión",
    jW1Title: "Un lugar de trabajo con vistas",
    jW1Text: "Montañas, lagos y carreteras de costa en lugar de cuatro paredes de oficina.",
    jW2Title: "Las empresas buscan conductores",
    jW2Text: "Las empresas de transporte de Irlanda informan con frecuencia de que les cuesta encontrar conductores de camión y autobús.",
    jW3Title: "Espacio para crecer",
    jW3Text: "Empieza con una categoría y añade otras más adelante, como el remolque o un segundo tipo de vehículo.",
    jFinalLabel: "Tu camino",
    jFinalTitle: "Tu camino empieza aquí",
    jFinalText: "Dime qué carné tienes y te mostraré el plan hecho para ti.",
    jPlanTitle: "Arma tu plan",
    jPlanLead: "Elige tu carné y verás los pasos para la categoría {cat}.",
    jTeacherLabel: "Tu profesor",
    jT1Title: "En tu idioma",
    jT1Text: "Polaco, portugués, ruso, español o inglés. El examen es en inglés, así que repasamos juntos cada término.",
    jT2Title: "Directamente con el profesor",
    jT2Text: "Me escribes por WhatsApp y te respondo yo mismo.",
    jDoubtsTitle: "Respuestas sinceras a dudas frecuentes",
    faq: [
      [
        "¿Mi inglés es suficiente?",
        "Las preguntas en pantalla están en inglés, pero las formulaciones se repiten. Aprendemos los términos y las frases típicas hasta que te resulten familiares. Algunos exámenes tienen audio en otros idiomas; lo comprobamos al reservar."
      ],
      [
        "Hace años que no estudio. ¿Podré?",
        "Las clases son cortas y van paso a paso: siempre sabes qué estudiar hoy y qué viene después."
      ],
      [
        "¿Tengo que canjear mi carné de la UE?",
        "No. Con un carné de la UE válido puedes solicitar directamente el learner permit de la categoría C o D."
      ],
      [
        "¿Qué edad necesito?",
        "Categorías C & CE desde los 18 y D desde los 21 si haces el CPC. Sin él, 21 y 24."
      ],
      [
        "¿Necesito un informe médico?",
        "Sí. Para el learner permit de las categorías C, CE & D necesitas un informe médico de un médico, de hace menos de 3 meses."
      ]
    ],
    jEndTitle: "Tu camino empieza con un mensaje",
    jEndText: "Dime qué carné tienes y qué vehículo quieres conducir.",
    jMetaTitle: "Tu camino a la profesión de conductor en Irlanda | Celtic Rainbow International Driving School",
    jMetaDesc: "Teoría para el carné de camión (C & CE) y autobús (D) en Irlanda, en polaco, portugués, ruso, español o inglés: del examen teórico a la tarjeta CPC. Escribe al profesor por WhatsApp.",
    jStillAlt: "Un vehículo blanco en una carretera de montaña en Irlanda al atardecer",
    changeVehicle: "Cambiar de vehículo",
    photo: "[Foto]",
    name: "[Nombre y apellido]",
    qLic: "Mi carné",
    lic: {
      eu: "De la UE (categoría B)",
      nonEu: "De fuera de la UE",
      none: "Aún no tengo carné"
    },
    ageC: "Categoría C & CE: desde los 18 con CPC; sin CPC, desde los 21.",
    ageD: "Categoría D: desde los 21 con CPC; sin CPC, desde los 24.",
    planTitle: "Tu plan",
    planCta: "Enviar este plan por WhatsApp",
    stepsEu: [
      [
        "Examen teórico de la categoría {V}",
        "En un centro de exámenes. Las preguntas aparecen en inglés."
      ],
      [
        "Learner permit de la categoría {V}",
        "Online en NDLS, con un informe médico de tu médico. El carné de la UE no hay que canjearlo."
      ],
      [
        "Case study del CPC",
        "Obligatorio si vas a conducir por trabajo."
      ],
      [
        "Clases y exámenes prácticos",
        "Clases con un instructor ADI de la categoría {V}, luego el examen práctico y el walkaround."
      ],
      [
        "Carné y tarjeta CPC",
        "Con la tarjeta CPC puedes trabajar como conductor profesional."
      ]
    ],
    stepsNonEu: [
      [
        "Primero, el carné B irlandés",
        "Los carnés brasileños no se pueden canjear en Irlanda. ¿Eres de otro país? Compruebo si el tuyo se puede canjear."
      ],
      [
        "Examen teórico de coche (B)",
        "Hay audio en 21 idiomas."
      ],
      [
        "Learner permit y EDT reducido",
        "Con un carné extranjero puedes pedir 6 clases EDT en lugar de 12."
      ],
      [
        "Examen práctico de coche",
        "Al aprobarlo obtienes el carné B irlandés completo."
      ],
      [
        "Ahora, el camino a la categoría {V}",
        "Teoría de la categoría {V}, learner permit, CPC y exámenes prácticos. A partir de aquí te guío yo."
      ]
    ],
    stepsNone: [
      [
        "Examen teórico de coche (B)",
        "El primer paso para cualquier carné en Irlanda."
      ],
      [
        "Learner permit y 12 clases EDT",
        "Clases con un instructor ADI. Puedes presentarte al examen como pronto a los 6 meses."
      ],
      [
        "Examen práctico de coche",
        "Al aprobarlo tienes el carné B completo."
      ],
      [
        "Ahora, el camino a la categoría {V}",
        "Teoría de la categoría {V}, learner permit, CPC y exámenes prácticos. A partir de aquí te guío yo."
      ]
    ],
    about: "[Unas líneas sobre ti: de dónde eres, qué carné y experiencia tienes, por qué enseñas.]",
    footer: "Curso de teoría independiente. Sin relación con la RSA, NDLS ni theorytest.ie.",
    galleryTitle: "Galería",
    galleryAlt: "Foto",
    galleryClose: "Cerrar",
    call: "Llamar",
    langLabel: "Idioma"
  }
};
