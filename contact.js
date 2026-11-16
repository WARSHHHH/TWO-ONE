/* ============================================================
   TWO/ONE — форма обратной связи (contact.html)

   • Проверка полей с подсказками под каждым полем
   • Отправка в Formspree без перезагрузки страницы
   • Если JavaScript недоступен, форма отправляется обычным POST
   ============================================================ */

(() => {
  'use strict';

  const form = document.getElementById('contactForm');

  if (!form) {
    return;
  }

  const toast = document.getElementById('formToast');
  const success = document.getElementById('formSuccess');
  const submitButton = form.querySelector('.submit-btn');
  const resetButton = document.getElementById('formReset');

  const SEND_TIMEOUT_MS = 15000;
  const TOAST_TIMEOUT_MS = 4500;

  // ---------------- Правила проверки ----------------
  // Каждое правило возвращает текст ошибки или null.

  const rules = {
    name(value) {
      const text = value.trim();

      if (!text) return 'Укажите имя.';
      if (text.length < 2) return 'Имя слишком короткое — минимум 2 символа.';
      if (!/^[\p{L}\s'’-]+$/u.test(text)) {
        return 'Имя может содержать только буквы, пробел и дефис.';
      }

      return null;
    },

    email(value) {
      const text = value.trim();

      if (!text) return 'Укажите email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) {
        return 'Некорректный email. Пример: name@mail.com';
      }

      return null;
    },

    phone(value) {
      const text = value.trim();

      if (!text) return 'Укажите номер телефона.';
      if (!/^[+\d\s\-()]+$/.test(text)) {
        return 'Телефон может содержать только цифры, +, -, пробел и скобки.';
      }

      const digits = text.replace(/\D/g, '');

      if (digits.length < 10 || digits.length > 15) {
        return 'Некорректный номер телефона — от 10 до 15 цифр.';
      }

      return null;
    },

    type(value) {
      return value ? null : 'Выберите, что нужно сделать.';
    },

    message(value) {
      const text = value.trim();

      if (!text) return 'Напишите пару слов о проекте.';
      if (text.length < 10) {
        return 'Расскажите чуть подробнее — минимум 10 символов.';
      }

      return null;
    }
  };

  const fieldNames = Object.keys(rules);

  // ---------------- Работа с полями ----------------

  const getControl = (name) => form.elements[name];

  const getField = (name) => getControl(name).closest('.field');

  const getErrorNode = (name) => document.getElementById(`${name}-error`);

  const setError = (name, message) => {
    const field = getField(name);
    const control = getControl(name);
    const errorNode = getErrorNode(name);

    field.classList.add('has-error');
    control.setAttribute('aria-invalid', 'true');
    errorNode.textContent = message;
    errorNode.hidden = false;
  };

  const clearError = (name) => {
    const field = getField(name);
    const control = getControl(name);
    const errorNode = getErrorNode(name);

    field.classList.remove('has-error');
    control.removeAttribute('aria-invalid');
    errorNode.textContent = '';
    errorNode.hidden = true;
  };

  // Ошибка исчезает, как только человек начинает исправлять поле.
  fieldNames.forEach((name) => {
    const control = getControl(name);

    control.addEventListener('input', () => clearError(name));
    control.addEventListener('change', () => clearError(name));
  });

  // ---------------- Уведомление ----------------

  let toastTimer = 0;

  const showToast = (message, isError = false) => {
    toast.textContent = message;
    toast.classList.toggle('is-error', isError);
    toast.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, TOAST_TIMEOUT_MS);
  };

  const hideToast = () => {
    clearTimeout(toastTimer);
    toast.classList.remove('is-visible');
  };

  // ---------------- Проверка формы ----------------

  const validate = () => {
    let firstInvalid = null;

    fieldNames.forEach((name) => {
      const message = rules[name](getControl(name).value);

      if (message) {
        setError(name, message);

        if (!firstInvalid) {
          firstInvalid = { name, message };
        }
      } else {
        clearError(name);
      }
    });

    return firstInvalid;
  };

  // ---------------- Отправка ----------------

  const setSending = (isSending) => {
    form.dataset.state = isSending ? 'sending' : 'idle';
    submitButton.disabled = isSending;
    submitButton.setAttribute('aria-busy', String(isSending));
  };

  const showSuccess = () => {
    form.hidden = true;
    success.hidden = false;
    success.focus();
    hideToast();
  };

  const showForm = () => {
    success.hidden = true;
    form.hidden = false;
    getControl('name').focus();
  };

  const send = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });

      return response.ok;
    } catch (error) {
      return false;
    } finally {
      clearTimeout(timer);
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (form.dataset.state === 'sending') {
      return;
    }

    const firstInvalid = validate();

    if (firstInvalid) {
      showToast(firstInvalid.message, true);
      getControl(firstInvalid.name).focus();
      return;
    }

    // Скрытое поле-ловушка заполнено — это бот. Делаем вид, что всё ок.
    if (form.elements._gotcha && form.elements._gotcha.value) {
      showSuccess();
      return;
    }

    setSending(true);
    showToast('Отправляем заявку…');

    const isSent = await send();

    setSending(false);

    if (isSent) {
      form.reset();
      showSuccess();
      return;
    }

    showToast(
      'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз или напишите нам в Telegram.',
      true
    );
  });

  if (resetButton) {
    resetButton.addEventListener('click', showForm);
  }
})();
