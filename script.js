// ============================================================
// TWO/ONE — интерактив сайта
// ============================================================

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const clamp = (value, min = -1, max = 1) =>
  Math.max(min, Math.min(max, value));

// ============================================================
// 1. 3D-наклон главного окна
// ============================================================

const stage = document.querySelector('.stage');
const win = document.querySelector('.window');

if (stage && win && !reduceMotion) {
  let raf = 0;

  let targetNx = 0;
  let targetNy = 0;

  let currentNx = 0;
  let currentNy = 0;

  const startTime = performance.now();

  const render = (now) => {
    const time = (now - startTime) / 1000;

    currentNx += (targetNx - currentNx) * 0.12;
    currentNy += (targetNy - currentNy) * 0.12;

    const ty = Math.sin(time * 0.7) * 4.5;

    stage.style.setProperty('--nx', currentNx.toFixed(3));
    stage.style.setProperty('--ny', currentNy.toFixed(3));

    stage.style.setProperty(
      '--ry',
      `${currentNx * 25}deg`
    );

    stage.style.setProperty(
      '--rx',
      `${-currentNy * 18}deg`
    );

    stage.style.setProperty(
      '--ty',
      `${ty.toFixed(2)}px`
    );

    raf = requestAnimationFrame(render);
  };

  const move = (event) => {
    const rect = stage.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    targetNx = clamp(
      ((event.clientX - rect.left) / rect.width) * 2 - 1
    );

    targetNy = clamp(
      ((event.clientY - rect.top) / rect.height) * 2 - 1
    );
  };

  const reset = () => {
    targetNx = 0;
    targetNy = 0;
  };

  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerdown', move);
  stage.addEventListener('pointerleave', reset);
  stage.addEventListener('pointercancel', reset);

  raf = requestAnimationFrame(render);
}

// ============================================================
// 2. Зелёное свечение за курсором
// ============================================================

const glow = document.querySelector('.cursor-glow');

if (
  glow &&
  !reduceMotion &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches
) {
  let raf = 0;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;

  let currentX = targetX;
  let currentY = targetY;

  const render = () => {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;

    glow.style.setProperty('--gx', `${currentX}px`);
    glow.style.setProperty('--gy', `${currentY}px`);

    const distanceX = Math.abs(targetX - currentX);
    const distanceY = Math.abs(targetY - currentY);

    if (distanceX > 0.5 || distanceY > 0.5) {
      raf = requestAnimationFrame(render);
    } else {
      raf = 0;
    }
  };

  const move = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;

    glow.classList.add('is-active');

    if (!raf) {
      raf = requestAnimationFrame(render);
    }
  };

  const leave = () => {
    glow.classList.remove('is-active');
  };

  window.addEventListener('pointermove', move, {
    passive: true
  });

  document.addEventListener('mouseleave', leave);
  window.addEventListener('blur', leave);
}

// ============================================================
// 3. Появление элементов при прокрутке
// ============================================================

const reveals = document.querySelectorAll('.reveal');

if (reveals.length && !reduceMotion) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');

            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
      }
    );

    reveals.forEach((element) => {
      observer.observe(element);
    });
  } else {
    // Запасной вариант для старых браузеров.
    reveals.forEach((element) => {
      element.classList.add('is-visible');
    });
  }
} else {
  // При отключённых анимациях контент сразу виден.
  reveals.forEach((element) => {
    element.classList.add('is-visible');
  });
}

// ============================================================
// 4. 3D-наклон карточек проектов
// ============================================================

const cards = document.querySelectorAll('a.card');

if (
  cards.length &&
  !reduceMotion &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches
) {
  const MAX_TILT = 8;
  const PARALLAX = 18;

  cards.forEach((card) => {
    const shot = card.querySelector('.card-shot');

    let raf = 0;

    let targetNx = 0;
    let targetNy = 0;

    let currentNx = 0;
    let currentNy = 0;

    const render = () => {
      currentNx += (targetNx - currentNx) * 0.15;
      currentNy += (targetNy - currentNy) * 0.15;

      card.style.setProperty(
        '--card-ry',
        `${currentNx * MAX_TILT}deg`
      );

      card.style.setProperty(
        '--card-rx',
        `${-currentNy * MAX_TILT}deg`
      );

      card.style.setProperty('--card-ty', '-4px');

      if (shot) {
        shot.style.setProperty(
          '--card-inner-x',
          `${-currentNx * PARALLAX}px`
        );

        shot.style.setProperty(
          '--card-inner-y',
          `${-currentNy * PARALLAX}px`
        );
      }

      const distanceX = Math.abs(targetNx - currentNx);
      const distanceY = Math.abs(targetNy - currentNy);

      if (distanceX > 0.001 || distanceY > 0.001) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    const move = (event) => {
      const rect = card.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      targetNx = clamp(
        ((event.clientX - rect.left) / rect.width) * 2 - 1
      );

      targetNy = clamp(
        ((event.clientY - rect.top) / rect.height) * 2 - 1
      );

      if (!raf) {
        raf = requestAnimationFrame(render);
      }
    };

    const leave = () => {
      targetNx = 0;
      targetNy = 0;

      if (!raf) {
        raf = requestAnimationFrame(render);
      }
    };

    card.addEventListener('pointerenter', move);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
  });
}

// ============================================================
// 5. Мобильное меню
// ============================================================

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

if (menuToggle && mainNav) {
  const setMenuState = (isOpen) => {
    menuToggle.setAttribute(
      'aria-expanded',
      String(isOpen)
    );

    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Закрыть меню' : 'Открыть меню'
    );

    mainNav.classList.toggle('is-open', isOpen);
  };

  menuToggle.addEventListener('click', () => {
    const isOpen =
      menuToggle.getAttribute('aria-expanded') === 'true';

    setMenuState(!isOpen);
  });

  // Закрываем меню после перехода по ссылке.
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  // При переходе на большой экран сбрасываем мобильное меню.
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 901px)').matches) {
      setMenuState(false);
    }
  });

  // Закрываем меню клавишей Escape.
  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      menuToggle.getAttribute('aria-expanded') === 'true'
    ) {
      setMenuState(false);
      menuToggle.focus();
    }
  });
}
