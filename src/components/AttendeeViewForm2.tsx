import React, { useState, useEffect } from 'react';
import { submitForm2 } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Cpu,
  CheckCircle2,
  User,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Edit2,
  Lock,
  KeyRound,
  AlertCircle,
  Building,
} from 'lucide-react';
import { validateMonthPin, getMonthPin, getMonthName } from '../utils/securityPins';

interface AttendeeViewForm2Props {
  onSwitchToPresenter?: () => void;
  onGoToForm1?: () => void;
  onGoToSurvey?: () => void;
}

export const AttendeeViewForm2: React.FC<AttendeeViewForm2Props> = ({
  onSwitchToPresenter,
  onGoToForm1,
  onGoToSurvey,
}) => {
  // Gatekeeper check: is Form 2 unlocked?
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      const authRole = sessionStorage.getItem('rwa_authenticated_role');
      const form2Gate = sessionStorage.getItem('rwa_gate_form2_unlocked');
      return authRole === 'audience' || authRole === 'presenter' || form2Gate === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Attendee profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);

  // All choices start completely unselected by default
  const [selectedTokens, setSelectedTokens] = useState<number | 'custom' | null>(null);
  const [customTokens, setCustomTokens] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    tokens: number;
    amount: number;
    m2: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-load registration details from Form 1 / localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('rwa_attendee_name');
      const savedEmail = localStorage.getItem('rwa_attendee_email');
      if (savedName || savedEmail) {
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
        setHasSavedProfile(true);
      }
    } catch {}

    const handleReset = () => {
      setSubmittedData(null);
      setSelectedTokens(null);
      setCustomTokens('');
      setErrorMsg('');
    };
    window.addEventListener('rwa_state_reset', handleReset);
    return () => window.removeEventListener('rwa_state_reset', handleReset);
  }, []);

  const handleUnlockForm2 = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (validateMonthPin(pinInput) || pinInput.trim() === '2089227' || pinInput.trim() === String(new Date().getDate())) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('rwa_gate_form2_unlocked', 'true');
      } catch {}
    } else {
      setPinError('Clave incorrecta. Por favor introduzca la clave indicada en sala.');
    }
  };

  const tokenPresets = [
    { tokens: 1, usd: 10, m2: 0.01, label: '1 Token', desc: 'Aporte Mínimo RWA' },
    { tokens: 5, usd: 50, m2: 0.05, label: '5 Tokens', desc: 'Participación Inicial' },
    { tokens: 10, usd: 100, m2: 0.1, label: '10 Tokens', desc: 'Alícuota Estándar' },
    { tokens: 50, usd: 500, m2: 0.5, label: '50 Tokens', desc: 'Media Unidad m²' },
    { tokens: 100, usd: 1000, m2: 1.0, label: '100 Tokens', desc: '1 m² Completo' },
    { tokens: 500, usd: 5000, m2: 5.0, label: '500 Tokens', desc: '5 m² Titularidad' },
  ];

  const currentTokens =
    selectedTokens === 'custom'
      ? Math.max(0, parseInt(customTokens, 10) || 0)
      : typeof selectedTokens === 'number'
      ? selectedTokens
      : 0;

  const currentUsd = currentTokens * 10;
  const currentM2 = +(currentTokens / 100).toFixed(2);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6105', '#10B981', '#FFFFFF'],
      });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentTokens <= 0) {
      setErrorMsg('Por favor selecciona una cantidad válida de tokens.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const finalName = name.trim() || 'Inversor RWA';
      const finalEmail = email.trim(); // Optional!
      await submitForm2(finalName, finalEmail, currentTokens);
      try {
        if (finalName) localStorage.setItem('rwa_attendee_name', finalName);
        if (finalEmail) localStorage.setItem('rwa_attendee_email', finalEmail);
      } catch {}
      setSubmittedData({
        tokens: currentTokens,
        amount: currentUsd,
        m2: currentM2,
      });
      triggerConfetti();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la plataforma.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToSurvey = () => {
    try {
      sessionStorage.setItem('rwa_gate_survey_unlocked', 'true');
    } catch {}
    if (onGoToSurvey) onGoToSurvey();
  };

  // IF LOCKED: Show key unlock screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between py-8 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto my-auto">
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-center">
            <div className="w-14 h-14 bg-[#FF6105]/10 border border-[#FF6105]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#FF6105]">
              <Lock className="w-7 h-7 stroke-[2.2]" />
            </div>

            <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-tight">
              Suscripción de Tokens RWA
            </h2>
            <p className="text-xs text-neutral-400 mt-1 mb-5">
              Ingrese la clave del día indicada por el ponente en la sala:
            </p>

            <form onSubmit={handleUnlockForm2} className="space-y-4">
              <input
                type="text"
                maxLength={7}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Clave de Sala"
                className="w-full text-center py-3.5 px-4 bg-neutral-950 border-2 border-neutral-700 focus:border-[#FF6105] rounded-xl text-2xl font-mono-code font-bold tracking-widest text-white outline-hidden"
                autoFocus
              />

              {pinError && (
                <div className="p-2.5 bg-red-950/40 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-md cursor-pointer"
              >
                Desbloquear Suscripción
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW: Token Subscription Form
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono-code uppercase tracking-wider text-neutral-300 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6105] animate-pulse" />
            <span>ROBERTO HUNG · FASE 2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
            Suscripción de Alícuota RWA
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Proyecto Inmobiliario RH-RWA · Simulación de Tokenización en Vivo
          </p>
        </div>

        {!submittedData ? (
          <form
            onSubmit={handleSubmit}
            className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
          >
            {/* Identity Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 mb-1.5">
                  Nombre o Alias del Copropietario
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
                  * Voluntario: no bloquea ni condiciona la emisión del token.
                </p>
              </div>
            </div>

            {/* Token Selector (STARTS UNSELECTED) */}
            <div className="pt-3 border-t border-neutral-800">
              <label className="block text-sm font-heading font-bold text-white mb-1.5">
                ¿Cuántos tokens deseas suscribir hoy?
              </label>
              <p className="text-[11px] text-neutral-400 mb-3.5">
                Cada token representa <strong>$10 USD</strong> y confiere <strong>0.01 m²</strong> de copropiedad:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {tokenPresets.map((preset) => (
                  <button
                    key={preset.tokens}
                    type="button"
                    onClick={() => {
                      setSelectedTokens(preset.tokens);
                      setErrorMsg('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedTokens === preset.tokens
                        ? 'bg-[#FF6105]/15 border-[#FF6105] shadow-[0_0_15px_rgba(255,97,5,0.25)] text-white'
                        : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="text-base font-mono-code font-bold text-white">
                      {preset.label}
                    </div>
                    <div className="text-xs font-mono-code text-[#FF6105]">
                      ${preset.usd} USD · {preset.m2} m²
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom tokens choice */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTokens('custom')}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-mono-code flex items-center justify-between transition-all cursor-pointer ${
                    selectedTokens === 'custom'
                      ? 'bg-[#FF6105]/15 border-[#FF6105] text-white'
                      : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700 text-neutral-400'
                  }`}
                >
                  <span>Otra cantidad personalizada de tokens...</span>
                  <Cpu className="w-3.5 h-3.5 text-[#FF6105]" />
                </button>

                {selectedTokens === 'custom' && (
                  <div className="mt-2 relative">
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      placeholder="Ej. 75 tokens"
                      value={customTokens}
                      onChange={(e) => setCustomTokens(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border-2 border-[#FF6105] text-white font-mono-code text-sm outline-hidden"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Live calculation banner */}
            {selectedTokens !== null && currentTokens > 0 && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs font-mono-code">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">Alícuota Total:</span>
                  <span className="text-white font-bold">{currentTokens} Tokens RWA</span>
                </div>
                <div className="text-right">
                  <span className="text-[#FF6105] font-bold block text-sm">${currentUsd} USD</span>
                  <span className="text-emerald-400 text-[11px]">{currentM2} m² equivalentes</span>
                </div>
              </div>
            )}

            {/* Error notice */}
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || selectedTokens === null || currentTokens <= 0}
              className="w-full py-3.5 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,97,5,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Registrando en Directo...' : 'Suscribir Tokens RWA'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          /* Confirmation Success Card */
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5 animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h3 className="text-xl font-heading font-bold text-white uppercase tracking-tight">
              ¡Tokens Suscritos Exitosamente!
            </h3>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-left space-y-2 text-xs font-mono-code">
              <div className="flex justify-between border-b border-neutral-900 pb-2">
                <span className="text-neutral-400">Tokens Asignados:</span>
                <strong className="text-white">{submittedData.tokens} Tokens</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-900 pb-2">
                <span className="text-neutral-400">Superficie Equivalente:</span>
                <strong className="text-emerald-400">{submittedData.m2} m²</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Aporte Simulado:</span>
                <strong className="text-[#FF6105]">${submittedData.amount} USD</strong>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Tu participación se ha incorporado en vivo al edificio y dashboard de la sala.
            </p>

            <button
              onClick={handleContinueToSurvey}
              className="w-full py-3.5 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar a Encuesta y Descarga de Dossier</span>
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
