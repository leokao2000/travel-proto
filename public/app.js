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
  { name: '泰國', code: 'TH', tz: 'Asia/Bangkok', currency: 'THB' },
];
const MEALS = ['早餐', '午餐', '晚餐', '其他'];
const RIDE_TYPES = ['飛機', '火車', '巴士', '租車', '其他'];
const THEME_KEY = 'tp_theme';
const THEMES = [
  { id: 'mint', name: '淡綠', hint: '預設', header: '#ecfeff', accent: '#0f766e', soft: '#ccfbf1' },
  { id: 'lilac', name: '淡紫', hint: '', header: '#f6f0fb', accent: '#6f6288', soft: '#ece6f3' },
  { id: 'blush', name: '淡粉', hint: '', header: '#fdeff2', accent: '#a86b7c', soft: '#f8e8ec' },
  { id: 'sky', name: '淡藍', hint: '', header: '#eef6fb', accent: '#5a7c99', soft: '#e5f0f7' },
  { id: 'milk', name: '奶茶', hint: '米白', header: '#f8f1e7', accent: '#8d6b4a', soft: '#f4e7d6' },
];

/* Original landmark sketches. Swap a country's markup here (HK is the ding-ding tram). */
const COUNTRY_MARKS = {
  TW: `<path fill="currentColor" fill-opacity="0.2" d="M30 6h4v3h-4z"/><path fill="currentColor" fill-opacity="0.16" d="M27 9h10l1.5 3.5h-13z"/><path fill="currentColor" fill-opacity="0.22" d="M24 12.5h16l2 5H22z"/><path fill="currentColor" fill-opacity="0.14" d="M25 17.5h14l1.4 5h-16.8z"/><path fill="currentColor" fill-opacity="0.22" d="M27 22.5h10l1 6h-12z"/><path fill="currentColor" fill-opacity="0.16" d="M29 28.5h6V40h-6z"/><path d="M32 2.5v3.5M20 42h24"/>`,
  JP: `<path fill="currentColor" fill-opacity="0.18" d="M4 41 22 16l5 8 7-13 12 30z"/><path fill="currentColor" fill-opacity="0.38" d="M22 16l5 8 2.2-3.2z"/><path d="M46 40V27"/><g fill="currentColor" stroke="none" fill-opacity="0.55"><circle cx="46" cy="24" r="2.1"/><circle cx="50.5" cy="27" r="1.6"/><circle cx="43" cy="28.5" r="1.5"/><circle cx="49" cy="32" r="1.3"/></g>`,
  KR: `<path fill="currentColor" fill-opacity="0.22" d="M8 20c8-9 40-9 48 0l-4 3C44 16 20 16 12 23z"/><path fill="currentColor" fill-opacity="0.1" d="M16 23h32v15H16z"/><path d="M20 23v15M44 23v15M28 28h8v10h-8zM10 38h44"/>`,
  HK: `<path d="M10 12c10 6 28 6 40 0"/><path d="M30 16V9"/><rect x="12" y="16" width="40" height="10" rx="2" fill="currentColor" fill-opacity="0.14"/><rect x="12" y="26" width="40" height="11" rx="2" fill="currentColor" fill-opacity="0.2"/><path d="M17 19h5M26 19h5M35 19h5M44 19h5M17 29h5M26 29h5M35 29h5M44 29h5"/><circle cx="22" cy="41" r="2.6"/><circle cx="42" cy="41" r="2.6"/>`,
  CN: `<path fill="currentColor" fill-opacity="0.16" d="M3 34 14 24v-5h5v5l12-9v-5h5v5l16 10v5H36v-4l-5 3v5H22v-4l-5 3v6H8z"/><path d="M4 41h56"/>`,
  AU: `<path fill="currentColor" fill-opacity="0.16" d="M8 36c7-16 14-16 16 0"/><path fill="currentColor" fill-opacity="0.24" d="M18 36c8-20 16-20 20 0"/><path fill="currentColor" fill-opacity="0.14" d="M32 36c6-15 14-13 20 0"/><path d="M4 36h56M10 41h44"/>`,
  NZ: `<path d="M32 44V8"/><path d="M32 14c-8 2-12 6-14 9M32 18c8 2 12 6 14 9M32 24c-10 2-14 7-15 10M32 28c10 2 14 7 15 10M32 34c-7 1-10 5-11 7M32 37c7 1 10 5 11 7"/>`,
  FR: `<path d="M32 4 44 44H20z" fill="currentColor" fill-opacity="0.1"/><path d="M22 44 32 5l10 39M24 20h16M18 31h28M26 44h12"/><path d="M26 20 32 8l6 12"/>`,
  DE: `<path fill="currentColor" fill-opacity="0.2" d="M8 16h48v4H8z"/><path fill="currentColor" fill-opacity="0.12" d="M10 20h8v20h-8zM24 20h8v20h-8zM38 20h8v20h-8zM52 20h6v20h-6z"/><circle cx="32" cy="10" r="2.4" fill="currentColor" fill-opacity="0.35"/><path d="M24 12h16M6 40h52"/>`,
  CH: `<path fill="currentColor" fill-opacity="0.18" d="M6 42 26 8l7 12 8-16 18 38z"/><path fill="currentColor" fill-opacity="0.4" d="M26 8l7 12-3-2z"/><path d="M4 42h56"/>`,
  _: `<circle cx="24" cy="22" r="13" fill="currentColor" fill-opacity="0.12"/><path d="M11 22h26M24 9c-5 5-5 21 0 26 5-5 5-21 0-26"/><rect x="42" y="24" width="16" height="13" rx="2" fill="currentColor" fill-opacity="0.16"/><path d="M47 24v-3a3 3 0 0 1 6 0v3"/>`,
};

const ICON_FOOD = `<svg class="block-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10h14a7 7 0 0 1-14 0z" fill="currentColor" fill-opacity="0.15"/><path d="M4 10h16M8 18c1.2 1.6 6.8 1.6 8 0M12 6V3"/></svg>`;
const ICON_STAY = `<svg class="block-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17V8M4 17h16v-5H8V9" fill="currentColor" fill-opacity="0.12"/><path d="M8 12h12"/><circle cx="8.5" cy="11" r="1.3" fill="currentColor" stroke="none"/></svg>`;
const ICON_RIDE = `<svg class="block-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15c3.5-6 12.5-6 16 0"/><circle cx="7" cy="16.5" r="1.7"/><circle cx="17" cy="16.5" r="1.7"/><path d="M8 11h8"/></svg>`;

const state = {
  trip: null,
  memberId: localStorage.getItem('tp_memberId') || null,
  tripId: localStorage.getItem('tp_tripId') || null,
  tab: 'timeline',
  rates: null,
  pollTimer: null,
  lastSync: 0,
  themeOffered: false,
  googleClientId: '',
  placesEnabled: null,
  placesStatusPending: false,
  placeReviews: {},
  expandedReviews: new Set(),
  flightLookup: false,
};

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function toast(msg, ms = 2200) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
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

function applyTheme(id) {
  const theme = THEMES.find((t) => t.id === id) || THEMES[0];
  document.documentElement.dataset.theme = theme.id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme.header;
  return theme;
}

function currentThemeId() {
  return localStorage.getItem(THEME_KEY) || 'mint';
}

function themePickerHtml() {
  const current = currentThemeId();
  return `
    <div class="theme-grid">
      ${THEMES.map((t) => `
        <button type="button" class="theme-opt ${t.id === current ? 'active' : ''}" data-theme-pick="${t.id}"
          style="--swatch:${t.accent};--swatch-soft:${t.soft};--swatch-bg:${t.header}">
          <span class="swatch-dot" aria-hidden="true"></span>
          <span>${t.name}${t.hint ? `<span class="muted"> · ${t.hint}</span>` : ''}</span>
        </button>
      `).join('')}
    </div>
    <div class="muted" style="margin-top:0.45rem">只存在這台裝置，不會同步給旅伴。</div>
  `;
}

function bindThemePicker(root) {
  if (!root) return;
  $$('[data-theme-pick]', root).forEach((btn) => btn.addEventListener('click', () => {
    const id = btn.dataset.themePick;
    localStorage.setItem(THEME_KEY, id);
    const theme = applyTheme(id);
    $$('[data-theme-pick]').forEach((b) => b.classList.toggle('active', b.dataset.themePick === id));
    const heading = $('#theme-slot h2');
    if (heading) heading.textContent = '主題色';
    const lead = $('#theme-lead');
    if (lead) lead.remove();
    toast(`已套用${theme.name}`);
  }));
}

