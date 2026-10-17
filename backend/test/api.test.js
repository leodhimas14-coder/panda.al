const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.SHIPPING_FEE = '300';
process.env.FREE_SHIPPING_FROM = '6000';
process.env.CNY_TO_ALL = '13';

const { createApp } = require('../src/app');
const User = require('../src/models/User');

let mongo;
let app;
let adminToken;
let staffToken;
let jacket;
let wallet;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp();

  const passwordHash = await bcrypt.hash('sekret123', 4);
  await User.create({ name: 'Leo', email: 'admin@panda.al', passwordHash, role: 'admin' });
  await User.create({ name: 'Magazina', email: 'staff@panda.al', passwordHash, role: 'staff' });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@panda.al', password: 'sekret123' })).body.token;
  staffToken = (await request(app).post('/api/auth/login').send({ email: 'staff@panda.al', password: 'sekret123' })).body.token;
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const asAdmin = (req) => req.set('Authorization', `Bearer ${adminToken}`);
const asStaff = (req) => req.set('Authorization', `Bearer ${staffToken}`);
const customer = { name: 'Arta Hoxha', phone: '069 123 4567', city: 'Tiranë', address: 'Rr. Myslym Shyri 10' };

test('login rejects a wrong password', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@panda.al', password: 'gabim' });
  assert.equal(res.status, 401);
});

