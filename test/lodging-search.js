const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
const start = src.indexOf('const LODGING_TYPES');
const end = src.indexOf('async function nominatimSearch');
assert.ok(start >= 0 && end > start, 'lodging helpers missing');
const sandbox = {};
vm.runInNewContext(src.slice(start, end), sandbox);

const hotel = sandbox.toLodgingHit({
  category: 'tourism', type: 'hotel', lat: '34.656', lon: '133.911',
  namedetails: { name: '岡山シティホテル厚生町' },
  address: { road: '厚生町', city: '岡山市' },
});
assert.strictEqual(hotel.name, '岡山シティホテル厚生町');
assert.ok(hotel.address.includes('岡山市'));
const chinese = sandbox.toLodgingHit({
  category: 'tourism', type: 'hotel', lat: '34.66', lon: '133.93',
  namedetails: {
    name: 'ダイワロイネットホテル',
    'name:ja': 'ダイワロイネットホテル',
    'name:zh': '大和ROYNET酒店',
    'name:zh-TW': '大和羅伊奈特酒店',
  },
  address: { city: '岡山市', province: '岡山縣' },
});
assert.strictEqual(chinese.name, '大和羅伊奈特酒店');
assert.ok(chinese.address.includes('岡山縣'));
const localOnly = sandbox.toLodgingHit({
  category: 'tourism', type: 'hotel', lat: '34.67', lon: '133.92',
  namedetails: { name: 'ダイワロイネットホテル', 'name:ja': 'ダイワロイネットホテル', 'name:en': 'Daiwa Roynet Hotel' },
  address: { city: '岡山市' },
});
assert.strictEqual(localOnly.name, 'ダイワロイネットホテル');
assert.ok(Math.abs(hotel.lat - 34.656) < 0.001);

for (const type of ['guest_house', 'hostel', 'motel', 'apartment', 'chalet']) {
  assert.ok(sandbox.isLodgingHit({ category: 'tourism', type }), type);
}
assert.strictEqual(sandbox.toLodgingHit({ category: 'amenity', type: 'school', lat: '34.2', lon: '133.8', namedetails: { name: '丸亀市立城北小学校' } }), null);
assert.strictEqual(sandbox.toLodgingHit({ category: 'historic', type: 'castle', lat: '34.6', lon: '133.9', namedetails: { name: '岡山城' } }), null);
assert.strictEqual(sandbox.isLodgingHit({ category: 'railway', type: 'station' }), false);
assert.strictEqual(sandbox.isLodgingHit({ category: 'amenity', type: 'bicycle_rental' }), false);
assert.strictEqual(sandbox.isLodgingHit({ category: 'natural', type: 'peak' }), false);

const app = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
assert.ok(app.includes("addEventListener('compositionstart'"), 'search waits for IME composition');
assert.ok(app.includes("addEventListener('compositionend'"), 'search runs when IME commits');
assert.ok(app.includes('event.isComposing || composing'), 'input during composition does not search');
assert.ok(app.includes("{ passive: false }"), 'touch drag can cancel iOS scrolling');
assert.ok(app.includes('data-spot-remove'), 'pool chips can be deleted');
assert.ok(app.includes('data-place-day'), 'a spot can be placed without dragging');

console.log('lodging search ok');
