const guide = window.L9_GUIDE;
const sourceMap = new Map(guide.sources.map(source => [source.id, source]));
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const linkSource = id => {
  const source = sourceMap.get(id);
  return source ? `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} <span aria-hidden="true">↗</span></a>` : '';
};

document.getElementById('claim-list').innerHTML = guide.claims.map(claim => `
  <details class="claim-card" data-priority="${escapeHTML(claim.priority)}" data-search="${escapeHTML([claim.title, claim.question, claim.category, claim.key, ...claim.queries].join(' ').toLowerCase())}">
    <summary>
      <span class="claim-heading"><span class="priority ${escapeHTML(claim.priority)}">${claim.priority === 'p0' ? '先做 P0' : '随后 P1'}</span><span class="category">${escapeHTML(claim.category)}</span><strong>${escapeHTML(claim.title)}</strong><span class="claim-question">${escapeHTML(claim.question)}</span></span>
      <span class="expand-icon" aria-hidden="true">＋</span>
    </summary>
    <div class="claim-body">
      <div class="claim-purpose"><span>为什么查</span><p>${escapeHTML(claim.why)}</p></div>
      <div class="evidence-grid">
        <div class="evidence-block essential"><span class="evidence-label">01 / 关键证据 · 优先找</span><p>${escapeHTML(claim.key)}</p></div>
        <div class="evidence-block"><span class="evidence-label">02 / 一般证据 · 补解释</span><p>${escapeHTML(claim.general)}</p></div>
        <div class="evidence-block trigger"><span class="evidence-label">03 / 什么时候启动替代</span><p>${escapeHTML(claim.trigger)}</p></div>
        <div class="evidence-block fallback"><span class="evidence-label">04 / 替代资料 · 按顺序</span><ol>${claim.fallback.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ol></div>
      </div>
      <div class="inference-grid"><div class="can"><span>可以得出的判断</span><p>${escapeHTML(claim.can)}</p></div><div class="cannot"><span>不能直接推断</span><p>${escapeHTML(claim.cannot)}</p></div><div class="counter"><span>要主动检查的反方解释</span><p>${escapeHTML(claim.counter)}</p></div></div>
      <div class="research-actions"><div><span class="small-label">从这里开始查</span><div class="source-links">${claim.sourceIds.map(linkSource).join('')}</div></div><div><span class="small-label">可复制检索词</span><div class="query-list">${claim.queries.map(query => `<button type="button" class="query" data-copy="${escapeHTML(query)}" title="点击复制检索词">${escapeHTML(query)} <span aria-hidden="true">⧉</span></button>`).join('')}</div></div></div>
      <div class="claim-bottom"><p><strong>提交成果：</strong>${escapeHTML(claim.deliverable)}</p><p><strong>目前进度：</strong>${escapeHTML(claim.status)}</p></div>
    </div>
  </details>
`).join('');

document.getElementById('source-list').innerHTML = guide.sources.map(source => `
  <article class="source-card"><span class="source-kind">${escapeHTML(source.kind)}</span><h3><a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} <span aria-hidden="true">↗</span></a></h3><p class="source-meta">${escapeHTML(source.meta)}</p><p>${escapeHTML(source.summary)}</p><div class="source-limit"><strong>使用边界</strong><span>${escapeHTML(source.limit)}</span></div></article>
`).join('');

const search = document.getElementById('claim-search');
const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.claim-card')];
let activeFilter = 'all';
function applyFilter() {
  const term = search.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const matches = (activeFilter === 'all' || card.dataset.priority === activeFilter) && (!term || card.dataset.search.includes(term));
    card.hidden = !matches;
    if (matches) visible++;
  }
  document.getElementById('no-results').hidden = visible !== 0;
}
search.addEventListener('input', applyFilter);
for (const filter of filters) filter.addEventListener('click', () => {
  activeFilter = filter.dataset.filter;
  for (const item of filters) { const selected = item === filter; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); }
  applyFilter();
});

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
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
document.getElementById('copy-template').addEventListener('click', event => {
  copyText('我们的暂定判断是【　】；决定性证据是【来源及口径】；最强反对理由是【　】；关键缺口是【　】；如果【新证据】出现，我们将把判断改为【　】。建议先做【动作】，用【指标】复核。', event.currentTarget);
});
document.getElementById('copy-record').addEventListener('click', event => {
  copyText('对应论点｜原始链接｜发布者与发布日期｜统计期间｜地域与型号／人群｜指标口径｜原文位置｜它支持什么／不能支持什么｜反证或疑点', event.currentTarget);
});
