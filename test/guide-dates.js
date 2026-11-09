const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
const start = src.indexOf('function parseIsoDate');
const end = src.indexOf('function rangeCalendarHtml');
assert.ok(start >= 0 && end > start, 'date helpers missing');
const sandbox = {};
vm.runInNewContext(src.slice(start, end), sandbox);

assert.strictEqual(sandbox.tripSpanLabel('2026-11-10', '2026-11-12'), '3 天 · 2 夜');
assert.strictEqual(sandbox.tripSpanLabel('2026-11-10', '2026-11-10'), '1 天 · 0 夜');
assert.strictEqual(sandbox.tripSpanLabel('2026-11-30', '2026-12-02'), '3 天 · 2 夜');
assert.strictEqual(sandbox.daysBetweenIso('2026-11-10', '2026-11-12'), 2);
assert.strictEqual(sandbox.parseIsoDate('2026-02-31'), null);
const january = sandbox.shiftIsoMonth(2026, 12, 1);
assert.strictEqual(january.y, 2027);
assert.strictEqual(january.m, 1);

const withTimes = {
  destination: '京都',
  transportMode: '火車',
  departDate: '2026-11-10',
  departTime: '08:30',
  returnDate: '2026-11-12',
  returnTime: '18:00',
};
assert.strictEqual(sandbox.guideStepError(2, withTimes), '');
assert.strictEqual(sandbox.guideStepError(2, { departDate: '2026-11-10', returnDate: '2026-11-12' }), '');
assert.strictEqual(sandbox.guideStepError(2, { departDate: '', returnDate: '', departTime: '08:30', returnTime: '18:00' }), '請設定出發與回程日期');
assert.strictEqual(sandbox.guideStepError(2, { departDate: '2026-11-12', returnDate: '2026-11-10' }), '請設定出發與回程日期');
assert.strictEqual(sandbox.guideStepError(0, { destination: '京都' }), '');
assert.strictEqual(sandbox.guideStepError(0, { destination: '  ' }), '請填目的地');
assert.strictEqual(sandbox.guideStepError(1, { transportMode: '火車' }), '');
assert.strictEqual(sandbox.guideStepError(1, { transportMode: '' }), '請選一種交通');
assert.strictEqual(sandbox.guideStepError(3, {}), '');
assert.strictEqual(sandbox.guideStepError(4, {}), '');

assert.ok(!src.includes('g-depart-time'), 'guide departure time field should be gone');
assert.ok(!src.includes('g-return-time'), 'guide return time field should be gone');
assert.ok(!src.includes('id="g-depart-date"'), 'separate departure date input should be gone');
assert.ok(!src.includes('id="g-return-date"'), 'separate return date input should be gone');
assert.ok(src.includes('data-date'), 'range calendar should commit a tapped day');
assert.ok(src.includes('guideStepError(step, guide)'), 'next should validate the committed guide, not a date input');

const appSrc = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
const dayStart = appSrc.indexOf('function formatMonthDay');
const dayEnd = appSrc.indexOf('function emptyFlights');
assert.ok(dayStart >= 0 && dayEnd > dayStart);
const days = {};
vm.runInNewContext(appSrc.slice(dayStart, dayEnd), days);
assert.strictEqual(days.formatMonthDay('2026-12-12'), '12/12');
assert.strictEqual(days.formatMonthDay('2026-12-05'), '12/05');
assert.strictEqual(days.formatMonthDay(''), '');
assert.ok(appSrc.includes('前一天') && appSrc.includes('後一天'));
assert.ok(appSrc.includes('第 ${index + 1} / ${total} 天'));
assert.ok(!appSrc.includes('date.slice(5)'));
assert.ok(appSrc.includes('搜尋住宿（選用）'));
assert.ok(appSrc.indexOf('id="stay-address"') < appSrc.indexOf('搜尋住宿（選用）'));
console.log('guide dates ok');
