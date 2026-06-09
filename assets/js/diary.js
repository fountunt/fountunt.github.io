/* ========== 日记专区 JavaScript ========== */

// ── 密码配置 ──────────────────────────────
// 将密码改为你的专属密码后，运行以下命令获取新 hash：
//   python3 -c "import hashlib; print(hashlib.sha256('你的密码'.encode()).hexdigest())"
// 然后把下面 HASH 的值替换掉。
const DIARY_HASH = 'ebd72b510911af3e254a030cd891cb804e1902189eee7a0f6199472eb5e4dba2';

// ── DOM 引用 ──────────────────────────────
const lockEl = document.getElementById('diary-lock');
const contentEl = document.getElementById('diary-content');
const passwordInput = document.getElementById('diary-password');
const unlockBtn = document.getElementById('diary-unlock-btn');
const errorEl = document.getElementById('diary-error');

// ── 工具：SHA-256 ─────────────────────────
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── 解锁 ────────────────────────────────
async function unlock(password) {
  const hash = await sha256(password);
  if (hash === DIARY_HASH) {
    localStorage.setItem('diary_unlocked', 'true');
    showContent();
    return true;
  }
  return false;
}

function showContent() {
  lockEl.style.display = 'none';
  contentEl.style.display = 'block';
}

function showError() {
  errorEl.classList.add('show');
  passwordInput.value = '';
  passwordInput.focus();
  setTimeout(() => errorEl.classList.remove('show'), 2500);
}

// ── 检查是否已解锁 ──────────────────────
if (localStorage.getItem('diary_unlocked') === 'true') {
  showContent();
}

// ── 解锁事件 ────────────────────────────
unlockBtn.addEventListener('click', async () => {
  const pw = passwordInput.value.trim();
  if (!pw) return;
  const ok = await unlock(pw);
  if (!ok) showError();
});

passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') unlockBtn.click();
});

// ── 日记条目管理 ─────────────────────────
const entriesContainer = document.querySelector('.diary-entries');

// 加载已保存的条目
function loadEntries() {
  const saved = localStorage.getItem('diary_entries');
  if (!saved) return;
  const entries = JSON.parse(saved);
  entriesContainer.innerHTML = '';
  entries.forEach(entry => renderEntry(entry));
}

function getEntries() {
  const cards = entriesContainer.querySelectorAll('.diary-entry');
  return Array.from(cards).map(card => ({
    day: card.querySelector('.diary-entry-day').textContent,
    month: card.querySelector('.diary-entry-month').textContent,
    year: card.querySelector('.diary-entry-year').textContent,
    title: card.querySelector('.diary-entry-title').textContent,
    content: card.querySelector('.diary-entry-text').innerHTML,
  }));
}

function saveEntries() {
  localStorage.setItem('diary_entries', JSON.stringify(getEntries()));
}

function renderEntry(entry) {
  const article = document.createElement('article');
  article.className = 'diary-entry';
  article.innerHTML = `
    <div class="diary-entry-date">
      <span class="diary-entry-day">${entry.day}</span>
      <span class="diary-entry-month">${entry.month}</span>
      <span class="diary-entry-year">${entry.year}</span>
    </div>
    <div class="diary-entry-body">
      <h3 class="diary-entry-title">${entry.title}</h3>
      <div class="diary-entry-text">${entry.content}</div>
      <div class="diary-entry-actions">
        <button onclick="diaryEditEntry(this)" title="编辑">
          <i class="fas fa-edit"></i> 编辑
        </button>
        <button class="diary-btn-delete" onclick="diaryDeleteEntry(this)" title="删除">
          <i class="fas fa-trash"></i> 删除
        </button>
      </div>
    </div>
  `;
  entriesContainer.appendChild(article);
}

// 格式化日期
function pad(n) { return String(n).padStart(2, '0'); }
const MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

// ── 添加新条目 ──────────────────────────
window.diaryAddEntry = function() {
  const now = new Date();
  const title = prompt('日记标题：');
  if (!title || !title.trim()) return;
  const text = prompt('写点什么：');
  if (text === null) return;

  const entry = {
    day: pad(now.getDate()),
    month: MONTHS[now.getMonth()],
    year: String(now.getFullYear()),
    title: title.trim(),
    content: '<p>' + text.trim().replace(/\n/g, '</p><p>') + '</p>',
  };

  // 插入到最前面
  const article = document.createElement('article');
  article.className = 'diary-entry';
  article.innerHTML = `
    <div class="diary-entry-date">
      <span class="diary-entry-day">${entry.day}</span>
      <span class="diary-entry-month">${entry.month}</span>
      <span class="diary-entry-year">${entry.year}</span>
    </div>
    <div class="diary-entry-body">
      <h3 class="diary-entry-title">${entry.title}</h3>
      <div class="diary-entry-text">${entry.content}</div>
      <div class="diary-entry-actions">
        <button onclick="diaryEditEntry(this)" title="编辑">
          <i class="fas fa-edit"></i> 编辑
        </button>
        <button class="diary-btn-delete" onclick="diaryDeleteEntry(this)" title="删除">
          <i class="fas fa-trash"></i> 删除
        </button>
      </div>
    </div>
  `;
  entriesContainer.insertBefore(article, entriesContainer.firstChild);
  saveEntries();
};

// ── 编辑条目 ──────────────────────────
window.diaryEditEntry = function(btn) {
  const body = btn.closest('.diary-entry-body');
  const titleEl = body.querySelector('.diary-entry-title');
  const textEl = body.querySelector('.diary-entry-text');

  const newTitle = prompt('修改标题：', titleEl.textContent);
  if (!newTitle || !newTitle.trim()) return;

  // 把 innerHTML 转回纯文本给 prompt
  const oldText = textEl.innerText;
  const newText = prompt('修改内容：', oldText);
  if (newText === null) return;

  titleEl.textContent = newTitle.trim();
  textEl.innerHTML = '<p>' + newText.trim().replace(/\n/g, '</p><p>') + '</p>';
  saveEntries();
};

// ── 删除条目 ──────────────────────────
window.diaryDeleteEntry = function(btn) {
  if (!confirm('确定删除这篇日记？')) return;
  const entry = btn.closest('.diary-entry');
  entry.remove();
  saveEntries();
};

// ── 加载已保存条目 ─────────────────────
loadEntries();
