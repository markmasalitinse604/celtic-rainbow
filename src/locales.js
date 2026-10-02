// ─────────────────────────────────────────────────────────────
//  СЛОВАРЬ: все тексты сайта на 4 языках (pl, pt, ru, en)
//
//  Каждый язык — отдельный блок ниже, ключи во всех блоках одинаковые.
//  Твоё наполнение — в полях с [квадратными скобками], в каждом языке:
//    name   — имя и фамилия
//    about  — пара предложений о себе (блок «Обо мне»)
//    photo  — подпись заглушки; не видна, если есть src/assets/teacher.jpg
//  Телефон, Facebook и домен — в build.js (PHONE, PHONE_DISPLAY, FACEBOOK_URL, SITE_URL).
//
//  Меняешь текст — меняй во всех четырёх языках, потом npm run build.
// ─────────────────────────────────────────────────────────────

module.exports = {
  pl: {
    langName: "Polski",
    navCourse: "Kurs",
    navPath: "Twoja droga",
    navFaq: "Pytania",
    wa: "Napisz na WhatsApp",
    waHello: "Dzień dobry! Chcę zapytać o kurs teorii na kategorię C/D.",
    waPlan: "Dzień dobry! Moje prawo jazdy: {L}. Chcę zdobyć kategorię {V}. Chcę zapisać się na kurs teorii.",
    waCat: "Interesuje mnie kategoria {V}.",
    busSoon: "Film z autobusem już wkrótce — na razie pokazujemy ciężarówkę.",
    heroTitle: "Teoria na ciężarówkę i autobus w Irlandii.",
    heroSub: "Przygotuję Cię do egzaminu teoretycznego na kategorie C i D oraz do case study CPC.",
    heroCta2: "Sprawdź swoją drogę",
    photo: "[Zdjęcie]",
    name: "[Imię i nazwisko]",
    whyTitle: "Dlaczego ze mną",
    why: [
      [
        "Twój język i angielskie terminy",
        "Na egzaminie pytania są na ekranie po angielsku. Tłumaczę każdy termin, żeby od razu był dla Ciebie jasny."
      ],
      [
        "Znam drogę osoby z zagranicy",
        "Prawo jazdy z UE, z Brazylii albo żadne: powiem, od czego zacząć."
      ],
      [
        "Jeden nauczyciel",
        "Piszesz bezpośrednio do mnie na WhatsApp i to ja odpowiadam."
      ]
    ],
    courseTitle: "Co obejmuje kurs",
    course: [
      [
        "C / D",
        "Egzamin teoretyczny",
        "100 pytań, 74 poprawne odpowiedzi, 120 minut. Przepisy, ocena ryzyka, eco-driving, zagrożenia na drodze."
      ],
      [
        "CPC",
        "Case study CPC",
        "Trzy sytuacje z pracy kierowcy, po 15 pytań. Wymagane, jeśli chcesz jeździć zawodowo."
      ],
      [
        "NDLS",
        "Formalności krok po kroku",
        "Learner permit, raport medyczny, rezerwacja egzaminów. Pokażę, co wypełnić i w jakiej kolejności."
      ]
    ],
    pathTitle: "Sprawdź swoją drogę do kategorii C lub D",
    pathIntro: "Wybierz, jakie masz prawo jazdy i czym chcesz jeździć.",
    qLic: "Moje prawo jazdy",
    lic: {
      eu: "Z UE (kat. B)",
      nonEu: "Spoza UE",
      none: "Nie mam prawa jazdy"
    },
    qVeh: "Chcę jeździć",
    veh: {
      c: "Ciężarówką (C)",
      d: "Autobusem (D)"
    },
    ageC: "Kategoria C: od 18 lat z CPC, bez CPC od 21.",
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
    aboutTitle: "O mnie",
    about: "[Kilka zdań o sobie: skąd jesteś, jakie masz prawo jazdy i doświadczenie, dlaczego uczysz.]",
    faqTitle: "Częste pytania",
    faq: [
      [
        "Czy mogę zdawać teorię po polsku?",
        "Pytania na ekranie są po angielsku, ale możesz słuchać polskiego lektora w słuchawkach. Zaznacz to przy rezerwacji."
      ],
      [
        "Czy muszę wymieniać polskie prawo jazdy?",
        "Nie. Z ważnym prawem jazdy z UE możesz od razu złożyć wniosek o learner permit C lub D."
      ],
      [
        "Od ilu lat mogę zacząć?",
        "Kategoria C od 18 lat, kategoria D od 21, jeśli robisz CPC. Bez CPC: od 21 i 24 lat."
      ],
      [
        "Czy potrzebuję badań lekarskich?",
        "Tak. Do learner permit C lub D potrzebny jest raport medyczny od lekarza, nie starszy niż 3 miesiące."
      ]
    ],
    ctaTitle: "Napisz do mnie.",
    ctaText: "Powiedz, jakie masz prawo jazdy i czym chcesz jeździć, a ułożę Ci plan.",
    footer: "Niezależny kurs teorii. Nie jest powiązany z RSA, NDLS ani theorytest.ie.",
    galleryTitle: "Galeria",
    galleryAlt: "Zdjęcie",
    galleryClose: "Zamknij",
    signTitle: "Egzamin teoretyczny",
    signQuestions: "Pytań",
    signPass: "Do zaliczenia",
    signTime: "Czas",
    signMinutes: "min",
    call: "Zadzwoń",
    langLabel: "Język",
    menuLabel: "Menu",
    closeLabel: "Zamknij menu"
  },
  pt: {
    langName: "Português",
    navCourse: "Curso",
    navPath: "Seu caminho",
    navFaq: "Dúvidas",
    wa: "Falar no WhatsApp",
    waHello: "Olá! Quero saber sobre o curso de teoria para as categorias C/D.",
    waPlan: "Olá! Minha carteira: {L}. Quero tirar a categoria {V}. Quero me inscrever no curso de teoria.",
    waCat: "Tenho interesse na categoria {V}.",
    busSoon: "Vídeo com o ônibus em breve — por enquanto mostramos o caminhão.",
    heroTitle: "Teoria para caminhão e ônibus na Irlanda.",
    heroSub: "Preparo você para a prova teórica das categorias C e D e para o case study do CPC.",
    heroCta2: "Ver meu caminho",
    photo: "[Foto]",
    name: "[Nome e sobrenome]",
    whyTitle: "Por que estudar comigo",
    why: [
      [
        "Seu idioma e os termos em inglês",
        "Na prova, as perguntas aparecem em inglês na tela. Explico cada termo para você reconhecer na hora."
      ],
      [
        "Conheço o caminho de quem vem de fora",
        "CNH brasileira, carteira europeia ou nenhuma: mostro por onde começar."
      ],
      [
        "Um professor",
        "Você fala direto comigo no WhatsApp, e quem responde sou eu."
      ]
    ],
    courseTitle: "O que o curso inclui",
    course: [
      [
        "C / D",
        "Prova teórica",
        "100 perguntas, 74 acertos, 120 minutos. Regras de trânsito, percepção de risco, eco-driving, perigos na estrada."
      ],
      [
        "CPC",
        "Case study do CPC",
        "Três situações reais do trabalho de motorista, 15 perguntas cada. Obrigatório para dirigir profissionalmente."
      ],
      [
        "NDLS",
        "Burocracia passo a passo",
        "Learner permit, laudo médico, agendamento das provas. Mostro o que preencher e em que ordem."
      ]
    ],
    pathTitle: "Veja seu caminho até a categoria C ou D",
    pathIntro: "Escolha a carteira que você tem e o que quer dirigir.",
    qLic: "Minha carteira",
    lic: {
      eu: "Europeia (cat. B)",
      nonEu: "De fora da UE",
      none: "Ainda não tenho carteira"
    },
    qVeh: "Quero dirigir",
    veh: {
      c: "Caminhão (C)",
      d: "Ônibus (D)"
    },
    ageC: "Categoria C: a partir de 18 anos com CPC; sem CPC, a partir de 21.",
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
    aboutTitle: "Sobre mim",
    about: "[Algumas frases sobre você: de onde é, que carteira e experiência tem, por que dá aulas.]",
    faqTitle: "Dúvidas frequentes",
    faq: [
      [
        "Posso fazer a prova em português?",
        "As perguntas aparecem em inglês. Na prova B há áudio em português do Brasil; para C e D, confirmamos a opção de idioma na marcação."
      ],
      [
        "Posso usar minha CNH brasileira?",
        "Depois que você passa a morar aqui, não. A CNH não pode ser trocada na Irlanda, então começamos pela carteira B irlandesa."
      ],
      [
        "Com que idade posso começar?",
        "Categoria C a partir de 18 anos e D a partir de 21, com CPC. Sem CPC: 21 e 24 anos."
      ],
      [
        "Preciso de exame médico?",
        "Sim. Para o learner permit C ou D é preciso um laudo médico de um GP, com no máximo 3 meses."
      ]
    ],
    ctaTitle: "Me chama no WhatsApp.",
    ctaText: "Conta qual carteira você tem e o que quer dirigir, que eu monto seu plano.",
    footer: "Curso de teoria independente. Sem vínculo com RSA, NDLS ou theorytest.ie.",
    galleryTitle: "Galeria",
    galleryAlt: "Foto",
    galleryClose: "Fechar",
    signTitle: "Prova teórica",
    signQuestions: "Perguntas",
    signPass: "Para passar",
    signTime: "Tempo",
    signMinutes: "min",
    call: "Ligar",
    langLabel: "Idioma",
    menuLabel: "Menu",
    closeLabel: "Fechar menu"
  },
  ru: {
    langName: "Русский",
    navCourse: "Курс",
    navPath: "Ваш путь",
    navFaq: "Вопросы",
    wa: "Написать в WhatsApp",
    waHello: "Здравствуйте! Хочу узнать про курс теории на категории C/D.",
    waPlan: "Здравствуйте! Мои права: {L}. Хочу получить категорию {V}. Хочу записаться на курс теории.",
    waCat: "Интересует категория {V}.",
    busSoon: "Видео с автобусом скоро появится — пока показываем грузовик.",
    heroTitle: "Теория на грузовик и автобус в Ирландии.",
    heroSub: "Подготовлю к теоретическому экзамену на категории C и D и к case study CPC.",
    heroCta2: "Узнать свой путь",
    photo: "[Фото]",
    name: "[Имя и фамилия]",
    whyTitle: "Почему со мной",
    why: [
      [
        "Ваш язык и английские термины",
        "На экзамене вопросы на экране по-английски. Объясняю каждый термин, чтобы вы узнавали его сразу."
      ],
      [
        "Знаю путь приезжего",
        "Права из ЕС, из Бразилии или никаких: подскажу, с чего начать."
      ],
      [
        "Один преподаватель",
        "Вы пишете напрямую мне в WhatsApp, и отвечаю я сам."
      ]
    ],
    courseTitle: "Что входит в курс",
    course: [
      [
        "C / D",
        "Теоретический экзамен",
        "100 вопросов, 74 верных ответа, 120 минут. Правила, оценка риска, эко-вождение, опасности на дороге."
      ],
      [
        "CPC",
        "Case study CPC",
        "Три рабочие ситуации водителя по 15 вопросов. Обязательно, чтобы работать водителем."
      ],
      [
        "NDLS",
        "Документы по шагам",
        "Learner permit, медсправка, запись на экзамены. Покажу, что заполнять и в каком порядке."
      ]
    ],
    pathTitle: "Ваш путь к категории C или D",
    pathIntro: "Выберите, какие у вас права и на чём хотите ездить.",
    qLic: "Мои права",
    lic: {
      eu: "Из ЕС (кат. B)",
      nonEu: "Не из ЕС",
      none: "Прав пока нет"
    },
    qVeh: "Хочу водить",
    veh: {
      c: "Грузовик (C)",
      d: "Автобус (D)"
    },
    ageC: "Категория C: с 18 лет с CPC, без CPC — с 21.",
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
    aboutTitle: "Обо мне",
    about: "[Пара предложений о себе: откуда вы, какие у вас права и опыт, почему преподаёте.]",
    faqTitle: "Частые вопросы",
    faq: [
      [
        "Можно сдавать теорию на русском?",
        "Вопросы на экране по-английски. На экзамене B есть русская озвучка; для C и D вариант озвучки уточняем при записи."
      ],
      [
        "Нужно менять права из ЕС?",
        "Нет. С действующими правами ЕС можно сразу подать на learner permit C или D."
      ],
      [
        "С какого возраста можно начать?",
        "Категория C — с 18 лет, D — с 21, если проходите CPC. Без CPC — с 21 и 24 лет."
      ],
      [
        "Нужна медкомиссия?",
        "Да. Для learner permit C или D нужен медицинский отчёт от врача, не старше 3 месяцев."
      ]
    ],
    ctaTitle: "Напишите мне.",
    ctaText: "Расскажите, какие у вас права и на чём хотите ездить, и я составлю план.",
    footer: "Независимый курс теории. Не связан с RSA, NDLS и theorytest.ie.",
    galleryTitle: "Галерея",
    galleryAlt: "Фото",
    galleryClose: "Закрыть",
    signTitle: "Экзамен по теории",
    signQuestions: "Вопросов",
    signPass: "Нужно для сдачи",
    signTime: "Время",
    signMinutes: "мин",
    call: "Позвонить",
    langLabel: "Язык",
    menuLabel: "Меню",
    closeLabel: "Закрыть меню"
  },
  en: {
    langName: "English",
    navCourse: "Course",
    navPath: "Your route",
    navFaq: "Questions",
    wa: "Message on WhatsApp",
    waHello: "Hi! I'd like to ask about the C/D theory course.",
    waPlan: "Hi! My licence: {L}. I want category {V}. I'd like to join the theory course.",
    waCat: "I'm interested in category {V}.",
    busSoon: "Bus video coming soon — showing the truck for now.",
    heroTitle: "Truck and bus theory in Ireland.",
    heroSub: "I'll prepare you for the category C and D theory test and the CPC case study.",
    heroCta2: "See your route",
    photo: "[Photo]",
    name: "[Full name]",
    whyTitle: "Why learn with me",
    why: [
      [
        "Plain explanations, exam wording",
        "Questions appear in English on screen. I explain every term so you recognise it instantly."
      ],
      [
        "I know the newcomer's route",
        "EU licence, non-EU licence or none at all: I'll show you where to start."
      ],
      [
        "One teacher",
        "You message me directly on WhatsApp, and I'm the one who answers."
      ]
    ],
    courseTitle: "What the course covers",
    course: [
      [
        "C / D",
        "Driver Theory Test",
        "100 questions, 74 correct to pass, 120 minutes. Rules of the Road, risk, eco-driving, hazards."
      ],
      [
        "CPC",
        "CPC case study",
        "Three real work situations, 15 questions each. Required to drive for a living."
      ],
      [
        "NDLS",
        "Paperwork, step by step",
        "Learner permit, medical report, test bookings. I'll show you what to fill in and in what order."
      ]
    ],
    pathTitle: "Your route to a C or D licence",
    pathIntro: "Pick the licence you hold and what you want to drive.",
    qLic: "My licence",
    lic: {
      eu: "EU (category B)",
      nonEu: "Non-EU",
      none: "No licence yet"
    },
    qVeh: "I want to drive",
    veh: {
      c: "Trucks (C)",
      d: "Buses (D)"
    },
    ageC: "Category C: from 18 with CPC, or 21 without.",
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
    aboutTitle: "About me",
    about: "[A few lines about you: where you're from, your licence and experience, why you teach.]",
    faqTitle: "Common questions",
    faq: [
      [
        "Is the test only in English?",
        "Questions appear in English on screen. Voiceover in other languages is available for some tests, and we check yours when booking."
      ],
      [
        "Do I need an Irish licence to start?",
        "An EU or Irish B licence is enough. With another licence, you'll usually need an Irish B first."
      ],
      [
        "How old do I need to be?",
        "18 for category C and 21 for D if you do CPC; 21 and 24 without it."
      ],
      [
        "Do I need a medical?",
        "Yes. A C or D learner permit needs a medical report from a doctor, dated within the last 3 months."
      ]
    ],
    ctaTitle: "Message me.",
    ctaText: "Tell me what licence you have and what you want to drive, and I'll put a plan together.",
    footer: "Independent theory course. Not affiliated with the RSA, NDLS or theorytest.ie.",
    galleryTitle: "Gallery",
    galleryAlt: "Photo",
    galleryClose: "Close",
    signTitle: "Theory test",
    signQuestions: "Questions",
    signPass: "To pass",
    signTime: "Time",
    signMinutes: "min",
    call: "Call",
    langLabel: "Language",
    menuLabel: "Menu",
    closeLabel: "Close menu"
  }
};
