const Setting = require('../models/Setting');
const { HttpError } = require('../middleware/errorHandler');

// Only http(s) URLs or site-relative paths, so nothing like javascript: ends up in the page.
function cleanUrl(value, label, { relative = false } = {}) {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || (relative && url.startsWith('/') && !url.startsWith('//'))) return url.slice(0, 1000);
  throw new HttpError(400, `${label} duhet të fillojë me https://${relative ? ' ose /' : ''}`);
}

async function get(_req, res) {
  res.json({ settings: await Setting.get() });
}

async function update(req, res) {
  const banner = req.body?.homeBanner || {};
  const settings = await Setting.get();
  settings.homeBanner = {
    url: cleanUrl(banner.url, 'Linku i videos/fotos'),
    posterUrl: cleanUrl(banner.posterUrl, 'Fotoja e parapamjes'),
    link: cleanUrl(banner.link, 'Linku kur shtypet', { relative: true }),
  };
  await settings.save();
  res.json({ settings });
}

module.exports = { get, update };