function renderHomeTheme() {
  const slot = $('#theme-slot');
  if (!slot) return;
  const seen = localStorage.getItem(THEME_KEY);
  slot.innerHTML = `
    <div class="card">
      <h2>${seen ? '主題色' : '歡迎，先選一個柔和的主題'}</h2>
      ${seen ? '' : '<div class="muted" id="theme-lead">淡綠是目前的預設色。選定後只存在這台手機，之後可在「更多」更改。</div>'}
      ${themePickerHtml()}
    </div>
  `;
  bindThemePicker(slot);
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

function calendarDate(value) {
  const match = String(value || '').trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function formatUtcOffset(raw) {
  const text = String(raw || '').trim();
  if (/^(GMT|UTC)$/i.test(text)) return 'UTC+0';
  const match = text.match(/(?:GMT|UTC)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return text.replace(/^GMT/i, 'UTC');
  const minutes = match[3] && Number(match[3]) ? `:${match[3]}` : '';
  return `UTC${match[1]}${Number(match[2])}${minutes}`;
}

function offsetLabel(tz, dateStr) {
  try {
    const day = calendarDate(dateStr);
    const instant = day ? new Date(`${day}T12:00:00Z`) : new Date();
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(instant);
    const raw = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    return formatUtcOffset(raw) || tz;
  } catch {
    return tz;
  }
}

function offsetForStay(tz, start, end) {
  const from = offsetLabel(tz, start);
  const to = end ? offsetLabel(tz, end) : from;
  return from === to ? from : `${from}–${to}`;
}

function shiftDate(dateStr, days) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function eachDate(start, end) {
  const out = [];
  if (!start || !end || end < start) return out;
  let cur = start;
  while (cur <= end && out.length < 800) {
    out.push(cur);
    cur = shiftDate(cur, 1);
  }
  return out;
}

function weekday(dateStr) {
  const names = ['日','一','二','三','四','五','六'];
  return names[new Date(dateStr + 'T12:00:00').getDay()];
}

function emptyFlights() {
  const leg = () => ({ number: '', date: '', from: '', to: '', depart: '', arrive: '' });
  return { outbound: leg(), inbound: leg() };
}

const PATTERN_EMOJIS = ['🌸','🗻','🏯','🗼','🗽','🏰','🌉','🚢','🚋','🏔️','🦘','🥝','🐼','🐉','🍜','🍣','🏖️','✈️','🗺️','🧳','🌏'];
const TIMEZONES = [
  ['Asia/Taipei', '台北'],
  ['Asia/Tokyo', '東京'],
  ['Asia/Seoul', '首爾'],
  ['Asia/Hong_Kong', '香港'],
  ['Asia/Shanghai', '上海'],
  ['Asia/Bangkok', '曼谷'],
  ['Asia/Kolkata', '印度'],
  ['Australia/Sydney', '雪梨'],
  ['Australia/Perth', '伯斯'],
  ['Pacific/Auckland', '奧克蘭'],
  ['Europe/Paris', '巴黎'],
  ['Europe/London', '倫敦'],
  ['Europe/Berlin', '柏林'],
  ['Europe/Zurich', '蘇黎世'],
  ['America/New_York', '紐約'],
  ['America/Los_Angeles', '洛杉磯'],
  ['UTC', 'UTC'],
];
const PATTERN_SLOTS = ['國家卡片', '每日小圖', '背景浮水印'];

function countrySvg(code, size) {
  const cls = size === 'sm' ? 'country-art sm' : size === 'bg' ? 'country-art watermark' : 'country-art';
  const body = COUNTRY_MARKS[code] || COUNTRY_MARKS._;
  return `<svg class="${cls}" viewBox="0 0 64 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function patternSlots(country) {
  const list = Array.isArray(country?.patterns) ? country.patterns : [];
  return [0, 1, 2].map((index) => list[index] || null);
}

function renderPattern(country, index, size) {
  const slot = patternSlots(country)[index];
  const sizeCls = size === 'sm' ? 'sm' : size === 'bg' ? 'watermark' : '';
  const cls = `country-art${sizeCls ? ` ${sizeCls}` : ''}`;
  if (slot?.kind === 'image' && String(slot.data || '').startsWith('data:image/')) {
    return `<img class="${cls}" src="${escapeHtml(slot.data)}" alt="" />`;
  }
  if (slot?.kind === 'emoji' && slot.text) {
    return `<span class="${cls} country-emoji" aria-hidden="true">${escapeHtml(slot.text)}</span>`;
  }
  const code = slot?.kind === 'builtin' && slot.id ? slot.id : country?.code;
  return countrySvg(code, size);
}

const PATTERN_MARKS = [
  ['TW', '台灣'], ['JP', '日本'], ['KR', '韓國'], ['HK', '香港'], ['CN', '中國'],
  ['AU', '澳洲'], ['NZ', '紐西蘭'], ['FR', '法國'], ['DE', '德國'], ['CH', '瑞士'],
  ['_', '地球'],
];

function countryKey(country) {
  const list = state.trip?.countries || [];
  const index = Math.max(0, list.indexOf(country));
  if (country?.id) return `id:${country.id}`;
  return `legacy:${index}:${country?.code || ''}:${calendarDate(country?.start)}:${calendarDate(country?.end)}`;
}

function countryByKey(key) {
  return (state.trip?.countries || []).find((country) => countryKey(country) === key) || null;
}

function groupConsecutive(days) {
  const ranges = [];
  for (const day of [...new Set(days)].filter(Boolean).sort()) {
    const last = ranges[ranges.length - 1];
    if (last && shiftDate(last[1], 1) === day) last[1] = day;
    else ranges.push([day, day]);
  }
  return ranges;
}

function presetByCode(code, source) {
  const known = COUNTRY_PRESETS.find((preset) => preset.code === code);
  if (known) return known;
  if (source && (source.code || '_') === (code || '_')) {
    return { name: source.name || '其他', code: source.code || '_', tz: source.tz || 'UTC', currency: source.currency || 'TWD' };
  }
  return { name: '其他', code: code || '_', tz: 'UTC', currency: 'TWD' };
}

function cleanPatterns(slots) {
  const next = [0, 1, 2].map((index) => {
    const slot = slots?.[index];
    if (!slot || typeof slot !== 'object') return null;
    if (slot.kind === 'builtin' && COUNTRY_MARKS[slot.id]) return { kind: 'builtin', id: slot.id };
    const text = String(slot.text || '').trim().slice(0, 8);
    if (slot.kind === 'emoji' && text) return { kind: 'emoji', text };
    if (slot.kind === 'image' && String(slot.data || '').startsWith('data:image/') && slot.data.length <= 45000) {
      return { kind: 'image', data: slot.data };
    }
    return null;
  });
  return next.some(Boolean) ? next : undefined;
}

function applyDayCountry(targetDates, preset, tz, patterns) {
  const dateSet = new Set(targetDates.map(calendarDate).filter(Boolean));
  const countries = (state.trip.countries || []).flatMap((country) => {
    const covered = eachDate(calendarDate(country.start), calendarDate(country.end));
    if (!covered.some((day) => dateSet.has(day))) return [{ ...country, id: country.id || uid() }];
    const remain = covered.filter((day) => !dateSet.has(day));
    return groupConsecutive(remain).map(([start, end], index) => ({
      ...country,
      id: index === 0 && country.id ? country.id : uid(),
      start,
      end,
    }));
  });
  const cleaned = cleanPatterns(patterns);
  for (const [start, end] of groupConsecutive([...dateSet])) {
    const record = {
      id: uid(),
      name: preset.name,
      code: preset.code,
      tz,
      currency: preset.currency,
      start,
      end,
    };
    if (cleaned) record.patterns = cleaned;
    countries.push(record);
  }
  countries.sort((a, b) => String(a.start).localeCompare(String(b.start)) || String(a.name).localeCompare(String(b.name), 'zh-Hant'));
  return countries;
}

function legSummary(leg) {
  if (!leg) return '尚未填寫';
  const parts = [];
  if (leg.number) parts.push(leg.number);
  if (leg.date) parts.push(leg.date);
  if (leg.from || leg.to) parts.push(`${leg.from || '—'} → ${leg.to || '—'}`);
  if (leg.depart || leg.arrive) parts.push(`${leg.depart || '—'} 起飛 · ${leg.arrive || '—'} 抵達`);
  return parts.length ? parts.join(' · ') : '尚未填寫';
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('無法讀取這張圖片'));
    };
    img.src = url;
  });
}

async function fileToPatternData(file) {
  if (!file) throw new Error('請選擇圖片');
  const type = String(file.type || '');
  if (/heic|heif/i.test(type) || /\.heic$/i.test(file.name || '')) throw new Error('請先把照片轉成 JPEG 再上傳');
  if (type && !type.startsWith('image/')) throw new Error('請選擇圖片');
  const img = await loadImageElement(file);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const scale = Math.max(128 / img.width, 128 / img.height);
  const width = img.width * scale;
  const height = img.height * scale;
  ctx.drawImage(img, (128 - width) / 2, (128 - height) / 2, width, height);
  let mime = 'image/webp';
  let quality = 0.72;
  let url = canvas.toDataURL(mime, quality);
  if (!url.startsWith('data:image/webp')) {
    mime = 'image/jpeg';
    url = canvas.toDataURL(mime, quality);
  }
  while (url.length > 40000 && quality > 0.36) {
    quality -= 0.08;
    url = canvas.toDataURL(mime, quality);
  }
  if (!url.startsWith('data:image/') || url.length > 45000) throw new Error('單張圖案請小於 30KB');
  return url;
}

function mapHref(place) {
  const p = String(place || '').trim();
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p)}`;
}

function placeHtml(place) {
  const p = String(place || '').trim();
  if (!p) return '';
  const label = /^https?:\/\//i.test(p) ? '地圖連結' : escapeHtml(p);
  return `<div class="place-line"><a href="${escapeHtml(mapHref(p))}" target="_blank" rel="noopener noreferrer">${label}<span class="map-link">地圖</span></a></div>`;
}

function countryForDate(trip, date) {
  const list = trip?.countries || [];
  const day = calendarDate(date);
  if (!day) return list[0] || null;
  return list.find((c) => {
    const start = calendarDate(c.start);
    const end = calendarDate(c.end);
    return start && end && day >= start && day <= end;
  }) || null;
}

function placeSearchQuery(entry, trip, date) {
  const parts = [];
  const name = String(entry?.name || '').trim();
  if (name) parts.push(name);
  const place = String(entry?.place || '').trim();
  if (place && !/^https?:\/\//i.test(place)) parts.push(place);
  const countryName = countryForDate(trip, date)?.name || entry?.countryName || '';
  if (countryName && !parts.join(' ').includes(countryName)) parts.push(countryName);
  return parts.join(' ').slice(0, 200);
}

function restaurantSearchQuery(restaurant, trip) {
  return placeSearchQuery(restaurant, trip, restaurant?.date);
}

function mapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function chosenPlaceCandidate(entry, query) {
  const data = query ? state.placeReviews[query] : null;
  if (!data || data.loading || data.enabled === false || data.error || !Array.isArray(data.candidates)) return null;
  const candidates = data.candidates;
  if (!candidates.length) return { candidates, chosen: null };
  if (candidates.length === 1) return { candidates, chosen: candidates[0] };
  const chosen = entry?.placeId ? candidates.find((c) => c.id === entry.placeId) : null;
  return { candidates, chosen: chosen || null };
}

function placesCardHtml(entry, query, kind) {
  const searchHref = mapsSearchUrl(query || entry?.name || '');
  const match = chosenPlaceCandidate(entry, query);
  const chosen = match?.chosen;
  const many = (match?.candidates.length || 0) > 1;
  const href = chosen?.googleMapsUri || searchHref;
  const reviews = (chosen?.reviews || []).slice(0, 3).filter((rev) => rev.text);
  const stars = chosen?.rating != null ? `★ ${Number(chosen.rating).toFixed(1)}` : '';
  const countLabel = chosen && Number.isFinite(Number(chosen.userRatingCount))
    ? `${Number(chosen.userRatingCount).toLocaleString('zh-TW')} 則評價`
    : '';
  const pickLabel = many ? (chosen ? '更換分店' : `選擇分店（${match.candidates.length}）`) : '';
  const reviewKey = `${kind}:${entry.id}`;
  const reviewsOpen = state.expandedReviews.has(reviewKey);
  const summary = [stars, countLabel].filter(Boolean).join(' · ');
  const reviewBlock = chosen && (stars || countLabel || reviews.length) ? `
      <div class="place-reviews">
        <button type="button" class="review-toggle" data-review-toggle="${escapeHtml(reviewKey)}" aria-expanded="${reviewsOpen ? 'true' : 'false'}">
          <span class="review-toggle-text">${summary ? `${summary} · ` : ''}Google 評論（${reviews.length}）</span>
          <span class="review-chevron" aria-hidden="true">${reviewsOpen ? '▾' : '▸'}</span>
        </button>
        <div class="review-panel"${reviewsOpen ? '' : ' hidden'}>
          ${reviews.length ? `<ul class="place-snippets">${reviews.map((rev) => `<li>${escapeHtml(rev.text)}${rev.author ? `<span class="muted"> — ${escapeHtml(rev.author)}</span>` : ''}</li>`).join('')}</ul>` : '<div class="muted">沒有可顯示的短評</div>'}
          <div class="places-attr">評價資料來自 <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Google</a></div>
        </div>
      </div>
    ` : '';
  return `
    ${chosen && (chosen.name || chosen.address) ? `<div class="place-branch">${chosen.name ? `<div>${escapeHtml(chosen.name)}</div>` : ''}${chosen.address ? `<div>${escapeHtml(chosen.address)}</div>` : ''}</div>` : ''}
    ${reviewBlock}
    ${pickLabel ? `<button type="button" class="branch-pick" data-pick-branch="${escapeHtml(entry.id)}" data-branch-kind="${kind}">${pickLabel}</button>` : ''}
    <a class="reviews-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">看 Google 評價</a>
  `;
}

function bindReviewToggles(root) {
  $$('[data-review-toggle]', root).forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.reviewToggle;
    const open = !state.expandedReviews.has(key);
    if (open) state.expandedReviews.add(key);
    else state.expandedReviews.delete(key);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    const chevron = button.querySelector('.review-chevron');
    if (chevron) chevron.textContent = open ? '▾' : '▸';
    const panel = button.parentElement?.querySelector('.review-panel');
    if (panel) panel.hidden = !open;
  }));
}

function keptPlaceId(item, fields) {
  if (!item?.placeId) return '';
  if (String(item.name || '').trim() !== String(fields.name || '').trim()) return '';
  if (String(item.place || '').trim() !== String(fields.place || '').trim()) return '';
  return item.placeId;
}

function telHref(phone) {
  const dial = String(phone || '').replace(/[^\d+]/g, '');
  return dial ? `tel:${dial}` : '';
}

function contactHtml(entry) {
  const address = String(entry?.address || '').trim();
  const phone = String(entry?.phone || '').trim();
  const mapsUrl = String(entry?.mapsUrl || '').trim();
  const addressHref = mapsUrl || (address ? mapsSearchUrl(address) : '');
  const phoneHref = telHref(phone);
  return `
    ${address && addressHref ? `<div class="place-line"><a href="${escapeHtml(addressHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(address)}<span class="map-link">地圖</span></a></div>` : ''}
    ${!address && mapsUrl ? `<div class="place-line"><a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer">Google 地圖</a></div>` : ''}
    ${phone ? `<div class="place-line">${phoneHref ? `<a href="${escapeHtml(phoneHref)}">${escapeHtml(phone)}</a>` : escapeHtml(phone)}</div>` : ''}
  `;
}

function contactFromCandidate(place) {
  return {
    placeId: place.id,
    address: String(place.address || '').trim().slice(0, 200),
    phone: String(place.phone || '').trim().slice(0, 40),
    mapsUrl: String(place.googleMapsUri || '').trim().slice(0, 500),
  };
}

function blankContactPatch(entry, place) {
  const patch = {};
  if (!String(entry.address || '').trim() && place.address) patch.address = String(place.address).trim().slice(0, 200);
  if (!String(entry.phone || '').trim() && place.phone) patch.phone = String(place.phone).trim().slice(0, 40);
  if (!String(entry.mapsUrl || '').trim() && place.googleMapsUri) patch.mapsUrl = String(place.googleMapsUri).trim().slice(0, 500);
  return patch;
}

function ensurePlaceReviews(queries) {
  const unique = [...new Set((queries || []).filter(Boolean))];
  if (state.placesEnabled === false) return;
  if (state.placesEnabled == null) {
    if (state.placesStatusPending) return;
    state.placesStatusPending = true;
    api('/api/places/status').then((s) => {
      state.placesEnabled = !!s.enabled;
      state.placesStatusPending = false;
      if (state.placesEnabled) ensurePlaceReviews(unique);
    }).catch(() => {
      state.placesEnabled = false;
      state.placesStatusPending = false;
    });
    return;
  }
  for (const query of unique) {
    if (state.placeReviews[query]) continue;
    state.placeReviews[query] = { loading: true };
    api(`/api/places/reviews?q=${encodeURIComponent(query)}`).then((data) => {
      state.placeReviews[query] = data;
      if (state.tab === 'timeline' && state.placesEnabled) render();
    }).catch(() => {
      state.placeReviews[query] = { enabled: true, error: true };
    });
  }
}

function applySingleCandidateContact(entries) {
  if (!state.placesEnabled || !state.trip) return;
  const food = new Map();
  const stay = new Map();
  for (const item of entries || []) {
    const match = chosenPlaceCandidate(item.entry, item.query);
    if (!match || match.candidates.length !== 1 || !match.chosen) continue;
    const patch = blankContactPatch(item.entry, match.chosen);
    if (!Object.keys(patch).length) continue;
    const bucket = item.kind === 'stay' ? stay : food;
    if (!bucket.has(item.entry.id)) bucket.set(item.entry.id, patch);
  }
  if (!food.size && !stay.size) return;
  const token = [...food.keys(), ...stay.keys()].sort().join('|');
  if (state.contactFillToken === token) return;
  state.contactFillToken = token;
  const body = {};
  if (food.size) {
    body.restaurants = (state.trip.restaurants || []).map((r) => food.has(r.id) ? { ...r, ...food.get(r.id) } : r);
  }
  if (stay.size) {
    body.lodgings = (state.trip.lodgings || []).map((l) => stay.has(l.id) ? { ...l, ...stay.get(l.id) } : l);
  }
  saveTrip(body).finally(() => {
    if (state.contactFillToken === token) state.contactFillToken = '';
  });
}

function normalizeTrip(trip) {
  if (!trip) return trip;
  trip.countries = Array.isArray(trip.countries) ? trip.countries : [];
  trip.members = Array.isArray(trip.members) ? trip.members : [];
  trip.expenses = Array.isArray(trip.expenses) ? trip.expenses : [];
  trip.restaurants = Array.isArray(trip.restaurants) ? trip.restaurants : [];
  trip.lodgings = Array.isArray(trip.lodgings) ? trip.lodgings : [];
  trip.transports = Array.isArray(trip.transports) ? trip.transports : [];
  const rawFlights = trip.flights && typeof trip.flights === 'object' ? trip.flights : {};
  const leg = (value) => ({
    number: value?.number || '',
    date: value?.date || '',
    from: value?.from || '',
    to: value?.to || '',
    depart: value?.depart || '',
    arrive: value?.arrive || '',
  });
  trip.flights = { outbound: leg(rawFlights.outbound), inbound: leg(rawFlights.inbound) };
  const days = trip.days && typeof trip.days === 'object' ? trip.days : {};
  for (const key of Object.keys(days)) {
    if (!Array.isArray(days[key])) days[key] = [];
    days[key] = days[key].map((a) => {
      if (!a || typeof a !== 'object') return { id: uid(), text: String(a || '') };
      if (!a.id) return { ...a, id: uid() };
      return a;
    });
  }
  trip.days = days;
  return trip;
}

function adoptTrip(trip) {
  state.trip = normalizeTrip(trip);
  state.lastSync = new Date(trip.updatedAt).getTime();
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

let saveChain = Promise.resolve();

function saveTrip(patch) {
  const run = async () => {
    if (!state.trip) return;
    const body = {
      memberId: state.memberId,
      title: patch.title ?? state.trip.title,
      countries: patch.countries ?? state.trip.countries,
      days: patch.days ?? state.trip.days,
      expenses: patch.expenses ?? state.trip.expenses,
      restaurants: patch.restaurants ?? state.trip.restaurants ?? [],
      lodgings: patch.lodgings ?? state.trip.lodgings ?? [],
      transports: patch.transports ?? state.trip.transports ?? [],
      flights: patch.flights ?? state.trip.flights ?? emptyFlights(),
    };
    const data = await api(`/api/trips/${state.trip.id}`, { method: 'PUT', body: JSON.stringify(body) });
    adoptTrip(data.trip);
    render();
  };
  saveChain = saveChain.then(run, run);
  return saveChain;
}

function startPolling() {
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    if (!state.trip) return;
    try {
      const data = await api(`/api/trips/${state.trip.id}?since=${state.lastSync}`);
      if (!data.unchanged && data.trip) {
        adoptTrip(data.trip);
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
  notifyDrafts();
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
      continue;
    }
    const splitWith = (e.splitWith && e.splitWith.length ? e.splitWith : members.map((m) => m.id));
    const n = splitWith.length || 1;
    const share = twd / n;
    groupTotalTwd += twd;
    bal[e.payerId] = (bal[e.payerId] || 0) + twd;
    for (const mid of splitWith) bal[mid] = (bal[mid] || 0) - share;
  }
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

function countriesOnDate(trip, date) {
  const day = calendarDate(date);
  if (!day) return [];
  return (trip.countries || []).filter((c) => {
    const start = calendarDate(c.start);
    const end = calendarDate(c.end);
    return start && end && day >= start && day <= end;
  });
}

function buildTimelineDays() {
  const trip = state.trip;
  const map = new Map();
  const ensure = (date) => {
    const day = calendarDate(date);
    if (!day) return;
    if (!map.has(day)) map.set(day, countriesOnDate(trip, day));
  };
  for (const country of trip.countries || []) {
    for (const day of eachDate(calendarDate(country.start), calendarDate(country.end))) ensure(day);
  }
  for (const lodging of trip.lodgings || []) {
    for (const day of eachDate(calendarDate(lodging.checkIn), calendarDate(lodging.checkOut))) ensure(day);
  }
  for (const [day, list] of Object.entries(trip.days || {})) {
    if (Array.isArray(list) && list.length) ensure(day);
  }
  for (const restaurant of trip.restaurants || []) ensure(restaurant.date);
  for (const ride of trip.transports || []) {
    ensure(ride.date);
    ensure(settleOvernightDate(ride.date, ride.depart, ride.arrive, ride.arriveDate));
  }
  for (const [day, list] of Object.entries(trip.days || {})) {
    for (const activity of list || []) ensure(settleOvernightDate(day, activity?.time, activity?.endTime, activity?.endDate));
  }
  ensure(trip.flights?.outbound?.date);
  ensure(trip.flights?.inbound?.date);
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function sortedByTime(list, field) {
  return list.map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ta = a.item[field] || '99:99';
      const tb = b.item[field] || '99:99';
      if (ta !== tb) return ta < tb ? -1 : 1;
      return a.index - b.index;
    })
    .map((x) => x.item);
}

function activityName(a) {
  return String(a?.text || a?.name || '').trim();
}

function effectiveArriveDate(ride) {
  return settleOvernightDate(ride?.date, ride?.depart, ride?.arrive, ride?.arriveDate);
}

function effectiveActivityEnd(activity, startDate) {
  return settleOvernightDate(startDate, activity?.time, activity?.endTime, activity?.endDate);
}

function rideIsOvernight(ride) {
  const start = calendarDate(ride?.date);
  const end = effectiveArriveDate(ride);
  return !!(start && end && end > start);
}

function activityIsOvernight(activity, startDate) {
  const start = calendarDate(startDate);
  const end = effectiveActivityEnd(activity, startDate);
  return !!(start && end && end > start);
}

function settleOvernightDate(startDate, startTime, endTime, explicitEnd) {
  const start = calendarDate(startDate);
  const chosen = calendarDate(explicitEnd);
  if (chosen && start && chosen < start) return '';
  if (chosen && start && chosen > start) return chosen;
  if (start && startTime && endTime && endTime < startTime) return shiftDate(start, 1);
  return '';
}

function overnightStayTitle(ride) {
  return ride?.type === '飛機' ? '紅眼航班' : '夜車';
}

function rideScheduleText(ride, continuation) {
  const start = calendarDate(ride?.date);
  const end = effectiveArriveDate(ride);
  if (continuation) return ride?.arrive ? `${ride.arrive} 抵達` : '隔天續';
  if (rideIsOvernight(ride)) {
    const when = end === shiftDate(start, 1) ? '隔天' : end;
    const tail = ride.arrive ? `${when} ${ride.arrive} 抵達` : `${when}抵達`;
    return `${ride.depart ? `${ride.depart} 出發 ` : ''}→ ${tail}`;
  }
  const parts = [];
  if (ride?.depart) parts.push(`${ride.depart} 出發`);
  if (ride?.arrive) parts.push(`${ride.arrive} 抵達`);
  return parts.join(' · ');
}

function activityScheduleText(activity, startDate, continuation) {
  if (continuation) return activity?.endTime ? `${activity.endTime} 結束` : '隔天續';
  const end = effectiveActivityEnd(activity, startDate);
  if (activityIsOvernight(activity, startDate) && activity?.endTime) {
    const when = end === shiftDate(startDate, 1) ? '隔天' : end;
    return `${activity.time || ''}–${when} ${activity.endTime}`.replace(/^–/, '');
  }
  if (activity?.endTime) return `${activity.time ? `${activity.time}–` : ''}${activity.endTime}`;
  return activity?.time || '';
}

function ridesContinuing(date) {
  return (state.trip?.transports || []).filter((ride) => effectiveArriveDate(ride) === date && calendarDate(ride.date) !== date);
}

function activitiesContinuing(date) {
  const out = [];
  for (const [day, list] of Object.entries(state.trip?.days || {})) {
    for (const activity of list || []) {
      if (effectiveActivityEnd(activity, day) === date && day !== date) out.push({ ...activity, startDate: day });
    }
  }
  return out;
}

function stayStatus(lodging, date) {
  const day = calendarDate(date);
  const start = calendarDate(lodging.checkIn);
  const end = calendarDate(lodging.checkOut);
  if (day && start && day === start && day === end) return '當日';
  if (day && start && day === start) return '入住';
  if (day && end && day === end) return '退房';
  return '住宿中';
}

function lodgingOn(date) {
  const day = calendarDate(date);
  if (!day) return [];
  return (state.trip.lodgings || []).filter((l) => {
    const start = calendarDate(l.checkIn);
    const end = calendarDate(l.checkOut);
    return start && end && end >= start && day >= start && day <= end;
  });
}

function blockPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(`tp_blocks_${state.tripId}`) || '{}');
    return {
      activity: raw.activity !== false,
      food: raw.food !== false,
      stay: raw.stay !== false,
      ride: raw.ride !== false,
    };
  } catch {
    return { activity: true, food: true, stay: true, ride: true };
  }
}

function saveBlockPrefs(prefs) {
  localStorage.setItem(`tp_blocks_${state.tripId}`, JSON.stringify(prefs));
}

function blockCounts(trip) {
  const activity = Object.values(trip.days || {}).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0);
  return {
    activity,
    food: (trip.restaurants || []).length,
    stay: (trip.lodgings || []).length,
    ride: (trip.transports || []).length,
  };
}

function blockToggleHtml(key, label, count, on) {
  const badge = count > 0 ? `<span class="toggle-count">${count}</span>` : '';
  return `<button type="button" class="block-toggle${on ? ' on' : ''}" data-toggle-block="${key}" aria-pressed="${on ? 'true' : 'false'}">${label}${badge}</button>`;
}

function renderTimeline() {
  const el = $('#tab-timeline');
  const trip = state.trip;
  const days = buildTimelineDays();
  const prefs = blockPrefs();
  const counts = blockCounts(trip);
  const reviewQueries = [];
  const reviewEntries = [];
  const countryNames = [...new Set((trip.countries || []).map((c) => c.name).filter(Boolean))];
  const planningSummary = countryNames.length ? countryNames.join('、') : '尚未加入國家';
  const planningOpen = state.expandedReviews.has('planning');
  const flights = trip.flights || emptyFlights();
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
      <div class="invite-actions">
        <button class="secondary" id="btn-import" type="button">匯入行程</button>
        <button class="secondary" id="btn-save-device-timeline" type="button">💾 儲存備份</button>
      </div>
    </div>
    <div class="card" id="planning-card">
      <button type="button" class="review-toggle" data-review-toggle="planning" aria-expanded="${planningOpen ? 'true' : 'false'}">
        <span class="review-toggle-text">國家與時區 · ${escapeHtml(planningSummary)}</span>
        <span class="review-chevron" aria-hidden="true">${planningOpen ? '▾' : '▸'}</span>
      </button>
      <div class="review-panel" id="planning-panel"${planningOpen ? '' : ' hidden'}>
        <div class="muted">同一趟旅行可跨多國；日期依序展開成時間軸。</div>
        ${(trip.countries || []).map((c, idx) => `
          <div class="country-card" data-idx="${idx}">
            ${renderPattern(c, 0)}
            <div class="country-copy">
              <div class="day-head">
                <strong>${escapeHtml(c.name)}</strong>
                <span>
                  <button class="ghost" data-add-stay-country="${idx}" type="button">住宿</button>
                  <button class="ghost" data-remove-country="${idx}" type="button">移除</button>
                </span>
              </div>
              <div class="muted">${escapeHtml(c.tz)} · ${escapeHtml(offsetForStay(c.tz, c.start, c.end))}</div>
              <div class="muted">${c.start || '?'} → ${c.end || '?'} · 幣別 ${c.currency || '—'}</div>
            </div>
          </div>
        `).join('') || '<div class="muted">尚未加入國家</div>'}
        <button type="button" id="btn-add-country">新增國家</button>
        <div class="flight-block">
          <div class="flight-line">
            <div><strong>去程航班</strong><div class="muted">${escapeHtml(legSummary(flights.outbound))}</div></div>
            <button type="button" class="ghost" data-edit-flight="outbound">編輯</button>
          </div>
          <div class="flight-line">
            <div><strong>回程航班</strong><div class="muted">${escapeHtml(legSummary(flights.inbound))}</div></div>
            <button type="button" class="ghost" data-edit-flight="inbound">編輯</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <h2>行程時間軸</h2>
      <div class="block-toggles" role="group" aria-label="顯示分類">
        ${blockToggleHtml('activity', '活動', counts.activity, prefs.activity)}
        ${blockToggleHtml('food', '餐廳', counts.food, prefs.food)}
        ${blockToggleHtml('stay', '住宿', counts.stay, prefs.stay)}
        ${blockToggleHtml('ride', '交通', counts.ride, prefs.ride)}
      </div>
      ${days.length ? days.map(([date, countries]) => {
        const acts = sortedByTime(trip.days?.[date] || [], 'time');
        const actNext = activitiesContinuing(date);
        const foods = sortedByTime((trip.restaurants || []).filter((r) => r.date === date), 'time');
        const stays = lodgingOn(date);
        const rides = sortedByTime((trip.transports || []).filter((r) => r.date === date), 'depart');
        const rideNext = ridesContinuing(date).filter((r) => calendarDate(r.date) !== date);
        const nightRide = (trip.transports || []).find((r) => calendarDate(r.date) === date && rideIsOvernight(r));
        const morningRide = rideNext[0];
        const hasNightBed = !!nightLodging(date);
        return `
          <div class="day">
            ${countries[0] ? `<div class="day-mark">${renderPattern(countries[0], 2, 'bg')}</div>` : ''}
            <div class="day-head">
              <div>
                <strong>${date}（週${weekday(date)}）</strong>
                <div>${countries.map((c) => `<button type="button" class="chip" data-chip-date="${date}" data-country-key="${escapeHtml(countryKey(c))}" aria-label="更改${escapeHtml(c.name)}">${renderPattern(c, 1, 'sm')}${escapeHtml(c.name)} ${escapeHtml(offsetLabel(c.tz, date))}</button>`).join(' ')}</div>
              </div>
              <button class="ghost ${prefs.activity ? '' : 'hidden'}" data-add-act="${date}" type="button">+ 活動</button>
            </div>
            <div class="timeline ${prefs.activity ? '' : 'hidden'}">
              ${acts.map((a) => {
                const clock = activityScheduleText(a, date, false);
                return `
                <div class="activity">
                  <div class="activity-main">
                    <div>${clock ? `<span class="act-time">${escapeHtml(clock)}</span>` : ''}${escapeHtml(activityName(a) || '（未命名）')}</div>
                    ${placeHtml(a.place)}
                  </div>
                  <div class="item-actions">
                    <button class="ghost" data-edit-act="${a.id}" data-act-date="${date}" type="button">改</button>
                    <button class="ghost" data-del-act="${a.id}" data-act-date="${date}" type="button">刪</button>
                  </div>
                </div>`;
              }).join('')}
              ${actNext.map((a) => `
                <div class="activity continuation">
                  <div class="activity-main">
                    <div><span class="act-time">續</span>${escapeHtml(activityName(a) || '（未命名）')} <span class="muted">${escapeHtml(activityScheduleText(a, a.startDate, true))}</span></div>
                    ${placeHtml(a.place)}
                  </div>
                  <div class="item-actions">
                    <button class="ghost" data-edit-act="${a.id}" data-act-date="${a.startDate}" type="button">改</button>
                    <button class="ghost" data-del-act="${a.id}" data-act-date="${a.startDate}" type="button">刪</button>
                  </div>
                </div>
              `).join('') || (acts.length ? '' : '<div class="muted" style="padding-top:0.4rem">尚無活動</div>')}
            </div>
            <div class="day-blocks ${prefs.food || prefs.stay || prefs.ride ? '' : 'hidden'}">
              <section class="block block-food ${prefs.food ? '' : 'hidden'}">
                <div class="block-head">${ICON_FOOD}<h3 class="block-title">餐廳</h3><button class="secondary slim" type="button" data-add-food="${date}">新增</button></div>
                ${foods.map((r) => {
                  const query = restaurantSearchQuery(r, trip);
                  if (query) reviewQueries.push(query);
                  reviewEntries.push({ kind: 'food', entry: r, query });
                  return `
                  <div class="block-card">
                    <div class="block-card-top">
                      <div><strong>${escapeHtml(r.name || '（未命名）')}</strong><span class="pill">${escapeHtml(r.meal || '其他')}</span>${r.time ? `<div class="muted">${escapeHtml(r.time)}</div>` : ''}</div>
                      <div class="item-actions">
                        <button class="ghost" type="button" data-edit-food="${r.id}">改</button>
                        <button class="ghost" type="button" data-del-food="${r.id}">刪</button>
                      </div>
                    </div>
                    ${placeHtml(r.place)}
                    ${contactHtml(r)}
                    ${r.note ? `<div class="muted note-line">${escapeHtml(r.note)}</div>` : ''}
                    ${placesCardHtml(r, query, 'food')}
                  </div>
                `;
                }).join('') || '<div class="empty-line">尚無餐廳</div>'}
              </section>
              <section class="block block-stay ${prefs.stay ? '' : 'hidden'}">
                <div class="block-head">${ICON_STAY}<h3 class="block-title">住宿</h3><button class="secondary slim" type="button" data-add-stay="${date}">新增</button></div>
                ${(() => {
                  if (hasNightBed) return '';
                  const ride = nightRide || (!stays.length ? morningRide : null);
                  if (!ride) return '';
                  const arriving = !nightRide;
                  const title = overnightStayTitle(ride);
                  return `
                    <div class="block-card overnight-stay">
                      <div class="block-card-top">
                        <div>
                          <strong>${title}</strong><span class="pill">${arriving ? '抵達' : '過夜'}</span>
                          <div class="muted">${escapeHtml(ride.from || '—')} → ${escapeHtml(ride.to || '—')}</div>
                          <div class="muted">${escapeHtml(rideScheduleText(ride, arriving))}</div>
                        </div>
                        <div class="item-actions">
                          <button class="ghost" type="button" data-edit-ride="${ride.id}">改</button>
                        </div>
                      </div>
                    </div>`;
                })()}
                ${stays.map((l) => {
                  const query = placeSearchQuery(l, trip, l.checkIn);
                  if (query) reviewQueries.push(query);
                  reviewEntries.push({ kind: 'stay', entry: l, query });
                  return `
                  <div class="block-card">
                    <div class="block-card-top">
                      <div>
                        <strong>${escapeHtml(l.name || '（未命名）')}</strong><span class="pill">${stayStatus(l, date)}</span>
                        <div class="muted">${escapeHtml(calendarDate(l.checkIn) || l.checkIn)} → ${escapeHtml(calendarDate(l.checkOut) || l.checkOut)}${l.countryName ? ` · ${escapeHtml(l.countryName)}` : ''}</div>
                      </div>
                      <div class="item-actions">
                        <button class="ghost" type="button" data-edit-stay="${l.id}">改</button>
                        <button class="ghost" type="button" data-del-stay="${l.id}">刪</button>
                      </div>
                    </div>
                    ${placeHtml(l.place)}
                    ${contactHtml(l)}
                    ${l.note ? `<div class="muted note-line">${escapeHtml(l.note)}</div>` : ''}
                    ${placesCardHtml(l, query, 'stay')}
                  </div>
                `;
                }).join('') || ((hasNightBed || nightRide || (!stays.length && morningRide)) ? '' : '<div class="empty-line">尚無住宿</div>')}
              </section>
              <section class="block block-ride ${prefs.ride ? '' : 'hidden'}">
                <div class="block-head">${ICON_RIDE}<h3 class="block-title">交通</h3><button class="secondary slim" type="button" data-add-ride="${date}">新增</button></div>
                ${rides.map((r) => `
                  <div class="block-card">
                    <div class="block-card-top">
                      <div>
                        <strong>${escapeHtml(r.from || '—')} → ${escapeHtml(r.to || '—')}</strong><span class="pill">${escapeHtml(r.type || '其他')}</span>
                        <div class="muted">${escapeHtml(rideScheduleText(r, false))}</div>
                      </div>
                      <div class="item-actions">
                        <button class="ghost" type="button" data-edit-ride="${r.id}">改</button>
                        <button class="ghost" type="button" data-del-ride="${r.id}">刪</button>
                      </div>
                    </div>
                    ${r.note ? `<div class="muted note-line">${escapeHtml(r.note)}</div>` : ''}
                  </div>
                `).join('')}
                ${rideNext.map((r) => `
                  <div class="block-card continuation">
                    <div class="block-card-top">
                      <div>
                        <strong>續 · ${escapeHtml(r.from || '—')} → ${escapeHtml(r.to || '—')}</strong><span class="pill">${escapeHtml(r.type || '其他')}</span>
                        <div class="muted">${escapeHtml(rideScheduleText(r, true))}</div>
                      </div>
                      <div class="item-actions">
                        <button class="ghost" type="button" data-edit-ride="${r.id}">改</button>
                        <button class="ghost" type="button" data-del-ride="${r.id}">刪</button>
                      </div>
                    </div>
                  </div>
                `).join('') || (rides.length ? '' : '<div class="empty-line">尚無交通</div>')}
              </section>
            </div>
          </div>
        `;
      }).join('') : '<div class="muted">請先為國家設定日期區間</div>'}
    </div>
  `;
  ensurePlaceReviews(reviewQueries);
  applySingleCandidateContact(reviewEntries);
  bindReviewToggles(el);
  $$('[data-pick-branch]', el).forEach((btn) => btn.addEventListener('click', () => {
    const kind = btn.dataset.branchKind;
    const entry = kind === 'stay'
      ? (trip.lodgings || []).find((l) => l.id === btn.dataset.pickBranch)
      : (trip.restaurants || []).find((r) => r.id === btn.dataset.pickBranch);
    if (!entry) return;
    const query = kind === 'stay' ? placeSearchQuery(entry, trip, entry.checkIn) : restaurantSearchQuery(entry, trip);
    openBranchSheet({ kind, entry, candidates: state.placeReviews[query]?.candidates || [] });
  }));
  $$('[data-toggle-block]', el).forEach((btn) => btn.addEventListener('click', () => {
    const prefsNow = blockPrefs();
    const key = btn.dataset.toggleBlock;
    prefsNow[key] = !prefsNow[key];
    saveBlockPrefs(prefsNow);
    render();
  }));
  $('#btn-import')?.addEventListener('click', () => openImportSheet());
  $('#btn-save-device-timeline')?.addEventListener('click', async () => {
    try {
      await saveDeviceBackup();
      state.tab = 'more';
      render();
      requestAnimationFrame(() => {
        document.getElementById('backup-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      toast(err.message || '無法存到這台裝置');
    }
  });
  $('#btn-copy-code')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(trip.code);
      toast('已複製邀請碼');
    } catch {
      toast(trip.code);
    }
  });
  $('#btn-add-country')?.addEventListener('click', openCountryModal);
  $$('[data-edit-flight]', el).forEach((btn) => btn.addEventListener('click', () => openFlightModal(btn.dataset.editFlight)));
  $$('[data-country-key]', el).forEach((btn) => btn.addEventListener('click', () => {
    const country = countryByKey(btn.dataset.countryKey);
    if (country) openDayCountrySheet(country, btn.dataset.chipDate);
  }));
  $$('[data-remove-country]', el).forEach((btn) => btn.addEventListener('click', async () => {
    const idx = Number(btn.dataset.removeCountry);
    const countries = trip.countries.slice();
    countries.splice(idx, 1);
    await saveTrip({ countries });
  }));
  $$('[data-add-stay-country]', el).forEach((btn) => btn.addEventListener('click', () => {
    const country = trip.countries[Number(btn.dataset.addStayCountry)];
    if (country) openStayModal({ defaults: { checkIn: country.start, checkOut: country.end, countryName: country.name } });
  }));
  $$('[data-add-act]', el).forEach((btn) => btn.addEventListener('click', () => openActivityModal(btn.dataset.addAct)));
  $$('[data-edit-act]', el).forEach((btn) => btn.addEventListener('click', () => {
    const date = btn.dataset.actDate;
    const activity = (trip.days?.[date] || []).find((a) => a.id === btn.dataset.editAct);
    if (activity) openActivityModal(date, activity);
  }));
  $$('[data-del-act]', el).forEach((btn) => btn.addEventListener('click', async () => {
    const date = btn.dataset.actDate;
    const daysObj = { ...(trip.days || {}) };
    daysObj[date] = (daysObj[date] || []).filter((a) => a.id !== btn.dataset.delAct);
    await saveTrip({ days: daysObj });
  }));
  $$('[data-add-food]', el).forEach((btn) => btn.addEventListener('click', () => openFoodModal({ date: btn.dataset.addFood })));
  $$('[data-edit-food]', el).forEach((btn) => btn.addEventListener('click', () => {
    const item = (trip.restaurants || []).find((r) => r.id === btn.dataset.editFood);
    if (item) openFoodModal({ item });
  }));
  $$('[data-del-food]', el).forEach((btn) => btn.addEventListener('click', async () => {
    await saveTrip({ restaurants: (trip.restaurants || []).filter((r) => r.id !== btn.dataset.delFood) });
  }));
  $$('[data-add-stay]', el).forEach((btn) => btn.addEventListener('click', () => {
    const date = btn.dataset.addStay;
    const countries = days.find(([d]) => d === date)?.[1] || [];
    openStayModal({ defaults: { checkIn: date, checkOut: shiftDate(date, 1), countryName: countries.length === 1 ? countries[0].name : '' } });
  }));
  $$('[data-edit-stay]', el).forEach((btn) => btn.addEventListener('click', () => {
    const item = (trip.lodgings || []).find((l) => l.id === btn.dataset.editStay);
    if (item) openStayModal({ item });
  }));
  $$('[data-del-stay]', el).forEach((btn) => btn.addEventListener('click', async () => {
    await saveTrip({ lodgings: (trip.lodgings || []).filter((l) => l.id !== btn.dataset.delStay) });
  }));
  $$('[data-add-ride]', el).forEach((btn) => btn.addEventListener('click', () => openRideModal({ date: btn.dataset.addRide })));
  $$('[data-edit-ride]', el).forEach((btn) => btn.addEventListener('click', () => {
    const item = (trip.transports || []).find((r) => r.id === btn.dataset.editRide);
    if (item) openRideModal({ item });
  }));
  $$('[data-del-ride]', el).forEach((btn) => btn.addEventListener('click', async () => {
    await saveTrip({ transports: (trip.transports || []).filter((r) => r.id !== btn.dataset.delRide) });
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

let driveAccessToken = null;

function taipeiStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}_${get('hour')}${get('minute')}`;
}

function safeFileName(title) {
  const cleaned = String(title || 'trip').replace(/[\\/:*?"<>|\n\r]+/g, ' ').trim().slice(0, 60);
  return cleaned || 'trip';
}

function buildBackup(includePrivate) {
  const trip = state.trip;
  const payload = {
    app: 'leo-prototype',
    version: 1,
    exportedAt: new Date().toISOString(),
    trip: {
      id: trip.id,
      code: trip.code,
      title: trip.title,
      homeCurrency: trip.homeCurrency || 'TWD',
      countries: trip.countries || [],
      members: trip.members || [],
      days: trip.days || {},
      restaurants: trip.restaurants || [],
      lodgings: trip.lodgings || [],
      transports: trip.transports || [],
      expenses: trip.expenses || [],
      flights: trip.flights || emptyFlights(),
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    },
  };
  if (includePrivate) payload.private = loadPrivate();
  return payload;
}

function backupFileName(payload) {
  const title = payload?.trip?.title || state.trip?.title;
  return `${safeFileName(title)}_${taipeiStamp()}.json`;
}

function triggerDownload(filename, json) {
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function saveBackupFile(filename, payload) {
  const json = JSON.stringify(payload, null, 2);
  const file = new File([json], filename, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      toast('已開啟分享');
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'JSON 備份', accept: { 'application/json': ['.json'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      toast('已儲存檔案');
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  triggerDownload(filename, json);
  toast('已下載備份');
}

function downloadBackup() {
  const includePrivate = Boolean($('#backup-include-private')?.checked);
  const payload = buildBackup(includePrivate);
  triggerDownload(backupFileName(payload), JSON.stringify(payload, null, 2));
  toast('已下載備份');
}

function openBackupDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('leo-prototype', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('backups')) {
        db.createObjectStore('backups', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('無法開啟本機備份'));
  });
}

function backupStore(db, mode) {
  return db.transaction('backups', mode).objectStore('backups');
}

async function listDeviceBackups() {
  const db = await openBackupDb();
  const records = await new Promise((resolve, reject) => {
    const request = backupStore(db, 'readonly').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return records.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
}

async function saveDeviceBackup() {
  if (navigator.storage?.persist) {
    try { await navigator.storage.persist(); } catch (_) { /* best effort */ }
  }
  const includePrivate = Boolean($('#backup-include-private')?.checked);
  const payload = buildBackup(includePrivate);
  const json = JSON.stringify(payload);
  const record = {
    id: uid(),
    tripId: state.trip.id,
    tripTitle: state.trip.title || '未命名',
    savedAt: new Date().toISOString(),
    stamp: taipeiStamp(),
    filename: backupFileName(payload),
    size: new Blob([json]).size,
    payload,
  };
  const db = await openBackupDb();
  await new Promise((resolve, reject) => {
    const request = backupStore(db, 'readwrite').put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
  toast('已存到這台裝置');
  await refreshDeviceBackupList();
}

async function deleteDeviceBackup(id) {
  const db = await openBackupDb();
  await new Promise((resolve, reject) => {
    const request = backupStore(db, 'readwrite').delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

function formatBytes(size) {
  const n = Number(size) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function deviceBackupHtml(records) {
  if (!records.length) return '<div class="muted">這台裝置還沒有備份</div>';
  const groups = [];
  for (const record of records) {
    const key = record.tripId || record.tripTitle || 'unknown';
    let group = groups.find((item) => item.key === key);
    if (!group) {
      group = { key, title: record.tripTitle || '未命名', items: [] };
      groups.push(group);
    }
    group.items.push(record);
  }
  return groups.map((group) => `
    <div class="device-backup-group">
      <div class="device-backup-trip">${escapeHtml(group.title)}${group.key === state.tripId ? '（目前）' : ''}</div>
      ${group.items.map((record) => `
        <div class="device-backup-item">
          <div>${escapeHtml(record.stamp || '')}</div>
          <div class="muted">${formatBytes(record.size)}</div>
          <div class="device-backup-actions">
            <button type="button" class="secondary" data-device-restore="${escapeHtml(record.id)}">還原</button>
            <button type="button" class="secondary" data-device-export="${escapeHtml(record.id)}">另存檔案</button>
            <button type="button" class="secondary" data-device-delete="${escapeHtml(record.id)}">刪除</button>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

async function refreshDeviceBackupList() {
  const host = $('#device-backup-list');
  if (!host) return;
  let records = [];
  try {
    records = await listDeviceBackups();
  } catch (_) {
    host.innerHTML = '<div class="muted">無法讀取這台裝置的備份</div>';
    return;
  }
  if (!document.body.contains(host)) return;
  host.innerHTML = deviceBackupHtml(records);
  const byId = new Map(records.map((record) => [record.id, record]));
  $$('[data-device-restore]', host).forEach((button) => button.addEventListener('click', async () => {
    const record = byId.get(button.dataset.deviceRestore);
    if (!record) return;
    try {
      await restoreBackupObject(record.payload);
    } catch (err) {
      toast(err.message || '還原失敗');
    }
  }));
  $$('[data-device-export]', host).forEach((button) => button.addEventListener('click', async () => {
    const record = byId.get(button.dataset.deviceExport);
    if (!record) return;
    try {
      await saveBackupFile(record.filename || backupFileName(record.payload), record.payload);
    } catch (err) {
      toast(err.message || '無法另存檔案');
    }
  }));
  $$('[data-device-delete]', host).forEach((button) => button.addEventListener('click', async () => {
    const ok = await askYesNo('要刪除這份裝置備份嗎？此動作無法復原。', { title: '刪除備份', yes: '刪除' });
    if (!ok) return;
    try {
      await deleteDeviceBackup(button.dataset.deviceDelete);
      toast('已刪除備份');
      await refreshDeviceBackupList();
    } catch (err) {
      toast(err.message || '無法刪除');
    }
  }));
}

function askYesNo(message, { title = '還原備份', yes = '確定還原', no = '取消' } = {}) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p><div class="actions"><button type="button" class="secondary" data-no>${escapeHtml(no)}</button><button type="button" data-yes>${escapeHtml(yes)}</button></div></div>`;
    document.body.appendChild(wrap);
    const done = (value) => { wrap.remove(); resolve(value); };
    $('[data-no]', wrap).addEventListener('click', () => done(false));
    $('[data-yes]', wrap).addEventListener('click', () => done(true));
    wrap.addEventListener('click', (event) => { if (event.target === wrap) done(false); });
  });
}

async function restoreBackupObject(data, { confirm = false } = {}) {
  const trip = data?.trip && typeof data.trip === 'object' ? data.trip : data;
  const res = await fetch('/api/trips/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trip, memberId: state.memberId, confirm }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 409 && body.needsConfirm) {
    const ok = await askYesNo(body.error || '這份備份會覆寫目前的旅行');
    if (!ok) return;
    return restoreBackupObject(data, { confirm: true });
  }
  if (!res.ok) throw new Error(body.error || '還原失敗');
  state.tripId = body.trip.id;
  if (body.memberId) state.memberId = body.memberId;
  persistSession();
  if (data?.private && typeof data.private === 'object') {
    savePrivate({
      budgetTwd: data.private.budgetTwd ?? '',
      spentNotes: data.private.spentNotes ?? '',
      note: data.private.note ?? '',
    });
  }
  adoptTrip(body.trip);
  render();
  toast(body.created ? '已從備份建立旅行' : '已還原旅行');
}

async function restoreBackupFile(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('這不是有效的 JSON 備份');
  }
  await restoreBackupObject(data);
}

function loadGisScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  const existing = document.getElementById('gis-client');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('無法載入 Google 登入')), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'gis-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('無法載入 Google 登入'));
    document.head.appendChild(script);
  });
}

