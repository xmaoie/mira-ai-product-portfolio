(() => {
  const root = document.querySelector('[data-figma-walk]');
  if (!root) return;
  const get = name => root.querySelector(`[data-walk-${name}]`);
  const screen = root.querySelector('.figma-editor');
  const viewport = root.querySelector('.figma-walk-viewport');
  const toggle = get('toggle');
  const groups = [...root.querySelectorAll('[data-walk-group]')];
  const steps = [
    '从编辑器的默认状态开始。',
    '点击底部评论图标，进入评论模式。',
    '点击画布中的位置，出现评论输入框。',
    '输入评论，再点击发送。',
    '画布上的标记与右侧评论列表对应。',
    '输入回复，再点击发送。',
    '回复出现在同一条讨论中。',
    '点击 Resolve，将评论标记为已解决。',
    '画布标记消失，右侧保留评论记录。',
    '点击右侧记录，展开已解决的讨论。'
  ];
  const times = [2200, 2600, 1800, 3800, 2300, 3400, 2300, 2700, 2200, 4200];
  let step = 0, elapsed = 0, playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false, timer, lastTick;
  function scale() { screen.style.transform = `scale(${viewport.clientWidth / 1440})`; }
  function render() {
    screen.dataset.walkStage = String(step);
    let action = '';
    if (step === 3 || step === 5) action = elapsed >= 2600 ? 'clicked' : elapsed >= 1500 ? 'send' : 'typing';
    if (step === 7) action = elapsed >= 1300 ? 'clicked' : 'approach';
    if (step === 9) action = elapsed >= 350 ? 'expanded' : 'approach';
    screen.dataset.walkAction = action;
    if (step === 5 && (action === 'send' || action === 'clicked')) {
      const button = screen.querySelector('.fg-reply-box > span:last-child').getBoundingClientRect();
      const frame = screen.getBoundingClientRect();
      const scale = frame.width / 1440;
      screen.style.setProperty('--reply-pointer-x', `${(button.left + button.width / 2 - frame.left) / scale}px`);
      screen.style.setProperty('--reply-pointer-y', `${(button.top + button.height / 2 - frame.top) / scale}px`);
    }
    const chars = step === 3 ? Math.min(6, Math.floor(elapsed / 180)) : 0;
    const replyChars = step === 5 ? Math.min(2, Math.floor(elapsed / 300)) : 0;
    get('draft').textContent = step === 3 ? '这个图片换掉'.slice(0, chars) : 'Add a comment';
    get('reply').textContent = step === 5 ? '好的'.slice(0, replyChars) : 'Reply';
    get('row-meta').textContent = step >= 6 ? '1 reply · 3 minutes ago' : 'A few seconds ago';
    get('description').textContent = steps[step];
    groups.forEach((node, i) => node.classList.toggle('is-current', i === (step < 4 ? 0 : step < 7 ? 1 : 2)));
    toggle.hidden = !playing && step === 9 && elapsed >= times[9];
    toggle.textContent = playing ? '暂停' : '播放';
  }
  function sync() {
    clearInterval(timer); render();
    if (!playing || !visible || document.hidden) return;
    lastTick = performance.now();
    timer = setInterval(() => {
      const now = performance.now();
      elapsed += now - lastTick; lastTick = now;
      if (elapsed >= times[step]) {
        if (step === 9) { elapsed = times[9]; playing = false; clearInterval(timer); }
        else { step += 1; elapsed = 0; }
      }
      render();
    }, 80);
  }
  toggle.addEventListener('click', () => { if (step === 9 && elapsed >= times[9]) { step = 0; elapsed = 0; playing = true; } else playing = !playing; sync(); });
  get('replay').addEventListener('click', () => { step = 0; elapsed = 0; playing = true; sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .15 }).observe(root);
  else visible = true;
  if ('ResizeObserver' in window) new ResizeObserver(scale).observe(viewport);
  else window.addEventListener('resize', scale);
  scale(); sync();
})();
