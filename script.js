const menuButton = document.querySelector('.menu-toggle');
const menuPanel = document.querySelector('.menu-panel');
const menuLabel = document.querySelector('.menu-label');
const menuLinks = [...document.querySelectorAll('.menu-navigation a')];
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setMenu = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  menuPanel.setAttribute('aria-hidden', String(!open));
  menuPanel.inert = !open;
  menuPanel.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuLabel.textContent = open ? 'CLOSE' : 'MENU';
  if (open) menuLinks[0]?.focus({ preventScroll: true });
  else menuButton.focus({ preventScroll: true });
};

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key !== 'Tab') return;
  const focusables = [menuButton, ...menuLinks, ...menuPanel.querySelectorAll('.menu-bottom a')];
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  progress.style.height = `${fraction * 100}%`;
  header.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('resize', updateScroll, { passive: true });
updateScroll();

if ('IntersectionObserver' in window && !reduceMotion) {
  const appear = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -3% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => appear.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cursor = document.querySelector('.cursor-orbit');
  const hero = document.querySelector('.hero');
  const heroGlyph = document.querySelector('.hero-glyph');
  let x = -100, y = -100, cx = -100, cy = -100;
  let active = false;
  window.addEventListener('pointermove', (event) => {
    x = event.clientX; y = event.clientY;
    if (!active) { active = true; cursor.style.opacity = '1'; }
    if (hero.contains(event.target)) {
      const rx = (event.clientX / window.innerWidth - .5) * 18;
      const ry = (event.clientY / window.innerHeight - .5) * 18;
      heroGlyph.style.translate = `${rx}px ${ry}px`;
    }
  }, { passive: true });
  const animateCursor = () => {
    cx += (x - cx) * .2; cy += (y - cy) * .2;
    cursor.style.transform = `translate3d(${cx - cursor.offsetWidth / 2}px,${cy - cursor.offsetHeight / 2}px,0)`;
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);
  document.querySelectorAll('a,button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
  document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
  document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
}
