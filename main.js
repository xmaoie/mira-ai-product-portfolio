const pageParams = new URLSearchParams(window.location.search);

if (pageParams.get("heroFont") === "pingfang") {
  document.querySelectorAll("a[href]").forEach((link) => {
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.endsWith(".html")) return;

    url.searchParams.set("heroFont", "pingfang");
    link.href = `${url.pathname}${url.search}${url.hash}`;
  });
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

  const startDemo = () => {
    if (demoStarted) return;
    demoStarted = true;
    demoLoading.hidden = false;
    demoPlaceholder.dataset.hidden = "true";
    demoFrame.src = "demos/lighting/index.html?v=20261008-1";
  };

  demoLaunchers.forEach((button) => button.addEventListener("click", startDemo));
  demoFrame.addEventListener("load", () => {
    demoLoading.hidden = true;
  });
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
