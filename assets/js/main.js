// ========== 导航菜单 ==========
document.addEventListener('DOMContentLoaded', function() {
  // 点击导航链接后自动关闭移动端菜单
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navToggle && navToggle.checked) {
        navToggle.checked = false;
      }
    });
  });

  // 为文章中的代码块添加复制按钮
  const codeBlocks = document.querySelectorAll('.post-content pre');

  codeBlocks.forEach(block => {
    // 跳过已经包装过的代码块
    if (block.parentElement.classList.contains('code-block-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    wrapper.style.position = 'relative';

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '<i class="far fa-copy"></i>';
    button.title = '复制代码';
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 6px 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      color: var(--text-muted);
      font-size: 0.85rem;
      z-index: 10;
    `;

    wrapper.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
    });
    wrapper.addEventListener('mouseleave', () => {
      button.style.opacity = '0';
    });

    button.addEventListener('click', async () => {
      const code = block.querySelector('code') || block;
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.color = 'var(--accent)';
        setTimeout(() => {
          button.innerHTML = '<i class="far fa-copy"></i>';
          button.style.color = 'var(--text-muted)';
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    });

    // 用 wrapper 包裹 pre，让按钮相对于 wrapper 定位
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);
    wrapper.appendChild(button);
  });
});
