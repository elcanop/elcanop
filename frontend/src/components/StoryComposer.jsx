import React, { useState, useEffect } from 'react';
import { 
  Heart, Sparkles, Music, Mic, Upload, ArrowRight, ArrowLeft, 
  Check, CreditCard, ShieldCheck, Plus, X, AlertCircle, Loader2, Tag, 
  Volume2, FastForward, Play, Square, FileText, CheckCircle2 
} from 'lucide-react';
import { createOrder } from '../utils/api';
import confetti from 'canvas-confetti';

export default function StoryComposer({ initialTier = 'SEMI_PRO', onOrderCreated, pricing }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState('Guardado en borrador');

  const expressConfig = pricing?.express || { regular_price: 160000, current_price: 120000, discount_enabled: true, discount_badge: '25% OFF' };
  const semiProConfig = pricing?.semi_pro || { regular_price: 350000, current_price: 280000, discount_enabled: true, discount_badge: '20% OFF' };
  const stemsConfig = pricing?.stems_addon || { regular_price: 70000, current_price: 50000, discount_enabled: true, discount_badge: 'Ahorra $20.000' };

  // Form State (6 Steps)
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('melofilia_draft_story');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      // Paso 1: Ocasión & Destinatario
      recipient_name: '',
      occasion: 'Aniversario',
      // Paso 2: Historia
      key_memories: '',
      key_phrases: ['Nuestra historia recién comienza', 'Juntos en cada paso'],
      newPhrase: '',
      // Paso 3: Identidad Musical
      genre: 'Balada Pop Acústica',
      subgenre: 'Acústico / Íntimo',
      mood: 'Emotiva y Romántica',
      intensity: 'Media', // Suave, Media, Enérgica, Épica
      voice_preference: 'Voz Femenina',
      // Paso 4: Referencias
      rhythm_reference_type: 'none', // 'none' | 'recorded' | 'uploaded'
      vocal_reference_type: 'none',  // 'none' | 'recorded' | 'uploaded'
      client_audio_notes: '',
      // Paso 5: Producto
      product_tier: initialTier,
      has_stems: false
    };
  });

  // Autosave Draft
  useEffect(() => {
    localStorage.setItem('melofilia_draft_story', JSON.stringify(formData));
    setLastSaved(`Guardado automáticamente a las ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`);
  }, [formData]);

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
    setStep(prev => Math.min(6, prev + 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setError(null);
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
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
        genre: `${formData.genre} (${formData.subgenre})`,
        mood: `${formData.mood} · Intensidad: ${formData.intensity}`,
        occasion: formData.occasion,
        story_details: {
          recipient_name: formData.recipient_name,
          key_memories: formData.key_memories,
          voice_preference: formData.voice_preference,
          intensity: formData.intensity,
          subgenre: formData.subgenre
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

      localStorage.removeItem('melofilia_draft_story');

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

  const stepTitles = [
    'PASO 1 — OCASIÓN',
    'PASO 2 — HISTORIA',
    'PASO 3 — IDENTIDAD MUSICAL',
    'PASO 4 — REFERENCIAS (OPCIONAL)',
    'PASO 5 — PRODUCTO',
    'PASO 6 — RESUMEN & PAGO'
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Step Indicator Header */}
      <div className="mb-10 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Constructor Guiado Melofilia</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          {stepTitles[step - 1]}
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-[#181b2a] h-2 rounded-full overflow-hidden max-w-md mx-auto border border-[#262a40]">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
        
        <div className="text-[11px] text-slate-500 font-medium">
          {lastSaved}
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

        {/* PASO 1 — OCASIÓN */}
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
                className="w-full px-4 py-3.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Selecciona la ocasión:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  'Cumpleaños', 'Aniversario', 'Amor', 'Homenaje',
                  'Amistad', 'Propuesta', 'Recuerdo', 'Celebración', 'Otra'
                ].map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setFormData({ ...formData, occasion: occ })}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-center transition-all ${
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

        {/* PASO 2 — HISTORIA */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-200">
                  Escribe tu historia, recuerdos y anécdotas <span className="text-amber-400">*</span>
                </label>
                <span className="text-xs font-mono text-slate-400">
                  {formData.key_memories.length} caracteres
                </span>
              </div>
              <textarea
                rows={6}
                value={formData.key_memories}
                onChange={(e) => setFormData({ ...formData, key_memories: e.target.value })}
                placeholder="Ej: Nos conocimos en una cafetería en Medellín un día lluvioso. Ella siempre pide capuchino sin azúcar. El viaje a Santa Marta donde nos comprometimos frente al mar..."
                className="w-full px-4 py-3.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm leading-relaxed"
              />
              
              {/* Contextual Prompts */}
              <div className="p-3.5 rounded-2xl bg-[#090a0f] border border-[#262a40] mt-3 space-y-1 text-xs text-slate-400">
                <span className="font-bold text-amber-400">💡 Sugerencias contextuales:</span>
                <p>• Menciona lugares especiales (ciudades, cafeterías, viajes).</p>
                <p>• Describe apodos cariñosos o frases divertidas que solo ustedes entiendan.</p>
                <p>• Explica la emoción central: ¿quieres que sea nostálgica, romántica o para celebrar?</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Frases o nombres obligatorios que deben rimar en la letra:
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newPhrase}
                  onChange={(e) => setFormData({ ...formData, newPhrase: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhrase())}
                  placeholder="Ej: 'Mi negrita linda', 'Siempre juntos'"
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

        {/* PASO 3 — IDENTIDAD MUSICAL */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Género Principal:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'Pop', 'Reggaetón', 'Salsa', 'Vallenato',
                  'Bachata', 'Balada', 'Urbano', 'Rock'
                ].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, genre: g })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
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
                  Estado Emocional:
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="Emotiva y Romántica">Emotiva y Romántica (Para tocar el corazón)</option>
                  <option value="Alegre y Enérgica">Alegre y Enérgica (Para cantar y bailar)</option>
                  <option value="Nostálgica y Profunda">Nostálgica y Profunda (Recuerdos de vida)</option>
                  <option value="Épica y Triunfal">Épica y Triunfal (Homenaje de superación)</option>
                  <option value="Divertida y Pícara">Divertida y Alegre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Intensidad Musical:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Suave', 'Media', 'Enérgica', 'Épica'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, intensity: lvl })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        formData.intensity === lvl
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-[#090a0f] border-[#262a40] text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Tipo de Voz / Estilo Vocal:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Voz Femenina', 'Voz Masculina', 'Dúo Armónico', 'Sin Preferencia'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFormData({ ...formData, voice_preference: v })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      formData.voice_preference === v
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#181b2a] border-[#262a40] text-slate-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASO 4 — REFERENCIAS (OPCIONALES) */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Las grabaciones son completamente opcionales.</strong> Si no tienes referencias de audio, puedes continuar directamente.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Referencia Rítmica */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>Referencia Rítmica (Opcional)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Para explicar cadencia, ritmo o una idea musical específica.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rhythm_reference_type: 'recorded' })}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.rhythm_reference_type === 'recorded'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#181b2a] border-[#262a40] text-slate-300'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" /> Grabar Ritmo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rhythm_reference_type: 'uploaded' })}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.rhythm_reference_type === 'uploaded'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#181b2a] border-[#262a40] text-slate-300'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Subir Audio
                  </button>
                </div>
              </div>

              {/* Referencia Vocal */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Referencia Vocal (Opcional)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Para explicar intención, pronunciación o forma de cantar.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, vocal_reference_type: 'recorded' })}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.vocal_reference_type === 'recorded'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#181b2a] border-[#262a40] text-slate-300'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" /> Grabar Voz
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, vocal_reference_type: 'uploaded' })}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.vocal_reference_type === 'uploaded'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#181b2a] border-[#262a40] text-slate-300'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Subir Audio
                  </button>
                </div>
              </div>

            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Notas adicionales para el productor (Opcional):
              </label>
              <input
                type="text"
                value={formData.client_audio_notes}
                onChange={(e) => setFormData({ ...formData, client_audio_notes: e.target.value })}
                placeholder="Ej: 'Inspiración en acústicos de Juanes' o 'Solo de guitarra suave al final'"
                className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            {/* Prominent Button: CONTINUAR SIN GRABACIÓN as per Section 4 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-4 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>CONTINUAR SIN GRABACIÓN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 5 — PRODUCTO */}
        {step === 5 && (
          <div className="space-y-6">
            <label className="block text-sm font-semibold text-slate-200 mb-1">
              Selecciona tu modalidad de producción:
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
                <p className="text-xs text-slate-400 mb-4">Producto de entrada con entrega en 48h.</p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Canción y letra personalizada</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Master final en MP3 (320kbps)</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Letra en PDF lista para imprimir</li>
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
                <p className="text-xs text-slate-400 mb-4">Producto de mayor elaboración con entrega en 72h.</p>
                <ul className="text-xs space-y-2 text-slate-200">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Letra con mayor desarrollo y métrica</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Master en MP3 + WAV Studio (24-bit)</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Carátula digital personalizada + PDF</li>
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
                    Incluir Stems en STEMS.ZIP (+ ${stemsConfig.current_price?.toLocaleString('es-CO')} COP)
                  </div>
                  <div className="text-xs text-slate-400">
                    Pistas multipista individuales (Voz, Batería, Bajo, Teclados, Guitarras).
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

        {/* PASO 6 — RESUMEN & PAGO */}
        {step === 6 && (
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Al confirmar, se generará tu <strong>Número Único de Pedido (MP-2026-XXXXXX)</strong> y serás redirigido al Checkout Seguro de <strong>Mercado Pago</strong>.
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
                Teléfono / WhatsApp (Para coordinar entrega y revisión)
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
            <div className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-2.5 text-xs text-slate-300">
              <div className="font-bold text-sm text-white mb-1">Ficha Resumen de tu Pedido:</div>
              <div className="flex justify-between"><span>Dedicada a:</span> <strong className="text-slate-100">{formData.recipient_name} ({formData.occasion})</strong></div>
              <div className="flex justify-between"><span>Género & Emoción:</span> <strong className="text-slate-100">{formData.genre} · {formData.mood}</strong></div>
              <div className="flex justify-between"><span>Modalidad:</span> <strong className="text-slate-100">{formData.product_tier} {formData.has_stems ? '(con STEMS.ZIP)' : ''}</strong></div>
              <div className="flex justify-between"><span>Correcciones incluidas:</span> <strong className="text-emerald-400">1 Ronda Garantizada</strong></div>
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
                  <span>Creando orden y conectando con pasarela...</span>
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

          {step < 6 && (
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
