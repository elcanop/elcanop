import React, { useState, useEffect } from 'react';
import { Play, Square, Sparkles, Disc, CheckCircle2, ArrowRight, Music2, Radio, Heart, Award, HelpCircle } from 'lucide-react';
import { synth } from '../utils/audioSynth';

export default function AudioHero({ onStartCreating, onHowItWorks }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('balada');
  const [activeStep, setActiveStep] = useState(0);

  const genres = [
    { id: 'balada', name: 'Balada Pop', mood: 'Emotiva y Romántica', tempo: '85 BPM' },
    { id: 'urbano', name: 'Urbano / Reggaetón', mood: 'Pegajosa y Moderna', tempo: '96 BPM' },
    { id: 'pop', name: 'Pop Latino', mood: 'Alegre y Brillante', tempo: '115 BPM' },
    { id: 'vallenato', name: 'Vallenato Romántico', mood: 'Sentido y Tradicional', tempo: '90 BPM' },
    { id: 'rock', name: 'Rock Acústico', mood: 'Orgánico y Potente', tempo: '120 BPM' },
    { id: 'bolero', name: 'Bolero / Bachata', mood: 'Íntimo y Clásico', tempo: '82 BPM' },
  ];

  const handlePlayToggle = (genreId = selectedGenre) => {
    if (isPlaying && selectedGenre === genreId) {
      synth.stop();
      setIsPlaying(false);
    } else {
      setSelectedGenre(genreId);
      setIsPlaying(true);
      synth.playChordProgression(genreId, (step) => {
        setActiveStep(step);
      });
    }
  };

  useEffect(() => {
    return () => {
      synth.stop();
    };
  }, []);

  return (
    <div className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-32">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Tag / Badge with Drop It Co */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-violet-600/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Melofilia · Una marca del grupo Drop It Co</span>
            </div>

            {/* Main Headline strictly from spec */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.12]">
              Tu historia puede convertirse <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                en una canción.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Convertimos personas, recuerdos, aniversarios, sentimientos y celebraciones en canciones memorables con producción musical de estudio. Grabaciones opcionales, 1 corrección incluida y entrega en 48–72h.
            </p>

            {/* Highlights List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#12141e]/90 border border-[#262a40]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">1 Corrección incluida</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#12141e]/90 border border-[#262a40]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Grabación 100% opcional</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#12141e]/90 border border-[#262a40]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Pago seguro Mercado Pago</span>
              </div>
            </div>

            {/* CTAs strictly named as in spec: CREAR MI CANCIÓN and CÓMO FUNCIONA */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
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

          {/* Right Column: Interactive Studio Visualizer */}
          <div className="lg:col-span-5">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181b2a] to-[#10121b] border border-[#262a40] shadow-2xl shadow-black/50">
              
              {/* Header inside player */}
              <div className="flex items-center justify-between pb-6 border-b border-[#262a40]/80">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
                    <Disc className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      Estudio Melofilia
                      {isPlaying && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">Selector musical interactivo</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-[#262a40] text-[11px] font-mono text-amber-300 font-semibold">
                  {isPlaying ? 'REPRODUCIENDO' : 'LISTO'}
                </span>
              </div>

              {/* Genre Selector Pills */}
              <div className="py-6 space-y-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Explora estilos musicales:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genres.map((g) => {
                    const isCurrent = selectedGenre === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => handlePlayToggle(g.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                            : 'bg-[#12141e] border-[#262a40] text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-100">{g.name}</div>
                          <div className="text-[10px] text-slate-400">{g.mood}</div>
                        </div>
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-0.5 bg-amber-400 animate-pulse h-full"></span>
                            <span className="w-0.5 bg-amber-400 animate-pulse h-2" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-0.5 bg-amber-400 animate-pulse h-3" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        ) : (
                          <Radio className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400' : 'text-slate-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Waveform Visualizer */}
              <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>CANAL STEREO</span>
                  <span className="text-amber-400">{genres.find(g => g.id === selectedGenre)?.tempo}</span>
                </div>

                {/* Animated Bars */}
                <div className="h-16 flex items-center justify-between gap-1 px-1">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const heightPercent = isPlaying
                      ? Math.max(15, Math.min(100, Math.sin((i + activeStep * 3) * 0.8) * 45 + 50 + (i % 3) * 10))
                      : 20 + (i % 5) * 5;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          isPlaying 
                            ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'bg-[#262a40]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    );
                  })}
                </div>

                {/* Player bar */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handlePlayToggle(selectedGenre)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                  >
                    {isPlaying ? <Square className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                    <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
                  </button>
                  <span className="text-xs text-slate-400">Sintetizador Web Audio API</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
