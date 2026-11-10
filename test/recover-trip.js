const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const vm = require('vm');

const appSrc = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
const start = appSrc.indexOf('function tripAccessProblem');
const end = appSrc.indexOf('function showOfflineBanner');
assert.ok(start >= 0 && end > start);
const sandbox = {};
vm.runInNewContext(appSrc.slice(start, end), sandbox);
assert.strictEqual(sandbox.tripAccessProblem('找不到旅行'), 'missing');
assert.strictEqual(sandbox.tripAccessProblem('Failed to fetch'), 'offline');
assert.strictEqual(sandbox.tripAccessProblem('Load failed'), 'offline');
assert.strictEqual(sandbox.tripAccessProblem('無效的成員'), '');
assert.ok(appSrc.includes('用這支手機上的資料恢復這趟旅行'));
assert.ok(appSrc.includes('這不是離線'));

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leo-recover-'));
const port = 3519;
const child = spawn(process.execPath, ['server.js'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, PORT: String(port), DATA_DIR: dir },
  stdio: 'ignore',
});

async function j(pathname, opts) {
  const res = await fetch(`http://127.0.0.1:${port}${pathname}`, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function stop() {
  child.kill();
}

(async () => {
  for (let i = 0; i < 30; i += 1) {
    try {
      const health = await j('/api/health');
      if (health.data.ok) break;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 100));
  }
  const created = await j('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test2', nickname: 'Leo', countries: [] }),
  });
  assert.strictEqual(created.status, 200);
  const trip = created.data.trip;
  const memberId = created.data.memberId;
  fs.writeFileSync(path.join(dir, 'trips.json'), JSON.stringify({ trips: {} }));
  const missing = await j(`/api/trips/${trip.id}`);
  assert.strictEqual(missing.status, 404);
  assert.strictEqual(missing.data.error, '找不到旅行');
  const restored = await j('/api/trips/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trip, memberId }),
  });
  assert.strictEqual(restored.status, 200, JSON.stringify(restored.data));
  assert.strictEqual(restored.data.created, true);
  assert.strictEqual(restored.data.trip.code, trip.code);
  assert.strictEqual(restored.data.trip.title, 'Test2');
  assert.strictEqual(restored.data.memberId, memberId);
  const again = await j(`/api/trips/${trip.id}`);
  assert.strictEqual(again.status, 200);
  assert.strictEqual(again.data.trip.code, trip.code);
  console.log(`recover ok ${trip.code}`);
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
}).finally(stop);