test('admin creates products; staff cannot', async () => {
  const forbidden = await asStaff(request(app).post('/api/admin/products')).send({ name: 'X', category: 'rroba', price: 1 });
  assert.equal(forbidden.status, 403);

  let res = await asAdmin(request(app).post('/api/admin/products')).send({
    name: 'Xhaketë Lëkure',
    category: 'rroba',
    price: 5000,
    images: ['https://example.com/a.jpg'],
    variants: [{ size: 'M', color: 'E zezë', stock: 2 }, { size: 'L', color: 'E zezë', stock: 0 }],
    supplier: { name: 'Fabrika A', url: 'https://detail.1688.com/x', costCny: 120 },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.product.slug, 'xhakete-lekure');
  jacket = res.body.product;

  res = await asAdmin(request(app).post('/api/admin/products')).send({ name: 'Portofol', category: 'portofola', price: 1500 });
  assert.equal(res.status, 201);
  wallet = res.body.product;
});

test('public catalogue hides supplier details', async () => {
  const res = await request(app).get('/api/products?category=rroba');
  assert.equal(res.status, 200);
  assert.equal(res.body.products.length, 1);
  assert.equal(res.body.products[0].supplier, undefined);

  const one = await request(app).get('/api/products/xhakete-lekure');
  assert.equal(one.body.product.supplier, undefined);
  assert.equal(one.body.product.inStock, true);
});

test('checkout validates phone and variant', async () => {
  let res = await request(app).post('/api/orders').send({ customer: { ...customer, phone: '12345' }, items: [{ productId: wallet._id, quantity: 1 }] });
  assert.equal(res.status, 400);

  res = await request(app).post('/api/orders').send({ customer, items: [{ productId: jacket._id, quantity: 1 }] });
  assert.equal(res.status, 400, 'variant is required when the product has variants');
});

let orderA;
let orderB;

test('order uses server prices, reserves local stock and charges shipping', async () => {
  const [m, l] = jacket.variants;
  const res = await request(app).post('/api/orders').send({
    customer,
    items: [
      { productId: jacket._id, variantId: m._id, quantity: 1, unitPrice: 1 },
      { productId: jacket._id, variantId: l._id, quantity: 1 },
    ],
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.order.number, 'PA-1001');
  assert.equal(res.body.order.subtotal, 10000);
  assert.equal(res.body.order.shippingFee, 0, 'free shipping above 6000');
  orderA = res.body.order;

  const product = (await asAdmin(request(app).get(`/api/admin/products/${jacket._id}`))).body.product;
  assert.equal(product.variants[0].stock, 1, 'M stock reserved');

  const res2 = await request(app).post('/api/orders').send({ customer: { ...customer, phone: '+355682223333' }, items: [{ productId: wallet._id, quantity: 2 }] });
  assert.equal(res2.body.order.total, 3300, '2×1500 + 300 shipping');
  orderB = res2.body.order;
});

test('tracking requires the matching phone number', async () => {
  let res = await request(app).get(`/api/orders/track/${orderA.number}?phone=0682223333`);
  assert.equal(res.status, 404);
  res = await request(app).get(`/api/orders/track/${orderA.number.toLowerCase()}?phone=0691234567`);
  assert.equal(res.status, 200);
  assert.equal(res.body.order.status, 'e_re');
  assert.equal(res.body.order.customer, undefined);
});

test('cancelling an order returns reserved stock', async () => {
  const [m] = jacket.variants;
  const placed = await request(app).post('/api/orders').send({ customer, items: [{ productId: jacket._id, variantId: m._id, quantity: 1 }] });
  const list = await asStaff(request(app).get(`/api/admin/orders?q=${placed.body.order.number}`));
  const id = list.body.orders[0]._id;

  let product = (await asAdmin(request(app).get(`/api/admin/products/${jacket._id}`))).body.product;
  assert.equal(product.variants[0].stock, 0);

  const res = await asStaff(request(app).patch(`/api/admin/orders/${id}`)).send({ status: 'e_anuluar' });
  assert.equal(res.status, 200);
  product = (await asAdmin(request(app).get(`/api/admin/products/${jacket._id}`))).body.product;
  assert.equal(product.variants[0].stock, 1);

  const again = await asStaff(request(app).patch(`/api/admin/orders/${id}`)).send({ status: 'e_re' });
  assert.equal(again.status, 400, 'cancelled orders stay cancelled');
});

test('purchase list → bought → shipment → delivered → profit', async () => {
  const ids = {};
  for (const o of [orderA, orderB]) {
    const found = (await asStaff(request(app).get(`/api/admin/orders?q=${o.number}`))).body.orders[0];
    ids[o.number] = found._id;
    await asStaff(request(app).patch(`/api/admin/orders/${found._id}`)).send({ status: 'e_konfirmuar' });
  }

  const list = await asStaff(request(app).get('/api/admin/purchase-list'));
  assert.equal(list.status, 200);
  // Order A's M jacket came from Albania stock, so only the L jacket and the wallets are listed.
  const names = list.body.items.map((i) => `${i.name}|${i.size}|${i.quantity}`).sort();
  assert.deepEqual(names, ['Portofol||2', 'Xhaketë Lëkure|L|1']);
  assert.equal(list.body.items.find((i) => i.size === 'L').totalCny, 120);

  const bought = await asStaff(request(app).post('/api/admin/purchase-list/mark-bought')).send({ orderIds: Object.values(ids) });
  assert.equal(bought.body.updated, 2);

  const shipment = (await asStaff(request(app).post('/api/admin/shipments')).send({})).body.shipment;
  assert.match(shipment.code, /^CN-/);
  const added = await asStaff(request(app).post(`/api/admin/shipments/${shipment._id}/orders`)).send({ orderIds: Object.values(ids) });
  assert.equal(added.body.added, 2);

  await asStaff(request(app).patch(`/api/admin/shipments/${shipment._id}`)).send({ cargoCostAll: 1000, status: 'nisur' });
  let track = await request(app).get(`/api/orders/track/${orderB.number}?phone=0682223333`);
  assert.equal(track.body.order.status, 'ne_rruge');

  await asStaff(request(app).patch(`/api/admin/shipments/${shipment._id}`)).send({ status: 'mberritur' });
  track = await request(app).get(`/api/orders/track/${orderB.number}?phone=0682223333`);
  assert.equal(track.body.order.status, 'ne_shqiperi');

  await asStaff(request(app).patch(`/api/admin/orders/${ids[orderB.number]}`)).send({ status: 'e_dorezuar', costs: { purchaseCny: 36, deliveryAll: 200 } });

  const forbidden = await asStaff(request(app).get('/api/admin/reports/summary'));
  assert.equal(forbidden.status, 403);

  const report = await asAdmin(request(app).get('/api/admin/reports/summary'));
  assert.equal(report.body.delivered, 1);
  assert.equal(report.body.revenue, 3300);
  // 36 CNY × 13 = 468, + 500 cargo share + 200 delivery
  assert.equal(report.body.costs, 1168);
  assert.equal(report.body.profit, 2132);
});

test('admin routes need a token', async () => {
  const res = await request(app).get('/api/admin/orders');
  assert.equal(res.status, 401);
});
