import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useConfig } from '../../context/ConfigContext';
import HomeBanner, { isVideo } from '../../components/HomeBanner';

const EMPTY = { url: '', posterUrl: '', link: '' };

export default function HomeSettingsPage() {
  const { reload } = useConfig();
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/admin/settings', { auth: true })
      .then(({ settings }) => setForm({ ...EMPTY, ...settings.homeBanner }))
      .catch((e) => setMsg(e.message));
  }, []);

  if (!form) return msg ? <div className="alert alert-error">{msg}</div> : <p className="muted">Duke u ngarkuar…</p>;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (banner) => {
    setBusy(true);
    setMsg('');
    try {
      const { settings } = await api('/admin/settings', { method: 'PUT', auth: true, body: { homeBanner: banner } });
      setForm({ ...EMPTY, ...settings.homeBanner });
      reload();
      setMsg(settings.homeBanner.url ? 'U ruajt. Kryefaqja u përditësua ✓' : 'Banneri u hoq nga kryefaqja ✓');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form">
      <h1 className="admin-title">Kryefaqja</h1>
      <section className="card form">
        <h3>Video ose foto në krye të faqes</h3>
        <p className="muted small">
          Ngjit linkun e videos (.mp4) ose të fotos. Videoja luhet vetë, pa zë, në përsëritje.
          Për telefon, përdor video vertikale (4:5) dhe sa më të lehtë (nën 10 MB).
          Lëre bosh që të mos shfaqet asgjë.
        </p>
        <label>Linku i videos ose fotos<input id="banner-url" value={form.url} onChange={set('url')} placeholder="https://…/koleksioni.mp4" /></label>
        {isVideo(form.url) && (
          <label>Foto që shfaqet derisa ngarkohet videoja (opsionale)<input id="banner-poster" value={form.posterUrl} onChange={set('posterUrl')} placeholder="https://…/kopertina.jpg" /></label>
        )}
        <label>Ku të shkojë kur e shtypin (opsionale)<input id="banner-link" value={form.link} onChange={set('link')} placeholder="/dyqani?oferta=1" /></label>

        <div className="banner-preview">
          {form.url ? <HomeBanner banner={form} /> : <span className="muted small">Pa banner: kryefaqja fillon direkt me kategoritë.</span>}
        </div>

        <div className="row">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save(form)}>Ruaj</button>
          {form.url && <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => save(EMPTY)}>Hiqe bannerin</button>}
          {msg && <span className="small">{msg}</span>}
        </div>
      </section>
    </div>
  );
}
