(function () {
  "use strict";

  const language = document.documentElement.lang.toLowerCase().split("-")[0];
  const menuLabels = {
    fi: { open: "Avaa valikko", close: "Sulje valikko" },
    en: { open: "Open menu", close: "Close menu" },
    ru: { open: "Открыть меню", close: "Закрыть меню" },
  };
  const labels = menuLabels[language] || menuLabels.fi;

  const toggle = document.querySelector(".menu-toggle");

  const nav = document.querySelector(".main-nav");

  function setMenu(open) {
    if (!toggle || !nav) return;

    nav.classList.toggle("open", open);

    toggle.setAttribute("aria-expanded", String(open));

    toggle.setAttribute(
      "aria-label",
      open ? labels.close : labels.open,
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
})();
