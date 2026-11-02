const CURRENCIES = ['EUR','CHF','JPY','TWD','CNY','HKD','AUD','NZD','KRW'];
const COUNTRY_PRESETS = [
  { name: '台灣', code: 'TW', tz: 'Asia/Taipei', currency: 'TWD' },
  { name: '日本', code: 'JP', tz: 'Asia/Tokyo', currency: 'JPY' },
  { name: '韓國', code: 'KR', tz: 'Asia/Seoul', currency: 'KRW' },
  { name: '香港', code: 'HK', tz: 'Asia/Hong_Kong', currency: 'HKD' },
  { name: '中國', code: 'CN', tz: 'Asia/Shanghai', currency: 'CNY' },
  { name: '澳洲', code: 'AU', tz: 'Australia/Sydney', currency: 'AUD' },
  { name: '紐西蘭', code: 'NZ', tz: 'Pacific/Auckland', currency: 'NZD' },
  { name: '法國', code: 'FR', tz: 'Europe/Paris', currency: 'EUR' },
  { name: '德國', code: 'DE', tz: 'Europe/Berlin', currency: 'EUR' },
  { name: '瑞士', code: 'CH', tz: 'Europe/Zurich', currency: 'CHF' },
];

const state = {
  trip: null,
  memberId: localStorage.getItem('tp_memberId') || null,
  tripId: localStorage.getItem('tp_tripId') || null,
  tab: 'timeline',
  rates: null,
  pollTimer: null,
  lastSync: 0,
};

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function privateKey() {
  return `tp_private_${state.tripId || 'none'}_${state.memberId || 'anon'}`;
}

function loadPrivate() {
  try {
    return JSON.parse(localStorage.getItem(privateKey()) || '{}');
  } catch {
    return {};
  }
}

function savePrivate(data) {
  localStorage.setItem(privateKey(), JSON.stringify(data));
}

function fmtMoney(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  try {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency, maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2 }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

function toTwd(amount, currency, rates) {
  if (!rates || !rates.rates) return null;
  const r = rates.rates[currency];
  if (r == null) return null;
  return Number(amount) * r;
}

function offsetLabel(tz) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value || tz;
  } catch {
    return tz;
  }
}

function localTime(tz) {
  try {
    return new Intl.DateTimeFormat('zh-TW', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  } catch {
    return '--:--';
  }
}

function eachDate(start, end) {
  const out = [];
  const a = new Date(start + 'T00:00:00');
  const b = new Date(end + 'T00:00:00');
  for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function weekday(dateStr) {
  const names = ['日','一','二','三','四','五','六'];
  return names[new Date(dateStr + 'T12:00:00').getDay()];
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

async function loadRates(force = false) {
  const clientCache = JSON.parse(localStorage.getItem('tp_rates_cache') || 'null');
  if (!force && clientCache?.fetchedAt) {
    const age = Date.now() - new Date(clientCache.fetchedAt).getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) {
      state.rates = clientCache;
      return clientCache;
    }
  }
  const data = await api(`/api/rates${force ? '?refresh=1' : ''}`);
  localStorage.setItem('tp_rates_cache', JSON.stringify(data));
  state.rates = data;
  return data;
}

function persistSession() {
  if (state.tripId) localStorage.setItem('tp_tripId', state.tripId);
  if (state.memberId) localStorage.setItem('tp_memberId', state.memberId);
}

async function saveTrip(patch) {
  if (!state.trip) return;
  const body = {
    memberId: state.memberId,
    title: patch.title ?? state.trip.title,
    countries: patch.countries ?? state.trip.countries,
    days: patch.days ?? state.trip.days,
    expenses: patch.expenses ?? state.trip.expenses,
  };
  const data = await api(`/api/trips/${state.trip.id}`, { method: 'PUT', body: JSON.stringify(body) });
  state.trip = data.trip;
  state.lastSync = new Date(data.trip.updatedAt).getTime();
  render();
}

function startPolling() {
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    if (!state.trip) return;
    try {
      const data = await api(`/api/trips/${state.trip.id}?since=${state.lastSync}`);
      if (!data.unchanged && data.trip) {
        state.trip = data.trip;
        state.lastSync = new Date(data.trip.updatedAt).getTime();
        render();
      }
    } catch (_) { /* ignore transient */ }
  }, 7000);
}

function showHome() {
  $('#home').classList.remove('hidden');
  $('#app').classList.add('hidden');
}

function showApp() {
  $('#home').classList.add('hidden');
  $('#app').classList.remove('hidden');
  render();
  startPolling();
}

