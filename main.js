const pageParams = new URLSearchParams(window.location.search);

const deferredImages = new Set(document.querySelectorAll("img[data-src]"));
let deferredImageCheckPending = false;

const checkDeferredImages = () => {
  deferredImageCheckPending = false;
  const preloadMargin = window.innerHeight;

  deferredImages.forEach((image) => {
    if (image.offsetParent === null) return;
    const bounds = image.getBoundingClientRect();
    if (bounds.bottom < -preloadMargin || bounds.top > window.innerHeight + preloadMargin) return;

    image.src = image.dataset.src;
    image.removeAttribute("data-src");
    deferredImages.delete(image);
  });
};

const scheduleDeferredImageCheck = () => {
  if (deferredImageCheckPending || !deferredImages.size) return;
  deferredImageCheckPending = true;
  window.setTimeout(checkDeferredImages, 0);
};

window.addEventListener("scroll", scheduleDeferredImageCheck, { passive: true });
window.addEventListener("resize", scheduleDeferredImageCheck);
document.addEventListener("click", scheduleDeferredImageCheck);
scheduleDeferredImageCheck();

if (pageParams.get("heroFont") === "pingfang") {
  document.querySelectorAll("a[href]").forEach((link) => {
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.endsWith(".html")) return;

    url.searchParams.set("heroFont", "pingfang");
    link.href = `${url.pathname}${url.search}${url.hash}`;
  });
}

const heroComposition = document.querySelector("[data-hero-composition]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (heroComposition && !reducedMotion.matches) {
  const setCompositionShift = (x, y) => {
    heroComposition.style.setProperty("--composition-a-x", `${x * -7}px`);
    heroComposition.style.setProperty("--composition-a-y", `${y * 6}px`);
    heroComposition.style.setProperty("--composition-b-x", `${x * 9}px`);
    heroComposition.style.setProperty("--composition-b-y", `${y * -4}px`);
    heroComposition.style.setProperty("--composition-c-x", `${x * -5}px`);
    heroComposition.style.setProperty("--composition-c-y", `${y * -7}px`);
    heroComposition.style.setProperty("--composition-d-x", `${x * 8}px`);
    heroComposition.style.setProperty("--composition-d-y", `${y * 3}px`);
    heroComposition.style.setProperty("--composition-e-x", `${x * -6}px`);
    heroComposition.style.setProperty("--composition-e-y", `${y * 4}px`);
    heroComposition.style.setProperty("--composition-f-x", `${x * 11}px`);
    heroComposition.style.setProperty("--composition-f-y", `${y * -10}px`);
  };

  heroComposition.addEventListener("pointermove", (event) => {
    const bounds = heroComposition.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setCompositionShift(x, y);
  });

  heroComposition.addEventListener("pointerleave", () => setCompositionShift(0, 0));
}

document.querySelectorAll("[data-lamp-control]").forEach((control) => {
  const scope = control.closest("[data-lamp-preview]");
  if (!scope) return;

  const buttons = control.querySelectorAll("button");
  const images = scope.querySelectorAll("[data-lamp-state]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const state = button.dataset.state;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      images.forEach((image) => {
        image.classList.toggle("active", image.dataset.lampState === state);
      });
    });
  });
});

document.querySelectorAll("[data-shopping-cases]").forEach((browser) => {
  const tabs = [...browser.querySelectorAll("[data-shopping-case]")];
  const panels = [...browser.querySelectorAll("[data-shopping-case-panel]")];

  const activate = (tab, moveFocus = false) => {
    const selectedCase = tab.dataset.shoppingCase;

    tabs.forEach((item) => {
      const isSelected = item === tab;
      item.setAttribute("aria-selected", String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.shoppingCasePanel !== selectedCase;
    });

    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;

      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;

      event.preventDefault();
      activate(tabs[nextIndex], true);
    });
  });
});

const demoFrame = document.querySelector("[data-demo-frame]");
const demoPlaceholder = document.querySelector("[data-demo-placeholder]");
const demoLoading = document.querySelector("[data-demo-loading]");
const demoLaunchers = document.querySelectorAll("[data-demo-launch]");

if (demoFrame && demoPlaceholder && demoLoading && demoLaunchers.length) {
  let demoStarted = false;
  let demoLoadStarted = false;
  let demoReady = false;

  const ensureDemoLoaded = () => {
    if (demoLoadStarted) return;
    demoLoadStarted = true;
    demoFrame.src = "demos/lighting/index.html?v=20261010-9";
  };

  const startDemo = () => {
    if (demoStarted) return;
    demoStarted = true;
    demoPlaceholder.dataset.hidden = "true";
    demoLoading.hidden = demoReady;
    ensureDemoLoaded();
  };

  demoLaunchers.forEach((button) => button.addEventListener("click", startDemo));
  demoFrame.addEventListener("load", () => {
    demoReady = true;
    demoLoading.hidden = true;
  });

  window.setTimeout(ensureDemoLoaded, 0);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

document.querySelectorAll(".fade-up").forEach((element) => observer.observe(element));

const lightObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("light-visible");
        lightObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll("[data-light-reveal]").forEach((element) => lightObserver.observe(element));

const copyToClipboard = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const temporaryField = document.createElement("textarea");
    temporaryField.value = value;
    temporaryField.setAttribute("readonly", "");
    temporaryField.style.position = "fixed";
    temporaryField.style.opacity = "0";
    document.body.append(temporaryField);
    temporaryField.select();
    const copied = document.execCommand("copy");
    temporaryField.remove();
    return copied;
  }
};

document.querySelectorAll("[data-copy]").forEach((button) => {
  const status = button.querySelector("[data-copy-status]");
  let resetTimer;

  button.addEventListener("click", async () => {
    const copied = await copyToClipboard(button.dataset.copy);
    if (!copied || !status) return;

    window.clearTimeout(resetTimer);
    button.classList.add("copied");
    status.textContent = "Copied";
    resetTimer = window.setTimeout(() => {
      button.classList.remove("copied");
      status.textContent = "Copy";
    }, 1800);
  });
});

const siteNav = document.querySelector(".home-page .nav");

if (siteNav) {
  const updateNavState = () => {
    siteNav.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateNavState();
  window.addEventListener("scroll", updateNavState, { passive: true });
}
