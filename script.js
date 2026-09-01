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

  const defaultButtonText = isEnglish
    ? "Send booking request"
    : "Lähetä ajanvarauspyyntö";

  let isSubmitting = false;

  if (submitButton) {
    submitButton.disabled = false;
  }

  /* ========================================
     VALIDATION
     ======================================== */

  ["name", "phone"].forEach(function (id) {
    const input = form.elements.namedItem(id);

    if (!input) return;

    input.addEventListener("input", function () {
      input.setCustomValidity(
        input.value.trim()
          ? ""
          : isEnglish
            ? "Please fill in this field."
            : "Täytä tämä kenttä.",
      );
    });
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

      submitButton.textContent = isEnglish ? "Sending..." : "Lähetetään...";
    }

    if (status) {
      status.hidden = true;
    }

    /* ========================================
         FORM DATA
         ======================================== */

    const data = new URLSearchParams();

    ["name", "phone", "email", "service", "wish"].forEach(function (name) {
      const field = form.elements.namedItem(name);

      data.append(name, field ? field.value.trim() : "");
    });

    data.append("website_url", honeypot ? honeypot.value.trim() : "");

    data.append("language", isEnglish ? "en" : "fi");

    data.append("website", "Elvira Beauty & Anti-Stress");

    /* ========================================
         SEND TO GOOGLE APPS SCRIPT
         ======================================== */

    try {
      await fetch(BOOKING_API_URL, {
        method: "POST",
        body: data,
        mode: "no-cors",
      });

      form.reset();

      showStatus(
        "success",
        isEnglish
          ? "Thank you! Your booking request has been sent. Elvira will contact you as soon as possible."
          : "Kiitos! Ajanvarauspyyntösi on lähetetty. Elvira ottaa sinuun yhteyttä mahdollisimman pian.",
      );
    } catch (error) {
      console.error("Booking error:", error);

      showStatus(
        "error",
        isEnglish
          ? "Something went wrong. Please try again or contact us on WhatsApp."
          : "Lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä WhatsAppissa.",
      );
    } finally {
      isSubmitting = false;

      if (submitButton) {
        submitButton.disabled = false;

        submitButton.textContent = defaultButtonText;
      }
    }
  });
})();
