import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('melofilia_cookies_accepted');
    if (!accepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('melofilia_cookies_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-slate-900 border-t border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-['Outfit']">
        <div className="text-slate-300 text-sm flex-1">
          Usamos cookies (propias y de terceros, como Vercel Analytics) para garantizar el funcionamiento de la plataforma y mejorar tu experiencia. Al continuar navegando, aceptas nuestra{' '}
          <a href="/privacy" className="text-amber-500 hover:underline">
            Política de Privacidad
          </a>.
        </div>
        <button
          onClick={acceptCookies}
          className="w-full md:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors whitespace-nowrap"
        >
          Aceptar y Cerrar
        </button>
      </div>
    </div>
  );
}