function requestDriveToken() {
  return new Promise((resolve, reject) => {
    if (!state.googleClientId) {
      reject(new Error('Google Drive 尚未設定'));
      return;
    }
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google 登入元件尚未載入'));
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: state.googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
        if (!response || response.error) {
          driveAccessToken = null;
          reject(new Error('Google 授權未完成'));
          return;
        }
        driveAccessToken = response.access_token;
        resolve(response.access_token);
      },
    });
    client.requestAccessToken({ prompt: driveAccessToken ? '' : 'consent' });
  });
}

async function driveJson(url, options = {}) {
  const token = driveAccessToken || await requestDriveToken();
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  if (res.status === 401) {
    driveAccessToken = null;
    throw new Error('Google 授權已過期，請再試一次');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || 'Google Drive 請求失敗');
  return data;
}

async function ensureDriveFolder() {
  const query = encodeURIComponent("name = 'Leo prototype 備份' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const listed = await driveJson(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`);
  if (listed.files?.[0]?.id) return listed.files[0].id;
  const created = await driveJson('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Leo prototype 備份', mimeType: 'application/vnd.google-apps.folder' }),
  });
  return created.id;
}

async function backupToDrive() {
  await loadGisScript();
  const token = await requestDriveToken();
  driveAccessToken = token;
  const folderId = await ensureDriveFolder();
  const includePrivate = Boolean($('#backup-include-private')?.checked);
  const payload = buildBackup(includePrivate);
  const filename = `${safeFileName(state.trip.title)}_${taipeiStamp()}.json`;
  const boundary = `leo_backup_${Date.now()}`;
  const meta = { name: filename, parents: [folderId], mimeType: 'application/json' };
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(payload)}\r\n--${boundary}--`;
  const data = await driveJson(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  const box = $('#backup-result');
  if (box) {
    box.hidden = false;
    box.innerHTML = data.webViewLink
      ? `已備份到 Google Drive：<a href="${escapeHtml(data.webViewLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.name || filename)}</a>`
      : '已備份到 Google Drive';
  }
  toast('已備份到 Google Drive');
}

