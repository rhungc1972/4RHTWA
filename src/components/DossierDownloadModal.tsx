import React, { useRef, useState } from 'react';
import {
  Download,
  X,
  ExternalLink,
  Award,
  Layers,
  Scale,
  Check,
  Building,
} from 'lucide-react';
import { generateAndDownloadDossierPDF } from '../utils/pdfGenerator';

interface DossierDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendeeName: string;
  attendeeEmail: string;
  tokensSubscribed?: number;
  usdAmount?: number;
  m2Acquired?: number;
  ratings?: {
    quality?: number;
    clarity?: number;
    nps?: number;
  };
}

export const DossierDownloadModal: React.FC<DossierDownloadModalProps> = ({
  isOpen,
  onClose,
  attendeeName,
  attendeeEmail,
  tokensSubscribed = 10,
  usdAmount = 100,
  m2Acquired = 0.1,
  ratings,
}) => {
  const printableRef = useRef<HTMLDivElement | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      generateAndDownloadDossierPDF({
        attendeeName,
        attendeeEmail,
        tokensSubscribed,
        usdAmount,
        m2Acquired,
        ratings,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn select-none text-white">
      <div className="bg-[#0A0A0A] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-800 relative text-white my-8 overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#FF6105] to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800 pb-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[#FF6105] text-[10px] font-mono-code font-bold uppercase mb-1.5">
              <span>ROBERTO HUNG CAVALIERI · RWA PLATFORM</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-white uppercase tracking-tight">
              Ejemplar de Participación & Dossier RWA
            </h3>
            <p className="text-xs text-neutral-400">
              Guarde este documento oficial con el registro de su cuota y fundamentos doctrinales.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-[#FF6105] hover:bg-[#ff7524] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              title="Descargar PDF Oficial"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡PDF Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dossier Document Preview */}
        <div
          ref={printableRef}
          className="bg-neutral-950 p-5 sm:p-6 rounded-2xl border border-neutral-800 text-xs space-y-4 max-h-[60vh] overflow-y-auto"
        >
          {/* Certificate Header Banner */}
          <div className="p-4 bg-black text-white rounded-xl border border-[#FF6105]/50 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-mono-code text-[#FF6105] font-bold uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>CERTIFICADO DE ACREDITACIÓN & COPRA</span>
              </div>
              <div className="text-base sm:text-lg font-heading font-bold text-white uppercase">
                {attendeeName || 'Asistente a la Conferencia'}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono-code">
                {attendeeEmail || 'Identificación en sala'} · Sesión en Directo
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#FF6105] font-mono-code font-bold text-xs shrink-0">
              RWA
            </div>
          </div>

          {/* Investment & Ownership Specs */}
          <div className="p-4 bg-[#0A0A0A] rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <h4 className="font-heading font-bold uppercase text-white text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF6105]" />
                Participación en el Proyecto Inmobiliario RH-RWA
              </h4>
              <span className="text-[10px] font-mono-code bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/60 font-bold">
                Copropiedad Verificada
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono-code text-center">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-[9px] uppercase text-neutral-500 block">Tokens RWA</span>
                <strong className="text-base text-[#FF6105] font-black">{tokensSubscribed}</strong>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-[9px] uppercase text-neutral-500 block">Superficie</span>
                <strong className="text-base text-white font-black">{m2Acquired} m²</strong>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-[9px] uppercase text-neutral-500 block">Aporte Comprometido</span>
                <strong className="text-base text-white font-black">${usdAmount} USD</strong>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Representa una alícuota molecular sobre la torre residencial de 10 pisos ($1.000.000 USD de valuación). Da derecho a dividendos proporcionales por alquiler y voto en el protocolo de gobernanza.
            </p>
          </div>

          {/* The 6 Pillars of Roberto Hung Summary */}
          <div className="p-4 bg-[#0A0A0A] rounded-xl border border-neutral-800 space-y-2.5">
            <h4 className="font-heading font-bold uppercase text-white text-xs flex items-center gap-1.5 border-b border-neutral-900 pb-1.5">
              <Scale className="w-3.5 h-3.5 text-[#FF6105]" />
              Fundamentos Jurídicos RWA (Roberto Hung Cavalieri)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-300">
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <strong className="text-white block font-semibold">1. Gobernanza On-Chain</strong>
                Voto proporcional para administración y reformas del edificio.
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <strong className="text-white block font-semibold">2. Rentas Automáticas</strong>
                Reparto directo de alquileres a la wallet en stablecoins.
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <strong className="text-white block font-semibold">3. Liquidez Inmediata</strong>
                Venta ágil de participaciones sin liquidar el inmueble entero.
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <strong className="text-white block font-semibold">4. Colateral y Crédito</strong>
                Uso de cuotas como garantía crediticia manteniendo rentas.
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-[#FF6105]/40 sm:col-span-2">
                <strong className="text-[#FF6105] block font-semibold">5. Tránsito Negocial Transparente</strong>
                Transmisión del derecho verificable, eficaz, económico y seguro.
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 sm:col-span-2">
                <strong className="text-white block font-semibold">6. Despertar del Capital Muerto</strong>
                Transformación del ahorro paralizado en palanca económica formal.
              </div>
            </div>
          </div>

          {/* Gratitude & Closing Note */}
          <div className="p-4 bg-neutral-900 rounded-xl border border-[#FF6105]/30 text-center space-y-1">
            <p className="text-xs font-heading font-bold text-white">
              “Agradecemos profundamente su activa participación en esta sesión de inmersión en la economía tokenizada.”
            </p>
            <p className="text-[10px] text-neutral-400 font-mono-code">
              Roberto Hung Cavalieri · www.robertohung.com · #ElDerechoDeHacerRuido
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono-code">
            Documento digital listo para descargar
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
