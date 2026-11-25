const pageParams = new URLSearchParams(window.location.search);

const deferredImages = new Set(document.querySelectorAll("img[data-src]"));
let deferredImageCheckPending = false;

const checkDeferredImages = () => {
  deferredImageCheckPending = false;
  const preloadMargin = window.innerHeight * 2;

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
  const demoScreen = demoFrame.parentElement;
  const resizeEmbeddedDemo = () => {
    const width = demoScreen.clientWidth;
    if (width) demoScreen.style.setProperty("--demo-scale", width / 390);
  };
  resizeEmbeddedDemo();
  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeEmbeddedDemo).observe(demoScreen);
  } else {
    window.addEventListener("resize", resizeEmbeddedDemo);
  }
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

const workMenu = document.querySelector("[data-work-menu]");
if (workMenu) {
  const trigger = workMenu.querySelector("button");
  const menu = workMenu.querySelector(".work-menu-list");
  const setOpen = (open) => {
    trigger.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
  };
  trigger.addEventListener("click", () => setOpen(menu.hidden));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!workMenu.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      setOpen(false);
      trigger.focus();
    }
  });
}

if (siteNav) {
  const updateNavState = () => {
    siteNav.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateNavState();
  window.addEventListener("scroll", updateNavState, { passive: true });
}

// A compact, complete navigation for small screens across the portfolio.
document.querySelectorAll('.nav-inner').forEach((nav) => {
  if (nav.querySelector('.mobile-nav-toggle')) return;
  const button = document.createElement('button');
  button.className = 'mobile-nav-toggle';
  button.type = 'button';
  button.setAttribute('aria-label', '打开导航菜单');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'mobile-site-menu');
  button.innerHTML = '<span></span><span></span>';
  const menu = document.createElement('div');
  menu.className = 'mobile-site-menu';
  menu.id = 'mobile-site-menu';
  menu.hidden = true;
  menu.innerHTML = `<nav aria-label="手机导航"><a href="index.html#home">首页 <span>Home</span></a><a href="index.html#work">全部作品 <span>Work</span></a><div class="mobile-project-links" role="group" aria-label="全部作品中的项目"><a href="lighting.html">Lighting</a><a href="shopping-buddy.html">AI Shopping Buddy</a><a href="content-space.html">Content Space</a></div><a href="index.html#about">关于我 <span>About</span></a><a href="index.html#contact">联系方式 <span>Contact</span></a><div class="mobile-menu-resources"><a href="documents/profile/%E8%96%9B%E9%93%AD-%E8%A1%A5%E5%85%85%E4%BD%9C%E5%93%81%E9%9B%86-%E4%BA%A7%E5%93%81%E4%BD%93%E9%AA%8C%E8%AE%BE%E8%AE%A1.pdf" target="_blank" rel="noopener noreferrer">补充作品集 PDF ↗</a><a href="documents/profile/resume.pdf" target="_blank" rel="noopener noreferrer">简历 PDF ↗</a></div></nav>`;
  const setOpen = open => { menu.hidden = !open; button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单'); };
  button.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); button.focus(); } });
  document.addEventListener('click', e => { if (!nav.contains(e.target) && !menu.hidden) setOpen(false); });
  nav.append(button, menu);
});

// Start fetching the map before the embedded prototype reaches the viewport.
const locationPreview = document.querySelector('.location-demo-frame');
if (locationPreview && 'IntersectionObserver' in window) {
  const warmMap = new IntersectionObserver((entries, observer) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    const image = new Image();
    image.src = 'demos/store-pickup/assets/store-map.svg';
    observer.disconnect();
  }, { rootMargin: '2200px 0px' });
  warmMap.observe(locationPreview);
}

// Keep the three Content Space views accessible to pointer, touch and keyboard.
const contentStack = document.querySelector('.content-stack');
if (contentStack) {
  const cards = [...contentStack.querySelectorAll('[data-scene]')];
  const controls = [...document.querySelectorAll('[data-scene-control]')];
  const selectScene = scene => {
    contentStack.dataset.active = scene;
    cards.forEach(card => card.classList.toggle('is-active', card.dataset.scene === scene));
    controls.forEach(control => control.setAttribute('aria-pressed', String(control.dataset.sceneControl === scene)));
  };
  cards.forEach(card => {
    card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') selectScene(card.dataset.scene); });
    card.addEventListener('focus', () => selectScene(card.dataset.scene));
    card.addEventListener('click', () => selectScene(card.dataset.scene));
  });
  controls.forEach(control => control.addEventListener('click', () => selectScene(control.dataset.sceneControl)));
}

// A lightweight, pausable walkthrough based on the Comment design states.
const commentDemo = document.querySelector('[data-comment-demo]');
if (commentDemo) {
  const steps = [...commentDemo.querySelectorAll('[data-demo-step]')];
  const frames = [...commentDemo.querySelectorAll('[data-demo-frame]')];
  const toggle = commentDemo.querySelector('[data-demo-toggle]');
  const copy = [
    ['定位问题', '画布中的评论标记对应具体内容，团队可以找到需要讨论的位置。'],
    ['查看讨论', '打开评论后，可以查看讨论内容；右侧列表提供同一条评论的上下文。'],
    ['标记已解决', '处理完成后，评论显示已解决状态，讨论记录仍然保留。']
  ];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, paused = reducedMotion.matches, visible = false, timer;
  const show = n => {
    current = n;
    frames.forEach((frame, i) => { frame.hidden = i !== n; });
    steps.forEach((step, i) => step.setAttribute('aria-pressed', String(i === n)));
    commentDemo.querySelector('[data-demo-title]').textContent = copy[n][0];
    commentDemo.querySelector('[data-demo-description]').textContent = copy[n][1];
  };
  const sync = () => {
    clearInterval(timer);
    toggle.textContent = paused ? '播放演示' : '暂停演示';
    toggle.setAttribute('aria-pressed', String(paused));
    if (!paused && visible && !document.hidden) timer = setInterval(() => show((current + 1) % steps.length), 5500);
  };
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  steps.forEach((step, i) => step.addEventListener('click', () => { show(i); paused = true; sync(); }));
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold:.15}).observe(commentDemo);
  } else { visible = true; sync(); }
  sync();
}