async function listDriveBackups() {
  const folderId = await ensureDriveFolder();
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType = 'application/json'`);
  const listed = await driveJson(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=30`);
  return listed.files || [];
}

async function restoreFromDrive() {
  await loadGisScript();
  const files = await listDriveBackups();
  if (!files.length) {
    toast('Drive 裡還沒有這個 App 建立的備份');
    return;
  }
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `<div class="modal"><h3>從 Google Drive 還原</h3><div class="muted">只會列出這個 App 建立的 JSON 備份。</div>${files.map((file) => `<button type="button" class="branch-option" data-drive-file="${escapeHtml(file.id)}"><strong>${escapeHtml(file.name)}</strong></button>`).join('')}<div class="actions"><button type="button" class="secondary" data-cancel>關閉</button></div></div>`;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  $('[data-cancel]', wrap).addEventListener('click', close);
  wrap.addEventListener('click', (event) => { if (event.target === wrap) close(); });
  $$('[data-drive-file]', wrap).forEach((button) => button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const token = driveAccessToken || await requestDriveToken();
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${button.dataset.driveFile}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('無法讀取備份檔');
      const data = await res.json();
      close();
      await restoreBackupObject(data);
    } catch (err) {
      button.disabled = false;
      toast(err.message || '還原失敗');
    }
  }));
}

function renderMembers() {
  const el = $('#tab-more');
  el.innerHTML = `
    <div class="card" id="settings-theme">
      <h2>主題色</h2>
      <div class="muted">柔和的底色，套用到整個畫面。餐廳、住宿、交通的色塊維持固定，方便分辨。</div>
      ${themePickerHtml()}
    </div>
    <div class="card">
      <h2>旅伴</h2>
      ${(state.trip.members || []).map((m) => `
        <div class="balance-line">
          <span>${escapeHtml(m.nickname)}${m.id === state.memberId ? '（你）' : ''}</span>
          <span class="muted">${new Date(m.joinedAt).toLocaleDateString('zh-TW')}</span>
        </div>
      `).join('')}
    </div>
    <div class="card stack" id="backup-card">
      <h2>備份與還原</h2>
      <div class="muted">Render 免費方案的檔案在重新部署後可能消失。下載或備份到 Google Drive 可以留一份。</div>
      <label class="import-check"><input id="backup-include-private" type="checkbox" /> 一併包含這台裝置的私人預算</label>
      <div class="backup-choices">
        <button type="button" id="btn-save-device">存到這台裝置</button>
        <button type="button" class="secondary" id="btn-download-backup">下載備份（JSON）</button>
        <button type="button" class="secondary" id="btn-drive-backup" ${state.googleClientId ? '' : 'disabled'}>備份到 Google Drive</button>
      </div>
      <button type="button" class="secondary" id="btn-drive-restore" ${state.googleClientId ? '' : 'disabled'}>從 Google Drive 還原</button>
      <div class="muted" id="drive-note" ${state.googleClientId ? 'hidden' : ''}>Google Drive 尚未設定</div>
      <label for="backup-file">從檔案還原</label>
      <input id="backup-file" type="file" accept=".json,application/json,text/json" />
      <div class="muted" id="backup-result" hidden></div>
      <h3 class="device-backup-heading">這台裝置上的備份</h3>
      <div id="device-backup-list"><div class="muted">讀取中…</div></div>
      <div class="muted">存在這台裝置的備份只有這台看得到；要換裝置，請用『另存檔案』再在另一台用『從檔案還原』。清除瀏覽器資料會刪除這些備份。</div>
    </div>
    <div class="card stack">
      <button class="secondary" type="button" id="btn-leave">離開此旅行（本裝置）</button>
      <div class="muted">離開只清除本機工作階段，不會刪除伺服器上的群組資料。</div>
    </div>
  `;
  bindThemePicker(el);
  $('#btn-save-device')?.addEventListener('click', async () => {
    try {
      await saveDeviceBackup();
    } catch (err) {
      toast(err.message || '無法存到這台裝置');
    }
  });
  refreshDeviceBackupList();
  $('#btn-download-backup')?.addEventListener('click', downloadBackup);
  $('#backup-file')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await restoreBackupFile(file);
    } catch (err) {
      toast(err.message || '還原失敗');
    }
  });
  $('#btn-drive-backup')?.addEventListener('click', async () => {
    try {
      await backupToDrive();
    } catch (err) {
      toast(err.message || '備份失敗');
    }
  });
  $('#btn-drive-restore')?.addEventListener('click', async () => {
    try {
      await restoreFromDrive();
    } catch (err) {
      toast(err.message || '還原失敗');
    }
  });
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

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DRAFT_PREFIX = 'tp_draft_';

