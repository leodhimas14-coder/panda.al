// Skin test: the questions' options and how products are picked for the answers.
// Labels match the server's constants (backend/src/config/constants.js).

export const SKIN_TYPES = [
  { key: 'normale', label: 'Normale', hint: 'As e thatë as e yndyrshme, rrallë ka probleme.' },
  { key: 'e_thate', label: 'E thatë', hint: 'Pas larjes ndihet e tendosur, ndonjëherë qërohet.' },
  { key: 'e_yndyrshme', label: 'E yndyrshme', hint: 'Shkëlqen gjatë ditës, pore të dukshme, del puçrra.' },
  { key: 'e_perzier', label: 'E përzier', hint: 'Ballë, hundë e mjekër me shkëlqim; faqet normale ose të thata.' },
  { key: 'e_ndjeshme', label: 'E ndjeshme', hint: 'Skuqet ose djeg lehtë nga produktet e reja.' },
];

export const CONCERNS = [
  { key: 'pucrra', label: 'Puçrra dhe pore të bllokuara', icon: '🔴' },
  { key: 'njolla', label: 'Njolla dhe ton i pabarabartë', icon: '🟤' },
  { key: 'rrudha', label: 'Rrudha dhe lëkurë e lëshuar', icon: '〰️' },
  { key: 'syte', label: 'Rrathë të errët dhe fryrje nën sy', icon: '👁️' },
  { key: 'thatesi', label: 'Thatësi dhe dehidratim', icon: '💧' },
  { key: 'skuqje', label: 'Skuqje dhe acarim', icon: '🌡️' },
  { key: 'shkelqim', label: 'Shkëlqim dhe pore të zmadhuara', icon: '✨' },
];

export const ROUTINE_STEPS = [
  { key: 'pastrues', label: 'Pastrimi', when: 'Mëngjes dhe mbrëmje' },
  { key: 'serum', label: 'Serumi', when: 'Pas pastrimit' },
  { key: 'krem', label: 'Kremi', when: 'Mëngjes dhe mbrëmje' },
  { key: 'sy', label: 'Për sytë', when: 'Sipas nevojës' },
  { key: 'maske', label: 'Maska', when: '1–2 herë në javë' },
  { key: 'grim', label: 'Fondatina', when: 'Grimi' },
];

// Swatch colours are only a visual guide for choosing your own tone.
export const SKIN_TONES = [
  { key: 1, label: 'Shumë e çelët', swatch: '#f6e1d3' },
  { key: 2, label: 'E çelët', swatch: '#eac9a8' },
  { key: 3, label: 'Mesatare', swatch: '#d1a17a' },
  { key: 4, label: 'E zeshkët', swatch: '#a8714a' },
  { key: 5, label: 'E errët', swatch: '#6b4129' },
];

export const UNDERTONES = [
  { key: 'e_ngrohte', label: 'E ngrohtë', hint: 'Venat në kyçin e dorës duken të gjelbra; ari të rri më mirë se argjendi.' },
  { key: 'e_ftohte', label: 'E ftohtë', hint: 'Venat duken blu ose vjollcë; argjendi të rri më mirë.' },
  { key: 'neutrale', label: 'Neutrale', hint: 'Venat duken edhe blu edhe të gjelbra; të rrinë të dyja.' },
];

export const labelOf = (list, key) => list.find((x) => x.key === key)?.label || '';

/**
 * How well a product suits the answers. -1 = not suitable (made for other
 * skin types or another gender); higher = better.
 */
export function scoreProduct(product, answers) {
  if (answers.gender && product.gender && ![answers.gender, 'unisex'].includes(product.gender)) return -1;
  const types = product.skinTypes || [];
  let score = 0;
  if (answers.skinType && answers.skinType !== 'nuk_e_di' && types.length) {
    if (!types.includes(answers.skinType)) return -1;
    score += 2;
  } else {
    score += 0.5; // made for every skin type
  }
  const overlap = (product.concerns || []).filter((c) => (answers.concerns || []).includes(c)).length;
  score += overlap * 3;
  if (product.inStock) score += 0.5; // arrives faster
  if (product.featured) score += 0.2;
  return score;
}

/** The shade of a foundation closest to the answered tone and undertone. */
export function bestShade(product, answers) {
  const shades = (product.variants || []).filter((v) => v.tone);
  if (!shades.length || !answers.tone) return null;
  const distance = (v) => {
    let d = Math.abs(v.tone - answers.tone) * 2;
    if (answers.undertone && answers.undertone !== 'nuk_e_di' && v.undertone && v.undertone !== answers.undertone) {
      d += v.undertone === 'neutrale' || answers.undertone === 'neutrale' ? 0.5 : 1;
    }
    if (v.stock > 0) d -= 0.1;
    return d;
  };
  return [...shades].sort((a, b) => distance(a) - distance(b))[0];
}

/**
 * Builds a routine: for every step, the best-suited product (if any).
 * Returns [{ step, product, variant, score }].
 */
export function recommend(products, answers) {
  const active = products.filter((p) => p.active !== false);
  const routine = [];
  for (const step of ROUTINE_STEPS) {
    if (step.key === 'grim' && !answers.tone) continue;
    const ranked = active
      .filter((p) => p.routineStep === step.key)
      .map((p) => ({ product: p, score: scoreProduct(p, answers) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score);
    if (!ranked.length) continue;
    const { product, score } = ranked[0];
    let variant = null;
    if (step.key === 'grim') variant = bestShade(product, answers);
    if (!variant && product.variants?.length) variant = product.variants.find((v) => v.stock > 0) || product.variants[0];
    routine.push({ step, product, variant, score });
  }
  return routine;
}

// The last answers are kept on this phone, so product pages can say
// "Përshtatet për lëkurën tënde".
const KEY = 'panda_skin_test_v1';
export function saveAnswers(answers) {
  try { localStorage.setItem(KEY, JSON.stringify(answers)); } catch { /* ignore */ }
}
export function loadAnswers() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
