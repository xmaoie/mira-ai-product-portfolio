(() => {
  const frame = document.querySelector('.location-demo-frame iframe');
  if (!frame || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ready = false;
  let visible = false;
  let interacted = false;
  let played = false;
  const play = () => {
    if (!ready || !visible || interacted || played) return;
    const doc = frame.contentDocument;
    const button = doc?.querySelector('.stage-switch button');
    if (!button) return;
    played = true;
    observer.disconnect();
    doc.body.classList.remove('portfolio-awaiting-tour');
    doc.body.classList.add('portfolio-answer-animation');
    button.click();
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    play();
  }, { threshold: 0.3 });
  observer.observe(frame);

  function prepare() {
    const doc = frame.contentDocument;
    if (!doc || ready) return;
    // A lazy iframe starts at about:blank; wait for its real load event.
    if (doc.URL === 'about:blank') return;
    if (!doc.querySelector('.stage-switch')) {
      setTimeout(prepare, 100);
      return;
    }
    ready = true;
    const style = doc.createElement('style');
    style.textContent = `
      .portfolio-awaiting-tour .answer-card { visibility:hidden; }
      .portfolio-answer-animation .found { display:block; width:0; max-width:100%; overflow:hidden; white-space:nowrap; animation: portfolio-type 1.1s steps(10,end) .15s forwards; }
      .portfolio-answer-animation .answer-card .product,
      .portfolio-answer-animation .answer-card .location-info { animation: portfolio-reveal .55s ease both; }
      .portfolio-answer-animation .answer-card .product { animation-delay: .85s; }
      .portfolio-answer-animation .answer-card .location-info { animation-delay: 1.2s; }
      .portfolio-answer-animation .answer-card .map-preview { animation: portfolio-map-reveal .65s ease 1.9s both; }
      @keyframes portfolio-type { to { width: 100%; } }
      @keyframes portfolio-reveal { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      @keyframes portfolio-map-reveal { from { visibility:hidden; opacity:0; transform:translateY(8px); } to { visibility:visible; opacity:1; transform:translateY(0); } }
    `;
    doc.head.appendChild(style);
    doc.body.classList.add('portfolio-awaiting-tour');
    for (const event of ['pointerdown', 'keydown']) doc.addEventListener(event, () => {
      interacted = true;
      doc.body.classList.remove('portfolio-awaiting-tour');
      doc.body.classList.add('portfolio-answer-animation');
    }, { once: true });
    play();
  }
  frame.addEventListener('load', prepare);
  if (frame.contentDocument?.readyState === 'complete') prepare();
})();