function draftStorageKey(meta) {
  const trip = state.tripId || 'none';
  return `${DRAFT_PREFIX}${trip}_${meta.type}_${meta.id || 'new'}_${meta.day || ''}`;
}

function readDraft(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (!raw?.savedAt || !raw.fields) {
      localStorage.removeItem(key);
      return null;
    }
    if (Date.now() - Number(raw.savedAt) > DRAFT_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

function listTripDrafts() {
  const prefix = `${DRAFT_PREFIX}${state.tripId || 'none'}_`;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) keys.push(key);
  }
  return keys.map((key) => {
    const raw = readDraft(key);
    return raw ? { key, ...raw } : null;
  }).filter(Boolean).sort((a, b) => b.savedAt - a.savedAt);
}

function draftFieldNodes(root) {
  return [...root.querySelectorAll('input, textarea, select')].filter((el) => {
    if (el.type === 'password' || el.type === 'file' || el.type === 'hidden') return false;
    if (el.id && /key|token|secret|password|openai/i.test(el.id)) return false;
    return Boolean(el.id) || el.classList.contains('e-split');
  });
}

function draftFieldKey(el) {
  return el.classList.contains('e-split') ? `split:${el.value}` : el.id;
}

function collectFields(root) {
  const fields = {};
  draftFieldNodes(root).forEach((el) => {
    const key = draftFieldKey(el);
    if (!key) return;
    fields[key] = el.type === 'checkbox' ? el.checked : el.value;
  });
  return fields;
}

function applyFields(root, fields) {
  draftFieldNodes(root).forEach((el) => {
    const key = draftFieldKey(el);
    if (!key || !Object.prototype.hasOwnProperty.call(fields, key)) return;
    if (el.type === 'checkbox') el.checked = Boolean(fields[key]);
    else el.value = fields[key] ?? '';
  });
}

function fieldsEqual(a, b) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const key of keys) if ((a || {})[key] !== (b || {})[key]) return false;
  return true;
}

function clearDraft(metaOrKey) {
  const key = typeof metaOrKey === 'string' ? metaOrKey : draftStorageKey(metaOrKey);
  localStorage.removeItem(key);
}

function openModal(title, bodyHtml, onSubmit, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `<div class="modal"><h3>${escapeHtml(title)}</h3><div id="draft-banner" class="draft-banner" hidden></div>${bodyHtml}<div id="draft-saved" class="draft-saved" hidden>草稿已暫存</div><div class="actions"><button type="button" class="secondary" data-cancel>${escapeHtml(opts.cancelLabel || '取消')}</button><button type="button" data-ok>${escapeHtml(opts.okLabel || '確定')}</button></div><div id="draft-ask" class="draft-ask" hidden><div>要保留草稿嗎？</div><div class="actions"><button type="button" class="secondary" data-draft-keep>保留</button><button type="button" data-draft-drop>捨棄</button></div></div></div>`;
  document.body.appendChild(wrap);
  const modal = $('.modal', wrap);
  const draftKey = opts.draft ? draftStorageKey(opts.draft) : '';
  const baseline = collectFields(modal);
  let timer = null;

  function flush() {
    if (!draftKey) return;
    const fields = collectFields(modal);
    if (fieldsEqual(fields, baseline)) {
      localStorage.removeItem(draftKey);
      $('#draft-saved', wrap).hidden = true;
      return;
    }
    localStorage.setItem(draftKey, JSON.stringify({
      savedAt: Date.now(),
      fields,
      meta: opts.draft,
      title,
    }));
    $('#draft-saved', wrap).hidden = false;
  }

  const restored = draftKey ? readDraft(draftKey) : null;
  if (restored?.fields) {
    applyFields(modal, restored.fields);
    const banner = $('#draft-banner', wrap);
    banner.hidden = false;
    banner.innerHTML = `已恢復上次未完成的草稿 <button type="button" class="ghost" id="draft-discard">捨棄草稿</button>`;
    $('#draft-discard', banner).addEventListener('click', () => {
      localStorage.removeItem(draftKey);
      applyFields(modal, baseline);
      banner.hidden = true;
      $('#draft-saved', wrap).hidden = true;
    });
  }

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(flush, 500);
  };
  modal.addEventListener('input', schedule);
  modal.addEventListener('change', schedule);

  const close = () => {
    clearTimeout(timer);
    wrap.remove();
  };
  function requestClose() {
    if (!draftKey) {
      close();
      return;
    }
    clearTimeout(timer);
    flush();
    if (fieldsEqual(collectFields(modal), baseline)) {
      localStorage.removeItem(draftKey);
      close();
      return;
    }
    $('#draft-ask', wrap).hidden = false;
  }
  wrap.addEventListener('click', (e) => { if (e.target === wrap) requestClose(); });
  $('[data-cancel]', wrap).addEventListener('click', requestClose);
  $('[data-draft-keep]', wrap).addEventListener('click', () => { flush(); close(); });
  $('[data-draft-drop]', wrap).addEventListener('click', () => {
    localStorage.removeItem(draftKey);
    close();
  });
  $('[data-ok]', wrap).addEventListener('click', async () => {
    try {
      await onSubmit(wrap);
      if (draftKey) localStorage.removeItem(draftKey);
      close();
    } catch (err) {
      toast(err.message || '失敗');
    }
  });
  return wrap;
}

function reopenLatestDraft() {
  const [latest] = listTripDrafts();
  if (!latest?.meta) return;
  const { type, id, day } = latest.meta;
  const trip = state.trip;
  if (!trip) return;
  if (type === 'activity') {
    const activity = id && id !== 'new' ? (trip.days?.[day] || []).find((a) => a.id === id) : null;
    openActivityModal(day, activity || null);
  } else if (type === 'food') {
    const item = id && id !== 'new' ? (trip.restaurants || []).find((r) => r.id === id) : null;
    openFoodModal({ date: day, item: item || null });
  } else if (type === 'stay') {
    const item = id && id !== 'new' ? (trip.lodgings || []).find((l) => l.id === id) : null;
    openStayModal(item ? { item } : { defaults: { checkIn: day, checkOut: day ? shiftDate(day, 1) : '' } });
  } else if (type === 'ride') {
    const item = id && id !== 'new' ? (trip.transports || []).find((t) => t.id === id) : null;
    openRideModal({ date: day, item: item || null });
  } else if (type === 'expense') openExpenseModal();
  else if (type === 'country') openCountryModal();
  else if (type === 'stay-setup') {
    const country = (trip.countries || []).find((c) => c.id === id) || (trip.countries || [])[0];
    if (country) openLodgingSetup(country);
  } else if (type === 'flight') openFlightModal(id === 'inbound' ? 'inbound' : 'outbound');
  else if (type === 'import') openImportSheet();
}

function notifyDrafts() {
  const drafts = listTripDrafts();
  if (!drafts.length || document.querySelector('.draft-notice')) return;
  const note = document.createElement('button');
  note.type = 'button';
  note.className = 'toast draft-notice';
  note.textContent = `你有 ${drafts.length} 筆未完成的草稿`;
  note.addEventListener('click', () => {
    note.remove();
    reopenLatestDraft();
  });
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 8000);
}

function openBranchSheet({ kind, entry, candidates }) {
  const list = (candidates || []).slice(0, 5);
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `
    <div class="modal">
      <h3>${entry.placeId ? '更換分店' : '選擇分店'}</h3>
      <div class="muted">選一間對應的分店。選定後會存在這筆${kind === 'stay' ? '住宿' : '餐廳'}裡，旅伴也看得到。</div>
      ${list.map((c, i) => `
        <button type="button" class="branch-option" data-branch-index="${i}">
          <strong>${escapeHtml(c.name || '未命名')}</strong>
          ${c.address ? `<div class="muted">${escapeHtml(c.address)}</div>` : ''}
          <div class="muted">${c.rating != null ? `★ ${Number(c.rating).toFixed(1)}` : '尚無評分'}${Number.isFinite(Number(c.userRatingCount)) ? ` · ${Number(c.userRatingCount).toLocaleString('zh-TW')} 則評價` : ''}</div>
        </button>
      `).join('') || '<div class="muted">沒有可選的分店</div>'}
      <div class="actions"><button type="button" class="secondary" data-cancel>關閉</button></div>
    </div>
  `;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  $('[data-cancel]', wrap).addEventListener('click', close);
  $$('[data-branch-index]', wrap).forEach((btn) => btn.addEventListener('click', async () => {
    const place = list[Number(btn.dataset.branchIndex)];
    if (!place?.id) return;
    btn.disabled = true;
    try {
      const filled = contactFromCandidate(place);
      if (kind === 'stay') {
        const lodgings = (state.trip.lodgings || []).map((l) => l.id === entry.id ? { ...l, ...filled } : l);
        await saveTrip({ lodgings });
      } else {
        const restaurants = (state.trip.restaurants || []).map((r) => r.id === entry.id ? { ...r, ...filled } : r);
        await saveTrip({ restaurants });
      }
      close();
    } catch (err) {
      btn.disabled = false;
      toast(err.message || '無法儲存分店');
    }
  }));
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
    const country = { id: uid(), name: preset.name, code: preset.code, tz: preset.tz, currency: preset.currency, start, end };
    const countries = (state.trip.countries || []).concat([country]);
    await saveTrip({ countries });
    openLodgingSetup(country);
  }, { draft: { type: 'country', id: 'new', day: '' } });
}

function openFlightModal(which) {
  const key = which === 'inbound' ? 'inbound' : 'outbound';
  const leg = state.trip?.flights?.[key] || emptyFlights()[key];
  const title = key === 'inbound' ? '回程航班' : '去程航班';
  const wrap = openModal(title, `
    <label>航班號碼</label>
    <input id="fl-number" maxlength="8" placeholder="例如 CI100" value="${escapeHtml(leg.number || '')}" />
    <label>日期</label>
    <input type="date" id="fl-date" value="${escapeHtml(leg.date || '')}" />
    <label>出發機場</label>
    <input id="fl-from" maxlength="20" placeholder="例如 TPE" value="${escapeHtml(leg.from || '')}" />
    <label>抵達機場</label>
    <input id="fl-to" maxlength="20" placeholder="例如 NRT" value="${escapeHtml(leg.to || '')}" />
    <label>出發時間</label>
    <input type="time" id="fl-depart" value="${escapeHtml(leg.depart || '')}" />
    <label>抵達時間</label>
    <input type="time" id="fl-arrive" value="${escapeHtml(leg.arrive || '')}" />
    <div class="actions" style="margin-top:0.6rem">
      <button type="button" class="secondary" id="btn-flight-lookup" ${state.flightLookup ? '' : 'disabled'}>查詢航班</button>
    </div>
    ${state.flightLookup ? '' : '<div class="muted">航班查詢尚未設定，請手動填寫。</div>'}
  `, async (root) => {
    const flights = {
      outbound: { ...(state.trip.flights?.outbound || emptyFlights().outbound) },
      inbound: { ...(state.trip.flights?.inbound || emptyFlights().inbound) },
    };
    flights[key] = {
      number: $('#fl-number', root).value.trim(),
      date: $('#fl-date', root).value,
      from: $('#fl-from', root).value.trim(),
      to: $('#fl-to', root).value.trim(),
      depart: $('#fl-depart', root).value,
      arrive: $('#fl-arrive', root).value,
    };
    await saveTrip({ flights });
  }, { draft: { type: 'flight', id: key, day: '' } });
  $('#btn-flight-lookup', wrap)?.addEventListener('click', async () => {
    const button = $('#btn-flight-lookup', wrap);
    const number = $('#fl-number', wrap).value.trim();
    const date = $('#fl-date', wrap).value;
    if (!number || !date) {
      toast('請先填航班號碼與日期');
      return;
    }
    button.disabled = true;
    try {
      const data = await api(`/api/flight?number=${encodeURIComponent(number)}&date=${encodeURIComponent(date)}`);
      if (data.enabled === false) {
        toast('航班查詢尚未設定');
        return;
      }
      if (!data.found) {
        toast('找不到這班航班');
        return;
      }
      const fill = (id, value) => {
        const input = $(id, wrap);
        if (!input || !value || String(input.value || '').trim()) return;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      fill('#fl-from', data.from);
      fill('#fl-to', data.to);
      fill('#fl-depart', data.depart);
      fill('#fl-arrive', data.arrive);
      toast('已帶入空著的欄位');
    } catch (err) {
      toast(err.message || '查詢航班失敗');
    } finally {
      button.disabled = !state.flightLookup;
    }
  });
}

function openDayCountrySheet(country, date) {
  const day = calendarDate(date);
  const slots = patternSlots(country).map((slot) => (slot ? { ...slot } : null));
  const days = buildTimelineDays().map(([item]) => item);
  if (day && !days.includes(day)) days.push(day);
  const known = COUNTRY_PRESETS.some((preset) => preset.code === country.code);
  const tzKnown = TIMEZONES.some(([zone]) => zone === country.tz);
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `
    <div class="modal">
      <h3>更改 ${escapeHtml(day || '這一天')}</h3>
      <div class="muted">目前是${escapeHtml(country.name)} ${escapeHtml(offsetLabel(country.tz, day))}。套用後會拆開日期區間，只改你選的日子。</div>
      <label>國家</label>
      <select id="day-code">
        ${COUNTRY_PRESETS.map((preset) => `<option value="${preset.code}" ${preset.code === country.code ? 'selected' : ''}>${escapeHtml(preset.name)}</option>`).join('')}
        ${known ? '' : `<option value="${escapeHtml(country.code || '_')}" selected>${escapeHtml(country.name || '其他')}</option>`}
      </select>
      <label>時區</label>
      <select id="day-tz">
        ${tzKnown ? '' : `<option value="${escapeHtml(country.tz || 'UTC')}">${escapeHtml(country.tz || 'UTC')}</option>`}
        ${TIMEZONES.map(([zone, label]) => `<option value="${zone}" ${zone === country.tz ? 'selected' : ''}>${escapeHtml(label)}（${escapeHtml(zone)}）</option>`).join('')}
      </select>
      <h3 style="margin-top:0.9rem">圖案</h3>
      <div class="muted">三個位置可以各自上傳圖片，或從圖示庫挑。恢復預設會回到這個國家原本的圖。</div>
      ${PATTERN_SLOTS.map((label, index) => `
        <div class="pattern-slot">
          <div class="pattern-preview">
            <span data-pattern-preview="${index}"></span>
            <strong>${label}</strong>
          </div>
          <div class="pattern-actions">
            <label class="file-btn">上傳自己的圖片
              <input type="file" accept="image/*" data-pattern-file="${index}" hidden />
            </label>
            <button type="button" class="secondary" data-open-gallery="${index}" aria-expanded="false">從圖示庫挑選</button>
            <button type="button" class="ghost" data-reset-pattern="${index}">恢復預設</button>
          </div>
          <div class="pattern-gallery" data-gallery="${index}" hidden>
            <div class="gallery-label">內建圖示</div>
            ${PATTERN_MARKS.map(([code, name]) => `<button type="button" data-slot="${index}" data-pick-mark="${code}" aria-label="${name}">${countrySvg(code, 'sm')}</button>`).join('')}
            <div class="gallery-label">符號</div>
            ${PATTERN_EMOJIS.map((emoji) => `<button type="button" data-slot="${index}" data-pick-emoji="${emoji}" aria-label="${emoji}">${emoji}</button>`).join('')}
          </div>
          <label>自己輸入符號（可不填）</label>
          <input id="pat-emoji-${index}" maxlength="8" placeholder="例如 🌸" value="${slots[index]?.kind === 'emoji' ? escapeHtml(slots[index].text) : ''}" />
        </div>
      `).join('')}
      <div class="scope-block">
        <label class="scope-choice"><input type="radio" name="day-scope" value="one" checked /> 只改這一天</label>
        <label class="scope-choice"><input type="radio" name="day-scope" value="some" /> 選擇幾天</label>
        <div id="day-checks" hidden>
          ${days.map((item) => `<label class="day-check"><input type="checkbox" data-day-check value="${item}" ${item === day ? 'checked' : ''} /> ${item}（週${weekday(item)}）</label>`).join('')}
        </div>
        <label class="scope-choice"><input type="radio" name="day-scope" value="all" /> 全部天數</label>
      </div>
      <div class="actions">
        <button type="button" class="secondary" data-cancel>取消</button>
        <button type="button" data-apply>套用</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  let tzTouched = false;
  const close = () => wrap.remove();
  const paint = () => {
    const preview = { code: $('#day-code', wrap).value, patterns: slots.map((slot) => (slot ? { ...slot } : null)) };
    $$('[data-pattern-preview]', wrap).forEach((el) => {
      const index = Number(el.dataset.patternPreview);
      const size = index === 1 ? 'sm' : index === 2 ? 'bg' : undefined;
      el.innerHTML = renderPattern(preview, index, size);
    });
    [0, 1, 2].forEach((index) => {
      const slot = slots[index];
      $$(`[data-gallery="${index}"] button`, wrap).forEach((button) => {
        const on = (slot?.kind === 'builtin' && button.dataset.pickMark === slot.id)
          || (slot?.kind === 'emoji' && button.dataset.pickEmoji === slot.text);
        button.classList.toggle('on', Boolean(on));
      });
    });
  };
  const ensureTz = (zone) => {
    const select = $('#day-tz', wrap);
    if (![...select.options].some((option) => option.value === zone)) {
      const extra = document.createElement('option');
      extra.value = zone;
      extra.textContent = zone;
      select.prepend(extra);
    }
    select.value = zone;
  };
  paint();
  wrap.addEventListener('click', (event) => { if (event.target === wrap) close(); });
  $('[data-cancel]', wrap).addEventListener('click', close);
  $('#day-tz', wrap).addEventListener('change', () => { tzTouched = true; });
  $('#day-code', wrap).addEventListener('change', () => {
    if (!tzTouched) ensureTz(presetByCode($('#day-code', wrap).value, country).tz);
    paint();
  });
  $$('input[name="day-scope"]', wrap).forEach((radio) => radio.addEventListener('change', () => {
    $('#day-checks', wrap).hidden = wrap.querySelector('input[name="day-scope"]:checked')?.value !== 'some';
  }));
  $$('[data-open-gallery]', wrap).forEach((button) => button.addEventListener('click', () => {
    const gallery = wrap.querySelector(`[data-gallery="${button.dataset.openGallery}"]`);
    gallery.hidden = !gallery.hidden;
    button.setAttribute('aria-expanded', gallery.hidden ? 'false' : 'true');
  }));
  $$('[data-reset-pattern]', wrap).forEach((button) => button.addEventListener('click', () => {
    const index = Number(button.dataset.resetPattern);
    slots[index] = null;
    const emoji = $(`#pat-emoji-${index}`, wrap);
    const file = wrap.querySelector(`[data-pattern-file="${index}"]`);
    if (emoji) emoji.value = '';
    if (file) file.value = '';
    paint();
  }));
  $$('[data-pattern-file]', wrap).forEach((input) => input.addEventListener('change', async () => {
    const file = input.files?.[0];
    const index = Number(input.dataset.patternFile);
    if (!file) return;
    try {
      slots[index] = { kind: 'image', data: await fileToPatternData(file) };
      const emoji = $(`#pat-emoji-${index}`, wrap);
      if (emoji) emoji.value = '';
      paint();
    } catch (err) {
      input.value = '';
      toast(err.message || '無法使用這張圖片');
    }
  }));
  [0, 1, 2].forEach((index) => {
    $(`#pat-emoji-${index}`, wrap)?.addEventListener('input', (event) => {
      const text = event.target.value.trim().slice(0, 8);
      if (text) slots[index] = { kind: 'emoji', text };
      else if (slots[index]?.kind === 'emoji') slots[index] = null;
      paint();
    });
  });
  wrap.addEventListener('click', (event) => {
    const mark = event.target.closest('[data-pick-mark]');
    const emoji = event.target.closest('[data-pick-emoji]');
    const button = mark || emoji;
    if (!button || !wrap.contains(button)) return;
    const index = Number(button.dataset.slot);
    if (mark) slots[index] = { kind: 'builtin', id: mark.dataset.pickMark };
    else slots[index] = { kind: 'emoji', text: emoji.dataset.pickEmoji };
    const field = $(`#pat-emoji-${index}`, wrap);
    if (field) field.value = emoji ? emoji.dataset.pickEmoji : '';
    paint();
  });
  $('[data-apply]', wrap).addEventListener('click', async () => {
    const button = $('[data-apply]', wrap);
    const scope = wrap.querySelector('input[name="day-scope"]:checked')?.value || 'one';
    const preset = presetByCode($('#day-code', wrap).value, country);
    const tz = $('#day-tz', wrap).value || preset.tz;
    let dates = [day];
    if (scope === 'some') {
      dates = $$('[data-day-check]:checked', wrap).map((input) => input.value);
      if (!dates.length) {
        toast('請至少選一天');
        return;
      }
    } else if (scope === 'all') {
      dates = buildTimelineDays().map(([item]) => item);
      if (!dates.length) {
        toast('這趟行程還沒有日期');
        return;
      }
      const ok = await askYesNo(`要把這趟行程的每一天都改成「${preset.name}」嗎？`, { title: '全部天數', yes: '全部更改', no: '取消' });
      if (!ok) return;
    }
    button.disabled = true;
    try {
      const countries = applyDayCountry(dates, preset, tz, slots);
      await saveTrip({ countries });
      close();
    } catch (err) {
      button.disabled = false;
      toast(err.message || '無法儲存');
    }
  });
}

