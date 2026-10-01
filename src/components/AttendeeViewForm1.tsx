import React, { useState, useEffect } from 'react';
import { submitForm1 } from '../services/api';
import { ShieldAlert, CheckCircle2, User, Mail, DollarSign, ArrowRight, Lock, KeyRound, Sparkles } from 'lucide-react';
import { AccessGateModal } from './AccessGateModal';
import { validateDayPin, getDayPin, PRESENTER_MASTER_PIN } from '../utils/securityPins';

interface AttendeeViewForm1Props {
  onSwitchToPresenter?: () => void;
  onGoToForm2?: () => void;
  onGoToSurvey?: () => void;
}

export const AttendeeViewForm1: React.FC<AttendeeViewForm1Props> = ({
  onSwitchToPresenter,
  onGoToForm2,
  onGoToSurvey,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      const authRole = sessionStorage.getItem('rwa_authenticated_role');
      const form1Gate = sessionStorage.getItem('rwa_gate_form1_unlocked');
      return authRole === 'audience' || authRole === 'presenter' || form1Gate === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // All choices start completely unselected by default
  const [selectedOption, setSelectedOption] = useState<number | 'custom' | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    amount: number;
    meetsMinimum: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Gatekeeper states
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateTarget, setGateTarget] = useState<'form2' | 'survey' | 'presenter'>('form2');

  const handleUnlockForm1 = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (validateDayPin(pinInput)) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('rwa_gate_form1_unlocked', 'true');
        sessionStorage.setItem('rwa_authenticated_role', 'audience');
      } catch {}
    } else {
      setPinError('Clave no válida. Ingrese el número del día actual indicado en la sala.');
    }
  };

  // Pre-load from localStorage if previously entered
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('rwa_attendee_name');
      const savedEmail = localStorage.getItem('rwa_attendee_email');
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
    } catch {}

    const handleReset = () => {
      setSubmittedData(null);
      setSelectedOption(null);
      setCustomAmount('');
      setErrorMsg('');
    };
    window.addEventListener('rwa_state_reset', handleReset);
    return () => window.removeEventListener('rwa_state_reset', handleReset);
  }, []);

  const presetAmounts = [
    { value: 10000, label: '$10.000 USD', desc: 'Ticket Mínimo Tradicional' },
    { value: 1000, label: '$1.000 USD', desc: 'Capital Medio' },
    { value: 100, label: '$100 USD', desc: 'Micro Aporte' },
    { value: 1, label: '$1 USD', desc: 'Simbólico' },
  ];

  const getEffectiveAmount = (): number => {
    if (selectedOption === 'custom') {
      const num = parseFloat(customAmount);
      return isNaN(num) ? 0 : num;
    }
    return typeof selectedOption === 'number' ? selectedOption : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveAmount = getEffectiveAmount();

    if (effectiveAmount <= 0) {
      setErrorMsg('Por favor selecciona o ingresa un monto para continuar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const finalName = name.trim() || 'Asistente';
      const finalEmail = email.trim(); // Optional!
      await submitForm1(finalName, finalEmail, effectiveAmount);
      try {
        if (name) localStorage.setItem('rwa_attendee_name', name);
        if (email) localStorage.setItem('rwa_attendee_email', email);
      } catch {}
      setSubmittedData({
        amount: effectiveAmount,
        meetsMinimum: effectiveAmount >= 10000,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la plataforma.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToNextStep = () => {
    if (onGoToForm2) {
      onGoToForm2();
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between py-8 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto my-auto">
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 bg-[#FF6105]/10 border border-[#FF6105]/30 rounded-2xl flex items-center justify-center mx-auto text-[#FF6105]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono-code uppercase tracking-widest text-[#FF6105] font-bold">
                FASE 1 · DIAGNÓSTICO DE CAPITAL
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white uppercase tracking-tight">
                Acceso a la Simulación
              </h2>
              <p className="text-xs text-neutral-400 font-mono-code pt-1">
                Ingrese la clave numérica del día anunciada por Roberto en la sala.
              </p>
            </div>

            <form onSubmit={handleUnlockForm1} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={7}
                  placeholder={`Clave del Día (ej. ${getDayPin()})`}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                    setPinError('');
                  }}
                  className="w-full text-center py-3.5 px-4 bg-black border-2 border-neutral-800 focus:border-[#FF6105] rounded-xl text-xl font-mono-code font-bold tracking-widest text-white outline-hidden placeholder:text-neutral-700"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2 text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!pinInput}
                className="w-full py-3.5 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Desbloquear Formulario</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono-code uppercase tracking-wider text-neutral-300 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6105] animate-pulse" />
            <span>ROBERTO HUNG · FASE 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
            Diagnóstico de Capital
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Proyecto Inmobiliario RH-RWA · Barrera de Entrada Tradicional
          </p>
        </div>

        {/* Form or Confirmation Card */}
        {!submittedData ? (
          <form
            onSubmit={handleSubmit}
            className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
          >
            {/* Identity Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 mb-1.5">
                  Nombre o Alias
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Tu nombre (opcional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-[#FF6105] text-sm outline-hidden transition-all text-white placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico (Opcional - solo si deseas recibir el informe)"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-[#FF6105] text-xs sm:text-sm outline-hidden transition-all text-white placeholder:text-neutral-500"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1 pl-1">
                  * Voluntario: la omisión del correo no bloquea tu participación.
                </p>
              </div>
            </div>

            {/* Core Question */}
            <div className="pt-3 border-t border-neutral-800">
              <label className="block text-sm font-heading font-bold text-white mb-1.5 leading-snug">
                ¿Cuánto dinero líquido tienes YA (en las próximas 5 horas) en serio para invertir en este proyecto?
              </label>
              <p className="text-[11px] text-neutral-400 mb-3.5">
                Selecciona la opción más cercana a tu disponibilidad inmediata:
              </p>

              {/* Big Preset Options (Starts UNSELECTED) */}
              <div className="grid grid-cols-2 gap-2.5">
                {presetAmounts.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedOption(opt.value);
                      setErrorMsg('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedOption === opt.value
                        ? 'bg-[#FF6105]/15 border-[#FF6105] shadow-[0_0_15px_rgba(255,97,5,0.25)] text-white'
                        : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="text-base font-mono-code font-bold text-white">
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {/* Custom amount choice */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedOption('custom')}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-mono-code flex items-center justify-between transition-all cursor-pointer ${
                    selectedOption === 'custom'
                      ? 'bg-[#FF6105]/15 border-[#FF6105] text-white'
                      : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700 text-neutral-400'
                  }`}
                >
                  <span>Otro monto exacto en USD...</span>
                  <DollarSign className="w-3.5 h-3.5 text-[#FF6105]" />
                </button>

                {selectedOption === 'custom' && (
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-3 text-sm font-mono-code text-neutral-400">$</span>
                    <input
                      type="number"
                      min={1}
                      max={1000000}
                      placeholder="Ej. 250"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-neutral-950 border-2 border-[#FF6105] text-white font-mono-code text-sm outline-hidden"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Error notice */}
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || selectedOption === null}
              className="w-full py-3.5 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,97,5,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Registrando en Directo...' : 'Enviar Disponibilidad'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          /* Result & Diagnosis Feedback Card */
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5 animate-fadeIn">
            {submittedData.meetsMinimum ? (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white uppercase tracking-tight">
                  Inversionista Acreditado Tradicional
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
                  Tu capacidad de <strong className="text-white">${submittedData.amount.toLocaleString()} USD</strong> cumple el ticket mínimo de la banca tradicional ($10.000 USD).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-[#FF6105]/10 border border-[#FF6105]/30 rounded-2xl flex items-center justify-center mx-auto text-[#FF6105]">
                  <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[#FF6105] uppercase tracking-tight">
                  Excluido por el Modelo Tradicional
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
                  Tu capital de <strong className="text-white">${submittedData.amount.toLocaleString()} USD</strong> no alcanza la barrera mínima tradicional de $10.000 USD. Sin embargo, en el modelo RWA de Roberto Hung, eres 100% elegible desde tan solo $10 USD.
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-left space-y-1.5 text-xs font-mono-code">
              <div className="text-[10px] text-neutral-500 uppercase">Impacto en la Sala:</div>
              <div className="text-neutral-300">
                Tu respuesta se computó instantáneamente en la pantalla principal del auditorio.
              </div>
            </div>

            <button
              onClick={handleGoToNextStep}
              className="w-full py-3.5 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar a Fase 2: Suscripción Tokenizada</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-neutral-500 mt-6 font-mono-code">
          Roberto Hung Cavalieri · www.robertohung.com · #ElDerechoDeHacerRuido
        </div>
      </div>
    </div>
  );
};
