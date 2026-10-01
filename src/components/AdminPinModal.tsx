import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, X, ShieldAlert, FileDown, Check } from 'lucide-react';
import { PRESENTER_MASTER_PIN } from '../utils/presenterAuth';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Autenticación Requerida',
  description = 'Para descargar el informe administrativo confidencial de participantes, ingrese la Clave Maestra del Expositor.',
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = pin.trim();

    if (!clean) {
      setErrorMsg('Por favor ingrese la clave.');
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      if (clean === PRESENTER_MASTER_PIN) {
        onSuccess();
        onClose();
        setPin('');
      } else {
        setErrorMsg('Clave incorrecta. Descarga de informe bloqueada por seguridad.');
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none text-white">
      <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center text-white overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF6105] to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h3 className="text-base font-heading font-bold text-white uppercase tracking-tight mb-1.5">
          {title}
        </h3>

        <p className="text-xs text-neutral-400 mb-4 leading-relaxed font-body">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
              placeholder="Clave Master (2089227)"
              className="w-full text-center py-3 px-4 bg-black border-2 border-neutral-800 focus:border-[#FF6105] rounded-xl text-lg font-mono-code font-bold tracking-widest text-white outline-hidden placeholder:text-neutral-700 transition-all"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 text-[11px] rounded-xl flex items-center gap-1.5 text-left animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-400 text-xs font-mono-code cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isValidating || !pin}
              className="flex-1 py-2.5 rounded-xl bg-[#FF6105] hover:bg-[#ff7524] text-black font-mono-code font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-md"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isValidating ? 'Validando...' : 'Descargar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
