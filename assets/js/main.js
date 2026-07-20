/* ============================================================
   REDMIA — main.js
   Interacciones: menú móvil, scroll header, accordion, año.
   JS vanilla, sin dependencias.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Año dinámico en el footer ---------- */
  function setYear() {
    var els = document.querySelectorAll("[data-year]");
    var y = new Date().getFullYear();
    els.forEach(function (el) { el.textContent = y; });
  }

  /* ---------- Header: sombra al hacer scroll ---------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menú móvil off-canvas ---------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav__toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    var overlay = document.querySelector(".nav-overlay");
    var closeBtn = document.querySelector(".mobile-nav__close");
    if (!toggle || !mobileNav || !overlay) return;

    function open() {
      mobileNav.classList.add("is-open");
      overlay.classList.add("is-open");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");
    }
    function close() {
      mobileNav.classList.remove("is-open");
      overlay.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
    }

    toggle.addEventListener("click", function () {
      if (mobileNav.classList.contains("is-open")) close();
      else open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);

    // Cerrar con tecla Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) close();
    });

    // Cerrar al hacer click en un enlace del menú móvil
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });
  }

  /* ---------- Acordeón (estatutos / FAQ) ---------- */
  function initAccordion() {
    var triggers = document.querySelectorAll(".accordion__trigger");
    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        var panel = trigger.nextElementSibling;

        // Cerrar los demás (opcional: comportamiento exclusivo)
        var group = trigger.closest(".accordion");
        if (group) {
          group.querySelectorAll(".accordion__trigger").forEach(function (t) {
            if (t !== trigger) {
              t.setAttribute("aria-expanded", "false");
              var p = t.nextElementSibling;
              if (p) p.style.maxHeight = null;
            }
          });
        }

        trigger.setAttribute("aria-expanded", String(!expanded));
        if (!expanded) {
          panel.style.maxHeight = panel.scrollHeight + "px";
        } else {
          panel.style.maxHeight = null;
        }
      });
    });

    // Recalcular altura al redimensionar
    window.addEventListener("resize", function () {
      document.querySelectorAll('.accordion__trigger[aria-expanded="true"]').forEach(function (t) {
        var p = t.nextElementSibling;
        if (p) p.style.maxHeight = p.scrollHeight + "px";
      });
    }, { passive: true });
  }

  /* ---------- Marcar enlace activo ---------- */
  function markActiveNav() {
    var current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav__link, .dropdown__link, .mobile-nav__link").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === current) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- Formulario: feedback básico ---------- */
  function initForms() {
    document.querySelectorAll("form[data-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        // Si es un formulario de Netlify, dejar que Netlify lo procese.
        // Aquí sólo mostramos feedback de envío si no es redirección.
        var status = form.querySelector(".form__status");
        if (status && form.checkValidity()) {
          // Para Netlify forms con action, dejamos que el navegador envíe.
        }
      });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    setYear();
    initHeaderScroll();
    initMobileNav();
    initAccordion();
    markActiveNav();
    initForms();
  });
})();
