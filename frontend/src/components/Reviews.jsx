import React from 'react';
import { Star, Quote, Play } from 'lucide-react';

export default function Reviews() {
  const reviews = [
    {
      id: 1,
      name: "Laura G.",
      role: "Regalo de Bodas",
      content: "Lloramos todos en la boda cuando sonó la canción. Capturaron exactamente la esencia de nuestra historia, incluso los chistes internos. ¡Fue el mejor regalo que le pude dar a mi esposo!",
      rating: 5,
      genre: "Balada Pop"
    },
    {
      id: 2,
      name: "Carlos M.",
      role: "Canción Comercial",
      content: "Increíble calidad de producción. Pedí un tema estilo reggaetón para la marca de mi negocio y quedó pegajosísimo. El proceso de revisión fue muy claro y mejoraron la base tal cual pedí.",
      rating: 5,
      genre: "Reggaetón"
    },
    {
      id: 3,
      name: "Sofía T.",
      role: "Regalo de Cumpleaños",
      content: "No pensé que fuera posible tener una canción nivel radio en tan poco tiempo. La letra que compusieron con mis anécdotas superó todas mis expectativas. Totalmente recomendado.",
      rating: 5,
      genre: "Pop Acústico"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f111a] to-[#090a0f] relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            Testimonios Reales
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            Historias que <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">cobran vida</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Descubre lo que nuestros clientes sienten al escuchar sus propias experiencias transformadas en música de alta calidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-[#12141e] border border-[#262a40] p-8 rounded-3xl relative hover:border-amber-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] hover:-translate-y-1 group"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-slate-800/50 group-hover:text-amber-500/10 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-slate-300 text-base leading-relaxed mb-8 relative z-10">
                "{review.content}"
              </p>
              
              <div className="flex items-center justify-between border-t border-[#262a40] pt-6 mt-auto">
                <div>
                  <h4 className="text-white font-bold">{review.name}</h4>
                  <p className="text-amber-500 text-xs font-medium">{review.role}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#181b2a] border border-[#262a40] text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Play className="w-3 h-3 text-amber-400" />
                  {review.genre}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