function currencyOptions(selected = 'TWD') {
  return CURRENCIES.map((c) => `<option value="${c}" ${c === selected ? 'selected' : ''}>${c}</option>`).join('');
}

function memberName(id) {
  return state.trip?.members?.find((m) => m.id === id)?.nickname || '未知';
}

function computeSettlement() {
  const trip = state.trip;
  const rates = state.rates;
  if (!trip || !rates) return { lines: [], totalsByMember: {}, groupTotalTwd: 0 };
  const members = trip.members;
  const bal = Object.fromEntries(members.map((m) => [m.id, 0]));
  let groupTotalTwd = 0;
  for (const e of trip.expenses || []) {
    const twd = toTwd(e.amount, e.currency, rates);
    if (twd == null) continue;
    if (!e.shared) {
      // personal shared-ledger visibility but not split — still counts for payer only as spent, no debt
      continue;
    }
    const splitWith = (e.splitWith && e.splitWith.length ? e.splitWith : members.map((m) => m.id));
    const n = splitWith.length || 1;
    const share = twd / n;
    groupTotalTwd += twd;
    bal[e.payerId] = (bal[e.payerId] || 0) + twd;
    for (const mid of splitWith) bal[mid] = (bal[mid] || 0) - share;
  }
  // greedy settle
  const debtors = [];
  const creditors = [];
  for (const m of members) {
    const v = Math.round((bal[m.id] || 0) * 100) / 100;
    if (v < -0.5) debtors.push({ id: m.id, amount: -v });
    if (v > 0.5) creditors.push({ id: m.id, amount: v });
  }
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  const lines = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    lines.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(pay * 100) / 100 });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.5) i++;
    if (creditors[j].amount < 0.5) j++;
  }
  return { lines, totalsByMember: bal, groupTotalTwd };
}

function buildTimelineDays() {
  const trip = state.trip;
  const map = new Map();
  for (const c of trip.countries || []) {
    if (!c.start || !c.end) continue;
    for (const d of eachDate(c.start, c.end)) {
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(c);
    }
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function renderHome() {
  // nothing dynamic
}

function renderTimeline() {
  const el = $('#tab-timeline');
  const trip = state.trip;
  const days = buildTimelineDays();
  el.innerHTML = `
    <div class="card">
      <div class="row" style="align-items:flex-start">
        <div>
          <h2 style="margin:0">${escapeHtml(trip.title)}</h2>
          <div class="muted">邀請碼 <span class="invite" style="font-size:1rem">${trip.code}</span></div>
        </div>
        <button class="secondary" id="btn-copy-code" type="button">複製</button>
      </div>
      <div class="muted" style="margin-top:0.5rem">成員：${trip.members.map((m) => escapeHtml(m.nickname)).join('、')}</div>
    </div>
    <div class="card">
      <div class="row">
        <h2 style="margin:0;flex:1">國家與時區</h2>
        <button type="button" id="btn-add-country">新增國家</button>
      </div>
      <div class="muted" style="margin:0.4rem 0 0.6rem">同一趟旅行可跨多國；日期依序展開成時間軸。</div>
      ${(trip.countries || []).map((c, idx) => `
        <div class="country-card" data-idx="${idx}">
          <div class="day-head">
            <strong>${escapeHtml(c.name)}</strong>
            <button class="ghost" data-remove-country="${idx}" type="button">移除</button>
          </div>
          <div class="muted">${c.tz} · ${offsetLabel(c.tz)} · 現在 ${localTime(c.tz)}</div>
          <div class="muted">${c.start || '?'} → ${c.end || '?'} · 幣別 ${c.currency || '—'}</div>
        </div>
      `).join('') || '<div class="muted">尚未加入國家</div>'}
    </div>
    <div class="card">
      <h2>行程時間軸</h2>
      ${days.length ? days.map(([date, countries]) => {
        const key = date;
        const acts = (trip.days?.[key] || []);
        return `
          <div class="day">
            <div class="day-head">
              <div>
                <strong>${date}（週${weekday(date)}）</strong>
                <div>${countries.map((c) => `<span class="chip">${escapeHtml(c.name)} ${localTime(c.tz)}</span>`).join(' ')}</div>
              </div>
              <button class="ghost" data-add-act="${date}" type="button">+ 活動</button>
            </div>
            ${acts.map((a, i) => `
              <div class="activity">
                <span>${escapeHtml(a.text)}</span>
                <button class="ghost" data-del-act="${date}:${i}" type="button">刪</button>
              </div>
            `).join('') || '<div class="muted" style="padding-top:0.4rem">尚無活動</div>'}
          </div>
        `;
      }).join('') : '<div class="muted">請先為國家設定日期區間</div>'}
    </div>
  `;
  $('#btn-copy-code')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(trip.code);
    toast('已複製邀請碼');
  });
  $('#btn-add-country')?.addEventListener('click', openCountryModal);
  $$('[data-remove-country]', el).forEach((btn) => btn.addEventListener('click', async () => {
    const idx = Number(btn.dataset.removeCountry);
    const countries = trip.countries.slice();
    countries.splice(idx, 1);
    await saveTrip({ countries });
  }));
  $$('[data-add-act]', el).forEach((btn) => btn.addEventListener('click', () => openActivityModal(btn.dataset.addAct)));
  $$('[data-del-act]', el).forEach((btn) => btn.addEventListener('click', async () => {
    const [date, i] = btn.dataset.delAct.split(':');
    const daysObj = { ...(trip.days || {}) };
    daysObj[date] = (daysObj[date] || []).slice();
    daysObj[date].splice(Number(i), 1);
    await saveTrip({ days: daysObj });
  }));
}

