import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Sparkles, Disc, Radio, CheckCircle2, FileText, Clock, Music2, ArrowRight } from 'lucide-react';
import { getMarketingSongs } from '../utils/api';
import { synth } from '../utils/audioSynth';

export default function MarketingSongPlayer({ onStartCreating }) {
  const [styles, setStyles] = useState([
    {
      id: 'balada',
      name: 'Balada Pop Acústica',
      tagline: 'Emotiva, íntima y profunda',
      tempo: '85 BPM',
      audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-112347.mp3',
      lyrics: `[Verso 1]
Tienes una historia que merece ser cantada,
un recuerdo, un amor, una vida compartida.
En Melofilia no usamos fórmulas armadas,
creamos tu canción de forma sentida.

[Coro]
Cuéntanos tu historia, te enviamos la letra hoy,
tú la revisas y apruebas con emoción.
Te entregamos dos versiones para que elijas tu voz,
en 48 horas sonando en tu corazón.

[Verso 2]
Desde tres horas si tienes urgencia especial,
con calidad de estudio y master profesional.
Tu historia en melodía se vuelve inmortal,
¡Melofilia es tu música real!`
    },
    {
      id: 'pop',
      name: 'Pop Latino Moderno',
      tagline: 'Alegre, brillante y pegajosa',
      tempo: '115 BPM',
      audio_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tropical-house-summer-pop-10338.mp3',
      lyrics: `[Verso 1]
¡Hey! Cuéntanos tu momento especial,
un cumpleaños, aniversario o detalle sin igual.
Escribimos la letra para que la leas primero,
la ajustamos contigo, somos tu equipo sincero.

[Coro]
¡Dos versiones de tu tema para bailar y cantar!
Revisa tu letra y prepárate a vibrar.
Máximo en 48 horas tu historia va a sonar,
Melofilia en la pista te va a enamorar.`
    },
    {
      id: 'urbano',
      name: 'Urbano / Reggaetón Flow',
      tagline: 'Ritmo moderno, bajo potente y fresco',
      tempo: '96 BPM',
      audio_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b18721c4.mp3?filename=reggaeton-beat-10982.mp3',
      lyrics: `[Verso 1]
De la historia a la pista, sin filtro y con flow,
Melofilia en la casa armándote el show.
Escribimos las rimas, revisas el plan,
aprobamos la letra y los beats llegarán.

[Coro]
Dos canciones casi iguales para que elijas la mejor,
máximo en 48 horas o en 3 con calor.
Tu historia suena a radio, calidad superior,
Melofilia Studio rompiendo el altavoz.`
    },
    {
      id: 'vallenato',
      name: 'Vallenato Romántico',
      tagline: 'Sentimiento puro, acordeón y tradición',
      tempo: '90 BPM',
      audio_url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_2c52670e30.mp3?filename=latin-acoustic-groove-125488.mp3',
      lyrics: `[Verso 1]
Ay, mi gente querida, les vengo a contar,
que cualquier recuerdo se puede cantar.
Nos das tu relato y con devoción,
hacemos los versos de tu gran canción.

[Coro]
Te paso la letra pa que des el sí,
te entrego dos temas sabrosos pa ti.
En 48 horas o en 3 si es de afán,
con Melofilia los versos nunca morirán.`
    },
    {
      id: 'rock',
      name: 'Rock Acústico Orgánico',
      tagline: 'Guitarras potentes, orgánico y auténtico',
      tempo: '120 BPM',
      audio_url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=indie-folk-acoustic-117517.mp3',
      lyrics: `[Verso 1]
La guitarra marca el pulso de la verdad,
convertimos anécdotas en eternidad.
Lees la letra antes de empezar a grabar,
dos versiones de estudio para recordar.

[Coro]
Melofilia suena con fuerza y pasión,
tu historia en acorde, tu propia canción.
Máximo en 48 horas master final,
un regalo que nadie podrá igualar.`
    }
  ]);

  const [selectedStyleId, setSelectedStyleId] = useState('balada');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const audioRef = useRef(null);

  // Load configured marketing styles from API if available
  useEffect(() => {
    getMarketingSongs()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStyles(data);
        }
      })
      .catch(() => {});
  }, []);

  const currentStyle = styles.find(s => s.id === selectedStyleId) || styles[0];

  const handlePlayToggle = (styleId = selectedStyleId) => {
    const targetStyle = styles.find(s => s.id === styleId) || currentStyle;

    if (isPlaying && selectedStyleId === styleId) {
      if (audioRef.current) audioRef.current.pause();
      synth.stop();
      setIsPlaying(false);
    } else {
      setSelectedStyleId(styleId);
      setIsPlaying(true);

      // Attempt HTML5 audio playback with fallback to Web Audio synth
      if (audioRef.current && targetStyle.audio_url) {
        audioRef.current.src = targetStyle.audio_url;
        audioRef.current.play().catch(() => {
          synth.playChordProgression(targetStyle.id, (step) => setActiveStep(step));
        });
      } else {
        synth.playChordProgression(targetStyle.id, (step) => setActiveStep(step));
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      synth.stop();
    };
  }, []);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181b2a] to-[#0f111a] border-2 border-amber-500/30 shadow-2xl space-y-6 relative overflow-hidden">
      
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => setActiveStep(prev => (prev + 1) % 16)}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262a40]">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
            <Disc className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg text-white">
                Canción Explicativa Melofilia
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-black">
                Mismo Tema · 5 Estilos
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Escucha la canción que explica cómo funciona Melofilia en el género que prefieras
            </p>
          </div>
        </div>

        <button
          onClick={() => handlePlayToggle(selectedStyleId)}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all self-stretch sm:self-auto justify-center"
        >
          {isPlaying ? <Square className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
          <span>{isPlaying ? 'Pausar Canción' : 'Escuchar Canción'}</span>
        </button>
      </div>

      {/* 3 Value Pillars Badge Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#090a0f] border border-[#262a40]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200">1. Revisión y aprobación de letra</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#090a0f] border border-[#262a40]">
          <Music2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200">2. Recibes 2 canciones terminadas</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#090a0f] border border-[#262a40]">
          <Clock className="w-4 h-4 text-violet-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200">3. Entrega máx. 48h (desde 3h express)</span>
        </div>
      </div>

      {/* Musical Style Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Elige el estilo musical de la canción explicativa:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {styles.map((st) => {
            const isSelected = selectedStyleId === st.id;
            return (
              <button
                key={st.id}
                onClick={() => handlePlayToggle(st.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                    : 'bg-[#12141e] border-[#262a40] text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{st.name}</span>
                  {isSelected && isPlaying ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ) : (
                    <Radio className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{st.tagline}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Waveform & Lyrics Synchronized View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-[#090a0f] border border-[#262a40]">
        
        {/* Left: Waveform */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-amber-400 font-bold">{currentStyle.name}</span>
            <span>{currentStyle.tempo}</span>
          </div>

          <div className="h-16 flex items-center justify-between gap-1 px-1">
            {Array.from({ length: 24 }).map((_, i) => {
              const h = isPlaying
                ? Math.max(15, Math.min(100, Math.sin((i + activeStep * 2) * 0.8) * 45 + 50))
                : 20 + (i % 4) * 8;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                      : 'bg-[#262a40]'
                  }`}
                  style={{ height: `${h}%` }}
                ></div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Escucha cómo rima y explica el servicio en vivo</span>
          </div>
        </div>

        {/* Right: Lyrics Box */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Letra de la Canción de Marca:
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Estilo: {currentStyle.name}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#12141e] border border-[#262a40] text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
            {currentStyle.lyrics}
          </div>
        </div>

      </div>

    </div>
  );
}
