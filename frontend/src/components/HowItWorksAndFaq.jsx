import React, { useState } from 'react';
import { PenTool, Music2, Headphones, Download, ChevronDown, ChevronUp, Sparkles, HelpCircle } from 'lucide-react';

export default function HowItWorksAndFaq({ onStartCreating }) {
  const [openFaq, setOpenFaq] = useState(null);

  const steps = [
    {
      icon: <PenTool className="w-6 h-6 text-amber-400" />,
      number: '01',
      title: 'Cuéntanos tu historia',
      description: 'Dinos a quién va dedicada, anécdotas inolvidables y palabras o nombres obligatorios que deben rimar.'
    },
    {
      icon: <Music2 className="w-6 h-6 text-amber-400" />,
      number: '02',
      title: 'Elige el género y estilo',
      description: 'Balada, Urbano, Pop Latino, Vallenato, Rock o Bolero. También puedes sugerir tipo de voz o referencias de ritmo.'
    },
    {
      icon: <Headphones className="w-6 h-6 text-amber-400" />,
      number: '03',
      title: 'Producción & Previsualización',
      description: 'Componemos, grabamos y mezclamos tu canción. Recibirás una previsualización de audio para escuchar el resultado.'
    },
    {
      icon: <Download className="w-6 h-6 text-amber-400" />,
      number: '04',
      title: '1 Corrección y Descarga Final',
      description: 'Tienes 1 ronda de ajustes incluida. Una vez aprobada, descargas los archivos Master (MP3/WAV) y PDF de la letra.'
    }
  ];

  const faqs = [
    {
      q: '¿Cómo funciona la ronda de corrección incluida?',
      a: 'Cada pedido cuenta con una ronda de corrección garantizada. Cuando la previsualización esté lista en tu portal, podrás indicarnos qué ajustar (letra, pronunciación, afinación, velocidad o mezcla) con el minuto exacto antes de la entrega del master definitivo.'
    },
    {
      q: '¿En qué formato recibiré mi canción?',
      a: 'En el Plan Express recibes un archivo Master MP3 a 320kbps de alta fidelidad. En el Plan Semi-Pro recibes el Master en MP3 + WAV Studio sin compresión (24-bit), además del PDF oficial con la letra y acordes. Si seleccionas el add-on de Stems, recibirás un ZIP con las pistas multipista separadas.'
    },
    {
      q: '¿Cómo se procesa el pago con Mercado Pago?',
      a: 'Al completar el formulario de tu canción, serás redirigido a la pasarela segura de Mercado Pago Colombia (Sandbox para pruebas), donde puedes pagar con tarjeta de crédito, débito PSE, Efecty o saldo en cuenta en pesos colombianos (COP).'
    },
    {
      q: '¿Cuánto tiempo tengo para descargar los archivos finales?',
      a: 'Por políticas de seguridad y privacidad, tu portal de descarga privada estará activo durante 7 días calendario tras la entrega final. Podrás descargar tus archivos las veces que desees dentro de ese período.'
    }
  ];

  return (
    <div className="space-y-24 py-16">
      
      {/* 4 Steps Process */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proceso Simple y Transparente</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            ¿Cómo creamos tu canción en 4 sencillos pasos?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[#12141e] border border-[#262a40] space-y-4 relative group hover:border-amber-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="font-display font-black text-2xl text-slate-700 group-hover:text-amber-500/40 transition-colors">
                  {s.number}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Resolvemos tus dudas</span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#12141e] border border-[#262a40] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-display font-bold text-sm text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-[#262a40]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
