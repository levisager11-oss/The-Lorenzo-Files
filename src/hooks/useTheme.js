import { useState, useEffect } from 'react';

export default function useTheme() {
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', lightMode ? 'light' : 'dark');
    localStorage.setItem('theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  return [lightMode, () => setLightMode(v => !v)];
}
