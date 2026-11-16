/* ============================================================
   TWO/ONE — блок «Команда»

   ВСЕ ДАННЫЕ УЧАСТНИКОВ МЕНЯЮТСЯ ТОЛЬКО ЗДЕСЬ.
   HTML и CSS трогать не нужно.

   Поля участника:
     role      — роль (Designer / Developer / Manager)
     name      — имя; замените YOUR_NAME на настоящее
     position  — должность или специализация
     bio       — короткое описание
     link      — ссылка на профиль или контакт, например
                 "https://t.me/username" или "mailto:me@example.com".
                 Пока стоит ADD_LINK_HERE — кнопка неактивна.
     avatar    — путь к фото, например "img/team/designer.jpg"
                 (квадрат от 256×256 px). Пустая строка — иконка.
     linkLabel — необязательно: текст кнопки (по умолчанию «Связаться»)
   ============================================================ */

const teamMembers = [
  {
    role: "Designer",
    name: "Микки",
    position: "UI/UX · Art direction",
    bio: "Продумывает структуру, визуальный стиль и пользовательский путь. Делает сайт понятным, выразительным и запоминающимся.",
    link: "https://t.me/A3cac",
    avatar: ""
  },
  {
    role: "Developer",
    name: "Даня",
    position: "Frontend · Interaction",
    bio: "Превращает дизайн в работающий сайт: адаптивная вёрстка, анимации, интерактивность и внимание к каждой детали.",
    link: "https://t.me/jkwrtg",
    avatar: ""
  },
  {
    role: "Manager",
    name: "Андрей",
    position: "Project management",
    bio: "Ведёт проект от первого разговора до запуска: сроки, договорённости и общение с заказчиком.",
    link: "https://t.me/andreewlqq",
    avatar: ""
  }
];

/* ------------------------------------------------------------
   Ниже — отрисовка. Обычно редактировать её не нужно.
   ------------------------------------------------------------ */

(() => {
  'use strict';

  const grid = document.getElementById('team-grid');

  if (!grid) {
    return;
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SAFE_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];

  // Возвращает безопасную ссылку или null (заглушка / некорректный адрес).
  const getSafeLink = (value) => {
    try {
      const url = new URL(String(value), window.location.href);
      const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(String(value));

      return isAbsolute && SAFE_PROTOCOLS.includes(url.protocol)
        ? url.href
        : null;
    } catch (error) {
      return null;
    }
  };

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text) {
      element.textContent = text;
    }

    return element;
  };

  const createSvg = (viewBox, markup) => {
    const svg = document.createElementNS(SVG_NS, 'svg');

    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');

    markup.forEach(({ tag, attrs }) => {
      const node = document.createElementNS(SVG_NS, tag);

      Object.entries(attrs).forEach(([key, value]) => {
        node.setAttribute(key, value);
      });

      svg.appendChild(node);
    });

    return svg;
  };

  const createAvatar = (member) => {
    const wrapper = createElement('div', 'member-avatar');

    if (member.avatar) {
      const image = document.createElement('img');

      image.src = member.avatar;
      image.alt = `Фото: ${member.name}`;
      image.width = 176;
      image.height = 176;
      image.loading = 'lazy';
      image.decoding = 'async';
      wrapper.appendChild(image);

      return wrapper;
    }

    wrapper.appendChild(
      createSvg('0 0 24 24', [
        { tag: 'circle', attrs: { cx: '12', cy: '8', r: '4' } },
        { tag: 'path', attrs: { d: 'M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7' } }
      ])
    );

    return wrapper;
  };

  const createLink = (member) => {
    const href = getSafeLink(member.link);
    const label = member.linkLabel || 'Связаться';
    const isReady = href !== null;
    const link = createElement('a', 'btn btn--sm member-link');

    link.appendChild(document.createTextNode(label));
    link.appendChild(
      createSvg('0 0 24 24', [
        { tag: 'path', attrs: { d: 'M5 19 19 5M8 5h11v11' } }
      ])
    );

    if (isReady) {
      link.href = href;
      link.setAttribute('aria-label', `${label}: ${member.name}`);

      if (/^https?:/i.test(href) && new URL(href).origin !== window.location.origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    } else {
      // Ссылка ещё не добавлена: кнопка видна, но неактивна.
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('role', 'link');
      link.tabIndex = -1;
    }

    return link;
  };

  const createCard = (member, index) => {
    const card = createElement(
      'article',
      `member card-surface reveal reveal-delay-${Math.min(index + 1, 3)}`
    );

    card.setAttribute('data-spotlight', '');

    card.appendChild(createAvatar(member));
    card.appendChild(createElement('p', 'member-role', member.role));
    card.appendChild(createElement('h3', 'member-name', member.name));
    card.appendChild(createElement('p', 'member-position', member.position));
    card.appendChild(createElement('p', 'member-bio', member.bio));
    card.appendChild(createLink(member));

    return card;
  };

  const fragment = document.createDocumentFragment();

  teamMembers.forEach((member, index) => {
    fragment.appendChild(createCard(member, index));
  });

  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  grid.appendChild(fragment);
})();