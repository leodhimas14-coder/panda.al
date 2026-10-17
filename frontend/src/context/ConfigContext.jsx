import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const DEFAULTS = { shippingFee: 300, freeShippingFrom: 6000, categories: [], homeBanner: { url: '', posterUrl: '', link: '' } };
const ConfigContext = createContext({ ...DEFAULTS, reload: () => {} });

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULTS);
  const reload = useCallback(() => api('/config').then(setConfig).catch(() => {}), []);
  useEffect(() => { reload(); }, [reload]);
  return <ConfigContext.Provider value={{ ...config, reload }}>{children}</ConfigContext.Provider>;
}

export const useConfig = () => useContext(ConfigContext);
