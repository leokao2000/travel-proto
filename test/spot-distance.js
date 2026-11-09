const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
const start = src.indexOf('function finiteCoord');
const end = src.indexOf('function roughTravelLabel');
assert.ok(start >= 0 && end > start, 'distance helpers missing from app.js');
const sandbox = {};
vm.runInNewContext(src.slice(start, end), sandbox);

// Published gate coordinates. Strings on purpose: geocoders often return text.
const kiyomizu = { name: '清水寺', lat: '34.994856', lng: '135.785046' };
const kinkaku = { name: '金閣寺', lat: '35.039370', lon: '135.729243' };
const km = sandbox.haversineKm(kiyomizu, kinkaku);
assert.ok(km > 6.5 && km < 8, `清水寺 to 金閣寺 should be about 7 km, got ${km}`);
const label = sandbox.straightLineLabel(km);
assert.match(label, /^直線約 \d+\.\d 公里$/);
assert.strictEqual(sandbox.straightLineLabel(0.42), '直線約 420 公尺');
assert.strictEqual(sandbox.straightLineLabel('7.24'), '直線約 7.2 公里');
assert.ok(Number.isNaN(sandbox.haversineKm({ lat: 'nope', lng: 1 }, kinkaku)));
console.log(`${label} (${km.toFixed(2)} km)`);