function readStayFields(wrap) {
  const name = $('#stay-name', wrap).value.trim();
  if (!name) return null;
  const checkIn = $('#stay-in', wrap).value;
  const checkOut = $('#stay-out', wrap).value;
  if (!checkIn || !checkOut || checkOut < checkIn) throw new Error('請設定入住與退房日期');
  return {
    name: name.slice(0, 80),
    checkIn,
    checkOut,
    place: $('#stay-place', wrap).value.trim().slice(0, 200),
    address: $('#stay-address', wrap).value.trim().slice(0, 200),
    phone: $('#stay-phone', wrap).value.trim().slice(0, 40),
    mapsUrl: $('#stay-maps', wrap).value.trim().slice(0, 500),
    note: $('#stay-note', wrap).value.trim().slice(0, 200),
    countryName: ($('#stay-country', wrap)?.value || '').slice(0, 40),
  };
}

function stayFormHtml(value = {}) {
  return `
    <label>住宿名稱</label>
    <input id="stay-name" maxlength="80" placeholder="例如：淺草飯店" value="${escapeHtml(value.name || '')}" />
    <label>入住</label>
    <input type="date" id="stay-in" value="${escapeHtml(calendarDate(value.checkIn) || '')}" />
    <label>退房</label>
    <input type="date" id="stay-out" value="${escapeHtml(calendarDate(value.checkOut) || '')}" />
    <label>地點（用來搜尋）</label>
    <input id="stay-place" maxlength="200" placeholder="城市或區域，例如：東京淺草" value="${escapeHtml(value.place || '')}" />
    <label>地址</label>
    <input id="stay-address" maxlength="200" placeholder="可留空，選定分店後會自動帶入" value="${escapeHtml(value.address || '')}" />
    <label>電話</label>
    <input id="stay-phone" type="tel" maxlength="40" placeholder="可留空，選定分店後會自動帶入" value="${escapeHtml(value.phone || '')}" />
    <label>Google 地圖連結</label>
    <input id="stay-maps" maxlength="500" placeholder="可留空，選定分店後會自動帶入" value="${escapeHtml(value.mapsUrl || '')}" />
    <label>訂房／確認碼備註</label>
    <input id="stay-note" maxlength="200" placeholder="確認碼、房型…" value="${escapeHtml(value.note || '')}" />
    <input type="hidden" id="stay-country" value="${escapeHtml(value.countryName || '')}" />
  `;
}

function openStayModal({ item, defaults } = {}) {
  const value = item || defaults || {};
  openModal(item ? '編輯住宿' : '新增住宿', stayFormHtml(value), async (wrap) => {
    const fields = readStayFields(wrap);
    if (!fields) throw new Error('請填住宿名稱');
    let lodgings;
    if (item) {
      const next = { ...item, ...fields, id: item.id };
      if (!keptPlaceId(item, fields)) delete next.placeId;
      lodgings = (state.trip.lodgings || []).map((l) => l.id === item.id ? next : l);
    } else {
      lodgings = (state.trip.lodgings || []).concat([{ id: uid(), ...fields }]);
    }
    await saveTrip({ lodgings });
  }, { draft: { type: 'stay', id: item?.id || 'new', day: calendarDate(value.checkIn) || '' } });
}

function openLodgingSetup(country) {
  const queued = [];
  const wrap = openModal(`為${country.name}先填住宿？`, `
    <div class="muted">可略過。跨夜的住宿會出現在入住到退房之間的每一天，並標示日期區間。</div>
    ${stayFormHtml({ checkIn: country.start, checkOut: country.end, countryName: country.name })}
    <div class="actions" style="margin-top:0.6rem"><button type="button" class="secondary" id="stay-add-more">加入這間並再填一間</button></div>
    <div class="muted queue-note" id="stay-queue"></div>
  `, async (w) => {
    const current = readStayFields(w);
    const all = queued.concat(current ? [current] : []);
    if (!all.length) return;
    const lodgings = (state.trip.lodgings || []).concat(all.map((fields) => ({ id: uid(), ...fields })));
    await saveTrip({ lodgings });
    toast(all.length > 1 ? `已加入 ${all.length} 間住宿` : '已加入住宿');
  }, { cancelLabel: '略過', okLabel: '完成', draft: { type: 'stay-setup', id: country.id || country.name, day: country.start || '' } });
  $('#stay-add-more', wrap).addEventListener('click', () => {
    try {
      const current = readStayFields(wrap);
      if (!current) {
        toast('請先填住宿名稱');
        return;
      }
      queued.push(current);
      $('#stay-name', wrap).value = '';
      $('#stay-place', wrap).value = '';
      $('#stay-address', wrap).value = '';
      $('#stay-phone', wrap).value = '';
      $('#stay-maps', wrap).value = '';
      $('#stay-note', wrap).value = '';
      $('#stay-queue', wrap).textContent = `已加入 ${queued.length} 間，可再填下一間`;
    } catch (err) {
      toast(err.message || '失敗');
    }
  });
}

function openActivityModal(date, activity) {
  openModal(activity ? `${date} 編輯活動` : `${date} 新增活動`, `
    <label>做什麼</label>
    <input id="a-text" maxlength="80" placeholder="例如：淺草寺" value="${escapeHtml(activity ? activityName(activity) : '')}" />
    <label>開始時間</label>
    <input id="a-time" type="time" value="${escapeHtml(activity?.time || '')}" />
    <label>結束時間</label>
    <input id="a-end" type="time" value="${escapeHtml(activity?.endTime || '')}" />
    <label>結束日期</label>
    <input id="a-end-date" type="date" value="${escapeHtml(calendarDate(activity?.endDate) || '')}" />
    <div class="muted">結束時間比開始早，會把結束日設成第二天。同一天結束可以留空結束日期。</div>
    <label>在哪裡</label>
    <input id="a-place" maxlength="200" placeholder="區域或地址，可留空" value="${escapeHtml(activity?.place || '')}" />
  `, async (wrap) => {
    const text = $('#a-text', wrap).value.trim();
    if (!text) throw new Error('請填做什麼');
    const time = $('#a-time', wrap).value;
    const endTime = $('#a-end', wrap).value;
    const place = $('#a-place', wrap).value.trim().slice(0, 200);
    const endDate = settleOvernightDate(date, time, endTime, $('#a-end-date', wrap).value);
    if ($('#a-end-date', wrap).value && calendarDate($('#a-end-date', wrap).value) < calendarDate(date)) throw new Error('結束日不能早於開始日');
    const days = { ...(state.trip.days || {}) };
    const list = (days[date] || []).slice();
    const next = { ...(activity || {}), id: activity?.id || uid(), text, time, endTime, endDate, place };
    if (activity) {
      const idx = list.findIndex((a) => a.id === activity.id);
      if (idx >= 0) list[idx] = next;
      else list.push(next);
    } else list.push(next);
    days[date] = list;
    await saveTrip({ days });
  }, { draft: { type: 'activity', id: activity?.id || 'new', day: date || '' } });
}

function openFoodModal({ date, item } = {}) {
  const value = item || { date, meal: '午餐' };
  openModal(item ? '編輯餐廳' : '新增餐廳', `
    <label>餐廳名稱</label>
    <input id="food-name" maxlength="80" placeholder="例如：一蘭拉麵" value="${escapeHtml(value.name || '')}" />
    <label>餐別</label>
    <select id="food-meal">${MEALS.map((m) => `<option ${m === (value.meal || '午餐') ? 'selected' : ''}>${m}</option>`).join('')}</select>
    <label>時間</label>
    <input id="food-time" type="time" value="${escapeHtml(value.time || '')}" />
    <label>地點（用來搜尋）</label>
    <input id="food-place" maxlength="200" placeholder="城市或區域，例如：淺草" value="${escapeHtml(value.place || '')}" />
    <label>地址</label>
    <input id="food-address" maxlength="200" placeholder="可留空，選定分店後會自動帶入" value="${escapeHtml(value.address || '')}" />
    <label>電話</label>
    <input id="food-phone" type="tel" maxlength="40" placeholder="可留空，選定分店後會自動帶入" value="${escapeHtml(value.phone || '')}" />
    <label>Google 地圖連結</label>
    <input id="food-maps" maxlength="500" placeholder="可留空，選定分店後會自動帶入" value="${escapeHtml(value.mapsUrl || '')}" />
    <label>訂位備註</label>
    <input id="food-note" maxlength="200" placeholder="人數、訂位名…" value="${escapeHtml(value.note || '')}" />
  `, async (wrap) => {
    const name = $('#food-name', wrap).value.trim();
    if (!name) throw new Error('請填餐廳名稱');
    const fields = {
      date: item?.date || date,
      name: name.slice(0, 80),
      meal: $('#food-meal', wrap).value,
      time: $('#food-time', wrap).value,
      place: $('#food-place', wrap).value.trim().slice(0, 200),
      address: $('#food-address', wrap).value.trim().slice(0, 200),
      phone: $('#food-phone', wrap).value.trim().slice(0, 40),
      mapsUrl: $('#food-maps', wrap).value.trim().slice(0, 500),
      note: $('#food-note', wrap).value.trim().slice(0, 200),
    };
    let restaurants;
    if (item) {
      const next = { ...item, ...fields, id: item.id };
      if (!keptPlaceId(item, fields)) delete next.placeId;
      restaurants = (state.trip.restaurants || []).map((r) => r.id === item.id ? next : r);
    } else restaurants = (state.trip.restaurants || []).concat([{ id: uid(), ...fields }]);
    await saveTrip({ restaurants });
  }, { draft: { type: 'food', id: item?.id || 'new', day: item?.date || date || '' } });
}

