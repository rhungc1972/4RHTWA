import React, { useState } from 'react';
import { AppStateData } from '../types';
import {
  Star,
  Users,
  Copy,
  Check,
  ThumbsUp,
  MessageSquare,
  ArrowRight,
  Download,
  Camera,
  Upload,
  RotateCcw,
  AlertTriangle,
  Scale,
  Sparkles,
  Layers,
  Building2,
  PieChart as PieIcon,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { ContemporaryDonutChart, DonutSegment } from './ContemporaryDonutChart';
import { generateAndDownloadDossierPDF } from '../utils/pdfGenerator';
import { resetDatabase, getLocalRawState } from '../services/api';

interface Phase5Props {
  state: AppStateData;
  onGoToPhase1?: () => void;
}

const DEFAULT_PHOTO_1 = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_PHOTO_2 = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80';

export const Phase5SurveyDashboard: React.FC<Phase5Props> = ({ state, onGoToPhase1 }) => {
  const survey = state.survey;
  const p12 = state.phase1_2;
  const p34 = state.phase3_4;

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Two Project Photographs (persisted in localStorage across all phases and dossier)
  const [projectPhoto1, setProjectPhoto1] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('rwa_project_photo_url_1') ||
        localStorage.getItem('rwa_project_photo_url') ||
        DEFAULT_PHOTO_1
      );
    } catch {
      return DEFAULT_PHOTO_1;
    }
  });

  const [projectPhoto2, setProjectPhoto2] = useState<string>(() => {
    try {
      return localStorage.getItem('rwa_project_photo_url_2') || DEFAULT_PHOTO_2;
    } catch {
      return DEFAULT_PHOTO_2;
    }
  });

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [targetPhotoSlot, setTargetPhotoSlot] = useState<1 | 2>(1);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  // Combine surveys from state and local raw state for live completeness
  const allSurveys = (() => {
    const raw = getLocalRawState().surveys || [];
    const fromState = survey.recentFeedback || [];
    const map = new Map<string, any>();
    raw.forEach((s) => map.set(s.id, s));
    fromState.forEach((s) => map.set(s.id, s));
    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  })();

  const totalSurveyed = survey.totalResponses || allSurveys.length || 0;
  const totalAudience = Math.max(p12.respondentsCount || 0, p34.coOwnersCount || 0, totalSurveyed, 0);

  // Math for Scenario 1: Tradicional
  const f1Count = p12.respondentsCount || 0;
  const qualified = p12.qualifiedCount || 0;
  const excluded = p12.excludedCount || 0;
  const excRate = f1Count > 0 ? p12.exclusionRate : 0;
  const traditionalCaptured = p12.traditionalCapitalCaptured ?? (qualified > 0 ? p12.totalCollected : 0);
  const excludedBlocked = p12.excludedCapitalBlocked ?? 0;
  const deficit = p12.traditionalDeficit ?? Math.max(0, 1000000 - traditionalCaptured);

  // 1. CIRCULAR CHART: TRADITIONAL SCENARIO
  const traditionalDonutData: DonutSegment[] = f1Count > 0
    ? [
        {
          label: `Excluidos (<$10k): ${excluded} pers.`,
          value: excluded,
          color: '#FF6105',
        },
        {
          label: `Calificados (≥$10k): ${qualified} pers.`,
          value: qualified,
          color: '#10B981',
        },
      ]
    : [
        {
          label: 'Sin registros de capital aún',
          value: 1,
          color: '#262626',
        },
      ];

  // 2. CIRCULAR CHART: TOKENIZED RWA SCENARIO (100% Inclusion & Funding)
  const tokensSubscribed = p34.tokensSubscribed || 0;
  const remainingTokens = Math.max(0, 100000 - tokensSubscribed);
  const tokenizedDonutData: DonutSegment[] = tokensSubscribed > 0
    ? [
        {
          label: `Tokens Suscritos (${tokensSubscribed.toLocaleString()} tk)`,
          value: tokensSubscribed,
          color: '#10B981',
        },
        {
          label: `Restante por Emitir (${remainingTokens.toLocaleString()} tk)`,
          value: remainingTokens,
          color: '#262626',
        },
      ]
    : [
        {
          label: '100.000 Tokens Disponibles ($10 c/u)',
          value: 100000,
          color: '#262626',
        },
      ];

  // 3. CIRCULAR CHART: NPS SATISFACTION BREAKDOWN
  const npsDonutData: DonutSegment[] = totalSurveyed > 0
    ? [
        {
          label: `Promotores (9-10): ${survey.promoters}`,
          value: survey.promoters,
          color: '#10B981',
        },
        {
          label: `Pasivos (7-8): ${survey.passives}`,
          value: survey.passives,
          color: '#94A3B8',
        },
        {
          label: `Detractores (1-6): ${survey.detractors}`,
          value: survey.detractors,
          color: '#EF4444',
        },
      ]
    : [
        {
          label: 'En espera de evaluaciones...',
          value: 1,
          color: '#262626',
        },
      ];

  // 4. CIRCULAR CHART: TOPICS OF INTEREST
  const topicColors = ['#FF6105', '#10B981', '#6366F1', '#3B82F6', '#8B5CF6'];
  const topicDonutData: DonutSegment[] = (survey.topicsRanking && survey.topicsRanking.length > 0
    ? survey.topicsRanking
    : []
  ).map((t, idx) => ({
    label: `${t.topic} (${t.count} votos)`,
    value: t.count,
    color: topicColors[idx % topicColors.length],
  }));

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateAndDownloadDossierPDF({
        attendeeName: 'Conferencia Magistral Roberto Hung',
        attendeeEmail: 'rhungc@gmail.com',
        tokensSubscribed: p34.tokensSubscribed,
        usdAmount: p34.usdSubscribed,
        m2Acquired: p34.m2Absorbed,
        appState: state,
        projectPhoto1,
        projectPhoto2,
        ratings: {
          quality: survey.avgQuality,
          clarity: survey.avgClarity,
          nps: survey.avgNps,
        },
      });
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyMetrics = () => {
    const text = `Resultados Oficiales - Conferencia Roberto Hung:
- Total Asistentes Computados: ${totalAudience}
- Exclusión en Modelo Tradicional: ${f1Count > 0 ? `${excRate}% (${excluded} excluidos)` : 'Sin datos'}
- Copropietarios Tokenizados RWA: ${p34.coOwnersCount} (0% exclusión)
- Capital RWA Levantado: $${p34.usdSubscribed.toLocaleString()} USD
- Calidad de Ponencia: ${survey.avgQuality}/5
- Claridad Conceptual: ${survey.avgClarity}/5
- Índice NPS: ${survey.npsScoreIndex > 0 ? '+' : ''}${survey.npsScoreIndex}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleSavePhotoModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;
    const url = photoUrlInput.trim();
    if (targetPhotoSlot === 1) {
      setProjectPhoto1(url);
      try {
        localStorage.setItem('rwa_project_photo_url_1', url);
        localStorage.setItem('rwa_project_photo_url', url);
      } catch {}
    } else {
      setProjectPhoto2(url);
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
        if (targetPhotoSlot === 1) {
          setProjectPhoto1(base64);
          try {
            localStorage.setItem('rwa_project_photo_url_1', base64);
            localStorage.setItem('rwa_project_photo_url', base64);
          } catch {}
        } else {
          setProjectPhoto2(base64);
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
    <div className="w-full flex-1 flex flex-col justify-between max-w-7xl mx-auto pb-8 text-white space-y-8 select-none">
      {/* Slide Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono-code uppercase tracking-wider bg-neutral-900 text-[#FF6105] border border-neutral-800">
            Fase 5 de 5 · Evaluación, Gráficos Circulares & Dossier Final
          </span>
          <span className="text-xs text-neutral-500 font-mono-code">
            #ElDerechoDeHacerRuido · Roberto Hung Cavalieri
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold uppercase tracking-tight text-white leading-tight">
              Dashboard Analítico: <span className="text-[#FF6105]">Fotografías, Métricas & Percepción</span>
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-3xl leading-relaxed font-body">
              Consolidación empírica en tiempo real con los datos aportados por los asistentes: registro fotográfico del inmueble, gráficos circulares de ambos escenarios y satisfacción en sala.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCopyMetrics}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono-code text-neutral-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSummary ? '¡Copiado!' : 'Copiar Métricas'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-5 py-2.5 rounded-xl bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,97,5,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isGeneratingPdf ? 'Generando Dossier...' : 'Descargar Dossier Oficial PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIMERA PARTE: DISPUESTA PARA PONER 2 IMÁGENES (REQUERIMIENTO EXACTO) */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6105]/15 border border-[#FF6105]/30 flex items-center justify-center text-[#FF6105]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold uppercase tracking-tight text-white">
                1. Registro Visual del Activo Inmobiliario: 2 Fotografías Oficiales
              </h3>
              <p className="text-xs text-neutral-400 font-mono-code">
                Torre Residencial RH-RWA · Valuación Total: $1.000.000 USD · 10 Pisos · 1.000 m²
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTargetPhotoSlot(1);
                setIsPhotoModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono-code text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF6105]" />
              <span>Editar Foto 1</span>
            </button>
            <button
              onClick={() => {
                setTargetPhotoSlot(2);
                setIsPhotoModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono-code text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF6105]" />
              <span>Editar Foto 2</span>
            </button>
          </div>
        </div>

        {/* The Two Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photograph 1: Fachada Principal */}
          <div className="space-y-2.5">
            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 group shadow-lg">
              <img
                src={projectPhoto1}
                alt="Fotografía 1 - Perspectiva Torre Residencial RH-RWA"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/15" />

              <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono-code font-bold text-[#FF6105] border border-[#FF6105]/40">
                  FOTOGRAFÍA 01 · PERSPECTIVA EXTERIOR
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono-code text-white border border-neutral-700">
                  10 Pisos · 1.000 m²
                </span>
              </div>

              <div className="absolute bottom-3 inset-x-3 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-neutral-800">
                <span className="text-xs font-heading font-bold text-white uppercase block">
                  Perspectiva & Fachada Principal de la Torre
                </span>
                <span className="text-[10px] text-neutral-400 font-mono-code">
                  Terreno Urbano Titulado · Alícuota Base: 0,01 m² por token
                </span>
              </div>
            </div>
          </div>

          {/* Photograph 2: Gemelo BIM */}
          <div className="space-y-2.5">
            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 group shadow-lg">
              <img
                src={projectPhoto2}
                alt="Fotografía 2 - Modelado Arquitectónico BIM"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/15" />

              <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono-code font-bold text-emerald-400 border border-emerald-500/40">
                  FOTOGRAFÍA 02 · MODELADO DIGITAL BIM
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono-code text-white border border-neutral-700">
                  100.000 Tokens RWA
                </span>
              </div>

              <div className="absolute bottom-3 inset-x-3 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-neutral-800">
                <span className="text-xs font-heading font-bold text-white uppercase block">
                  Gemelo Digital & Estructura Molecular Tokenizada
                </span>
                <span className="text-[10px] text-neutral-400 font-mono-code">
                  Emisión Fungible ERC-20 / Smart Contract con Derecho Económico
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INFORMACIÓN DE LA PÁGINA ANTERIOR EN GRÁFICOS CIRCULARES VISIBLES       */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold uppercase tracking-tight text-white">
                2. Comparativa de Modelos en Gráficos Circulares Visibles
              </h3>
              <p className="text-xs text-neutral-400 font-mono-code">
                Contraste empírico directo entre la exclusión tradicional y la democratización del protocolo RWA
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-code text-neutral-400 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800">
            {totalAudience} asistentes computados
          </span>
        </div>

        {/* Side-by-Side Circular Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Escenario 1: Tradicional */}
          <div className="bg-neutral-950/80 rounded-2xl p-5 border border-red-900/40 shadow-lg flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h4 className="text-sm font-heading font-bold uppercase text-white tracking-wide">
                  Escenario Tradicional (Inversión Cerrada)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 font-mono-code text-[11px] font-bold">
                Ticket: &ge; $10.000 USD
              </span>
            </div>

            <ContemporaryDonutChart
              title="Exclusión vs Calificación"
              subtitle="Tasa de participantes admitidos vs excluidos por la barrera del ticket mínimo"
              data={traditionalDonutData}
              centerLabel="Exclusión"
              centerValue={f1Count > 0 ? `${excRate}%` : '0%'}
              size={210}
              strokeWidth={28}
              unit="asistentes"
            />

            {/* Clear Numerical Breakdown under chart */}
            <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-2 font-mono-code text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Personas Participantes:</span>
                <span className="font-extrabold text-white text-base">{f1Count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400">Excluidos de Participar:</span>
                <span className="font-extrabold text-red-400 text-base">{excluded} personas ({excRate}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Capital Calificado Captado:</span>
                <span className="font-extrabold text-emerald-400 text-base">${traditionalCaptured.toLocaleString()} USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400">Ahorro Bloqueado Rechazado:</span>
                <span className="font-extrabold text-red-400 text-base">${excludedBlocked.toLocaleString()} USD</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800">
                <span className="text-neutral-300 font-bold">Déficit de Financiación Obra:</span>
                <span className="font-black text-red-500 text-lg sm:text-xl">${deficit.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* Escenario 2: Tokenizado RWA */}
          <div className="bg-neutral-950/80 rounded-2xl p-5 border border-[#FF6105]/40 shadow-lg flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-heading font-bold uppercase text-white tracking-wide">
                  Escenario Tokenizado RWA (Democrático)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono-code text-[11px] font-bold">
                Ticket: Desde $10 USD
              </span>
            </div>

            <ContemporaryDonutChart
              title="Emisión & Absorción de Tokens"
              subtitle="Distribución proporcional de los 100.000 tokens en copropiedad fraccionada"
              data={tokenizedDonutData}
              centerLabel="Financiación"
              centerValue={`${p34.fundingPercent}%`}
              size={210}
              strokeWidth={28}
              unit="tokens"
            />

            {/* Clear Numerical Breakdown under chart */}
            <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-2 font-mono-code text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Copropietarios con Alícuota:</span>
                <span className="font-extrabold text-emerald-400 text-base">{p34.coOwnersCount} personas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400">Excluidos de Participar:</span>
                <span className="font-extrabold text-emerald-400 text-base">0 personas (100% Inclusión)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Tokens Suscritos:</span>
                <span className="font-extrabold text-white text-base">{tokensSubscribed.toLocaleString()} de 100.000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Metros² Absorbidos:</span>
                <span className="font-extrabold text-white text-base">{p34.m2Absorbed} m²</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800">
                <span className="text-[#FF6105] font-bold">Capital Total RWA Levantado:</span>
                <span className="font-black text-[#FF6105] text-lg sm:text-xl">${p34.usdSubscribed.toLocaleString()} USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SATISFACCIÓN DE LA ACTIVIDAD & MATERIAS DE INTERÉS                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Satisfacción de la Actividad (Promedio de Calidad, Claridad & NPS) */}
        <div className="lg:col-span-6 bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#FF6105]" />
              <h3 className="text-base font-heading font-bold uppercase tracking-tight text-white">
                3. Satisfacción de la Actividad & Evaluación
              </h3>
            </div>
            <span className="text-xs font-mono-code text-neutral-400">
              {totalSurveyed} evaluaciones
            </span>
          </div>

          {/* KPI Rating Bars with Big Typography */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-center">
              <span className="text-[11px] uppercase font-mono-code text-neutral-400 block mb-1">
                Calidad Ponencia
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono-code text-white">
                {survey.avgQuality > 0 ? `${survey.avgQuality}` : '5.0'}
              </span>
              <span className="text-xs text-[#FF6105] font-mono-code block mt-1 font-semibold">
                ★ sobre 5.0
              </span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-center">
              <span className="text-[11px] uppercase font-mono-code text-neutral-400 block mb-1">
                Claridad Conceptual
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono-code text-white">
                {survey.avgClarity > 0 ? `${survey.avgClarity}` : '5.0'}
              </span>
              <span className="text-xs text-emerald-400 font-mono-code block mt-1 font-semibold">
                ★ sobre 5.0
              </span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-center">
              <span className="text-[11px] uppercase font-mono-code text-neutral-400 block mb-1">
                Índice NPS Sala
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono-code text-[#FF6105]">
                {survey.npsScoreIndex > 0 ? `+${survey.npsScoreIndex}` : `${survey.npsScoreIndex}`}
              </span>
              <span className="text-xs text-neutral-400 font-mono-code block mt-1">
                de -100 a +100
              </span>
            </div>
          </div>

          {/* NPS Donut Chart */}
          <ContemporaryDonutChart
            title="Distribución de Percepción NPS"
            subtitle="Desglose entre Promotores (9-10), Pasivos (7-8) y Detractores (1-6)"
            data={npsDonutData}
            centerLabel="Índice NPS"
            centerValue={survey.npsScoreIndex > 0 ? `+${survey.npsScoreIndex}` : `${survey.npsScoreIndex}`}
            size={190}
            strokeWidth={26}
            unit="votos"
          />
        </div>

        {/* Right Column: Materias de Interés Doctrinal Votadas */}
        <div className="lg:col-span-6 bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FF6105]" />
              <h3 className="text-base font-heading font-bold uppercase tracking-tight text-white">
                4. Materias de Interés Doctrinal Seleccionadas
              </h3>
            </div>
            <span className="text-xs font-mono-code text-neutral-400">
              Votación de los asistentes
            </span>
          </div>

          <ContemporaryDonutChart
            title="Distribución de Interés Temático"
            subtitle="Áreas con demanda real de profundización técnica, jurídica y financiera"
            data={topicDonutData}
            centerLabel="Votos Totales"
            centerValue={topicDonutData.reduce((a, b) => a + b.value, 0)}
            size={190}
            strokeWidth={26}
            unit="votos"
          />

          {/* Ranked List of Topics */}
          <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2 text-xs font-mono-code">
            {survey.topicsRanking && survey.topicsRanking.length > 0 ? (
              survey.topicsRanking.map((t, idx) => (
                <div
                  key={t.topic}
                  className="flex items-center justify-between pb-1 border-b border-neutral-900 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-5 h-5 rounded-md bg-neutral-900 text-neutral-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-neutral-300 truncate text-[11px]">{t.topic}</span>
                  </div>
                  <span className="font-bold text-[#FF6105] shrink-0">{t.count} votos</span>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-2">
                Esperando votación de temas desde los teléfonos móviles...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RESPUESTAS Y COMENTARIOS EFECTIVAMENTE MARCADOS POR LOS ASISTENTES       */}
      {/* (SOBRE LOS COMENTARIOS SI LA PERSONA NO LOS HACE, SOLO SE PUBLICA LO QUE     */}
      {/* EFECTIVAMENTE MARCÓ - CERO ALUCINACIONES NI TEXTOS FICTICIOS)             */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6105]/15 border border-[#FF6105]/30 flex items-center justify-center text-[#FF6105]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold uppercase tracking-tight text-white">
                5. Respuestas de los Participantes & Comentarios Efectivos
              </h3>
              <p className="text-xs text-neutral-400 font-mono-code">
                Publicación estricta de lo que efectivamente marcó cada persona (sin alucinaciones ni textos agregados)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-code px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300">
            {allSurveys.length} respuestas registradas
          </span>
        </div>

        {allSurveys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[38rem] overflow-y-auto pr-1">
            {allSurveys.map((entry) => {
              const hasTextComment = Boolean(entry.comments && entry.comments.trim().length > 0);
              const topics = Array.isArray(entry.selectedTopics) ? entry.selectedTopics : [];

              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3 shadow-md"
                >
                  {/* Participant Header & Ratings */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-heading font-bold text-white truncate max-w-[170px]">
                        {entry.name || 'Asistente en Sala'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono-code">
                        <span className="text-[#FF6105] flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-[#FF6105]" />
                          <span>{entry.ratingQuality || 5}/5</span>
                        </span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-emerald-400 font-semibold">NPS {entry.npsScore}/10</span>
                      </div>
                    </div>

                    {/* What they actually marked: Selected topics */}
                    {topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {topics.map((top: string) => (
                          <span
                            key={top}
                            className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 font-mono-code truncate max-w-full"
                          >
                            ✓ {top}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* If they wrote a comment: display it. If NOT: show exact indication without fake text */}
                    {hasTextComment ? (
                      <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 leading-relaxed italic font-body">
                        “{entry.comments.trim()}”
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono-code text-neutral-500 italic bg-neutral-900/30 p-2 rounded-lg border border-neutral-900">
                        (Sin comentarios adicionales de texto · Registro completo de valoración)
                      </div>
                    )}
                  </div>

                  {/* Timestamp footer */}
                  <div className="pt-2 border-t border-neutral-900 text-[9px] font-mono-code text-neutral-500 text-right">
                    {new Date(entry.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-950 rounded-2xl border border-neutral-800/60">
            <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-heading text-neutral-400 uppercase">
              Esperando envío de encuestas desde los dispositivos en sala...
            </p>
            <p className="text-xs text-neutral-500 mt-1 font-mono-code">
              A medida que los asistentes envíen su valoración se desplegarán aquí exactamente sus respuestas marcadas.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. MENSAJE FORMAL DE CLAUSURA & ACCIONES DE SESIÓN                         */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-[#FF6105]/40 space-y-4 shadow-xl">
        <div className="text-center space-y-1">
          <p className="text-base sm:text-xl font-heading font-bold text-white tracking-wide">
            “Agradecemos profundamente su activa participación en esta sesión de inmersión en la economía tokenizada.”
          </p>
          <p className="text-xs text-neutral-400 font-mono-code">
            Roberto Hung Cavalieri · #ElDerechoDeHacerRuido · www.robertohung.com
          </p>
        </div>

        {/* Buttons: Download Dossier & Reset */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-neutral-900">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="px-6 py-3 rounded-xl bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Dossier Oficial Completo (PDF)</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-300 font-mono-code text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Conferencia / Nueva Sesión</span>
          </button>
        </div>
      </div>

      {/* Modal Confirm Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A0A0A] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-900/60 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                  ¿Reiniciar Conferencia?
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono-code">
                  Nueva Sesión Limpia a Cero
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-body">
              Se restablecerán a cero todos los contadores de participantes, capital, tokens y encuestas. El proyector volverá a la <strong>Fase 1 (Home)</strong>.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-300 text-xs font-mono-code cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsResetting(true);
                  try {
                    await resetDatabase();
                    if (onGoToPhase1) onGoToPhase1();
                  } catch (e) {
                    console.error('Error resetting database:', e);
                  } finally {
                    setIsResetting(false);
                    setIsResetConfirmOpen(false);
                  }
                }}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono-code uppercase cursor-pointer disabled:opacity-50"
              >
                {isResetting ? 'Reiniciando...' : 'Sí, Reiniciar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to update project photographs */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A0A0A] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-800 text-white">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold font-heading uppercase text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FF6105]" />
                Actualizar Fotografía {targetPhotoSlot}
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
              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-2">
                  Opción 1: Subir imagen desde tu dispositivo
                </label>
                <label className="w-full py-3 px-4 rounded-xl border border-dashed border-neutral-700 hover:border-[#FF6105] bg-neutral-950 flex items-center justify-center gap-2 cursor-pointer text-neutral-300 hover:text-[#FF6105] transition-all">
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
