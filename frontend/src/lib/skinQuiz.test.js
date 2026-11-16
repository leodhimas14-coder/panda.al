import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommend, scoreProduct, bestShade } from './skinQuiz.js';

const P = (o) => ({ active: true, gender: 'unisex', skinTypes: [], concerns: [], variants: [], ...o });
const products = [
  P({ name: 'Pastrues për yndyrë', routineStep: 'pastrues', skinTypes: ['e_yndyrshme', 'e_perzier'], concerns: ['pucrra'] }),
  P({ name: 'Pastrues i butë', routineStep: 'pastrues', skinTypes: ['e_thate', 'e_ndjeshme'], concerns: ['skuqje'] }),
  P({ name: 'Krem i rëndë', routineStep: 'krem', skinTypes: ['e_thate'], concerns: ['thatesi'] }),
  P({ name: 'Krem i lehtë', routineStep: 'krem', concerns: ['shkelqim'] }),
  P({ name: 'Krem meshkujsh', routineStep: 'krem', gender: 'meshkuj', concerns: ['pucrra', 'shkelqim'] }),
  P({ name: 'Fondatinë', routineStep: 'grim', variants: [
    { color: '100', tone: 1, undertone: 'e_ftohte', stock: 0 },
    { color: '110', tone: 1, undertone: 'e_ngrohte', stock: 0 },
    { color: '300', tone: 3, undertone: 'neutrale', stock: 2 },
    { color: '500', tone: 5, undertone: 'neutrale', stock: 0 },
  ] }),
];

test('oily skin with spots gets the oil cleanser and the light cream', () => {
  const r = recommend(products, { gender: 'femra', skinType: 'e_yndyrshme', concerns: ['pucrra'] });
  assert.deepEqual(r.map((x) => x.product.name), ['Pastrues për yndyrë', 'Krem i lehtë']);
});

test('dry skin never gets products made only for oily skin', () => {
  const r = recommend(products, { gender: 'femra', skinType: 'e_thate', concerns: ['thatesi'] });
  assert.deepEqual(r.map((x) => x.product.name), ['Pastrues i butë', 'Krem i rëndë']);
});

test("men's products only for men", () => {
  assert.equal(scoreProduct(products[4], { gender: 'femra' }), -1);
  const r = recommend(products, { gender: 'meshkuj', skinType: 'e_yndyrshme', concerns: ['pucrra', 'shkelqim'] });
  assert.equal(r.find((x) => x.step.key === 'krem').product.name, 'Krem meshkujsh');
});

test('foundation shade follows skin tone and undertone', () => {
  const f = products[5];
  assert.equal(bestShade(f, { tone: 1, undertone: 'e_ngrohte' }).color, '110');
  assert.equal(bestShade(f, { tone: 1, undertone: 'e_ftohte' }).color, '100');
  assert.equal(bestShade(f, { tone: 3 }).color, '300');
  assert.equal(bestShade(f, { tone: 5, undertone: 'e_ngrohte' }).color, '500');
  const r = recommend(products, { gender: 'femra', skinType: 'normale', concerns: [], tone: 1, undertone: 'e_ngrohte' });
  assert.equal(r.find((x) => x.step.key === 'grim').variant.color, '110');
});

test('no foundation step when the tone question was skipped', () => {
  const r = recommend(products, { gender: 'femra', skinType: 'normale', concerns: [] });
  assert.ok(!r.some((x) => x.step.key === 'grim'));
});
