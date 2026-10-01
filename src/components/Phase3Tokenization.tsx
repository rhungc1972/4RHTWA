import React, { useState } from 'react';
import { AppStateData } from '../types';
import {
  Cpu,
  Sparkles,
  Scale,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Layers,
  Camera,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';

interface Phase3Props {
  state: AppStateData;
}

const DEFAULT_PHOTO_1 = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_PHOTO_2 = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80';

export const Phase3Tokenization: React.FC<Phase3Props> = ({ state }) => {
  const p34 = state.phase3_4;
  const recentOrders = state.raw.recentForm2 || [];

  // Project photos from localStorage (unified with Phase 2 and Phase 5)
  const [photo1, setPhoto1] = useState<string>(() => {
    try {
      return localStorage.getItem('rwa_project_photo_url_1') || localStorage.getItem('rwa_project_photo_url') || DEFAULT_PHOTO_1;
    } catch {
      return DEFAULT_PHOTO_1;
    }
  });

  const [photo2, setPhoto2] = useState<string>(() => {
    try {
      return localStorage.getItem('rwa_project_photo_url_2') || DEFAULT_PHOTO_2;
    } catch {
      return DEFAULT_PHOTO_2;
    }
  });

  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [targetSlotToEdit, setTargetSlotToEdit] = useState<1 | 2>(1);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const currentPhoto = activeSlot === 1 ? photo1 : photo2;

  const handleSavePhotoModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;
    const url = photoUrlInput.trim();
    if (targetSlotToEdit === 1) {
      setPhoto1(url);
      try {
        localStorage.setItem('rwa_project_photo_url_1', url);
        localStorage.setItem('rwa_project_photo_url', url);
      } catch {}
    } else {
      setPhoto2(url);
      try {
        localStorage.setItem('rwa_project_photo_url_2', url);
      } catch {}
    }
    setIsPhotoModalOpen(false);
    setPhotoUrlInput('');
  };

  const handleFileUploadModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        if (targetSlotToEdit === 1) {
          setPhoto1(base64);
          try {
            localStorage.setItem('rwa_project_photo_url_1', base64);
            localStorage.setItem('rwa_project_photo_url', base64);
          } catch {}
        } else {
          setPhoto2(base64);
          try {
            localStorage.setItem('rwa_project_photo_url_2', base64);
          } catch {}
        }
        setIsPhotoModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between max-w-7xl mx-auto pb-4 text-white space-y-6">
      {/* Slide Header with Large Typography */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono-code uppercase tracking-wider bg-neutral-900 text-[#FF6105] border border-neutral-800">
            Fase 3 de 5 · Arquitectura del Protocolo RWA
          </span>
          <span className="text-xs text-neutral-500 font-mono-code">
            #ElDerechoDeHacerRuido · Roberto Hung Cavalieri
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold uppercase tracking-tight text-white leading-tight">
          Protocolo de Tokenización: <span className="text-[#FF6105]">Especificaciones & Emisión</span>
        </h2>
        <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed font-body">
          Subdivisión matemática y contractual de la Torre Residencial RH-RWA en 100.000 tokens fungibles, permitiendo que cada participante acceda a la copropiedad con plenos derechos económicos.
        </p>
      </div>

      {/* TOP SECTION: Project Image Side-by-Side with Tokenization Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Photograph with Badges & Switcher */}
        <div className="lg:col-span-6 bg-[#0A0A0A] rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#FF6105]" />
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-white">
                Fotografía del Activo Inmobiliario
              </h3>
            </div>

            {/* Switcher Slot 1 / Slot 2 */}
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px] font-mono-code">
              <button
                type="button"
                onClick={() => setActiveSlot(1)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSlot === 1
                    ? 'bg-[#FF6105] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Foto 1: Fachada
              </button>
              <button
                type="button"
                onClick={() => setActiveSlot(2)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSlot === 2
                    ? 'bg-[#FF6105] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Foto 2: Gemelo BIM
              </button>
            </div>
          </div>

          {/* Main Photo Render */}
          <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 group shadow-inner">
            <img
              src={currentPhoto}
              alt="Proyecto Inmobiliario RH-RWA"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/20" />

            {/* Top Badges */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono-code font-bold text-[#FF6105] border border-[#FF6105]/40">
                {activeSlot === 1 ? 'Foto 1 · Perspectiva Exterior' : 'Foto 2 · Modelado BIM & Estructura'}
              </span>
              <button
                onClick={() => {
                  setTargetSlotToEdit(activeSlot);
                  setIsPhotoModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono-code text-white hover:text-[#FF6105] border border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Cambiar Foto</span>
              </button>
            </div>

            {/* Bottom Caption on Image */}
            <div className="absolute bottom-3 inset-x-3 bg-black/90 backdrop-blur-md p-3.5 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-heading font-bold text-white uppercase block">
                    Torre Residencial RH-RWA
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono-code">
                    10 Plantas · 1.000 m² Totales · Valuación: $1.000.000 USD
                  </span>
                </div>
                <span className="text-xs font-mono-code text-[#FF6105] font-bold">
                  $1.000 USD / m²
                </span>
              </div>
            </div>
          </div>

          {/* Legal / Smart Contract Certification */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono-code">
            <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
              <Scale className="w-3.5 h-3.5 text-[#FF6105]" />
              <span>Certeza Jurídica & Smart Contract:</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-body">
              Cada token representa una alícuota patrimonial en el vehículo titular (SPV/Fideicomiso) con derecho automático a dividendos por arrendamiento y voto en asamblea descentralizada.
            </p>
          </div>
        </div>

        {/* Right Column: Tokenization Specifications & Key Subscription Counters */}
        <div className="lg:col-span-6 bg-[#0A0A0A] rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#FF6105]" />
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-white">
                Especificaciones de la Tokenización RH-RWA
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[#FF6105] font-mono-code text-xs font-bold">
              1 Token = $10 USD
            </span>
          </div>

          {/* Math Equivalences Box with High Legibility */}
          <div className="p-5 bg-neutral-950 rounded-2xl border-2 border-[#FF6105]/80 shadow-md">
            <div className="text-xs font-bold uppercase font-mono-code text-[#FF6105] tracking-wider">
              Subdivisión Matemática del Inmueble
            </div>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono-code text-white mt-1 tracking-tight">
              100.000 Tokens
            </div>
            <div className="text-sm text-neutral-300 mt-1.5 font-body">
              Precio unitario: <strong className="text-[#FF6105] font-mono-code text-base">$10 USD</strong> por token fungible
            </div>
          </div>

          {/* Equivalence Table */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs sm:text-sm space-y-2.5 font-mono-code text-neutral-300">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-900">
              <span className="text-neutral-400">1 Token ($10 USD)</span>
              <span className="font-bold text-white">0,01 m²</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-900">
              <span className="text-neutral-400">10 Tokens ($100 USD)</span>
              <span className="font-bold text-white">0,10 m²</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-900">
              <span className="text-[#FF6105] font-bold">100 Tokens ($1.000 USD)</span>
              <span className="font-bold text-[#FF6105]">1,00 m² Habitable</span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-neutral-400">10.000 Tokens ($100.000 USD)</span>
              <span className="font-bold text-white">1 Piso Completo (100 m²)</span>
            </div>
          </div>

          {/* Live Subscription Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
              <span className="text-[11px] uppercase font-mono-code text-neutral-400 block mb-1">
                Tokens Suscritos
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono-code text-white">
                {p34.tokensSubscribed.toLocaleString('es-ES')}
              </span>
              <span className="text-xs text-neutral-500 block font-mono-code mt-1">
                de 100.000 emitidos
              </span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
              <span className="text-[11px] uppercase font-mono-code text-neutral-400 block mb-1">
                Capital RWA Captado
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono-code text-[#FF6105]">
                ${p34.usdSubscribed.toLocaleString('es-ES')}
              </span>
              <span className="text-xs text-neutral-500 block font-mono-code mt-1">
                USD comprometidos
              </span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
              <span className="text-[11px] uppercase font-mono-code text-neutral-400 block mb-1">
                Copropietarios
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono-code text-white">
                {p34.coOwnersCount}
              </span>
              <span className="text-xs text-neutral-500 block font-mono-code mt-1">
                asistentes con copropiedad
              </span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
              <span className="text-[11px] uppercase font-mono-code text-neutral-400 block mb-1">
                Metros² Absorbidos
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono-code text-white">
                {p34.m2Absorbed}
              </span>
              <span className="text-xs text-neutral-500 block font-mono-code mt-1">
                m² de la torre (1.000 m² tot.)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Full-Width Registry of Registered Orders */}
      <div className="bg-[#0A0A0A] rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6105] animate-pulse" />
            <h3 className="text-base sm:text-lg font-heading font-bold text-white uppercase tracking-tight">
              Relación de las Órdenes Registradas en Sala (Tiempo Real)
            </h3>
          </div>
          <span className="text-xs font-mono-code text-neutral-400 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800">
            {recentOrders.length} órdenes procesadas
          </span>
        </div>

        {recentOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-xs font-heading font-bold text-white truncate max-w-[130px]">
                      {order.name || 'Inversor RWA'}
                    </span>
                  </div>
                  <span className="text-xs font-mono-code font-bold text-[#FF6105]">
                    +{order.tokens} Tokens
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono-code text-neutral-400 pt-1 border-t border-neutral-900">
                  <span>${order.amount.toLocaleString()} USD</span>
                  <span className="text-emerald-400 font-semibold">{order.m2} m² adquiridos</span>
                </div>

                <div className="text-[9px] font-mono-code text-neutral-500 text-right">
                  {new Date(order.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-950 rounded-2xl border border-neutral-800/60">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-heading text-neutral-400 uppercase">
              Esperando suscripción de tokens desde los dispositivos móviles...
            </p>
            <p className="text-xs text-neutral-500 mt-1 font-mono-code">
              Los asistentes que completen el Formulario 2 verán sus órdenes reflejadas aquí al instante.
            </p>
          </div>
        )}
      </div>

      {/* Modal to update photo */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A0A0A] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-800 text-white">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold font-heading uppercase text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FF6105]" />
                Actualizar Fotografía {targetSlotToEdit}
              </h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono-code">
              <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTargetSlotToEdit(1)}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer ${
                    targetSlotToEdit === 1
                      ? 'bg-[#FF6105] text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Foto 1 (Fachada)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetSlotToEdit(2)}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer ${
                    targetSlotToEdit === 2
                      ? 'bg-[#FF6105] text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Foto 2 (Gemelo BIM)
                </button>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-2">
                  Opción 1: Subir imagen desde tu equipo
                </label>
                <label className="w-full py-3.5 px-4 rounded-xl border border-dashed border-neutral-700 hover:border-[#FF6105] bg-neutral-950 flex items-center justify-center gap-2 cursor-pointer text-neutral-300 hover:text-[#FF6105] transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar archivo JPG / PNG...</span>
                  <input type="file" accept="image/*" onChange={handleFileUploadModal} className="hidden" />
                </label>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <label className="block text-neutral-300 font-bold uppercase mb-2">
                  Opción 2: Pegar enlace URL de fotografía
                </label>
                <form onSubmit={handleSavePhotoModal} className="space-y-3">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white outline-hidden focus:border-[#FF6105]"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPhotoModalOpen(false)}
                      className="py-2 px-3.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!photoUrlInput.trim()}
                      className="py-2 px-4 rounded-xl bg-[#FF6105] hover:bg-[#ff7524] text-black font-bold uppercase disabled:opacity-40"
                    >
                      Guardar Fotografía
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
