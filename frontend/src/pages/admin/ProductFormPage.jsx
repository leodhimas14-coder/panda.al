import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { CATEGORY_LABEL, GENDER_LABEL, lek } from '../../lib/format';

const EMPTY = {
  name: '', category: 'rroba', gender: 'unisex', description: '', images: [''], price: '', compareAtPrice: '',
  variants: [], supplier: { name: '', url: '', costCny: '' }, featured: false, active: true,
};

const CNY_TO_ALL = 13; // only for the margin hint; the server's CNY_TO_ALL is used for reports

export default function ProductFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'i-ri';
  const navigate = useNavigate();
  const [form, setForm] = useState(isNew ? EMPTY : null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [bulk, setBulk] = useState({ sizes: '', colors: '' });

  useEffect(() => {
    if (isNew) return;
    api(`/admin/products/${id}`, { auth: true })
      .then(({ product }) => setForm({ ...EMPTY, ...product, images: product.images.length ? product.images : [''] }))
      .catch((e) => setError(e.message));
  }, [id, isNew]);

  if (!form) return error ? <div className="alert alert-error">{error}</div> : <p className="muted">Duke u ngarkuar…</p>;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setSupplier = (key) => (e) => setForm((f) => ({ ...f, supplier: { ...f.supplier, [key]: e.target.value } }));
  const setImage = (i, value) => setForm((f) => ({ ...f, images: f.images.map((x, j) => (j === i ? value : x)) }));
  const setVariant = (i, key, value) => setForm((f) => ({ ...f, variants: f.variants.map((v, j) => (j === i ? { ...v, [key]: value } : v)) }));

  // "S, M, L" × "E zezë, E bardhë" → one variant per combination, keeping existing stock.
  const generateVariants = () => {
    const split = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
    const sizes = split(bulk.sizes);
    const colors = split(bulk.colors);
    const combos = (sizes.length ? sizes : ['']).flatMap((size) => (colors.length ? colors : ['']).map((color) => ({ size, color })));
    setForm((f) => ({
      ...f,
      variants: combos.filter((c) => c.size || c.color).map((c) => f.variants.find((v) => v.size === c.size && v.color === c.color) || { ...c, stock: 0 }),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      images: form.images.filter(Boolean),
      variants: form.variants.map((v) => ({ ...v, stock: Number(v.stock) || 0 })),
      supplier: { ...form.supplier, costCny: Number(form.supplier.costCny) || 0 },
    };
    try {
      if (isNew) await api('/admin/products', { method: 'POST', auth: true, body });
      else await api(`/admin/products/${id}`, { method: 'PUT', auth: true, body });
      navigate('/admin/produktet');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cost = (Number(form.supplier.costCny) || 0) * CNY_TO_ALL;
  const margin = Number(form.price) - cost;

  return (
    <form className="form" onSubmit={onSubmit}>
      <Link to="/admin/produktet" className="back-link">← Produktet</Link>
      <h1 className="admin-title">{isNew ? 'Produkt i ri' : form.name}</h1>

      <section className="card form">
        <label>Emri<input required value={form.name} onChange={set('name')} /></label>
        <div className="form-row">
          <label>Kategoria
            <select value={form.category} onChange={set('category')}>
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Për kë
            <select value={form.gender} onChange={set('gender')}>
              {Object.entries(GENDER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Çmimi (L)<input required type="number" min="0" value={form.price} onChange={set('price')} /></label>
          <label>Çmimi i vjetër (L)<input type="number" min="0" value={form.compareAtPrice ?? ''} onChange={set('compareAtPrice')} placeholder="opsionale" /></label>
        </div>
        <label>Përshkrimi<textarea rows={3} value={form.description} onChange={set('description')} /></label>
        <div className="row">
          <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Shfaqe në kryefaqe</label>
          <label className="check"><input type="checkbox" checked={form.active} onChange={set('active')} /> Aktiv në dyqan</label>
        </div>
      </section>

      <section className="card form">
        <h3>Fotot</h3>
        <p className="muted small">Ngjitni linkun e çdo fotoje (p.sh. nga Cloudinary ose Google Drive publik). Fotoja e parë është kryesorja.</p>
        {form.images.map((src, i) => (
          <div className="row" key={i}>
            {src && <img src={src} alt="" className="img-preview" />}
            <input className="grow" value={src} onChange={(e) => setImage(i, e.target.value)} placeholder="https://…" />
            <button type="button" className="icon-btn" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost" onClick={() => setForm((f) => ({ ...f, images: [...f.images, ''] }))}>+ Shto foto</button>
      </section>

      <section className="card form">
        <h3>Masat dhe ngjyrat</h3>
        <p className="muted small">"Stok AL" = copë që i ke tashmë në Shqipëri. Me 0, produkti porositet nga Kina.</p>
        <div className="form-row">
          <label>Masat (me presje)<input value={bulk.sizes} onChange={(e) => setBulk((b) => ({ ...b, sizes: e.target.value }))} placeholder="S, M, L, XL" /></label>
          <label>Ngjyrat (me presje)<input value={bulk.colors} onChange={(e) => setBulk((b) => ({ ...b, colors: e.target.value }))} placeholder="E zezë, E bardhë" /></label>
          <button type="button" className="btn btn-ghost align-end" onClick={generateVariants}>Krijo kombinimet</button>
        </div>
        {form.variants.length > 0 && (
          <div className="table-wrap"><table className="table compact">
            <thead><tr><th>Masa</th><th>Ngjyra</th><th>Stok AL</th><th /></tr></thead>
            <tbody>
              {form.variants.map((v, i) => (
                <tr key={v._id || i}>
                  <td><input value={v.size} onChange={(e) => setVariant(i, 'size', e.target.value)} /></td>
                  <td><input value={v.color} onChange={(e) => setVariant(i, 'color', e.target.value)} /></td>
                  <td><input type="number" min="0" value={v.stock} onChange={(e) => setVariant(i, 'stock', e.target.value)} /></td>
                  <td><button type="button" className="icon-btn" onClick={() => setForm((f) => ({ ...f, variants: f.variants.filter((_, j) => j !== i) }))}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => setForm((f) => ({ ...f, variants: [...f.variants, { size: '', color: '', stock: 0 }] }))}>+ Shto variant</button>
      </section>

      <section className="card form">
        <h3>Furnitori (nuk shfaqet te klientët)</h3>
        <div className="form-row">
          <label>Emri i furnitorit<input value={form.supplier.name} onChange={setSupplier('name')} /></label>
          <label>Çmimi i blerjes (¥)<input type="number" min="0" step="0.01" value={form.supplier.costCny} onChange={setSupplier('costCny')} /></label>
        </div>
        <label>Linku (1688 / Alibaba / WeChat)<input value={form.supplier.url} onChange={setSupplier('url')} placeholder="https://detail.1688.com/…" /></label>
        {Number(form.price) > 0 && cost > 0 && (
          <p className="small">Kosto ≈ {lek(cost)} · Fitimi bruto ≈ <b>{lek(margin)}</b> ({Math.round((margin / Number(form.price)) * 100)}%) para kargos dhe korrierit</p>
        )}
      </section>

      {error && <div className="alert alert-error">{error}</div>}
      <div className="row sticky-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Po ruhet…' : 'Ruaj produktin'}</button>
        <Link to="/admin/produktet" className="btn btn-ghost">Anulo</Link>
      </div>
    </form>
  );
}
