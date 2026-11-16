const QuizResponse = require('../models/QuizResponse');
const { HttpError } = require('../middleware/errorHandler');
const { SKIN_TYPES, CONCERNS, SKIN_TONES, UNDERTONES, ROUTINE_STEPS, keys } = require('../config/constants');

/** Options for the shop's skin test and the admin product form. */
function options(_req, res) {
  res.json({ skinTypes: SKIN_TYPES, concerns: CONCERNS, tones: SKIN_TONES, undertones: UNDERTONES, routineSteps: ROUTINE_STEPS });
}

async function record(req, res) {
  const b = req.body || {};
  const pick = (value, allowed) => (allowed.includes(value) ? value : undefined);
  const doc = {
    gender: pick(b.gender, ['femra', 'meshkuj']),
    skinType: pick(b.skinType, [...keys(SKIN_TYPES), 'nuk_e_di']),
    concerns: (Array.isArray(b.concerns) ? b.concerns : []).filter((c) => keys(CONCERNS).includes(c)).slice(0, 7),
    tone: [1, 2, 3, 4, 5].includes(Number(b.tone)) ? Number(b.tone) : undefined,
    undertone: pick(b.undertone, [...keys(UNDERTONES), 'nuk_e_di']),
  };
  if (!doc.skinType && !doc.concerns.length && !doc.tone) throw new HttpError(400, 'Përgjigje bosh');
  await QuizResponse.create(doc);
  res.status(201).json({ ok: true });
}

/** Admin: how many people answered what, over the last `days` days. */
async function summary(req, res) {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
  const since = new Date(Date.now() - days * 86400000);
  const responses = await QuizResponse.find({ createdAt: { $gte: since } }).lean();
  const count = (list, getter) => {
    const out = Object.fromEntries(list.map((x) => [x.key, 0]));
    for (const r of responses) for (const v of [].concat(getter(r) ?? [])) if (v in out) out[v] += 1;
    return list.map((x) => ({ key: x.key, label: x.label, count: out[x.key] })).sort((a, b) => b.count - a.count);
  };
  res.json({
    days,
    total: responses.length,
    skinTypes: count(SKIN_TYPES, (r) => r.skinType),
    concerns: count(CONCERNS, (r) => r.concerns),
    tones: count(SKIN_TONES, (r) => r.tone),
    undertones: count(UNDERTONES, (r) => r.undertone),
  });
}

module.exports = { options, record, summary };
