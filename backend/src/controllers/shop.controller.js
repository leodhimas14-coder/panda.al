const Product = require('../models/Product');
const Order = require('../models/Order');
const Setting = require('../models/Setting');
const { HttpError } = require('../middleware/errorHandler');
const { createOrder, normalizePhone } = require('../services/order.service');
const { notifyOwner, formatNewOrder } = require('../services/notify.service');
const { CATEGORIES, GENDERS, ORDER_STATUSES, settings } = require('../config/constants');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function config(_req, res) {
  const { shippingFee, freeShippingFrom } = settings();
  const { homeBanner } = await Setting.get();
  res.json({ categories: CATEGORIES, genders: GENDERS, orderStatuses: ORDER_STATUSES, shippingFee, freeShippingFrom, homeBanner });
}

async function listProducts(req, res) {
  const filter = { active: true };
  const { category, gender, q, featured, sale, sort } = req.query;
  if (category) filter.category = String(category);
  if (gender) filter.gender = { $in: [String(gender), 'unisex'] };
  if (featured === '1') filter.featured = true;
  if (sale === '1') filter.$expr = { $gt: ['$compareAtPrice', '$price'] };
  if (q) filter.name = { $regex: escapeRegex(String(q).slice(0, 60)), $options: 'i' };

  const sortBy = { 'cmimi-ulet': { price: 1 }, 'cmimi-larte': { price: -1 } }[sort] || { createdAt: -1 };
  const limit = Math.min(Number(req.query.limit) || 48, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ products: products.map((p) => p.toPublic()), total, page, pages: Math.ceil(total / limit) });
}

async function getProduct(req, res) {
  const product = await Product.findOne({ slug: req.params.slug, active: true });
  if (!product) throw new HttpError(404, 'Produkti nuk u gjet');
  res.json({ product: product.toPublic() });
}

async function placeOrder(req, res) {
  const order = await createOrder(req.body);
  notifyOwner(formatNewOrder(order));
  res.status(201).json({ order: order.toTracking() });
}

// The phone number acts as a password, so order numbers can't be enumerated.
async function trackOrder(req, res) {
  const phone = normalizePhone(req.query.phone);
  const number = String(req.params.number || '').toUpperCase().trim();
  const order = phone && (await Order.findOne({ number, 'customer.phone': phone }));
  if (!order) throw new HttpError(404, 'Porosia nuk u gjet. Kontrolloni numrin e porosisë dhe telefonin.');
  res.json({ order: order.toTracking() });
}

module.exports = { config, listProducts, getProduct, placeOrder, trackOrder };
