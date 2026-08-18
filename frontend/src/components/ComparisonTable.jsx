import React from 'react';
import { Check, Sparkles, Zap, ArrowRight, Tag } from 'lucide-react';

export default function ComparisonTable({ onSelectTier, pricing }) {
  const express = pricing?.express || {
    regular_price: 160000,
    current_price: 120000,
    discount_enabled: true,
    discount_badge: '25% OFF',
    delivery_hours: 48
  };

  const semiPro = pricing?.semi_pro || {
    regular_price: 350000,
    current_price: 280000,
    discount_enabled: true,
    discount_badge: '20% OFF',
    delivery_hours: 72
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
            Sin suscripciones ni letras chicas. Cada compra genera un pedido único, seguimiento privado y una ronda de corrección garantizada.
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
                  <Zap className="w-3.5 h-3.5" /> Entrega en {express.delivery_hours || 48}h
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-2">Express</h3>
              <p className="text-sm text-slate-400 mb-6">
                Ideal para detalles espontáneos, cumpleaños y sorpresas directas al corazón.
              </p>

              {/* Price Display with Discount Simulation */}
              <div className="mb-8 pb-6 border-b border-[#262a40] space-y-1">
                {express.discount_enabled && (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-slate-500 font-mono text-sm">
                      ${express.regular_price?.toLocaleString('es-CO')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {express.discount_badge || 'OFERTA'}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-extrabold text-white">
                    ${express.current_price?.toLocaleString('es-CO')}
                  </span>
                  <span className="text-sm font-medium text-slate-400">COP</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Letra 100% personalizada con tus datos y anécdotas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Producción musical completa en tu género elegido</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Master final en archivo <strong>MP3 de alta fidelidad (320kbps)</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1 ronda de corrección</strong> de letra o mezcla incluida</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bóveda privada de descarga válida por 7 días</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier('EXPRESS')}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-white border border-[#262a40] font-bold text-sm transition-all"
            >
              <span>Elegir Plan Express</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Plan 2: SEMI-PRO (Destacado) */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#1c1a2e] to-[#12141e] border-2 border-amber-500/60 flex flex-col justify-between shadow-2xl shadow-amber-500/10">
            {/* Top Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black uppercase tracking-wider shadow-md">
              Más Recomendado
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                  Estudio Avanzado
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <Zap className="w-3.5 h-3.5" /> Entrega en {semiPro.delivery_hours || 72}h
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-2">Semi-Pro</h3>
              <p className="text-sm text-slate-300 mb-6">
                Para aniversarios, bodas y homenajes memorables con arreglos multicapa y máxima fidelidad.
              </p>

              {/* Price Display with Discount Simulation */}
              <div className="mb-8 pb-6 border-b border-[#262a40] space-y-1">
                {semiPro.discount_enabled && (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-slate-500 font-mono text-sm">
                      ${semiPro.regular_price?.toLocaleString('es-CO')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {semiPro.discount_badge || 'OFERTA'}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-extrabold text-white">
                    ${semiPro.current_price?.toLocaleString('es-CO')}
                  </span>
                  <span className="text-sm font-medium text-slate-400">COP</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Composición detallada</strong> con rimas y métrica artesanal</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Arreglos instrumentales enriquecidos con mayor profundidad</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Entrega de Master en <strong>MP3 + WAV Studio sin compresión (24-bit)</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>PDF de Letra oficial</strong> lista para imprimir + Carátula digital</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>1 ronda de corrección</strong> incluida y garantizada</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Opción de adquirir los <strong>Stems en ZIP</strong> (+ ${pricing?.stems_addon?.current_price?.toLocaleString('es-CO') || '50.000'} COP)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier('SEMI_PRO')}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
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
