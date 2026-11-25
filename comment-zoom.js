(() => {
  const walks = document.querySelectorAll('.content-space-page .figma-walk');
  walks.forEach((walk, index) => {
    const controls = walk.querySelector('.figma-walk-actions');
    const viewport = walk.querySelector('.figma-walk-viewport');
    if (!controls || !viewport || typeof HTMLDialogElement === 'undefined') return;
    const home = viewport.parentElement;
    const marker = document.createComment('comment demo position');
    home.insertBefore(marker, viewport);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'comment-zoom-open';
    button.textContent = '放大查看细节';
    button.setAttribute('aria-haspopup', 'dialog');
    const dialog = document.createElement('dialog');
    dialog.className = 'comment-zoom-dialog';
    dialog.setAttribute('aria-label', index === 0 ? '评论演示细节' : '关联内容删除后的演示细节');
    dialog.innerHTML = '<div class="comment-zoom-head"><div><strong>评论演示细节</strong><p>完整画面自动适应屏幕</p></div><button type="button" class="comment-zoom-close" aria-label="关闭放大视图">关闭</button></div><div class="comment-zoom-scroll"></div>';
    document.body.appendChild(dialog);
    controls.appendChild(button);
    const target = dialog.querySelector('.comment-zoom-scroll');
    const close = dialog.querySelector('.comment-zoom-close');
    function restore() { marker.after(viewport); button.focus({preventScroll:true}); }
    button.addEventListener('click', () => {
      target.appendChild(viewport);
      try { dialog.showModal(); } catch (_) { marker.after(viewport); return; }
      close.focus({preventScroll:true});
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', restore);
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  });
})();
