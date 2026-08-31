(function () {
  "use strict";
  const isEnglish = document.documentElement.lang === "en";
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", isEnglish
      ? (open ? "Close menu" : "Open menu")
      : (open ? "Sulje valikko" : "Avaa valikko"));
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });
  }

  const form = document.getElementById("bookingForm");
  if (!form) return;
  form.querySelector('button[type="submit"]').disabled = false;
  ["name", "phone"].forEach(function (id) {
    const input = form.elements.namedItem(id);
    if (!input) return;
    input.addEventListener("input", function () {
      input.setCustomValidity(input.value.trim() ? "" : (isEnglish
        ? "Please fill in this field." : "Täytä tämä kenttä."));
    });
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    function value(name) {
      const field = form.elements.namedItem(name);
      return field ? field.value.trim() : "";
    }
    const labels = isEnglish
      ? { greeting: "Hello! I would like to book an appointment.", name: "Name", phone: "Phone", email: "Email", service: "Treatment", wish: "Message" }
      : { greeting: "Hei! Haluaisin varata ajan.", name: "Nimi", phone: "Puhelin", email: "Sähköposti", service: "Hoito", wish: "Viesti" };
    const lines = [labels.greeting, ""];
    ["name", "phone", "email", "service", "wish"].forEach(function (name) {
      const text = value(name);
      if (text) lines.push(labels[name] + ": " + text);
    });
    // Only opens a draft: the customer reviews and sends it in WhatsApp.
    // Same-tab navigation avoids popup blockers on mobile browsers.
    window.location.assign("https://wa.me/358469567403?text=" + encodeURIComponent(lines.join("\n")));
  });
})();
