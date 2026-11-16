import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { lek } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import {
  SKIN_TYPES, CONCERNS, SKIN_TONES, UNDERTONES, labelOf, recommend, saveAnswers, loadAnswers,
} from '../../lib/skinQuiz';

const MAX_CONCERNS = 3;
const variantLabel = (v) => [v?.size, v?.color].filter(Boolean).join(' · ');

function Choice({ selected, onClick, children, swatch }) {
  return (
    <button type="button" className={`quiz-choice ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={onClick}>
      {swatch && <span className="quiz-swatch" style={{ background: swatch }} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

export default function SkinTestPage() {
  const previous = loadAnswers();
  const [step, setStep] = useState(previous ? 'result' : 'intro');
  const [answers, setAnswers] = useState(previous || { gender: '', skinType: '', concerns: [], tone: null, undertone: '' });
  const [products, setProducts] = useState(null);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    api('/products?limit=100').then((d) => setProducts(d.products)).catch(() => setProducts([]));
  }, []);

  const routine = useMemo(() => (products ? recommend(products, answers) : []), [products, answers]);
  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }));

  const finish = (final) => {
    saveAnswers(final);
    setAnswers(final);
    setStep('result');
    setAdded(false);
    api('/skin-test/answers', { method: 'POST', body: final }).catch(() => {});
  };

  const steps = ['gender', 'skin', 'concerns', 'tone', 'undertone'];
  const progress = steps.includes(step) ? ((steps.indexOf(step) + 1) / steps.length) * 100 : 0;
  const back = () => setStep(steps[Math.max(0, steps.indexOf(step) - 1)]);

  if (step === 'intro') {
    return (
      <div className="container section narrow quiz">
        <p className="eyebrow-dark">1 minutë · 5 pyetje</p>
        <h1 className="page-title">Testi i lëkurës</h1>
        <p>Na trego si është lëkura jote dhe çfarë të shqetëson. Të sugjerojmë një rutinë të thjeshtë dhe nuancën e fondatinës që të përshtatet.</p>
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => setStep('gender')}>Fillo testin</button>
        <p className="muted small">Testi është udhëzues dhe nuk zëvendëson një dermatolog. Për puçrra të rënda ose acarime që nuk kalojnë, këshillohu me mjekun.</p>
      </div>
    );
  }

  if (step !== 'result') {
    return (
      <div className="container section narrow quiz">
        <div className="quiz-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

        {step === 'gender' && (
          <>
            <h2>Për kë është rutina?</h2>
            <div className="quiz-choices two">
              <Choice selected={answers.gender === 'femra'} onClick={() => { set({ gender: 'femra' }); setStep('skin'); }}>👩 Për mua, femër</Choice>
              <Choice selected={answers.gender === 'meshkuj'} onClick={() => { set({ gender: 'meshkuj' }); setStep('skin'); }}>👨 Për mua, mashkull</Choice>
            </div>
          </>
        )}

        {step === 'skin' && (
          <>
            <h2>Si është lëkura jote?</h2>
            <p className="muted small">Mendo si ndihet lëkura 1–2 orë pasi e lan fytyrën, pa i vënë asgjë.</p>
            <div className="quiz-choices">
              {SKIN_TYPES.map((t) => (
                <Choice key={t.key} selected={answers.skinType === t.key} onClick={() => { set({ skinType: t.key }); setStep('concerns'); }}>
                  <b>{t.label}</b><span className="muted small">{t.hint}</span>
                </Choice>
              ))}
              <Choice selected={answers.skinType === 'nuk_e_di'} onClick={() => { set({ skinType: 'nuk_e_di' }); setStep('concerns'); }}>
                <b>Nuk e di</b><span className="muted small">Do të sugjerojmë produkte për çdo lloj lëkure.</span>
              </Choice>
            </div>
          </>
        )}

        {step === 'concerns' && (
          <>
            <h2>Çfarë të shqetëson më shumë?</h2>
            <p className="muted small">Zgjidh deri në {MAX_CONCERNS}. Mund të mos zgjedhësh asnjë.</p>
            <div className="quiz-choices">
              {CONCERNS.map((c) => {
                const on = answers.concerns.includes(c.key);
                const full = !on && answers.concerns.length >= MAX_CONCERNS;
                return (
                  <Choice
                    key={c.key}
                    selected={on}
                    onClick={() => !full && set({ concerns: on ? answers.concerns.filter((x) => x !== c.key) : [...answers.concerns, c.key] })}
                  >
                    {c.icon} {c.label}
                  </Choice>
                );
              })}
            </div>
            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => setStep('tone')}>Vazhdo</button>
          </>
        )}

        {step === 'tone' && (
          <>
            <h2>Cila është ngjyra e lëkurës tënde?</h2>
            <p className="muted small">Për të gjetur nuancën e fondatinës. Shiko fytyrën në dritë dite, pa grim.</p>
            <div className="quiz-choices">
              {SKIN_TONES.map((t) => (
                <Choice key={t.key} swatch={t.swatch} selected={answers.tone === t.key} onClick={() => { set({ tone: t.key }); setStep('undertone'); }}>{t.label}</Choice>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => finish({ ...answers, tone: null, undertone: '' })}>Nuk përdor fondatinë, shko te rezultati</button>
          </>
        )}

        {step === 'undertone' && (
          <>
            <h2>Cili është nëntoni i lëkurës?</h2>
            <p className="muted small">Shiko venat në pjesën e brendshme të kyçit të dorës, në dritë dite.</p>
            <div className="quiz-choices">
              {UNDERTONES.map((u) => (
                <Choice key={u.key} selected={answers.undertone === u.key} onClick={() => finish({ ...answers, undertone: u.key })}>
                  <b>{u.label}</b><span className="muted small">{u.hint}</span>
                </Choice>
              ))}
              <Choice selected={answers.undertone === 'nuk_e_di'} onClick={() => finish({ ...answers, undertone: 'nuk_e_di' })}><b>Nuk e di</b></Choice>
            </div>
          </>
        )}

        <button type="button" className="back-link quiz-back" onClick={back} disabled={step === 'gender'}>← Mbrapa</button>
      </div>
    );
  }

  // Result
  const total = routine.reduce((s, r) => s + r.product.price, 0);
  const addAll = () => {
    for (const r of routine) add(r.product, r.variant || null, 1);
    setAdded(true);
  };

  return (
    <div className="container section narrow quiz">
      <p className="eyebrow-dark">Rezultati yt</p>
      <h1 className="page-title">Rutina për lëkurën tënde</h1>
      <div className="quiz-summary">
        {answers.skinType && answers.skinType !== 'nuk_e_di' && <span className="pill">Lëkurë {labelOf(SKIN_TYPES, answers.skinType).toLowerCase()}</span>}
        {answers.concerns.map((c) => <span key={c} className="pill">{labelOf(CONCERNS, c)}</span>)}
        {answers.tone && <span className="pill"><span className="quiz-swatch sm" style={{ background: SKIN_TONES[answers.tone - 1].swatch }} /> {SKIN_TONES[answers.tone - 1].label}</span>}
      </div>

      {!products && <p className="muted">Po zgjedhim produktet…</p>}
      {products && routine.length === 0 && (
        <div className="card">
          <p>Ende s'kemi produkte që përputhen me këto përgjigje. Shiko gjithë dyqanin ose na shkruaj dhe të këshillojmë ne.</p>
          <Link to="/dyqani" className="btn btn-primary">Shko te dyqani</Link>
        </div>
      )}

      {routine.length > 0 && (
        <>
          <ol className="routine">
            {routine.map(({ step: s, product, variant }, i) => (
              <li key={s.key} className="routine-step">
                <span className="routine-num">{i + 1}</span>
                <Link to={`/produkt/${product.slug}`} className="routine-img">
                  {product.images?.[0] ? <img src={product.images[0]} alt="" /> : <div className="img-placeholder" />}
                </Link>
                <div className="routine-info">
                  <span className="muted small">{s.label} · {s.when}</span>
                  <Link to={`/produkt/${product.slug}`} className="routine-name">{product.name}</Link>
                  {variant && <span className="small">{s.key === 'grim' ? 'Nuanca jote: ' : ''}<b>{variantLabel(variant)}</b></span>}
                  <span className="price">{lek(product.price)}</span>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn-primary btn-lg btn-block" onClick={addAll}>
            {added ? '✓ U shtuan në shportë' : `Shto të gjitha në shportë · ${lek(total)}`}
          </button>
          {added && <Link to="/shporta" className="btn btn-ghost btn-block">Shko te shporta</Link>}
        </>
      )}

      <button type="button" className="btn btn-ghost btn-block" onClick={() => { setAnswers({ gender: '', skinType: '', concerns: [], tone: null, undertone: '' }); setStep('gender'); }}>Bëje testin përsëri</button>
      <p className="muted small">Provo çdo produkt të ri fillimisht në një pjesë të vogël të lëkurës. Testi është udhëzues dhe nuk zëvendëson një dermatolog.</p>
    </div>
  );
}
