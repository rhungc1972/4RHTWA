import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Check, Copy, ExternalLink, QrCode } from 'lucide-react';

interface AuditoriumQRProps {
  url?: string;
  size?: number;
  minimal?: boolean;
}

export const AuditoriumQR: React.FC<AuditoriumQRProps> = ({
  url,
  size = 290,
  minimal = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute dynamic target URL: prioritize window location so attendees on any domain reach the exact session
  const effectiveUrl =
    url ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/?view=audience`
      : 'https://rhrwa.netlify.app/?view=audience');

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        effectiveUrl,
        {
          width: size,
          margin: 1.5,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H', // Highest error correction for far-distance scanning in auditoriums
        },
        (error) => {
          if (error) console.error('Error rendering Auditorium QR:', error);
        }
      );
    }
  }, [effectiveUrl, size]);

  const handleOpen = () => {
    if (typeof window !== 'undefined') {
      window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* High-contrast container optimized for camera optical sensors from distant seats */}
      <div
        onClick={handleOpen}
        title="Escanea desde tu móvil o haz clic para interactuar"
        className="p-3 sm:p-4 bg-white rounded-3xl shadow-[0_0_60px_rgba(255,97,5,0.25)] border-4 border-white transition-all hover:scale-[1.03] duration-300 cursor-pointer group"
      >
        <canvas ref={canvasRef} className="block rounded-2xl" />
      </div>

      {/* Auditorium Instruction Callout (Rendered only when not in minimal single-text mode) */}
      {!minimal && (
        <div className="mt-4 flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono-code shadow-md">
          <Smartphone className="w-3.5 h-3.5 text-[#FF6105] animate-bounce" />
          <span className="font-semibold text-white">Escanea para participar</span>
          <span className="text-neutral-600">·</span>
          <button
            onClick={handleOpen}
            className="text-[#FF6105] hover:underline flex items-center gap-1 cursor-pointer"
            title="Abrir vista móvil de audiencia"
          >
            <span>Abrir link</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
