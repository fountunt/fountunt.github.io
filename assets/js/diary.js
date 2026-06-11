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

// ── 纯 JS SHA-256（不依赖浏览器 crypto.subtle） ──
function sha256(text) {
  const chrsz = 8;
  function safe_add(x, y) {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    return ((x >>> 16) + (y >>> 16) + (lsw >>> 16)) << 16 | (lsw & 0xFFFF);
  }
  function S(X, n) { return (X >>> n) | (X << (32 - n)); }
  function R(X, n) { return X >>> n; }
  function Ch(x, y, z) { return (x & y) ^ (~x & z); }
  function Maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
  function Sigma0256(x) { return S(x, 2) ^ S(x, 13) ^ S(x, 22); }
  function Sigma1256(x) { return S(x, 6) ^ S(x, 11) ^ S(x, 25); }
  function Gamma0256(x) { return S(x, 7) ^ S(x, 18) ^ R(x, 3); }
  function Gamma1256(x) { return S(x, 17) ^ S(x, 19) ^ R(x, 10); }
  const K = [
    0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,
    0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,
    0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,
    0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,
    0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,
    0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,
    0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,
    0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2
  ];
  function str2binb(str) {
    const bin = [];
    const mask = (1 << chrsz) - 1;
    for (let i = 0; i < str.length * chrsz; i += chrsz)
      bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
    return bin;
  }
  function binb2hex(binarray) {
    const hex_tab = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
             hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
    }
    return str;
  }
  function core_sha256(m, l) {
    const H = [0x6A09E667,0xBB67AE85,0x3C6EF372,0xA54FF53A,0x510E527F,0x9B05688C,0x1F83D9AB,0x5BE0CD19];
    const W = [];
    let a, b, c, d, e, f, g, h, T1, T2;
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >> 9) << 4) + 15] = l;
    for (let i = 0; i < m.length; i += 16) {
      a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];
      for (let j = 0; j < 64; j++) {
        if (j < 16) W[j] = m[j + i];
        else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
        T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
        T2 = safe_add(Sigma0256(a), Maj(a, b, c));
        h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2);
      }
      H[0] = safe_add(a, H[0]); H[1] = safe_add(b, H[1]); H[2] = safe_add(c, H[2]); H[3] = safe_add(d, H[3]);
      H[4] = safe_add(e, H[4]); H[5] = safe_add(f, H[5]); H[6] = safe_add(g, H[6]); H[7] = safe_add(h, H[7]);
    }
    return H;
  }
  return binb2hex(core_sha256(str2binb(text), text.length * chrsz));
}

