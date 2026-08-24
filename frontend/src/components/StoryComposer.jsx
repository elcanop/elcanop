import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, Music, Mic, Upload, ArrowRight, ArrowLeft, 
  Check, CreditCard, ShieldCheck, Plus, X, AlertCircle, Loader2, Tag, 
  Volume2, FastForward, Play, Square, FileText, CheckCircle2, Trash2, Pause 
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

  // Rhythm Audio State
  const [rhythmAudio, setRhythmAudio] = useState(null); // { url, base64, name, type: 'recorded' | 'uploaded' }
  const [isRecordingRhythm, setIsRecordingRhythm] = useState(false);
  const [rhythmSeconds, setRhythmSeconds] = useState(0);
  const rhythmMediaRecorderRef = useRef(null);
  const rhythmChunksRef = useRef([]);
  const rhythmTimerRef = useRef(null);
  const rhythmFileInputRef = useRef(null);

  // Vocal Audio State
  const [voiceAudio, setVoiceAudio] = useState(null); // { url, base64, name, type: 'recorded' | 'uploaded' }
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceMediaRecorderRef = useRef(null);
  const voiceChunksRef = useRef([]);
  const voiceTimerRef = useRef(null);
  const voiceFileInputRef = useRef(null);

  // Form State (6 Steps) — Key phrases starts EMPTY without preconfigured tags
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('melofilia_draft_story');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          key_phrases: parsed.key_phrases || []
        };
      } catch (e) {}
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
      key_phrases: [], // Sin etiquetas preconfiguradas
      newPhrase: '',
      // Paso 3: Identidad Musical
      genre: 'Balada Pop Acústica',
      subgenre: 'Acústico / Íntimo',
      mood: 'Emotiva y Romántica',
      intensity: 'Media', // Suave, Media, Enérgica, Épica
      voice_preference: 'Voz Femenina',
      // Paso 4: Referencias
      rhythm_reference_type: 'none',
      vocal_reference_type: 'none',
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
    if (formData.newPhrase && formData.newPhrase.trim()) {
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

  // --- AUDIO RECORDING & UPLOAD HANDLERS ---

  // 1. Rhythm Recording
  const startRecordingRhythm = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      rhythmMediaRecorderRef.current = mediaRecorder;
      rhythmChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) rhythmChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(rhythmChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setRhythmAudio({
            url,
            base64: reader.result,
            name: `Ritmo_Grabado_${Date.now().toString().slice(-4)}.webm`,
            type: 'recorded'
          });
          setFormData(prev => ({ ...prev, rhythm_reference_type: 'recorded' }));
        };
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(200);
      setIsRecordingRhythm(true);
      setRhythmSeconds(0);
      rhythmTimerRef.current = setInterval(() => {
        setRhythmSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      setError('Permite el acceso al micrófono en tu navegador para grabar tu referencia.');
    }
  };

  const stopRecordingRhythm = () => {
    if (rhythmMediaRecorderRef.current && isRecordingRhythm) {
      rhythmMediaRecorderRef.current.stop();
      setIsRecordingRhythm(false);
      if (rhythmTimerRef.current) clearInterval(rhythmTimerRef.current);
    }
  };

  const handleUploadRhythm = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setRhythmAudio({
        url,
        base64: reader.result,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: 'uploaded'
      });
      setFormData(prev => ({ ...prev, rhythm_reference_type: 'uploaded' }));
    };
  };

  // 2. Vocal Recording
  const startRecordingVoice = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      voiceMediaRecorderRef.current = mediaRecorder;
      voiceChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) voiceChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setVoiceAudio({
            url,
            base64: reader.result,
            name: `Voz_Grabada_${Date.now().toString().slice(-4)}.webm`,
            type: 'recorded'
          });
          setFormData(prev => ({ ...prev, vocal_reference_type: 'recorded' }));
        };
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(200);
      setIsRecordingVoice(true);
      setVoiceSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      setError('Permite el acceso al micrófono en tu navegador para grabar tu referencia de voz.');
    }
  };

  const stopRecordingVoice = () => {
    if (voiceMediaRecorderRef.current && isRecordingVoice) {
      voiceMediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
  };

  const handleUploadVoice = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setVoiceAudio({
        url,
        base64: reader.result,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: 'uploaded'
      });
      setFormData(prev => ({ ...prev, vocal_reference_type: 'uploaded' }));
    };
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.customer_name.trim()) {
        setError('Por favor ingresa tu nombre completo para registrar tu pedido.');
        return;
      }
      if (!formData.customer_phone.trim()) {
        setError('Por favor ingresa tu número de WhatsApp o teléfono para contactarte durante la producción.');
        return;
      }
      if (!formData.customer_email.trim() || !formData.customer_email.includes('@')) {
        setError('Por favor ingresa un correo electrónico válido para enviarte la letra y los masters.');
        return;
      }
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

    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
      setError('Por favor completa tu nombre, teléfono/WhatsApp y correo para procesar la orden.');
      return;
    }

    setLoading(true);

    try {
      const finalOccasion = formData.occasion === 'Otra' && formData.custom_occasion ? formData.custom_occasion.trim() : formData.occasion;
      const finalGenre = formData.genre === 'Otro' && formData.custom_genre ? formData.custom_genre.trim() : formData.genre;
      const finalMood = formData.mood === 'Otro' && formData.custom_mood ? formData.custom_mood.trim() : formData.mood;
      const finalVoice = formData.voice_preference === 'Otra' && formData.custom_voice ? formData.custom_voice.trim() : formData.voice_preference;

      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        product_tier: formData.product_tier,
        genre: finalGenre,
        mood: `${finalMood} · Intensidad: ${formData.intensity}`,
        occasion: finalOccasion,
        story_details: {
          recipient_name: formData.recipient_name,
          key_memories: formData.key_memories,
          voice_preference: finalVoice,
          intensity: formData.intensity
        },
        key_phrases: formData.key_phrases,
        has_stems: formData.has_stems,
        client_audio_notes: formData.client_audio_notes,
        rhythm_audio_data: rhythmAudio?.base64 || null,
        voice_audio_data: voiceAudio?.base64 || null
      };

      const response = await createOrder(orderPayload);
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      localStorage.removeItem('melofilia_draft_story');
      if (response.order?.order_number) {
        localStorage.setItem('melofilia_last_order', response.order.order_number);
      }

      if (response.checkoutUrl) {
        // Redirigir directamente al Checkout oficial de Mercado Pago o notificar
        if (response.checkoutUrl.startsWith('https://www.mercadopago.com') || response.checkoutUrl.startsWith('https://mercadopago.com')) {
          window.location.href = response.checkoutUrl;
          return;
        }
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
    'PASO 1 — TUS DATOS & OCASIÓN',
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

        {/* PASO 1 — DATOS DE CONTACTO & OCASIÓN */}
        {step === 1 && (
          <div className="space-y-6">
            
            {/* Customer Contact Details Block */}
            <div className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Tus Datos de Contacto (Para enviarte la letra y avances de producción)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tu Nombre Completo <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Ej: Laura Gómez"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    WhatsApp / Teléfono <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="Ej: +57 312 456 7890"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Correo Electrónico <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="laura@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                ¿A quién va dedicada la canción? <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                placeholder="Ej: A mi esposa Mariana, a mi mamá Luz, o a mi mejor amigo Carlos"
                className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
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

              {formData.occasion === 'Otra' && (
                <div className="mt-3.5 p-3.5 rounded-2xl bg-[#090a0f] border border-amber-500/40 space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-400">
                    Cuéntanos cuál es tu ocasión especial:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.custom_occasion || ''}
                    onChange={(e) => setFormData({ ...formData, custom_occasion: e.target.value })}
                    placeholder="Ej: Graduación universitaria, Jubilación, Bautizo, Reconciliación, Victoria deportiva..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              )}
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

              {/* Tag List — Starts clean with NO pre-configured chips */}
              <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
                {formData.key_phrases.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Sin etiquetas preconfiguradas. Agrega arriba los nombres, apodos o frases que quieras que rimen (opcional).
                  </p>
                ) : (
                  formData.key_phrases.map((phrase, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium animate-fadeIn"
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* PASO 3 — IDENTIDAD MUSICAL */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Selecciona el Género Musical Principal:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'Balada Pop Acústica', 'Pop Latino Moderno', 'Urbano / Reggaetón Flow',
                  'Vallenato Romántico', 'Rock Acústico', 'Bolero Clásico', 'Salsa Romántica', 'Otro'
                ].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, genre: g })}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      formData.genre === g
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-[#181b2a] border-[#262a40] text-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {formData.genre === 'Otro' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#090a0f] border border-amber-500/40 space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-400">
                    Escribe tu género musical deseado:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.custom_genre || ''}
                    onChange={(e) => setFormData({ ...formData, custom_genre: e.target.value })}
                    placeholder="Ej: Trap acústico, Merengue clásico, Indie folk, Corrido romántico, Jazz..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Estado Emocional (Mood):
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option>Emotiva y Romántica</option>
                  <option>Alegre y Festiva</option>
                  <option>Nostálgica y Profunda</option>
                  <option>Épica e Inspiracional</option>
                  <option>Íntima y Acústica</option>
                  <option>Otro</option>
                </select>

                {formData.mood === 'Otro' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#12141e] border border-amber-500/40">
                    <input
                      type="text"
                      required
                      value={formData.custom_mood || ''}
                      onChange={(e) => setFormData({ ...formData, custom_mood: e.target.value })}
                      placeholder="Describe la emoción: Ej: Solemne pero esperanzadora..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#090a0f] border border-amber-500/40 text-white text-xs placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                )}
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {['Voz Femenina', 'Voz Masculina', 'Dúo Armónico', 'Sin Preferencia', 'Otra'].map((v) => (
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

              {formData.voice_preference === 'Otra' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#090a0f] border border-amber-500/40 space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-400">
                    Indica tu preferencia vocal específica:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.custom_voice || ''}
                    onChange={(e) => setFormData({ ...formData, custom_voice: e.target.value })}
                    placeholder="Ej: Voz rasgada tipo rock, voz infantil/coro, voz grave barítono..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12141e] border border-[#262a40] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 4 — REFERENCIAS EN VIVO (RITMO Y VOZ CON GRABACIÓN & SUBIDA REAL) */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Las grabaciones son completamente opcionales.</strong> Puedes grabar con tu micrófono, subir archivos de audio o continuar directamente si no tienes referencias.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. Referencia Rítmica Funcional */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span>Referencia Rítmica (Opcional)</span>
                  </div>
                  {rhythmAudio && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Audio Listo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para explicar la cadencia, el compás o una idea musical específica.
                </p>

                {/* Input File Oculto */}
                <input
                  type="file"
                  ref={rhythmFileInputRef}
                  onChange={handleUploadRhythm}
                  accept="audio/*"
                  className="hidden"
                />

                {/* Estado de Grabación o Botones */}
                {!rhythmAudio && (
                  <div>
                    {isRecordingRhythm ? (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                          <span>Grabando micrófono... {Math.floor(rhythmSeconds / 60)}:{String(rhythmSeconds % 60).padStart(2, '0')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={stopRecordingRhythm}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                        >
                          <Square className="w-3.5 h-3.5" /> Detener
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={startRecordingRhythm}
                          className="flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 bg-[#181b2a] hover:bg-amber-500/10 border-[#262a40] hover:border-amber-500/50 text-slate-200 hover:text-amber-300 transition-all"
                        >
                          <Mic className="w-4 h-4 text-amber-400" /> Grabar Ritmo
                        </button>
                        <button
                          type="button"
                          onClick={() => rhythmFileInputRef.current?.click()}
                          className="flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 bg-[#181b2a] hover:bg-amber-500/10 border-[#262a40] hover:border-amber-500/50 text-slate-200 hover:text-amber-300 transition-all"
                        >
                          <Upload className="w-4 h-4 text-amber-400" /> Subir Audio
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Reproductor de Preview cuando hay audio cargado */}
                {rhythmAudio && (
                  <div className="p-3.5 rounded-xl bg-[#12141e] border border-amber-500/30 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 truncate max-w-[200px]">
                        🎵 {rhythmAudio.name} {rhythmAudio.size ? `(${rhythmAudio.size})` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRhythmAudio(null);
                          setFormData(prev => ({ ...prev, rhythm_reference_type: 'none' }));
                        }}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar y volver a grabar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <audio controls src={rhythmAudio.url} className="w-full h-8 rounded-lg" />
                  </div>
                )}
              </div>

              {/* 2. Referencia Vocal Funcional */}
              <div className="p-5 rounded-2xl bg-[#090a0f] border border-[#262a40] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Referencia Vocal (Opcional)</span>
                  </div>
                  {voiceAudio && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Voz Lista
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para explicar la intención, pronunciación exacta de nombres o forma de cantar.
                </p>

                {/* Input File Oculto */}
                <input
                  type="file"
                  ref={voiceFileInputRef}
                  onChange={handleUploadVoice}
                  accept="audio/*"
                  className="hidden"
                />

                {/* Estado de Grabación o Botones */}
                {!voiceAudio && (
                  <div>
                    {isRecordingVoice ? (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                          <span>Grabando tu voz... {Math.floor(voiceSeconds / 60)}:{String(voiceSeconds % 60).padStart(2, '0')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={stopRecordingVoice}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                        >
                          <Square className="w-3.5 h-3.5" /> Detener
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={startRecordingVoice}
                          className="flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 bg-[#181b2a] hover:bg-amber-500/10 border-[#262a40] hover:border-amber-500/50 text-slate-200 hover:text-amber-300 transition-all"
                        >
                          <Mic className="w-4 h-4 text-amber-400" /> Grabar Voz
                        </button>
                        <button
                          type="button"
                          onClick={() => voiceFileInputRef.current?.click()}
                          className="flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 bg-[#181b2a] hover:bg-amber-500/10 border-[#262a40] hover:border-amber-500/50 text-slate-200 hover:text-amber-300 transition-all"
                        >
                          <Upload className="w-4 h-4 text-amber-400" /> Subir Audio
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Reproductor de Preview cuando hay voz cargada */}
                {voiceAudio && (
                  <div className="p-3.5 rounded-xl bg-[#12141e] border border-amber-500/30 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 truncate max-w-[200px]">
                        🎤 {voiceAudio.name} {voiceAudio.size ? `(${voiceAudio.size})` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVoiceAudio(null);
                          setFormData(prev => ({ ...prev, vocal_reference_type: 'none' }));
                        }}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar y volver a grabar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <audio controls src={voiceAudio.url} className="w-full h-8 rounded-lg" />
                  </div>
                )}
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

            {/* Botón Principal: CONTINUAR SIN GRABACIÓN */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-4 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>CONTINUAR {rhythmAudio || voiceAudio ? 'CON REFERENCIAS' : 'SIN GRABACIÓN'}</span>
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
                <p className="text-xs text-slate-400 mb-4">Entrega en máx. 48h (desde 3h express). Recibes 2 versiones.</p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> <strong>2 Canciones terminadas:</strong> 2 versiones casi iguales</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> <strong>Revisión de Letra:</strong> Aprobación antes de grabar</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Master final en MP3 (320kbps) + Letra en PDF</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1 Corrección incluida sobre audio</li>
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
                <p className="text-xs text-slate-400 mb-4">Entrega en máx. 48h (desde 3h express). Producción de estudio.</p>
                <ul className="text-xs space-y-2 text-slate-200">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> <strong>2 Canciones terminadas:</strong> 2 versiones de estudio</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> <strong>Revisión de Letra:</strong> Aprobación antes de grabar</li>
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
