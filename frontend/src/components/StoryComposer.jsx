import React, { useState } from 'react';
import { 
  Heart, Sparkles, Music, Mic, Upload, ArrowRight, ArrowLeft, 
  Check, CreditCard, ShieldCheck, Plus, X, AlertCircle, Loader2, Tag 
} from 'lucide-react';
import { createOrder } from '../utils/api';
import confetti from 'canvas-confetti';

export default function StoryComposer({ initialTier = 'SEMI_PRO', onOrderCreated, pricing }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const expressConfig = pricing?.express || { regular_price: 160000, current_price: 120000, discount_enabled: true, discount_badge: '25% OFF' };
  const semiProConfig = pricing?.semi_pro || { regular_price: 350000, current_price: 280000, discount_enabled: true, discount_badge: '20% OFF' };
  const stemsConfig = pricing?.stems_addon || { regular_price: 70000, current_price: 50000, discount_enabled: true, discount_badge: 'Ahorra $20.000' };

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    recipient_name: '',
    occasion: 'Aniversario',
    key_memories: '',
    key_phrases: ['Nuestra historia recién comienza', 'Juntos en cada paso'],
    newPhrase: '',
    genre: 'Balada Pop Acústica',
    mood: 'Emotiva y Romántica',
    voice_preference: 'Voz Femenina',
    client_audio_notes: '',
    product_tier: initialTier,
    has_stems: false
  });

  // Dynamic Price Calculation
  const basePrice = formData.product_tier === 'EXPRESS' 
    ? expressConfig.current_price 
    : semiProConfig.current_price;
  const stemsPrice = formData.has_stems ? stemsConfig.current_price : 0;
  const totalPrice = basePrice + stemsPrice;

  // Add Phrase Tag
  const handleAddPhrase = () => {
    if (formData.newPhrase.trim()) {
      setFormData({
        ...formData,
        key_phrases: [...formData.key_phrases, formData.newPhrase.trim()],
        newPhrase: ''
      });
    }
  };

  const handleRemovePhrase = (index) => {
    setFormData({
      ...formData,
      key_phrases: formData.key_phrases.filter((_, i) => i !== index)
    });
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.recipient_name.trim()) {
        setError('Por favor indica a quién va dedicada la canción.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.key_memories.trim() || formData.key_memories.length < 20) {
        setError('Cuéntanos un poco más de detalles o anécdotas (mínimo 20 caracteres).');
        return;
      }
    }
    setStep(prev => Math.min(5, prev + 1));
  };

  const handlePrev = () => {
    setError(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  // Submit Order & Trigger Mercado Pago
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_name || !formData.customer_email) {
      setError('Por favor completa tu nombre y correo electrónico para enviar el pedido.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        product_tier: formData.product_tier,
        genre: formData.genre,
        mood: formData.mood,
        occasion: formData.occasion,
        story_details: {
          recipient_name: formData.recipient_name,
          key_memories: formData.key_memories,
          voice_preference: formData.voice_preference
        },
        key_phrases: formData.key_phrases,
        has_stems: formData.has_stems,
        client_audio_notes: formData.client_audio_notes
      };

      const response = await createOrder(orderPayload);
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (response.checkoutUrl) {
        onOrderCreated(response.order.order_number, response.checkoutUrl);
      } else {
        onOrderCreated(response.order.order_number);
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con la pasarela de pagos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Step Indicator Header */}
      <div className="mb-10 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Constructor de Canción Personalizada</span>
        </div>
        <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
          Paso {step} de 5: {
            step === 1 ? 'Destinatario y Ocasión' :
            step === 2 ? 'Tu Historia y Frases Clave' :
            step === 3 ? 'Estilo Musical y Emoción' :
            step === 4 ? 'Nivel de Producción y Complementos' :
            'Tus Datos y Pago Seguro'
          }
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-[#181b2a] h-2 rounded-full overflow-hidden max-w-md mx-auto border border-[#262a40]">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#12141e] border border-[#262a40] shadow-2xl">
        
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Destinatario y Ocasión */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                ¿A quién va dedicada la canción? <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                placeholder="Ej: A mi esposa Mariana, a mi mamá Luz, o a mi mejor amigo Carlos"
                className="w-full px-4 py-3.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                ¿Cuál es la ocasión especial?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'Aniversario', 'Cumpleaños', 'Boda / Matrimonio', 'Declaración de Amor',
                  'Día de la Madre/Padre', 'Agradecimiento', 'Homenaje / Recuerdo', 'Motivación'
                ].map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setFormData({ ...formData, occasion: occ })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      formData.occasion === occ
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-[#181b2a] border-[#262a40] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Historia y Frases Clave */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Cuéntanos la historia, anécdotas y detalles que quieres plasmar <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.key_memories}
                onChange={(e) => setFormData({ ...formData, key_memories: e.target.value })}
                placeholder="Ej: Nos conocimos hace 5 años en un café en Bogotá. Ella siempre pide capuchino sin azúcar. El viaje a Cartagena donde le pedí matrimonio..."
                className="w-full px-4 py-3.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Entre más detalles nos des, más única y emocionante será la letra.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Nombres, frases o palabras obligatorias en la canción
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newPhrase}
                  onChange={(e) => setFormData({ ...formData, newPhrase: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhrase())}
                  placeholder="Ej: 'Mi negrita linda', 'El viaje a Guatapé', 'Siempre juntos'"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddPhrase}
                  className="px-4 py-2.5 rounded-xl bg-[#181b2a] hover:bg-[#22273d] text-amber-300 border border-[#262a40] text-sm font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              {/* Tag List */}
              <div className="flex flex-wrap gap-2">
                {formData.key_phrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
                  >
                    <span>"{phrase}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhrase(idx)}
                      className="hover:text-amber-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Estilo Musical & Emoción */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Género Musical Principal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  'Balada Pop Acústica', 'Urbano / Reggaetón Suave', 'Pop Latino Moderno',
                  'Vallenato Romántico', 'Rock Acústico', 'Bolero Tradicional',
                  'Salsa Romántica', 'Folk / Indie', 'Ranchera / Popular'
                ].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, genre: g })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      formData.genre === g
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-[#181b2a] border-[#262a40] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Emoción o Vibra de la Canción
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="Emotiva y Romántica">Emotiva y Romántica (Para llorar de felicidad)</option>
                  <option value="Alegre y Enérgica">Alegre y Enérgica (Para cantar y bailar)</option>
                  <option value="Nostálgica y Profunda">Nostálgica y Profunda (Recuerdos de vida)</option>
                  <option value="Épica y Triunfal">Épica y Triunfal (Homenaje de superación)</option>
                  <option value="Divertida y Cósmica">Divertida y Humorística</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Preferencia de Voz
                </label>
                <select
                  value={formData.voice_preference}
                  onChange={(e) => setFormData({ ...formData, voice_preference: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="Voz Femenina">Voz Femenina (Cálida / Suave)</option>
                  <option value="Voz Masculina">Voz Masculina (Expresiva / Profunda)</option>
                  <option value="Dúo Armónico">Dúo / Voces Combinadas</option>
                  <option value="Sin Preferencia">Lo que mejor quede según el productor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Notas adicionales para los productores (Opcional)
              </label>
              <input
                type="text"
                value={formData.client_audio_notes}
                onChange={(e) => setFormData({ ...formData, client_audio_notes: e.target.value })}
                placeholder="Ej: 'Me gustaría que tenga un solo de saxo suave al final' o 'estilo Carlos Vives'"
                className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Selección de Nivel y Complementos */}
        {step === 4 && (
          <div className="space-y-6">
            <label className="block text-sm font-semibold text-slate-200 mb-1">
              Selecciona tu formato de entrega:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Express */}
              <div 
                onClick={() => setFormData({ ...formData, product_tier: 'EXPRESS' })}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.product_tier === 'EXPRESS'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#090a0f] border-[#262a40] text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-display font-bold text-lg">Express</span>
                  <div className="text-right">
                    {expressConfig.discount_enabled && (
                      <div className="line-through text-slate-500 font-mono text-xs">
                        ${expressConfig.regular_price?.toLocaleString('es-CO')}
                      </div>
                    )}
                    <span className="font-extrabold text-amber-400 font-mono">
                      ${expressConfig.current_price?.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">Entrega en {expressConfig.delivery_hours || 48}h en Master MP3 de alta fidelidad.</p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Letra 100% personalizada</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1 Corrección incluida</li>
                </ul>
              </div>

              {/* Semi-Pro */}
              <div 
                onClick={() => setFormData({ ...formData, product_tier: 'SEMI_PRO' })}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.product_tier === 'SEMI_PRO'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-[#090a0f] border-[#262a40] text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-display font-bold text-lg flex items-center gap-1.5">
                    Semi-Pro <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-black font-bold">Top</span>
                  </span>
                  <div className="text-right">
                    {semiProConfig.discount_enabled && (
                      <div className="line-through text-slate-500 font-mono text-xs">
                        ${semiProConfig.regular_price?.toLocaleString('es-CO')}
                      </div>
                    )}
                    <span className="font-extrabold text-amber-400 font-mono">
                      ${semiProConfig.current_price?.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">Entrega en {semiProConfig.delivery_hours || 72}h con Master MP3 + WAV Studio + PDF Letra.</p>
                <ul className="text-xs space-y-2 text-slate-200">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Master WAV sin compresión + MP3</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> PDF de Letras oficial para imprimir</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> 1 Corrección garantizada</li>
                </ul>
              </div>

            </div>

            {/* Add-on: Stems */}
            <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="stems_addon"
                  checked={formData.has_stems}
                  onChange={(e) => setFormData({ ...formData, has_stems: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="stems_addon" className="cursor-pointer">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Incluir Stems Multipista en ZIP (+ ${stemsConfig.current_price?.toLocaleString('es-CO')} COP)
                  </div>
                  <div className="text-xs text-slate-400">
                    Descarga pistas individuales separadas (Voz, Batería, Bajo, Guitarras, Teclados).
                  </div>
                </label>
              </div>
              <div className="text-right hidden sm:block">
                {stemsConfig.discount_enabled && (
                  <span className="line-through text-slate-500 font-mono text-xs block">
                    +${stemsConfig.regular_price?.toLocaleString('es-CO')}
                  </span>
                )}
                <span className="text-sm font-bold text-amber-400 font-mono">
                  +${stemsConfig.current_price?.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            {/* Total Box */}
            <div className="p-4 rounded-2xl bg-[#181b2a] border border-[#262a40] flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-300">Total a Pagar (COP):</span>
              <span className="text-2xl font-display font-extrabold text-amber-400">
                ${totalPrice.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>
        )}

        {/* STEP 5: Datos de Contacto y Checkout Mercado Pago */}
        {step === 5 && (
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Al confirmar, se generará tu <strong>Número Único de Pedido</strong> y serás redirigido al Checkout Seguro de <strong>Mercado Pago</strong> para procesar el pago en Sandbox.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Tu Nombre Completo <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Tu Correo Electrónico <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="juan@ejemplo.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Teléfono / WhatsApp (Para coordinar entrega y corrección)
              </label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                placeholder="+57 300 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            {/* Summary Card */}
            <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-2 text-xs text-slate-300">
              <div className="font-bold text-sm text-white mb-1">Resumen del Pedido:</div>
              <div className="flex justify-between"><span>Dedicada a:</span> <strong className="text-slate-100">{formData.recipient_name} ({formData.occasion})</strong></div>
              <div className="flex justify-between"><span>Género / Vibra:</span> <strong className="text-slate-100">{formData.genre} · {formData.mood}</strong></div>
              <div className="flex justify-between"><span>Plan de Producción:</span> <strong className="text-slate-100">{formData.product_tier} {formData.has_stems ? '(con Stems ZIP)' : ''}</strong></div>
              <div className="flex justify-between pt-2 border-t border-[#262a40] text-sm">
                <span className="font-bold text-white">Total a Pagar:</span>
                <strong className="text-amber-400 font-extrabold text-base">${totalPrice.toLocaleString('es-CO')} COP</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-base shadow-xl shadow-amber-500/25 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creando orden y conectando con Mercado Pago...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pagar ${totalPrice.toLocaleString('es-CO')} COP con Mercado Pago</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 mt-6 border-t border-[#262a40]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-300 text-sm font-semibold border border-[#262a40] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
          ) : (
            <div></div>
          )}

          {step < 5 && (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
