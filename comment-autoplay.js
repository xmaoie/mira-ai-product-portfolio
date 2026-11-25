(() => {
  const root = document.querySelector('[data-comment-auto]');
  if (!root) return;
  const find = name => root.querySelector(`[data-auto-${name}]`);
  const screen = root.querySelector('.editor-demo');
  const toggle = find('toggle');
  const steps = [...root.querySelectorAll('[data-auto-step]')];
  const descriptions = ['在画布的具体位置添加评论。','打开评论输入框。','写下需要调整的内容。','评论出现在画布和右侧列表。','点击评论标记，查看讨论。','回复评论，协作推进。','标记已解决：画布标记隐藏，评论仍保留在列表中。'];
  let stage = 0, playing = !matchMedia('(prefers-reduced-motion: reduce)').matches, visible = false, timer = null;
  function paint() {
    screen.dataset.stage = String(stage);
    find('draft-text').textContent = stage === 1 ? 'Add a comment' : '这里的罐子需要换掉';
    find('row-meta').textContent = stage >= 5 ? '1 reply · 1 image' : 'A few seconds ago';
    find('check').textContent = stage === 6 ? '✓' : '◯';
    find('description').textContent = descriptions[stage];
    const current = stage <= 2 ? 0 : stage <= 5 ? 1 : 2;
    steps.forEach((node, i) => node.classList.toggle('is-current', i === current));
    toggle.textContent = playing ? '暂停' : stage === 6 ? '重新播放' : '播放';
  }
  function sync() {
    clearTimeout(timer); paint();
    if (playing && visible && !document.hidden && stage < 6) timer = setTimeout(() => { stage++; sync(); }, 3500);
    if (stage === 6) { playing = false; paint(); }
  }
  toggle.addEventListener('click', () => { if (stage === 6) stage = 0; playing = !playing; sync(); });
  find('replay').addEventListener('click', () => { stage = 0; playing = true; sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold:.15}).observe(root);
  else visible = true;
  sync();
})();