function textPlace(value) {
  const s = String(value || '').trim();
  if (!s || /^https?:\/\//i.test(s)) return '';
  return s.slice(0, 80);
}

function nightLodging(date) {
  const day = calendarDate(date);
  const stays = (state.trip?.lodgings || []).filter((l) => {
    const start = calendarDate(l.checkIn);
    const end = calendarDate(l.checkOut);
    if (!day || !start || !end || end < start) return false;
    if (start === end) return start === day;
    return day >= start && day < end;
  });
  stays.sort((a, b) => a.checkIn.localeCompare(b.checkIn) || String(a.name || '').localeCompare(String(b.name || '')));
  return stays[stays.length - 1] || null;
}

function lodgingLocation(lodging) {
  if (!lodging) return '';
  return textPlace(lodging.place) || textPlace(lodging.name);
}

function activityLocation(date) {
  const acts = sortedByTime(state.trip?.days?.[date] || [], 'time').map((a) => textPlace(a.place)).filter(Boolean);
  if (!acts.length) return '';
  const counts = new Map();
  for (const place of acts) counts.set(place, (counts.get(place) || 0) + 1);
  const max = Math.max(...counts.values());
  let last = '';
  for (const place of acts) if (counts.get(place) === max) last = place;
  return last;
}

function specificLocation(date) {
  if (!date) return '';
  return lodgingLocation(nightLodging(date)) || activityLocation(date);
}

function dayMainLocation(date) {
  if (!date) return '';
  return specificLocation(date) || textPlace(countryForDate(state.trip, date)?.name);
}

function suggestRideEndpoints(date) {
  const dates = buildTimelineDays().map(([d]) => d);
  const idx = dates.indexOf(date);
  const prev = idx > 0 ? dates[idx - 1] : shiftDate(date, -1);
  const next = idx >= 0 && idx < dates.length - 1 ? dates[idx + 1] : shiftDate(date, 1);
  const from = dayMainLocation(prev);
  const to = specificLocation(date) || dayMainLocation(next) || textPlace(countryForDate(state.trip, date)?.name);
  return { from, to };
}

function tripLocationOptions() {
  const out = [];
  const add = (value) => {
    const s = textPlace(value);
    if (s && !out.includes(s)) out.push(s);
  };
  for (const [date] of buildTimelineDays()) add(dayMainLocation(date));
  for (const lodging of state.trip?.lodgings || []) {
    add(lodging.place);
    add(lodging.name);
  }
  for (const list of Object.values(state.trip?.days || {})) {
    for (const activity of list || []) add(activity.place);
  }
  for (const restaurant of state.trip?.restaurants || []) add(restaurant.place);
  for (const ride of state.trip?.transports || []) {
    add(ride.from);
    add(ride.to);
  }
  for (const country of state.trip?.countries || []) add(country.name);
  return out;
}

function openRideModal({ date, item } = {}) {
  const suggested = item ? null : suggestRideEndpoints(date);
  const value = item || { date, type: '火車', from: suggested.from, to: suggested.to };
  const locationOptions = tripLocationOptions().map((place) => `<option value="${escapeHtml(place)}"></option>`).join('');
  openModal(item ? '編輯交通' : '新增交通', `
    <label>類型</label>
    <select id="ride-type">${RIDE_TYPES.map((m) => `<option ${m === (value.type || '火車') ? 'selected' : ''}>${m}</option>`).join('')}</select>
    ${suggested && (suggested.from || suggested.to) ? '<div class="muted">已依前一天與當天的地點預填，可以直接修改。</div>' : ''}
    <label>出發地</label>
    <input id="ride-from" list="ride-locations" maxlength="80" placeholder="例如：東京" value="${escapeHtml(value.from || '')}" />
    <label>目的地</label>
    <input id="ride-to" list="ride-locations" maxlength="80" placeholder="例如：大阪" value="${escapeHtml(value.to || '')}" />
    <datalist id="ride-locations">${locationOptions}</datalist>
    <label>出發日期</label>
    <input id="ride-date" type="date" value="${escapeHtml(calendarDate(value.date) || '')}" />
    <label>出發時間</label>
    <input id="ride-depart" type="time" value="${escapeHtml(value.depart || '')}" />
    <label>抵達日期</label>
    <input id="ride-arrive-date" type="date" value="${escapeHtml(calendarDate(value.arriveDate) || '')}" />
    <label>抵達時間</label>
    <input id="ride-arrive" type="time" value="${escapeHtml(value.arrive || '')}" />
    <div class="muted">夜車、臥鋪、紅眼航班：抵達時間比出發早時，抵達日會自動設成第二天。</div>
    <label>訂位備註</label>
    <input id="ride-note" maxlength="200" placeholder="車次、訂位代號…" value="${escapeHtml(value.note || '')}" />
  `, async (wrap) => {
    const from = $('#ride-from', wrap).value.trim().slice(0, 80);
    const to = $('#ride-to', wrap).value.trim().slice(0, 80);
    if (!from && !to) throw new Error('請填出發地或目的地');
    const rideDate = $('#ride-date', wrap).value || item?.date || date;
    if (!rideDate) throw new Error('請填出發日期');
    const depart = $('#ride-depart', wrap).value;
    const arrive = $('#ride-arrive', wrap).value;
    const typedEnd = $('#ride-arrive-date', wrap).value;
    if (typedEnd && calendarDate(typedEnd) < calendarDate(rideDate)) throw new Error('抵達日不能早於出發日');
    const fields = {
      date: rideDate,
      type: $('#ride-type', wrap).value,
      from,
      to,
      depart,
      arrive,
      arriveDate: settleOvernightDate(rideDate, depart, arrive, typedEnd),
      note: $('#ride-note', wrap).value.trim().slice(0, 200),
    };
    let transports;
    if (item) transports = (state.trip.transports || []).map((r) => r.id === item.id ? { ...r, ...fields, id: r.id } : r);
    else transports = (state.trip.transports || []).concat([{ id: uid(), ...fields }]);
    await saveTrip({ transports });
  }, { draft: { type: 'ride', id: item?.id || 'new', day: date || item?.date || '' } });
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
  }, { draft: { type: 'expense', id: 'new', day: '' } });
  const backdrop = $$('.modal-backdrop').at(-1);
  const shared = $('#e-shared', backdrop);
  const splitWrap = $('#e-split-wrap', backdrop);
  shared.addEventListener('change', () => {
    splitWrap.style.display = shared.checked ? '' : 'none';
  });
  shared.dispatchEvent(new Event('change'));
}

function maybeWelcomeTheme() {
  if (localStorage.getItem(THEME_KEY) || state.themeOffered) return;
  if (!$('#home').classList.contains('hidden')) return;
  state.themeOffered = true;
  const wrap = openModal('選一個柔和的主題', `
    <div class="muted">套用到整個畫面，只存在這台裝置。略過則先用淡綠，之後可在「更多」更改。</div>
    ${themePickerHtml()}
  `, async () => {
    if (!localStorage.getItem(THEME_KEY)) {
      localStorage.setItem(THEME_KEY, 'mint');
      applyTheme('mint');
    }
    renderHomeTheme();
  }, { cancelLabel: '先用淡綠', okLabel: '完成' });
  bindThemePicker(wrap);
  $('[data-cancel]', wrap).addEventListener('click', () => {
    if (!localStorage.getItem(THEME_KEY)) {
      localStorage.setItem(THEME_KEY, 'mint');
      applyTheme('mint');
    }
    renderHomeTheme();
  });
}

const COUNTRY_ALIASES = {
  '台灣': 'TW', '臺灣': 'TW', taiwan: 'TW', tw: 'TW',
  '台北': 'TW', '臺北': 'TW', '高雄': 'TW', '台中': 'TW', '臺中': 'TW', '台南': 'TW', '臺南': 'TW', '花蓮': 'TW',
  taipei: 'TW', kaohsiung: 'TW',
  '日本': 'JP', japan: 'JP', jp: 'JP',
  '東京': 'JP', '大阪': 'JP', '京都': 'JP', '札幌': 'JP', '福岡': 'JP', '沖繩': 'JP', '名古屋': 'JP', '橫濱': 'JP', '神戶': 'JP', '奈良': 'JP', '廣島': 'JP', '北海道': 'JP',
  tokyo: 'JP', osaka: 'JP', kyoto: 'JP', sapporo: 'JP', fukuoka: 'JP', okinawa: 'JP',
  '韓國': 'KR', '南韓': 'KR', korea: 'KR', 'south korea': 'KR', kr: 'KR',
  '首爾': 'KR', '釜山': 'KR', '濟州': 'KR', '濟州島': 'KR', '仁川': 'KR',
  seoul: 'KR', busan: 'KR', jeju: 'KR', incheon: 'KR',
  '香港': 'HK', 'hong kong': 'HK', hk: 'HK', '九龍': 'HK', kowloon: 'HK',
  '中國': 'CN', '中国': 'CN', china: 'CN', cn: 'CN',
  '北京': 'CN', '上海': 'CN', '廣州': 'CN', '深圳': 'CN', '成都': 'CN', '杭州': 'CN', '重慶': 'CN', '西安': 'CN',
  beijing: 'CN', shanghai: 'CN', guangzhou: 'CN', shenzhen: 'CN',
  '澳洲': 'AU', '澳大利亞': 'AU', australia: 'AU', au: 'AU',
  '雪梨': 'AU', '悉尼': 'AU', '墨爾本': 'AU', '布里斯本': 'AU',
  sydney: 'AU', melbourne: 'AU',
  '紐西蘭': 'NZ', '新西蘭': 'NZ', 'new zealand': 'NZ', nz: 'NZ',
  '奧克蘭': 'NZ', '皇后鎮': 'NZ', '基督城': 'NZ',
  auckland: 'NZ', queenstown: 'NZ',
  '法國': 'FR', france: 'FR', fr: 'FR',
  '巴黎': 'FR', '尼斯': 'FR', '里昂': 'FR', paris: 'FR',
  '德國': 'DE', germany: 'DE', de: 'DE',
  '柏林': 'DE', '慕尼黑': 'DE', '法蘭克福': 'DE', berlin: 'DE', munich: 'DE',
  '瑞士': 'CH', switzerland: 'CH', ch: 'CH',
  '蘇黎世': 'CH', '日內瓦': 'CH', '伯恩': 'CH', zurich: 'CH', geneva: 'CH',
  '泰國': 'TH', thailand: 'TH', '曼谷': 'TH', '清邁': 'TH', bangkok: 'TH', 'chiang mai': 'TH', chiangmai: 'TH',
};

function matchPreset(name) {
  const raw = String(name || '').trim();
  const key = raw.toLowerCase();
  const direct = COUNTRY_ALIASES[key] || COUNTRY_ALIASES[raw];
  if (direct) return COUNTRY_PRESETS.find((c) => c.code === direct) || null;
  const named = COUNTRY_PRESETS.find((c) => c.name === raw);
  if (named) return named;
  const keys = Object.keys(COUNTRY_ALIASES).filter((alias) => {
    if (alias.length < 2) return false;
    if (/^[\u0000-\u007f]+$/.test(alias) && alias.length < 4) return false;
    return true;
  }).sort((a, b) => b.length - a.length);
  const hit = keys.find((alias) => key.includes(alias.toLowerCase()));
  return hit ? (COUNTRY_PRESETS.find((c) => c.code === COUNTRY_ALIASES[hit]) || null) : null;
}

function importDraftFrom(extraction) {
  const src = extraction || {};
  const items = [];
  const raw = (value) => value || '';
  for (const c of src.countries || []) {
    items.push({ include: true, kind: 'country', name: c.name || '', start: c.start || '', startRaw: raw(c.startRaw), end: c.end || '', endRaw: raw(c.endRaw) });
  }
  for (const a of src.activities || []) {
    items.push({ include: true, kind: 'activity', date: a.date || '', dateRaw: raw(a.dateRaw), time: a.time || '', timeRaw: raw(a.timeRaw), endTime: a.endTime || '', endTimeRaw: raw(a.endTimeRaw), endDate: a.endDate || '', endDateRaw: raw(a.endDateRaw), name: a.name || '', location: a.location || '' });
  }
  for (const r of src.restaurants || []) {
    items.push({ include: true, kind: 'restaurant', date: r.date || '', dateRaw: raw(r.dateRaw), time: r.time || '', timeRaw: raw(r.timeRaw), name: r.name || '', meal: r.meal || '其他', place: r.place || '', note: r.note || '' });
  }
  for (const l of src.lodgings || []) {
    items.push({ include: true, kind: 'lodging', name: l.name || '', checkIn: l.checkIn || '', checkInRaw: raw(l.checkInRaw), checkOut: l.checkOut || '', checkOutRaw: raw(l.checkOutRaw), address: l.address || '', note: l.note || '' });
  }
  for (const t of src.transports || []) {
    items.push({ include: true, kind: 'transport', date: t.date || '', dateRaw: raw(t.dateRaw), type: t.type || '其他', from: t.from || '', to: t.to || '', depart: t.depart || '', departRaw: raw(t.departRaw), arrive: t.arrive || '', arriveRaw: raw(t.arriveRaw), arriveDate: t.arriveDate || '', arriveDateRaw: raw(t.arriveDateRaw), note: t.note || '' });
  }
  return items;
}

function importKindLabel(kind) {
  return { activity: '活動', restaurant: '餐廳', lodging: '住宿', transport: '交通', country: '國家' }[kind] || kind;
}

function importRawHint(raw, current) {
  if (!raw || current) return '';
  return `<div class="muted import-raw">無法辨識，原文：${escapeHtml(raw)}</div>`;
}

function importField(idx, field, label, value, type = 'text', raw = '') {
  return `<label>${label}</label><input data-idx="${idx}" data-field="${field}" type="${type}" value="${escapeHtml(value || '')}" />${importRawHint(raw, value)}`;
}

