import React from 'react';

import useDocumentTitle from '../hooks/useDocumentTitle';

export default function PrivacyPolicy() {
  useDocumentTitle('Política de Privacidad | Melofilia');

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-200 p-6 md:p-12 font-['Outfit']">
      <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
        <a href="/" className="text-amber-500 hover:text-amber-400 mb-6 inline-block font-semibold transition-colors">
          &larr; Volver al Inicio
        </a>
        <h1 className="text-4xl font-bold mb-6 text-white">Política de Privacidad</h1>
        
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">1. Información General</h2>
            <p>En Melofilia (Drop It Co.), respetamos su privacidad y nos comprometemos a proteger los datos personales que comparte con nosotros. Esta política explica cómo recopilamos, usamos y protegemos su información al utilizar nuestro servicio de producción musical personalizada.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">2. Datos Recopilados</h2>
            <p>Recopilamos información necesaria para brindar nuestros servicios, incluyendo:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nombre, correo electrónico y número de teléfono.</li>
              <li>Detalles de la historia o anécdota para la creación de la canción.</li>
              <li>Archivos de audio de referencia enviados voluntariamente.</li>
              <li>Datos de facturación procesados de forma segura a través de pasarelas de pago externas (Mercado Pago). No almacenamos información directa de tarjetas de crédito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">3. Uso de la Información</h2>
            <p>Sus datos se utilizan estrictamente para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Producir y componer la canción solicitada.</li>
              <li>Contactarle sobre el estado de su pedido.</li>
              <li>Soporte y atención al cliente.</li>
              <li>Mejorar nuestros servicios y experiencia de usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">4. Privacidad y Seguridad</h2>
            <p>Implementamos medidas de seguridad técnicas para evitar el acceso no autorizado, la alteración o destrucción de su información. Sus historias y audios de referencia son tratados con estricta confidencialidad por nuestro equipo de producción musical.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">5. Derechos del Usuario</h2>
            <p>Usted tiene derecho a solicitar la eliminación, modificación o revisión de sus datos personales. Una vez finalizada la producción, puede solicitar la eliminación definitiva de cualquier audio de referencia enviado a nuestros servidores.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">6. Contacto</h2>
            <p>Para preguntas sobre esta política o ejercer sus derechos, por favor contáctenos a través de nuestros canales oficiales en el sitio web.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
