
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

// Afficher l'année actuelle
const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

// Ouvrir le formulaire de commande
function openOrder(service) {
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
}

// Retour aux services
function closeOrder() {
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
}
