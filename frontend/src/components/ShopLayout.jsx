import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo';
import Icon from './Icon';
import InstallButton from './InstallButton';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { lek } from '../lib/format';

const WHATSAPP = import.meta.env.VITE_WHATSAPP;

export default function ShopLayout() {
  const { count } = useCart();
  const { freeShippingFrom } = useConfig();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/dyqani?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="shop">
      <div className="promo-bar">Transport falas mbi {lek(freeShippingFrom)} · Pagesë në dorëzim në gjithë Shqipërinë</div>
      <header className="shop-header">
        <div className="container shop-header-inner">
          <Link to="/" className="brand" aria-label="Panda.al">
            <Logo /> <span>Panda<span className="brand-tld">.al</span></span>
          </Link>
          <nav className="desktop-nav">
            <NavLink to="/dyqani?kategoria=rroba">Rroba</NavLink>
            <NavLink to="/dyqani?kategoria=kepuce">Këpucë</NavLink>
            <NavLink to="/dyqani?kategoria=canta">Çanta</NavLink>
            <NavLink to="/dyqani?kategoria=portofola">Portofola</NavLink>
            <NavLink to="/gjurmo">Gjurmo porosinë</NavLink>
          </nav>
          <form className="search" onSubmit={onSearch} role="search">
            <Icon name="search" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kërko produkte…" aria-label="Kërko" />
          </form>
          <Link to="/shporta" className="cart-link" aria-label={`Shporta, ${count} artikuj`}>
            <Icon name="bag" />
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </div>
      </header>

      <main className="shop-main">
        <Outlet />
      </main>

      <footer className="shop-footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand"><Logo /> <span>Panda<span className="brand-tld">.al</span></span></Link>
            <p className="muted">Rroba, këpucë, çanta dhe portofola me çmime të mira. Çdo produkt kontrollohet në magazinën tonë para se të niset.</p>
            <InstallButton />
          </div>
          <div>
            <h4>Dyqani</h4>
            <Link to="/dyqani">Të gjitha produktet</Link>
            <Link to="/gjurmo">Gjurmo porosinë</Link>
            <Link to="/info">Dërgesa dhe kthimet</Link>
          </div>
          <div>
            <h4>Kontakt</h4>
            {WHATSAPP && <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>}
            <span className="muted">© {new Date().getFullYear()} Panda.al</span>
          </div>
        </div>
      </footer>

      <nav className="bottom-nav" aria-label="Navigimi kryesor">
        <NavLink to="/" end><Icon name="home" /><span>Kryefaqja</span></NavLink>
        <NavLink to="/dyqani"><Icon name="grid" /><span>Dyqani</span></NavLink>
        <NavLink to="/shporta">
          <span className="icon-wrap"><Icon name="bag" />{count > 0 && <span className="badge">{count}</span>}</span>
          <span>Shporta</span>
        </NavLink>
        <NavLink to="/gjurmo"><Icon name="truck" /><span>Porositë</span></NavLink>
      </nav>

      {WHATSAPP && (
        <a className="wa-float" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="Na shkruani në WhatsApp">
          <Icon name="whatsapp" size={26} />
        </a>
      )}
    </div>
  );
}
