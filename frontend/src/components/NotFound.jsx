import React from 'react';

import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Página no encontrada | Melofilia');

  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-4 text-center font-['Outfit']">
      <div className="text-amber-500 mb-6">
        <svg className="w-32 h-32 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-2xl text-slate-300 mb-8 max-w-md">Lo sentimos, parece que esta melodía se ha perdido en el espacio.</p>
      <a 
        href="/" 
        className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-lg transition-all transform hover:scale-105"
      >
        Volver al Inicio
      </a>
    </div>
  );
}
