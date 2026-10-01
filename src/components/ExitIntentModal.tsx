import React from 'react';
import { Star, X, ArrowRight } from 'lucide-react';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSurvey: () => void;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({
  isOpen,
  onClose,
  onGoToSurvey,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-neutral-300 relative text-center text-neutral-900">
        {/* Top Orange accent line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#FF6105] rounded-t-xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black text-[#FF6105] text-[10px] font-mono-code uppercase tracking-wider border border-neutral-900 mb-3">
          <span>www.robertohung.com</span>
        </div>

        <div className="w-12 h-12 bg-[#FF6105]/10 border border-[#FF6105]/30 rounded-full flex items-center justify-center mx-auto mb-3 text-[#FF6105]">
          <Star className="w-6 h-6 fill-[#FF6105]" />
        </div>

        <h3 className="text-xl font-heading font-bold text-neutral-950 uppercase tracking-tight">
          ¿Antes de marcharte?
        </h3>

        <p className="text-xs text-neutral-600 my-2 leading-relaxed">
          Tu evaluación de 1 minuto es fundamental para Roberto Hung y te permitirá solicitar las memorias y diapositivas de la conferencia.
        </p>

        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700 text-left my-4">
          <div className="font-heading font-bold text-neutral-900 uppercase text-[11px] mb-1">
            Evaluación Rápida:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-neutral-600">
            <li>Calificación de la oratoria y rigor doctrinal</li>
            <li>Votación de temas para próximas masterclasses</li>
            <li>Pregunta o comentario directo al ponente</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onGoToSurvey();
            }}
            className="w-full py-3 px-4 rounded-lg bg-[#FF6105] hover:bg-[#ff7524] text-black font-display text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all font-bold cursor-pointer"
          >
            <span>Llenar Encuesta Breve (1 min)</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={onClose}
            className="py-2 text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
          >
            Cerrar de todos modos
          </button>
        </div>
      </div>
    </div>
  );
};
