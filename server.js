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
  const big = req.method === 'POST' && /\/(import|restore)$/.test(req.path);
  return express.json({ limit: big ? '16mb' : '4mb' })(req, res, next);
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
    flights: sanitizeFlights(trip.flights),
    guide: sanitizeGuide(trip.guide),
    spots: sanitizeSpots(trip.spots),
    updatedAt: trip.updatedAt,
  };
}

function sanitizeGuide(guide) {
  const src = guide && typeof guide === 'object' ? guide : {};
  const modes = ['飛機', '火車', '巴士', '船', '自駕', '其他'];
  const mode = modes.includes(src.transportMode) ? src.transportMode : '';
  const day = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : '';
  const time = (value) => /^\d{2}:\d{2}$/.test(String(value || '')) ? String(value) : '';
  const choice = ['yes', 'no', 'later'].includes(src.lodgingChoice) ? src.lodgingChoice : '';
  return {
    step: Math.max(0, Math.min(5, Number(src.step) || 0)),
    destination: String(src.destination || '').trim().slice(0, 40),
    countryId: String(src.countryId || '').slice(0, 40),
    transportMode: mode,
    departDate: day(src.departDate),
    departTime: time(src.departTime),
    returnDate: day(src.returnDate),
    returnTime: time(src.returnTime),
    lodgingChoice: choice,
    outboundId: String(src.outboundId || '').slice(0, 40),
    returnId: String(src.returnId || '').slice(0, 40),
  };
}

function sanitizeSpots(spots) {
  return asList(spots).slice(0, 80).map((spot) => {
    const lat = Number(spot?.lat);
    const lng = Number(spot?.lng);
    return {
      id: String(spot?.id || '').slice(0, 40),
      name: String(spot?.name || '').trim().slice(0, 80),
      day: /^\d{4}-\d{2}-\d{2}$/.test(String(spot?.day || '')) ? String(spot.day) : '',
      order: Number.isFinite(Number(spot?.order)) ? Number(spot.order) : 0,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      thumb: String(spot?.thumb || '').slice(0, 1000),
    };
  }).filter((spot) => spot.id && spot.name);
}

function sanitizeLeg(leg) {
  const src = leg && typeof leg === 'object' ? leg : {};
  const date = String(src.date || '');
  const time = (value) => /^\d{2}:\d{2}$/.test(String(value || '')) ? String(value) : '';
  return {
    number: String(src.number || '').trim().toUpperCase().slice(0, 8),
    date: /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : '',
    from: String(src.from || '').trim().slice(0, 20),
    to: String(src.to || '').trim().slice(0, 20),
    depart: time(src.depart),
    arrive: time(src.arrive),
  };
}

function sanitizeFlights(flights) {
  const src = flights && typeof flights === 'object' ? flights : {};
  return { outbound: sanitizeLeg(src.outbound), inbound: sanitizeLeg(src.inbound) };
}

function countryImageError(countries) {
  let total = 0;
  for (const country of countries || []) {
    const slots = Array.isArray(country?.patterns) ? country.patterns : [];
    for (const slot of slots) {
      if (slot?.kind !== 'image' || typeof slot.data !== 'string') continue;
      if (!slot.data.startsWith('data:image/') || slot.data.length > 45000) return '單張圖案請小於 30KB';
      total += slot.data.length;
    }
  }
  if (total > 800000) return '圖案總量太大';
  return '';
}

function sanitizePatterns(patterns) {
  if (!Array.isArray(patterns)) return undefined;
  return patterns.slice(0, 3).map((slot) => {
    if (!slot || typeof slot !== 'object') return null;
    if (slot.kind === 'builtin' && /^[A-Z_]{1,8}$/.test(String(slot.id || ''))) return { kind: 'builtin', id: slot.id };
    if (slot.kind === 'emoji') {
      const text = String(slot.text || '').trim().slice(0, 8);
      return text ? { kind: 'emoji', text } : null;
    }
    if (slot.kind === 'image' && typeof slot.data === 'string' && slot.data.startsWith('data:image/') && slot.data.length <= 45000) {
      return { kind: 'image', data: slot.data };
    }
    return null;
  });
}

