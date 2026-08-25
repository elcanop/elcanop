import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Music, Check, Copy, AlertCircle, RefreshCw, 
  Play, Square, ChevronRight, Eye, CheckCircle2, Sliders, 
  Send, FileText, UserCheck, Sparkles, CreditCard, Loader2, Tag, 
  Percent, DollarSign, Save, Mail, MessageSquare, ThumbsUp, Link, Filter,
  LogOut, ShieldAlert, Activity, User, Edit3, Volume2, Plus, Disc, Mic, Trash2
} from 'lucide-react';
import { 
  getAdminOrders, updateAdminOrderStatus, simulatePaymentApproval, 
  getPricingConfig, updatePricingConfig, getAdminContactMessages, 
  updateAdminContactMessage, getAuditLogs, getMarketingSongs, updateMarketingSongs,
  proposeLyrics, deliverTwoVersions, deleteAdminOrderAudio
} from '../utils/api';

export default function AdminDashboard({ currentUser, onLogout, onSelectOrderToView, onPricingUpdated, globalPricing }) {
  const role = currentUser?.role || 'OWNER';
  const [adminTab, setAdminTab] = useState('orders'); // 'orders' | 'lyrics' | 'marketing' | 'pricing' | 'inbox' | 'audit'
  const [orders, setOrders] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [marketingStyles, setMarketingStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [inboxFilter, setInboxFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [copiedType, setCopiedType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Lyrics Editor in Admin
  const [lyricsDraft, setLyricsDraft] = useState('');
  const [versionAUrl, setVersionAUrl] = useState('');
  const [versionBUrl, setVersionBUrl] = useState('');

  // Pricing Form State
  const [pricingForm, setPricingForm] = useState(globalPricing || {
    express: { regular_price: 160000, current_price: 120000, discount_enabled: true, discount_badge: '25% OFF' },
    semi_pro: { regular_price: 350000, current_price: 280000, discount_enabled: true, discount_badge: '20% OFF' },
    stems_addon: { regular_price: 70000, current_price: 50000, discount_enabled: true, discount_badge: 'Ahorra $20.000 COP' }
  });
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingMarketing, setSavingMarketing] = useState(false);

  const fetchAllAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, inboxData, pricingData, auditData, marketingData] = await Promise.all([
        getAdminOrders(),
        getAdminContactMessages().catch(() => ({ messages: [] })),
        getPricingConfig().catch(() => null),
        getAuditLogs().catch(() => ({ logs: [] })),
        getMarketingSongs().catch(() => [])
      ]);
      setOrders(ordersData.orders || []);
      setInboxMessages(inboxData.messages || []);
      setAuditLogsList(auditData.logs || []);
      if (Array.isArray(marketingData)) setMarketingStyles(marketingData);
      if (pricingData) setPricingForm(pricingData);

      if (selectedOrder) {
        const updated = (ordersData.orders || []).find(o => o.id === selectedOrder.id);
        if (updated) {
          setSelectedOrder(updated);
          setLyricsDraft(updated.current_lyrics || '');
          setVersionAUrl(updated.version_a_url || '');
          setVersionBUrl(updated.version_b_url || '');
        }
      } else if (ordersData.orders && ordersData.orders.length > 0) {
        setSelectedOrder(ordersData.orders[0]);
        setLyricsDraft(ordersData.orders[0].current_lyrics || '');
        setVersionAUrl(ordersData.orders[0].version_a_url || '');
        setVersionBUrl(ordersData.orders[0].version_b_url || '');
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Token') || err.message.includes('autorizado')) {
        if (onLogout) onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Production Brief Copy Handlers
  const handleCopySection = (type, order) => {
    let textToCopy = '';
    if (type === 'LYRICS') {
      textToCopy = `=== LETRA & FRASES: ${order.order_number} ===\n` +
        `DESTINATARIO: ${order.story_details?.recipient_name || ''} (${order.occasion})\n\n` +
        `LETRA PROPUESTA:\n${order.current_lyrics || 'Aún no redactada'}\n\n` +
        `FRASES OBLIGATORIAS:\n${(order.key_phrases || []).map(p => `• "${p}"`).join('\n')}`;
    } else if (type === 'STYLE') {
      textToCopy = `=== STYLE PROMPT: ${order.order_number} ===\n` +
        `GÉNERO: ${order.genre}\n` +
        `MOOD: ${order.mood}\n` +
        `TIEMPO ENTREGA: Máx 24h (posibilidad 3h express)\n` +
        `ENTREGABLE: 2 Canciones casi iguales (Versión A y Versión B)\n` +
        `BPM SUGERIDO: 85-115 | TONALIDAD: Mayor cálida`;
    } else if (type === 'EXCLUSIONS') {
      textToCopy = `=== EXCLUSIONES: ${order.order_number} ===\n` +
        `EVITAR: Autotune robótico extremo, sonidos sintéticos disonantes.\n` +
        `PRONUNCIACIÓN: Respetar nombres: ${order.story_details?.recipient_name || ''}.`;
    } else {
      textToCopy = `
=== PRODUCTION BRIEF COMPLETO (DROP IT CO) ===
PEDIDO: ${order.order_number}
PRODUCTO: ${order.product_tier} (Entrega de 2 Canciones + Revisión de Letra)
GÉNERO: ${order.genre}
MOOD: ${order.mood}
DESTINATARIO: ${order.story_details?.recipient_name || 'N/A'} (${order.occasion})

HISTORIA:
${order.story_details?.key_memories || 'N/A'}

FRASES OBLIGATORIAS:
${(order.key_phrases || []).map(p => `• "${p}"`).join('\n')}

ESTADO DE LETRA: ${order.lyrics_status || 'PENDING'}
FEEDBACK DE LETRA: ${order.lyrics_feedback || 'Ninguno'}
===============================================
`.trim();
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Propose Lyrics to Client
  const handleProposeLyrics = async () => {
    if (!selectedOrder || !lyricsDraft.trim()) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await proposeLyrics(selectedOrder.order_number, lyricsDraft);
      setSelectedOrder(res.order);
      setActionMessage('¡Propuesta de letra enviada al cliente para su revisión en su portal!');
      await fetchAllAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Deliver 2 Versions
  const handleDeliverTwoVersions = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await deliverTwoVersions(selectedOrder.id, versionAUrl, versionBUrl);
      setSelectedOrder(res.order);
      setActionMessage('¡Versión A y Versión B cargadas exitosamente para el cliente!');
      await fetchAllAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Final Delivery
  const handleFinalDelivery = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await updateAdminOrderStatus(selectedOrder.id, { status: 'DELIVERED' });
      setActionMessage(`Pedido ${selectedOrder.order_number} marcado como ENTREGADO con bóveda de 7 días activa.`);
      await fetchAllAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveAudio = async (type) => {
    if (!selectedOrder) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la referencia de ${type === 'rhythm' ? 'ritmo' : 'voz'}? Esta acción no se puede deshacer.`)) return;
    
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await deleteAdminOrderAudio(selectedOrder.id, type);
      setActionMessage(res.message || 'Audio eliminado exitosamente.');
      await fetchAllAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Marketing Songs
  const handleSaveMarketingSongs = async (e) => {
    e.preventDefault();
    setSavingMarketing(true);
    setActionMessage(null);
    try {
      await updateMarketingSongs(marketingStyles);
      setActionMessage('¡Canciones de marketing multi-estilo actualizadas con éxito!');
    } catch (err) {
      setError(err.message || 'Error al guardar canciones de marketing');
    } finally {
      setSavingMarketing(false);
    }
  };

  // Save Pricing
  const handleSavePricing = async (e) => {
    e.preventDefault();
    setSavingPricing(true);
    setActionMessage(null);
    try {
      const response = await updatePricingConfig(pricingForm);
      setActionMessage('¡Precios y simulación de descuentos actualizados exitosamente!');
      if (onPricingUpdated) onPricingUpdated(response.pricing);
    } catch (err) {
      setError(err.message || 'Error al guardar precios');
    } finally {
      setSavingPricing(false);
    }
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.order_status === filterStatus);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Unified Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12141e] border border-[#262a40] shadow-xl">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Melofilia" className="h-10 w-auto drop-shadow-md hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-white">Consola Unificada Melofilia</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Drop It Co
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sesión activa: <strong className="text-slate-200">{currentUser?.usuario || currentUser?.name || 'Admin'}</strong>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          <div className="flex bg-[#090a0f] p-1 rounded-xl border border-[#262a40] overflow-x-auto">
            <button
              onClick={() => setAdminTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminTab === 'orders' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 Pedidos ({orders.length})
            </button>

            <button
              onClick={() => setAdminTab('lyrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                adminTab === 'lyrics' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" /> Letras
            </button>

            <button
              onClick={() => setAdminTab('marketing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                adminTab === 'marketing' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc className="w-3 h-3" /> Canción de Marca
            </button>

            <button
              onClick={() => setAdminTab('pricing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                adminTab === 'pricing' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3 h-3" /> Precios
            </button>

            <button
              onClick={() => setAdminTab('inbox')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                adminTab === 'inbox' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3 h-3" /> Buzón ({inboxMessages.filter(m => m.status === 'NEW').length})
            </button>

            <button
              onClick={() => setAdminTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                adminTab === 'audit' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" /> Auditoría
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllAdminData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#181b2a] hover:bg-[#22273d] text-slate-300 border border-[#262a40] text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PEDIDOS & PRODUCCIÓN                                               */}
      {/* ========================================================================= */}
      {adminTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Order List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex flex-wrap gap-1.5 pb-2">
              {['ALL', 'AWAITING_PAYMENT', 'LYRICS_CLIENT_REVIEW', 'IN_PRODUCTION', 'READY_FOR_CLIENT_REVIEW', 'DELIVERED'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    filterStatus === st ? 'bg-amber-500 text-black border-amber-400' : 'bg-[#12141e] text-slate-400 border-[#262a40]'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#12141e] border border-dashed border-[#262a40] text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                    <Music className="w-7 h-7 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Sin pedidos {filterStatus !== 'ALL' ? `en estado "${filterStatus.replace(/_/g, ' ')}"` : 'registrados aún'}</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {filterStatus !== 'ALL' 
                      ? 'Prueba cambiando el filtro de estado para ver otros pedidos.'
                      : 'Los pedidos creados por clientes reales desde la página aparecerán aquí automáticamente.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setLyricsDraft(order.current_lyrics || '');
                        setVersionAUrl(order.version_a_url || '');
                        setVersionBUrl(order.version_b_url || '');
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected ? 'bg-[#181b2a] border-amber-500 shadow-lg' : 'bg-[#12141e] border-[#262a40] hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              {order.order_number}
                            </span>
                            <span className="text-xs font-bold text-white">{order.customer_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {order.genre} · {order.occasion}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300">
                          {order.order_status?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#262a40]/60 text-[11px] text-slate-400">
                        <span>Letra: <strong>{order.lyrics_status || 'Pendiente'}</strong></span>
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          Gestionar <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Detail Panel: Brief & 2 Versions Delivery */}
          <div className="lg:col-span-6">
            {selectedOrder ? (
              <div className="p-6 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-6 shadow-2xl">
                
                <div className="flex items-center justify-between pb-4 border-b border-[#262a40]">
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Production Brief & Entregables</h3>
                    <p className="text-xs font-mono text-amber-400">{selectedOrder.order_number}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-300 bg-[#181b2a] px-2.5 py-1 rounded-md border border-[#262a40]">
                    2 Canciones ({selectedOrder.product_tier})
                  </span>
                </div>

                {/* Customer Contact & Sales Card */}
                <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      Datos del Comprador / Ventas
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      ${(selectedOrder.total_amount || 0).toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cliente:</span>
                      <strong className="text-slate-200">{selectedOrder.customer_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Ocasión / Dedicatoria:</span>
                      <strong className="text-slate-200">{selectedOrder.occasion} ({selectedOrder.story_details?.recipient_name || 'N/A'})</strong>
                    </div>
                  </div>

                  {/* Direct Contact Actions: WhatsApp & Email */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedOrder.customer_phone && (
                      <a
                        href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${selectedOrder.customer_name}! Te saludamos de Melofilia (Drop It Co) respecto a tu pedido ${selectedOrder.order_number} para ${selectedOrder.story_details?.recipient_name || 'tu canción'}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp: {selectedOrder.customer_phone}</span>
                      </a>
                    )}

                    {selectedOrder.customer_email && (
                      <a
                        href={`mailto:${selectedOrder.customer_email}?subject=${encodeURIComponent(`Tu Canción Melofilia (${selectedOrder.order_number})`)}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-300 border border-[#262a40] text-xs font-medium transition-colors font-mono"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>{selectedOrder.customer_email}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 4 Copy Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopySection('LYRICS', selectedOrder)}
                    className="p-2.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-200 border border-[#262a40] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {copiedType === 'LYRICS' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>COPIAR LETRA</span>
                  </button>
                  <button
                    onClick={() => handleCopySection('STYLE', selectedOrder)}
                    className="p-2.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-200 border border-[#262a40] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {copiedType === 'STYLE' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>COPIAR STYLE</span>
                  </button>
                  <button
                    onClick={() => handleCopySection('EXCLUSIONS', selectedOrder)}
                    className="p-2.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-200 border border-[#262a40] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {copiedType === 'EXCLUSIONS' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>COPIAR EXCLUSIONES</span>
                  </button>
                  <button
                    onClick={() => handleCopySection('ALL', selectedOrder)}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {copiedType === 'ALL' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>COPIAR TODO</span>
                  </button>
                </div>

                {/* Customer Audio References (if provided) */}
                {(selectedOrder.rhythm_audio_data || selectedOrder.voice_audio_data || selectedOrder.client_audio_notes) && (
                  <div className="p-4 rounded-2xl bg-[#090a0f] border border-amber-500/30 space-y-3">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-amber-400" />
                      <span>Referencias de Audio del Cliente:</span>
                    </div>

                    {selectedOrder.client_audio_notes && (
                      <p className="text-xs text-slate-300 bg-[#12141e] p-2.5 rounded-xl border border-[#262a40]">
                        <strong>Nota del cliente:</strong> "{selectedOrder.client_audio_notes}"
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedOrder.rhythm_audio_data && (
                        <div className="p-3 rounded-xl bg-[#12141e] border border-[#262a40] space-y-1.5 flex flex-col">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-300">🎵 Referencia Rítmica:</span>
                            <button
                              onClick={() => handleArchiveAudio('rhythm')}
                              disabled={actionLoading}
                              className="text-slate-400 hover:text-rose-400 transition-colors"
                              title="Archivar / Eliminar Audio para liberar espacio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <audio controls src={selectedOrder.rhythm_audio_data} className="w-full h-8" />
                          <a 
                            href={selectedOrder.rhythm_audio_data} 
                            download={`ritmo-${selectedOrder.order_number}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] text-amber-400 hover:underline mt-1 self-start"
                          >
                            📥 Descargar (Click derecho {'>'} Guardar como)
                          </a>
                        </div>
                      )}

                      {selectedOrder.voice_audio_data && (
                        <div className="p-3 rounded-xl bg-[#12141e] border border-[#262a40] space-y-1.5 flex flex-col">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-300">🎤 Referencia Vocal:</span>
                            <button
                              onClick={() => handleArchiveAudio('voice')}
                              disabled={actionLoading}
                              className="text-slate-400 hover:text-rose-400 transition-colors"
                              title="Archivar / Eliminar Audio para liberar espacio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <audio controls src={selectedOrder.voice_audio_data} className="w-full h-8" />
                          <a 
                            href={selectedOrder.voice_audio_data} 
                            download={`voz-${selectedOrder.order_number}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] text-amber-400 hover:underline mt-1 self-start"
                          >
                            📥 Descargar (Click derecho {'>'} Guardar como)
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Musical Feedback (if correction requested) */}
                {selectedOrder.musical_feedback && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Feedback de Corrección Musical:</span>
                    </div>
                    <p className="text-xs bg-[#12141e] p-3 rounded-xl border border-amber-500/20">
                      "{selectedOrder.musical_feedback}"
                    </p>
                  </div>
                )}

                {/* 2 Versions Audio URLs Input */}
                <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span>Cargar las 2 Versiones de Canción:</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Audio URL - Versión A:</label>
                    <input
                      type="text"
                      value={versionAUrl}
                      onChange={(e) => setVersionAUrl(e.target.value)}
                      placeholder="https://.../version_a.mp3"
                      className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-[#262a40] text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Audio URL - Versión B:</label>
                    <input
                      type="text"
                      value={versionBUrl}
                      onChange={(e) => setVersionBUrl(e.target.value)}
                      placeholder="https://.../version_b.mp3"
                      className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-[#262a40] text-white text-xs font-mono"
                    />
                  </div>

                  <button
                    onClick={handleDeliverTwoVersions}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar 2 Versiones para Escucha del Cliente</span>
                  </button>
                </div>

                {/* Final Delivery Action */}
                <button
                  onClick={handleFinalDelivery}
                  disabled={actionLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Marcar como Entregado Definitivo (Bóveda 7 Días)</span>
                </button>

              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-[#12141e] border border-[#262a40] text-center text-slate-400 text-xs">
                Selecciona un pedido para gestionar sus briefs y versiones.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GESTIÓN Y REVISIÓN DE LETRAS                                       */}
      {/* ========================================================================= */}
      {adminTab === 'lyrics' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#262a40]">
            <div>
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Módulo de Redacción & Aprobación de Letras
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Escribe y envía la letra propuesta para que el cliente la revise y apruebe en su portal antes de grabar.
              </p>
            </div>

            {selectedOrder && (
              <div className="text-right">
                <span className="text-xs font-mono text-amber-400 font-bold bg-[#090a0f] px-3 py-1.5 rounded-xl border border-[#262a40]">
                  Pedido Activo: {selectedOrder.order_number}
                </span>
              </div>
            )}
          </div>

          {selectedOrder ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Letra propuesta para: {selectedOrder.customer_name} ({selectedOrder.story_details?.recipient_name || 'Destinatario'})
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                  selectedOrder.lyrics_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                  selectedOrder.lyrics_status === 'ADJUSTMENT_REQUESTED' ? 'bg-rose-500/20 text-rose-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  Estado: {selectedOrder.lyrics_status || 'PENDIENTE'}
                </span>
              </div>

              {selectedOrder.lyrics_feedback && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  <strong>Comentarios de ajuste del cliente:</strong> "{selectedOrder.lyrics_feedback}"
                </div>
              )}

              <textarea
                rows={12}
                value={lyricsDraft}
                onChange={(e) => setLyricsDraft(e.target.value)}
                placeholder="[Verso 1]&#10;Escribe aquí la letra estructurada por versos y coros..."
                className="w-full p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] text-white text-xs sm:text-sm font-mono leading-relaxed focus:border-amber-500 focus:outline-none"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleProposeLyrics}
                  disabled={actionLoading || !lyricsDraft.trim()}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Propuesta de Letra al Cliente</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Por favor selecciona un pedido en la pestaña de Pedidos para redactar su letra.
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GESTIÓN DE CANCIÓN DE MARKETING MULTI-ESTILO                       */}
      {/* ========================================================================= */}
      {adminTab === 'marketing' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#262a40]">
            <div>
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Disc className="w-5 h-5 text-amber-400" />
                Gestión de la Canción de Marketing Multi-Estilo
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Carga los audios y textos de la canción promocional para que los clientes escuchen el mismo tema en diferentes géneros.
              </p>
            </div>

            <button
              onClick={handleSaveMarketingSongs}
              disabled={savingMarketing}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-black font-bold text-xs shadow-md"
            >
              {savingMarketing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar Estilos de Marketing</span>
            </button>
          </div>

          <div className="space-y-6">
            {marketingStyles.map((style, idx) => (
              <div key={style.id} className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-300 font-display">
                    Estilo #{idx + 1}: {style.name} ({style.id})
                  </span>
                  <span className="text-xs font-mono text-slate-400">{style.tempo}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nombre del Estilo:</label>
                    <input
                      type="text"
                      value={style.name}
                      onChange={(e) => {
                        const copy = [...marketingStyles];
                        copy[idx].name = e.target.value;
                        setMarketingStyles(copy);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-[#262a40] text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Audio URL (MP3/WAV):</label>
                    <input
                      type="text"
                      value={style.audio_url}
                      onChange={(e) => {
                        const copy = [...marketingStyles];
                        copy[idx].audio_url = e.target.value;
                        setMarketingStyles(copy);
                      }}
                      placeholder="https://.../marketing_style.mp3"
                      className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-[#262a40] text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Letra de esta versión:</label>
                  <textarea
                    rows={3}
                    value={style.lyrics}
                    onChange={(e) => {
                      const copy = [...marketingStyles];
                      copy[idx].lyrics = e.target.value;
                      setMarketingStyles(copy);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRECIOS & DESCUENTOS                                               */}
      {/* ========================================================================= */}
      {adminTab === 'pricing' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-[#262a40]">
            <div>
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                Control de Precios & Simulación de Descuentos
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ajusta las tarifas en COP, precios tachados y badges promocionales.
              </p>
            </div>
            {role !== 'OWNER' && (
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                Solo lectura (Requiere OWNER)
              </span>
            )}
          </div>

          <form onSubmit={handleSavePricing} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Express */}
              <div className="p-6 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-4">
                <span className="text-xs font-bold text-slate-300 uppercase block">Plan Express (2 Canciones)</span>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Precio Cobro (COP):</label>
                  <input
                    type="number"
                    step="1000"
                    disabled={role !== 'OWNER'}
                    value={pricingForm.express?.current_price || ''}
                    onChange={(e) => setPricingForm({ ...pricingForm, express: { ...pricingForm.express, current_price: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-[#262a40] text-white font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Precio Regular (Tachado):</label>
                  <input
                    type="number"
                    step="1000"
                    disabled={role !== 'OWNER'}
                    value={pricingForm.express?.regular_price || ''}
                    onChange={(e) => setPricingForm({ ...pricingForm, express: { ...pricingForm.express, regular_price: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-[#262a40] text-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Semi-Pro */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1c1a2e] to-[#090a0f] border-2 border-amber-500/40 space-y-4">
                <span className="text-xs font-bold text-amber-300 uppercase block">Plan Semi-Pro ⭐ (2 Canciones + WAV)</span>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Precio Cobro (COP):</label>
                  <input
                    type="number"
                    step="1000"
                    disabled={role !== 'OWNER'}
                    value={pricingForm.semi_pro?.current_price || ''}
                    onChange={(e) => setPricingForm({ ...pricingForm, semi_pro: { ...pricingForm.semi_pro, current_price: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-amber-500/40 text-white font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Precio Regular (Tachado):</label>
                  <input
                    type="number"
                    step="1000"
                    disabled={role !== 'OWNER'}
                    value={pricingForm.semi_pro?.regular_price || ''}
                    onChange={(e) => setPricingForm({ ...pricingForm, semi_pro: { ...pricingForm.semi_pro, regular_price: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-[#262a40] text-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Stems Add-on */}
              <div className="p-6 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-4">
                <span className="text-xs font-bold text-slate-300 uppercase block">Stems Multipista (STEMS.ZIP)</span>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Precio (COP):</label>
                  <input
                    type="number"
                    step="1000"
                    disabled={role !== 'OWNER'}
                    value={pricingForm.stems_addon?.current_price || ''}
                    onChange={(e) => setPricingForm({ ...pricingForm, stems_addon: { ...pricingForm.stems_addon, current_price: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#12141e] border border-[#262a40] text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>

            </div>

            {role === 'OWNER' && (
              <div className="flex justify-end pt-4 border-t border-[#262a40]">
                <button
                  type="submit"
                  disabled={savingPricing}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-black font-extrabold text-xs shadow-md"
                >
                  {savingPricing ? 'Guardando...' : 'Guardar Precios'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BUZÓN DE CONTACTO                                                 */}
      {/* ========================================================================= */}
      {adminTab === 'inbox' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-6 animate-fadeIn">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            Buzón de Mensajes y Consultas
          </h3>
          <div className="space-y-3">
            {inboxMessages.map(msg => (
              <div key={msg.id} className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-white">{msg.name} ({msg.email})</strong>
                  <span className="font-mono text-amber-400 font-bold">{msg.category}</span>
                </div>
                <p className="text-xs text-slate-300">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDITORÍA DE SEGURIDAD                                            */}
      {/* ========================================================================= */}
      {adminTab === 'audit' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-4 animate-fadeIn">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-violet-400" />
            Registro de Auditoría Criptográfica
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#262a40] text-slate-400 font-mono">
                  <th className="py-2.5 px-3">Fecha / Hora</th>
                  <th className="py-2.5 px-3">Evento</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Detalles</th>
                  <th className="py-2.5 px-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a40]/60">
                {auditLogsList.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString('es-CO')}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">{log.event_type}</td>
                    <td className="py-2.5 px-3 text-white font-medium">{log.actor}</td>
                    <td className="py-2.5 px-3 text-slate-300">{log.details}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
