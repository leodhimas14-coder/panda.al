import { Link } from 'react-router-dom';
import { useApi } from '../../lib/useApi';
import { lek, CATEGORY_LABEL } from '../../lib/format';

export default function ProductsPage() {
  const { data, loading, error } = useApi('/admin/products', { auth: true });

  return (
    <div>
      <div className="admin-title-row">
        <h1 className="admin-title">Produktet</h1>
        <Link to="/admin/produktet/i-ri" className="btn btn-primary">+ Produkt i ri</Link>
      </div>
      {error && <div className="alert alert-error">{error.message}</div>}
      {loading && <p className="muted">Duke u ngarkuar…</p>}
      {data && (
        <div className="table-wrap"><table className="table">
          <thead><tr><th /><th>Emri</th><th>Kategoria</th><th className="num">Çmimi</th><th className="num">Stok AL</th><th>Statusi</th></tr></thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p._id} className={p.active ? '' : 'inactive'}>
                <td className="thumb-cell">{p.images[0] && <img src={p.images[0]} alt="" />}</td>
                <td><Link to={`/admin/produktet/${p._id}`}><b>{p.name}</b></Link>{p.featured && <span className="pill">★</span>}</td>
                <td>{CATEGORY_LABEL[p.category]}</td>
                <td className="num">{lek(p.price)}</td>
                <td className="num">{p.variants.reduce((s, v) => s + v.stock, 0)}</td>
                <td>{p.active ? 'Aktiv' : 'Fshehur'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
