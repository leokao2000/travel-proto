const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const vm = require('vm');

const appSrc = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
const start = appSrc.indexOf('function finiteCoord');
const end = appSrc.indexOf('function dayWeatherAnchor');
const sandbox = {};
vm.runInNewContext(appSrc.slice(start, end), sandbox);
assert.strictEqual(sandbox.formatRoutedLeg({ mode: 'driving', minutes: 12, km: 7.8 }), '開車約 12 分鐘 · 7.8 公里');
assert.strictEqual(sandbox.formatRoutedLeg({ mode: 'walking', minutes: 8, km: 0.6 }), '步行約 8 分鐘 · 600 公尺');
assert.strictEqual(sandbox.straightLineLabel(7.09).startsWith('直線約'), true);
assert.ok(sandbox.weatherLine({ kind: 'forecast', code: 1, high: 18, low: 9, rain: 20 }).includes('降雨 20%'));
assert.ok(sandbox.weatherLine({ kind: 'climate', code: 2, high: 28, low: 18, precipMm: 3.2 }).startsWith('往年同期參考'));

const stub = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  res.setHeader('content-type', 'application/json');
  if (url.pathname.includes('/route/')) {
    res.end(JSON.stringify({ code: 'Ok', routes: [{ distance: 7800, duration: 720 }] }));
    return;
  }
  if (url.searchParams.has('forecast_days')) {
    res.end(JSON.stringify({
      daily: {
        time: ['2026-11-12'],
        weather_code: [1],
        temperature_2m_max: [18.2],
        temperature_2m_min: [9.4],
        precipitation_probability_max: [20],
      },
    }));
    return;
  }
  res.end(JSON.stringify({
    daily: {
      time: ['2022-06-01', '2023-06-01', '2024-06-01'],
      weather_code: [1, 2, 1],
      temperature_2m_max: [28, 30, 29],
      temperature_2m_min: [18, 19, 17],
      precipitation_sum: [2, 4, 3],
    },
  }));
});

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leo-route-'));
let child;
(async () => {
  await new Promise((resolve) => stub.listen(3993, '127.0.0.1', resolve));
  child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      PORT: '3523',
      DATA_DIR: dir,
      OSRM_API_URL: 'http://127.0.0.1:3993',
      OPEN_METEO_FORECAST_URL: 'http://127.0.0.1:3993/forecast',
      OPEN_METEO_ARCHIVE_URL: 'http://127.0.0.1:3993/archive',
    },
    stdio: 'ignore',
  });
  for (let i = 0; i < 30; i += 1) {
    try {
      const health = await fetch('http://127.0.0.1:3523/api/health');
      if ((await health.json()).ok) break;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 100));
  }
  const route = await fetch('http://127.0.0.1:3523/api/route?from=34.99,135.78&to=35.04,135.73');
  const routeJson = await route.json();
  assert.strictEqual(route.status, 200, JSON.stringify(routeJson));
  assert.strictEqual(routeJson.mode, 'driving');
  assert.strictEqual(routeJson.minutes, 12);
  assert.strictEqual(routeJson.km, 7.8);
  const weather = await fetch('http://127.0.0.1:3523/api/weather?lat=35&lng=135.7&dates=2026-11-12,2027-06-01');
  const weatherJson = await weather.json();
  assert.strictEqual(weather.status, 200, JSON.stringify(weatherJson));
  assert.strictEqual(weatherJson.days['2026-11-12'].kind, 'forecast');
  assert.strictEqual(weatherJson.days['2026-11-12'].rain, 20);
  assert.strictEqual(weatherJson.days['2027-06-01'].kind, 'climate');
  assert.ok(weatherJson.days['2027-06-01'].high > 20);
  console.log('route weather ok');
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
}).finally(() => {
  child?.kill();
  stub.close();
});
