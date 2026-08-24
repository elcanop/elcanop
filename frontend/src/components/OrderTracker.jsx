import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Music, CheckCircle2, Clock, Play, Square, Download, 
  MessageSquare, AlertCircle, FileText, Sparkles, Shield, ChevronRight, Loader2, Volume2, ThumbsUp, Edit3 
} from 'lucide-react';
import { getOrder, reviewLyrics, submitCorrection, requestDownloadGrant } from '../utils/api';

export default function OrderTracker({ initialOrderNumber = 'MP-2026-000184' }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Player state for 2 versions
  const [activeVersion, setActiveVersion] = useState('A'); // 'A' | 'B'
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef(null);

  // Lyrics Review State
  const [showLyricsAdjustmentModal, setShowLyricsAdjustmentModal] = useState(false);
  const [lyricsFeedbackText, setLyricsFeedbackText] = useState('');
  const [reviewingLyrics, setReviewingLyrics] = useState(false);
  const [lyricsNotice, setLyricsNotice] = useState(null);

  // Correction Form State
  const [correctionCategory, setCorrectionCategory] = useState('AUDIO_MIX');
  const [correctionDesc, setCorrectionDesc] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState(null);

  // Download state
  const [downloads, setDownloads] = useState(null);
  const [authorizingDownload, setAuthorizingDownload] = useState(false);

  const fetchOrderDetails = async (numToFetch = orderNumber) => {
    if (!numToFetch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrder(numToFetch.trim());
      setOrder(data);
      setDownloads(null);
    } catch (err) {
      setError(err.message || 'No se encontró ningún pedido con ese número.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrderDetails(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  // Audio Playback
  const handlePlayToggle = (version = activeVersion) => {
    const url = version === 'A' ? (order?.version_a_url || order?.preview_audio_url) : (order?.version_b_url || order?.preview_audio_url);
    if (!url) return;

    if (isPlaying && activeVersion === version) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setActiveVersion(version);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Lyrics Actions
  const handleApproveLyrics = async () => {
    setReviewingLyrics(true);
    setLyricsNotice(null);
    try {
      const res = await reviewLyrics(order.order_number, 'APPROVE');
      setOrder(res.order);
      setLyricsNotice({ type: 'success', message: '¡Letra aprobada exitosamente! Tu pedido avanza a producción musical.' });
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewingLyrics(false);
    }
  };

  const handleRequestLyricsAdjustment = async (e) => {
    e.preventDefault();
    if (!lyricsFeedbackText.trim()) return;

    setReviewingLyrics(true);
    setLyricsNotice(null);
    try {
      const res = await reviewLyrics(order.order_number, 'REQUEST_ADJUSTMENT', lyricsFeedbackText);
      setOrder(res.order);
      setShowLyricsAdjustmentModal(false);
      setLyricsNotice({ type: 'info', message: 'Tus observaciones sobre la letra han sido enviadas al productor.' });
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewingLyrics(false);
    }
  };

  // Correction Submit
  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!correctionDesc.trim()) return;

    setSubmittingCorrection(true);
    setCorrectionSuccess(null);
    try {
      const result = await submitCorrection(order.order_number, {
        category: correctionCategory,
        specific_instructions: correctionDesc
      });
      setOrder(result.order);
      setCorrectionSuccess(result.message);
      setCorrectionDesc('');
    } catch (err) {
      setError(err.message || 'Error al enviar la corrección');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // Download Grant
  const handleAuthorizeDownload = async () => {
    setAuthorizingDownload(true);
    try {
      const grantData = await requestDownloadGrant(order.order_number);
      setDownloads(grantData.assets);
    } catch (err) {
      setError(err.message || 'Error al autorizar descarga');
    } finally {
      setAuthorizingDownload(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 animate-fadeIn">
      
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current && audioRef.current.duration) {
            setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
      />

      {/* Header & Order Search Bar */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Sala Privada de Escucha & Aprobación</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Portal de Seguimiento del Pedido
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Consulta el avance en tiempo real, revisa tu letra, escucha tus 2 versiones y descarga tus masters.
        </p>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); fetchOrderDetails(); }} className="flex gap-2 max-w-md mx-auto pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Ej: MP-2026-000184"
              className="w-full px-4 py-3 rounded-2xl bg-[#12141e] border border-[#262a40] text-white font-mono text-xs focus:outline-none focus:border-amber-500 uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Consultar</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {lyricsNotice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-fadeIn ${
          lyricsNotice.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{lyricsNotice.message}</span>
        </div>
      )}

      {order && (
        <div className="space-y-8">
          
          {/* Order Overview Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border border-[#262a40] shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262a40]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    {order.order_number}
                  </span>
                  <span className="text-xs font-bold text-slate-300 bg-[#181b2a] px-2.5 py-1 rounded-lg border border-[#262a40]">
                    Plan {order.product_tier}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mt-2">
                  Canción para: {order.story_details?.recipient_name || 'Destinatario'} ({order.occasion})
                </h3>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {order.order_status?.replace(/_/g, ' ')}
                </span>
                <div className="text-xs text-slate-400 mt-1">
                  Entrega en máx. 48h (desde 3h express)
                </div>
              </div>
            </div>

            {/* 5-Step Order Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {[
                { label: '1. Pedido & Pago', done: true },
                { label: '2. Revisión Letra', done: ['LYRICS_CLIENT_REVIEW', 'LYRICS_IN_REVISION', 'IN_PRODUCTION', 'READY_FOR_CLIENT_REVIEW', 'DELIVERED'].includes(order.order_status) },
                { label: '3. Grabación Estudio', done: ['IN_PRODUCTION', 'READY_FOR_CLIENT_REVIEW', 'DELIVERED'].includes(order.order_status) },
                { label: '4. 2 Versiones Listas', done: ['READY_FOR_CLIENT_REVIEW', 'DELIVERED'].includes(order.order_status) },
                { label: '5. Entrega & Bóveda', done: order.order_status === 'DELIVERED' }
              ].map((st, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl border text-center transition-all ${
                    st.done 
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                      : 'bg-[#090a0f] border-[#262a40] text-slate-500'
                  }`}
                >
                  <div className="text-[11px] font-bold">{st.label}</div>
                  <div className="text-[10px] mt-0.5">{st.done ? '✓ Completado' : 'En espera'}</div>
                </div>
              ))}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* FASE 1: REVISIÓN Y APROBACIÓN DE LETRA                                    */}
          {/* ========================================================================= */}
          {order.current_lyrics && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181b2a] to-[#12141e] border-2 border-violet-500/40 shadow-2xl space-y-5">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#262a40]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      Letra de tu Canción
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.lyrics_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                        order.lyrics_status === 'ADJUSTMENT_REQUESTED' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-violet-500/20 text-violet-300 animate-pulse'
                      }`}>
                        {order.lyrics_status === 'APPROVED' ? '✓ Letra Aprobada' : 
                         order.lyrics_status === 'ADJUSTMENT_REQUESTED' ? 'Ajustes en Proceso' : 'Pendiente tu Aprobación'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Lee cada verso y confirma que capture fielmente tu historia y emociones
                    </p>
                  </div>
                </div>

                {order.lyrics_status === 'AWAITING_CLIENT_APPROVAL' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setShowLyricsAdjustmentModal(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-300 border border-[#262a40] text-xs font-bold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pedir Ajuste</span>
                    </button>

                    <button
                      onClick={handleApproveLyrics}
                      disabled={reviewingLyrics}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Aprobar Letra</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Lyrics Box */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {order.current_lyrics}
              </div>

              {order.lyrics_feedback && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  <strong>Tus observaciones enviadas:</strong> "{order.lyrics_feedback}"
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* FASE 2: REPRODUCTOR DUAL DE LAS 2 CANCIONES (VERSIÓN A Y VERSIÓN B)       */}
          {/* ========================================================================= */}
          {(order.version_a_url || order.preview_audio_url) && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border-2 border-amber-500/30 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#262a40]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-white">
                      Escucha tus 2 Versiones de Canción
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black">
                      2 Canciones Incluidas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Producidas casi iguales con sutiles matices para que elijas tu favorita o te quedes con ambas
                  </p>
                </div>

                {/* Version Selector Toggle */}
                <div className="flex bg-[#090a0f] p-1 rounded-xl border border-[#262a40]">
                  <button
                    onClick={() => handlePlayToggle('A')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeVersion === 'A' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎵 Versión A {activeVersion === 'A' && isPlaying ? '(Sonando)' : ''}
                  </button>
                  <button
                    onClick={() => handlePlayToggle('B')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeVersion === 'B' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎵 Versión B {activeVersion === 'B' && isPlaying ? '(Sonando)' : ''}
                  </button>
                </div>
              </div>

              {/* Dynamic Waveform Player */}
              <div className="p-6 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-4">
                
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="text-amber-400 font-bold">REPRODUCIENDO: VERSIÓN {activeVersion}</span>
                  <span>{order.genre} · {order.mood}</span>
                </div>

                {/* Waveform Bars */}
                <div className="h-16 flex items-center justify-between gap-1 px-1">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const h = isPlaying
                      ? Math.max(20, Math.min(100, Math.sin((i + audioProgress * 0.5) * 0.7) * 45 + 50))
                      : 25 + (i % 4) * 8;
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

                {/* Progress & Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handlePlayToggle(activeVersion)}
                    className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    {isPlaying ? <Square className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                    <span>{isPlaying ? `Pausar Versión ${activeVersion}` : `Reproducir Versión ${activeVersion}`}</span>
                  </button>

                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>1 Ronda de Corrección:</span>
                    <strong className={order.corrections_used === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {order.corrections_allowed - order.corrections_used} Disponible
                    </strong>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* FASE 3: BÓVEDA DE DESCARGAS (7 DÍAS)                                      */}
          {/* ========================================================================= */}
          {order.order_status === 'DELIVERED' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1c1a2e] to-[#12141e] border-2 border-emerald-500/40 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#262a40]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      Bóveda Privada de Descargas (Ambas Canciones)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Disponibles por 7 días con URLs firmadas de alta seguridad
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                  {order.product_tier} ENTREGADO
                </span>
              </div>

              {!downloads ? (
                <button
                  onClick={handleAuthorizeDownload}
                  disabled={authorizingDownload}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {authorizingDownload ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  <span>Generar Enlaces de Descarga para Ambas Canciones</span>
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={downloads.mp3_version_a}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-[#090a0f] hover:bg-[#181b2a] border border-[#262a40] text-xs font-bold text-white transition-colors"
                  >
                    <span>🎵 MP3 Master (Versión A)</span>
                    <Download className="w-4 h-4 text-emerald-400" />
                  </a>

                  <a
                    href={downloads.mp3_version_b}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-[#090a0f] hover:bg-[#181b2a] border border-[#262a40] text-xs font-bold text-white transition-colors"
                  >
                    <span>🎵 MP3 Master (Versión B)</span>
                    <Download className="w-4 h-4 text-emerald-400" />
                  </a>

                  {downloads.wav_version_a && (
                    <a
                      href={downloads.wav_version_a}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-[#090a0f] hover:bg-[#181b2a] border border-[#262a40] text-xs font-bold text-white transition-colors"
                    >
                      <span>📀 WAV Studio 24-bit (Versión A)</span>
                      <Download className="w-4 h-4 text-amber-400" />
                    </a>
                  )}

                  {downloads.wav_version_b && (
                    <a
                      href={downloads.wav_version_b}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-[#090a0f] hover:bg-[#181b2a] border border-[#262a40] text-xs font-bold text-white transition-colors"
                    >
                      <span>📀 WAV Studio 24-bit (Versión B)</span>
                      <Download className="w-4 h-4 text-amber-400" />
                    </a>
                  )}

                  <a
                    href={downloads.lyrics_pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-[#090a0f] hover:bg-[#181b2a] border border-[#262a40] text-xs font-bold text-white transition-colors"
                  >
                    <span>📄 Letra Oficial en PDF</span>
                    <Download className="w-4 h-4 text-violet-400" />
                  </a>

                  {downloads.stems_zip_url && (
                    <a
                      href={downloads.stems_zip_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-[#090a0f] hover:bg-[#181b2a] border border-[#262a40] text-xs font-bold text-amber-300 transition-colors"
                    >
                      <span>🗜️ STEMS Multipista (STEMS.ZIP)</span>
                      <Download className="w-4 h-4 text-amber-400" />
                    </a>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Modal para Solicitar Ajuste de Letra */}
      {showLyricsAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#12141e] border-2 border-[#262a40] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <h3 className="font-display font-bold text-lg text-white">Solicitar Ajustes en la Letra</h3>
            <p className="text-xs text-slate-300">
              Escribe qué partes de la letra deseas que el productor modifique antes de iniciar la producción musical:
            </p>
            <form onSubmit={handleRequestLyricsAdjustment} className="space-y-4">
              <textarea
                rows={5}
                required
                value={lyricsFeedbackText}
                onChange={(e) => setLyricsFeedbackText(e.target.value)}
                placeholder="Ej: En el segundo verso, cambiar 'viaje especial' por 'viaje a Santa Marta'..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:border-amber-500 focus:outline-none placeholder-slate-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLyricsAdjustmentModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#181b2a] text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reviewingLyrics}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  {reviewingLyrics ? 'Enviando...' : 'Enviar Observaciones'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
