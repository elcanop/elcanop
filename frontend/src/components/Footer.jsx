import React from 'react';
import { Music, ShieldCheck, Heart, Lock, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#090a0f] border-t border-[#262a40] text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#262a40]/60">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Music className="w-5 h-5 text-black" />
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-white">
                Melofilia
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Plataforma de producción musical personalizada en Colombia. Transformamos tus anécdotas y emociones en canciones originales con calidad de estudio.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-400" /> Pagos cifrados</span>
              <span>•</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Mercado Pago COP</span>
              <span>•</span>
              <span>1 Corrección incluida</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3 text-sm">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Explorar</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-amber-400 transition-colors">
                  Inicio y Demos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('crear')} className="hover:text-amber-400 transition-colors">
                  Crear Canción Personalizada
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pedido')} className="hover:text-amber-400 transition-colors">
                  Rastrear y Descargar Pedido
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-violet-400 transition-colors flex items-center gap-1">
                  Consola de Producción <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Support */}
          <div className="space-y-3 text-sm">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Contacto & Soporte</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">hola@melofilia.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">+57 300 000 0000 (Colombia)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-2">
              Atención personalizada de Lunes a Sábado para coordinar tu entrega y corrección.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Melofilia. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            Hecho con <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> y pasión musical.
          </div>
        </div>

      </div>
    </footer>
  );
}
