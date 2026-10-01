import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, KeyRound, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { PRESENTER_MASTER_PIN, setPresenterAuthenticated } from '../utils/presenterAuth';
import { setSessionActiveStatus } from '../services/api';

interface PresenterLockScreenProps {
  onUnlock: () => void;
  onGoToAudience?: () => void;
}

export const PresenterLockScreen: React.FC<PresenterLockScreenProps> = ({
  onUnlock,
  onGoToAudience,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = pin.trim();

    if (!clean) {
      setErrorMsg('Por favor ingrese la clave de acceso del expositor.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (clean === PRESENTER_MASTER_PIN) {
        setPresenterAuthenticated(true);
        setSessionActiveStatus(true).catch(console.error);
        onUnlock();
      } else {
        setErrorMsg('Clave de expositor no válida. Intente nuevamente.');
      }
    }, 150);
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      setErrorMsg('');
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative select-none overflow-hidden">
      {/* Background ambient orange pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF6105]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Lock Card */}
      <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-9 shadow-2xl relative text-center text-white z-10">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#FF6105] to-transparent rounded-t-3xl" />

        {/* Micro-badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-[11px] font-mono-code text-neutral-300 uppercase tracking-widest mb-5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6105] animate-pulse" />
          <span>SALA DE CONFERENCIA · CONTROL DEL EXPOSITOR</span>
        </div>

        {/* Speaker Name Header */}
        <div className="w-16 h-16 rounded-2xl bg-[#FF6105] text-black flex items-center justify-center font-display text-2xl font-black mx-auto mb-4 shadow-[0_0_25px_rgba(255,97,5,0.35)]">
          RH
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight text-white mb-3">
          Roberto Hung Cavalieri
        </h1>

        {/* Literal required statement */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 mb-6 text-left">
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-body">
            “<strong className="text-white">Roberto Hung ha desarrollado esta aplicación interactiva para la divulgación del fenómeno y cultura de la tokenización de activos del mundo real (RWA)</strong>”
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono-code text-neutral-500">
            <span>Sesión segura por 6 horas</span>
            <span className="text-[#FF6105]">#ElDerechoDeHacerRuido</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 mb-1.5">
              <span>Clave de Acceso</span>
            </label>

            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/[^0-9]/g, ''));
                  setErrorMsg('');
                }}
                placeholder="••••••"
                className="w-full text-center py-3.5 px-4 bg-black border-2 border-neutral-800 focus:border-[#FF6105] rounded-xl text-2xl font-mono-code font-bold tracking-widest text-white outline-hidden placeholder:text-neutral-700 transition-all shadow-inner"
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

          {/* Dial Pad */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
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
              onClick={() => handleDigit('0')}
              className="h-11 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-white font-mono-code font-semibold text-lg border border-neutral-800/80 transition-all active:scale-95 cursor-pointer"
            >
              0
            </button>
            <button
              type="submit"
              disabled={isVerifying || !pin}
              className="h-11 rounded-lg bg-[#FF6105] hover:bg-[#ff7524] text-black font-mono-code font-bold text-sm uppercase transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-md"
            >
              OK
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-200 text-xs rounded-xl flex items-center gap-2 text-left animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Unlock Button */}
          <button
            type="submit"
            disabled={isVerifying || !pin}
            className="w-full py-4 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,97,5,0.35)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>{isVerifying ? 'Verificando Sesión...' : 'Continuar'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Footer link to public mobile view */}
        {onGoToAudience && (
          <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500 font-mono-code">
            <span>¿Eres asistente en sala?</span>
            <button
              onClick={onGoToAudience}
              className="text-[#FF6105] hover:underline cursor-pointer"
            >
              Ir a vista de participante →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
