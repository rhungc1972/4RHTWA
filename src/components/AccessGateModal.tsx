import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, ShieldCheck, Smartphone, Presentation } from 'lucide-react';
import { validateAccessKey, getDayPin, PRESENTER_MASTER_PIN } from '../utils/securityPins';

interface AccessGateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (role: 'presenter' | 'audience') => void;
}

export const AccessGateModal: React.FC<AccessGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPin = pin.trim();

    if (!cleanPin) {
      setErrorMsg('Por favor ingrese la clave numérica de acceso.');
      return;
    }

    setIsValidating(true);
    const role = validateAccessKey(cleanPin);

    setTimeout(() => {
      setIsValidating(false);
      if (role === 'presenter') {
        try {
          sessionStorage.setItem('rwa_authenticated_role', 'presenter');
        } catch {}
        onSuccess('presenter');
      } else if (role === 'audience') {
        try {
          sessionStorage.setItem('rwa_authenticated_role', 'audience');
        } catch {}
        onSuccess('audience');
      } else {
        setErrorMsg('Clave no válida.');
      }
    }, 150);
  };

  const handleQuickKey = (num: string) => {
    if (pin.length < 7) {
      setPin((prev) => prev + num);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-center text-white overflow-hidden">
        {/* Top Orange Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF6105] to-transparent" />

        {/* Brand Micro-Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-[11px] font-mono-code text-neutral-300 uppercase tracking-widest mb-4 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6105] animate-pulse" />
          <span>ROBERTO HUNG · RWA PLATFORM</span>
        </div>

        {/* Modal Heading & Exact Prompt Copy */}
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight mb-2.5 leading-snug">
          Bienvenidos a la Cultura de la Economía Tokenizada.
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
          Roberto Hung desarrolló esta experiencia interactiva para generar iniciales reflexiones sobre el fenómeno de la tokenización de activos de la vida real (RWA).
        </p>

        {/* Form */}
        <form onSubmit={handleValidate} className="space-y-4">
          <div className="text-left">
            <label className="block text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 mb-1.5">
              Clave de Acceso a la Sesión
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={7}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/[^0-9]/g, ''));
                  setErrorMsg('');
                }}
                placeholder="••••••"
                className="w-full text-center py-3.5 px-4 bg-black border-2 border-neutral-700 focus:border-[#FF6105] rounded-xl text-2xl font-mono-code font-bold tracking-widest text-white outline-hidden placeholder:text-neutral-600 transition-all shadow-inner"
                autoFocus
              />
              {pin.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-code text-neutral-400 hover:text-white px-2 py-1 bg-neutral-800 rounded-md cursor-pointer"
                >
                  Borrar
                </button>
              )}
            </div>
          </div>

          {/* Quick Ergonomic Dial Pad for Mobile thumbs */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleQuickKey(digit)}
                className="h-11 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-white font-mono-code font-semibold text-lg border border-neutral-800/80 transition-all active:scale-95 cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-11 rounded-lg bg-neutral-950 hover:bg-neutral-900 text-neutral-400 font-mono-code text-xs uppercase border border-neutral-800/60 transition-all cursor-pointer"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey('0')}
              className="h-11 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-white font-mono-code font-semibold text-lg border border-neutral-800/80 transition-all active:scale-95 cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-11 rounded-lg bg-neutral-950 hover:bg-neutral-900 text-neutral-400 font-mono-code text-xs uppercase border border-neutral-800/60 transition-all cursor-pointer"
            >
              ⌫
            </button>
          </div>

          {/* Subtle error notice */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-300 text-xs rounded-xl flex items-center gap-2.5 text-left animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isValidating || !pin}
            className="w-full py-3.5 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold uppercase tracking-wider text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(255,97,5,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isValidating ? 'Validando...' : 'Continuar'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
