import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Music, Check, Copy, AlertCircle, RefreshCw, 
  Play, Square, ChevronRight, Eye, CheckCircle2, Sliders, 
  Send, FileText, UserCheck, Sparkles, CreditCard, Loader2, Tag, 
  Percent, DollarSign, Save, Mail, MessageSquare, ThumbsUp, Link, Filter
} from 'lucide-react';
import { 
  getAdminOrders, updateAdminOrderStatus, simulatePaymentApproval, 
  getPricingConfig, updatePricingConfig, getAdminContactMessages, updateAdminContactMessage 
} from '../utils/api';

export default function AdminDashboard({ onSelectOrderToView, onPricingUpdated, globalPricing }) {
  const [role, setRole] = useState('OWNER'); // 'OWNER' | 'PRODUCER'
  const [adminTab, setAdminTab] = useState('orders'); // 'orders' | 'pricing' | 'inbox'
  const [orders, setOrders] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [inboxFilter, setInboxFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [copiedType, setCopiedType] = useState(null); // 'ALL' | 'LYRICS' | 'STYLE' | 'EXCLUSIONS'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Pricing Form State
  const [pricingForm, setPricingForm] = useState(globalPricing || {
    express: { regular_price: 160000, current_price: 120000, discount_enabled: true, discount_badge: '25% OFF' },
    semi_pro: { regular_price: 350000, current_price: 280000, discount_enabled: true, discount_badge: '20% OFF' },
    stems_addon: { regular_price: 70000, current_price: 50000, discount_enabled: true, discount_badge: 'Ahorra $20.000 COP' }
  });
  const [savingPricing, setSavingPricing] = useState(false);

  const fetchAllAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, inboxData, pricingData] = await Promise.all([
        getAdminOrders(),
        getAdminContactMessages().catch(() => ({ messages: [] })),
        getPricingConfig().catch(() => null)
      ]);
      setOrders(ordersData.orders || []);
      setInboxMessages(inboxData.messages || []);
      if (pricingData) setPricingForm(pricingData);

      if (selectedOrder) {
        const updated = (ordersData.orders || []).find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  useEffect(() => {
    if (globalPricing) {
      setPricingForm(globalPricing);
    }
  }, [globalPricing]);

  // Production Brief 4 Copy Handlers (Section 16)
  const handleCopySection = (type, order) => {
    let textToCopy = '';
    
    if (type === 'LYRICS') {
      textToCopy = `=== LETRA & FRASES OBLIGATORIAS: ${order.order_number} ===\n` +
        `OCASIÓN / DESTINATARIO: ${order.story_details?.recipient_name || ''} - ${order.occasion}\n\n` +
        `HISTORIA:\n${order.story_details?.key_memories || ''}\n\n` +
        `FRASES OBLIGATORIAS:\n${(order.key_phrases || []).map(p => `• "${p}"`).join('\n')}`;
    } else if (type === 'STYLE') {
      textToCopy = `=== STYLE PROMPT: ${order.order_number} ===\n` +
        `GÉNERO: ${order.genre}\n` +
        `MOOD / EMOCIÓN: ${order.mood}\n` +
        `INTENSIDAD: ${order.story_details?.intensity || 'Media'}\n` +
        `TIPO DE VOZ: ${order.story_details?.voice_preference || 'Voz Principal'}\n` +
        `BPM SUGERIDO: 85-105 | TONALIDAD: Mayor (Cálida)\n` +
        `INSTRUMENTACIÓN: Guitarras acústicas, bajo orgánico, piano, percusión suave.`;
    } else if (type === 'EXCLUSIONS') {
      textToCopy = `=== EXCLUSIONES & EVITAR: ${order.order_number} ===\n` +
        `NO USAR: Sonidos sintéticos agresivos, autotune robótico extremo, distorsión heavy metal.\n` +
        `PRONUNCIACIÓN: Respetar nombres propios: ${order.story_details?.recipient_name || ''}.`;
    } else {
      // COPIAR TODO
      textToCopy = `
=== PRODUCTION BRIEF COMPLETO: MELOFILIA ===
PEDIDO: ${order.order_number}
TIER: ${order.product_tier}
GÉNERO: ${order.genre}
VIBRA / MOOD: ${order.mood}
INTENSIDAD: ${order.story_details?.intensity || 'Media'}
DESTINATARIO & OCASIÓN: ${order.story_details?.recipient_name || 'N/A'} (${order.occasion})

HISTORIA Y ANÉCDOTAS:
${order.story_details?.key_memories || 'N/A'}

FRASES Y NOMBRES OBLIGATORIOS:
${(order.key_phrases || []).map(p => `• "${p}"`).join('\n')}

PARÁMETROS TÉCNICOS:
BPM: 85-105 | Tonalidad: Mayor | Idioma: Español
Voz: ${order.story_details?.voice_preference || 'Voz Femenina'}
Instrumentos: Guitarras, piano, percusión sutil
Exclusiones: Sin distorsión estridente

NOTAS DEL CLIENTE:
${order.client_audio_notes || 'Ninguna'}
=============================================
`.trim();
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await updateAdminOrderStatus(selectedOrder.id, {
        status: newStatus,
        preview_audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-112347.mp3'
      });
      setActionMessage(`Estado actualizado con éxito a: ${newStatus}`);
      await fetchAllAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulatePayment = async (orderNumber) => {
    setActionLoading(true);
    try {
      await simulatePaymentApproval(orderNumber);
      setActionMessage(`Pago de Mercado Pago simulado como APROBADO para ${orderNumber}`);
      await fetchAllAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    setSavingPricing(true);
    setActionMessage(null);
    setError(null);
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

  const handleUpdateContactMessage = async (id, updateData) => {
    setActionLoading(true);
    try {
      await updateAdminContactMessage(id, updateData);
      setActionMessage('Mensaje del buzón actualizado exitosamente');
      await fetchAllAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.order_status === filterStatus);

  const filteredInbox = inboxFilter === 'ALL'
    ? inboxMessages
    : inboxMessages.filter(m => m.status === inboxFilter);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12141e] border border-[#262a40] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-white">Melofilia Admin Console</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Rol: {role}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Producción musical, briefs, control de calidad, buzón y precios.
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Role Switcher */}
        <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
          
          {/* Admin Tabs */}
          <div className="flex bg-[#090a0f] p-1 rounded-xl border border-[#262a40]">
            <button
              onClick={() => setAdminTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminTab === 'orders' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 Bandeja ({orders.length})
            </button>
            <button
              onClick={() => setAdminTab('inbox')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                adminTab === 'inbox' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3 h-3" /> Buzón ({inboxMessages.filter(m => m.status === 'NEW').length} nuevos)
            </button>
            <button
              onClick={() => setAdminTab('pricing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                adminTab === 'pricing' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3 h-3" /> Precios & Descuentos
            </button>
          </div>

          {/* Role Switcher */}
          <div className="flex bg-[#090a0f] p-1 rounded-xl border border-[#262a40]">
            <button
              onClick={() => setRole('OWNER')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                role === 'OWNER' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              OWNER
            </button>
            <button
              onClick={() => setRole('PRODUCER')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                role === 'PRODUCER' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              PRODUCER
            </button>
          </div>

          <button
            onClick={fetchAllAdminData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#181b2a] hover:bg-[#22273d] text-slate-300 border border-[#262a40] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
      {/* TAB 1: BANDEJA DE PEDIDOS & PRODUCTION BRIEF (SECCIÓN 16, 29)             */}
      {/* ========================================================================= */}
      {adminTab === 'orders' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#12141e] border border-[#262a40]">
              <div className="text-xs text-slate-400 font-semibold mb-1">Total Pedidos</div>
              <div className="text-2xl font-display font-extrabold text-white">{orders.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141e] border border-[#262a40]">
              <div className="text-xs text-amber-400 font-semibold mb-1">Pendientes Pago</div>
              <div className="text-2xl font-display font-extrabold text-amber-400">
                {orders.filter(o => o.order_status === 'AWAITING_PAYMENT').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141e] border border-[#262a40]">
              <div className="text-xs text-violet-400 font-semibold mb-1">En Producción / Cola</div>
              <div className="text-2xl font-display font-extrabold text-violet-400">
                {orders.filter(o => ['QUEUED', 'IN_PRODUCTION', 'QUALITY_REVIEW', 'CORRECTION_REQUESTED', 'IN_REVISION'].includes(o.order_status)).length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141e] border border-[#262a40]">
              <div className="text-xs text-emerald-400 font-semibold mb-1">Entregados / Listos</div>
              <div className="text-2xl font-display font-extrabold text-emerald-400">
                {orders.filter(o => ['READY_FOR_CLIENT_REVIEW', 'DELIVERED'].includes(o.order_status)).length}
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col: Order Cards (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {[
                  { id: 'ALL', label: 'Todos' },
                  { id: 'AWAITING_PAYMENT', label: 'Pendientes Pago' },
                  { id: 'QUEUED', label: 'En Cola' },
                  { id: 'IN_PRODUCTION', label: 'En Producción' },
                  { id: 'READY_FOR_CLIENT_REVIEW', label: 'Revisión Cliente' },
                  { id: 'DELIVERED', label: 'Entregados' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      filterStatus === tab.id
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-[#12141e] text-slate-400 border-[#262a40] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                {filteredOrders.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#181b2a] border-amber-500 shadow-lg shadow-amber-500/10'
                          : 'bg-[#12141e] border-[#262a40] hover:border-slate-600'
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

                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.order_status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300' :
                            order.order_status === 'AWAITING_PAYMENT' ? 'bg-rose-500/20 text-rose-300' :
                            order.order_status === 'READY_FOR_CLIENT_REVIEW' ? 'bg-violet-500/20 text-violet-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {order.order_status.replace(/_/g, ' ')}
                          </span>
                          <div className="text-xs font-mono font-bold text-slate-300 mt-1">
                            ${order.total_amount?.toLocaleString('es-CO')} {order.currency}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#262a40]/60 text-[11px] text-slate-400">
                        <span>Plan: <strong>{order.product_tier}</strong> {order.has_stems ? '+ STEMS.ZIP' : ''}</span>
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          Ver Production Brief <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Col: Production Brief with 4 Copy Actions (5 cols) */}
            <div className="lg:col-span-5">
              {selectedOrder ? (
                <div className="sticky top-24 p-6 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-6 shadow-2xl">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#262a40]">
                    <div>
                      <h3 className="font-display font-bold text-base text-white">Production Brief</h3>
                      <p className="text-xs font-mono text-amber-400">{selectedOrder.order_number}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-300 bg-[#181b2a] px-2.5 py-1 rounded-md border border-[#262a40]">
                      {selectedOrder.product_tier}
                    </span>
                  </div>

                  {/* 4 Copy Buttons strictly from Section 16 */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopySection('LYRICS', selectedOrder)}
                      className="p-2.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-200 border border-[#262a40] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedType === 'LYRICS' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>COPIAR LETRA</span>
                    </button>
                    <button
                      onClick={() => handleCopySection('STYLE', selectedOrder)}
                      className="p-2.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-200 border border-[#262a40] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedType === 'STYLE' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>COPIAR STYLE</span>
                    </button>
                    <button
                      onClick={() => handleCopySection('EXCLUSIONS', selectedOrder)}
                      className="p-2.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-200 border border-[#262a40] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedType === 'EXCLUSIONS' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>COPIAR EXCLUSIONES</span>
                    </button>
                    <button
                      onClick={() => handleCopySection('ALL', selectedOrder)}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    >
                      {copiedType === 'ALL' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>COPIAR TODO</span>
                    </button>
                  </div>

                  {/* Brief Data Fields */}
                  <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">Destinatario & Ocasión:</span>
                      <span className="text-white font-medium">
                        {selectedOrder.story_details?.recipient_name || 'N/A'} ({selectedOrder.occasion})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Historia / Anécdotas:</span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed bg-[#12141e] p-2.5 rounded-lg border border-[#262a40]">
                        {selectedOrder.story_details?.key_memories || 'Sin descripción adicional'}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Frases Obligatorias en Letra:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(selectedOrder.key_phrases || []).map((p, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono border border-amber-500/20">
                            "{p}"
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Parámetros Musicales:</span>
                      <span className="text-slate-200">
                        {selectedOrder.genre} · {selectedOrder.mood} · BPM 85-105
                      </span>
                    </div>
                  </div>

                  {/* Workflow State Machine Buttons */}
                  <div className="space-y-3 pt-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Avanzar Estado Operativo:
                    </label>

                    {selectedOrder.order_status === 'AWAITING_PAYMENT' && (
                      <button
                        onClick={() => handleSimulatePayment(selectedOrder.order_number)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Simular Pago Aprobado</span>
                      </button>
                    )}

                    {selectedOrder.order_status === 'QUEUED' && (
                      <button
                        onClick={() => handleStatusChange('IN_PRODUCTION')}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all active:scale-95"
                      >
                        <Music className="w-4 h-4" />
                        <span>Mover a "En Producción"</span>
                      </button>
                    )}

                    {selectedOrder.order_status === 'IN_PRODUCTION' && (
                      <button
                        onClick={() => handleStatusChange('QUALITY_REVIEW')}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all active:scale-95"
                      >
                        <Sliders className="w-4 h-4" />
                        <span>Enviar a Control de Calidad</span>
                      </button>
                    )}

                    {selectedOrder.order_status === 'QUALITY_REVIEW' && (
                      <button
                        onClick={() => handleStatusChange('READY_FOR_CLIENT_REVIEW')}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>Habilitar Preview al Cliente</span>
                      </button>
                    )}

                    {selectedOrder.order_status === 'CORRECTION_REQUESTED' && (
                      <button
                        onClick={() => handleStatusChange('IN_REVISION')}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition-all active:scale-95"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Iniciar Revisión de Corrección</span>
                      </button>
                    )}

                    {(selectedOrder.order_status === 'READY_FOR_CLIENT_REVIEW' || selectedOrder.order_status === 'IN_REVISION') && (
                      <button
                        onClick={() => handleStatusChange('DELIVERED')}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Entregar Master Definitivo (Bóveda 7 Días)</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectOrderToView(selectedOrder.order_number)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-300 border border-[#262a40] text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver en Sala Privada del Cliente</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#12141e] border border-[#262a40] text-center text-slate-400 text-xs">
                  Selecciona un pedido de la lista para ver su Production Brief y opciones de copia.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUZÓN DE CONTACTO (SECCIÓN 30-35)                                  */}
      {/* ========================================================================= */}
      {adminTab === 'inbox' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="p-6 rounded-3xl bg-[#12141e] border border-[#262a40] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Buzón de Contacto, Cotizaciones y Reviews
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Atiende mensajes de clientes, cotizaciones, reviews y consultas vinculadas a pedidos.
              </p>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'NEW', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setInboxFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    inboxFilter === st
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-[#090a0f] text-slate-400 border-[#262a40]'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* List */}
            <div className="lg:col-span-6 space-y-3">
              {filteredInbox.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#12141e] border border-[#262a40] text-center text-xs text-slate-400">
                  No hay mensajes en este estado.
                </div>
              ) : (
                filteredInbox.map((msg) => {
                  const isSel = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSel
                          ? 'bg-[#181b2a] border-amber-500 shadow-md'
                          : 'bg-[#12141e] border-[#262a40] hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{msg.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {msg.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{msg.email}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          msg.status === 'NEW' ? 'bg-amber-500 text-black' :
                          msg.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-[#262a40] text-slate-300'
                        }`}>
                          {msg.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>

                      {msg.order_number && (
                        <div className="mt-2 text-[10px] font-mono text-amber-400">
                          Vinculado a pedido: {msg.order_number}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Detail & Response Panel */}
            <div className="lg:col-span-6">
              {selectedMessage ? (
                <div className="p-6 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#262a40]">
                    <div>
                      <h4 className="font-bold text-sm text-white">{selectedMessage.name}</h4>
                      <a href={`mailto:${selectedMessage.email}`} className="text-xs text-amber-400 hover:underline">
                        {selectedMessage.email}
                      </a>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(selectedMessage.created_at).toLocaleDateString('es-CO')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>

                  {/* Review Approval Switch (Section 35) */}
                  {selectedMessage.category === 'REVIEW' && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">Aprobar Review para Landing Page</span>
                      </div>
                      <button
                        onClick={() => handleUpdateContactMessage(selectedMessage.id, {
                          is_approved_review: !selectedMessage.is_approved_review
                        })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          selectedMessage.is_approved_review 
                            ? 'bg-emerald-500 text-black' 
                            : 'bg-[#181b2a] text-slate-300 border border-[#262a40]'
                        }`}
                      >
                        {selectedMessage.is_approved_review ? '✓ Aprobada' : 'Pendiente'}
                      </button>
                    </div>
                  )}

                  {/* Status & Actions */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Cambiar Estado:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['NEW', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateContactMessage(selectedMessage.id, { status: st })}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                            selectedMessage.status === st 
                              ? 'bg-violet-600 text-white border-violet-500' 
                              : 'bg-[#181b2a] text-slate-400 border-[#262a40]'
                          }`}
                        >
                          {st.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#12141e] border border-[#262a40] text-center text-xs text-slate-400">
                  Selecciona un mensaje del buzón para ver el detalle y gestionar la respuesta.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GESTIÓN DE PRECIOS & DESCUENTOS                                    */}
      {/* ========================================================================= */}
      {adminTab === 'pricing' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-[#12141e] border border-[#262a40]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262a40]">
              <div>
                <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  Control Comercial de Precios & Simulación de Descuentos
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ajusta los precios de cobro real (COP), precios tachados y badges promocionales.
                </p>
              </div>

              {role !== 'OWNER' && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  ⚠️ Solo el rol OWNER tiene permiso para modificar precios.
                </div>
              )}
            </div>

            <form onSubmit={handleSavePricing} className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. PLAN EXPRESS */}
                <div className="p-6 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-[#181b2a] text-slate-300 text-xs font-bold uppercase">
                      Plan Express
                    </span>
                    <span className="text-[11px] text-slate-400">Entrega 48h</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Cobro (COP):</label>
                      <input
                        type="number"
                        step="1000"
                        disabled={role !== 'OWNER'}
                        value={pricingForm.express?.current_price || ''}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          express: { ...pricingForm.express, current_price: Number(e.target.value) }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Precio Regular (Tachado):</label>
                      <input
                        type="number"
                        step="1000"
                        disabled={role !== 'OWNER'}
                        value={pricingForm.express?.regular_price || ''}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          express: { ...pricingForm.express, regular_price: Number(e.target.value) }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-slate-300 font-mono text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#262a40] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={role !== 'OWNER'}
                          checked={pricingForm.express?.discount_enabled || false}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            express: { ...pricingForm.express, discount_enabled: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <span>Mostrar Descuento</span>
                      </label>
                    </div>

                    {pricingForm.express?.discount_enabled && (
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Texto del Badge:</label>
                        <input
                          type="text"
                          disabled={role !== 'OWNER'}
                          value={pricingForm.express?.discount_badge || ''}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            express: { ...pricingForm.express, discount_badge: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#12141e] border border-[#262a40] text-xs text-amber-300 font-semibold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. PLAN SEMI-PRO */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1c1a2e] to-[#090a0f] border-2 border-amber-500/40 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold uppercase border border-amber-500/30">
                      Plan Semi-Pro ⭐
                    </span>
                    <span className="text-[11px] text-amber-400 font-semibold">Entrega 72h</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Cobro (COP):</label>
                      <input
                        type="number"
                        step="1000"
                        disabled={role !== 'OWNER'}
                        value={pricingForm.semi_pro?.current_price || ''}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          semi_pro: { ...pricingForm.semi_pro, current_price: Number(e.target.value) }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-amber-500/40 text-white font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Precio Regular (Tachado):</label>
                      <input
                        type="number"
                        step="1000"
                        disabled={role !== 'OWNER'}
                        value={pricingForm.semi_pro?.regular_price || ''}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          semi_pro: { ...pricingForm.semi_pro, regular_price: Number(e.target.value) }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-slate-300 font-mono text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#262a40] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={role !== 'OWNER'}
                          checked={pricingForm.semi_pro?.discount_enabled || false}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            semi_pro: { ...pricingForm.semi_pro, discount_enabled: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <span>Mostrar Descuento</span>
                      </label>
                    </div>

                    {pricingForm.semi_pro?.discount_enabled && (
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Texto del Badge:</label>
                        <input
                          type="text"
                          disabled={role !== 'OWNER'}
                          value={pricingForm.semi_pro?.discount_badge || ''}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            semi_pro: { ...pricingForm.semi_pro, discount_badge: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#12141e] border border-[#262a40] text-xs text-amber-300 font-semibold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. ADD-ON STEMS */}
                <div className="p-6 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-[#181b2a] text-slate-300 text-xs font-bold uppercase">
                      STEMS.ZIP
                    </span>
                    <span className="text-[11px] text-slate-400">Add-on</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Precio (COP):</label>
                      <input
                        type="number"
                        step="1000"
                        disabled={role !== 'OWNER'}
                        value={pricingForm.stems_addon?.current_price || ''}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          stems_addon: { ...pricingForm.stems_addon, current_price: Number(e.target.value) }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Precio Regular:</label>
                      <input
                        type="number"
                        step="1000"
                        disabled={role !== 'OWNER'}
                        value={pricingForm.stems_addon?.regular_price || ''}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          stems_addon: { ...pricingForm.stems_addon, regular_price: Number(e.target.value) }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-slate-300 font-mono text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#262a40] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={role !== 'OWNER'}
                          checked={pricingForm.stems_addon?.discount_enabled || false}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            stems_addon: { ...pricingForm.stems_addon, discount_enabled: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <span>Mostrar Descuento</span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {role === 'OWNER' && (
                <div className="flex justify-end pt-4 border-t border-[#262a40]">
                  <button
                    type="submit"
                    disabled={savingPricing}
                    className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {savingPricing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Guardar Nuevos Precios & Descuentos</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
