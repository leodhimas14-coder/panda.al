const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
const { HttpError } = require('../middleware/errorHandler');
const { settings } = require('../config/constants');

const MAX_ITEMS = 30;
const MAX_QTY = 20;

// Albanian mobile numbers: 06X XXX XXXX, optionally with +355 / 00355 and no leading 0.
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/[\s\-().]/g, '');
  const match = digits.match(/^(?:\+355|00355|0)?(6[6-9]\d{7})$/);
  return match ? `+355${match[1]}` : null;
}

function requireText(value, label, max = 200) {
  const text = String(value ?? '').trim();
  if (!text) throw new HttpError(400, `${label} është i detyrueshëm`);
  if (text.length > max) throw new HttpError(400, `${label} është shumë i gjatë`);
  return text;
}

/**
 * Builds and saves an order from the shop checkout. Prices always come from the
 * database, never from the client. Items whose variant has Albania stock reserve
 * it immediately; the rest are bought in China.
 */
async function createOrder(input) {
  const customer = {
    name: requireText(input?.customer?.name, 'Emri', 100),
    phone: normalizePhone(input?.customer?.phone),
    city: requireText(input?.customer?.city, 'Qyteti', 60),
    address: requireText(input?.customer?.address, 'Adresa', 300),
    note: String(input?.customer?.note ?? '').trim().slice(0, 500),
  };
  if (!customer.phone) throw new HttpError(400, 'Numri i telefonit nuk është i saktë (p.sh. 069 123 4567)');

  const rawItems = Array.isArray(input?.items) ? input.items : [];
  if (rawItems.length === 0) throw new HttpError(400, 'Shporta është bosh');
  if (rawItems.length > MAX_ITEMS) throw new HttpError(400, 'Shumë artikuj në një porosi');

  const paymentMethod = input?.paymentMethod === 'bank' ? 'bank' : 'cod';

  const reserved = []; // [{ productId, variantId, quantity }] to roll back on failure
  try {
    const items = [];
    for (const raw of rawItems) {
      const quantity = Number(raw?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
        throw new HttpError(400, 'Sasi e pavlefshme');
      }
      if (!mongoose.isValidObjectId(raw?.productId)) throw new HttpError(400, 'Produkt i pavlefshëm');

      const product = await Product.findOne({ _id: raw.productId, active: true });
      if (!product) throw new HttpError(400, 'Një nga produktet nuk është më në shitje');

      let variant = null;
      if (product.variants.length > 0) {
        variant = product.variants.id(raw?.variantId);
        if (!variant) throw new HttpError(400, `Zgjidhni masën/ngjyrën për "${product.name}"`);
      }

      let fromLocalStock = false;
      if (variant) {
        const res = await Product.updateOne(
          { _id: product._id, variants: { $elemMatch: { _id: variant._id, stock: { $gte: quantity } } } },
          { $inc: { 'variants.$.stock': -quantity } }
        );
        if (res.modifiedCount === 1) {
          fromLocalStock = true;
          reserved.push({ productId: product._id, variantId: variant._id, quantity });
        }
      }

      items.push({
        product: product._id,
        variantId: variant?._id,
        name: product.name,
        image: product.images[0] || '',
        size: variant?.size || '',
        color: variant?.color || '',
        quantity,
        unitPrice: product.price,
        fromLocalStock,
      });
    }

    const { shippingFee, freeShippingFrom } = settings();
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const fee = subtotal >= freeShippingFrom ? 0 : shippingFee;
    const seq = await Counter.next('order');

    return await Order.create({
      number: `PA-${seq}`,
      customer,
      items,
      subtotal,
      shippingFee: fee,
      total: subtotal + fee,
      paymentMethod,
      status: 'e_re',
      statusHistory: [{ status: 'e_re', by: 'klienti' }],
    });
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
}

async function restoreStock(entries) {
  for (const { productId, variantId, quantity } of entries) {
    await Product.updateOne(
      { _id: productId, 'variants._id': variantId },
      { $inc: { 'variants.$.stock': quantity } }
    );
  }
}

/** Puts reserved Albania stock back when an order is cancelled. */
async function releaseOrderStock(order) {
  await restoreStock(
    order.items
      .filter((i) => i.fromLocalStock && i.variantId)
      .map((i) => ({ productId: i.product, variantId: i.variantId, quantity: i.quantity }))
  );
}

async function setOrderStatus(order, status, by, note = '') {
  if (order.status === status) return order;
  if (order.status === 'e_anuluar') throw new HttpError(400, 'Porosia e anuluar nuk mund të ndryshohet');
  if (status === 'e_anuluar') await releaseOrderStock(order);

  order.status = status;
  order.statusHistory.push({ status, by, note });
  if (status === 'e_dorezuar' && order.paymentMethod === 'cod') order.paid = true;
  return order.save();
}

module.exports = { createOrder, setOrderStatus, normalizePhone };
