const guide = window.L9_GUIDE;
const roundOne = window.L9_FIRST_ROUND;
const sourceMap = new Map(guide.sources.map(source => [source.id, source]));
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
if (document.body?.classList.contains('page-home')) {
  const oldLinks = {'#claims': './tasks.html', '#sources': './sources.html', '#decision': './decision.html', '#finish': './decision.html#finish'};
  const destination = oldLinks[window.location.hash];
  if (destination) window.location.replace(destination);
}
const linkSource = id => {
  const source = sourceMap.get(id);
  return source ? `<div class="task-source"><a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} <span aria-hidden="true">↗</span></a><small>${escapeHTML(source.summary)}</small><small><strong>使用边界：</strong>${escapeHTML(source.limit)}</small></div>` : '';
};
const renderLookup = entry => {
  const source = sourceMap.get(entry.sourceId);
  return source ? `<li><a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(entry.title)} <span aria-hidden="true">↗</span></a><small>${escapeHTML(source.title)}</small><p><strong>在这里查：</strong>${escapeHTML(entry.purpose)}</p>${entry.query ? `<p class="lookup-query"><strong>检索词：</strong>${escapeHTML(entry.query)}</p>` : ''}</li>` : '';
};

const list = document.getElementById('claim-list');
if (list) {
  list.innerHTML = roundOne.map((item, index) => `
    <a class="evidence-row" href="./task.html?id=${encodeURIComponent(item.id)}" data-priority="${escapeHTML(item.priority)}" data-search="${escapeHTML([item.title, item.concept, item.why, item.first, item.elements, item.can, item.cannot, item.decision, ...item.queries].join(' ').toLowerCase())}">
      <span class="evidence-summary">
        <span class="table-cell question-cell"><small class="priority ${escapeHTML(item.priority)}">${item.priority === 'p0' ? '优先关注' : '按需补看'}</small><strong>${String(index + 1).padStart(2, '0')} · ${escapeHTML(item.title)}</strong></span>
        <span class="table-cell collection-cell"><small>具体资料与口径</small>${escapeHTML(item.first)}<span class="record-elements"><b>核对口径：</b>${escapeHTML(item.elements)}</span></span>
        <span class="table-cell concept-cell"><small>对应知识点</small>${escapeHTML(item.concept)}</span>
        <span class="table-cell conclusion-cell"><small>能支持的结论</small>${escapeHTML(item.can)}</span>
        <span class="table-cell decision-cell"><small>决策与边界</small><strong>决策：</strong>${escapeHTML(item.decision)}<span class="decision-boundary"><strong>不能推断：</strong>${escapeHTML(item.cannot)}</span><b class="row-expand" aria-hidden="true">↗</b></span>
      </span>
    </a>
  `).join('');

  const search = document.getElementById('claim-search');
  const filters = [...document.querySelectorAll('.filter')];
  const rows = [...document.querySelectorAll('.evidence-row')];
  let activeFilter = 'all';
  function applyFilter() {
    const term = search.value.trim().toLowerCase();
    let visible = 0;
    for (const row of rows) {
      const matches = (activeFilter === 'all' || row.dataset.priority === activeFilter) && (!term || row.dataset.search.includes(term));
      row.hidden = !matches;
      if (matches) visible++;
    }
    document.getElementById('no-results').hidden = visible !== 0;
    document.getElementById('result-count').textContent = `显示 ${visible} / ${rows.length} 项`;
  }
  search.addEventListener('input', applyFilter);
  for (const filter of filters) filter.addEventListener('click', () => {
    activeFilter = filter.dataset.filter;
    for (const button of filters) {
      const selected = button === filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    applyFilter();
  });
  applyFilter();
}

const detail = document.getElementById('task-detail');
if (detail) {
  const id = new URLSearchParams(window.location.search).get('id');
  const index = roundOne.findIndex(item => item.id === id);
  const item = roundOne[index];
  if (!item) {
    detail.innerHTML = '<div class="task-missing"><h1>没有找到这个问题</h1><p>请从研究问题列表选择。</p><a class="button small" href="./tasks.html">返回研究问题</a></div>';
  } else {
    document.title = `${item.title}｜乐活元 L9 研究指南`;
    document.getElementById('task-breadcrumb-current').textContent = item.title;
    detail.innerHTML = `
      <div class="task-detail-header"><span class="priority ${escapeHTML(item.priority)}">${item.priority === 'p0' ? '优先关注' : '按需补看'}</span><span class="task-number">问题 ${String(index + 1).padStart(2, '0')} / ${roundOne.length}</span><h1>${escapeHTML(item.title)}</h1><p>对应知识点：${escapeHTML(item.concept)}</p></div>
      <div class="task-why"><strong>为什么看这个问题</strong><p>${escapeHTML(item.why)}</p></div>
      <div class="task-detail-body"><div class="detail-lead"><span class="card-kicker">01 / 查找资料</span><h2>先找能直接检验问题的证据</h2><p>先看资料覆盖的产品或人群、地域、时期和指标；缺少直接证据时，只补查相应缺口。</p></div>
        <div class="detail-grid">
          <div class="detail-block key"><span>优先找什么</span><p>${escapeHTML(item.first)}</p><p class="detail-secondary"><strong>关键证据：</strong>${escapeHTML(item.key)}</p><small><strong>核对口径：</strong>${escapeHTML(item.elements)}</small></div>
          <div class="detail-block"><span>其他资料的用途</span><p>${escapeHTML(item.general)}</p></div>
        </div>
        ${item.lookup ? `<div class="lookup-path"><span class="small-label">具体去哪里找（按顺序）</span><ol>${item.lookup.map(renderLookup).join('')}</ol>${item.lookupNote ? `<p class="lookup-note">${escapeHTML(item.lookupNote)}</p>` : ''}</div>` : `<div class="research-actions"><div><span class="small-label">从这些来源开始</span><div class="source-links">${item.sourceIds.map(linkSource).join('')}</div></div><div><span class="small-label">点击复制检索词</span><div class="query-list">${item.queries.map(query => `<button type="button" class="query" data-copy="${escapeHTML(query)}" title="点击复制检索词">${escapeHTML(query)} <span aria-hidden="true">⧉</span></button>`).join('')}</div></div></div>`}
        <details class="task-fallback"><summary>缺少直接证据时，怎样继续查？ <span aria-hidden="true">＋</span></summary><div><p><strong>出现什么缺口时：</strong>${escapeHTML(item.trigger)}</p><ol>${item.fallback.map(value => `<li>${escapeHTML(value)}</li>`).join('')}</ol><p>补查线索只能支持它实际覆盖的型号、人群、地域、时期和指标；仍缺失的内容要明确写为待核。</p></div></details>
        <div class="task-interpretation"><div class="detail-lead"><span class="card-kicker">02 / 解释资料</span><h2>查到资料后，怎么形成判断？</h2></div><div class="concept-bridge"><strong>用课程知识检查什么</strong><p>${escapeHTML(item.conceptUse)}</p></div>${item.example ? `<div class="concept-example"><strong>举例（假设，并非 L9 已发生的情况）</strong><p>${escapeHTML(item.example)}</p></div>` : ''}<div class="meaning-grid"><article><strong>查到后可以说什么</strong><p>${escapeHTML(item.can)}</p></article><article><strong>还不能说什么</strong><p>${escapeHTML(item.cannot)}</p></article></div><div class="detail-counter"><strong>还有什么可能的解释</strong><p>${escapeHTML(item.counter)}</p></div><div class="decision-clue"><strong>这会怎样影响建议</strong><p>${escapeHTML(item.decision)}</p></div></div>
        <div class="discussion-prompt"><span class="card-kicker">小组讨论一个问题</span><p>${escapeHTML(item.discussion)}</p></div>
      </div>`;
    const neighbors = document.getElementById('task-neighbors');
    neighbors.innerHTML = `<a href="./tasks.html">← 返回全部问题</a>${index > 0 ? `<a href="./task.html?id=${encodeURIComponent(roundOne[index - 1].id)}">← 上一题：${escapeHTML(roundOne[index - 1].title)}</a>` : ''}${index < roundOne.length - 1 ? `<a href="./task.html?id=${encodeURIComponent(roundOne[index + 1].id)}">下一题：${escapeHTML(roundOne[index + 1].title)} →</a>` : ''}`;
  }
}

const sourceList = document.getElementById('source-list');
if (sourceList) sourceList.innerHTML = guide.sources.map(source => `
  <article class="source-card"><span class="source-kind">${escapeHTML(source.kind)}</span><h3><a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} <span aria-hidden="true">↗</span></a></h3><p class="source-meta">${escapeHTML(source.meta)}</p><p>${escapeHTML(source.summary)}</p><div class="source-limit"><strong>使用边界</strong><span>${escapeHTML(source.limit)}</span></div></article>
`).join('');

async function copyText(value, button) {
  try {
    await navigator.clipboard.writeText(value);
    const previous = button.innerHTML;
    button.innerHTML = '已复制 ✓';
    window.setTimeout(() => { button.innerHTML = previous; }, 1600);
  } catch {
    button.title = '浏览器未允许复制；可手动选中文本';
  }
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-copy]');
  if (button) copyText(button.dataset.copy, button);
});
