import React, { useEffect, useState } from 'react';
import { verifyPayment } from '../utils/api';
import { CheckCircle2, Loader2, Music, Download, AlertCircle, ArrowRight } from 'lucide-react';

export default function CheckoutSuccess({ orderNumber, paymentId, onGoToOrder }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    async function validate() {
      try {
        setLoading(true);
        if (!orderNumber) throw new Error('Falta el número de radicado');
        const res = await verifyPayment(orderNumber, paymentId);
        
        if (res.success && res.order) {
          setOrderData(res.order);
        } else {
          setOrderData(res.order); // Aún si no fue approved, cargamos la info
          if (res.status === 'pending') {
            setError('Tu pago está siendo procesado por tu banco. Te notificaremos pronto.');
          } else if (res.status === 'rejected') {
            setError('Tu pago fue rechazado. Por favor, intenta de nuevo.');
          } else {
            setError('El estado del pago es desconocido.');
          }
        }
      } catch (err) {
        setError(err.message || 'Error verificando el pago con Mercado Pago.');
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [orderNumber, paymentId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Validando Pago...</h2>
        <p className="text-slate-400 text-sm text-center">Estamos confirmando tu transacción con Mercado Pago.</p>
      </div>
    );
  }

  const isApproved = orderData?.payment_status === 'COMPLETED';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 animate-fadeIn">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
            isApproved 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/20' 
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-500/20'
          }`}>
            {isApproved ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          
          <h2 className="text-3xl font-display font-extrabold text-white">
            {isApproved ? '¡Pago Exitoso!' : 'Estado del Pago'}
          </h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            {isApproved 
              ? 'Hemos recibido tu orden y ya está en nuestra cola de producción.' 
              : error || 'Tu pago se encuentra pendiente o requiere validación manual.'}
          </p>
        </div>

        {/* Resumen Card */}
        {orderData && (
          <div className="p-6 rounded-3xl bg-[#12141e] border border-[#262a40] shadow-2xl relative overflow-hidden">
            {/* Ambient */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
              isApproved ? 'bg-emerald-600/10' : 'bg-amber-600/10'
            }`}></div>

            <div className="space-y-6 relative z-10">
              
              {/* Número de Radicado (Highlight) */}
              <div className="text-center p-4 bg-[#090a0f] rounded-2xl border border-violet-500/20">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Número de Radicado
                </span>
                <span className="block text-xl font-bold text-violet-400 tracking-widest font-mono">
                  {orderData.order_number}
                </span>
                <span className="block text-[10px] text-slate-500 mt-2">
                  Guarda este código para hacer seguimiento a tu pedido.
                </span>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Cliente</span>
                  <span className="font-medium text-slate-200">{orderData.customer_name}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Correo</span>
                  <span className="font-medium text-slate-200 truncate">{orderData.customer_email}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Plan</span>
                  <span className="font-medium text-slate-200">{orderData.product_tier}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Género</span>
                  <span className="font-medium text-slate-200">{orderData.genre || 'No especificado'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#262a40] flex justify-between items-center">
                  <span className="text-sm text-slate-400">Total Pagado</span>
                  <span className="text-xl font-bold text-white">
                    ${(orderData.total_amount).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {/* Botón Acción */}
              <div className="pt-4">
                <button
                  onClick={() => onGoToOrder(orderData.order_number)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/25 active:scale-95 transition-all"
                >
                  <Music className="w-4 h-4" />
                  Ir al Seguimiento del Pedido
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
