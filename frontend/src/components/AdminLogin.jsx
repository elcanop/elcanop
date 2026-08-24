import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, Loader2, AlertCircle, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { loginAdmin } from '../utils/api';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginAdmin(email, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'OWNER') {
      setEmail('admin@melofilia.com');
      setPassword('MelofiliaOwner2026!');
    } else {
      setEmail('producer@melofilia.com');
      setPassword('MelofiliaProd2026!');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        
        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>Acceso Administrativo Seguro · Drop It Co</span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Consola Melofilia
          </h2>
          <p className="text-xs text-slate-400">
            Ingresa tus credenciales autorizadas con token criptográfico JWT
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-[#12141e] border border-[#262a40] shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@melofilia.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090a0f] border border-[#262a40] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Iniciar Sesión Segura</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Fill for Development/Demo */}
          <div className="pt-4 border-t border-[#262a40] space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Credenciales de prueba:</span>
              <span className="text-[10px] text-violet-400 font-mono">Bcrypt Salt 10</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('OWNER')}
                className="p-2 rounded-lg bg-[#181b2a] hover:bg-[#202438] text-slate-300 border border-[#262a40] text-[10px] font-bold text-left transition-colors"
              >
                <div className="text-violet-300">Rol: OWNER (Full)</div>
                <div className="text-slate-500 truncate">admin@melofilia.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('PRODUCER')}
                className="p-2 rounded-lg bg-[#181b2a] hover:bg-[#202438] text-slate-300 border border-[#262a40] text-[10px] font-bold text-left transition-colors"
              >
                <div className="text-amber-300">Rol: PRODUCER</div>
                <div className="text-slate-500 truncate">producer@melofilia.com</div>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Intentos protegidos por Rate Limiting & JWT Anti-tampering</span>
          </div>

        </div>

      </div>
    </div>
  );
}
