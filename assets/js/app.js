const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.progress-bar');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const revealItems = document.querySelectorAll('.reveal');
const filterButtons = [...document.querySelectorAll('.filter-button')];
const workCards = [...document.querySelectorAll('.work-card')];
const modal = document.getElementById('workModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDiscipline = document.getElementById('modalDiscipline');
const modalYear = document.getElementById('modalYear');
const modalDescription = document.getElementById('modalDescription');
const toast = document.getElementById('toast');
const counters = [...document.querySelectorAll('[data-count]')];
const contactForm = document.getElementById('contactForm');

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}

updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('is-open', !expanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
    });
  });

  document.addEventListener('click', (event) => {
    if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
    }
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16,
  rootMargin: '0px 0px -8% 0px'
});

revealItems.forEach((item) => revealObserver.observe(item));

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  });
}, {
  threshold: 0.34,
  rootMargin: '-35% 0px -45% 0px'
});

sections.forEach((section) => navObserver.observe(section));

let countersAnimated = false;
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || countersAnimated) return;
    countersAnimated = true;
    counters.forEach((counter) => animateCounter(counter));
  });
}, { threshold: 0.55 });

const metricList = document.querySelector('.hero-metrics');
if (metricList) counterObserver.observe(metricList);

function animateCounter(el) {
  const target = Number(el.dataset.count || 0);
  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));

    workCards.forEach((card) => {
      const category = card.dataset.category || '';
      const visible = filter === 'all' || category.includes(filter);
      card.classList.toggle('is-hidden', !visible);
      card.setAttribute('aria-hidden', String(!visible));
      card.tabIndex = visible ? 0 : -1;
    });
  });
});

function openModal(card) {
  modalImage.src = card.dataset.image;
  modalImage.alt = card.querySelector('img')?.alt || '';
  modalTitle.textContent = card.dataset.title || '';
  modalDiscipline.textContent = card.dataset.discipline || '';
  modalYear.textContent = card.dataset.year ? `${card.dataset.year}` : '';
  modalDescription.textContent = card.dataset.description || '';
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

workCards.forEach((card) => {
  card.addEventListener('click', () => {
    if (card.classList.contains('is-hidden')) return;
    openModal(card);
  });

  card.addEventListener('keydown', (event) => {
    if (card.classList.contains('is-hidden')) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(card);
    }
  });
});

modal?.addEventListener('click', (event) => {
  if (event.target.matches('[data-close-modal]')) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeModal();
});

document.querySelectorAll('.glow-surface').forEach((surface) => {
  surface.addEventListener('pointermove', (event) => {
    const rect = surface.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    surface.style.setProperty('--mx', `${x}%`);
    surface.style.setProperty('--my', `${y}%`);
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2200);
}

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const payload = [
    '[Leon Kang Portfolio Demo Inquiry]',
    `이름: ${formData.get('name') || '-'}`,
    `이메일: ${formData.get('email') || '-'}`,
    `유형: ${formData.get('project') || '-'}`,
    `메시지: ${formData.get('message') || '-'}`
  ].join('\n');

  const status = contactForm.querySelector('.form-status');

  try {
    await navigator.clipboard.writeText(payload);
    status.textContent = '문의 템플릿이 클립보드에 복사되었습니다.';
    showToast('문의 템플릿이 복사되었습니다.');
    contactForm.reset();
  } catch (error) {
    status.textContent = '클립보드 접근이 막혀 있어 복사에 실패했습니다.';
    showToast('복사 권한이 필요합니다.');
  }
});
