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
    scheduleWhatsApp();

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

  // Keep the original WhatsApp pill floating only where it cannot cover content.
  // The footer dock is also the accessible, no-JavaScript fallback.
  const whatsapp = document.querySelector(".wa-float");
  const footer = document.querySelector("footer");
  const main = document.querySelector("main");
  let whatsappFrame = 0;
  let refreshObstacles = true;
  let obstacles = [];

  function scheduleWhatsApp(refresh = false) {
    refreshObstacles = refreshObstacles || refresh;
    if (whatsappFrame) return;
    whatsappFrame = requestAnimationFrame(positionWhatsApp);
  }

  function positionWhatsApp() {
    whatsappFrame = 0;
    if (!whatsapp || !footer || !main) return;

    const gap = 12;
    const edge = window.innerWidth <= 760 ? 12 : 20;
    const pill = whatsapp.getBoundingClientRect();
    const left = window.innerWidth - edge - pill.width;
    const right = window.innerWidth - edge;
    const headerBottom = document.querySelector(".site-header").getBoundingClientRect().bottom;
    let top = window.innerHeight - edge - pill.height;

    if (refreshObstacles) {
      obstacles = Array.from(main.querySelectorAll("*")).filter(function (element) {
        return element.matches("a, button, input, select, textarea, img, svg") ||
          Array.from(element.childNodes).some(function (node) {
            return node.nodeType === Node.TEXT_NODE && /\S/.test(node.textContent);
          });
      }).flatMap(function (element) {
        return Array.from(element.getClientRects()).map(function (rect) {
          return { left: rect.left, right: rect.right,
            top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
        });
      });
      refreshObstacles = false;
    }

    const footerVisible = footer.getBoundingClientRect().top < window.innerHeight + gap;
    const menuOpen = toggle && toggle.getAttribute("aria-expanded") === "true";
    if (!footerVisible && !menuOpen) {
      // Start at the original bottom-right position and move above collisions.
      const column = obstacles.filter(function (rect) {
        return rect.right > left - gap && rect.left < right + gap;
      });
      let collision;
      do {
        collision = column.find(function (rect) {
          return rect.bottom - window.scrollY > top - gap &&
            rect.top - window.scrollY < top + pill.height + gap;
        });
        if (collision) top = collision.top - window.scrollY - pill.height - gap;
      } while (collision && top >= headerBottom + gap);
    }

    const float = !footerVisible && !menuOpen && top >= headerBottom + gap;
    const wasFloating = whatsapp.classList.contains("is-floating");
    whatsapp.style.setProperty("--wa-top", top + "px");
    whatsapp.style.setProperty("--wa-edge", edge + "px");
    whatsapp.classList.toggle("is-floating", float);
    if (!float && wasFloating && document.activeElement === whatsapp) {
      whatsapp.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
  }

  if (whatsapp && footer && main) {
    window.addEventListener("scroll", function () { scheduleWhatsApp(); }, { passive: true });
    window.addEventListener("resize", function () { scheduleWhatsApp(true); });
    window.addEventListener("load", function () { scheduleWhatsApp(true); });
    main.addEventListener("load", function () { scheduleWhatsApp(true); }, true);
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(function () { scheduleWhatsApp(true); });
      observer.observe(main);
    }
    document.fonts.ready.then(function () { scheduleWhatsApp(true); });
    scheduleWhatsApp(true);
  }
})();
