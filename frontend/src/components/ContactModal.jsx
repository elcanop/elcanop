import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, X, Loader2, ShieldCheck, Heart } from 'lucide-react';
import { sendContactMessage } from '../utils/api';

export default function ContactModal({ isOpen, onClose, defaultCategory = 'SERVICIOS' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: defaultCategory,
    order_number: '',
    message: '',
    data_consent: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'SERVICIOS', label: 'Consultas sobre Servicios' },
    { id: 'COTIZACIÓN', label: 'Cotización / Idea Especial' },
    { id: 'PEDIDO', label: 'Pregunta sobre Pedido Existente' },
    { id: 'SUGERENCIA', label: 'Sugerencia de Mejora' },
    { id: 'REVIEW', label: 'Dejar una Opinión / Review' },
    { id: 'PROBLEMA', label: 'Reportar un Inconveniente' },
    { id: 'COLABORACIÓN', label: 'Colaboración o Alianza' },
    { id: 'OTRO', label: 'Otro Asunto' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await sendContactMessage(formData);
      setSuccess(response.message || '¡Mensaje recibido con éxito!');
      setFormData({
        name: '',
        email: '',
        category: 'SERVICIOS',
        order_number: '',
        message: '',
        data_consent: true
      });
    } catch (err) {
      setError(err.message || 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#12141e] border-2 border-[#262a40] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Buzón de Contacto Melofilia</h3>
              <p className="text-xs text-slate-400">Abierto para consultas, cotizaciones, reviews y soporte</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#181b2a] text-slate-400 hover:text-white border border-[#262a40] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white font-display">¡Mensaje Enviado!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">{success}</p>
            <button
              onClick={() => { setSuccess(null); onClose(); }}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Comunicación:
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:border-amber-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tu Nombre <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Juan Valdés"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tu Correo <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número de Pedido (Opcional si aplica):
              </label>
              <input
                type="text"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                placeholder="Ej: MP-2026-000184"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white font-mono text-xs focus:border-amber-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tu Mensaje, Consulta o Reseña <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Escribe aquí los detalles de tu consulta, sugerencia o feedback..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs focus:border-amber-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="data_consent_chk"
                checked={formData.data_consent}
                onChange={(e) => setFormData({ ...formData, data_consent: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="data_consent_chk" className="text-[11px] text-slate-400 cursor-pointer">
                Acepto el tratamiento de datos para responder a esta comunicación.
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#262a40]">
              <a
                href="mailto:elcanop.dropit@gmail.com"
                className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <Mail className="w-3 h-3" />
                <span>elcanop.dropit@gmail.com</span>
              </a>

              <button
                type="submit"
                disabled={loading || !formData.data_consent}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
