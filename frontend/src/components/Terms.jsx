import React from 'react';

import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Terms() {
  useDocumentTitle('Términos y Condiciones | Melofilia');

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-200 p-6 md:p-12 font-['Outfit']">
      <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
        <a href="/" className="text-amber-500 hover:text-amber-400 mb-6 inline-block font-semibold transition-colors">
          &larr; Volver al Inicio
        </a>
        <h1 className="text-4xl font-bold mb-6 text-white">Términos y Condiciones</h1>
        
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">1. Servicios Ofrecidos</h2>
            <p>Melofilia es un servicio de producción musical personalizada. Ofrecemos la creación de canciones originales basadas en las historias, referencias y parámetros proporcionados por el cliente a través de nuestra plataforma.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">2. Proceso de Creación y Entregas</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>El tiempo de entrega estimado es de 48 horas tras la confirmación del pago, sujeto a la complejidad del pedido y demanda actual.</li>
              <li>Se presentarán dos (2) versiones o propuestas iniciales para que el cliente elija la que más se acerque a su visión.</li>
              <li>El cliente tiene derecho a una (1) ronda de correcciones gratuitas sobre la propuesta elegida (corrección de música o letra).</li>
              <li>Una vez aceptada la entrega final, la orden se considerará Completada.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">3. Derechos de Autor y Propiedad Intelectual</h2>
            <p><strong>Para el Cliente:</strong> El cliente obtiene una licencia de uso personal y comercial sobre la canción final entregada. Podrá monetizarla, compartirla y utilizarla libremente en cualquier plataforma.</p>
            <p className="mt-2"><strong>Para Drop It Co:</strong> Drop It Co. (Melofilia) retiene el derecho moral de ser reconocido como el productor original de la obra. Asimismo, nos reservamos el derecho de utilizar fragmentos de las obras creadas en nuestro portafolio o material promocional, a menos que el cliente solicite explícitamente un acuerdo de confidencialidad estricto (NDA).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">4. Restricciones de Contenido (Copyright)</h2>
            <p>No produciremos canciones que infrinjan los derechos de autor de terceros. Los audios de referencia proporcionados por el cliente se utilizarán únicamente como inspiración rítmica o melódica, no para crear covers, remixes o copias directas de obras protegidas por copyright sin la debida autorización.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-white">5. Pagos y Reembolsos</h2>
            <p>Los pagos se procesan a través de Mercado Pago. Al tratarse de un servicio artístico y personalizado que incurre en costos de producción inmediatos, <strong>no se ofrecen reembolsos</strong> una vez iniciado el proceso de composición, salvo que Melofilia incumpla drásticamente con los tiempos de entrega sin previo aviso.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
