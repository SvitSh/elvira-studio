const BOOKING_API_URL =
  "https://script.google.com/macros/s/AKfycbxCDT0ee6VuzgiBv_HcxDOS84yWJ6gKn9hbyFMJG1Y-fZ182WQEYz22ePcl4mbACtxM/exec";

(function () {
  "use strict";

  const isEnglish = document.documentElement.lang === "en";

  const toggle = document.querySelector(".menu-toggle");

  const nav = document.querySelector(".main-nav");

  function setMenu(open) {
    if (!toggle || !nav) return;

    nav.classList.toggle("open", open);

    toggle.setAttribute("aria-expanded", String(open));

    toggle.setAttribute(
      "aria-label",
      isEnglish
        ? open
          ? "Close menu"
          : "Open menu"
        : open
          ? "Sulje valikko"
          : "Avaa valikko",
    );
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        setMenu(false);
      }
    });
  }

  /* ========================================
     BOOKING FORM
     ======================================== */

  const form = document.getElementById("bookingForm");

  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  const status = form.querySelector(".form-status");

  const language = document.documentElement.lang.toLowerCase().split("-")[0];
  const messages = {
    fi: {
      title: "Kiitos!",
      success: "Ajanvarauspyyntösi on lähetetty. Elvira ottaa sinuun yhteyttä mahdollisimman pian.",
      close: "Sulje",
      required: "Täytä tämä kenttä.",
      consent: "Hyväksy tietosuojaseloste jatkaaksesi.",
      email: "Anna kelvollinen sähköpostiosoite.",
      sending: "Lähetetään...",
      error: "Lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä WhatsAppissa.",
    },
    en: {
      title: "Thank you!",
      success: "Your booking request has been sent. Elvira will contact you as soon as possible.",
      close: "Close",
      required: "Please fill in this field.",
      consent: "Please accept the privacy policy to continue.",
      email: "Please enter a valid email address.",
      sending: "Sending...",
      error: "Something went wrong. Please try again or contact us on WhatsApp.",
    },
    ru: {
      title: "Спасибо!",
      success: "Ваш запрос на запись отправлен. Эльвира свяжется с вами как можно скорее.",
      close: "Закрыть",
      required: "Заполните это поле.",
      consent: "Примите политику конфиденциальности, чтобы продолжить.",
      email: "Введите корректный адрес электронной почты.",
      sending: "Отправка...",
      error: "Не удалось отправить запрос. Попробуйте ещё раз или свяжитесь с нами в WhatsApp.",
    },
  };
  const copy = messages[language] || messages.fi;
  const defaultButtonText = submitButton ? submitButton.textContent.trim() : "";
  let isSubmitting = false;

  if (submitButton) submitButton.disabled = false;

  // Native modal dialogs contain keyboard focus and make the page inert.
  const dialog = document.createElement("dialog");
  dialog.className = "booking-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "booking-dialog-title");
  dialog.setAttribute("aria-describedby", "booking-dialog-message");
  dialog.innerHTML = `
    <button type="button" class="booking-dialog-close">×</button>
    <h2 id="booking-dialog-title"></h2>
    <p id="booking-dialog-message"></p>
    <button type="button" class="btn btn-primary" autofocus></button>
  `;
  dialog.querySelector("h2").textContent = copy.title;
  dialog.querySelector("p").textContent = copy.success;
  dialog.querySelector(".booking-dialog-close").setAttribute("aria-label", copy.close);
  dialog.querySelector(".btn").textContent = copy.close;
  dialog.querySelectorAll("button").forEach(function (button) {
    button.addEventListener("click", function () { dialog.close(); });
  });
  dialog.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;
    const first = dialog.querySelector(".booking-dialog-close");
    const last = dialog.querySelector(".btn");
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  let backdropPointerDown = false;
  function isOutsideDialog(event) {
    const rect = dialog.getBoundingClientRect();
    return event.target === dialog && (
      event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom
    );
  }
  dialog.addEventListener("pointerdown", function (event) {
    backdropPointerDown = isOutsideDialog(event);
  });
  dialog.addEventListener("click", function (event) {
    if (backdropPointerDown && isOutsideDialog(event)) dialog.close();
    backdropPointerDown = false;
  });
  dialog.addEventListener("close", function () {
    if (submitButton) submitButton.focus({ preventScroll: true });
  });
  document.body.append(dialog);

  function showSuccessDialog() {
    if (status) {
      status.hidden = true;
      status.textContent = "";
      status.className = "form-status";
    }
    dialog.showModal();
  }

  // Translate native validation even before a field has been edited.
  form.querySelectorAll("input, select, textarea").forEach(function (input) {
    function validate() {
      input.setCustomValidity("");
      if (input.required && (input.type === "checkbox" ? !input.checked : !input.value.trim())) {
        input.setCustomValidity(input.type === "checkbox" ? copy.consent : copy.required);
      } else if (input.validity.typeMismatch) {
        input.setCustomValidity(copy.email);
      }
    }
    input.addEventListener("input", validate);
    input.addEventListener("change", validate);
    input.addEventListener("invalid", validate);
  });

  /* ========================================
     STATUS MESSAGE
     ======================================== */

  function showStatus(type, message) {
    if (!status) return;

    status.className = "form-status " + type;

    status.textContent = message;

    status.hidden = false;
  }

  /* ========================================
     FORM SUBMIT
     ======================================== */

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isSubmitting || !form.reportValidity()) {
      return;
    }

    const honeypot = form.elements.namedItem("website_url");

    if (honeypot && honeypot.value.trim()) {
      return;
    }

    isSubmitting = true;

    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = copy.sending;
    }

    showStatus("pending", copy.sending);

    /* ========================================
         FORM DATA
         ======================================== */

    const data = new URLSearchParams();

    ["name", "phone", "email", "service", "wish"].forEach(function (name) {
      const field = form.elements.namedItem(name);

      data.append(name, field ? field.value.trim() : "");
    });

    data.append("website_url", honeypot ? honeypot.value.trim() : "");

    data.append("language", messages[language] ? language : "fi");

    data.append("website", "Elvira Beauty & Anti-Stress");

    /* ========================================
         SEND TO GOOGLE APPS SCRIPT
         ======================================== */

    try {
      const response = await fetch(BOOKING_API_URL, {
        method: "POST",
        body: data,
        // URLSearchParams keeps this a simple CORS request (no preflight).
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("Booking HTTP error: " + response.status);
      }

      const result = await response.json();
      if (!result || result.success !== true) {
        throw new Error("Booking request was not confirmed.");
      }

      form.reset();
      showSuccessDialog();
    } catch (error) {
      console.error("Booking error:", error);

      showStatus("error", copy.error);
    } finally {
      isSubmitting = false;

      if (submitButton) {
        submitButton.disabled = false;

        submitButton.textContent = defaultButtonText;
      }
    }
  });
})();