function sanitizeCountries(list) {
  return asList(list).map((country) => {
    if (!country || typeof country !== 'object') return country;
    const next = { ...country };
    if ('patterns' in country) next.patterns = sanitizePatterns(country.patterns);
    return next;
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/config', (_req, res) => {
  res.json({
    googleClientId: String(process.env.GOOGLE_OAUTH_CLIENT_ID || '').trim(),
    flightLookup: Boolean(String(process.env.FLIGHT_API_KEY || '').trim()),
    pushEnabled: Boolean(String(process.env.VAPID_PUBLIC_KEY || '').trim() && String(process.env.VAPID_PRIVATE_KEY || '').trim()),
  });
});

const GEO_FILE = path.join(DATA_DIR, 'geocode-cache.json');
let geoLock = Promise.resolve();

function readGeoCache() {
  try {
    return JSON.parse(fs.readFileSync(GEO_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeGeoCache(cache) {
  ensureData();
  fs.writeFileSync(GEO_FILE, JSON.stringify(cache));
}

function withGeoSlot(fn) {
  const run = geoLock.then(fn, fn);
  geoLock = run.then(
    () => new Promise((resolve) => setTimeout(resolve, 1100)),
    () => new Promise((resolve) => setTimeout(resolve, 1100)),
  );
  return run;
}

const LODGING_TYPES = new Set(['hotel', 'guest_house', 'hostel', 'motel', 'apartment', 'apartments', 'chalet']);

function isLodgingHit(place) {
  const type = String(place?.type || '').toLowerCase();
  const category = String(place?.category || place?.class || '').toLowerCase();
  if (!LODGING_TYPES.has(type)) return false;
  if (category && category !== 'tourism' && category !== 'building') return false;
  return true;
}

function lodgingAddress(place) {
  const address = place?.address || {};
  const street = [address.road, address.house_number].filter(Boolean).join('');
  const parts = [street, address.suburb || address.neighbourhood || address.quarter, address.city || address.town || address.village, address.province || address.state].filter(Boolean);
  const line = parts.join('、');
  return String(line || place?.display_name || '').slice(0, 200);
}

function lodgingDisplayName(place) {
  const details = place?.namedetails || {};
  const keys = ['name:zh-TW', 'name:zh-Hant', 'name:zh-HK', 'name:zh', 'name:zh-Hans', 'name:zh-CN'];
  for (const key of keys) {
    const value = String(details[key] || '').trim();
    if (value) return value.slice(0, 80);
  }
  const extra = Object.keys(details).find((key) => key.startsWith('name:zh') && String(details[key] || '').trim());
  if (extra) return String(details[extra]).trim().slice(0, 80);
  return String(details.name || place?.name || String(place?.display_name || '').split(',')[0] || '').trim().slice(0, 80);
}

function toLodgingHit(place) {
  if (!isLodgingHit(place)) return null;
  const lat = Number(place?.lat);
  const lng = Number(place?.lon ?? place?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const name = lodgingDisplayName(place);
  if (!name) return null;
  return { name, address: lodgingAddress(place), lat, lng, kind: String(place.type || '') };
}

async function nominatimSearch(params) {
  const base = String(process.env.GEOCODE_API_URL || 'https://nominatim.openstreetmap.org/search').trim();
  const query = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    namedetails: '1',
    'accept-language': 'zh-TW,zh-Hant,zh',
    limit: '8',
    ...params,
  });
  const url = `${base}${base.includes('?') ? '&' : '?'}${query.toString()}`;
  return withGeoSlot(async () => {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'LeoPrototype/1.0 (https://travel-proto.onrender.com)',
        Accept: 'application/json',
        'Accept-Language': 'zh-TW,zh-Hant;q=0.9,zh;q=0.8',
      },
      signal: AbortSignal.timeout(12000),
    });
    const data = await upstream.json().catch(() => []);
    if (!upstream.ok || !Array.isArray(data)) return [];
    return data;
  });
}

function viewboxAround(lat, lng, span) {
  return `${lng - span},${lat + span},${lng + span},${lat - span}`;
}

app.get('/api/lodging-search', async (req, res) => {
  const query = String(req.query.q || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  if (query.length < 2) return res.json({ results: [] });
  try {
    const direct = await nominatimSearch({ q: query, limit: '8' });
    let results = direct.map(toLodgingHit).filter(Boolean);
    const center = direct.find((place) => Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lon ?? place?.lng)));
    if (results.length < 3 && center) {
      const lat = Number(center.lat);
      const lng = Number(center.lon ?? center.lng);
      const broad = ['boundary', 'place'].includes(String(center.category || center.class || '')) || ['city', 'town', 'village', 'administrative', 'state', 'country'].includes(String(center.type || ''));
      const nearby = await nominatimSearch({
        q: 'hotel',
        bounded: '1',
        viewbox: viewboxAround(lat, lng, broad ? 0.22 : 0.12),
        limit: '8',
      });
      const seen = new Set(results.map((item) => `${item.lat.toFixed(4)},${item.lng.toFixed(4)}`));
      for (const item of nearby.map(toLodgingHit).filter(Boolean)) {
        const key = `${item.lat.toFixed(4)},${item.lng.toFixed(4)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push(item);
      }
    }
    const compact = query.replace(/\s/g, '');
    results.sort((a, b) => Number(b.name.replace(/\s/g, '').includes(compact)) - Number(a.name.replace(/\s/g, '').includes(compact)));
    res.json({ results: results.slice(0, 6) });
  } catch (err) {
    console.error('lodging search failed', err?.name || 'error');
    res.status(502).json({ error: '暫時找不到住宿' });
  }
});

async function lookupGeo(query) {
  const key = query.toLowerCase();
  const cache = readGeoCache();
  const hit = cache[key];
  if (hit && Number.isFinite(hit.lat) && Number.isFinite(hit.lng)) {
    return { lat: hit.lat, lng: hit.lng, displayName: hit.displayName || query, cached: true };
  }
  const found = await withGeoSlot(async () => {
    const again = readGeoCache();
    if (again[key] && Number.isFinite(again[key].lat)) {
      return { lat: again[key].lat, lng: again[key].lng, displayName: again[key].displayName || query, cached: true };
    }
    const base = String(process.env.GEOCODE_API_URL || 'https://nominatim.openstreetmap.org/search').trim();
    const url = `${base}${base.includes('?') ? '&' : '?'}format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'LeoPrototype/1.0 (https://travel-proto.onrender.com)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(12000),
    });
    const data = await upstream.json().catch(() => []);
    const place = Array.isArray(data) ? data[0] : null;
    const lat = Number(place?.lat);
    const lng = Number(place?.lon ?? place?.lng);
    if (!upstream.ok || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const saved = {
      lat,
      lng,
      displayName: String(place.display_name || query).slice(0, 160),
      fetchedAt: new Date().toISOString(),
    };
    const next = readGeoCache();
    next[key] = saved;
    writeGeoCache(next);
    return { ...saved, cached: false };
  });
  return found;
}

app.get('/api/geocode', async (req, res) => {
  const query = String(req.query.q || '').trim().replace(/\s+/g, ' ').slice(0, 200);
  if (!query) return res.status(400).json({ error: '缺少地點' });
  try {
    const found = await lookupGeo(query);
    if (!found) return res.status(404).json({ error: '找不到這個地點' });
    res.json({ lat: found.lat, lng: found.lng, displayName: found.displayName || query, cached: !!found.cached });
  } catch (err) {
    console.error('geocode failed', err?.name || 'error');
    res.status(502).json({ error: '暫時無法查詢地點' });
  }
});

async function wikiThumb(query) {
  const url = `https://zh.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(query)}&prop=pageimages&piprop=thumbnail&pithumbsize=240`;
  const upstream = await fetch(url, {
    headers: {
      'User-Agent': 'LeoPrototype/1.0 (https://travel-proto.onrender.com)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });
  const data = await upstream.json().catch(() => ({}));
  const pages = data?.query?.pages || {};
  const page = Object.values(pages)[0];
  return String(page?.thumbnail?.source || '').slice(0, 1000);
}

app.get('/api/place', async (req, res) => {
  const query = String(req.query.q || '').trim().replace(/\s+/g, ' ').slice(0, 200);
  if (!query) return res.status(400).json({ error: '缺少地點' });
  try {
    const geo = await lookupGeo(query);
    if (!geo) return res.status(404).json({ error: '找不到這個地點' });
    let thumb = '';
    try { thumb = await wikiThumb(query); } catch (_) { thumb = ''; }
    res.json({ lat: geo.lat, lng: geo.lng, displayName: geo.displayName || query, cached: !!geo.cached, thumb });
  } catch (err) {
    console.error('place lookup failed', err?.name || 'error');
    res.status(502).json({ error: '暫時無法查詢地點' });
  }
});

const ASSIST_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: { type: 'string' },
    ideas: { type: 'array', items: { type: 'string' } },
  },
  required: ['text', 'ideas'],
};

app.post('/api/trips/:tripId/assist', async (req, res) => {
  const db = readDb();
  const trip = db.trips[req.params.tripId];
  if (!trip) return res.status(404).json({ error: '找不到旅行' });
  const body = req.body || {};
  if (!body.memberId || !(trip.members || []).some((m) => m.id === body.memberId)) {
    return res.status(403).json({ error: '無效的成員' });
  }
  const providedKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
  const apiKey = providedKey || serverOpenAIKey();
  if (!apiKey) return res.json({ enabled: false });
  const step = String(body.step || 'note').slice(0, 40);
  const note = String(body.note || '').trim().slice(0, 2000);
  const guide = sanitizeGuide(trip.guide);
  const spotNames = sanitizeSpots(trip.spots).map((s) => s.name).join('、');
  const messages = [
    { role: 'system', content: '你是溫柔的旅行小夥伴。用繁體中文，短短幾句，不要捏造訂位。ideas 給 3 到 6 個可點選的短句。若是安排景點，每個 idea 用「景點名|YYYY-MM-DD」。' },
    { role: 'user', content: `步驟：${step}\n目的地：${guide.destination || '尚未填'}\n交通：${guide.transportMode || '尚未填'}\n出發：${guide.departDate || '?'} ${guide.departTime || ''}\n回程：${guide.returnDate || '?'} ${guide.returnTime || ''}\n景點：${spotNames || '還沒有'}\n使用者補充：${note || '無'}` },
  ];
  try {
    const result = await callOpenAI({
      apiKey,
      model: openAIModel(),
      messages,
      maxTokens: 2000,
      reasoning: /gpt-5/i.test(openAIModel()),
      schema: ASSIST_SCHEMA,
      schemaName: 'trip_assist',
    });
    if (!result.ok) return res.status(502).json({ enabled: true, error: friendlyOpenAIError(result.status, result.data) });
    const reading = readModelResult(result);
    if (!reading.parsed) return res.status(502).json({ enabled: true, error: '這次沒有整理出建議，可以先自己填。' });
    res.json({
      enabled: true,
      text: String(reading.parsed.text || '').slice(0, 600),
      ideas: asList(reading.parsed.ideas).map((idea) => String(idea).slice(0, 80)).slice(0, 6),
    });
  } catch (err) {
    console.error('assist failed', err?.name || 'error');
    res.status(502).json({ enabled: true, error: '這次沒有連上建議，可以先自己填。' });
  }
});

app.get('/api/flight', async (req, res) => {
  const key = String(process.env.FLIGHT_API_KEY || '').trim();
  if (!key) return res.json({ enabled: false });
  const number = String(req.query.number || '').trim().toUpperCase().replace(/\s+/g, '');
  const date = String(req.query.date || '').trim().slice(0, 10);
  if (!/^[A-Z0-9]{2,8}$/.test(number) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ enabled: true, error: '請填正確的航班號碼與日期' });
  }
  const custom = String(process.env.FLIGHT_API_URL || '').trim();
  const url = custom
    ? `${custom}${custom.includes('?') ? '&' : '?'}number=${encodeURIComponent(number)}&date=${encodeURIComponent(date)}`
    : `https://aerodatabox.p.rapidapi.com/flights/number/${encodeURIComponent(number)}/${date}`;
  const headers = custom
    ? { 'X-Api-Key': key }
    : { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com' };
  try {
    const upstream = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      console.error('flight lookup', upstream.status);
      return res.status(502).json({ enabled: true, error: '查詢航班失敗' });
    }
    const flight = Array.isArray(data) ? data[0] : (data?.data?.[0] || null);
    if (!flight) return res.json({ enabled: true, found: false });
    const dep = flight.departure || {};
    const arr = flight.arrival || {};
    const clock = (node) => {
      const raw = node.scheduledTimeLocal || node.scheduledTime?.local || node.scheduled || '';
      const match = String(raw).match(/(?:T|\s|^)(\d{2}:\d{2})/);
      return match ? match[1] : '';
    };
    res.json({
      enabled: true,
      found: true,
      from: dep.airport?.iata || dep.iata || '',
      to: arr.airport?.iata || arr.iata || '',
      depart: clock(dep),
      arrive: clock(arr),
    });
  } catch (err) {
    console.error('flight lookup failed', err?.name || 'error');
    res.status(502).json({ enabled: true, error: '查詢航班失敗' });
  }
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

function clipId(value) {
  const text = String(value || '').trim();
  return /^[a-zA-Z0-9_-]{1,40}$/.test(text) ? text : '';
}

function sanitizeBackupTrip(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: '備份格式不正確' };
  const tripId = clipId(raw.id);
  const code = String(raw.code || '').trim().toUpperCase();
  const title = String(raw.title || '').trim().slice(0, 80);
  if (!tripId) return { error: '備份缺少有效的旅行編號' };
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return { error: '備份的邀請碼無效' };
  if (!title) return { error: '備份缺少旅行名稱' };
  const members = asList(raw.members).map((member) => {
    const memberId = clipId(member?.id);
    const nickname = String(member?.nickname || '').trim().slice(0, 40);
    if (!memberId || !nickname) return null;
    return { id: memberId, nickname, joinedAt: member.joinedAt || new Date().toISOString() };
  }).filter(Boolean);
  if (!members.length) return { error: '備份沒有成員' };
  const days = raw.days && typeof raw.days === 'object' && !Array.isArray(raw.days) ? raw.days : {};
  return {
    trip: {
      id: tripId,
      code,
      title,
      homeCurrency: 'TWD',
      countries: asList(raw.countries),
      members,
      days,
      restaurants: asList(raw.restaurants),
      lodgings: asList(raw.lodgings),
      transports: asList(raw.transports),
      expenses: asList(raw.expenses),
      flights: sanitizeFlights(raw.flights),
      guide: sanitizeGuide(raw.guide),
      spots: sanitizeSpots(raw.spots),
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

app.post('/api/trips/restore', (req, res) => {
  const parsed = sanitizeBackupTrip(req.body?.trip);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const incoming = parsed.trip;
  const memberId = clipId(req.body?.memberId);
  const db = readDb();
  const existing = db.trips[incoming.id];
  const codeOwner = Object.values(db.trips).find((trip) => String(trip.code || '').toUpperCase() === incoming.code && trip.id !== incoming.id);
  const imageError = countryImageError(incoming.countries);
  if (imageError) return res.status(400).json({ error: imageError });
  incoming.countries = sanitizeCountries(incoming.countries);
  if (codeOwner) return res.status(409).json({ error: '邀請碼已被其他旅行使用' });
  if (existing && req.body?.confirm !== true) {
    return res.status(409).json({ error: '這份備份會覆寫目前的旅行，請再確認一次', needsConfirm: true });
  }
  if (memberId && !incoming.members.some((member) => member.id === memberId)) {
    const nick = existing?.members?.find((member) => member.id === memberId)?.nickname || '還原者';
    incoming.members.push({ id: memberId, nickname: String(nick).slice(0, 40), joinedAt: new Date().toISOString() });
  }
  if (existing?.createdAt) incoming.createdAt = existing.createdAt;
  db.trips[incoming.id] = incoming;
  writeDb(db);
  res.json({ trip: publicTrip(incoming), created: !existing, memberId: memberId || incoming.members[0].id });
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
  if (Array.isArray(body.countries)) {
    const imageError = countryImageError(body.countries);
    if (imageError) return res.status(400).json({ error: imageError });
    trip.countries = sanitizeCountries(body.countries);
  }
  if (body.flights && typeof body.flights === 'object') trip.flights = sanitizeFlights(body.flights);
  if (body.guide && typeof body.guide === 'object') trip.guide = sanitizeGuide(body.guide);
  if (Array.isArray(body.spots)) trip.spots = sanitizeSpots(body.spots);
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
          endTime: { type: 'string' },
          endDate: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'string' },
        },
        required: ['date', 'time', 'endTime', 'endDate', 'name', 'location'],
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
          arriveDate: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['date', 'type', 'from', 'to', 'depart', 'arrive', 'arriveDate', 'note'],
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

function taipeiToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function normalizeLooseText(value) {
  return String(value || '')
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/[／]/g, '/')
    .replace(/[：]/g, ':')
    .replace(/[－–—]/g, '-');
}

function isoDate(year, month, day) {
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return '';
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) return '';
  return dt.toISOString().slice(0, 10);
}

function tripDateBounds(trip) {
  const dates = [];
  const push = (value) => {
    const match = String(value || '').match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) dates.push(match[1]);
  };
  for (const country of trip?.countries || []) {
    push(country.start);
    push(country.end);
  }
  for (const lodging of trip?.lodgings || []) {
    push(lodging.checkIn);
    push(lodging.checkOut);
  }
  for (const restaurant of trip?.restaurants || []) push(restaurant.date);
  for (const ride of trip?.transports || []) push(ride.date);
  for (const [day, list] of Object.entries(trip?.days || {})) {
    if (Array.isArray(list) && list.length) push(day);
  }
  push(trip?.flights?.outbound?.date);
  push(trip?.flights?.inbound?.date);
  dates.sort();
  return dates.length ? { min: dates[0], max: dates[dates.length - 1] } : null;
}

function daysApart(a, b) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.abs(Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / 86400000;
}

function inferYearlessDate(month, day, trip, today) {
  const bounds = tripDateBounds(trip);
  if (bounds) {
    const startYear = Number(bounds.min.slice(0, 4)) - 1;
    const endYear = Number(bounds.max.slice(0, 4)) + 1;
    const candidates = [];
    for (let year = startYear; year <= endYear; year += 1) {
      const iso = isoDate(year, month, day);
      if (iso) candidates.push(iso);
    }
    const inside = candidates.filter((iso) => iso >= bounds.min && iso <= bounds.max);
    if (inside.length) return inside[0];
    candidates.sort((a, b) => {
      const da = a < bounds.min ? daysApart(a, bounds.min) : daysApart(bounds.max, a);
      const db = b < bounds.min ? daysApart(b, bounds.min) : daysApart(bounds.max, b);
      return da - db || a.localeCompare(b);
    });
    return candidates[0] || '';
  }
  const year = Number(String(today || taipeiToday()).slice(0, 4));
  const thisYear = isoDate(year, month, day);
  if (thisYear && thisYear >= (today || taipeiToday())) return thisYear;
  return isoDate(year + 1, month, day);
}

function stripWeekdayWords(value) {
  return value
    .replace(/[（(][^）)]*(?:星期|週|周|禮拜)[^）)]*[）)]/g, ' ')
    .replace(/(?:星期|週|周|禮拜)[一二三四五六日天]/g, ' ')
    .replace(/[（(]\s*[一二三四五六日天]\s*[）)]/g, ' ');
}

