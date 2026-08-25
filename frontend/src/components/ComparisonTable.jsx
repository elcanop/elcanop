import React from 'react';
import { Check, Sparkles, Zap, ArrowRight, Tag, Clock, FileText, Music2 } from 'lucide-react';

export default function ComparisonTable({ onSelectTier, pricing }) {
  const express = pricing?.express || {
    regular_price: 160000,
    current_price: 120000,
    discount_enabled: true,
    discount_badge: '25% OFF',
    delivery_hours: 24
  };

  const semiPro = pricing?.semi_pro || {
    regular_price: 350000,
    current_price: 280000,
    discount_enabled: true,
    discount_badge: '20% OFF',
    delivery_hours: 24
  };

  return (
    <section className="py-20 bg-[#0c0e15] border-y border-[#262a40]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuestros 2 Niveles de Producción</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Elige el formato perfecto para tu historia
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Sin suscripciones ni letras chicas. Ambos planes incluyen <strong>revisión previa de letra</strong>, entrega de <strong>2 canciones terminadas</strong> y plazo de entrega en <strong>máximo 24 horas</strong> (desde 3h express).
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Plan 1: EXPRESS */}
          <div className="relative p-8 rounded-3xl bg-[#12141e] border border-[#262a40] flex flex-col justify-between hover:border-slate-600 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-lg bg-[#181b2a] text-slate-300 text-xs font-bold uppercase tracking-wider border border-[#262a40]">
                  Opción Ágil
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Máx. 24h (desde 3h)
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-2">Express</h3>
              <p className="text-sm text-slate-400 mb-6">
                Ideal para detalles espontáneos, cumpleaños y sorpresas directas al corazón.
              </p>

              {/* Price Display with Discount Simulation */}
              <div className="mb-8 pb-6 border-b border-[#262a40] space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                    ${(express.current_price || 120000).toLocaleString('es-CO')}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">COP</span>
                </div>

                {express.discount_enabled && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-500 line-through font-mono">
                      ${(express.regular_price || 160000).toLocaleString('es-CO')} COP
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Tag className="w-3 h-3" />
                      {express.discount_badge || '25% OFF'}
                    </span>
                  </div>
                )}
              </div>

              {/* Feature List */}
              <ul className="space-y-3.5 mb-8 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Music2 className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span><strong>2 Canciones terminadas:</strong> Recibes 2 versiones casi iguales de la misma historia</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span><strong>Revisión y Aprobación de Letra:</strong> Lees y apruebas el texto antes de grabar</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span>Audio Master en formato MP3 de alta definición</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span>Letra digital en PDF para guardar o imprimir</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span>1 Ronda de corrección garantizada</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier('EXPRESS')}
              className="w-full py-4 rounded-2xl bg-[#181b2a] hover:bg-[#202438] text-white font-bold text-sm border border-[#262a40] hover:border-slate-500 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Elegir Plan Express</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Plan 2: SEMI-PRO (Featured) */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#181a26] to-[#12141e] border-2 border-amber-500 shadow-2xl flex flex-col justify-between hover:scale-[1.01] transition-all">
            
            {/* Featured Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Más Recomendado</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                  Producción de Estudio
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Máx. 24h (desde 3h)
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-2">Semi-Pro</h3>
              <p className="text-sm text-slate-300 mb-6">
                Para aniversarios, bodas, propuestas de matrimonio y regalos de alto impacto.
              </p>

              {/* Price Display with Discount Simulation */}
              <div className="mb-8 pb-6 border-b border-[#262a40] space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                    ${(semiPro.current_price || 280000).toLocaleString('es-CO')}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">COP</span>
                </div>

                {semiPro.discount_enabled && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-500 line-through font-mono">
                      ${(semiPro.regular_price || 350000).toLocaleString('es-CO')} COP
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      <Tag className="w-3 h-3" />
                      {semiPro.discount_badge || '20% OFF'}
                    </span>
                  </div>
                )}
              </div>

              {/* Feature List */}
              <ul className="space-y-3.5 mb-8 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Music2 className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span><strong>2 Canciones terminadas:</strong> Recibes 2 versiones completas de estudio</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span><strong>Revisión y Aprobación de Letra:</strong> Ajustes de letra antes de entrar a estudio</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span>Master sin compresión en <strong>WAV Studio (24-bit / 48kHz)</strong> + MP3</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span>Carátula digital personalizada con título y dedicatoria</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span>Opción de Stems Multipista individuales (STEMS.ZIP)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier('SEMI_PRO')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Elegir Plan Semi-Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
