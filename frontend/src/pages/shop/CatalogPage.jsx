import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { useApi } from '../../lib/useApi';
import { qs, } from '../../lib/api';
import { CATEGORY_LABEL } from '../../lib/format';

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('kategoria') || '';
  const q = params.get('q') || '';
  const sort = params.get('rendit') || '';
  const page = Number(params.get('faqja')) || 1;

  const { data, loading, error } = useApi(`/products${qs({ category, q, sort, page, limit: 24 })}`);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'faqja') next.delete('faqja');
    setParams(next);
  };

  const title = q ? `Rezultatet për "${q}"` : CATEGORY_LABEL[category] || 'Të gjitha produktet';

  return (
    <div className="container section">
      <h1 className="page-title">{title}</h1>
      <div className="filters">
        <div className="chips">
          <button type="button" className={`chip ${!category ? 'active' : ''}`} onClick={() => update('kategoria', '')}>Të gjitha</button>
          {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
            <button type="button" key={key} className={`chip ${category === key ? 'active' : ''}`} onClick={() => update('kategoria', key)}>{label}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => update('rendit', e.target.value)} aria-label="Rendit">
          <option value="">Më të rejat</option>
          <option value="cmimi-ulet">Çmimi: nga më i ulëti</option>
          <option value="cmimi-larte">Çmimi: nga më i larti</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error.message}</div>}
      <div className="product-grid">
        {loading
          ? Array.from({ length: 8 }, (_, i) => <div key={i} className="product-card skeleton" />)
          : data?.products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
      {!loading && data?.products.length === 0 && <p className="empty">Nuk u gjet asnjë produkt.</p>}

      {data?.pages > 1 && (
        <div className="pagination">
          <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => update('faqja', String(page - 1))}>← Para</button>
          <span>{page} / {data.pages}</span>
          <button type="button" className="btn btn-ghost" disabled={page >= data.pages} onClick={() => update('faqja', String(page + 1))}>Pas →</button>
        </div>
      )}
    </div>
  );
}
