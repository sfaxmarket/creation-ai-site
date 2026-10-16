
/* ======================================
   Création Ai — Assistant Omar
   Français + العربية + العربية التونسية
   Base de questions/réponses
   Menu mobile + Commandes + Microphone
   Lecture vocale + Réponses rapides
====================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('light-theme');

  try {
    localStorage.setItem('creationAiTheme', 'dark');
  } catch (error) {}

  // Menu mobile
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute(
        'aria-label',
        isOpen ? 'Fermer le menu' : 'Ouvrir le menu'
      );
      toggle.textContent = isOpen ? '×' : '☰';
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Ouvrir le menu');
        toggle.textContent = '☰';
      });
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  initCreationAiAssistant();
});


// ======================================
// FORMULAIRE DE COMMANDE
// ======================================

window.openOrder = function(service) {
  const section = document.getElementById('commande');
  const label = document.getElementById('service-choisi');
  const input = document.getElementById('service-input');

  if (!section || !label || !input) {
    alert('Le formulaire de commande est introuvable.');
    return;
  }

  label.textContent = service;
  input.value = service;
  section.hidden = false;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.closeOrder = function() {
  const section = document.getElementById('commande');
  const services = document.getElementById('services');

  if (section) section.hidden = true;

  if (services) {
    services.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};


// ======================================
// ASSISTANT OMAR — CRÉATION AI
// ======================================

function initCreationAiAssistant() {
  const launcher = document.getElementById('ai-chat-launcher');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeButton = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const chatForm = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  const micButton = document.getElementById('ai-chat-mic');
  const languageSelect = document.getElementById('ai-chat-language');
  const speakButton = document.getElementById('ai-chat-speak');
  const stopButton = document.getElementById('ai-chat-stop');
  const voiceStatus = document.getElementById('ai-chat-voice-status');

  if (
    !launcher || !chatWindow || !closeButton ||
    !messages || !chatForm || !input
  ) return;

  const WHATSAPP_URL = 'https://wa.me/21621582307';

  let greeted = false;
  let lastBotResponse = '';
  let recognition = null;
  let isListening = false;

  // --------------------------------------
  // Langue et normalisation
  // --------------------------------------

  function setVoiceStatus(text) {
    if (voiceStatus) voiceStatus.textContent = text;
  }

  function getSelectedLanguage() {
    return languageSelect ? languageSelect.value : 'fr-FR';
  }

  function normalize(text) {
    return String(text || '')
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[ًٌٍَُِّْـٰ]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/[’']/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function detectLanguage(text) {
    return /[\u0600-\u06FF]/.test(String(text || ''))
      ? 'ar'
      : 'fr';
  }

  function addMessage(text, sender = 'bot') {
    const bubble = document.createElement('div');
    bubble.className = 'ai-chat-message ' + sender;
    bubble.textContent = text;

    const arabic = detectLanguage(text) === 'ar';
    bubble.dir = arabic ? 'rtl' : 'ltr';
    bubble.style.textAlign = arabic ? 'right' : 'left';

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;

    if (sender === 'bot') {
      lastBotResponse = text;
    }

    return bubble;
  }

  function addQuickReplies(items) {
    const container = document.createElement('div');
    container.className = 'ai-chat-quick';

    items.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.label;

      button.addEventListener('click', () => {
        handleQuestion(item.value);
      });

      container.appendChild(button);
    });

    messages.appendChild(container);
    messages.scrollTop = messages.scrollHeight;
  }

  function addLink(info) {
    const container = document.createElement('div');
    container.className = 'ai-chat-quick';

    const link = document.createElement('a');
    link.textContent = info.label;
    link.href = info.url;
    link.className = 'ai-chat-message bot';
    link.style.display = 'inline-block';
    link.style.color = '#0757a0';
    link.style.textDecoration = 'none';
    link.style.border = '1px solid #acd9f7';

    if (info.url.startsWith('https://wa.me/')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    container.appendChild(link);
    messages.appendChild(container);
    messages.scrollTop = messages.scrollHeight;
  }

  // --------------------------------------
  // Réponses rapides
  // --------------------------------------

  function serviceQuickReplies(arabic) {
    if (arabic) {
      return [
        {
          label: 'Publicité par IA',
          value: 'نحب إعلان بالذكاء الاصطناعي'
        },
        {
          label: 'إنشاء موقع',
          value: 'نحب نعمل موقع إلكتروني'
        },
        {
          label: 'الصور والفيديوهات',
          value: 'نحب صور وفيديوهات'
        },
        {
          label: 'باقة النجاح',
          value: 'شنوة باقة النجاح؟'
        },
        {
          label: 'الإشهار المموّل',
          value: 'نحب نعمل إشهار ممول'
        }
      ];
    }

    return [
      { label: 'Publicité par IA', value: 'Publicité par IA' },
      { label: 'Site web', value: 'Création de sites web' },
      { label: 'Images et vidéos', value: 'Images et vidéos' },
      { label: 'Pack Succès', value: 'Pack Succès' },
      {
        label: 'Sponsoring',
        value: 'Sponsoring des réseaux sociaux'
      }
    ];
  }

  function showWelcome() {
    if (greeted) return;
    greeted = true;

    addMessage(
      'مرحبًا بك في Création Ai! 👋\n\n' +
      'أنا عمر، مساعدك الافتراضي. نجم نعرّفك بخدماتنا، ' +
      'ونعاونك في معرفة مدة الإنجاز وكيفاش تطلب.\n\n' +
      'اكتب بالعربية أو بالفرنسية، أو استعمل الميكروفون.'
    );

    addQuickReplies([
      { label: 'خدماتنا', value: 'شنوة الخدمات اللي تقدمو فيها؟' },
      { label: 'مدة الإنجاز', value: 'قداش مدة إنجاز الخدمات؟' },
      { label: 'الأسعار', value: 'قداش الأسعار؟' },
      { label: 'كيف أطلب؟', value: 'كيفاش نطلب؟' },
      { label: 'واتساب', value: 'رقم واتساب' }
    ]);
  }

  // --------------------------------------
  // Services Création Ai
  // --------------------------------------

  const services = [
    {
      name: 'Publicité par IA',
      arabicName: 'الإعلانات بالذكاء الاصطناعي',
      keywords: [
        'publicite par ia', 'publicite ia', 'publicite',
        'publicitaire', 'annonce',
        'اعلان', 'اعلانات', 'اشهار', 'دعاية',
        'ذكاء اصطناعي', 'بالذكاء الاصطناعي'
      ],
      url: './publicite.html',
      duration: 'same-day',
      description:
        'Nous créons des visuels publicitaires avec l’intelligence artificielle pour mettre vos produits en valeur.',
      arabicDescription:
        'نصمّم إعلانات وصورًا ترويجية باستعمال الذكاء الاصطناعي لإبراز منتجاتك وخدماتك بطريقة جذابة.'
    },
    {
      name: 'Création de sites web',
      arabicName: 'إنشاء المواقع الإلكترونية',
      keywords: [
        'site web', 'site internet', 'website',
        'creation site', 'creer un site',
        'موقع', 'مواقع', 'موقع الكتروني',
        'مواقع الكترونية', 'ويب', 'سايت'
      ],
      url: './commande.html',
      duration: '3-4-days',
      description:
        'Nous créons des sites web modernes et adaptés aux téléphones. Le prix annoncé commence à 300 DT.',
      arabicDescription:
        'نصمّم مواقع إلكترونية عصرية ومتوافقة مع الهواتف. السعر المعلن يبدأ من 300 دينار تونسي.'
    },
    {
      name: 'Images et vidéos',
      arabicName: 'الصور والفيديوهات',
      keywords: [
        'image', 'images', 'video', 'videos', 'visuel', 'montage',
        'صورة', 'صور', 'تصميم', 'فيديو', 'فيديوهات', 'مونتاج'
      ],
      url: './images-videos.html',
      description:
        'Nous réalisons des images et des vidéos personnalisées pour vos réseaux sociaux et vos campagnes.',
      arabicDescription:
        'ننجز صورًا وفيديوهات مخصّصة لمنتجاتك وصفحاتك على مواقع التواصل الاجتماعي وحملاتك الإعلانية.'
    },
    {
      name: 'Pack Succès',
      arabicName: 'باقة النجاح',
      keywords: [
        'pack succes', 'offre complete', 'pack',
        'باقة النجاح', 'باقة', 'باك', 'عرض شامل'
      ],
      url: './pack-succes.html',
      description:
        'Le Pack Succès propose une solution pour développer votre activité et renforcer votre présence en ligne.',
      arabicDescription:
        'باقة النجاح تقدّم حلًا لمساعدتك على تطوير نشاطك وتعزيز حضورك على الإنترنت.'
    },
    {
      name: 'Sponsoring des réseaux sociaux',
      arabicName: 'الإشهار المموّل على مواقع التواصل',
      keywords: [
        'sponsoring', 'sponsorisation', 'publicite facebook',
        'reseaux sociaux', 'facebook ads', 'instagram ads',
        'تمويل', 'اشهار ممول', 'ترويج', 'فيسبوك',
        'انستغرام', 'انستجرام', 'اعلان ممول'
      ],
      url: './sponsoring.html',
      duration: '2-days',
      description:
        'Nous vous accompagnons pour promouvoir vos pages et toucher davantage de clients sur les réseaux sociaux.',
      arabicDescription:
        'نساعدك على الترويج لصفحاتك ومنشوراتك للوصول إلى عدد أكبر من العملاء على مواقع التواصل الاجتماعي.'
    }
  ];

  // --------------------------------------
  // Durée des services
  // --------------------------------------

  function getDurationAnswer(question) {
    const q = normalize(question);
    const arabic = detectLanguage(question) === 'ar';

    const asksDuration = [
      'duree', 'delai', 'combien de temps',
      'temps necessaire', 'temps pour',
      'quand sera termine', 'quand sera pret',
      'مدة', 'مدة الانجاز', 'مدة الإنجاز',
      'قداش يستحق', 'قداش تاخو', 'قداش تاخذ',
      'في قداش', 'قداش من نهار', 'شحال من يوم',
      'وقتاش يكمل', 'وقتاش تجهز', 'وقت الانجاز',
      'كم يستغرق', 'كم المدة', 'كم يوم',
      'متى ينتهي', 'متى يكون جاهز'
    ].some(word => q.includes(normalize(word)));

    if (!asksDuration) return null;

    const sponsoring = [
      'sponsoring', 'sponsorisation', 'اشهار ممول',
      'الاشهار الممول', 'اعلان ممول', 'اعلانات ممولة',
      'تمويل', 'ترويج', 'فيسبوك', 'انستغرام'
    ].some(word => q.includes(normalize(word)));

    const advertising = [
      'publicite par ia', 'publicite ia',
      'publicite', 'annonce', 'اعلان',
      'اعلانات', 'دعاية', 'ذكاء اصطناعي'
    ].some(word => q.includes(normalize(word)));

    const website = [
      'site web', 'site internet', 'website',
      'creation site', 'موقع', 'ويب', 'سايت'
    ].some(word => q.includes(normalize(word)));

    // Question sur un service particulier
    if (sponsoring) {
      return {
        text: arabic
          ? 'مدة إنجاز خدمة Sponsoring هي يومان. 📅'
          : 'Le délai pour le Sponsoring est de 2 jours. 📅'
      };
    }

    if (advertising) {
      return {
        text: arabic
          ? 'خدمة Publicité par IA يتم إنجازها في نفس اليوم. ⚡'
          : 'La prestation Publicité par IA est réalisée le jour même. ⚡'
      };
    }

    if (website) {
      return {
        text: arabic
          ? 'مدة إنشاء الموقع الإلكتروني تتراوح بين 3 و4 أيام. 💻'
          : 'Le délai de création d’un site web est de 3 à 4 jours. 💻'
      };
    }

    // Question sur toutes les durées
    return {
      text: arabic
        ? 'مدد إنجاز الخدمات في Création Ai:\n\n' +
          '• Sponsoring: يومان.\n' +
          '• Publicité par IA: في نفس اليوم.\n' +
          '• Création site web: من 3 إلى 4 أيام.\n\n' +
          'إذا تحب تعرف أكثر على خدمة معيّنة، اسألني عليها.'
        : 'Les délais annoncés sont les suivants :\n\n' +
          '• Sponsoring : 2 jours.\n' +
          '• Publicité par IA : le jour même.\n' +
          '• Création de site web : 3 à 4 jours.\n\n' +
          'Posez-moi vos questions sur la prestation qui vous intéresse.'
    };
  }

  // --------------------------------------
  // Base de questions / réponses
  // --------------------------------------

  function getAnswer(question) {
    const q = normalize(question);
    const arabic = detectLanguage(question) === 'ar';

    const has = (...words) =>
      words.some(word => q.includes(normalize(word)));

    // 1. Présentation du propriétaire
    if (
      has(
        'من هو صاحب الموقع', 'من صاحب الموقع',
        'شكون صاحب الموقع', 'شكون مول الموقع',
        'شكون عمل الموقع', 'من انشأ الموقع',
        'qui est le proprietaire du site',
        'qui est le proprietaire',
        'qui est le fondateur', 'qui a cree le site',
        'qui a créé le site', 'nom du proprietaire'
      )
    ) {
      return {
        text: arabic
          ? 'صاحب الموقع هو عمر. 😊'
          : 'Le propriétaire du site est Omar. 😊'
      };
    }

    // 2. Nom du projet
    if (
      has(
        'ماهو اسم المشروع', 'ما هو اسم المشروع',
        'شنوة اسم المشروع', 'شنية اسم المشروع',
        'اسم الموقع', 'اسم المشروع',
        'quel est le nom du projet',
        'nom du projet', 'comment sappelle le projet',
        'nom du site', 'comment sappelle votre projet'
      )
    ) {
      return {
        text: arabic
          ? 'اسم المشروع هو Création Ai. ✨'
          : 'Le nom du projet est Création Ai. ✨'
      };
    }

    // 3. Question personnelle : nourriture préférée
    if (
      has(
        'ما هي اكلتك المفضلة', 'ما هي اكلتك المفضله',
        'شنوة اكلتك المفضلة', 'شنوة ماكلتك المفضلة',
        'شنوة تحب تاكل', 'شنو تحب تاكل',
        'اكلتك المفضلة', 'اكلتك المفضله',
        'quel est ton plat prefere',
        'quel est votre plat prefere',
        'ton plat favori', 'votre plat favori',
        'qu est ce que tu aimes manger'
      )
    ) {
      return {
        text: arabic
          ? 'أكلتي المفضلة هي البيتزا! 🍕😋'
          : 'Mon plat préféré est la pizza ! 🍕😋'
      };
    }

    // 4. Disponibilité du site et de l'assistant
    if (
      has(
        '24 heures', '24h', '24 24', '24 sur 24',
        'toute la journee', 'tous les jours',
        'disponible', 'disponibilite', 'ouvert quand',
        'وقتاش الموقع متاح', 'الموقع متاح',
        'الموقع متوفر', 'المساعد متاح',
        'متى يبقى الموقع متاح', '24 ساعة',
        'طول اليوم', 'كل يوم', 'على مدار الساعة',
        'هل الموقع يعمل دائما', 'هل المساعد يعمل دائما',
        'الموقع يخدم ديما', 'عمر موجود ديما',
        'هل انتم متاحون', 'وقتاش تنجموا تجاوبوا'
      )
    ) {
      return {
        text: arabic
          ? 'موقع Création Ai ومساعد Omar متاحان على مدار 24 ساعة في اليوم، طوال أيام الأسبوع. 🤖🌙'
          : 'Le site Création Ai et l’assistant Omar sont disponibles 24 heures sur 24, tous les jours. 🤖🌙'
      };
    }

    // 5. Salutations
    if (
      has(
        'bonjour', 'bonsoir', 'salut', 'coucou',
        'hello', 'salam', 'aslema', 'ahlan',
        'مرحبا', 'السلام عليكم', 'سلام', 'عسلامة', 'اهلا'
      )
    ) {
      return arabic
        ? {
            text:
              'عسلامة ومرحبًا بيك في Création Ai! 😊\n\n' +
              'أنا عمر، مساعدك الافتراضي. شنوة تحب تعرف؟',
            quick: [
              { label: 'خدماتنا', value: 'شنوة الخدمات اللي تقدمو فيها؟' },
              { label: 'مدة الإنجاز', value: 'قداش مدة إنجاز الخدمات؟' },
              { label: 'الأسعار', value: 'قداش الأسعار؟' },
              { label: 'كيف نطلب؟', value: 'كيفاش نطلب؟' }
            ]
          }
        : {
            text:
              'Bonjour et bienvenue chez Création Ai ! 😊\n\n' +
              'Je suis Omar, votre assistant virtuel. Que souhaitez-vous savoir ?',
            quick: [
              { label: 'Nos services', value: 'Quels sont vos services ?' },
              { label: 'Délais', value: 'Quels sont vos délais ?' },
              { label: 'Les prix', value: 'Quels sont vos prix ?' },
              { label: 'Commander', value: 'Comment commander ?' }
            ]
          };
    }

    // 6. Remerciements
    if (
      has(
        'merci', 'thank you', 'شكرا', 'شكرا جزيلا',
        'يعطيك الصحة', 'بارك الله فيك'
      )
    ) {
      return {
        text: arabic
          ? 'بالصحة والراحة! 😊 مرحبا بيك ديما في Création Ai. إذا عندك سؤال آخر، أنا هنا باش نعاونك.'
          : 'Avec plaisir ! 😊 Création Ai est à votre disposition pour vous accompagner dans votre projet.'
      };
    }

    // 7. Délais : vérifier avant les autres intentions
    const durationAnswer = getDurationAnswer(question);
    if (durationAnswer) return durationAnswer;

    // 8. Liste de tous les services
    const asksAllServices = has(
      'شنوة الخدمات اللي تقدمو فيها',
      'شنوة الخدمات اللي تقدموا فيها',
      'شنية الخدمات اللي تقدموا فيها',
      'شنوة خدماتكم', 'شنو الخدمات', 'شنوة تعملو',
      'شنو تعملو', 'شنوة تقدموا', 'شنوة تقدمو',
      'شنوة عندكم', 'الخدمات المتوفرة',
      'ماذا تقدمون', 'خدماتكم',
      'services', 'vos services',
      'quels sont vos services',
      'quelles sont vos prestations',
      'que proposez vous', 'que faites vous',
      'activite'
    );

    if (asksAllServices) {
      return arabic
        ? {
            text:
              'في Création Ai نقدّموا الخدمات التالية:\n\n' +
              '• الإعلانات بالذكاء الاصطناعي.\n' +
              '• إنشاء المواقع الإلكترونية.\n' +
              '• تصميم الصور والفيديوهات.\n' +
              '• باقة النجاح.\n' +
              '• الإشهار المموّل على مواقع التواصل الاجتماعي.\n\n' +
              'اختار الخدمة اللي تهمّك باش نعطيك معلومات أكثر.',
            quick: serviceQuickReplies(true)
          }
        : {
            text:
              'Voici les services proposés par Création Ai :\n\n' +
              '• Publicité par IA.\n' +
              '• Création de sites web.\n' +
              '• Images et vidéos.\n' +
              '• Pack Succès.\n' +
              '• Sponsoring des réseaux sociaux.\n\n' +
              'Choisissez une prestation pour en savoir plus.',
            quick: serviceQuickReplies(false)
          };
    }

    // 9. Contact et WhatsApp
    if (
      has(
        'whatsapp', 'contact', 'telephone', 'numero',
        'appeler', 'اتصال', 'واتساب', 'رقم الهاتف',
        'رقمكم', 'نحكي معاكم', 'نتصل بيكم',
        'كيف نتصل', 'رقم التواصل'
      )
    ) {
      return arabic
        ? {
            text:
              'تنجم تتصل بينا على واتساب بالرقم:\n' +
              '+216 21 582 307\n\n' +
              'اضغط على الرابط باش تبعثلنا رسالة مباشرة.',
            link: {
              label: 'راسلنا على واتساب',
              url: WHATSAPP_URL
            }
          }
        : {
            text:
              'Vous pouvez contacter Création Ai sur WhatsApp au ' +
              '+216 21 582 307. Cliquez ci-dessous pour nous écrire directement.',
            link: {
              label: 'Écrire sur WhatsApp',
              url: WHATSAPP_URL
            }
          };
    }

    // 10. Prix
    if (
      has(
        'prix', 'tarif', 'combien', 'cout', 'budget',
        'ثمن', 'السعر', 'الاسعار', 'بقداش', 'قداش',
        'بكم', 'بشحال', 'تسعيرة', 'تكلفة',
        'يكلف', 'تسوى', 'فلوس'
      )
    ) {
      return arabic
        ? {
            text:
              'بالنسبة لإنشاء المواقع الإلكترونية، السعر المعلن يبدأ من 300 دينار تونسي.\n\n' +
              'أما بقية الخدمات، فالسعر يتحدّد حسب طلبك ونوع المشروع. راسلنا على واتساب باش نعطيوك التفاصيل.',
            link: {
              label: 'اطلب تفاصيل الأسعار',
              url: WHATSAPP_URL
            },
            quick: [
              { label: 'خدماتنا', value: 'شنوة الخدمات اللي تقدمو فيها؟' },
              { label: 'إنشاء موقع', value: 'قداش يكلف إنشاء موقع؟' }
            ]
          }
        : {
            text:
              'Le prix annoncé pour la création de sites web commence à 300 DT. Les tarifs des autres prestations dépendent de votre demande. Contactez-nous sur WhatsApp pour obtenir les détails.',
            link: {
              label: 'Demander un tarif',
              url: WHATSAPP_URL
            }
          };
    }

    // 11. Commander
    if (
      has(
        'commander', 'commande', 'acheter',
        'reservation', 'reserver', 'طلب',
        'نطلب', 'كيفاش نطلب', 'كيف نطلب',
        'نحب نطلب', 'نحب نشري', 'شراء',
        'باش نطلب', 'طريقة الطلب'
      )
    ) {
      return arabic
        ? {
            text:
              'باش تطلب، اختار الخدمة اللي تناسبك واضغط على الزر الخاص بيها في الموقع. بعدها اتبع التعليمات وعمّر المعلومات المطلوبة.\n\n' +
              'إذا تحتاج مساعدة، تنجم تراسلنا على واتساب.',
            quick: serviceQuickReplies(true),
            link: {
              label: 'راسلنا على واتساب',
              url: WHATSAPP_URL
            }
          }
        : {
            text:
              'Pour commander, choisissez le service qui vous intéresse puis cliquez sur le bouton correspondant. Suivez ensuite les instructions de la page. Si vous avez besoin d’aide, contactez-nous sur WhatsApp.',
            quick: serviceQuickReplies(false),
            link: {
              label: 'Contacter notre équipe',
              url: WHATSAPP_URL
            }
          };
    }

    // 12. Service spécifique
    const service = services.find(item =>
      item.keywords.some(keyword => q.includes(normalize(keyword))) ||
      q === normalize(item.name) ||
      q === normalize(item.arabicName)
    );

    if (service) {
      return arabic
        ? {
            text: service.arabicName + '\n\n' + service.arabicDescription,
            link: {
              label: 'اكتشف الخدمة',
              url: service.url
            },
            quick: [
              { label: 'كل الخدمات', value: 'شنوة الخدمات اللي تقدمو فيها؟' },
              { label: 'المدة', value: 'قداش مدة إنجاز الخدمات؟' },
              { label: 'الأسعار', value: 'قداش الأسعار؟' },
              { label: 'كيف نطلب؟', value: 'كيفاش نطلب؟' }
            ]
          }
        : {
            text: service.name + '\n\n' + service.description,
            link: {
              label: 'Découvrir / commander',
              url: service.url
            },
            quick: [
              { label: 'Tous les services', value: 'Quels sont vos services ?' },
              { label: 'Délais', value: 'Quels sont vos délais ?' },
              { label: 'Les prix', value: 'Quels sont vos prix ?' }
            ]
          };
    }

    // 13. Présentation de l'entreprise
    if (
      has(
        'qui etes vous', 'creation ai',
        'votre entreprise', 'من انتم',
        'شنوة creation ai', 'ما هو موقعكم',
        'عرفني بيكم', 'عرفني عليكم'
      )
    ) {
      return {
        text: arabic
          ? 'Création Ai مشروع يساعدك على تطوير حضورك على الإنترنت. نقدّموا خدمات إنشاء المواقع الإلكترونية، والإعلانات، وتصميم الصور والفيديوهات، والترويج على مواقع التواصل الاجتماعي.'
          : 'Création Ai vous accompagne dans la création de sites web, de publicités et de contenus visuels, ainsi que dans la promotion sur les réseaux sociaux.'
      };
    }

    // 14. Réponse de secours
    return arabic
      ? {
          text:
            'شكرًا على رسالتك! 😊\n\n' +
            'نجم نعاونك بمعلومات على خدماتنا، ومدد الإنجاز، والأسعار، وكيفاش تطلب.\n\n' +
            'إذا ما لقيتش الإجابة على سؤالك، راسل عمر على واتساب.',
          quick: [
            { label: 'خدماتنا', value: 'شنوة الخدمات اللي تقدمو فيها؟' },
            { label: 'مدة الإنجاز', value: 'قداش مدة إنجاز الخدمات؟' },
            { label: 'الأسعار', value: 'قداش الأسعار؟' },
            { label: 'كيف نطلب؟', value: 'كيفاش نطلب؟' }
          ],
          link: {
            label: 'تواصل مع Création Ai',
            url: WHATSAPP_URL
          }
        }
      : {
          text:
            'Merci pour votre message ! 😊 Je peux répondre aux questions courantes sur nos services, les délais, les prix et les commandes. Pour une question particulière, contactez notre équipe sur WhatsApp.',
          quick: [
            { label: 'Nos services', value: 'Quels sont vos services ?' },
            { label: 'Délais', value: 'Quels sont vos délais ?' },
            { label: 'Les prix', value: 'Quels sont vos prix ?' },
            { label: 'Commander', value: 'Comment commander ?' }
          ],
          link: {
            label: 'Contacter Création Ai',
            url: WHATSAPP_URL
          }
        };
  }

  // --------------------------------------
  // Envoyer une question et afficher la réponse
  // --------------------------------------

  function handleQuestion(question) {
    const cleanQuestion = String(question || '').trim();
    if (!cleanQuestion) return;

    addMessage(cleanQuestion, 'user');

    const answer = getAnswer(cleanQuestion);
    addMessage(answer.text, 'bot');

    if (answer.link) addLink(answer.link);
    if (answer.quick) addQuickReplies(answer.quick);

    messages.scrollTop = messages.scrollHeight;
  }

  // --------------------------------------
  // Ouvrir / fermer le chat
  // --------------------------------------

  function openChat() {
    chatWindow.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.hidden = true;
    showWelcome();
    input.focus();
  }

  function stopListening() {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (error) {}
    }
  }

  function closeChat() {
    stopListening();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    chatWindow.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  launcher.addEventListener('click', openChat);
  closeButton.addEventListener('click', closeChat);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !chatWindow.hidden) {
      closeChat();
    }
  });

  chatForm.addEventListener('submit', event => {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    handleQuestion(question);
  });

  // --------------------------------------
  // Microphone : reconnaissance vocale
  // --------------------------------------

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (micButton) {
    if (!SpeechRecognition) {
      micButton.addEventListener('click', () => {
        setVoiceStatus(
          'التعرّف على الصوت غير متوفر في هذا المتصفح. جرّب Chrome أو اكتب سؤالك.'
        );
      });
    } else {
      recognition = new SpeechRecognition();
      recognition.lang = getSelectedLanguage();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListening = true;
        micButton.setAttribute('aria-pressed', 'true');
        micButton.textContent = '⏹️';

        setVoiceStatus(
          getSelectedLanguage().startsWith('ar')
            ? 'نسمع فيك، تفضّل احكي توّا…'
            : 'Je vous écoute… Parlez maintenant.'
        );
      };

      recognition.onresult = event => {
        const transcript =
          event.results?.[0]?.[0]?.transcript?.trim() || '';

        if (!transcript) {
          setVoiceStatus('لم أفهم كلامك. حاول مرة أخرى.');
          return;
        }

        input.value = transcript;

        setVoiceStatus(
          detectLanguage(transcript) === 'ar'
            ? 'فهمت سؤالك، بصدد إرسال الإجابة…'
            : 'Question reconnue, préparation de la réponse…'
        );

        if (typeof chatForm.requestSubmit === 'function') {
          chatForm.requestSubmit();
        } else {
          chatForm.dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
          );
        }

        setVoiceStatus(
          detectLanguage(transcript) === 'ar'
            ? 'تم إرسال سؤالك. اضغط على زر الاستماع لسماع الإجابة.'
            : 'Question envoyée. Appuyez sur « Écouter » pour entendre la réponse.'
        );
      };

      recognition.onerror = event => {
        const errors = {
          'not-allowed':
            'لم تسمح باستعمال الميكروفون. فعّل إذن الميكروفون في إعدادات المتصفح.',
          'service-not-allowed':
            'المتصفح لا يسمح بخدمة التعرّف على الصوت.',
          'no-speech':
            'لم أسمع أي كلام. اضغط على الميكروفون وحاول مجددًا.',
          'audio-capture':
            'لم يتم العثور على ميكروفون. تأكد من إعدادات الهاتف.',
          'network':
            'حدث خطأ في الاتصال أثناء التعرّف على الصوت. تحقق من الإنترنت.',
          'language-not-supported':
            'هذه اللغة غير مدعومة في خدمة التعرّف على الصوت.'
        };

        setVoiceStatus(
          errors[event.error] ||
          'حدث خطأ أثناء استعمال الميكروفون. حاول مرة أخرى.'
        );
      };

      recognition.onend = () => {
        isListening = false;
        micButton.setAttribute('aria-pressed', 'false');
        micButton.textContent = '🎙️';
      };

      micButton.addEventListener('click', () => {
        if (isListening) {
          stopListening();
          setVoiceStatus('تم إيقاف الاستماع.');
          return;
        }

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }

        recognition.lang = getSelectedLanguage();

        try {
          recognition.start();
        } catch (error) {
          setVoiceStatus(
            'تعذّر تشغيل الميكروفون. انتظر قليلًا ثم حاول مرة أخرى.'
          );
        }
      });
    }
  }

  // --------------------------------------
  // Changer la langue du microphone
  // --------------------------------------

  if (languageSelect) {
    languageSelect.addEventListener('change', () => {
      if (recognition && !isListening) {
        recognition.lang = getSelectedLanguage();
      }

      const names = {
        'fr-FR': 'الفرنسية',
        'ar-TN': 'العربية التونسية',
        'ar-SA': 'العربية'
      };

      setVoiceStatus(
        'لغة الميكروفون: ' +
        (names[getSelectedLanguage()] || getSelectedLanguage()) +
        '. اضغط على الميكروفون للتحدث.'
      );
    });
  }

  // --------------------------------------
  // Lecture vocale
  // --------------------------------------

  function getSpeechLanguage(text) {
    if (detectLanguage(text) === 'ar') {
      const selected = getSelectedLanguage();
      return selected.startsWith('ar') ? selected : 'ar-TN';
    }

    return 'fr-FR';
  }

  function speakLastResponse() {
    if (!('speechSynthesis' in window)) {
      setVoiceStatus('خاصية القراءة الصوتية غير مدعومة في هذا المتصفح.');
      return;
    }

    if (!lastBotResponse) {
      setVoiceStatus('لا توجد إجابة لقراءتها الآن. اطرح سؤالًا أولًا.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(lastBotResponse);
    utterance.lang = getSpeechLanguage(lastBotResponse);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const prefix = utterance.lang.toLowerCase().split('-')[0];

    const matchingVoice = voices.find(voice =>
      voice.lang.toLowerCase().startsWith(prefix)
    );

    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => {
      setVoiceStatus(
        detectLanguage(lastBotResponse) === 'ar'
          ? 'بصدد قراءة الإجابة بصوت مسموع…'
          : 'Lecture vocale en cours…'
      );
    };

    utterance.onend = () => {
      setVoiceStatus(
        detectLanguage(lastBotResponse) === 'ar'
          ? 'انتهت القراءة. يمكنك طرح سؤال آخر.'
          : 'Lecture terminée. Vous pouvez poser une autre question.'
      );
    };

    utterance.onerror = () => {
      setVoiceStatus(
        'تعذّرت قراءة الإجابة. تأكد من توفر صوت مناسب في إعدادات الهاتف.'
      );
    };

    window.speechSynthesis.speak(utterance);
  }

  if (speakButton) {
    speakButton.addEventListener('click', speakLastResponse);
  }

  // Arrêter la lecture et le microphone
  if (stopButton) {
    stopButton.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      stopListening();
      setVoiceStatus('تم إيقاف القراءة والاستماع.');
    });
  }
}
