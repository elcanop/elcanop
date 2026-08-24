import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AudioHero from './components/AudioHero';
import AudioShowcase from './components/AudioShowcase';
import ComparisonTable from './components/ComparisonTable';
import HowItWorksAndFaq from './components/HowItWorksAndFaq';
import StoryComposer from './components/StoryComposer';
import OrderTracker from './components/OrderTracker';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import ContactModal from './components/ContactModal';
import Footer from './components/Footer';
import { CreditCard, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { getPricingConfig, getAdminUser, verifyAdminSession, logoutAdmin } from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentOrderNumber, setCurrentOrderNumber] = useState('MP-2026-000184');
  const [selectedTier, setSelectedTier] = useState('SEMI_PRO');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => getAdminUser());
  
  // Pricing configuration loaded dynamically from backend
  const [pricing, setPricing] = useState({
    express: {
      name: 'Express',
      regular_price: 160000,
      current_price: 120000,
      discount_enabled: true,
      discount_badge: '25% OFF',
      delivery_hours: 48
    },
    semi_pro: {
      name: 'Semi-Pro',
      regular_price: 350000,
      current_price: 280000,
      discount_enabled: true,
      discount_badge: '20% OFF',
      delivery_hours: 72
    },
    stems_addon: {
      name: 'Stems Multipista (ZIP)',
      regular_price: 70000,
      current_price: 50000,
      discount_enabled: true,
      discount_badge: 'Ahorra $20.000 COP'
    }
  });

  // Checkout Modal State
  const [checkoutModal, setCheckoutModal] = useState({
    isOpen: false,
    orderNumber: '',
    checkoutUrl: ''
  });

  // Banner status
  const [bannerNotice, setBannerNotice] = useState(null);

  // Fetch Pricing & Verify Admin Session on load
  const loadInitialData = async () => {
    try {
      const data = await getPricingConfig();
      if (data && data.express) {
        setPricing(data);
      }
    } catch (err) {
      console.warn('Using default pricing config:', err);
    }

    try {
      const verifiedUser = await verifyAdminSession();
      setAdminUser(verifiedUser);
    } catch (e) {
      setAdminUser(null);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Check URL search parameters
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status');
    const orderParam = params.get('order');

    if (orderParam) {
      setCurrentOrderNumber(orderParam);
      setActiveTab('pedido');
    }

    if (paymentStatus === 'approved') {
      setBannerNotice({
        type: 'success',
        text: '¡Pago aprobado en Mercado Pago Sandbox! Tu orden ha sido asignada a cola de producción.'
      });
      setActiveTab('pedido');
    } else if (paymentStatus === 'rejected') {
      setBannerNotice({
        type: 'error',
        text: 'El pago no pudo ser completado. Puedes intentar nuevamente desde tu portal de pedido.'
      });
    }
  }, []);

  const handleStartCreating = (tier = 'SEMI_PRO') => {
    setSelectedTier(tier);
    setActiveTab('crear');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHowItWorks = () => {
    setActiveTab('landing');
    setTimeout(() => {
      const el = document.getElementById('how-it-works-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleOrderCreated = (orderNumber, checkoutUrl) => {
    setCurrentOrderNumber(orderNumber);
    if (checkoutUrl) {
      setCheckoutModal({
        isOpen: true,
        orderNumber,
        checkoutUrl
      });
    } else {
      setActiveTab('pedido');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectOrderToView = (orderNumber) => {
    setCurrentOrderNumber(orderNumber);
    setActiveTab('pedido');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePricingUpdated = (newPricing) => {
    setPricing(newPricing);
  };

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
  };

  const handleLogout = () => {
    logoutAdmin();
    setAdminUser(null);
    setActiveTab('landing');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black font-sans">
      
      {/* Top Banner Notice */}
      {bannerNotice && (
        <div className={`py-3 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 ${
          bannerNotice.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/40' 
            : 'bg-rose-500/20 text-rose-300 border-b border-rose-500/40'
        }`}>
          {bannerNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{bannerNotice.text}</span>
          <button 
            onClick={() => setBannerNotice(null)} 
            className="ml-4 underline hover:opacity-80 text-[11px]"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Navigation with Drop It Co branding & Admin Auth State */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentOrderNumber={currentOrderNumber} 
        onOpenContact={() => setIsContactOpen(true)}
        adminUser={adminUser}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        
        {/* VIEW 1: LANDING */}
        {activeTab === 'landing' && (
          <div>
            <AudioHero 
              onStartCreating={() => handleStartCreating('SEMI_PRO')} 
              onHowItWorks={handleHowItWorks}
            />
            <AudioShowcase 
              onStartCreatingWithGenre={(genre) => handleStartCreating('SEMI_PRO')}
            />
            <ComparisonTable 
              pricing={pricing}
              onSelectTier={(tier) => handleStartCreating(tier)} 
            />
            <div id="how-it-works-section">
              <HowItWorksAndFaq 
                onStartCreating={() => handleStartCreating('SEMI_PRO')} 
              />
            </div>
          </div>
        )}

        {/* VIEW 2: SONG CREATOR */}
        {activeTab === 'crear' && (
          <StoryComposer 
            pricing={pricing}
            initialTier={selectedTier} 
            onOrderCreated={handleOrderCreated} 
          />
        )}

        {/* VIEW 3: ORDER TRACKER */}
        {activeTab === 'pedido' && (
          <OrderTracker 
            initialOrderNumber={currentOrderNumber} 
          />
        )}

        {/* VIEW 4: ADMIN CONSOLE (Protected with Real Authentication) */}
        {activeTab === 'admin' && (
          adminUser ? (
            <AdminDashboard 
              currentUser={adminUser}
              onLogout={handleLogout}
              globalPricing={pricing}
              onPricingUpdated={handlePricingUpdated}
              onSelectOrderToView={handleSelectOrderToView} 
            />
          ) : (
            <AdminLogin 
              onLoginSuccess={handleLoginSuccess}
            />
          )
        )}

      </main>

      {/* Contact Inbox Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Mercado Pago Checkout Modal */}
      {checkoutModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12141e] border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Orden Creada con Éxito</h3>
                <p className="text-xs font-mono text-amber-400">{checkoutModal.orderNumber}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#262a40] text-xs space-y-2 text-slate-300">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Pasarela Oficial Mercado Pago Sandbox (Colombia)
              </div>
              <p className="text-slate-400 leading-relaxed">
                Tu pedido ha sido registrado en el sistema. Puedes proceder al Checkout Sandbox de Mercado Pago para pagar con tarjeta de prueba o saldo de prueba.
              </p>
              <div className="pt-2 border-t border-[#262a40] text-[11px] text-amber-300 font-mono">
                Usuario prueba: TESTUSER3212403718024316184
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={checkoutModal.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
              >
                <span>Ir al Checkout de Mercado Pago</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setCheckoutModal({ isOpen: false, orderNumber: '', checkoutUrl: '' });
                  setActiveTab('pedido');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#181b2a] hover:bg-[#202438] text-slate-300 border border-[#262a40] text-xs font-semibold transition-colors"
              >
                Continuar al Portal de Mi Pedido
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <Footer 
        onOpenContact={() => setIsContactOpen(true)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

    </div>
  );
}
