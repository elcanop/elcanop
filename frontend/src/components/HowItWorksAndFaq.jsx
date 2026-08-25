import React, { useState } from 'react';
import { PenTool, Music2, Headphones, Download, ChevronDown, ChevronUp, Sparkles, HelpCircle, FileText, Clock } from 'lucide-react';

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
      icon: <FileText className="w-6 h-6 text-amber-400" />,
      number: '02',
      title: 'Revisión y Aprobación de Letra',
      description: 'Redactamos la letra y te la enviamos a tu portal privado. La lees, solicitas ajustes o la apruebas para pasar a estudio.'
    },
    {
      icon: <Headphones className="w-6 h-6 text-amber-400" />,
      number: '03',
      title: 'Producción de 2 Canciones',
      description: 'Grabamos 2 versiones casi iguales con sutiles variaciones de interpretación para que elijas tu favorita o disfrutes ambas.'
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      number: '04',
      title: 'Entrega en máx. 24h (desde 3h)',
      description: 'Recibes tus dos canciones terminadas en audio master (MP3/WAV), letra PDF y bóveda de descargas por 7 días.'
    }
  ];

  const faqs = [
    {
      q: '¿Por qué entregan 2 canciones casi iguales de mi historia?',
      a: 'En Melofilia producimos dos interpretaciones sutilmente distintas de tu misma letra (por ejemplo, con sutiles variaciones de dinámica, instrumentación o matices vocales). Esto te permite elegir la que mejor conecte con el momento o tener dos versiones completas para diferentes ocasiones (ej. una para el video y otra para dedicar en vivo).'
    },
    {
      q: '¿Cómo funciona la revisión y aprobación previa de letra?',
      a: 'Antes de entrar a grabación y masterización, nuestro equipo redacta los versos y coros y los publica en tu portal privado de seguimiento. Tienes la oportunidad de leer la letra con calma, sugerir ajustes en nombres o frases clave, y dar tu aprobación oficial cuando esté perfecta.'
    },
    {
      q: '¿Cuánto tiempo tarda la entrega?',
      a: 'El plazo estándar es de máximo 24 horas tras la aprobación de la letra. En caso de requerir una entrega urgente para un evento o cumpleaños del mismo día, contamos con opción de entrega express desde 3 horas mínimo.'
    },
    {
      q: '¿Qué incluye la garantía de corrección adicional sobre el audio?',
      a: 'Además de la aprobación de letra, cuentas con 1 ronda de corrección sobre el audio final. Si deseas retocar la mezcla, volumen de la voz o algún detalle del arreglo, nuestro ingeniero de estudio lo ajustará sin costo.'
    },
    {
      q: '¿Cuánto tiempo tengo para descargar los archivos finales?',
      a: 'Tu bóveda de descarga privada estará activa durante 7 días calendario tras la entrega. Podrás descargar tus 2 versiones en MP3, WAV Studio (24-bit en plan Semi-Pro), PDF de la letra y Stems en cualquier momento.'
    }
  ];

  return (
    <div className="space-y-24 py-16">
      
      {/* 4 Steps Process */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>El Proceso Paso a Paso</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            De tu historia a 2 canciones inolvidables
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Un flujo transparente y creativo donde tú tienes el control de la letra antes de grabar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="relative p-6 rounded-3xl bg-[#12141e] border border-[#262a40] hover:border-amber-500/50 transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-amber-500/40 transition-colors">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-white">
                {step.title}
              </h3>

              <p className="text-slate-400 text-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Preguntas Frecuentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Todo lo que necesitas saber
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-[#12141e] border border-[#262a40] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#1a1d2e] pt-4">
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
