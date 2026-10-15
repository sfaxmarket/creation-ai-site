
// ======================================
// Création Ai — Script commun
// Thème bleu + Menu mobile + Assistant
// ======================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. Forcer le thème bleu sombre
  document.body.classList.remove('light-theme');

  try {
    localStorage.setItem('creationAiTheme', 'dark');
  } catch (error) {
    // Le site fonctionne même sans stockage.
  }

  // 2. Menu mobile
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

  // 3. Année actuelle
  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // 4. Assistant virtuel Création Ai
  initCreationAiAssistant();
});


// ======================================
// FORMULAIRE DE COMMANDE
// ======================================

window.openOrder = function(service) {
  const orderSection = document.getElementById('commande');
  const serviceLabel = document.getElementById('service-choisi');
  const serviceInput = document.getElementById('service-input');

  if (!orderSection || !serviceLabel || !serviceInput) {
    alert('Le formulaire de commande est introuvable.');
    return;
  }

  serviceLabel.textContent = service;
  serviceInput.value = service;
  orderSection.hidden = false;

  orderSection.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};


window.closeOrder = function() {
  const orderSection = document.getElementById('commande');
  const servicesSection = document.getElementById('services');

  if (orderSection) {
    orderSection.hidden = true;
  }

  if (servicesSection) {
    servicesSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};


// ======================================
// BASE DE RÉPONSES DE L'ASSISTANT
// ======================================

function initCreationAiAssistant() {
  const launcher = document.getElementById('ai-chat-launcher');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeButton = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const chatForm = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  // Ne rien faire sur les pages sans assistant.
  if (!launcher || !chatWindow || !closeButton ||
      !messages || !chatForm || !input) {
    return;
  }

  let greeted = false;

  // Liens vers les services du site.
  const services = [
    {
      name: 'Publicité par IA',
      keywords: ['publicite', 'publicité', 'publicitaire', 'annonce', 'reklam'],
      url: './publicite.html',
      description:
        'Nous créons des visuels publicitaires avec l’intelligence artificielle pour mettre vos produits en valeur.'
    },
    {
      name: 'Création de sites web',
      keywords: ['site web', 'site internet', 'site', 'website', 'web'],
      url: './commande.html',
      description:
        'Nous créons des sites web modernes et adaptés aux téléphones. Le prix affiché commence à 300 DT.'
    },
    {
      name: 'Images et vidéos',
      keywords: ['image', 'images', 'video', 'vidéo', 'videos', 'visuel', 'montage'],
      url: './images-videos.html',
      description:
        'Nous réalisons des images et des vidéos personnalisées pour vos réseaux sociaux et vos campagnes.'
    },
    {
      name: 'Pack Succès',
      keywords: ['pack succes', 'pack succès', 'pack', 'offre complete', 'offre complète'],
      url: './pack-succes.html',
      description:
        'Le Pack Succès propose une solution pour développer votre activité et renforcer votre présence en ligne.'
    },
    {
      name: 'Sponsoring des réseaux sociaux',
      keywords: ['sponsoring', 'sponsorisation', 'sponsorise', 'publicite facebook', 'publicité facebook', 'reseaux sociaux', 'réseaux sociaux'],
      url: './sponsoring.html',
      description:
        'Nous vous accompagnons pour promouvoir vos pages et toucher davantage de clients sur les réseaux sociaux.'
    }
  ];

  // Normaliser les questions pour reconnaître plusieurs écritures.
  function normalize(text) {
    return text
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’']/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Ajouter un message en toute sécurité.
  function addMessage(text, sender = 'bot') {
    const bubble = document.createElement('div');

    bubble.className = 'ai-chat-message ' + sender;
    bubble.textContent = text;

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;

    return bubble;
  }

  // Ajouter des boutons de questions rapides.
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

  // Questions suggérées au démarrage.
  function showWelcome() {
    if (greeted) return;

    greeted = true;

    addMessage(
      'Bonjour et bienvenue chez Création Ai ! 👋\n\n' +
      'Je suis votre assistant virtuel. Je peux vous présenter nos services, ' +
      'vous aider à choisir une prestation et vous orienter pour commander.'
    );

    addQuickReplies([
      { label: 'Nos services', value: 'Quels sont vos services ?' },
      { label: 'Les prix', value: 'Quels sont vos prix ?' },
      { label: 'Commander', value: 'Comment commander ?' },
      { label: 'Contact WhatsApp', value: 'Contact WhatsApp' }
    ]);
  }

  // Réponses prédéfinies.
  function getAnswer(question) {
    const q = normalize(question);

    const has = (...words) =>
      words.some(word => q.includes(normalize(word)));

    // Salutations en français et en arabe.
    if (
      /^(bonjour|bonsoir|salut|coucou|hello|salam|aslema|ahlan|مرحبا|السلام عليكم|سلام)$/.test(q)
    ) {
      return {
        text:
          'Bonjour ! 👋 Bienvenue chez Création Ai. ' +
          'Que souhaitez-vous découvrir ?',
        quick: [
          { label: 'Nos services', value: 'Quels sont vos services ?' },
          { label: 'Commander', value: 'Comment commander ?' }
        ]
      };
    }

    // Remerciements.
    if (has('merci', 'thank you', 'شكرا', 'يعطيك الصحة')) {
      return {
        text:
          'Avec plaisir ! 😊 Création Ai est à votre disposition pour vous accompagner dans votre projet.'
      };
    }

    // Contact et WhatsApp.
    if (
      has('whatsapp', 'contact', 'telephone', 'téléphone', 'numero', 'numéro', 'appeler', 'اتصال', 'واتساب', 'رقم الهاتف')
    ) {
      return {
        text:
          'Vous pouvez contacter Création Ai sur WhatsApp au +216 21 582 307. ' +
          'Cliquez sur le bouton ci-dessous pour nous écrire.',
        link: {
          label: 'Écrire sur WhatsApp',
          url: 'https://wa.me/21621582307'
        }
      };
    }

    // Comment passer une commande.
    if (
      has('commander', 'commande', 'acheter', 'reservation', 'réserver', 'طلب', 'نطلب', 'كيفاش نطلب')
    ) {
      return {
        text:
          'Pour commander, choisissez le service qui vous intéresse puis cliquez sur le bouton correspondant. ' +
          'Vous pourrez ensuite suivre les instructions de la page. ' +
          'Si vous avez besoin d’aide, contactez-nous sur WhatsApp.',
        quick: [
          { label: 'Publicité par IA', value: 'Publicité par IA' },
          { label: 'Site web', value: 'Création de sites web' },
          { label: 'Images et vidéos', value: 'Images et vidéos' },
          { label: 'Pack Succès', value: 'Pack Succès' },
          { label: 'Sponsoring', value: 'Sponsoring des réseaux sociaux' }
        ]
      };
    }

    // Prix : ne pas inventer de tarifs.
    if (
      has('prix', 'tarif', 'combien', 'cout', 'coût', 'budget', 'ثمن', 'السعر', 'بقداش', 'قداش')
    ) {
      return {
        text:
          'Le prix affiché pour la création de sites web commence à 300 DT. ' +
          'Les tarifs des autres prestations dépendent de votre demande. ' +
          'Contactez-nous sur WhatsApp pour obtenir des informations adaptées à votre projet.',
        link: {
          label: 'Demander un tarif',
          url: 'https://wa.me/21621582307'
        }
      };
    }

    // Présentation générale des services.
    if (
      has('services', 'service', 'proposez', 'offrez', 'activite', 'activité', 'خدمات', 'شنوة تعملو')
    ) {
      return {
        text:
          'Voici les services proposés par Création Ai :\n\n' +
          '• Publicité par IA\n' +
          '• Création de sites web\n' +
          '• Images et vidéos\n' +
          '• Pack Succès\n' +
          '• Sponsoring des réseaux sociaux\n\n' +
          'Choisissez une prestation pour en savoir plus.',
        quick: [
          { label: 'Publicité par IA', value: 'Publicité par IA' },
          { label: 'Site web', value: 'Création de sites web' },
          { label: 'Images et vidéos', value: 'Images et vidéos' },
          { label: 'Pack Succès', value: 'Pack Succès' },
          { label: 'Sponsoring', value: 'Sponsoring des réseaux sociaux' }
        ]
      };
    }

    // Détecter un service précis.
    const service = services.find(item =>
      item.keywords.some(keyword => q.includes(normalize(keyword))) ||
      q === normalize(item.name)
    );

    if (service) {
      return {
        text: service.name + '\n\n' + service.description,
        link: {
          label: 'Découvrir / commander',
          url: service.url
        },
        quick: [
          { label: 'Voir tous les services', value: 'Quels sont vos services ?' },
          { label: 'Demander un prix', value: 'Quels sont vos prix ?' }
        ]
      };
    }

    // Présentation de l'entreprise.
    if (
      has('qui etes vous', 'qui êtes vous', 'creation ai', 'création ai', 'votre entreprise', 'من انتم')
    ) {
      return {
        text:
          'Création Ai vous accompagne dans la création de sites web, ' +
          'de publicités et de contenus visuels grâce à des solutions créatives ' +
          'et à l’intelligence artificielle.'
      };
    }

    // Réponse de secours.
    return {
      text:
        'Merci pour votre message ! 😊 Je peux répondre aux questions courantes ' +
        'sur nos services, les prix et les commandes. Pour une question particulière, ' +
        'contactez notre équipe sur WhatsApp.',
      quick: [
        { label: 'Nos services', value: 'Quels sont vos services ?' },
        { label: 'Les prix', value: 'Quels sont vos prix ?' },
        { label: 'Commander', value: 'Comment commander ?' },
        { label: 'WhatsApp', value: 'Contact WhatsApp' }
      ],
      link: {
        label: 'Contacter Création Ai',
        url: 'https://wa.me/21621582307'
      }
    };
  }

  // Envoyer une question et afficher la réponse.
  function handleQuestion(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) return;

    addMessage(cleanQuestion, 'user');

    const answer = getAnswer(cleanQuestion);

    addMessage(answer.text, 'bot');

    if (answer.link) {
      const linkContainer = document.createElement('div');
      linkContainer.className = 'ai-chat-quick';

      const link = document.createElement('a');
      link.textContent = answer.link.label;
      link.href = answer.link.url;
      link.className = 'ai-chat-message bot';
      link.style.display = 'inline-block';
      link.style.color = '#0757a0';
      link.style.textDecoration = 'none';
      link.style.border = '1px solid #acd9f7';

      if (answer.link.url.startsWith('https://wa.me/')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      linkContainer.appendChild(link);
      messages.appendChild(linkContainer);
    }

    if (answer.quick) {
      addQuickReplies(answer.quick);
    }

    messages.scrollTop = messages.scrollHeight;
  }

  // Ouvrir la fenêtre.
  function openChat() {
    chatWindow.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.hidden = true;

    showWelcome();

    input.focus();
  }

  // Fermer la fenêtre.
  function closeChat() {
    chatWindow.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  launcher.addEventListener('click', openChat);
  closeButton.addEventListener('click', closeChat);

  // Fermer avec la touche Échap.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !chatWindow.hidden) {
      closeChat();
    }
  });

  // Envoyer avec le bouton ou la touche Entrée.
  chatForm.addEventListener('submit', event => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) return;

    input.value = '';
    handleQuestion(question);
  });
}