function parseLooseDate(value, trip, today) {
  const original = clipText(value, 40);
  if (!original) return { iso: '', raw: '' };
  const core = stripWeekdayWords(normalizeLooseText(original));
  const full = core.match(/(\d{4})\s*[年/\-.]\s*(\d{1,2})\s*[月/\-.]\s*(\d{1,2})/);
  if (full) {
    const iso = isoDate(Number(full[1]), Number(full[2]), Number(full[3]));
    return iso ? { iso, raw: '' } : { iso: '', raw: original };
  }
  const loose = core.match(/(?:^|[^\d])(\d{1,2})\s*[月/\-.]\s*(\d{1,2})\s*日?/);
  if (loose) {
    const iso = inferYearlessDate(Number(loose[1]), Number(loose[2]), trip, today || taipeiToday());
    return iso ? { iso, raw: '' } : { iso: '', raw: original };
  }
  return { iso: '', raw: original };
}

function addDays(dateStr, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function mentionsNextDay(value) {
  return /隔天|翌日|次日|第二天|\+1|＋1/.test(normalizeLooseText(value));
}

function splitTimeSpan(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const match = text.match(/^(.+?\d(?::\d{2})?(?:點(?:半|\d{1,2})?)?)\s*(?:–|—|~|～|至|到|-)\s*(.+)$/);
  if (!match) return null;
  return [match[1], match[2]];
}

function parseLooseTime(value) {
  const original = clipText(value, 40);
  if (!original) return { iso: '', raw: '', nextDay: false };
  const folded = normalizeLooseText(original).replace(/\s+/g, '');
  const nextDay = mentionsNextDay(folded);
  if (folded === '中午') return { iso: '12:00', raw: '', nextDay };
  const pm = /下午|晚上|傍晚|pm/i.test(folded);
  const am = /上午|早上|清晨|am/i.test(folded);
  const noon = folded.includes('中午');
  const half = /點半|时半/.test(folded);
  const body = folded.replace(/上午|早上|清晨|下午|晚上|傍晚|中午|am|pm/ig, '').replace(/隔天|翌日|次日|第二天|\+1|＋1|抵達|到達|出發/g, '');
  let hour;
  let minute;
  const clock = body.match(/^(\d{1,2}):(\d{2})/);
  const spoken = body.match(/^(\d{1,2})點(?:(\d{1,2}))?/);
  const bare = body.match(/^(\d{1,2})$/);
  if (clock) {
    hour = Number(clock[1]);
    minute = Number(clock[2]);
  } else if (spoken) {
    hour = Number(spoken[1]);
    minute = spoken[2] != null ? Number(spoken[2]) : (half ? 30 : 0);
  } else if (bare) {
    hour = Number(bare[1]);
    minute = half ? 30 : 0;
  } else {
    return { iso: '', raw: original, nextDay };
  }
  if (half && spoken && spoken[2] == null) minute = 30;
  if (noon && hour < 12 && !pm && !am) hour = 12;
  if (pm && hour < 12) hour += 12;
  if (am && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return { iso: '', raw: original, nextDay };
  return { iso: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, raw: '', nextDay };
}

function settleEndDate(startDate, startTime, endTime, explicitDate, nextDay) {
  if (explicitDate && startDate && explicitDate > startDate) return explicitDate;
  if (explicitDate && startDate && explicitDate < startDate) return '';
  if (!startDate) return '';
  if (nextDay || (startTime && endTime && endTime < startTime)) return addDays(startDate, 1);
  return '';
}

function oneOf(value, list, fallback) {
  const s = clipText(value, 20);
  return list.includes(s) ? s : fallback;
}

function cleanExtraction(raw, trip) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const today = taipeiToday();
  const flag = { over: false };
  const list = (value) => {
    if (!Array.isArray(value)) return [];
    if (value.length > 80) flag.over = true;
    return value.slice(0, 80);
  };
  const dateOf = (value) => parseLooseDate(value, trip, today);
  const timeOf = (value) => parseLooseTime(value);
  const extraction = {
    countries: list(src.countries).map((c) => {
      const start = dateOf(c?.start);
      const end = dateOf(c?.end);
      return {
        name: clipText(c?.name, 40),
        start: start.iso,
        startRaw: start.raw,
        end: end.iso,
        endRaw: end.raw,
      };
    }).filter((c) => c.name),
    activities: list(src.activities).map((a) => {
      const date = dateOf(a?.date);
      const span = splitTimeSpan(a?.time);
      const time = timeOf(span ? span[0] : a?.time);
      const end = timeOf(a?.endTime || (span ? span[1] : ''));
      const explicitEnd = dateOf(a?.endDate);
      const endDate = settleEndDate(date.iso, time.iso, end.iso, explicitEnd.iso, end.nextDay || mentionsNextDay(a?.time) || mentionsNextDay(a?.endTime));
      return {
        date: date.iso,
        dateRaw: date.raw,
        time: time.iso,
        timeRaw: time.raw,
        endTime: end.iso,
        endTimeRaw: end.raw,
        endDate,
        endDateRaw: endDate ? '' : explicitEnd.raw,
        name: clipText(a?.name, 80),
        location: clipText(a?.location, 200),
      };
    }).filter((a) => a.name),
    restaurants: list(src.restaurants).map((r) => {
      const date = dateOf(r?.date);
      const time = timeOf(r?.time);
      return {
        date: date.iso,
        dateRaw: date.raw,
        name: clipText(r?.name, 80),
        meal: oneOf(r?.meal, MEAL_VALUES, '其他'),
        time: time.iso,
        timeRaw: time.raw,
        place: clipText(r?.place, 200),
        note: clipText(r?.note, 200),
      };
    }).filter((r) => r.name),
    lodgings: list(src.lodgings).map((l) => {
      const checkIn = dateOf(l?.checkIn);
      const checkOut = dateOf(l?.checkOut);
      return {
        name: clipText(l?.name, 80),
        checkIn: checkIn.iso,
        checkInRaw: checkIn.raw,
        checkOut: checkOut.iso,
        checkOutRaw: checkOut.raw,
        address: clipText(l?.address, 200),
        note: clipText(l?.note, 200),
      };
    }).filter((l) => l.name),
    transports: list(src.transports).map((t) => {
      const date = dateOf(t?.date);
      const depart = timeOf(t?.depart);
      const arrive = timeOf(t?.arrive);
      const explicitEnd = dateOf(t?.arriveDate);
      const arriveDate = settleEndDate(
        date.iso,
        depart.iso,
        arrive.iso,
        explicitEnd.iso,
        arrive.nextDay || mentionsNextDay(t?.arrive) || mentionsNextDay(t?.note),
      );
      return {
        date: date.iso,
        dateRaw: date.raw,
        type: oneOf(t?.type, RIDE_VALUES, '其他'),
        from: clipText(t?.from, 80),
        to: clipText(t?.to, 80),
        depart: depart.iso,
        departRaw: depart.raw,
        arrive: arrive.iso,
        arriveRaw: arrive.raw,
        arriveDate,
        arriveDateRaw: arriveDate ? '' : explicitEnd.raw,
        note: clipText(t?.note, 200),
      };
    }).filter((t) => t.from || t.to),
  };
  return { extraction, listTruncated: flag.over };
}

function mockExtraction() {
  return cleanExtraction({
    countries: [{ name: '日本', start: '2026-04-01', end: '2026-04-03' }],
    activities: [{ date: '2026-04-01', time: '09:30', name: '淺草寺', location: '東京台東區' }],
    restaurants: [{ date: '2026-04-01', name: '一蘭拉麵', meal: '午餐', time: '12:30', place: '淺草', note: '範例訂位' }],
    lodgings: [{ name: '淺草飯店', checkIn: '2026-04-01', checkOut: '2026-04-03', address: '東京淺草', note: '範例確認碼' }],
    transports: [{ date: '2026-04-01', type: '火車', from: '東京', to: '京都', depart: '15:00', arrive: '17:20', note: '範例車次' }],
  }).extraction;
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
  const bounds = tripDateBounds(trip);
  const today = taipeiToday();
  return [
    '你是旅行行程整理助手。請只根據使用者提供的文字、截圖或 PDF 抽出實際出現的行程，不要捏造。',
    '日期一定要輸出 YYYY-MM-DD，時間一定要輸出 24 小時制 HH:MM。無法判斷的欄位留空字串，不要輸出 11/3、中文日期或上午下午。',
    '跨過午夜的交通（夜車、臥鋪、夜巴士、渡輪、紅眼航班）：date 與 depart 是出發日和出發時間，arrive 是抵達時間，arriveDate 是抵達日。看到隔天、翌日、次日或 +1，或抵達時間早於出發時間，arriveDate 填出發日的下一天。同一天抵達則 arriveDate 留空。',
    '跨過午夜的活動：time 是開始時間，endTime 是結束時間，endDate 是結束日。同一天結束則 endTime 可填、endDate 留空。隔天結束就填下一天。',
    '餐別只能是 早餐、午餐、晚餐、其他。交通類型只能是 飛機、火車、巴士、租車、其他。',
    '活動的 name 是「做什麼」，location 是「在哪裡」。住宿填入住與退房日期。',
    '國家名稱請優先用：台灣、日本、韓國、香港、中國、澳洲、紐西蘭、法國、德國、瑞士、泰國。城市請改寫成所屬國家。',
    `今天（台北）是 ${today}。`,
    bounds
      ? `這趟旅行的日期範圍是 ${bounds.min} 到 ${bounds.max}。沒有寫年份的日期，請用這個範圍判斷年份（跨年也要對到範圍裡）。`
      : '這趟旅行還沒有日期。沒有寫年份的日期，請用今天以後最近的那一天（含今天；十二月接到隔年一月）。',
    `旅行名稱：${trip.title || ''}`,
    `這趟旅行已有的國家與時區：${countries || '（尚未設定）'}`,
  ].join('\n');
}

function isUnknownModel(status, data) {
  const code = data?.error?.code;
  return status === 404 || code === 'model_not_found';
}

function friendlyOpenAIError(status, data) {
  const code = String(data?.error?.code || '').slice(0, 60);
  const tag = code ? `（${code}）` : '';
  if (status === 401 || code === 'invalid_api_key') return `OpenAI 金鑰無效${tag}，請確認後再試。`;
  if (status === 429 || code === 'rate_limit_exceeded' || code === 'insufficient_quota') return `匯入太頻繁或額度不足${tag}，請稍後再試。`;
  if (status === 413) return '檔案太大，請縮小後再試。';
  return `OpenAI 拒絕這次匯入${tag}，請稍後再試。`;
}

function reasoningRejected(data) {
  return /reasoning_effort|unknown parameter/i.test(String(data?.error?.message || ''));
}

function modelText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === 'string') return part;
      if (part && typeof part.text === 'string') return part.text;
      return '';
    }).join('');
  }
  return typeof content === 'string' ? content : '';
}

