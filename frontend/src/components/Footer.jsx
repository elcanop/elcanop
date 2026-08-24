import React from 'react';
import { Music, Heart, Mail, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

export default function Footer({ onOpenContact, onNavigate }) {
  return (
    <footer className="border-t border-[#1f2335] bg-[#090a0f] text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Brand Col */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black font-extrabold text-sm">
              M
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Melofilia
            </span>
          </div>
          <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
            Plataforma de producción musical personalizada de alta fidelidad. Convertimos historias reales, recuerdos y sentimientos en canciones memorables de estudio.
          </p>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Melofilia es un producto original del grupo Drop It Co</span>
          </div>
        </div>

        {/* Links Col */}
        <div className="space-y-2.5">
          <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
            Navegación
          </span>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('landing')} className="hover:text-amber-300 transition-colors">
                Inicio & Demos
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('create')} className="hover:text-amber-300 transition-colors">
                Crear mi Canción
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('tracker')} className="hover:text-amber-300 transition-colors">
                Consultar Pedido
              </button>
            </li>
            <li>
              <button onClick={onOpenContact} className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-amber-400" />
                <span>Buzón & Cotizaciones</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Contact & Discreet Email (Section 36) */}
        <div className="space-y-2.5">
          <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
            Contacto Directo
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Para dudas previas a la compra, cotizaciones especiales o soporte de entrega:
          </p>
          <div className="pt-1">
            <a
              href="mailto:elcanop.dropit@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 transition-colors font-mono"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>elcanop.dropit@gmail.com</span>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-[#181b2a] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} Drop It Co · Melofilia. Música hecha a partir de historias que importan.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mercado Pago SSL 256-bit</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span>1 Ronda de Corrección</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span>Bóveda 7 Días</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
