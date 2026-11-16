// Shared enums and business settings. Money is stored in whole lekë (ALL);
// supplier prices are stored in yuan (CNY) because that's what 1688 shows.
// CATEGORIES are only the starting set: the owner edits them in Admin → Kategoritë.

const CATEGORIES = [
  { key: 'kremra', label: 'Kremra' },
  { key: 'maska', label: 'Maska fytyre' },
  { key: 'syte', label: 'Për sytë' },
  { key: 'serume', label: 'Serume' },
  { key: 'pastrues', label: 'Pastrues' },
  { key: 'buzet', label: 'Buzët' },
  { key: 'trupi', label: 'Kujdesi për trupin' },
  { key: 'grim', label: 'Grimi' },
];

// Who a product is for. Unisex products show up under every tab of the menu.
const GENDERS = [
  { key: 'femra', label: 'Femra' },
  { key: 'meshkuj', label: 'Meshkuj' },
  { key: 'femije', label: 'Fëmijë' }, // kept for older products; not offered in the shop
  { key: 'unisex', label: 'Unisex' },
];

// ---- Skin test (Testi i lëkurës) ----
const SKIN_TYPES = [
  { key: 'normale', label: 'Normale' },
  { key: 'e_thate', label: 'E thatë' },
  { key: 'e_yndyrshme', label: 'E yndyrshme' },
  { key: 'e_perzier', label: 'E përzier' },
  { key: 'e_ndjeshme', label: 'E ndjeshme' },
];

const CONCERNS = [
  { key: 'pucrra', label: 'Puçrra dhe pore të bllokuara' },
  { key: 'njolla', label: 'Njolla dhe ton i pabarabartë' },
  { key: 'rrudha', label: 'Rrudha dhe lëkurë e lëshuar' },
  { key: 'syte', label: 'Rrathë të errët dhe fryrje nën sy' },
  { key: 'thatesi', label: 'Thatësi dhe dehidratim' },
  { key: 'skuqje', label: 'Skuqje dhe acarim' },
  { key: 'shkelqim', label: 'Shkëlqim dhe pore të zmadhuara' },
];

// Where a product sits in a daily routine; the test builds one product per step.
const ROUTINE_STEPS = [
  { key: 'pastrues', label: 'Pastrimi' },
  { key: 'serum', label: 'Serumi' },
  { key: 'krem', label: 'Kremi' },
  { key: 'sy', label: 'Për sytë' },
  { key: 'maske', label: 'Maska (1–2 herë në javë)' },
  { key: 'grim', label: 'Grimi / fondatina' },
];

// Skin tone for foundation shades: 1 = very light … 5 = deep.
const SKIN_TONES = [
  { key: 1, label: 'Shumë e çelët' },
  { key: 2, label: 'E çelët' },
  { key: 3, label: 'Mesatare' },
  { key: 4, label: 'E zeshkët' },
  { key: 5, label: 'E errët' },
];

const UNDERTONES = [
  { key: 'e_ngrohte', label: 'E ngrohtë (e verdhë/e artë)' },
  { key: 'e_ftohte', label: 'E ftohtë (rozë)' },
  { key: 'neutrale', label: 'Neutrale' },
];

// Order lifecycle, in the order an order normally moves through it.
const ORDER_STATUSES = [
  // Card orders wait here until the payment provider confirms the payment.
  { key: 'pa_paguar', label: 'Pret pagesën' },
  { key: 'e_re', label: 'Porosi e re' },
  { key: 'e_konfirmuar', label: 'E konfirmuar' },
  { key: 'e_blere', label: 'Blerë te furnitori' },
  { key: 'ne_magazine', label: 'Në magazinë në Kinë' },
  { key: 'ne_rruge', label: 'Në rrugë për Shqipëri' },
  { key: 'ne_shqiperi', label: 'Mbërriti në Shqipëri' },
  { key: 'ne_dorezim', label: 'Te korrieri' },
  { key: 'e_dorezuar', label: 'E dorëzuar' },
  { key: 'e_anuluar', label: 'E anuluar' },
];

const SHIPMENT_STATUSES = [
  { key: 'ne_pergatitje', label: 'Në përgatitje' },
  { key: 'nisur', label: 'U nis nga Kina' },
  { key: 'mberritur', label: 'Mbërriti në Shqipëri' },
];

// When a cargo shipment changes status, the orders inside it follow.
const SHIPMENT_TO_ORDER_STATUS = {
  nisur: 'ne_rruge',
  mberritur: 'ne_shqiperi',
};

const PAYMENT_METHODS = [
  { key: 'card', label: 'Kartë' },
  { key: 'cod', label: 'Pagesë në dorëzim' },
  { key: 'bank', label: 'Transfertë bankare' },
];

const keys = (list) => list.map((x) => x.key);

module.exports = {
  CATEGORIES,
  GENDERS,
  ORDER_STATUSES,
  SHIPMENT_STATUSES,
  SHIPMENT_TO_ORDER_STATUS,
  PAYMENT_METHODS,
  SKIN_TYPES,
  CONCERNS,
  ROUTINE_STEPS,
  SKIN_TONES,
  UNDERTONES,
  keys,
};
