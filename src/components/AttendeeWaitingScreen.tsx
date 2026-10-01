import React, { useState } from 'react';
import { Radio, Sparkles, KeyRound, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { AccessGateModal } from './AccessGateModal';

interface AttendeeWaitingScreenProps {
  onSessionActivated?: () => void;
  onEnterWithPin?: () => void;
}

export const AttendeeWaitingScreen: React.FC<AttendeeWaitingScreenProps> = ({
  onSessionActivated,
  onEnterWithPin,
}) => {
  const [showGateModal, setShowGateModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-between p-4 sm:p-6 relative select-none overflow-hidden">
      {/* Background ambient orange pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6105]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between py-2 border-b border-neutral-900/80 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FF6105] text-black flex items-center justify-center font-display text-xs font-black">
            RH
          </div>
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-300">
            Roberto Hung Cavalieri
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[10px] font-mono-code text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6105] animate-ping" />
          <span>SALA EN VIVO</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="my-auto w-full max-w-md bg-[#0A0A0A] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center z-10 overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#FF6105] to-transparent" />

        {/* Live Radar Pulse Icon */}
        <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#FF6105]/20 animate-ping opacity-75" />
          <div className="relative w-14 h-14 rounded-2xl bg-neutral-900 border border-[#FF6105]/50 flex items-center justify-center text-[#FF6105] shadow-[0_0_20px_rgba(255,97,5,0.3)]">
            <Radio className="w-7 h-7 animate-pulse text-[#FF6105]" />
          </div>
        </div>

        {/* Micro-badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono-code text-[#FF6105] uppercase tracking-wider mb-4 rounded-full">
          <span>SALA EN ESPERA · CONECTADO</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white mb-4">
          Conferencia de Tokenización RWA
        </h1>

        {/* Required Literal Statement */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800/80 mb-6 text-left relative">
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-body">
            “<strong className="text-white">Roberto Hung ha desarrollado esta aplicación interactiva para la divulgación del fenómeno y cultura de la tokenización de activos del mundo real (RWA) (Atento que se inicie la actividad)</strong>”
          </p>
          <div className="mt-3 pt-2.5 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono-code text-neutral-500">
            <span>Sincronización en tiempo real</span>
            <span className="text-[#FF6105]">#ElDerechoDeHacerRuido</span>
          </div>
        </div>

        {/* Status Callout */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono-code text-neutral-400 bg-neutral-950/60 p-3 rounded-xl border border-neutral-900 mb-5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Esperando señal de inicio del expositor...</span>
        </div>

        {/* Manual Access Button if code is already known */}
        <button
          onClick={() => {
            if (onEnterWithPin) {
              onEnterWithPin();
            } else {
              setShowGateModal(true);
            }
          }}
          className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group"
        >
          <KeyRound className="w-4 h-4 text-[#FF6105] group-hover:rotate-45 transition-transform" />
          <span>Ingresar Clave de Sala Manualmente</span>
        </button>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md py-3 text-center text-[11px] text-neutral-500 font-mono-code z-10 flex items-center justify-between">
        <span>Roberto Hung Cavalieri</span>
        <a
          href="https://www.robertohung.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF6105] hover:underline flex items-center gap-1"
        >
          <span>robertohung.com</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Fallback Access Gate Modal */}
      {showGateModal && (
        <AccessGateModal
          isOpen={true}
          onClose={() => setShowGateModal(false)}
          onSuccess={(role) => {
            setShowGateModal(false);
            if (onSessionActivated) {
              onSessionActivated();
            }
          }}
        />
      )}
    </div>
  );
};
