(() => {
  const root = document.querySelector('[data-delete-walk]');
  if (!root) return;
  const screen = root.querySelector('.fg-deletion');
  const viewport = root.querySelector('.figma-walk-viewport');
  const toggle = root.querySelector('[data-delete-toggle]');
  const description = root.querySelector('[data-delete-description]');
  const groups = [...root.querySelectorAll('[data-delete-group]')];
  const labels = ['查看关联到画布内容的评论。', '关联的内容被删除，评论标记为 Target deleted。', '从右侧列表重新打开评论，继续查看讨论。'];
  const durations = [3000, 3600, 4600];
  let stage = 0, elapsed = 0, playing = !matchMedia('(prefers-reduced-motion: reduce)').matches, visible = false, timer, last;
  function render() {
    screen.dataset.deleteStage = String(stage);
    screen.dataset.deleteAction = stage === 1 && elapsed < 1300 ? 'approach' : stage === 2 && elapsed < 1300 ? 'approach' : 'done';
    description.textContent = labels[stage];
    groups.forEach((node, i) => node.classList.toggle('is-current', i === stage));
    toggle.hidden = !playing && stage === 2 && elapsed >= durations[2];
    toggle.textContent = playing ? '暂停' : '播放';
  }
  function sync() {
    clearInterval(timer); render();
    if (!playing || !visible || document.hidden) return;
    last = performance.now();
    timer = setInterval(() => {
      const now = performance.now(); elapsed += now - last; last = now;
      if (elapsed >= durations[stage]) {
        if (stage === 2) { elapsed = durations[2]; playing = false; clearInterval(timer); }
        else { stage++; elapsed = 0; }
      }
      render();
    }, 80);
  }
  toggle.addEventListener('click', () => { if (stage === 2 && elapsed >= durations[2]) { stage = 0; elapsed = 0; playing = true; } else playing = !playing; sync(); });
  root.querySelector('[data-delete-replay]').addEventListener('click', () => { stage = 0; elapsed = 0; playing = true; sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold:.15 }).observe(root); else visible = true;
  const scale = () => { screen.style.transform = `scale(${viewport.clientWidth / 1440})`; };
  if ('ResizeObserver' in window) new ResizeObserver(scale).observe(viewport); else window.addEventListener('resize', scale);
  scale(); sync();
})();
