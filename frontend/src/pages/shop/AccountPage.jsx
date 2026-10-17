import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { getMyOrders } from '../../lib/myOrders';
import { useWishlist } from '../../context/WishlistContext';
import { date, lek } from '../../lib/format';

const loadCustomer = () => { try { return JSON.parse(localStorage.getItem('panda_customer_v1')) || null; } catch { return null; } };

// No passwords: the account is this device. Orders placed here are listed
// with a one-tap link to tracking, and checkout remembers the address.
export default function AccountPage() {
  const orders = getMyOrders();
  const customer = loadCustomer();
  const { count } = useWishlist();

  return (
    <div className="container section narrow">
      <h1 className="page-title">{customer?.name ? `Përshëndetje, ${customer.name.split(' ')[0]}` : 'Llogaria ime'}</h1>

      <div className="account-links">
        <Link to="/te-ruajturat"><Icon name="heart" /> <span>Produktet e ruajtura</span><b>{count}</b></Link>
        <Link to="/gjurmo"><Icon name="truck" /> <span>Gjurmo një porosi</span></Link>
        <Link to="/info"><Icon name="bag" /> <span>Dërgesa dhe kthimet</span></Link>
      </div>

      <h2 className="section-title">Porositë e mia</h2>
      {orders.length === 0 ? (
        <p className="muted">Porositë që bën nga ky telefon do të shfaqen këtu.</p>
      ) : (
        <ul className="my-orders">
          {orders.map((o) => (
            <li key={o.number}>
              <Link to={`/gjurmo?nr=${o.number}&tel=${encodeURIComponent(o.phone)}`}>
                <div>
                  <b>{o.number}</b>
                  <div className="muted small">{date(o.createdAt)}</div>
                </div>
                <span>{lek(o.total)}</span>
                <span className="link-text">Gjurmo →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {customer && (
        <>
          <h2 className="section-title">Adresa e dërgesës</h2>
          <div className="card">
            <b>{customer.name}</b>
            <div>{customer.phone}</div>
            <div className="muted">{customer.city}, {customer.address}</div>
            <p className="muted small">Plotësohet vetë në porosinë e radhës.</p>
          </div>
        </>
      )}
    </div>
  );
}
