document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-global-menu]");
  const content = window.SITE_CONTENT || {};
  const pageKey = document.body.dataset.page;
  const common = content.common || {};
  const page = (content.pages && content.pages[pageKey]) || {};

  document.querySelectorAll("[data-text-key]").forEach((element) => {
    const key = element.dataset.textKey;
    const value = page[key] ?? common[key];

    if (value) {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-html-key]").forEach((element) => {
    const key = element.dataset.htmlKey;
    const value = page[key] ?? common[key];

    if (value) {
      element.innerHTML = value;
    }
  });

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      menu.classList.toggle("is-open", !isOpen);
    });
  }

  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const mainImage = gallery.querySelector("[data-gallery-main]");
    const thumbs = gallery.querySelectorAll("[data-gallery-thumb]");

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const src = thumb.dataset.imageSrc;
        const alt = thumb.dataset.imageAlt || "";

        if (mainImage && src) {
          mainImage.src = src;
          mainImage.alt = alt;
        }

        thumbs.forEach((item) => item.classList.remove("is-active"));
        thumb.classList.add("is-active");
      });
    });
  });
});
