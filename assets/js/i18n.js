(() => {
  const codes = { ko: "KR", en: "EN", ja: "JP" };
  const labels = { ko: "언어 선택", en: "Select language", ja: "言語を選択" };
  const sourceTexts = new WeakMap();
  const sourceAttributes = new WeakMap();
  const sourceLinks = new WeakMap();
  const originalTitle = document.title;
  let language = "ko";
  let initialized = false;
  let picker;
  let toggle;
  let options;

  const normalize = (value) => value.replace(/\s+/g, " ").trim();
  const validLanguage = (value) => {
    const normalized = value === "kr" ? "ko" : value === "jp" ? "ja" : value;
    return Object.hasOwn(codes, normalized) ? normalized : null;
  };
  const translate = (value, target = language) => {
    if (target === "ko") return value;
    return window.SITE_TRANSLATIONS?.[target]?.[normalize(value)] || value;
  };

  function initialLanguage() {
    const query = validLanguage(new URL(window.location.href).searchParams.get("lang"));
    if (query) return query;
    try {
      return validLanguage(window.localStorage.getItem("lkpolymer-language")) || "ko";
    } catch {
      return "ko";
    }
  }

  function closePicker(returnFocus = false) {
    if (!toggle || !options) return;
    options.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }

  function syncMenuLabel() {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    if (menuToggle) {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-label", translate(open ? "전체 메뉴 닫기" : "전체 메뉴 열기"));
    }
  }

  function rememberLanguage() {
    try {
      window.localStorage.setItem("lkpolymer-language", language);
    } catch {
      // URL parameters also preserve the selection when browser storage is unavailable.
    }
    const current = new URL(window.location.href);
    if (language === "ko") current.searchParams.delete("lang");
    else current.searchParams.set("lang", language);
    try {
      window.history.replaceState(window.history.state, "", current.href);
    } catch {
      // Some file previews do not allow history changes.
    }
    document.querySelectorAll("a[href]").forEach((link) => {
      if (!sourceLinks.has(link)) sourceLinks.set(link, link.getAttribute("href"));
      const original = sourceLinks.get(link);
      if (original.startsWith("#")) return;
      const url = new URL(original, window.location.href);
      if (url.origin !== current.origin || !url.pathname.endsWith(".html")) return;
      const [pathname] = original.split(/[?#]/);
      if (language === "ko") url.searchParams.delete("lang");
      else url.searchParams.set("lang", language);
      link.setAttribute("href", `${pathname}${url.search}${url.hash}`);
    });
  }

  function setLanguage(value) {
    const next = validLanguage(value);
    if (!next) return false;
    language = next;
    document.documentElement.lang = next;
    document.title = translate(originalTitle);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest("script, style, noscript, [data-language-picker], [translate='no']")) continue;
      if (!sourceTexts.has(node)) sourceTexts.set(node, node.nodeValue);
      const original = sourceTexts.get(node);
      const translated = translate(original);
      if (translated === original) node.nodeValue = original;
      else node.nodeValue = `${original.match(/^\s*/)[0]}${translated}${original.match(/\s*$/)[0]}`;
    }

    document.querySelectorAll("[alt], [title], [aria-label], [data-image-alt], meta[name='description']").forEach((element) => {
      if (element.closest("[data-language-picker], [translate='no']")) return;
      if (!sourceAttributes.has(element)) sourceAttributes.set(element, new Map());
      const originals = sourceAttributes.get(element);
      for (const attribute of ["alt", "title", "aria-label", "data-image-alt", "content"]) {
        if (!element.hasAttribute(attribute)) continue;
        if (attribute === "content" && element.getAttribute("name") !== "description") continue;
        if (!originals.has(attribute)) originals.set(attribute, element.getAttribute(attribute));
        element.setAttribute(attribute, translate(originals.get(attribute)));
      }
    });

    // The selected gallery image may have changed since the original page was loaded.
    document.querySelectorAll("[data-gallery]").forEach((gallery) => {
      const image = gallery.querySelector("[data-gallery-main]");
      const selected = gallery.querySelector("[data-gallery-thumb].is-active");
      if (image && selected) image.alt = selected.dataset.imageAlt;
    });

    if (toggle) {
      toggle.querySelector("[data-current-language]").textContent = codes[next];
      toggle.setAttribute("aria-label", `${labels[next]} (${codes[next]})`);
      options.setAttribute("aria-label", labels[next]);
      options.querySelectorAll("[data-language]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.language === next));
      });
    }
    syncMenuLabel();
    rememberLanguage();
    closePicker();
    return true;
  }

  function init() {
    if (initialized) return;
    initialized = true;
    picker = document.querySelector("[data-language-picker]");
    toggle = picker?.querySelector("[data-language-toggle]");
    options = picker?.querySelector("[data-language-options]");
    if (toggle && options) {
      const buttons = [...options.querySelectorAll("[data-language]")];
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        options.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        if (open) {
          const menuToggle = document.querySelector("[data-menu-toggle]");
          menuToggle?.setAttribute("aria-expanded", "false");
          document.querySelector("[data-global-menu]")?.classList.remove("is-open");
          syncMenuLabel();
        }
      });
      buttons.forEach((button) => button.addEventListener("click", () => {
        setLanguage(button.dataset.language);
        toggle.focus();
      }));
      picker.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closePicker(true);
          event.preventDefault();
        } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          options.hidden = false;
          toggle.setAttribute("aria-expanded", "true");
          const current = buttons.indexOf(document.activeElement);
          let next = event.key === "End" ? buttons.length - 1 : 0;
          if (event.key === "ArrowDown") next = (current + 1) % buttons.length;
          if (event.key === "ArrowUp") next = current <= 0 ? buttons.length - 1 : current - 1;
          buttons[next].focus();
          event.preventDefault();
        }
      });
      document.addEventListener("pointerdown", (event) => {
        if (!picker.contains(event.target)) closePicker();
      });
      document.addEventListener("focusin", (event) => {
        if (!picker.contains(event.target)) closePicker();
      });
    }
    setLanguage(initialLanguage());
  }

  window.SITE_I18N = { init, setLanguage, getLanguage: () => language, translate, closePicker, syncMenuLabel };
})();
