import { Link, Navigate, useLocation } from 'react-router-dom';
import { lek } from '../../lib/format';
import Icon from '../../components/Icon';

export default function OrderDonePage() {
  const { state } = useLocation();
  if (!state?.order) return <Navigate to="/" replace />;
  const { order, phone } = state;

  return (
    <div className="container section narrow center">
      <div className="success-icon"><Icon name="check" size={40} stroke={2.5} /></div>
      <h1>Faleminderit! Porosia u pranua.</h1>
      <p className="muted">Do t'ju telefonojmë së shpejti për ta konfirmuar.</p>
      <div className="card order-number">
        <span className="muted small">Numri i porosisë</span>
        <strong>{order.number}</strong>
        <span>Totali: <b>{lek(order.total)}</b> · pagesë në dorëzim</span>
      </div>
      <p className="muted small">Ruajeni numrin e porosisë. Me të dhe numrin e telefonit mund ta gjurmoni porosinë kurdo.</p>
      <div className="stack">
        <Link to={`/gjurmo?nr=${order.number}&tel=${encodeURIComponent(phone)}`} className="btn btn-primary btn-lg btn-block">Gjurmo porosinë</Link>
        <Link to="/dyqani" className="btn btn-ghost btn-block">Vazhdo blerjet</Link>
      </div>
    </div>
  );
}
