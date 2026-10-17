const Product = require('../models/Product');
const { HttpError } = require('../middleware/errorHandler');

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);

const EDITABLE = ['name', 'slug', 'category', 'gender', 'description', 'images', 'price', 'compareAtPrice', 'variants', 'supplier', 'featured', 'active'];

function pick(body) {
  const data = {};
  for (const key of EDITABLE) if (body[key] !== undefined) data[key] = body[key];
  if (Array.isArray(data.images)) data.images = data.images.map((s) => String(s).trim()).filter(Boolean);
  return data;
}

async function uniqueSlug(base, excludeId) {
  const root = slugify(base) || 'produkt';
  let slug = root;
  for (let i = 2; await Product.exists({ slug, _id: { $ne: excludeId } }); i += 1) slug = `${root}-${i}`;
  return slug;
}

async function list(req, res) {
  const filter = {};
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.q) filter.$text = { $search: String(req.query.q) };
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json({ products });
}

async function get(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Produkti nuk u gjet');
  res.json({ product });
}

async function create(req, res) {
  const data = pick(req.body || {});
  data.slug = await uniqueSlug(data.slug || data.name || '');
  const product = await Product.create(data);
  res.status(201).json({ product });
}

async function update(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Produkti nuk u gjet');
  const data = pick(req.body || {});
  if (data.slug !== undefined) data.slug = await uniqueSlug(data.slug || product.name, product._id);
  product.set(data);
  await product.save();
  res.json({ product });
}

// Products referenced by old orders are hidden rather than deleted.
async function remove(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!product) throw new HttpError(404, 'Produkti nuk u gjet');
  res.json({ product });
}

module.exports = { list, get, create, update, remove, slugify };
