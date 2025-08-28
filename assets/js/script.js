document.addEventListener('DOMContentLoaded', () => {
  const gnb = document.querySelector('.gnb');
  const toggleBtn = document.querySelector('.menu-toggle');
  const path = window.location.pathname;
  const isCompany = path.includes('/company/index.html');
  const isMain =
    document.querySelector('#scroll-container') !== null || isCompany;

  if (isCompany) {
    gnb.classList.add('gnb-open');
  }

  let lastScrollY = window.scrollY;

  function handleScroll() {
    if (!isMain) return;

    const currentScroll = window.scrollY;
    gnb.classList.toggle('hidden', currentScroll > lastScrollY);
    gnb.classList.toggle('scrolled', currentScroll > 50);
    lastScrollY = currentScroll;
  }

  /* main visual effect */
  const reveals = document.querySelectorAll('.reveal-on-scroll');

  function onScroll() {
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;

      if (isVisible) {
        el.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', onScroll);

  const htmlEl = document.documentElement;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isActive = gnb.classList.toggle('active');
      htmlEl.classList.toggle('no-scroll', isActive);
      document.body.classList.toggle('no-scroll', isActive);

      const icon = toggleBtn.querySelector('i');
      icon.classList.toggle('bi-list', !isActive);
      icon.classList.toggle('bi-x', isActive);

      if (isCompany) {
        gnb.classList.add('gnb-open');
      } else {
        gnb.classList.toggle('gnb-open', isActive);
      }
    });
  }

  const accordionToggles = document.querySelectorAll('.accordion-toggle');
  accordionToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const submenu = toggle.nextElementSibling;
      const isOpen = submenu.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
    });
  });

  if (!isCompany && window.innerWidth > 1024) {
    gnb.addEventListener('mouseover', (e) => {
      if (!gnb.contains(e.relatedTarget)) {
        gnb.classList.add('gnb-open');
      }
    });
    gnb.addEventListener('mouseout', (e) => {
      if (!gnb.contains(e.relatedTarget)) {
        gnb.classList.remove('gnb-open');
      }
    });
  }

  window.addEventListener('scroll', handleScroll);

  const langItem = document.querySelector('.lang-item');
  const langToggle = langItem?.querySelector('.lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', (e) => {
      e.preventDefault();
      langItem.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!langItem.contains(e.target)) {
        langItem.classList.remove('open');
      }
    });
  }
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();

      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) =>
        p.classList.toggle('active', p.id === tab.dataset.tab)
      );

      if (history.pushState) {
        history.pushState(null, '', '#' + tab.dataset.tab);
      } else {
        location.hash = '#' + tab.dataset.tab;
      }
      const tabBtn = document.querySelector(`[data-tab="${tab.dataset.tab}"]`);
      if (tabBtn) {
        const tabContainer = document.querySelector('.tab-nav .container');
        if (tabContainer) {
          const rect = tabBtn.getBoundingClientRect();
          const containerRect = tabContainer.getBoundingClientRect();
          const scrollLeft =
            tabContainer.scrollLeft + rect.left - containerRect.left - 20; // 좌측 여백 20px

          tabContainer.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
          });
        }
      }
    });
  });
});
