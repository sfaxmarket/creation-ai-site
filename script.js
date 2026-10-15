// ======================================
// Création Ai — Script commun
// Thème bleu + Menu mobile + Assistant vocal
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
// ASSISTANT CRÉATION AI
// Texte + Microphone + Lecture vocale
// ======================================

function initCreationAiAssistant() {
  const launcher = document.getElementById('ai-chat-launcher');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeButton = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const chatForm = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  // Contrôles vocaux
  const micButton = document.getElementById('ai-chat-mic');
  const languageSelect = document.getElementById('ai-chat-language');
  const speakButton = document.getElementById('ai-chat-speak');
  const stopButton = document.getElementById('ai-chat-stop');
  const voiceStatus = document.getElementById('ai-chat-voice-status');

  // Ne rien faire sur les pages sans assistant.
  if (
    !launcher ||
    !chatWindow ||
    !closeButton ||
    !messages ||
    !chatForm ||
    !input
  ) {
    return;
  }

  let greeted = false;
  let lastBotResponse = '';
  let recognition = null;
  let isListening = false;

  // Fonction pour afficher l'état des fonctions vocales.
  function setVoiceStatus(message) {
    if (voiceStatus) {
      voiceStatus.textContent = message;
    }
  }

  // Langue choisie par le visiteur.
  function getSelectedLanguage() {
    return languageSelect ? languageSelect.value : 'fr-FR';
  }


  // ======================================
  // SERVICES DU SITE
  // ======================================

  const services = [
    {
      name: 'Publicité par IA',
      keywords: [
        'publicite', 'publicité', 'publicitaire',
        'annonce', 'reklam'
      ],
      url: './publicite.html',
      description:
        'Nous créons des visuels publicitaires avec l’intelligence artificielle pour mettre vos produits en valeur.'
    },
    {
      name: 'Création de sites web',
      keywords: [
        'site web', 'site internet', 'site',
        'website', 'web'
      ],
      url: './commande.html',
      description:
        'Nous créons des sites web modernes et adaptés aux téléphones. Le prix affiché commence à 300 DT.'
    },
    {
      name: 'Images et vidéos',
      keywords: [
        'image', 'images', 'video', 'vidéo',
        'videos', 'visuel', 'montage'
      ],
      url: './images-videos.html',
      description:
        'Nous réalisons des images et des vidéos personnalisées pour vos réseaux sociaux et vos campagnes.'
    },
    {
      name: 'Pack Succès',
      keywords: [
        'pack succes', 'pack succès', 'pack',
        'offre complete', 'offre complète'
      ],
      url: './pack-succes.html',
      description:
        'Le Pack Succès propose une solution pour développer votre activité et renforcer votre présence en ligne.'
    },
    {
      name: 'Sponsoring des réseaux sociaux',
      keywords: [
        'sponsoring', 'sponsorisation', 'sponsorise',
        'publicite facebook', 'publicité facebook',
        'reseaux sociaux', 'réseaux sociaux'
      ],
      url: './sponsoring.html',
      description:
        'Nous vous accompagnons pour promouvoir vos pages et toucher davantage de clients sur les réseaux sociaux.'
    }
  ];


  // ======================================
  // NORMALISATION DU TEXTE
  // ======================================

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


  // ======================================
  // AFFICHER LES MESSAGES
  // ======================================

  function addMessage(text, sender = 'bot') {
    const bubble = document.createElement('div');

    bubble.className = 'ai-chat-message ' + sender;
    bubble.textContent = text;

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;

    if (sender === 'bot') {
      lastBotResponse = text;
    }

    return bubble;
  }


  // ======================================
  // QUESTIONS RAPIDES
  // ======================================

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


  // ======================================
  // MESSAGE DE BIENVENUE
  // ======================================

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


  // ======================================
  // BASE DE RÉPONSES
  // ======================================

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
      has(
        'whatsapp', 'contact', 'telephone', 'téléphone',
        'numero', 'numéro', 'appeler', 'اتصال',
        'واتساب', 'رقم الهاتف'
      )
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

    // Commandes.
    if (
      has(
        'commander', 'commande', 'acheter', 'reservation',
        'réserver', 'طلب', 'نطلب', 'كيفاش نطلب'
      )
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
      has(
        'prix', 'tarif', 'combien', 'cout', 'coût',
        'budget', 'ثمن', 'السعر', 'بقداش', 'قداش'
      )
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

    // Présentation des services.
    if (
      has(
        'services', 'service', 'proposez', 'offrez',
        'activite', 'activité', 'خدمات', 'شنوة تعملو'
      )
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
      has(
        'qui etes vous', 'qui êtes vous', 'creation ai',
        'création ai', 'votre entreprise', 'من انتم'
      )
    ) {
      return {
        text:
          'Création Ai vous accompagne dans la création de sites web, ' +
          'de publicités et de contenus visuels grâce à des solutions créatives ' +
          'et à l’intelligence artificielle.'
      };
    }

    // Réponse par défaut.
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


  // ======================================
  // ENVOYER UNE QUESTION
  // ======================================

  function handleQuestion(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) return;

    addMessage(cleanQuestion, 'user');

    const answer = getAnswer(cleanQuestion);

    addMessage(answer.text, 'bot');

    // Ajouter un lien si nécessaire.
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


  // ======================================
  // OUVRIR ET FERMER L'ASSISTANT
  // ======================================

  function openChat() {
    chatWindow.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.hidden = true;

    showWelcome();

    input.focus();
  }

  function closeChat() {
    chatWindow.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');

    stopListening();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

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


  // ======================================
  // RECONNAISSANCE VOCALE : MICROPHONE
  // ======================================

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  function stopListening() {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (error) {
        // Le microphone est peut-être déjà arrêté.
      }
    }
  }

  if (micButton) {
    if (!SpeechRecognition) {
      micButton.addEventListener('click', () => {
        setVoiceStatus(
          'La reconnaissance vocale n’est pas disponible dans ce navigateur. ' +
          'Essayez Chrome ou utilisez le clavier.'
        );
      });

      micButton.title = 'Microphone non disponible dans ce navigateur';
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
        setVoiceStatus('Je vous écoute… Parlez maintenant.');
      };

      recognition.onresult = event => {
        const transcript =
          event.results &&
          event.results[0] &&
          event.results[0][0]
            ? event.results[0][0].transcript.trim()
            : '';

        if (!transcript) {
          setVoiceStatus('Je n’ai pas compris. Veuillez réessayer.');
          return;
        }

        // Afficher ce qui a été reconnu.
        input.value = transcript;

        setVoiceStatus('Question reconnue : ' + transcript);

        // Envoyer automatiquement la question reconnue.
        if (typeof chatForm.requestSubmit === 'function') {
          chatForm.requestSubmit();
        } else {
          chatForm.dispatchEvent(
            new Event('submit', {
              bubbles: true,
              cancelable: true
            })
          );
        }

        setVoiceStatus(
          'Votre question a été envoyée. Appuyez sur « Écouter » pour entendre la réponse.'
        );
      };

      recognition.onerror = event => {
        const errors = {
          'not-allowed':
            'Accès au microphone refusé. Autorisez le microphone dans les paramètres du navigateur.',
          'service-not-allowed':
            'Le navigateur n’autorise pas le service de reconnaissance vocale.',
          'no-speech':
            'Aucune parole détectée. Appuyez sur le microphone et réessayez.',
          'audio-capture':
            'Aucun microphone disponible. Vérifiez les paramètres de votre téléphone.',
          'network':
            'Erreur réseau pendant la reconnaissance vocale. Vérifiez votre connexion.',
          'language-not-supported':
            'Cette langue vocale n’est pas prise en charge par le navigateur.'
        };

        setVoiceStatus(
          errors[event.error] ||
          'La reconnaissance vocale a rencontré un problème. Veuillez réessayer.'
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
          setVoiceStatus('Écoute arrêtée.');
          return;
        }

        // Arrêter une éventuelle lecture avant d'écouter.
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }

        recognition.lang = getSelectedLanguage();

        try {
          recognition.start();
        } catch (error) {
          setVoiceStatus(
            'Impossible de démarrer le microphone. Attendez quelques secondes puis réessayez.'
          );
        }
      });
    }
  }


  // ======================================
  // CHANGER LA LANGUE DU MICROPHONE
  // ======================================

  if (languageSelect) {
    languageSelect.addEventListener('change', () => {
      if (recognition && !isListening) {
        recognition.lang = getSelectedLanguage();
      }

      const languageNames = {
        'fr-FR': 'français',
        'ar-TN': 'arabe tunisien',
        'ar-SA': 'arabe'
      };

      setVoiceStatus(
        'Langue du microphone : ' +
        (languageNames[getSelectedLanguage()] || getSelectedLanguage()) +
        '. Appuyez sur le microphone pour parler.'
      );
    });
  }


  // ======================================
  // LECTURE VOCALE DE LA RÉPONSE
  // ======================================

  function getSpeechLanguage(text) {
    // Si la réponse contient de l'arabe, choisir une voix arabe.
    const containsArabic = /[\u0600-\u06FF]/.test(text);

    if (containsArabic) {
      const selected = getSelectedLanguage();

      return selected.startsWith('ar') ? selected : 'ar-TN';
    }

    return 'fr-FR';
  }

  function speakLastResponse() {
    if (!('speechSynthesis' in window)) {
      setVoiceStatus(
        'La lecture vocale n’est pas prise en charge par ce navigateur.'
      );
      return;
    }

    if (!lastBotResponse) {
      setVoiceStatus(
        'Aucune réponse à lire pour le moment. Posez d’abord une question.'
      );
      return;
    }

    // Arrêter la lecture précédente.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(lastBotResponse);

    utterance.lang = getSpeechLanguage(lastBotResponse);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Choisir une voix correspondant à la langue, si disponible.
    const voices = window.speechSynthesis.getVoices();

    const languagePrefix = utterance.lang.toLowerCase().split('-')[0];

    const matchingVoice = voices.find(voice =>
      voice.lang.toLowerCase().startsWith(languagePrefix)
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setVoiceStatus('Lecture vocale en cours…');
    };

    utterance.onend = () => {
      setVoiceStatus('Lecture terminée. Vous pouvez poser une autre question.');
    };

    utterance.onerror = () => {
      setVoiceStatus(
        'La lecture vocale a échoué. Vérifiez que votre navigateur dispose d’une voix installée.'
      );
    };

    window.speechSynthesis.speak(utterance);
  }

  if (speakButton) {
    speakButton.addEventListener('click', speakLastResponse);
  }


  // ======================================
  // ARRÊTER LA LECTURE VOCALE
  // ======================================

  if (stopButton) {
    stopButton.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      stopListening();

      setVoiceStatus('Lecture et écoute arrêtées.');
    });
  }

}