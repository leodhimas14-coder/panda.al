const Setting = require('../models/Setting');
const { HttpError } = require('../middleware/errorHandler');
const { getShopSettings } = require('../services/settings.service');

// Only http(s) URLs or site-relative paths, so nothing like javascript: ends up in the page.
function cleanUrl(value, label, { relative = false } = {}) {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || (relative && url.startsWith('/') && !url.startsWith('//'))) return url.slice(0, 1000);
  throw new HttpError(400, `${label} duhet të fillojë me https://${relative ? ' ose /' : ''}`);
}

const text = (value, max = 200) => String(value ?? '').trim().slice(0, max);

function money(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 1e7) throw new HttpError(400, `${label}: vlerë e pavlefshme`);
  return Math.round(n);
}

async function get(_req, res) {
  res.json({ settings: await getShopSettings() });
}

/** Saves whichever sections are sent; sections left out stay as they are. */
async function update(req, res) {
  const body = req.body || {};
  const doc = (await Setting.findById('shop')) || new Setting({ _id: 'shop' });

  if (body.homeBanner) {
    doc.homeBanner = {
      url: cleanUrl(body.homeBanner.url, 'Linku i videos/fotos'),
      posterUrl: cleanUrl(body.homeBanner.posterUrl, 'Fotoja e parapamjes'),
      link: cleanUrl(body.homeBanner.link, 'Linku kur shtypet', { relative: true }),
    };
  }
  if (body.promoBar) {
    doc.promoBar = { enabled: Boolean(body.promoBar.enabled), text: text(body.promoBar.text, 160) };
  }
  if (body.shipping) {
    doc.shipping = {
      fee: money(body.shipping.fee, 'Kosto e transportit'),
      freeFrom: money(body.shipping.freeFrom, 'Transport falas mbi'),
      localText: text(body.shipping.localText, 60) || '1–3 ditë pune',
      chinaText: text(body.shipping.chinaText, 60) || '10–18 ditë',
    };
  }
  if (body.payments) {
    const card = Boolean(body.payments.card);
    const cod = Boolean(body.payments.cod);
    if (!card && !cod) throw new HttpError(400, 'Duhet të paktën një mënyrë pagese');
    doc.payments = { card, cod };
  }
  if (body.contact) {
    const whatsapp = String(body.contact.whatsapp ?? '').replace(/\D/g, '');
    if (whatsapp && (whatsapp.length < 9 || whatsapp.length > 15)) throw new HttpError(400, 'Numri i WhatsApp duhet me prefiks, p.sh. 355691234567');
    const email = text(body.contact.email, 120);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(400, 'Email-i i kontaktit nuk është i saktë');
    doc.contact = { whatsapp, phone: text(body.contact.phone, 40), email };
  }
  if (body.cnyToAll !== undefined) {
    const rate = Number(body.cnyToAll);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 1000) throw new HttpError(400, 'Kursi i juanit nuk është i saktë');
    doc.cnyToAll = rate;
  }

  await doc.save();
  res.json({ settings: await getShopSettings() });
}

module.exports = { get, update };