function importSelect(idx, field, label, value, options) {
  return `<label>${label}</label><select data-idx="${idx}" data-field="${field}">${options.map((opt) => `<option ${opt === value ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('')}</select>`;
}

function importItemHtml(item, idx) {
  let fields = '';
  if (item.kind === 'country') {
    fields = importField(idx, 'name', '國家', item.name) + importField(idx, 'start', '開始', item.start, 'date', item.startRaw) + importField(idx, 'end', '結束', item.end, 'date', item.endRaw);
  } else if (item.kind === 'activity') {
    fields = importField(idx, 'name', '做什麼', item.name) + importField(idx, 'time', '開始', item.time, 'time', item.timeRaw) + importField(idx, 'endTime', '結束', item.endTime, 'time', item.endTimeRaw) + importField(idx, 'location', '在哪裡', item.location) + importField(idx, 'date', '日期', item.date, 'date', item.dateRaw) + importField(idx, 'endDate', '結束日期', item.endDate, 'date', item.endDateRaw);
  } else if (item.kind === 'restaurant') {
    fields = importField(idx, 'name', '餐廳', item.name) + importSelect(idx, 'meal', '餐別', item.meal, MEALS) + importField(idx, 'time', '時間', item.time, 'time', item.timeRaw) + importField(idx, 'place', '地址或地圖', item.place) + importField(idx, 'note', '訂位備註', item.note) + importField(idx, 'date', '日期', item.date, 'date', item.dateRaw);
  } else if (item.kind === 'lodging') {
    fields = importField(idx, 'name', '住宿', item.name) + importField(idx, 'checkIn', '入住', item.checkIn, 'date', item.checkInRaw) + importField(idx, 'checkOut', '退房', item.checkOut, 'date', item.checkOutRaw) + importField(idx, 'address', '地址或地圖', item.address) + importField(idx, 'note', '訂房備註', item.note);
  } else if (item.kind === 'transport') {
    fields = importSelect(idx, 'type', '類型', item.type, RIDE_TYPES) + importField(idx, 'from', '出發地', item.from) + importField(idx, 'to', '目的地', item.to) + importField(idx, 'depart', '出發', item.depart, 'time', item.departRaw) + importField(idx, 'arrive', '抵達', item.arrive, 'time', item.arriveRaw) + importField(idx, 'note', '訂位備註', item.note) + importField(idx, 'date', '出發日期', item.date, 'date', item.dateRaw) + importField(idx, 'arriveDate', '抵達日期', item.arriveDate, 'date', item.arriveDateRaw);
  }
  const range = item.kind === 'lodging' && item.checkIn ? `<div class="muted">${escapeHtml(item.checkIn)} → ${escapeHtml(item.checkOut || '?')}，確認後會出現在這段每一天</div>` : '';
  return `
    <div class="import-item kind-${item.kind}">
      <label class="import-check"><input type="checkbox" data-include data-idx="${idx}" ${item.include ? 'checked' : ''} /> ${importKindLabel(item.kind)}</label>
      ${range}
      ${fields}
    </div>
  `;
}

function importReviewHtml(draft) {
  const countries = [];
  const undated = [];
  const byDate = new Map();
  draft.forEach((item, idx) => {
    if (item.kind === 'country') {
      countries.push(importItemHtml(item, idx));
      return;
    }
    const day = item.kind === 'lodging' ? item.checkIn : item.date;
    if (!day) undated.push(importItemHtml(item, idx));
    else {
      if (!byDate.has(day)) byDate.set(day, []);
      byDate.get(day).push(importItemHtml(item, idx));
    }
  });
  const days = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  if (!countries.length && !days.length && !undated.length) {
    return '<div class="muted">沒有辨識出可匯入的項目。</div>';
  }
  return `
    <div class="muted">勾選要匯入的項目，可先修改。按「確認匯入」後才會寫進群組行程。活動、餐廳與交通會顯示在涵蓋該日期的國家時間軸上。</div>
    ${countries.length ? `<div class="import-day"><h4>國家</h4>${countries.join('')}</div>` : ''}
    ${days.map(([date, html]) => `<div class="import-day"><h4>${escapeHtml(date)}（週${weekday(date)}）</h4>${html.join('')}</div>`).join('')}
    ${undated.length ? `<div class="import-day"><h4>日期未定</h4>${undated.join('')}</div>` : ''}
  `;
}

function readImportDraft(root, draft) {
  const items = draft.map((item) => ({ ...item }));
  root.querySelectorAll('[data-include]').forEach((el) => {
    const item = items[Number(el.dataset.idx)];
    if (item) item.include = el.checked;
  });
  root.querySelectorAll('[data-field]').forEach((el) => {
    const item = items[Number(el.dataset.idx)];
    if (item) item[el.dataset.field] = el.value.trim();
  });
  return items;
}

function importSkipLabel(item) {
  return item.name || [item.from, item.to].filter(Boolean).join('→') || importKindLabel(item.kind);
}

function importResultMessage(added, skipped) {
  const shown = skipped.slice(0, 8).map((row) => `${row.label}（${row.reason}）`).join('、');
  const extra = skipped.length > 8 ? `等 ${skipped.length} 項` : '';
  if (!added) {
    return skipped.length ? `沒有可匯入的項目。略過：${shown}${extra}` : '沒有可匯入的項目';
  }
  return skipped.length ? `已匯入 ${added} 項，略過 ${skipped.length} 項：${shown}${extra}` : `已匯入 ${added} 項`;
}

async function commitImport(draft) {
  const days = { ...(state.trip.days || {}) };
  for (const key of Object.keys(days)) days[key] = (days[key] || []).slice();
  const restaurants = (state.trip.restaurants || []).slice();
  const lodgings = (state.trip.lodgings || []).slice();
  const transports = (state.trip.transports || []).slice();
  const countries = (state.trip.countries || []).slice();
  const skipped = [];
  let added = 0;
  const skip = (item, reason) => skipped.push({ label: importSkipLabel(item), reason });
  for (const item of draft) {
    if (!item.include) continue;
    if (item.kind === 'activity') {
      if (!item.name) { skip(item, '缺名稱'); continue; }
      if (!item.date) { skip(item, '缺日期'); continue; }
      const endDate = settleOvernightDate(item.date, item.time, item.endTime, item.endDate);
      if (item.endDate && calendarDate(item.endDate) < calendarDate(item.date)) { skip(item, '結束早於開始'); continue; }
      days[item.date] = (days[item.date] || []).concat([{ id: uid(), text: item.name.slice(0, 80), time: item.time || '', endTime: item.endTime || '', endDate, place: (item.location || '').slice(0, 200) }]);
      added += 1;
    } else if (item.kind === 'restaurant') {
      if (!item.name) { skip(item, '缺名稱'); continue; }
      if (!item.date) { skip(item, '缺日期'); continue; }
      restaurants.push({ id: uid(), date: item.date, name: item.name.slice(0, 80), meal: MEALS.includes(item.meal) ? item.meal : '其他', time: item.time || '', place: (item.place || '').slice(0, 200), note: (item.note || '').slice(0, 200) });
      added += 1;
    } else if (item.kind === 'lodging') {
      if (!item.name) { skip(item, '缺名稱'); continue; }
      if (!item.checkIn || !item.checkOut) { skip(item, '缺日期'); continue; }
      if (item.checkOut < item.checkIn) { skip(item, '退房早於入住'); continue; }
      lodgings.push({ id: uid(), name: item.name.slice(0, 80), checkIn: item.checkIn, checkOut: item.checkOut, place: (item.address || '').slice(0, 200), note: (item.note || '').slice(0, 200) });
      added += 1;
    } else if (item.kind === 'transport') {
      if (!item.from && !item.to) { skip(item, '缺起訖'); continue; }
      if (!item.date) { skip(item, '缺日期'); continue; }
      if (item.arriveDate && calendarDate(item.arriveDate) < calendarDate(item.date)) { skip(item, '抵達早於出發'); continue; }
      const arriveDate = settleOvernightDate(item.date, item.depart, item.arrive, item.arriveDate);
      transports.push({ id: uid(), date: item.date, type: RIDE_TYPES.includes(item.type) ? item.type : '其他', from: (item.from || '').slice(0, 80), to: (item.to || '').slice(0, 80), depart: item.depart || '', arrive: item.arrive || '', arriveDate, note: (item.note || '').slice(0, 200) });
      added += 1;
    } else if (item.kind === 'country') {
      if (!item.name) { skip(item, '缺名稱'); continue; }
      if (!item.start || !item.end) { skip(item, '缺日期'); continue; }
      if (item.end < item.start) { skip(item, '結束早於開始'); continue; }
      const preset = matchPreset(item.name);
      const country = {
        id: uid(),
        name: preset?.name || item.name.slice(0, 40),
        code: preset?.code || '',
        tz: preset?.tz || 'UTC',
        currency: preset?.currency || 'TWD',
        start: item.start,
        end: item.end,
      };
      const dup = countries.some((c) => c.name === country.name && c.start === country.start && c.end === country.end);
      if (dup) { skip(item, '與現有區間重複'); continue; }
      countries.push(country);
      added += 1;
    }
  }
  const message = importResultMessage(added, skipped);
  if (!added) throw new Error(message);
  await saveTrip({ days, restaurants, lodgings, transports, countries });
  return { added, skipped, message };
}

function fileMime(file) {
  const type = (file.type || '').toLowerCase();
  if (type && type !== 'application/octet-stream') return type;
  const name = file.name.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.heic')) return 'image/heic';
  if (name.endsWith('.heif')) return 'image/heif';
  return type || 'application/octet-stream';
}

function readFileData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || '');
      resolve(raw.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('無法讀取檔案'));
    reader.readAsDataURL(file);
  });
}

function openImportSheet() {
  const files = [];
  let pasted = '';
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop import-sheet';
  wrap.innerHTML = `
    <div class="modal">
      <h3>匯入行程</h3>
      <p class="import-cost">每次匯入會使用主人的 OpenAI 帳號（少量費用）。</p>
      <p class="import-cost" id="import-own-note" hidden>這次改用你存在這台裝置的金鑰計費，金鑰不會存到伺服器。</p>
      <div id="import-body"></div>
    </div>
  `;
  document.body.appendChild(wrap);
  let closed = false;
  let draft = [];
  const close = () => { closed = true; wrap.remove(); };
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });

  const savedKey = () => localStorage.getItem('tp_openai_key') || '';
  const syncOwnNote = () => {
    const typed = $('#import-key', wrap)?.value.trim() || '';
    const remember = Boolean($('#import-key-save', wrap)?.checked);
    const own = Boolean(typed || (remember && savedKey()));
    const note = $('#import-own-note', wrap);
    if (note) note.hidden = !own;
  };

  function formHtml(status) {
    const configured = Boolean(status?.configured);
    return `
      ${configured ? '' : '<div class="muted">伺服器尚未設定匯入。可輸入自己的 OpenAI 金鑰，只存在這台裝置，每次請求才送出，不會存到伺服器。</div>'}
      <label>貼上確認信或行程文字</label>
      <textarea id="import-text" rows="4" placeholder="貼上訂位信、行程表…"></textarea>
      <label>上傳截圖、照片或 PDF</label>
      <input id="import-files" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" multiple />
      <div class="muted">JPG、PNG、WEBP、PDF，合計 10 MB 以內。HEIC 請先轉成 JPG。</div>
      <ul class="import-files" id="import-file-list"></ul>
      <label>自己的 OpenAI 金鑰（選填）</label>
      <input id="import-key" type="password" autocomplete="off" placeholder="${savedKey() ? '已記住一組金鑰，可覆寫' : 'sk-...'}" />
      <label class="import-check" style="font-weight:500;margin-top:0.45rem"><input id="import-key-save" type="checkbox" checked /> 記住在這台裝置</label>
      <button class="ghost" id="import-key-clear" type="button">清除裝置內金鑰</button>
      <div class="actions">
        <button class="secondary" type="button" id="import-cancel">關閉</button>
        <button class="secondary" type="button" id="import-sample">預覽範例</button>
      </div>
      <div class="actions">
        <button type="button" id="import-go">開始辨識</button>
      </div>
    `;
  }

  function renderFileList() {
    const list = $('#import-file-list', wrap);
    if (!list) return;
    list.innerHTML = files.map((file, i) => `<li><span>${escapeHtml(file.name)}</span><button class="ghost" type="button" data-remove-file="${i}">移除</button></li>`).join('');
    $$('[data-remove-file]', list).forEach((btn) => btn.addEventListener('click', () => {
      files.splice(Number(btn.dataset.removeFile), 1);
      renderFileList();
    }));
  }

  function showForm(status) {
    $('#import-body', wrap).innerHTML = formHtml(status);
    renderFileList();
    const text = $('#import-text', wrap);
    if (text) text.value = pasted;
    const importDraftKey = draftStorageKey({ type: 'import', id: 'text', day: '' });
    const savedImport = readDraft(importDraftKey);
    if (text && !text.value && savedImport?.fields?.['import-text']) {
      text.value = savedImport.fields['import-text'];
      pasted = text.value;
      const banner = document.createElement('div');
      banner.className = 'draft-banner';
      banner.innerHTML = `已恢復上次未完成的草稿 <button type="button" class="ghost" id="import-draft-discard">捨棄草稿</button>`;
      text.before(banner);
      $('#import-draft-discard', banner).addEventListener('click', () => {
        localStorage.removeItem(importDraftKey);
        text.value = '';
        pasted = '';
        banner.remove();
        const mark = $('#import-draft-saved', wrap);
        if (mark) mark.hidden = true;
      });
    }
    if (text) {
      const mark = document.createElement('div');
      mark.id = 'import-draft-saved';
      mark.className = 'draft-saved';
      mark.hidden = true;
      mark.textContent = '草稿已暫存';
      text.after(mark);
      let importTimer = null;
      text.addEventListener('input', () => {
        pasted = text.value;
        clearTimeout(importTimer);
        importTimer = setTimeout(() => {
          if (!text.value.trim()) {
            localStorage.removeItem(importDraftKey);
            mark.hidden = true;
            return;
          }
          localStorage.setItem(importDraftKey, JSON.stringify({
            savedAt: Date.now(),
            fields: { 'import-text': text.value },
            meta: { type: 'import', id: 'text', day: '' },
            title: '匯入行程',
          }));
          mark.hidden = false;
        }, 500);
      });
    }
    syncOwnNote();
    $('#import-key-save', wrap)?.addEventListener('change', syncOwnNote);
    $('#import-cancel', wrap).addEventListener('click', () => {
      const value = text?.value || '';
      if (!value.trim()) {
        localStorage.removeItem(importDraftKey);
        close();
        return;
      }
      localStorage.setItem(importDraftKey, JSON.stringify({
        savedAt: Date.now(),
        fields: { 'import-text': value },
        meta: { type: 'import', id: 'text', day: '' },
        title: '匯入行程',
      }));
      let ask = $('#import-draft-ask', wrap);
      if (ask) { ask.hidden = false; return; }
      ask = document.createElement('div');
      ask.id = 'import-draft-ask';
      ask.className = 'draft-ask';
      ask.innerHTML = `<div>要保留草稿嗎？</div><div class="actions"><button type="button" class="secondary" data-import-keep>保留</button><button type="button" data-import-drop>捨棄</button></div>`;
      $('#import-body', wrap).appendChild(ask);
      $('[data-import-keep]', ask).addEventListener('click', close);
      $('[data-import-drop]', ask).addEventListener('click', () => {
        localStorage.removeItem(importDraftKey);
        close();
      });
    });
    $('#import-key', wrap).addEventListener('input', syncOwnNote);
    $('#import-key-clear', wrap).addEventListener('click', () => {
      localStorage.removeItem('tp_openai_key');
      const input = $('#import-key', wrap);
      if (input) input.value = '';
      syncOwnNote();
      toast('已清除裝置內金鑰');
    });
    $('#import-files', wrap).addEventListener('change', async () => {
      const input = $('#import-files', wrap);
      const picked = [...(input.files || [])];
      input.value = '';
      try {
        for (const file of picked) {
          if (files.length >= 8) throw new Error('一次最多 8 個檔案');
          const mime = fileMime(file);
          if (mime === 'image/heic' || mime === 'image/heif') throw new Error('HEIC 請先轉成 JPG 或 PNG');
          if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(mime)) throw new Error('只接受 JPG、PNG、WEBP 或 PDF');
          const nextSize = files.reduce((sum, f) => sum + f.size, 0) + file.size;
          if (nextSize > 10 * 1024 * 1024) throw new Error('檔案合計超過 10 MB');
          const data = await readFileData(file);
          files.push({ name: file.name, mime, data, size: file.size });
        }
        renderFileList();
      } catch (err) {
        toast(err.message || '無法讀取檔案');
      }
    });
    $('#import-sample', wrap).addEventListener('click', () => runImport(true));
    $('#import-go', wrap).addEventListener('click', () => runImport(false));
  }

  function chosenKey() {
    const typed = $('#import-key', wrap)?.value.trim() || '';
    const remember = Boolean($('#import-key-save', wrap)?.checked);
    if (typed) {
      if (remember) localStorage.setItem('tp_openai_key', typed);
      else localStorage.removeItem('tp_openai_key');
      return typed;
    }
    return remember ? savedKey() : '';
  }

  function showReview(extraction, mock, notices) {
    draft = importDraftFrom(extraction);
    $('#import-body', wrap).innerHTML = `
      ${mock ? '<div class="muted">這是範例資料，沒有呼叫 OpenAI。</div>' : ''}
      ${(notices || []).map((note) => `<div class="muted">${escapeHtml(note)}</div>`).join('')}
      ${importReviewHtml(draft)}
      <div class="actions">
        <button class="secondary" type="button" id="import-back">返回</button>
        <button type="button" id="import-confirm">確認匯入</button>
      </div>
    `;
    $('#import-back', wrap).addEventListener('click', () => showForm(wrap._status));
    $('#import-confirm', wrap).addEventListener('click', async () => {
      const btn = $('#import-confirm', wrap);
      btn.disabled = true;
      try {
        const items = readImportDraft($('#import-body', wrap), draft);
        const result = await commitImport(items);
        if (closed) return;
        close();
        toast(result.message, result.skipped.length ? 7000 : 2800);
      } catch (err) {
        btn.disabled = false;
        toast(err.message || '匯入失敗', String(err.message || '').includes('略過') ? 7000 : 2200);
      }
    });
  }

  async function runImport(mock) {
    const go = $('#import-go', wrap);
    const sample = $('#import-sample', wrap);
    if (go) go.disabled = true;
    if (sample) sample.disabled = true;
    pasted = $('#import-text', wrap)?.value ?? pasted;
    try {
      const payload = { memberId: state.memberId, mock: Boolean(mock) };
      if (!mock) {
        payload.text = $('#import-text', wrap)?.value || '';
        payload.files = files.map(({ name, mime, data }) => ({ name, mime, data }));
        const key = chosenKey();
        if (key) payload.apiKey = key;
        if (!payload.text.trim() && !payload.files.length) throw new Error('請貼上文字或上傳檔案');
      }
      const data = await api(`/api/trips/${state.trip.id}/import`, { method: 'POST', body: JSON.stringify(payload) });
      if (closed) return;
      clearDraft({ type: 'import', id: 'text', day: '' });
      showReview(data.extraction, data.mock, data.notices);
    } catch (err) {
      if (go) go.disabled = false;
      if (sample) sample.disabled = false;
      toast(err.message || '匯入失敗');
    }
  }

  (async () => {
    let status = { configured: false };
    try {
      status = await api('/api/import/status');
    } catch (_) { /* sheet still offers a personal key */ }
    if (closed) return;
    wrap._status = status;
    showForm(status);
    syncOwnNote();
  })();
}

function bindHome() {
  $('#form-create').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('#create-title').value.trim();
    const nickname = $('#create-nick').value.trim();
    try {
      const data = await api('/api/trips', { method: 'POST', body: JSON.stringify({ title, nickname, countries: [] }) });
      adoptTrip(data.trip);
      state.tripId = data.trip.id;
      state.memberId = data.memberId;
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
      adoptTrip(data.trip);
      state.tripId = data.trip.id;
      state.memberId = data.memberId;
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
  applyTheme(currentThemeId());
  bindHome();
  renderHomeTheme();
  try {
    await loadRates(false);
  } catch (_) {}
  try {
    const config = await api('/api/config');
    state.googleClientId = String(config.googleClientId || '').trim();
    state.flightLookup = Boolean(config.flightLookup);
    if (state.googleClientId) loadGisScript().catch(() => {});
  } catch (_) {
    state.googleClientId = '';
    state.flightLookup = false;
  }
  if (state.tripId && state.memberId) {
    try {
      const data = await api(`/api/trips/${state.tripId}`);
      adoptTrip(data.trip);
      showApp();
      maybeWelcomeTheme();
      return;
    } catch (_) {
      localStorage.removeItem('tp_tripId');
      localStorage.removeItem('tp_memberId');
      state.tripId = null;
      state.memberId = null;
    }
  }
  showHome();
}

boot();
