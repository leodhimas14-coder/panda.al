import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

// Shown until /api/config answers; mirrors the server defaults.
const DEFAULTS = {
  categories: [],
  homeBanner: { url: '', posterUrl: '', link: '' },
  promoBar: { enabled: true, text: '' },
  shipping: { fee: 300, freeFrom: 6000, localText: '1–3 ditë pune', chinaText: '10–18 ditë' },
  payments: { card: true, cod: false },
  contact: { whatsapp: '', phone: '', email: '' },
};
const ConfigContext = createContext({ ...DEFAULTS, reload: () => {} });

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULTS);
  const reload = useCallback(() => api('/config').then((c) => setConfig({ ...DEFAULTS, ...c })).catch(() => {}), []);
  useEffect(() => { reload(); }, [reload]);
  return <ConfigContext.Provider value={{ ...config, reload }}>{children}</ConfigContext.Provider>;
}

export const useConfig = () => useContext(ConfigContext);

/** Shipping for a cart subtotal. freeFrom 0 means shipping is never free. */
export const shippingFor = (subtotal, shipping) =>
  (shipping.freeFrom > 0 && subtotal >= shipping.freeFrom ? 0 : shipping.fee);
