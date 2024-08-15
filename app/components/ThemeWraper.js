'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ThemeWrapper({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Función para resetear el tema a 'light'
    const resetTheme = () => {
      document.documentElement.classList.remove('dark');
    };

    // Escuchar los cambios de ruta
    router.events.on('routeChangeStart', resetTheme);

    // Limpiar el listener al desmontar el componente
    return () => {
      router.events.off('routeChangeStart', resetTheme);
    };
  }, [router]);

  return <>{children}</>;
}
