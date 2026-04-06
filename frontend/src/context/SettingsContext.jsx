import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const DEFAULTS = {
  darkMode: false,
  accentColor: 'indigo',
  fontSize: 'medium',
  compactMode: false,
  notifications: true,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem('fe_settings');
      return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  useEffect(() => {
    localStorage.setItem('fe_settings', JSON.stringify(settings));
    const root = document.documentElement;
    settings.darkMode ? root.classList.add('dark') : root.classList.remove('dark');
    root.dataset.accent = settings.accentColor;
    root.dataset.font   = settings.fontSize;
  }, [settings]);

  const update = (key, val) => setSettings(p => ({ ...p, [key]: val }));
  const reset  = () => setSettings(DEFAULTS);

  return (
    <SettingsContext.Provider value={{ settings, update, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
