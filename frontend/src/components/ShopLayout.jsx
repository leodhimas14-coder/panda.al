import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import InstallButton from './InstallButton';
import MenuDrawer from './MenuDrawer';
import SearchOverlay from './SearchOverlay';
import DemoBar from './DemoBar';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useConfig } from '../context/ConfigContext';
import { lek } from '../lib/format';

const WHATSAPP = import.meta.env.VITE_WHATSAPP;

export default function ShopLayout() {
  const { count } = useCart();
  const { count: savedCount } = useWishlist();
  const { freeShippingFrom } = useConfig();
  const { pathname, search } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const headerRef = useRef(null);

  // The menu sits right under the header. Measure where the header ends
  // (it moves as the banners above it scroll away) instead of relying on CSS,
  // which iPhone Safari gets wrong for fixed panels inside a sticky header.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const measure = () => setMenuTop(Math.max(0, headerRef.current?.getBoundingClientRect().bottom ?? 0));
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, [menuOpen]);

  // Close overlays whenever the page changes.
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname, search]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <div className="shop">
      <DemoBar />
      <div className="promo-bar">Transport falas mbi {lek(freeShippingFrom)} · Pagesë në dorëzim në gjithë Shqipërinë</div>
      <header className="shop-header" ref={headerRef}>
        <div className="container shop-header-inner">
          <div className="header-side">
            <button type="button" className="header-icon" onClick={() => { setSearchOpen(false); setMenuOpen((o) => !o); }} aria-label={menuOpen ? 'Mbyll menunë' : 'Hap menunë'} aria-expanded={menuOpen}>
              <Icon name={menuOpen ? 'x' : 'menu'} />
            </button>
            <button type="button" className="header-icon" onClick={() => { setMenuOpen(false); setSearchOpen(true); }} aria-label="Kërko">
              <Icon name="search" />
            </button>
          </div>

          <Link to="/" className="wordmark" aria-label="Panda.al, kryefaqja">PANDA</Link>

          <div className="header-side right">
            <Link to="/llogaria" className="header-icon" aria-label="Llogaria ime"><Icon name="user" /></Link>
            <Link to="/te-ruajturat" className="header-icon" aria-label={`Të ruajturat, ${savedCount}`}>
              <Icon name="heart" />
              {savedCount > 0 && <span className="badge badge-soft">{savedCount}</span>}
            </Link>
            <Link to="/shporta" className="header-icon" aria-label={`Shporta, ${count} artikuj`}>
              <Icon name="bag" />
              {count > 0 && <span className="badge">{count}</span>}
            </Link>
          </div>
        </div>
      </header>
      <MenuDrawer open={menuOpen} onClose={closeMenu} top={menuTop} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />

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
            <Link to="/dyqani?gjinia=femra">Femra</Link>
            <Link to="/dyqani?gjinia=meshkuj">Meshkuj</Link>
            <Link to="/dyqani?gjinia=femije">Fëmijë</Link>
            <Link to="/dyqani?oferta=1">Ofertat</Link>
          </div>
          <div>
            <h4>Ndihmë</h4>
            <Link to="/llogaria">Llogaria ime</Link>
            <Link to="/gjurmo">Gjurmo porosinë</Link>
            <Link to="/info">Dërgesa dhe kthimet</Link>
            {WHATSAPP && <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          </div>
        </div>
        <div className="container muted small footer-copy">© {new Date().getFullYear()} Panda.al</div>
      </footer>

      {WHATSAPP && (
        <a className="wa-float" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="Na shkruani në WhatsApp">
          <Icon name="whatsapp" size={26} />
        </a>
      )}
    </div>
  );
}