function renderExpenses() {
  const el = $('#tab-expenses');
  const trip = state.trip;
  const { lines, groupTotalTwd } = computeSettlement();
  el.innerHTML = `
    <div class="card">
      <div class="row">
        <h2 style="margin:0;flex:1">共同帳本</h2>
        <button type="button" id="btn-add-expense">新增支出</button>
      </div>
      <div class="muted">結算與合計以 <strong>TWD（新台幣）</strong> 為基準，使用預估匯率換算；每筆仍顯示原始幣別金額。</div>
      <div style="margin-top:0.6rem"><span class="chip">共同支出合計（TWD） ${fmtMoney(groupTotalTwd, 'TWD')}</span></div>
    </div>
    <div class="card">
      <h2>支出明細</h2>
      ${(trip.expenses || []).slice().reverse().map((e) => {
        const twd = toTwd(e.amount, e.currency, state.rates);
        return `
          <div class="expense">
            <div class="row">
              <strong style="flex:1">${escapeHtml(e.desc)}</strong>
              <span class="badge ${e.shared ? 'shared' : ''}">${e.shared ? '分攤' : '不分攤'}</span>
            </div>
            <div>${fmtMoney(e.amount, e.currency)} ${e.currency !== 'TWD' && twd != null ? `<span class="muted">≈ ${fmtMoney(twd, 'TWD')}</span>` : ''}</div>
            <div class="muted">付款：${escapeHtml(memberName(e.payerId))}${e.shared ? ` · 分給 ${(e.splitWith || trip.members.map(m=>m.id)).map(memberName).map(escapeHtml).join('、')}` : ''}</div>
            <button class="ghost" data-del-exp="${e.id}" type="button">刪除</button>
          </div>
        `;
      }).join('') || '<div class="muted">尚無支出</div>'}
    </div>
    <div class="card">
      <h2>誰該付給誰（TWD）</h2>
      ${lines.length ? lines.map((l) => `
        <div class="balance-line">
          <span>${escapeHtml(memberName(l.from))} → ${escapeHtml(memberName(l.to))}</span>
          <strong>${fmtMoney(l.amount, 'TWD')}</strong>
        </div>
      `).join('') : '<div class="muted">目前沒有需要結算的分攤</div>'}
      <div class="muted" style="margin-top:0.5rem">預估匯率更新日期：${state.rates?.updatedAt || '—'}</div>
    </div>
  `;
  $('#btn-add-expense')?.addEventListener('click', openExpenseModal);
  $$('[data-del-exp]', el).forEach((btn) => btn.addEventListener('click', async () => {
    const expenses = (trip.expenses || []).filter((e) => e.id !== btn.dataset.delExp);
    await saveTrip({ expenses });
  }));
}

