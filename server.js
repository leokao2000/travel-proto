const express = require('express');
const fs = require('fs');
const path = require('path');
const { customAlphabet } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'trips.json');
const RATES_FILE = path.join(DATA_DIR, 'rates.json');
const PLACES_FILE = path.join(DATA_DIR, 'places-cache.json');

const SUPPORTED_CURRENCIES = ['EUR', 'CHF', 'JPY', 'TWD', 'CNY', 'HKD', 'AUD', 'NZD', 'KRW'];
const RATE_CACHE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const inviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);
const id = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

app.use((req, res, next) => {
  const big = req.method === 'POST' && /\/import$/.test(req.path);
  return express.json({ limit: big ? '16mb' : '1mb' })(req, res, next);
});
app.use(express.static(path.join(__dirname, 'public')));

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ trips: {} }, null, 2));
}

function readDb() {
  ensureData();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeDb(db) {
  ensureData();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function readRatesCache() {
  try {
    if (!fs.existsSync(RATES_FILE)) return null;
    return JSON.parse(fs.readFileSync(RATES_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writeRatesCache(payload) {
  ensureData();
  fs.writeFileSync(RATES_FILE, JSON.stringify(payload, null, 2));
}

async function fetchLiveRates() {
  // open.er-api.com: free, no key; base TWD → how many TWD per 1 unit is inverse of rates
  // API returns: 1 TWD = rates[CUR] CUR, so 1 CUR = 1/rates[CUR] TWD
  const url = 'https://open.er-api.com/v6/latest/TWD';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`rates upstream ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success' || !data.rates) throw new Error('rates payload invalid');
  const toTwd = { TWD: 1 };
  for (const cur of SUPPORTED_CURRENCIES) {
    if (cur === 'TWD') continue;
    const perTwd = data.rates[cur];
    if (perTwd == null || !(perTwd > 0)) throw new Error(`missing rate ${cur}`);
    toTwd[cur] = 1 / perTwd; // 1 CUR = X TWD
  }
  const updatedAt = (data.time_last_update_utc || '').slice(0, 16) || new Date().toISOString().slice(0, 10);
  const payload = {
    base: 'TWD',
    label: '預估匯率',
    updatedAt,
    fetchedAt: new Date().toISOString(),
    rates: toTwd,
    source: 'open.er-api.com',
    currencies: SUPPORTED_CURRENCIES,
  };
  writeRatesCache(payload);
  return payload;
}

async function getRates({ force = false } = {}) {
  const cached = readRatesCache();
  if (!force && cached && cached.fetchedAt) {
    const age = Date.now() - new Date(cached.fetchedAt).getTime();
    if (age < RATE_CACHE_MS && cached.rates) return { ...cached, cached: true };
  }
  try {
    const fresh = await fetchLiveRates();
    return { ...fresh, cached: false };
  } catch (err) {
    if (cached && cached.rates) {
      return { ...cached, cached: true, stale: true, error: String(err.message || err) };
    }
    throw err;
  }
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function publicTrip(trip) {
  return {
    id: trip.id,
    code: trip.code,
    title: trip.title,
    homeCurrency: trip.homeCurrency || 'TWD',
    countries: trip.countries || [],
    members: trip.members || [],
    days: trip.days || {},
    restaurants: asList(trip.restaurants),
    lodgings: asList(trip.lodgings),
    transports: asList(trip.transports),
    expenses: trip.expenses || [],
    updatedAt: trip.updatedAt,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/meta', (_req, res) => {
  res.json({
    currencies: SUPPORTED_CURRENCIES,
    homeCurrency: 'TWD',
    rateCacheDays: 7,
  });
});

app.get('/api/rates', async (req, res) => {
  try {
    const force = String(req.query.refresh || '') === '1';
    const rates = await getRates({ force });
    res.json(rates);
  } catch (err) {
    res.status(502).json({ error: '無法取得匯率', detail: String(err.message || err) });
  }
});

app.post('/api/trips', (req, res) => {
  const { title, nickname, countries } = req.body || {};
  if (!title || !nickname) {
    return res.status(400).json({ error: '需要旅行名稱與暱稱' });
  }
  const memberId = id();
  const trip = {
    id: id(),
    code: inviteCode(),
    title: String(title).slice(0, 80),
    homeCurrency: 'TWD',
    countries: Array.isArray(countries) ? countries : [],
    members: [{ id: memberId, nickname: String(nickname).slice(0, 40), joinedAt: new Date().toISOString() }],
    days: {},
    restaurants: [],
    lodgings: [],
    transports: [],
    expenses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const db = readDb();
  db.trips[trip.id] = trip;
  writeDb(db);
  res.json({ trip: publicTrip(trip), memberId });
});

app.post('/api/trips/join', (req, res) => {
  const { code, nickname } = req.body || {};
  if (!code || !nickname) return res.status(400).json({ error: '需要邀請碼與暱稱' });
  const db = readDb();
  const trip = Object.values(db.trips).find((t) => t.code.toUpperCase() === String(code).trim().toUpperCase());
  if (!trip) return res.status(404).json({ error: '找不到此邀請碼' });
  let member = trip.members.find((m) => m.nickname === String(nickname).trim());
  if (!member) {
    member = { id: id(), nickname: String(nickname).slice(0, 40), joinedAt: new Date().toISOString() };
    trip.members.push(member);
    trip.updatedAt = new Date().toISOString();
    writeDb(db);
  }
  res.json({ trip: publicTrip(trip), memberId: member.id });
});

app.get('/api/trips/:tripId', (req, res) => {
  const db = readDb();
  const trip = db.trips[req.params.tripId];
  if (!trip) return res.status(404).json({ error: '找不到旅行' });
  const since = req.query.since ? Number(req.query.since) : 0;
  const updatedMs = new Date(trip.updatedAt).getTime();
  if (since && updatedMs <= since) {
    return res.json({ unchanged: true, updatedAt: trip.updatedAt });
  }
  res.json({ trip: publicTrip(trip) });
});

app.put('/api/trips/:tripId', (req, res) => {
  const db = readDb();
  const trip = db.trips[req.params.tripId];
  if (!trip) return res.status(404).json({ error: '找不到旅行' });
  const body = req.body || {};
  const memberId = body.memberId;
  if (!memberId || !trip.members.some((m) => m.id === memberId)) {
    return res.status(403).json({ error: '無效的成員' });
  }
  if (body.title != null) trip.title = String(body.title).slice(0, 80);
  if (Array.isArray(body.countries)) trip.countries = body.countries;
  if (body.days && typeof body.days === 'object') trip.days = body.days;
  if (Array.isArray(body.restaurants)) trip.restaurants = body.restaurants;
  if (Array.isArray(body.lodgings)) trip.lodgings = body.lodgings;
  if (Array.isArray(body.transports)) trip.transports = body.transports;
  if (Array.isArray(body.expenses)) trip.expenses = body.expenses;
  trip.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ trip: publicTrip(trip) });
});

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';
const FALLBACK_OPENAI_MODEL = 'gpt-4o-mini';
const IMPORT_MAX_BYTES = 10 * 1024 * 1024;
const IMPORT_MAX_FILES = 8;
const IMPORT_MAX_TEXT = 50000;
const MEAL_VALUES = ['早餐', '午餐', '晚餐', '其他'];
const RIDE_VALUES = ['飛機', '火車', '巴士', '租車', '其他'];

const IMPORT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    countries: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { name: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' } },
        required: ['name', 'start', 'end'],
      },
    },
    activities: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          date: { type: 'string' },
          time: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'string' },
        },
        required: ['date', 'time', 'name', 'location'],
      },
    },
    restaurants: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          date: { type: 'string' },
          name: { type: 'string' },
          meal: { type: 'string', enum: MEAL_VALUES },
          time: { type: 'string' },
          place: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['date', 'name', 'meal', 'time', 'place', 'note'],
      },
    },
    lodgings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          checkIn: { type: 'string' },
          checkOut: { type: 'string' },
          address: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['name', 'checkIn', 'checkOut', 'address', 'note'],
      },
    },
    transports: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          date: { type: 'string' },
          type: { type: 'string', enum: RIDE_VALUES },
          from: { type: 'string' },
          to: { type: 'string' },
          depart: { type: 'string' },
          arrive: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['date', 'type', 'from', 'to', 'depart', 'arrive', 'note'],
      },
    },
  },
  required: ['countries', 'activities', 'restaurants', 'lodgings', 'transports'],
};

function serverOpenAIKey() {
  return String(process.env.OPENAI_API_KEY || '').trim();
}

function openAIModel() {
  return String(process.env.OPENAI_MODEL || '').trim() || DEFAULT_OPENAI_MODEL;
}

function clipText(value, max) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function clipDate(value) {
  const s = clipText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

function clipTime(value) {
  const s = clipText(value, 8);
  const match = s.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '';
}

function oneOf(value, list, fallback) {
  const s = clipText(value, 20);
  return list.includes(s) ? s : fallback;
}

function cleanExtraction(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const list = (value) => (Array.isArray(value) ? value.slice(0, 80) : []);
  return {
    countries: list(src.countries).map((c) => ({
      name: clipText(c?.name, 40),
      start: clipDate(c?.start),
      end: clipDate(c?.end),
    })).filter((c) => c.name),
    activities: list(src.activities).map((a) => ({
      date: clipDate(a?.date),
      time: clipTime(a?.time),
      name: clipText(a?.name, 80),
      location: clipText(a?.location, 200),
    })).filter((a) => a.name),
    restaurants: list(src.restaurants).map((r) => ({
      date: clipDate(r?.date),
      name: clipText(r?.name, 80),
      meal: oneOf(r?.meal, MEAL_VALUES, '其他'),
      time: clipTime(r?.time),
      place: clipText(r?.place, 200),
      note: clipText(r?.note, 200),
    })).filter((r) => r.name),
    lodgings: list(src.lodgings).map((l) => ({
      name: clipText(l?.name, 80),
      checkIn: clipDate(l?.checkIn),
      checkOut: clipDate(l?.checkOut),
      address: clipText(l?.address, 200),
      note: clipText(l?.note, 200),
    })).filter((l) => l.name),
    transports: list(src.transports).map((t) => ({
      date: clipDate(t?.date),
      type: oneOf(t?.type, RIDE_VALUES, '其他'),
      from: clipText(t?.from, 80),
      to: clipText(t?.to, 80),
      depart: clipTime(t?.depart),
      arrive: clipTime(t?.arrive),
      note: clipText(t?.note, 200),
    })).filter((t) => t.from || t.to),
  };
}

function mockExtraction() {
  return cleanExtraction({
    countries: [{ name: '日本', start: '2026-04-01', end: '2026-04-03' }],
    activities: [{ date: '2026-04-01', time: '09:30', name: '淺草寺', location: '東京台東區' }],
    restaurants: [{ date: '2026-04-01', name: '一蘭拉麵', meal: '午餐', time: '12:30', place: '淺草', note: '範例訂位' }],
    lodgings: [{ name: '淺草飯店', checkIn: '2026-04-01', checkOut: '2026-04-03', address: '東京淺草', note: '範例確認碼' }],
    transports: [{ date: '2026-04-01', type: '火車', from: '東京', to: '京都', depart: '15:00', arrive: '17:20', note: '範例車次' }],
  });
}

function guessMime(file) {
  let mime = String(file?.mime || '').toLowerCase().split(';')[0].trim();
  const name = String(file?.name || '').toLowerCase();
  if (!mime || mime === 'application/octet-stream') {
    if (name.endsWith('.png')) mime = 'image/png';
    else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mime = 'image/jpeg';
    else if (name.endsWith('.webp')) mime = 'image/webp';
    else if (name.endsWith('.pdf')) mime = 'application/pdf';
    else if (name.endsWith('.heic')) mime = 'image/heic';
    else if (name.endsWith('.heif')) mime = 'image/heif';
  }
  return mime;
}

function decodeUpload(data) {
  const raw = String(data || '').replace(/^data:[^,]+,/, '').replace(/\s/g, '');
  if (!raw || !/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) return null;
  return Buffer.from(raw, 'base64');
}

function importContext(trip) {
  const countries = (trip.countries || [])
    .map((c) => `${c.name || ''} ${c.start || '?'}–${c.end || '?'} ${c.tz || ''}`.trim())
    .join('；');
  return [
    '你是旅行行程整理助手。請只根據使用者提供的文字、截圖或 PDF 抽出實際出現的行程，不要捏造。',
    '日期用 YYYY-MM-DD，時間用 24 小時制 HH:MM；不知道就留空字串。',
    '餐別只能是 早餐、午餐、晚餐、其他。交通類型只能是 飛機、火車、巴士、租車、其他。',
    '活動的 name 是「做什麼」，location 是「在哪裡」。住宿填入住與退房日期。',
    '國家名稱請優先用：台灣、日本、韓國、香港、中國、澳洲、紐西蘭、法國、德國、瑞士。',
    `旅行名稱：${trip.title || ''}`,
    `這趟旅行已有的國家與時區：${countries || '（尚未設定）'}`,
  ].join('\n');
}

function isUnknownModel(status, data) {
  const code = data?.error?.code;
  return status === 404 || code === 'model_not_found';
}

function friendlyOpenAIError(status, data) {
  const code = data?.error?.code || '';
  if (status === 401 || code === 'invalid_api_key') return 'OpenAI 金鑰無效，請確認後再試。';
  if (status === 429 || code === 'rate_limit_exceeded' || code === 'insufficient_quota') return '匯入太頻繁或額度不足，請稍後再試。';
  if (status === 413) return '檔案太大，請縮小後再試。';
  return '匯入失敗，請稍後再試。';
}

async function callOpenAI({ apiKey, model, messages }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'itinerary_import', strict: true, schema: IMPORT_SCHEMA },
      },
      max_completion_tokens: 4096,
    }),
    signal: AbortSignal.timeout(90000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

app.get('/api/import/status', (_req, res) => {
  res.json({ configured: Boolean(serverOpenAIKey()), model: openAIModel() });
});

app.post('/api/trips/:tripId/import', async (req, res) => {
  const db = readDb();
  const trip = db.trips[req.params.tripId];
  if (!trip) return res.status(404).json({ error: '找不到旅行' });
  const body = req.body || {};
  const memberId = body.memberId;
  if (!memberId || !trip.members.some((m) => m.id === memberId)) {
    return res.status(403).json({ error: '無效的成員' });
  }
  if (body.mock === true) {
    return res.json({ extraction: mockExtraction(), mock: true });
  }

  const text = String(body.text || '').trim().slice(0, IMPORT_MAX_TEXT);
  const files = Array.isArray(body.files) ? body.files : [];
  if (!text && !files.length) return res.status(400).json({ error: '請貼上文字或上傳檔案。' });
  if (files.length > IMPORT_MAX_FILES) return res.status(400).json({ error: `一次最多 ${IMPORT_MAX_FILES} 個檔案。` });

  const parts = [{ type: 'text', text: text || '請依附檔抽出行程。' }];
  let total = 0;
  for (const file of files) {
    const mime = guessMime(file);
    if (mime === 'image/heic' || mime === 'image/heif') {
      return res.status(400).json({ error: 'HEIC 照片請先轉成 JPG 或 PNG 再匯入。' });
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(mime)) {
      return res.status(400).json({ error: '只接受 JPG、PNG、WEBP 或 PDF。' });
    }
    const buf = decodeUpload(file.data);
    if (!buf || !buf.length) return res.status(400).json({ error: '檔案內容無法讀取。' });
    total += buf.length;
    if (total > IMPORT_MAX_BYTES) return res.status(413).json({ error: '檔案合計超過 10 MB。' });
    const filename = clipText(file.name, 80) || (mime === 'application/pdf' ? 'booking.pdf' : 'image');
    const b64 = buf.toString('base64');
    if (mime === 'application/pdf') {
      parts.push({
        type: 'file',
        file: { filename, file_data: `data:application/pdf;base64,${b64}` },
      });
    } else {
      parts.push({
        type: 'image_url',
        image_url: { url: `data:${mime};base64,${b64}`, detail: 'auto' },
      });
    }
  }

  const providedKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
  const apiKey = providedKey || serverOpenAIKey();
  if (!apiKey) {
    return res.status(503).json({ error: '尚未設定匯入。請在伺服器設定 OPENAI_API_KEY，或在這台裝置輸入自己的金鑰。' });
  }

  const messages = [
    { role: 'system', content: importContext(trip) },
    { role: 'user', content: parts },
  ];
  let model = openAIModel();
  let result;
  try {
    result = await callOpenAI({ apiKey, model, messages });
    if (!result.ok && isUnknownModel(result.status, result.data) && model !== FALLBACK_OPENAI_MODEL) {
      model = FALLBACK_OPENAI_MODEL;
      result = await callOpenAI({ apiKey, model, messages });
    }
  } catch (err) {
    console.error('openai import failed', err?.name || 'error');
    return res.status(502).json({ error: '無法連上 OpenAI，請稍後再試。' });
  }
  if (!result.ok) {
    console.error('openai import status', result.status, result.data?.error?.code || '');
    const status = result.status === 429 ? 429 : result.status === 401 ? 401 : 502;
    return res.status(status).json({ error: friendlyOpenAIError(result.status, result.data) });
  }
  const content = result.data?.choices?.[0]?.message?.content;
  if (!content) return res.status(502).json({ error: '沒有辨識出行程，請換一張較清楚的截圖或改貼文字。' });
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return res.status(502).json({ error: '辨識結果無法讀取，請再試一次。' });
  }
  res.json({ extraction: cleanExtraction(parsed), mock: false, model });
});

const PLACES_CACHE_MS = 7 * 24 * 60 * 60 * 1000;
const PLACES_ENDPOINT = process.env.PLACES_API_URL || 'https://places.googleapis.com/v1/places:searchText';

function placesApiKey() {
  return String(process.env.GOOGLE_PLACES_API_KEY || '').trim();
}

function readPlacesCache() {
  try {
    return JSON.parse(fs.readFileSync(PLACES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writePlacesCache(cache) {
  ensureData();
  fs.writeFileSync(PLACES_FILE, JSON.stringify(cache));
}

function placeSnippet(review) {
  const text = String(review?.text?.text || review?.text || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (!text) return null;
  return {
    text,
    rating: typeof review.rating === 'number' ? review.rating : null,
    author: String(review.authorAttribution?.displayName || '').slice(0, 40),
  };
}

function placeCandidate(place) {
  const id = String(place?.id || '').trim().slice(0, 200);
  if (!id) return null;
  const display = place.displayName;
  const name = String(typeof display === 'string' ? display : display?.text || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  return {
    id,
    name,
    address: String(place.formattedAddress || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    rating: typeof place.rating === 'number' ? place.rating : null,
    userRatingCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : null,
    googleMapsUri: typeof place.googleMapsUri === 'string' ? place.googleMapsUri : '',
    phone: String(place.nationalPhoneNumber || place.internationalPhoneNumber || '').replace(/\s+/g, ' ').trim().slice(0, 40),
    reviews: (place.reviews || []).slice(0, 3).map(placeSnippet).filter(Boolean),
  };
}

app.get('/api/places/status', (_req, res) => {
  res.json({ enabled: Boolean(placesApiKey()) });
});

app.get('/api/places/reviews', async (req, res) => {
  const key = placesApiKey();
  if (!key) return res.json({ enabled: false });
  const query = String(req.query.q || '').trim().replace(/\s+/g, ' ').slice(0, 200);
  if (!query) return res.status(400).json({ enabled: true, error: '缺少名稱' });
  const cacheId = query.toLowerCase();
  const cache = readPlacesCache();
  const hit = cache[cacheId];
  if (hit?.fetchedAt && hit.payload?.version === 2 && Array.isArray(hit.payload.candidates) && Date.now() - new Date(hit.fetchedAt).getTime() < PLACES_CACHE_MS) {
    return res.json({ enabled: true, cached: true, candidates: hit.payload.candidates });
  }
  try {
    const upstream = await fetch(PLACES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 5, languageCode: 'zh-TW' }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('places search', upstream.status);
      return res.status(502).json({ enabled: true, error: true });
    }
    const candidates = (data.places || []).slice(0, 5).map(placeCandidate).filter(Boolean);
    cache[cacheId] = { fetchedAt: new Date().toISOString(), payload: { version: 2, candidates } };
    writePlacesCache(cache);
    res.json({ enabled: true, cached: false, candidates });
  } catch (err) {
    console.error('places search failed', err?.name || 'error');
    res.status(502).json({ enabled: true, error: true });
  }
});

app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ error: '檔案太大，請控制在 10 MB 以內。' });
  }
  return next(err);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

ensureData();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`travel-proto listening on ${PORT}`);
});
