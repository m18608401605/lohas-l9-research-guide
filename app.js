const guide = window.L9_GUIDE;
const roundOne = window.L9_FIRST_ROUND;
const sourceMap = new Map(guide.sources.map(source => [source.id, source]));
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const linkSource = id => {
  const source = sourceMap.get(id);
  return source ? `<div class="task-source"><a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} <span aria-hidden="true">↗</span></a><small><strong>使用边界：</strong>${escapeHTML(source.limit)}</small></div>` : '';
};

const list = document.getElementById('claim-list');
if (list) {
  list.innerHTML = roundOne.map((item, index) => `
    <a class="evidence-row" href="./task.html?id=${encodeURIComponent(item.id)}" data-priority="${escapeHTML(item.priority)}" data-search="${escapeHTML([item.title, item.concept, item.first, item.elements, item.can, item.cannot, item.decision, ...item.queries].join(' ').toLowerCase())}">
      <span class="evidence-summary">
        <span class="table-cell question-cell"><small class="priority ${escapeHTML(item.priority)}">${item.priority === 'p0' ? '先做 P0' : '随后 P1'}</small><strong>${String(index + 1).padStart(2, '0')} · ${escapeHTML(item.title)}</strong></span>
        <span class="table-cell collection-cell"><small>具体收集与口径</small>${escapeHTML(item.first)}<span class="record-elements"><b>记录：</b>${escapeHTML(item.elements)}</span></span>
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
    detail.innerHTML = '<div class="task-missing"><h1>没有找到这项任务</h1><p>请从第一轮证据清单选择任务。</p><a class="button small" href="./tasks.html">返回任务清单</a></div>';
  } else {
    document.title = `${item.title}｜乐活元 L9 研究指南`;
    document.getElementById('task-breadcrumb-current').textContent = item.title;
    detail.innerHTML = `
      <div class="task-detail-header"><span class="priority ${escapeHTML(item.priority)}">${item.priority === 'p0' ? '优先 P0' : '按需 P1'}</span><span class="task-number">任务 ${String(index + 1).padStart(2, '0')} / ${roundOne.length}</span><h1>${escapeHTML(item.title)}</h1><p>对应知识点：${escapeHTML(item.concept)}</p></div>
      <div class="task-summary-grid">
        <article><span>第一轮具体找</span><p>${escapeHTML(item.first)}</p><small><strong>记录口径：</strong>${escapeHTML(item.elements)}</small></article>
        <article><span>能支持的结论</span><p>${escapeHTML(item.can)}</p></article>
        <article><span>不能推断</span><p>${escapeHTML(item.cannot)}</p></article>
        <article><span>影响的决策</span><p>${escapeHTML(item.decision)}</p></article>
      </div>
      <div class="task-detail-body"><div class="detail-lead"><span class="card-kicker">证据查找顺序</span><h2>先找关键证据，再决定是否补证</h2><p>一般证据用于解释和核对；只有满足触发条件时才使用替代资料，并收窄报告结论。</p></div>
        <div class="detail-grid">
          <div class="detail-block key"><span>01 / 关键证据</span><p>${escapeHTML(item.key)}</p></div>
          <div class="detail-block"><span>02 / 一般支撑证据</span><p>${escapeHTML(item.general)}</p></div>
          <div class="detail-block trigger"><span>03 / 替代证据触发条件</span><p>${escapeHTML(item.trigger)}</p></div>
          <div class="detail-block fallback"><span>04 / 替代资料顺序</span><ol>${item.fallback.map(value => `<li>${escapeHTML(value)}</li>`).join('')}</ol></div>
        </div>
        <div class="detail-counter"><strong>主动寻找相反解释</strong><p>${escapeHTML(item.counter)}</p></div>
        <div class="research-actions"><div><span class="small-label">可回查的资料入口</span><div class="source-links">${item.sourceIds.map(linkSource).join('')}</div></div><div><span class="small-label">点击复制检索词</span><div class="query-list">${item.queries.map(query => `<button type="button" class="query" data-copy="${escapeHTML(query)}" title="点击复制检索词">${escapeHTML(query)} <span aria-hidden="true">⧉</span></button>`).join('')}</div></div></div>
        <p class="detail-deliverable"><strong>本项交付：</strong>${escapeHTML(item.deliverable)}</p>
      </div>`;
    const neighbors = document.getElementById('task-neighbors');
    neighbors.innerHTML = `<a href="./tasks.html">← 返回全部任务</a>${index > 0 ? `<a href="./task.html?id=${encodeURIComponent(roundOne[index - 1].id)}">← 上一项：${escapeHTML(roundOne[index - 1].title)}</a>` : ''}${index < roundOne.length - 1 ? `<a href="./task.html?id=${encodeURIComponent(roundOne[index + 1].id)}">下一项：${escapeHTML(roundOne[index + 1].title)} →</a>` : ''}`;
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
const copyTemplate = document.getElementById('copy-template');
if (copyTemplate) copyTemplate.addEventListener('click', event => {
  copyText('机会：证据及口径【　】／反证【　】／状态【支持·相反·不足】\n相对价值：证据及口径【　】／反证【　】／状态【支持·相反·不足】\n营销匹配：证据及口径【　】／反证【　】／状态【支持·相反·不足】\n暂定判断【　】；首要行动【　】；前提与风险【　】；复核指标【　】。', event.currentTarget);
});
const copyRecord = document.getElementById('copy-record');
if (copyRecord) copyRecord.addEventListener('click', event => {
  copyText('任务编号｜原始链接｜发布者与发布日期｜统计期间｜地域与型号／人群｜指标定义｜原文位置｜资料事实｜能支持什么｜不能证明什么｜相反解释｜影响哪项决策', event.currentTarget);
});
