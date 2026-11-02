const express = require('express');
const fs = require('fs');
const path = require('path');
const { customAlphabet } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'trips.json');
const RATES_FILE = path.join(DATA_DIR, 'rates.json');

const SUPPORTED_CURRENCIES = ['EUR', 'CHF', 'JPY', 'TWD', 'CNY', 'HKD', 'AUD', 'NZD', 'KRW'];
const RATE_CACHE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const inviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);
const id = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

app.use(express.json({ limit: '1mb' }));
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

function publicTrip(trip) {
  return {
    id: trip.id,
    code: trip.code,
    title: trip.title,
    homeCurrency: trip.homeCurrency || 'TWD',
    countries: trip.countries || [],
    members: trip.members || [],
    days: trip.days || {},
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
  if (Array.isArray(body.expenses)) trip.expenses = body.expenses;
  trip.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ trip: publicTrip(trip) });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

ensureData();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`travel-proto listening on ${PORT}`);
});
