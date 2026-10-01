import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ExternalLink, Copy, Check, QrCode, KeyRound } from 'lucide-react';
import { getDayPin, getMonthPin, getYearPin } from '../utils/securityPins';

interface QRCodeCardProps {
  viewTarget: 'welcome' | 'form1' | 'form2' | 'survey';
  title: string;
  subtitle: string;
  instruction: string;
  accentColor?: 'orange' | 'white' | 'emerald';
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  viewTarget,
  title,
  subtitle,
  instruction,
  accentColor = 'orange',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const pinRequired =
    viewTarget === 'welcome' || viewTarget === 'form1'
      ? getDayPin()
      : viewTarget === 'form2'
      ? getMonthPin()
      : viewTarget === 'survey'
      ? getYearPin()
      : null;

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', viewTarget);
    const fullTargetUrl = url.toString();
    setQrUrl(fullTargetUrl);

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullTargetUrl,
        {
          width: 250,
          margin: 1.5,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [viewTarget]);

  const handleCopy = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleOpenDirect = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-300 flex flex-col items-center text-center relative overflow-hidden transition-all hover:border-[#FF6105] group">
      {/* Decorative top accent line */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-[#FF6105]" />

      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-display uppercase tracking-widest px-2.5 py-0.5 rounded bg-black text-[#FF6105] border border-neutral-900">
          <QrCode className="w-3 h-3" />
          ACCESO EN VIVO · AUDITORIO
        </span>

        {pinRequired && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-[#FF6105] text-black">
            <KeyRound className="w-2.5 h-2.5" />
            CLAVE: {pinRequired}
          </span>
        )}
      </div>

      <h3 className="text-xl font-heading font-bold text-neutral-950 tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-[280px] mb-4">{subtitle}</p>

      {/* QR Container (White canvas with sleek contrast) */}
      <div className="p-3 bg-neutral-50 rounded-xl shadow-xs border border-neutral-300 mb-4 transition-transform group-hover:scale-[1.02] duration-200">
        <canvas ref={canvasRef} className="rounded-lg max-w-[210px] max-h-[210px] sm:max-w-[230px] sm:max-h-[230px]" />
      </div>

      {/* Instruction Badge */}
      <div className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold mb-4 flex items-center justify-center gap-2 bg-black text-[#FF6105] border border-neutral-900">
        <span className="w-2 h-2 rounded-full bg-[#FF6105] animate-ping" />
        <span className="font-heading uppercase tracking-wide">{instruction}</span>
      </div>

      {/* Action Buttons for Presenter or Testing */}
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-300 cursor-pointer"
          title="Copiar enlace para compartir"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#FF6105]" />
              <span className="text-[#FF6105] font-semibold">¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-neutral-500" />
              <span>Copiar Enlace</span>
            </>
          )}
        </button>

        <button
          onClick={handleOpenDirect}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-black bg-[#FF6105] hover:bg-[#ff7524] rounded-lg transition-colors cursor-pointer shadow-xs"
          title="Abrir formulario en nueva pestaña"
        >
          <ExternalLink className="w-3.5 h-3.5 text-black" />
          <span>Probar Móvil</span>
        </button>
      </div>
    </div>
  );
};