function renderPrivate() {
  const el = $('#tab-private');
  const priv = loadPrivate();
  const budget = Number(priv.budgetTwd || 0);
  const spentPersonal = Number(priv.spentNotes || 0);
  el.innerHTML = `
    <div class="card">
      <h2>私人區（僅此裝置）</h2>
      <div class="muted">此區資料存在你的瀏覽器 localStorage，<strong>不會</strong>同步給旅伴或伺服器。</div>
      <label>個人預算（TWD）</label>
      <input id="priv-budget" type="number" inputmode="decimal" value="${priv.budgetTwd ?? ''}" placeholder="例如 50000" />
      <label>私人花費筆記合計（TWD，選填）</label>
      <input id="priv-spent" type="number" inputmode="decimal" value="${priv.spentNotes ?? ''}" placeholder="自己記下的花費" />
      <label>備註</label>
      <textarea id="priv-note" rows="3" placeholder="只有你看得到">${escapeHtml(priv.note || '')}</textarea>
      <div class="actions"><button type="button" id="btn-save-private">儲存私人資料</button></div>
      <div class="muted" style="margin-top:0.6rem">剩餘約 ${fmtMoney(budget - spentPersonal, 'TWD')}</div>
    </div>
    <div class="card">
      <div class="row">
        <h2 style="margin:0;flex:1">預估匯率</h2>
        <button class="secondary" type="button" id="btn-refresh-rates">立即更新</button>
      </div>
      <div class="muted">預設約每週更新一次（快取 7 天）。標示為<strong>預估匯率</strong>，更新日期：${state.rates?.updatedAt || '—'}；擷取時間：${state.rates?.fetchedAt ? new Date(state.rates.fetchedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }) : '—'}。</div>
      <div style="margin-top:0.7rem">
        ${(state.rates?.currencies || CURRENCIES).map((c) => {
          const r = state.rates?.rates?.[c];
          return `<div class="balance-line"><span>1 ${c}</span><strong>${c === 'TWD' ? '1.00 TWD' : (r != null ? `${r.toFixed(4)} TWD` : '—')}</strong></div>`;
        }).join('')}
      </div>
    </div>
  `;
  $('#btn-save-private')?.addEventListener('click', () => {
    savePrivate({
      budgetTwd: $('#priv-budget').value,
      spentNotes: $('#priv-spent').value,
      note: $('#priv-note').value,
    });
    toast('已儲存私人資料');
    renderPrivate();
  });
  $('#btn-refresh-rates')?.addEventListener('click', async () => {
    try {
      await loadRates(true);
      toast('匯率已更新');
      render();
    } catch (e) {
      toast(e.message || '更新失敗');
    }
  });
}

function renderMembers() {
  const el = $('#tab-more');
  el.innerHTML = `
    <div class="card">
      <h2>旅伴</h2>
      ${(state.trip.members || []).map((m) => `
        <div class="balance-line">
          <span>${escapeHtml(m.nickname)}${m.id === state.memberId ? '（你）' : ''}</span>
          <span class="muted">${new Date(m.joinedAt).toLocaleDateString('zh-TW')}</span>
        </div>
      `).join('')}
    </div>
    <div class="card stack">
      <button class="secondary" type="button" id="btn-leave">離開此旅行（本裝置）</button>
      <div class="muted">離開只清除本機工作階段，不會刪除伺服器上的群組資料。</div>
    </div>
  `;
  $('#btn-leave')?.addEventListener('click', () => {
    localStorage.removeItem('tp_tripId');
    localStorage.removeItem('tp_memberId');
    state.trip = null;
    state.tripId = null;
    state.memberId = null;
    clearInterval(state.pollTimer);
    showHome();
  });
}