// ── 解锁 ────────────────────────────────
function unlock(password) {
  const hash = sha256(password);
  if (hash === DIARY_HASH) {
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

// ── 解锁事件 ────────────────────────────
unlockBtn.addEventListener('click', () => {
  const pw = passwordInput.value.trim();
  if (!pw) return;
  const ok = unlock(pw);
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
      <h3 class="diary-entry-title">${escapeHtml(entry.title)}</h3>
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

// ── 编辑弹窗状态 ────────────────────────
let editTarget = null;  // 编辑模式下指向被编辑的条目 body

// ── 弹窗 DOM ────────────────────────────
const modalOverlay = document.getElementById('diary-modal-overlay');
// 弹窗移到 body 下，避开卡片 backdrop-filter 造成的层叠上下文限制
document.body.appendChild(modalOverlay);
const modalEl = document.querySelector('.diary-modal');
const modalHeader = document.querySelector('.diary-modal-header');
const modalTitle = document.getElementById('diary-modal-title');
const inputTitle = document.getElementById('diary-modal-input-title');
const inputContent = document.getElementById('diary-modal-input-content');

// ── 弹窗拖拽 ────────────────────────────
let dragState = null;

modalHeader.addEventListener('mousedown', (e) => {
  if (e.target.closest('.diary-modal-close')) return;
  const rect = modalEl.getBoundingClientRect();
  modalEl.style.position = 'fixed';
  modalEl.style.left = rect.left + 'px';
  modalEl.style.top = rect.top + 'px';
  modalEl.style.transform = 'none';
  modalEl.style.margin = '0';
  dragState = {
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
  };
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!dragState) return;
  modalEl.style.left = (e.clientX - dragState.offsetX) + 'px';
  modalEl.style.top = (e.clientY - dragState.offsetY) + 'px';
});

document.addEventListener('mouseup', () => {
  if (!dragState) return;
  dragState = null;
  document.body.style.userSelect = '';
});

// ── 触屏拖拽（手机端） ─────────────────
modalHeader.addEventListener('touchstart', (e) => {
  if (e.target.closest('.diary-modal-close')) return;
  const touch = e.touches[0];
  const rect = modalEl.getBoundingClientRect();
  modalEl.style.position = 'fixed';
  modalEl.style.left = rect.left + 'px';
  modalEl.style.top = rect.top + 'px';
  modalEl.style.transform = 'none';
  modalEl.style.margin = '0';
  dragState = {
    offsetX: touch.clientX - rect.left,
    offsetY: touch.clientY - rect.top,
  };
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!dragState) return;
  const touch = e.touches[0];
  modalEl.style.left = (touch.clientX - dragState.offsetX) + 'px';
  modalEl.style.top = (touch.clientY - dragState.offsetY) + 'px';
}, { passive: true });

document.addEventListener('touchend', () => {
  dragState = null;
});

function diaryOpenModal(mode) {
  // 重置弹窗位置（居中）
  modalEl.style.position = '';
  modalEl.style.left = '';
  modalEl.style.top = '';
  modalEl.style.transform = '';
  modalEl.style.margin = '';

  modalOverlay.classList.add('active');
  if (mode === 'edit') {
    modalTitle.textContent = '编辑日记';
  } else {
    modalTitle.textContent = '写新日记';
  }
  // 聚焦标题
  setTimeout(() => inputTitle.focus(), 100);
}

window.diaryCloseModal = function() {
  modalOverlay.classList.remove('active');
  inputTitle.value = '';
  inputContent.value = '';
  editTarget = null;
};

// 点击遮罩层关闭
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) diaryCloseModal();
});

// Ctrl+Enter 快速保存
inputContent.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    diarySaveEntry();
  }
});

// ── 保存条目 ──────────────────────────
window.diarySaveEntry = function() {
  const title = inputTitle.value.trim();
  const content = inputContent.value.trim();
  if (!title) {
    inputTitle.focus();
    inputTitle.style.borderColor = '#ef4444';
    setTimeout(() => inputTitle.style.borderColor = '', 1500);
    return;
  }
  if (!content) {
    inputContent.focus();
    inputContent.style.borderColor = '#ef4444';
    setTimeout(() => inputContent.style.borderColor = '', 1500);
    return;
  }

  const now = new Date();
  const html = '<p>' + content.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';

  if (editTarget) {
    // ── 编辑模式 ──
    editTarget.querySelector('.diary-entry-title').textContent = title;
    editTarget.querySelector('.diary-entry-text').innerHTML = html;
  } else {
    // ── 新增模式 ──
    const entry = {
      day: pad(now.getDate()),
      month: MONTHS[now.getMonth()],
      year: String(now.getFullYear()),
    };

    const article = document.createElement('article');
    article.className = 'diary-entry';
    article.innerHTML = `
      <div class="diary-entry-date">
        <span class="diary-entry-day">${entry.day}</span>
        <span class="diary-entry-month">${entry.month}</span>
        <span class="diary-entry-year">${entry.year}</span>
      </div>
      <div class="diary-entry-body">
        <h3 class="diary-entry-title">${escapeHtml(title)}</h3>
        <div class="diary-entry-text">${html}</div>
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
  }

  diaryCloseModal();
  saveEntries();
};

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ── 添加新条目 ──────────────────────────
window.diaryAddEntry = function() {
  editTarget = null;
  diaryOpenModal('add');
};

// ── 编辑条目 ──────────────────────────
window.diaryEditEntry = function(btn) {
  const body = btn.closest('.diary-entry-body');
  editTarget = body;

  const titleEl = body.querySelector('.diary-entry-title');
  const textEl = body.querySelector('.diary-entry-text');

  inputTitle.value = titleEl.textContent;
  inputContent.value = textEl.innerText;
  diaryOpenModal('edit');
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

// ── 页面打开时滚动到顶部 ───────────────
window.scrollTo(0, 0);
