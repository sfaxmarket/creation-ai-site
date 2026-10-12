// ======================================
// Création Ai — Script commun à toutes les pages
// ======================================

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------
  // 1. Thème clair / sombre
  // --------------------------------------

  const themeButtons = document.querySelectorAll(
    '.theme-toggle, .color-toggle, #colorToggle, #themeToggle'
  );

  const savedTheme = localStorage.getItem('creationAiTheme');

  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else if (savedTheme === 'dark') {
    document.body.classList.remove('light-theme');
  }

  function updateThemeButtons() {
    const isLight = document.body.classList.contains('light-theme');

    themeButtons.forEach(button => {
      button.textContent = isLight
        ? '🌙 Mode sombre'
        : '☀️ Mode clair';

      button.setAttribute(
        'aria-label',
        isLight
          ? 'Activer le mode sombre'
          : 'Activer le mode clair'
      );

      button.setAttribute('aria-pressed', String(isLight));
    });
  }

  updateThemeButtons();

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');

      localStorage.setItem(
        'creationAiTheme',
        isLight ? 'light' : 'dark'
      );

      updateThemeButtons();
    });
  });

  // --------------------------------------
  // 2. Menu mobile
  // --------------------------------------

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

  // --------------------------------------
  // 3. Année actuelle dans le pied de page
  // --------------------------------------

  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

});


// --------------------------------------
// 4. Ouvrir le formulaire de commande
// --------------------------------------

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


// --------------------------------------
// 5. Fermer le formulaire de commande
// --------------------------------------

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
