import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, HelpCircle, Music2, Clock, FileText } from 'lucide-react';
import MarketingSongPlayer from './MarketingSongPlayer';

export default function AudioHero({ onStartCreating, onHowItWorks }) {
  return (
    <div className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Value Proposition Header */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-violet-600/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Melofilia · Una marca del grupo Drop It Co</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.12]">
            Tu historia puede convertirse <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              en una canción.
            </span>
          </h1>

          {/* Subtitle with exact new service rules */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            Convertimos tus recuerdos, aniversarios, amores y celebraciones en música de estudio. <strong>Revisas y apruebas la letra</strong> antes de producir, <strong>recibes 2 canciones terminadas</strong> para elegir tu favorita y la tienes lista en <strong>máximo 48 horas</strong> (¡con entregas express desde 3 horas!).
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onStartCreating}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
            >
              <span>CREAR MI CANCIÓN</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onHowItWorks}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#181b2a] hover:bg-[#202438] text-slate-200 border border-[#262a40] font-semibold text-sm transition-all"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>CÓMO FUNCIONA</span>
            </button>
          </div>

        </div>

        {/* Marketing Song Player: Listen to the explanatory song in multiple styles */}
        <div className="max-w-4xl mx-auto">
          <MarketingSongPlayer onStartCreating={onStartCreating} />
        </div>

      </div>
    </div>
  );
}
