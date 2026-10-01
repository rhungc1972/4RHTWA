import React, { useState } from 'react';
import { AppStateData } from '../types';
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Users,
  TrendingDown,
  DollarSign,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Building2,
  Scale,
  Layers,
  Lock,
  Eye,
} from 'lucide-react';

interface Phase2Props {
  state: AppStateData;
  onGoToPhase3?: () => void;
}

const DEFAULT_PHOTO_1 = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_PHOTO_2 = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80';

export const Phase2ExclusionDiagnosis: React.FC<Phase2Props> = ({ state, onGoToPhase3 }) => {
  const p12 = state.phase1_2;
  const respondents = p12.respondentsCount;
  const qualified = p12.qualifiedCount;
  const excluded = p12.excludedCount;
  const exclusionRate = p12.exclusionRate;
  
  // Real mathematical indicators with zero hallucinations
  const targetCapital = p12.targetCapital || 1000000;
  const traditionalCaptured = p12.traditionalCapitalCaptured ?? (qualified > 0 ? p12.totalCollected : 0);
  const excludedBlocked = p12.excludedCapitalBlocked ?? 0;
  const totalOffered = p12.totalOfferedCapital ?? (traditionalCaptured + excludedBlocked);
  const deficit = p12.traditionalDeficit ?? Math.max(0, targetCapital - traditionalCaptured);
  const collectedPercent = p12.collectedPercent ?? +((traditionalCaptured / targetCapital) * 100).toFixed(2);

  // Two project photos shared with the whole application
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

  const [activePhotoSlot, setActivePhotoSlot] = useState<1 | 2>(1);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [targetSlotToEdit, setTargetSlotToEdit] = useState<1 | 2>(1);
  const [photoInput, setPhotoInput] = useState('');

  const currentDisplayedPhoto = activePhotoSlot === 1 ? photo1 : photo2;

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoInput.trim()) return;
    const url = photoInput.trim();
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
    setPhotoInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="w-full flex-1 flex flex-col justify-between max-w-7xl mx-auto text-white space-y-6">
      {/* Top Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono-code uppercase tracking-wider bg-red-950/60 text-red-400 border border-red-800/60">
            Fase 2 de 5 · Diagnóstico Analítico en Directo
          </span>
          <span className="text-xs text-neutral-500 font-mono-code">
            #ElDerechoDeHacerRuido · Roberto Hung Cavalieri
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold uppercase tracking-tight text-white leading-tight">
          Diagnóstico del Capital Paralizado: <span className="text-[#FF6105]">La Brecha de Exclusión</span>
        </h2>
        <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed font-body">
          Visualización empírica de cómo la barrera tradicional ($10.000 USD por cuota indivisa) trunca la movilización del ahorro privado en el propio auditorio, dejando al promotor con un severo déficit de financiación.
        </p>
      </div>

      {/* Main Grid: Project Photos on Left, Audited Metrics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Photographs & Structural BIM Showcase */}
        <div className="lg:col-span-6 bg-[#0A0A0A] rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-xl flex flex-col justify-between space-y-4">
          {/* Header with Photo Slot Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#FF6105]" />
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-white">
                Fotografías del Proyecto RH-RWA
              </h3>
            </div>

            {/* Photo Selector Switcher */}
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px] font-mono-code">
              <button
                onClick={() => setActivePhotoSlot(1)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activePhotoSlot === 1
                    ? 'bg-[#FF6105] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Foto 1: Fachada
              </button>
              <button
                onClick={() => setActivePhotoSlot(2)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activePhotoSlot === 2
                    ? 'bg-[#FF6105] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Foto 2: Gemelo BIM
              </button>
            </div>
          </div>

          {/* Active Image Display */}
          <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 group shadow-inner">
            <img
              src={currentDisplayedPhoto}
              alt="Proyecto Inmobiliario RH-RWA"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />

            {/* Top Badges */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono-code font-bold text-[#FF6105] border border-[#FF6105]/40">
                {activePhotoSlot === 1 ? 'Foto 1 · Perspectiva Exterior' : 'Foto 2 · Estructura & Gemelo BIM'}
              </span>
              <button
                onClick={() => {
                  setTargetSlotToEdit(activePhotoSlot);
                  setIsPhotoModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono-code text-white hover:text-[#FF6105] border border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Cambiar Foto {activePhotoSlot}</span>
              </button>
            </div>

            {/* Bottom info on image */}
            <div className="absolute bottom-3 inset-x-3 bg-black/90 backdrop-blur-md p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-heading font-bold text-white uppercase block">
                    Torre Residencial RH-RWA · 10 Pisos · 1.000 m²
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono-code">
                    Valuación Obra: $1.000.000 USD · Ticket Mínimo Tradicional: $10.000 USD
                  </span>
                </div>
                <span className="text-xs font-mono-code text-[#FF6105] font-bold">
                  $1.000 USD / m²
                </span>
              </div>
            </div>
          </div>

          {/* Photo Gallery Thumbnails */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setActivePhotoSlot(1)}
              className={`p-2 rounded-xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                activePhotoSlot === 1
                  ? 'bg-neutral-900 border-[#FF6105]'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <img
                src={photo1}
                alt="Foto 1"
                className="w-10 h-10 rounded-lg object-cover border border-neutral-800 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[11px] font-bold text-white block truncate">
                  Foto 1 · Fachada
                </span>
                <span className="text-[9px] text-neutral-400 font-mono-code block">
                  Perspectiva Exterior
                </span>
              </div>
            </button>

            <button
              onClick={() => setActivePhotoSlot(2)}
              className={`p-2 rounded-xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                activePhotoSlot === 2
                  ? 'bg-neutral-900 border-[#FF6105]'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <img
                src={photo2}
                alt="Foto 2"
                className="w-10 h-10 rounded-lg object-cover border border-neutral-800 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[11px] font-bold text-white block truncate">
                  Foto 2 · Gemelo BIM
                </span>
                <span className="text-[9px] text-neutral-400 font-mono-code block">
                  Modelado Estructural
                </span>
              </div>
            </button>
          </div>

          {/* Theoretical & Legal Grounding */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono-code">
            <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
              <Scale className="w-3.5 h-3.5 text-[#FF6105]" />
              <span>Fundamento Matemático del Cuello de Botella:</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-body">
              En el modelo bancario y registral clásico, la cuota indivisa no puede fraccionarse eficientemente. Los aportes inferiores a $10.000 USD son rechazados administrativamente, imposibilitando canalizar el ahorro del 90% de la ciudadanía presente en este auditorio.
            </p>
          </div>
        </div>

        {/* Right Column: Real-time Mathematical Diagnosis (No hallucinations) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Metric Card 1: Traditional Capital vs Real Goal */}
          <div className="bg-[#0A0A0A] rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono-code uppercase tracking-wider text-neutral-400">
                  Capital Calificado Tradicional Captado
                </span>
                <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono-code text-xs">
                  Filtro Estricto: &ge; $10.000 USD
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-mono-code font-black text-white">
                  ${traditionalCaptured.toLocaleString()}
                </span>
                <span className="text-sm sm:text-base font-mono-code text-neutral-400">
                  / ${targetCapital.toLocaleString()} USD
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-900 rounded-full h-3 mb-2 overflow-hidden border border-neutral-800">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, collectedPercent)}%` }}
                />
              </div>

              <div className="text-xs sm:text-sm text-neutral-400 font-mono-code flex justify-between">
                <span>Alcance Real: {collectedPercent}% de la meta</span>
                <span className="text-red-400 font-bold">
                  Déficit Inmobiliario: ${deficit.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Blocked / Idle Capital Indicator */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 block mb-0.5">
                  Ahorro Bloqueado Rechazado por la Vía Tradicional:
                </span>
                <span className="text-2xl sm:text-3xl font-mono-code font-black text-[#FF6105]">
                  ${excludedBlocked.toLocaleString()} USD
                </span>
                <span className="text-xs text-neutral-400 block font-mono-code mt-0.5">
                  Capital intencionado por los {excluded} asistentes excluidos
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 block mb-0.5">
                  Total Intención Sala
                </span>
                <span className="text-xl sm:text-2xl font-mono-code font-bold text-white">
                  ${totalOffered.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono-code">
              Fórmula de Exclusión: <strong className="text-neutral-300">Capital Captado = &sum;(Aportes &ge; $10.000) &nbsp;|&nbsp; Ahorro Bloqueado = &sum;(Aportes &lt; $10.000)</strong>
            </div>
          </div>

          {/* Metric Card 2: Exclusion Rate in Room */}
          <div className="bg-[#0A0A0A] rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono-code uppercase tracking-wider text-neutral-400">
                  Tasa de Exclusión en la Sala
                </span>
                <span className="px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 font-mono-code text-xs font-bold">
                  {exclusionRate}% Excluidos
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-mono-code font-black text-[#FF6105]">
                  {excluded}{' '}
                  <span className="text-xl sm:text-2xl text-neutral-400 font-normal">de {respondents} participantes</span>
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed mb-4 font-body">
                {respondents > 0
                  ? `${excluded} personas en este auditorio tienen intención genuina de invertir en la torre, pero quedan formalmente rechazadas por la indivisión jurídica tradicional.`
                  : 'Esperando respuestas en tiempo real de los asistentes en el auditorio a través del Formulario 1.'}
              </p>

              {/* Distribution tiers */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono-code">
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-neutral-500 text-[10px]">&ge; $10k</div>
                  <div className="text-emerald-400 font-bold text-base">{qualified}</div>
                  <div className="text-[10px] text-neutral-400">Calificados</div>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-neutral-500 text-[10px]">$1k-$10k</div>
                  <div className="text-[#FF6105] font-bold text-base">{p12.distribution?.tier1k || 0}</div>
                  <div className="text-[10px] text-neutral-400">Excluidos</div>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-neutral-500 text-[10px]">$100-$1k</div>
                  <div className="text-[#FF6105] font-bold text-base">{p12.distribution?.tier100 || 0}</div>
                  <div className="text-[10px] text-neutral-400">Excluidos</div>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-neutral-500 text-[10px]">&lt; $100</div>
                  <div className="text-[#FF6105] font-bold text-base">{p12.distribution?.tier1 || 0}</div>
                  <div className="text-[10px] text-neutral-400">Excluidos</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-mono-code">
                Solución: Tokenización RWA (Fase 3)
              </span>
              {onGoToPhase3 && (
                <button
                  onClick={onGoToPhase3}
                  className="px-4 py-2 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Avanzar a Fase 3</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal to upload or change project photo */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A0A0A] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-800 text-white">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold font-heading uppercase text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FF6105]" />
                Fotografía del Proyecto · Foto {targetSlotToEdit}
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
              {/* Slot selector */}
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
                  Editar Foto 1 (Fachada)
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
                  Editar Foto 2 (Gemelo BIM)
                </button>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-2">
                  Opción 1: Subir imagen desde tu equipo
                </label>
                <label className="w-full py-3.5 px-4 rounded-xl border border-dashed border-neutral-700 hover:border-[#FF6105] bg-neutral-950 flex items-center justify-center gap-2 cursor-pointer text-neutral-300 hover:text-[#FF6105] transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar archivo JPG / PNG...</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <label className="block text-neutral-300 font-bold uppercase mb-2">
                  Opción 2: Pegar enlace URL de fotografía
                </label>
                <form onSubmit={handleSavePhoto} className="space-y-3">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
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
                      disabled={!photoInput.trim()}
                      className="py-2 px-4 rounded-xl bg-[#FF6105] hover:bg-[#ff7524] text-black font-bold uppercase disabled:opacity-40"
                    >
                      Guardar Foto {targetSlotToEdit}
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
