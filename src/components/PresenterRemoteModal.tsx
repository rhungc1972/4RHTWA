import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Copy,
  Check,
  X,
  Radio,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface PresenterRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRemoteDirectly: () => void;
}

export const PresenterRemoteModal: React.FC<PresenterRemoteModalProps> = ({
  isOpen,
  onClose,
  onOpenRemoteDirectly,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'remote');
      const targetUrl = url.toString();
      setRemoteUrl(targetUrl);

      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          targetUrl,
          {
            width: 230,
            margin: 1.5,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
          },
          (error) => {
            if (error) console.error('Error generating remote QR code:', error);
          }
        );
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (remoteUrl) {
      navigator.clipboard.writeText(remoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-neutral-900">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-neutral-300 overflow-hidden">
        {/* Top Orange Brand Line */}
        <div className="h-2 bg-[#FF6105] w-full" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded bg-black text-[#FF6105] text-[10px] font-mono-code font-bold uppercase tracking-wider">
              [ Conexión Inalámbrica del Presentador ]
            </span>
          </div>

          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6105]/15 border border-[#FF6105]/30 flex items-center justify-center text-[#FF6105] shrink-0">
              <Smartphone className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display uppercase tracking-tight text-neutral-950">
                Mando a Distancia en tu Móvil
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                Escanea el código QR desde tu teléfono o abre una sesión en otra computadora para dirigir la proyección sin estar frente a esta pantalla.
              </p>
            </div>
          </div>

          {/* QR Code and Step Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="p-2.5 bg-white rounded-xl border border-neutral-300 shadow-sm">
                <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto" />
              </div>
              <span className="text-[10px] font-mono-code text-neutral-500 mt-2 text-center">
                Apunta con la cámara de tu teléfono
              </span>
            </div>

            {/* Steps */}
            <div className="space-y-3 text-xs text-neutral-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-[#FF6105] font-mono-code font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Escanea el código QR con tu móvil o tableta.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-[#FF6105] font-mono-code font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  En tu móvil se solicitará tu usuario y clave privada de presentador (nunca se mostrarán en esta pantalla proyectada).
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-[#FF6105] font-mono-code font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Desde tu teléfono podrás adelantar, retroceder y navegar libremente entre las secciones de la conferencia.
                </span>
              </div>
            </div>
          </div>

          {/* Direct URL */}
          <div className="mt-4">
            <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-neutral-600 mb-1">
              O abre el enlace directo en otro navegador:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={remoteUrl}
                className="flex-1 px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-mono-code text-neutral-700 truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#FF6105]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Footer action */}
          <div className="mt-5 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              Cerrar y continuar en esta pantalla
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRemoteDirectly();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FF6105] hover:bg-[#ff7524] text-black font-display text-xs uppercase tracking-wider font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Mando en esta ventana</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