function render() {
  if (!state.trip) return;
  const me = state.trip.members.find((m) => m.id === state.memberId);
  $('#app-sub').textContent = `${me ? me.nickname + ' · ' : ''}邀請碼 ${state.trip.code}`;
  $$('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === state.tab));
  $$('.tab-panel').forEach((p) => p.classList.toggle('hidden', p.id !== `tab-${state.tab}`));
  if (state.tab === 'timeline') renderTimeline();
  if (state.tab === 'expenses') renderExpenses();
  if (state.tab === 'private') renderPrivate();
  if (state.tab === 'more') renderMembers();
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function openModal(title, bodyHtml, onSubmit) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `<div class="modal"><h3>${title}</h3>${bodyHtml}<div class="actions"><button type="button" class="secondary" data-cancel>取消</button><button type="button" data-ok>確定</button></div></div>`;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  $('[data-cancel]', wrap).addEventListener('click', close);
  $('[data-ok]', wrap).addEventListener('click', async () => {
    try {
      await onSubmit(wrap);
      close();
    } catch (err) {
      toast(err.message || '失敗');
    }
  });
  return wrap;
}

function openCountryModal() {
  openModal('新增國家', `
    <label>國家</label>
    <select id="c-preset">${COUNTRY_PRESETS.map((c,i)=>`<option value="${i}">${c.name}（${c.tz}）</option>`).join('')}</select>
    <label>開始日期</label>
    <input type="date" id="c-start" />
    <label>結束日期</label>
    <input type="date" id="c-end" />
  `, async (wrap) => {
    const preset = COUNTRY_PRESETS[Number($('#c-preset', wrap).value)];
    const start = $('#c-start', wrap).value;
    const end = $('#c-end', wrap).value;
    if (!start || !end || end < start) throw new Error('請設定正確日期區間');
    const countries = (state.trip.countries || []).concat([{
      id: uid(), name: preset.name, code: preset.code, tz: preset.tz, currency: preset.currency, start, end,
    }]);
    await saveTrip({ countries });
  });
}

function openActivityModal(date) {
  openModal(`${date} 新增活動`, `
    <label>活動內容</label>
    <input id="a-text" placeholder="例如：淺草寺、午餐、火車" />
  `, async (wrap) => {
    const text = $('#a-text', wrap).value.trim();
    if (!text) throw new Error('請輸入活動');
    const days = { ...(state.trip.days || {}) };
    days[date] = (days[date] || []).concat([{ id: uid(), text }]);
    await saveTrip({ days });
  });
}

function openExpenseModal() {
  const members = state.trip.members;
  openModal('新增支出', `
    <label>說明</label>
    <input id="e-desc" placeholder="午餐、交通…" />
    <label>金額</label>
    <input id="e-amount" type="number" inputmode="decimal" />
    <label>幣別</label>
    <select id="e-cur">${currencyOptions('TWD')}</select>
    <label>付款人</label>
    <select id="e-payer">${members.map(m=>`<option value="${m.id}" ${m.id===state.memberId?'selected':''}>${escapeHtml(m.nickname)}</option>`).join('')}</select>
    <label class="row" style="margin-top:0.8rem"><input id="e-shared" type="checkbox" checked style="width:auto" /> <span>與旅伴分攤</span></label>
    <div id="e-split-wrap">
      <label>分攤成員</label>
      ${members.map(m=>`<label class="row"><input type="checkbox" class="e-split" value="${m.id}" checked style="width:auto" /> ${escapeHtml(m.nickname)}</label>`).join('')}
    </div>
  `, async (wrap) => {
    const desc = $('#e-desc', wrap).value.trim();
    const amount = Number($('#e-amount', wrap).value);
    const currency = $('#e-cur', wrap).value;
    const payerId = $('#e-payer', wrap).value;
    const shared = $('#e-shared', wrap).checked;
    const splitWith = $$('.e-split', wrap).filter((x) => x.checked).map((x) => x.value);
    if (!desc || !(amount > 0)) throw new Error('請填說明與金額');
    if (!CURRENCIES.includes(currency)) throw new Error('不支援的幣別');
    if (shared && !splitWith.length) throw new Error('請選擇分攤成員');
    const expenses = (state.trip.expenses || []).concat([{
      id: uid(), desc, amount, currency, payerId, shared, splitWith, createdAt: new Date().toISOString(),
    }]);
    await saveTrip({ expenses });
  });
  // toggle split section after modal exists — query from last modal
  const backdrop = $$('.modal-backdrop').at(-1);
  const shared = $('#e-shared', backdrop);
  const splitWrap = $('#e-split-wrap', backdrop);
  shared.addEventListener('change', () => {
    splitWrap.style.display = shared.checked ? '' : 'none';
  });
}

function bindHome() {
  $('#form-create').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('#create-title').value.trim();
    const nickname = $('#create-nick').value.trim();
    try {
      const data = await api('/api/trips', { method: 'POST', body: JSON.stringify({ title, nickname, countries: [] }) });
      state.trip = data.trip;
      state.tripId = data.trip.id;
      state.memberId = data.memberId;
      state.lastSync = new Date(data.trip.updatedAt).getTime();
      persistSession();
      await loadRates(false).catch(() => {});
      showApp();
      toast('旅行已建立');
    } catch (err) {
      toast(err.message);
    }
  });
  $('#form-join').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = $('#join-code').value.trim();
    const nickname = $('#join-nick').value.trim();
    try {
      const data = await api('/api/trips/join', { method: 'POST', body: JSON.stringify({ code, nickname }) });
      state.trip = data.trip;
      state.tripId = data.trip.id;
      state.memberId = data.memberId;
      state.lastSync = new Date(data.trip.updatedAt).getTime();
      persistSession();
      await loadRates(false).catch(() => {});
      showApp();
      toast('已加入旅行');
    } catch (err) {
      toast(err.message);
    }
  });
  $$('.tabs button').forEach((b) => b.addEventListener('click', () => {
    state.tab = b.dataset.tab;
    render();
  }));
}

async function boot() {
  bindHome();
  try {
    await loadRates(false);
  } catch (_) {}
  if (state.tripId && state.memberId) {
    try {
      const data = await api(`/api/trips/${state.tripId}`);
      state.trip = data.trip;
      state.lastSync = new Date(data.trip.updatedAt).getTime();
      showApp();
      return;
    } catch (_) {
      localStorage.removeItem('tp_tripId');
      localStorage.removeItem('tp_memberId');
    }
  }
  showHome();
}

boot();
