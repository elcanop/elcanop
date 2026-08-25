import React from 'react';
import { Music, Sparkles, Search, PlusCircle, MessageSquare } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentOrderNumber, onOpenContact }) {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#090a0f]/85 border-b border-[#262a40] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Melofilia · Drop It Co */}
          <button 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <img src="/logo.png" alt="Melofilia by Drop It Co" className="h-10 sm:h-12 w-auto group-hover:scale-[1.02] transition-transform drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
          </button>

          {/* Public Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-[#12141e] p-1.5 rounded-full border border-[#262a40]">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'landing'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Explorar
            </button>

            <button
              onClick={() => setActiveTab('crear')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'crear'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Crear Canción
            </button>

            <button
              onClick={() => setActiveTab('pedido')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'pedido'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              Consultar Pedido
              {currentOrderNumber && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={onOpenContact}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-amber-300 hover:bg-white/5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              Buzón
            </button>
          </div>

          {/* Primary Action CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('crear')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Empezar mi Canción</span>
              <span className="sm:hidden">Crear</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
