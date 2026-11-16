/* ============================================================
   TWO/ONE — интерактив сайта

   1. Состояние шапки при прокрутке
   2. Появление блоков при прокрутке
   3. Мобильное меню
   4. Подсветка текущего раздела в навигации
   5. Скрытие мобильного дока у блока «Контакты»
   6. Подсветка карточек за курсором
   7. Год в подвале
   ============================================================ */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const finePointer = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  ).matches;

  const hasObserver = 'IntersectionObserver' in window;

  // ----------------------------------------------------------
  // 1. Шапка получает рамку и фон, когда страница прокручена
  // ----------------------------------------------------------

  const header = document.querySelector('.header');

  if (header && hasObserver) {
    const sentinel = document.createElement('div');

    sentinel.className = 'scroll-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    document.body.prepend(sentinel);

    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }).observe(sentinel);
  }

  // ----------------------------------------------------------
  // 2. Плавное появление блоков (один раз, без постоянного слежения)
  // ----------------------------------------------------------

  const revealItems = document.querySelectorAll('.reveal');

  if (revealItems.length) {
    if (reduceMotion || !hasObserver) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -6% 0px'
        }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  // ----------------------------------------------------------
  // 3. Мобильное меню
  // ----------------------------------------------------------

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');

  if (menuToggle && nav) {
    const desktopQuery = window.matchMedia('(min-width: 901px)');

    const setMenu = (isOpen) => {
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute(
        'aria-label',
        isOpen ? 'Закрыть меню' : 'Открыть меню'
      );
      nav.classList.toggle('is-open', isOpen);
    };

    const isMenuOpen = () =>
      menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.addEventListener('click', () => setMenu(!isMenuOpen()));

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        setMenu(false);
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (
        isMenuOpen() &&
        !nav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isMenuOpen()) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    // При переходе на широкий экран сбрасываем мобильное состояние.
    const onDesktopChange = (event) => {
      if (event.matches) {
        setMenu(false);
      }
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', onDesktopChange);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(onDesktopChange);
    }
  }

  // ----------------------------------------------------------
  // 4. Подсветка раздела, который сейчас на экране (только якоря #...)
  // ----------------------------------------------------------

  const anchorLinks = [...document.querySelectorAll('.nav a[href^="#"]')];

  if (anchorLinks.length && hasObserver) {
    const linkById = new Map();

    anchorLinks.forEach((link) => {
      const section = document.getElementById(link.hash.slice(1));

      if (section) {
        linkById.set(section, link);
      }
    });

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkById.get(entry.target);

          if (!link) {
            return;
          }

          if (entry.isIntersecting) {
            anchorLinks.forEach((item) => item.removeAttribute('aria-current'));
            link.setAttribute('aria-current', 'location');
          } else if (link.getAttribute('aria-current')) {
            link.removeAttribute('aria-current');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    linkById.forEach((link, section) => spy.observe(section));
  }

  // ----------------------------------------------------------
  // 5. Мобильный док не дублирует CTA, когда виден блок «Контакты»
  // ----------------------------------------------------------

  const dock = document.querySelector('.dock');
  const contactSection = document.getElementById('contact');

  if (dock && contactSection && hasObserver) {
    new IntersectionObserver(([entry]) => {
      dock.classList.toggle('is-hidden', entry.isIntersecting);
    }, { threshold: 0.35 }).observe(contactSection);
  }

  // ----------------------------------------------------------
  // 6. Подсветка карточек за курсором (только мышь/трекпад)
  // ----------------------------------------------------------

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-spotlight]').forEach((card) => {
      let frame = 0;
      let x = 0;
      let y = 0;

      const paint = () => {
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        frame = 0;
      };

      card.addEventListener(
        'pointermove',
        (event) => {
          const rect = card.getBoundingClientRect();

          x = event.clientX - rect.left;
          y = event.clientY - rect.top;

          if (!frame) {
            frame = requestAnimationFrame(paint);
          }
        },
        { passive: true }
      );
    });
  }

  // ----------------------------------------------------------
  // 7. Год в подвале
  // ----------------------------------------------------------

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();