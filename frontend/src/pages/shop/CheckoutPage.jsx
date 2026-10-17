import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import { api } from '../../lib/api';
import { CITIES, lek } from '../../lib/format';

const SAVED_KEY = 'panda_customer_v1';
const loadSaved = () => { try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || {}; } catch { return {}; } };

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const { shippingFee, freeShippingFrom } = useConfig();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ name: '', phone: '', city: '', address: '', note: '', ...loadSaved() }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (lines.length === 0) return <Navigate to="/shporta" replace />;

  const fee = subtotal >= freeShippingFrom ? 0 : shippingFee;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        body: {
          customer: form,
          paymentMethod: 'cod',
          items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
        },
      });
      try {
        const { note, ...saved } = form;
        localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
      } catch { /* ignore */ }
      clear();
      navigate('/porosia-u-krye', { state: { order, phone: form.phone }, replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section narrow">
      <h1 className="page-title">Përfundo porosinë</h1>
      <form className="form card" onSubmit={onSubmit}>
        <label>Emri dhe mbiemri<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
        <label>Numri i telefonit<input required type="tel" inputMode="tel" placeholder="06X XXX XXXX" value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label>Qyteti
          <select required value={form.city} onChange={set('city')}>
            <option value="">Zgjidhni qytetin</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>Adresa e saktë<textarea required rows={2} placeholder="Rruga, pallati, kati, pika referimi" value={form.address} onChange={set('address')} autoComplete="street-address" /></label>
        <label>Shënim (opsionale)<input value={form.note} onChange={set('note')} placeholder="p.sh. më telefononi para se të vini" /></label>

        <div className="pay-method">
          <input type="radio" checked readOnly id="cod" />
          <label htmlFor="cod"><b>Pagesë në dorëzim</b><span className="muted small">Paguani me para në dorë kur të merrni porosinë.</span></label>
        </div>

        <div className="summary">
          {lines.map((l) => (
            <div key={l.key} className="small"><span>{l.quantity}× {l.name}{l.size || l.color ? ` (${[l.size, l.color].filter(Boolean).join(', ')})` : ''}</span><span>{lek(l.price * l.quantity)}</span></div>
          ))}
          <div><span>Transporti</span><span>{fee === 0 ? 'Falas' : lek(fee)}</span></div>
          <div className="summary-total"><span>Totali për të paguar</span><span>{lek(subtotal + fee)}</span></div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
          {submitting ? 'Po dërgohet…' : 'Konfirmo porosinë'}
        </button>
        <p className="muted small center">Do t'ju telefonojmë për të konfirmuar porosinë. <Link to="/info">Kushtet e dërgesës</Link></p>
      </form>
    </div>
  );
}
