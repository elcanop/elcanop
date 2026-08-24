import React, { useState, useEffect } from 'react';
import { Play, Square, Sparkles, Heart, Disc, Radio, ArrowRight, UserCheck, Star, Volume2 } from 'lucide-react';
import { synth } from '../utils/audioSynth';

export default function AudioShowcase({ onStartCreatingWithGenre }) {
  const [playingId, setPlayingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeStep, setActiveStep] = useState(0);

  const demoTracks = [
    {
      id: 'demo-1',
      title: 'A Través de Ti',
      genre: 'Balada Pop',
      synthGenre: 'balada',
      occasion: 'Aniversario 5 Años',
      category: 'ANIVERSARIO',
      dedicatedFrom: 'Luisa',
      dedicatedTo: 'Catalina',
      storySnippet: 'Se conocieron estudiando en Bogotá y luego de viajar por 4 países se comprometieron frente al mar.',
      duration: '3:45',
      tempo: '85 BPM',
      rating: 5
    },
    {
      id: 'demo-2',
      title: 'Mi Mejor Secreto',
      genre: 'Pop Latino Moderno',
      synthGenre: 'pop',
      occasion: 'Propuesta de Matrimonio',
      category: 'AMOR',
      dedicatedFrom: 'Miguel',
      dedicatedTo: 'Valentina',
      storySnippet: 'Una sorpresa en un mirador en Guatapé con la canción sonando de fondo en un picnic privado.',
      duration: '3:20',
      tempo: '115 BPM',
      rating: 5
    },
    {
      id: 'demo-3',
      title: 'Sesenta y Cinco Razones',
      genre: 'Vallenato Romántico',
      synthGenre: 'vallenato',
      occasion: 'Cumpleaños 65 de Papá',
      category: 'CUMPLEAÑOS',
      dedicatedFrom: 'Lukas y Hermanos',
      dedicatedTo: 'Don Ricardo (Papá)',
      storySnippet: 'Celebrando toda una vida de trabajo, amor de familia y recuerdos en la finca cafetera.',
      duration: '4:10',
      tempo: '90 BPM',
      rating: 5
    },
    {
      id: 'demo-4',
      title: 'Guerrera de Mis Días',
      genre: 'Bolero / Bachata',
      synthGenre: 'bolero',
      occasion: 'Homenaje a Mamá',
      category: 'HOMENAJE',
      dedicatedFrom: 'Ana María',
      dedicatedTo: 'Daniela (Mamá)',
      storySnippet: 'Reconocimiento por superar juntos los momentos difíciles con fuerza inquebrantable.',
      duration: '3:50',
      tempo: '82 BPM',
      rating: 5
    },
    {
      id: 'demo-5',
      title: 'Nuestra Vibra',
      genre: 'Urbano / Reggaetón Acústico',
      synthGenre: 'urbano',
      occasion: 'Celebración de Amistad',
      category: 'AMOR',
      dedicatedFrom: 'Pipe',
      dedicatedTo: 'Valen',
      storySnippet: 'Recordando anécdotas universitarias, conciertos y risas infinitas.',
      duration: '2:55',
      tempo: '96 BPM',
      rating: 5
    },
    {
      id: 'demo-6',
      title: 'Cuerdas de Vida',
      genre: 'Rock Acústico Orgánico',
      synthGenre: 'rock',
      occasion: 'Aniversario de Pareja',
      category: 'ANIVERSARIO',
      dedicatedFrom: 'Diego',
      dedicatedTo: 'Miriam',
      storySnippet: '22 años juntos criando a sus hijos con amor y complicidad.',
      duration: '3:30',
      tempo: '120 BPM',
      rating: 5
    }
  ];

  const handleTogglePlay = (track) => {
    if (playingId === track.id) {
      synth.stop();
      setPlayingId(null);
    } else {
      setPlayingId(track.id);
      synth.playChordProgression(track.synthGenre || 'balada', (step) => {
        setActiveStep(step);
      });
    }
  };

  useEffect(() => {
    return () => {
      synth.stop();
    };
  }, []);

  const filtered = activeFilter === 'ALL'
    ? demoTracks
    : demoTracks.filter(t => t.category === activeFilter);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Disc className="w-3.5 h-3.5 text-amber-400" />
          <span>Historias Reales Convertidas en Canciones</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Escucha cómo suena la emoción pura
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Cada canción de Melofilia es una obra única de estudio. Dale play a algunas de las historias reales que hemos producido para dedicatorias inolvidables.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: 'ALL', label: 'Todos los Demos' },
            { id: 'ANIVERSARIO', label: 'Aniversarios' },
            { id: 'AMOR', label: 'Amor & Propuestas' },
            { id: 'HOMENAJE', label: 'Homenajes' },
            { id: 'CUMPLEAÑOS', label: 'Cumpleaños' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === f.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-[#12141e] text-slate-400 border border-[#262a40] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Audio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((track) => {
          const isCurrent = playingId === track.id;
          return (
            <div
              key={track.id}
              className={`p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between ${
                isCurrent
                  ? 'bg-gradient-to-b from-[#1c1a2e] to-[#12141e] border-amber-500 shadow-xl shadow-amber-500/10'
                  : 'bg-[#12141e] border-[#262a40] hover:border-slate-600'
              }`}
            >
              
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#181b2a] text-amber-300 text-[10px] font-bold uppercase border border-[#262a40]">
                    {track.genre}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {track.duration} · {track.tempo}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                    "{track.title}"
                  </h3>
                  <div className="text-xs text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-amber-400" />
                    <span>De {track.dedicatedFrom} para {track.dedicatedTo}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {track.occasion}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#090a0f] p-3 rounded-xl border border-[#262a40]/60 italic">
                  "{track.storySnippet}"
                </p>
              </div>

              {/* Dynamic Waveform & Player */}
              <div className="pt-5 mt-4 border-t border-[#262a40] space-y-3">
                
                {/* Visualizer Bars */}
                <div className="h-10 flex items-center justify-between gap-1 px-1 bg-[#090a0f] rounded-xl p-2 border border-[#262a40]/60">
                  {Array.from({ length: 18 }).map((_, i) => {
                    const h = isCurrent
                      ? Math.max(20, Math.min(100, Math.sin((i + activeStep * 2) * 0.9) * 45 + 50))
                      : 25 + (i % 4) * 10;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          isCurrent
                            ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                            : 'bg-[#262a40]'
                        }`}
                        style={{ height: `${h}%` }}
                      ></div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTogglePlay(track)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                      isCurrent
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                        : 'bg-[#181b2a] hover:bg-[#22273d] text-white border border-[#262a40]'
                    }`}
                  >
                    {isCurrent ? <Square className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isCurrent ? 'Pausar Demo' : 'Escuchar Demo'}</span>
                  </button>

                  <button
                    onClick={() => onStartCreatingWithGenre(track.genre)}
                    className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Crear una canción en este estilo"
                  >
                    <span>Quiero una así</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
