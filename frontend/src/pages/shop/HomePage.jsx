import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import InstallButton from '../../components/InstallButton';
import { useApi } from '../../lib/useApi';

const CATEGORIES = [
  { key: 'rroba', label: 'Rroba', emoji: '👕' },
  { key: 'kepuce', label: 'Këpucë', emoji: '👟' },
  { key: 'canta', label: 'Çanta', emoji: '👜' },
  { key: 'portofola', label: 'Portofola', emoji: '👛' },
  { key: 'aksesore', label: 'Aksesorë', emoji: '🧢' },
];

export default function HomePage() {
  const featured = useApi('/products?featured=1&limit=8');
  const latest = useApi('/products?limit=8');

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Koleksioni i ri</p>
          <h1>Stil i ri çdo javë,<br />me çmime që të pëlqejnë.</h1>
          <p className="hero-sub">Rroba, këpucë, çanta dhe portofola. Porosit sot, paguaj kur të vjen në derë.</p>
          <div className="hero-actions">
            <Link to="/dyqani" className="btn btn-primary btn-lg">Bli tani</Link>
            <InstallButton className="btn btn-outline-light btn-lg" />
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="category-row">
          {CATEGORIES.map((c) => (
            <Link key={c.key} to={`/dyqani?kategoria=${c.key}`} className="category-chip">
              <span className="category-emoji" aria-hidden="true">{c.emoji}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <ProductSection title="Më të pëlqyerat" state={featured} />

      <section className="container section perks">
        <div><strong>💵 Pagesë në dorëzim</strong><span>Paguan vetëm kur e merr porosinë.</span></div>
        <div><strong>🔍 Kontroll cilësie</strong><span>Çdo artikull kontrollohet para nisjes.</span></div>
        <div><strong>📦 Gjurmim i porosisë</strong><span>E di gjithmonë ku ndodhet pakoja.</span></div>
      </section>

      <ProductSection title="Të rejat" state={latest} link="/dyqani" />
    </>
  );
}

function ProductSection({ title, state, link }) {
  const products = state.data?.products || [];
  if (!state.loading && products.length === 0) return null;
  return (
    <section className="container section">
      <div className="section-head">
        <h2>{title}</h2>
        {link && <Link to={link}>Shiko të gjitha →</Link>}
      </div>
      <div className="product-grid">
        {state.loading
          ? Array.from({ length: 4 }, (_, i) => <div key={i} className="product-card skeleton" />)
          : products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
