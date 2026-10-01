import React from 'react';
import { AuditoriumQR } from './AuditoriumQR';
import { AppStateData } from '../types';
import { ChevronRight } from 'lucide-react';

interface Phase1AuditoriumHomeProps {
  state: AppStateData;
  onGoToPhase2?: () => void;
}

export const Phase1AuditoriumHome: React.FC<Phase1AuditoriumHomeProps> = ({
  state,
  onGoToPhase2,
}) => {
  return (
    <div className="relative w-full min-h-screen bg-[#000000] text-white flex flex-col justify-center overflow-hidden select-none">
      {/* 
        SILUETA DE ROBERTO HUNG:
        - Fondo: Negro absoluto (#000000).
        - Posicionada estrictamente en el tercio derecho de la pantalla (right-0, w-1/3 a w-5/12).
        - La cara y cabeza del conferencista se sitúan en la zona superior derecha, COMPLETAMENTE DESPEJADA.
        - Ningún texto ni el código QR invaden este sector bajo ninguna resolución.
      */}
      <div className="absolute right-0 bottom-0 top-0 w-full sm:w-1/2 lg:w-5/12 pointer-events-none z-0 flex items-end justify-end overflow-hidden">
        {/* Subtle radial ambient warmth behind speaker */}
        <div className="absolute right-4 top-16 w-80 h-80 bg-[#FF6105]/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute right-8 bottom-12 w-[28rem] h-[28rem] bg-[#FF6105]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Clean Roberto Hung silhouette with crisp head & face always uncovered */}
        <img
          src="/assets/roberto_hung_clean.png"
          alt="Roberto Hung Cavalieri - Tokenización RWA"
          className="relative max-h-[90vh] lg:max-h-[96vh] w-auto object-contain object-bottom sm:object-right-bottom filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] opacity-95"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 100%), linear-gradient(to top, transparent 0%, black 8%, black 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 5%, black 14%, black 100%), linear-gradient(to top, transparent 0%, black 8%, black 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'destination-in',
          }}
        />

        {/* Visual gesture line indicating the QR code as the object signaled by Roberto */}
        <div
          className="hidden lg:block absolute left-4 bottom-[38%] w-40 h-px bg-gradient-to-r from-transparent via-[#FF6105]/30 to-[#FF6105]/60 pointer-events-none"
          style={{ transform: 'rotate(-10deg)' }}
        />
      </div>

      {/* 
        STAGE FOREGROUND:
        - Columnas 1 a 5: Pregunta principal con tipografía grande de alto impacto.
        - Columnas 6 a 8: Código QR de alta visibilidad para escaneo desde el auditorio, señalado por Roberto.
        - Columnas 9 a 12: COMPLETAMENTE DESPEJADAS para garantizar que la cara y cuerpo de Roberto NUNCA se tapen.
      */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Pregunta única con tipografía gigante minimalista de alto contraste */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono-code uppercase tracking-wider text-[#FF6105]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6105] animate-pulse" />
              <span>Conferencia Magistral · Roberto Hung</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-md select-none">
              ¿Sabes lo que es la{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FF6105] to-[#FF8038]">
                tokenización de activos
              </span>{' '}
              del mundo real (RWA)?
            </h1>

            <p className="text-xs sm:text-sm text-neutral-400 font-mono-code leading-relaxed">
              Escanea el código con la cámara de tu teléfono para participar en tiempo real desde tu asiento en la sala.
            </p>
          </div>

          {/* Center Column: Código QR señalado por Roberto Hung */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center relative">
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#FF6105]/25 via-[#FF6105]/10 to-transparent blur-xl pointer-events-none animate-pulse" />

              {/* High Legibility Auditorium QR Canvas */}
              <div className="relative z-10">
                <AuditoriumQR
                  size={270}
                  minimal={true}
                />
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[11px] font-mono-code text-neutral-400 uppercase tracking-widest block">
                Acceso Interactivo en Sala
              </span>
            </div>
          </div>

          {/* Right Column: Espacio 100% Libre y Despejado para Roberto Hung (Nunca se le tapa la cara) */}
          <div className="hidden lg:block lg:col-span-4 pointer-events-none" />
        </div>
      </div>

      {/* Discreet Advance Button for Presenter (Soft opacity, non-distracting) */}
      {onGoToPhase2 && (
        <div className="absolute bottom-5 right-6 z-20">
          <button
            onClick={onGoToPhase2}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-[#FF6105] text-neutral-400 hover:text-black border border-neutral-800 text-xs font-mono-code transition-all opacity-30 hover:opacity-100 cursor-pointer shadow-lg backdrop-blur-xs"
            title="Avanzar a Fase 2 (o pulsa Flecha Derecha →)"
          >
            <span>Fase 2: Diagnóstico</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