function parseModelJson(text) {
  const src = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(src);
}

async function callOpenAI({ apiKey, model, messages, maxTokens, reasoning, schema, schemaName }) {
  const body = {
    model,
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: { name: schemaName || 'itinerary_import', strict: true, schema: schema || IMPORT_SCHEMA },
    },
    max_completion_tokens: maxTokens,
  };
  if (reasoning) body.reasoning_effort = 'low';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function readModelResult(result) {
  const finish = result.data?.choices?.[0]?.finish_reason || '';
  const text = modelText(result.data).trim();
  let parsed = null;
  let parseError = false;
  if (text) {
    try {
      parsed = parseModelJson(text);
    } catch {
      parseError = true;
    }
  }
  const cut = !text || finish === 'length';
  return { finish, text, parsed, parseError, cut };
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

  const rawText = String(body.text || '').trim();
  const text = rawText.slice(0, IMPORT_MAX_TEXT);
  const notices = [];
  if (rawText.length > IMPORT_MAX_TEXT) notices.push('貼上的文字超過 5 萬字，後面的內容已截斷。請分段再匯入一次。');
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
  let reasoning = /gpt-5/i.test(model);
  const run = (maxTokens) => callOpenAI({ apiKey, model, messages, maxTokens, reasoning });
  let result;
  try {
    result = await run(16000);
    if (!result.ok && reasoning && reasoningRejected(result.data)) {
      reasoning = false;
      result = await run(16000);
    }
    if (!result.ok && isUnknownModel(result.status, result.data) && model !== FALLBACK_OPENAI_MODEL) {
      model = FALLBACK_OPENAI_MODEL;
      reasoning = false;
      result = await run(16000);
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
  let reading = readModelResult(result);
  if (reading.cut || reading.parseError || !reading.parsed) {
    try {
      const second = await run(32000);
      if (second.ok) {
        const next = readModelResult(second);
        const secondBetter = next.parsed && !next.cut && !next.parseError;
        const firstUnusable = !reading.parsed;
        if (secondBetter || (firstUnusable && next.parsed)) {
          result = second;
          reading = next;
        }
      }
    } catch (err) {
      console.error('openai import retry failed', err?.name || 'error');
    }
  }
  if (!reading.parsed) {
    if (reading.cut) {
      console.error('openai import truncated', reading.finish || 'empty');
      return res.status(502).json({ error: '辨識結果被截斷，請把行程分成幾段再貼上。' });
    }
    return res.status(502).json({ error: '辨識結果無法讀取，請再試一次。' });
  }
  const cleaned = cleanExtraction(reading.parsed, trip);
  if (cleaned.listTruncated) notices.push('某一類項目超過 80 筆，多出的已略過。請分段再匯入一次。');
  res.json({ extraction: cleaned.extraction, mock: false, model, notices });
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
