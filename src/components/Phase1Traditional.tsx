import React, { useState, useEffect } from 'react';
import { QRCodeCard } from './QRCodeCard';
import { AppStateData } from '../types';
import { EditableText } from '../context/ContentContext';
import {
  Sparkles,
  Camera,
  Upload,
  ExternalLink,
  ChevronDown,
  Building2,
  DollarSign,
  AlertTriangle,
  Users,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { BuildingVisualization } from './BuildingVisualization';

interface Phase1TraditionalProps {
  state: AppStateData;
}

interface ProjectImage {
  id: string;
  title: string;
  url: string;
  category: 'proyecto' | 'actividad';
}

const DEFAULT_IMAGES: ProjectImage[] = [
  {
    id: 'render-1',
    title: 'Render Arquitectónico RH-RWA',
    category: 'proyecto',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'render-2',
    title: 'Perspectiva Torre Residencial',
    category: 'proyecto',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
];

export const Phase1Traditional: React.FC<Phase1TraditionalProps> = ({ state }) => {
  const respondentsCount = state.phase1_2.respondentsCount;

  // Custom photo for Roberto Hung
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('rwa_roberto_photo_url') || '/Untitled.jpg';
    } catch {
      return '/Untitled.jpg';
    }
  });

  const [photoError, setPhotoError] = useState(false);
  const [showTraditionalDetails, setShowTraditionalDetails] = useState(false);

  // Images for the traditional building
  const [images] = useState<ProjectImage[]>(DEFAULT_IMAGES);
  const [activeImageId] = useState<string>(DEFAULT_IMAGES[0].id);
  const activeImage = images.find((img) => img.id === activeImageId) || images[0];

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPhotoUrl(base64);
        setPhotoError(false);
        try {
          localStorage.setItem('rwa_roberto_photo_url', base64);
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between max-w-7xl mx-auto py-2 text-white">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <EditableText
            contentKey="phase1_badge"
            defaultText="CONFERENCIA MAGISTRAL · APERTURA"
            className="px-3 py-1 rounded bg-[#FF6105] text-black text-[11px] font-mono-code font-bold uppercase tracking-wider"
          />
          <EditableText
            contentKey="phase1_speaker"
            defaultText="Roberto Hung Cavalieri"
            className="text-neutral-400 text-xs font-mono-code hidden sm:inline"
          />
        </div>

        <a
          href="https://www.robertohung.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono-code text-[#FF6105] hover:text-[#ff7524] transition-colors flex items-center gap-1"
        >
          <EditableText
            contentKey="phase1_link"
            defaultText="www.robertohung.com"
          />
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* HERO SECTION: Pure Black Background, Roberto Hung's Photo, Grand Question & QR Code */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-8 lg:p-10 border border-neutral-800 shadow-2xl relative overflow-hidden mb-6">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6105]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          {/* Left Column: Big Question & QR Code */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-[#FF6105] text-xs font-mono-code font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6105]" />
                <EditableText
                  contentKey="phase1_tagline"
                  defaultText="Experiencia Interactiva en Tiempo Real"
                />
              </div>

              {/* The Grand Central Headline specified by user */}
              <EditableText
                contentKey="phase1_title"
                defaultText="¿Sabes lo que es la tokenización de activos del mundo real (RWA)?"
                as="h1"
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display uppercase tracking-tight text-white leading-[1.08] block"
              />

              <EditableText
                contentKey="phase1_subtitle"
                defaultText="Roberto Hung desarrolló esta experiencia interactiva para generar iniciales reflexiones sobre el fenómeno de la tokenización de activos de la vida real (RWA). Conecte su teléfono móvil desde su asiento para participar en la simulación."
                as="p"
                className="text-sm sm:text-base text-neutral-300 mt-4 leading-relaxed font-sans max-w-2xl block"
              />
            </div>

            {/* QR CODE CARD: High Contrast, Prominent, Clear Instructions */}
            <div className="bg-[#121212] p-5 sm:p-6 rounded-2xl border-2 border-[#FF6105] shadow-[0_0_30px_rgba(255,97,5,0.15)] flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0 bg-white p-3 rounded-xl shadow-lg border border-neutral-700">
                <QRCodeCard
                  viewTarget="welcome"
                  title="Acceso en Vivo"
                  subtitle="Escanee para ingresar"
                  instruction="Apunta la cámara de tu móvil"
                />
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-[11px] font-mono-code text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SALA CONECTADA EN VIVO</span>
                  <span className="text-neutral-500">·</span>
                  <strong className="text-[#FF6105]">{respondentsCount}</strong> participantes
                </div>

                <h3 className="text-base sm:text-lg font-heading font-bold text-white uppercase tracking-wide">
                  Escanea el Código QR para Participar
                </h3>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  Al leer el código se abrirá la primera fase en tu teléfono. Se te solicitará la{' '}
                  <strong className="text-[#FF6105] font-semibold">Clave de la Sala</strong> (el día de hoy, dictada por el ponente).
                </p>

                <div className="pt-2 border-t border-neutral-800 text-[11px] font-mono-code text-neutral-400">
                  * El código QR se mantendrá visible en las siguientes pantallas para quienes entren más tarde.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Roberto Hung Photo / Visual Presentation Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-black border-2 border-neutral-800 shadow-2xl group">
              {/* Photo Display with Graceful Fallback */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-b from-neutral-900 to-black flex items-center justify-center">
                {!photoError ? (
                  <img
                    src={photoUrl}
                    alt="Roberto Hung Cavalieri"
                    onError={() => setPhotoError(true)}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  /* Stylized Authentic Silhouette/Portrait fallback when image file is loading */
                  <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-b from-[#151515] to-[#050505] text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FF6105_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="relative z-10 pt-4">
                      {/* Signature Orange Spectacles Icon / Avatar */}
                      <div className="w-24 h-24 mx-auto rounded-full bg-[#1c1c1c] border-2 border-[#FF6105] flex items-center justify-center shadow-xl">
                        <span className="text-3xl font-display font-black text-[#FF6105]">RH</span>
                      </div>
                      <h4 className="text-lg font-display uppercase tracking-wider text-white mt-3">
                        Roberto Hung Cavalieri
                      </h4>
                      <p className="text-[11px] font-mono-code text-[#FF6105]">
                        Pensamiento Jurídico & Era Digital
                      </p>
                    </div>

                    <div className="relative z-10 my-auto p-4 rounded-xl bg-black/60 border border-neutral-800 text-xs text-neutral-300 italic font-heading">
                      «Te invito a que pensemos diferente.»
                    </div>
                  </div>
                )}

                {/* Circular Badge: ERA DIGITAL · INNOVACIÓN · PENSAMIENTO JURÍDICO */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                  <div className="w-20 h-20 rounded-full border border-dashed border-white/60 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-1 shadow-lg">
                    <span className="text-[8px] font-mono-code font-bold uppercase text-[#FF6105] tracking-tighter leading-tight">
                      ERA DIGITAL
                    </span>
                    <span className="text-[7px] text-white tracking-widest uppercase">
                      INNOVACIÓN
                    </span>
                    <span className="text-[6.5px] text-neutral-300 uppercase leading-none">
                      PENSAMIENTO JURÍDICO
                    </span>
                  </div>
                </div>

                {/* Overlaid Quote from Photo */}
                <div className="absolute bottom-4 right-4 z-20">
                  <a
                    href="https://www.robertohung.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-[11px] font-display uppercase tracking-wider border border-neutral-700 backdrop-blur-xs transition-colors"
                  >
                    <span>SOBRE MÍ</span>
                    <span className="text-[#FF6105]">→</span>
                  </a>
                </div>

                {/* Change photo button on top corner */}
                <div className="absolute top-3 right-3 z-20">
                  <label
                    title="Subir o cambiar foto de Roberto Hung"
                    className="p-2 rounded-lg bg-black/80 hover:bg-[#FF6105] text-neutral-300 hover:text-black transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono-code shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Cambiar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-[#111111] border-t border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-heading font-bold text-white uppercase text-sm">
                    Roberto Hung Cavalieri
                  </div>
                  <div className="text-[11px] text-[#FF6105] font-mono-code">
                    Conferencista & Investigador RWA
                  </div>
                </div>
                <div className="text-[11px] font-mono-code text-neutral-400">
                  Caracas / Madrid
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER ACCORDION: PARÁMETROS DEL MODELO TRADICIONAL & RENDERS ARQUITECTÓNICOS */}
      <div className="bg-[#111111] rounded-2xl border border-neutral-800 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h3 className="text-sm sm:text-base font-heading font-bold text-white uppercase tracking-wide">
                El Modelo Tradicional: La Oportunidad Excluyente ($10.000 USD Mínimo)
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Filtro de entrada del sistema financiero tradicional vs. la capacidad de ahorro social en la sala.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTraditionalDetails(!showTraditionalDetails)}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>{showTraditionalDetails ? 'Ocultar Parámetros' : 'Ver Parámetros & Renders'}</span>
            <ChevronDown
              className={`w-4 h-4 text-[#FF6105] transition-transform duration-200 ${
                showTraditionalDetails ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {showTraditionalDetails && (
          <div className="mt-5 pt-5 border-t border-neutral-800 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left: Building Visualization / Renders */}
            <div className="lg:col-span-7 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-heading font-bold uppercase text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#FF6105]" />
                  <span>Proyecto Inmobiliario RH-RWA (10 Pisos · 1.000 m²)</span>
                </span>
                <span className="text-[10px] font-mono-code text-neutral-400">
                  Valor Total: $1.000.000 USD
                </span>
              </div>

              <div className="h-64 rounded-xl overflow-hidden border border-neutral-800">
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Traditional Barrier Parameters */}
            <div className="lg:col-span-5 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/60 text-red-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold font-heading uppercase text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Regla del Filtro Mínimo</span>
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-300">
                  Bajo financiamiento inmobiliario clásico, los costos fijos legales, fiduciarios y notariales hacen inviable procesar tickets menores a <strong className="text-white font-mono-code">$10.000 USD</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="text-[11px] font-heading font-bold uppercase text-neutral-300">
                  Variables de la Simulación en Vivo:
                </div>
                <ul className="space-y-1.5 text-[11px] text-neutral-400 font-mono-code">
                  <li>• Meta de Capital Total: $1.000.000 USD</li>
                  <li>• Ticket Tradicional: $10.000 USD (Excluyente)</li>
                  <li>• Fraccionamiento RWA: $10 USD por token (0.01 m²)</li>
                  <li>• Token ERC-3643 / SPV de Propiedad Titularizada</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
