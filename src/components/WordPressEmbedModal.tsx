import React, { useState } from 'react';
import { X, Copy, Check, Code, Globe } from 'lucide-react';

interface WordPressEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WordPressEmbedModal: React.FC<WordPressEmbedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = window.location.origin;
  const embedCode = `<iframe 
  src="${currentOrigin}" 
  width="100%" 
  height="900px" 
  frameborder="0" 
  style="border: none; border-radius: 12px; overflow: hidden; width: 100%; min-height: 85vh;" 
  allow="clipboard-write"
  loading="lazy">
</iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-300 relative text-neutral-900">
        {/* Decorative Top Orange Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#FF6105] rounded-t-2xl" />

        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FF6105]/10 text-[#FF6105] border border-[#FF6105]/30">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-block text-[10px] font-mono-code text-[#FF6105] uppercase tracking-wider mb-0.5">
                [ www.robertohung.com · WordPress ]
              </div>
              <h3 className="text-lg font-heading font-bold text-neutral-950 uppercase tracking-tight">
                Incrustar en www.robertohung.com
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Para incrustar esta aplicación interactiva en tiempo real en una entrada o página de tu WordPress, inserta un bloque de <strong>HTML Personalizado</strong> y pega el siguiente código:
          </p>

          <div className="relative">
            <pre className="p-4 bg-black text-neutral-200 rounded-xl font-mono-code text-xs overflow-x-auto border border-neutral-900 leading-relaxed">
              {embedCode}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-[#FF6105] hover:bg-[#ff7524] text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm font-display uppercase tracking-wide cursor-pointer font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 space-y-1.5">
            <div className="font-heading font-bold text-neutral-900 flex items-center gap-1.5 uppercase text-[11px]">
              <Globe className="w-3.5 h-3.5 text-[#FF6105]" />
              Recomendación para tu página de WordPress:
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-600">
              <li>Configura la plantilla de página a <strong>Ancho Completo</strong> (Full Width / Sin barra lateral).</li>
              <li>La aplicación responde en tiempo real a los votos de los asistentes desde sus smartphones.</li>
              <li>Los asistentes pueden escanear los códigos QR proyectados o interactuar en la misma página.</li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors border border-neutral-300 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
