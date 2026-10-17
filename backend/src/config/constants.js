// Shared enums and business settings. Money is stored in whole lekë (ALL);
// supplier prices are stored in yuan (CNY) because that's what 1688 shows.

const CATEGORIES = [
  { key: 'rroba', label: 'Rroba' },
  { key: 'kepuce', label: 'Këpucë' },
  { key: 'canta', label: 'Çanta' },
  { key: 'portofola', label: 'Portofola' },
  { key: 'aksesore', label: 'Aksesorë' },
];

// Order lifecycle, in the order an order normally moves through it.
const ORDER_STATUSES = [
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
  { key: 'cod', label: 'Pagesë në dorëzim' },
  { key: 'bank', label: 'Transfertë bankare' },
];

function settings() {
  return {
    shippingFee: Number(process.env.SHIPPING_FEE ?? 300),
    freeShippingFrom: Number(process.env.FREE_SHIPPING_FROM ?? 6000),
    cnyToAll: Number(process.env.CNY_TO_ALL ?? 13),
  };
}

const keys = (list) => list.map((x) => x.key);

module.exports = {
  CATEGORIES,
  ORDER_STATUSES,
  SHIPMENT_STATUSES,
  SHIPMENT_TO_ORDER_STATUS,
  PAYMENT_METHODS,
  settings,
  keys,
};
