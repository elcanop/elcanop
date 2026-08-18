import React, { useState, useEffect } from 'react';
import { 
  Search, Music, CheckCircle2, Clock, Play, Square, Download, 
  MessageSquare, AlertCircle, FileText, Sparkles, Shield, ChevronRight, Loader2, Volume2 
} from 'lucide-react';
import { getOrder, submitCorrection, requestDownloadGrant } from '../utils/api';

export default function OrderTracker({ initialOrderNumber = 'MP-2026-000184' }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Correction Form State
  const [correctionCategory, setCorrectionCategory] = useState('LETRA');
  const [correctionTimestamp, setCorrectionTimestamp] = useState('0:45');
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

  // Handle Correction Submit
  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!correctionDesc.trim()) return;

    setSubmittingCorrection(true);
    setCorrectionSuccess(null);
    try {
      const result = await submitCorrection(order.order_number, {
        category: correctionCategory,
        timestamp_hint: correctionTimestamp,
        description: correctionDesc
      });
      setCorrectionSuccess('¡Solicitud de corrección enviada con éxito! Nuestro productor ya la tiene en cola.');
      setCorrectionDesc('');
      fetchOrderDetails(order.order_number);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // Handle Download Request
  const handleRequestDownload = async () => {
    setAuthorizingDownload(true);
    try {
      const grants = await requestDownloadGrant(order.order_number);
      setDownloads(grants);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthorizingDownload(false);
    }
  };

  // State order mapping
  const statusSteps = [
    { key: 'AWAITING_PAYMENT', label: 'Pendiente de Pago', desc: 'Esperando confirmación' },
    { key: 'QUEUED', label: 'En Cola', desc: 'Asignado a productor' },
    { key: 'IN_PRODUCTION', label: 'En Producción', desc: 'Grabación y arreglos' },
    { key: 'QUALITY_REVIEW', label: 'Control Calidad', desc: 'Revisión técnica' },
    { key: 'READY_FOR_CLIENT_REVIEW', label: 'Previsualización', desc: 'Escucha y corrección' },
    { key: 'DELIVERED', label: 'Entregado', desc: 'Master listo para descarga' }
  ];

  const getStepIndex = (status) => {
    if (status === 'CORRECTION_REQUESTED' || status === 'IN_REVISION') return 4;
    if (status === 'READY_FINAL') return 5;
    const idx = statusSteps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Portal Seguro de Seguimiento</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Estado y Entrega de tu Pedido
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Ingresa tu número de pedido comercial (ej: <code>MP-2026-000184</code>) para revisar el progreso, escuchar previsualizaciones y descargar los masters.
        </p>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); fetchOrderDetails(); }}
          className="flex gap-2 max-w-md mx-auto pt-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="MP-2026-000184"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#12141e] border border-[#262a40] text-white font-mono text-sm uppercase placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Consultar'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Order Meta Bar */}
          <div className="p-6 rounded-3xl bg-[#12141e] border border-[#262a40] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                  {order.order_number}
                </span>
                <span className="text-xs text-slate-400">
                  Creado el {new Date(order.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-white">
                {order.genre} · {order.occasion}
              </h3>
              <p className="text-xs text-slate-300">
                Cliente: <span className="font-semibold text-slate-100">{order.customer_name}</span> ({order.customer_email_masked})
              </p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <div className="text-right">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Plan Seleccionado</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {order.product_tier}
                </div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#181b2a] border border-[#262a40] text-amber-300 text-xs font-mono font-bold">
                ${order.total_amount?.toLocaleString('es-CO')} {order.currency}
              </div>
            </div>
          </div>

          {/* Timeline State Machine */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-6">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Progreso de la Producción Musical
            </h4>

            {/* Stepper Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {statusSteps.map((s, idx) => {
                const currentIdx = getStepIndex(order.order_status);
                const isPassed = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={s.key}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : isPassed
                        ? 'bg-[#181b2a]/80 border-emerald-500/40 text-slate-300'
                        : 'bg-[#090a0f] border-[#262a40] text-slate-300 opacity-60'
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      {isPassed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs animate-pulse">
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-[#262a40] text-slate-400 flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-white mb-0.5">{s.label}</div>
                    <div className="text-[10px] text-slate-400">{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 1: PREVIEW PLAYER (If ready for review or delivered) */}
          {(order.order_status === 'READY_FOR_CLIENT_REVIEW' || 
            order.order_status === 'CORRECTION_REQUESTED' || 
            order.order_status === 'IN_REVISION' || 
            order.order_status === 'DELIVERED') && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1c1a2e] to-[#12141e] border-2 border-violet-500/40 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                    <Music className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg text-white">Previsualización de Audio Oficial</h4>
                    <p className="text-xs text-slate-300">Escucha la mezcla preliminar de tu canción personalizada</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
                  Audio Seguro y Privado
                </span>
              </div>

              {/* Player Waveform & Controls */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-4">
                <div className="h-14 flex items-center justify-between gap-1 px-2">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const barHeight = isPlaying 
                      ? Math.max(20, Math.sin(i * 0.5 + audioProgress * 0.1) * 70 + 30)
                      : 25 + (i % 6) * 8;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-100 ${
                          isPlaying 
                            ? 'bg-gradient-to-t from-violet-500 to-amber-400' 
                            : 'bg-[#262a40]'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      ></div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    {isPlaying ? <Square className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                    <span>{isPlaying ? 'Pausar Previsualización' : 'Reproducir Canción'}</span>
                  </button>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Volume2 className="w-4 h-4 text-violet-400" />
                    <span>Master Calidad Estudio (128kbps Stream)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CORRECTION STUDIO (Only 1 round allowed) */}
          {order.order_status === 'READY_FOR_CLIENT_REVIEW' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-lg text-white">Ronda de Corrección Incluida</h4>
                  <p className="text-xs text-slate-300">
                    Tu compra incluye <strong>1 ronda de corrección garantizada</strong>.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                  Disponibles: {order.corrections_allowed - order.corrections_used} de {order.corrections_allowed}
                </div>
              </div>

              {correctionSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{correctionSuccess}</span>
                </div>
              )}

              {order.corrections_used < order.corrections_allowed ? (
                <form onSubmit={handleCorrectionSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Categoría del Ajuste:
                      </label>
                      <select
                        value={correctionCategory}
                        onChange={(e) => setCorrectionCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="LETRA">Letra / Pronunciación de Nombres</option>
                        <option value="VOZ">Afinación / Estilo de la Voz</option>
                        <option value="INSTRUMENTACION">Instrumentación / Arreglos</option>
                        <option value="TEMPO">Ritmo / Velocidad (Tempo)</option>
                        <option value="MEZCLA">Volumen / Mezcla General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Minuto o Segundo Aproximado:
                      </label>
                      <input
                        type="text"
                        value={correctionTimestamp}
                        onChange={(e) => setCorrectionTimestamp(e.target.value)}
                        placeholder="Ej: 0:45 en el coro, o 'En toda la canción'"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Descripción detallada del ajuste solicitado:
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={correctionDesc}
                      onChange={(e) => setCorrectionDesc(e.target.value)}
                      placeholder="Explícanos con la mayor claridad posible qué te gustaría modificar para que el productor lo implemente con precisión..."
                      className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:outline-none focus:border-amber-500 placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingCorrection}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submittingCorrection ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando corrección...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Solicitar Mi Ronda de Corrección</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] text-xs text-slate-400">
                  Has utilizado tu ronda de corrección incluida. El pedido se encuentra en fase de finalización para la entrega de los masters definitivos.
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: DOWNLOAD VAULT (If Delivered) */}
          {order.order_status === 'DELIVERED' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#13231a] to-[#12141e] border-2 border-emerald-500/40 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Download className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg text-white">Bóveda de Descarga Privada</h4>
                    <p className="text-xs text-emerald-300/80">Archivos finales con calidad de estudio masterizada</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Vigencia de Acceso</div>
                  <div className="text-xs font-bold text-emerald-400">7 días calendario</div>
                </div>
              </div>

              {!downloads ? (
                <div className="text-center py-4">
                  <button
                    onClick={handleRequestDownload}
                    disabled={authorizingDownload}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    {authorizingDownload ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generando enlaces seguros temporales...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Acceder a los Archivos de Descarga</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <a
                    href={downloads.download_url_mp3}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-[#090a0f] border border-emerald-500/40 hover:border-emerald-400 text-left transition-all group"
                  >
                    <div className="text-xs font-mono font-bold text-emerald-400 mb-1">MASTER MP3 (320kbps)</div>
                    <div className="text-xs text-white font-bold group-hover:text-emerald-300">Descargar Audio</div>
                    <div className="text-[10px] text-slate-400 mt-2">Enlace temporal seguro (5 min)</div>
                  </a>

                  <a
                    href={downloads.download_url_wav}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-[#090a0f] border border-emerald-500/40 hover:border-emerald-400 text-left transition-all group"
                  >
                    <div className="text-xs font-mono font-bold text-emerald-400 mb-1">MASTER WAV (24-bit)</div>
                    <div className="text-xs text-white font-bold group-hover:text-emerald-300">Descargar Sin Compresión</div>
                    <div className="text-[10px] text-slate-400 mt-2">Enlace temporal seguro (5 min)</div>
                  </a>

                  <a
                    href={downloads.lyrics_pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-[#090a0f] border border-emerald-500/40 hover:border-emerald-400 text-left transition-all group"
                  >
                    <div className="text-xs font-mono font-bold text-emerald-400 mb-1">PDF LETRA & ACORDES</div>
                    <div className="text-xs text-white font-bold group-hover:text-emerald-300">Descargar Documento</div>
                    <div className="text-[10px] text-slate-400 mt-2">Listo para imprimir o enmarcar</div>
                  </a>

                  {downloads.download_url_stems_zip && (
                    <a
                      href={downloads.download_url_stems_zip}
                      target="_blank"
                      rel="noreferrer"
                      className="p-4 rounded-2xl bg-[#090a0f] border border-amber-500/40 hover:border-amber-400 text-left transition-all group"
                    >
                      <div className="text-xs font-mono font-bold text-amber-400 mb-1">STEMS MULTI-PISTA (ZIP)</div>
                      <div className="text-xs text-white font-bold group-hover:text-amber-300">Descargar Pistas ZIP</div>
                      <div className="text-[10px] text-slate-400 mt-2">Voz, Batería, Bajo y Guitarras</div>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
