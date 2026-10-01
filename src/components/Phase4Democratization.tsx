import React from 'react';
import { AppStateData } from '../types';
import {
  Vote,
  Coins,
  Repeat,
  ShieldCheck,
  Users2,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface Phase4Props {
  state: AppStateData;
  onGoToPhase5?: () => void;
}

export const Phase4Democratization: React.FC<Phase4Props> = ({ state, onGoToPhase5 }) => {
  const p12 = state.phase1_2;
  const p34 = state.phase3_4;

  const respondents = p12.respondentsCount;
  const qualified = p12.qualifiedCount;
  const excluded = p12.excludedCount;
  const exclusionRate = p12.exclusionRate;

  const traditionalCaptured = p12.traditionalCapitalCaptured ?? (qualified > 0 ? p12.totalCollected : 0);
  const excludedBlocked = p12.excludedCapitalBlocked ?? 0;
  const deficit = p12.traditionalDeficit ?? Math.max(0, 1000000 - traditionalCaptured);

  const pillars = [
    {
      id: 1,
      num: '01',
      title: 'Gobernanza On-Chain',
      icon: Vote,
      summary: 'Voto proporcional directo para elegir administración, presupuestos y mejoras edilicias.',
      legalBasis: 'Democracia accionaria digital sin asambleas presenciales conflictivas.',
    },
    {
      id: 2,
      num: '02',
      title: 'Rentas Automáticas',
      icon: Coins,
      summary: 'Dispersión directa a la wallet en stablecoins (USDC/USDT) según la alícuota en tokens.',
      legalBasis: 'Ejecución contractual auto-liquidable al segundo sin retenciones bancarias.',
    },
    {
      id: 3,
      num: '03',
      title: 'Liquidez Inmediata (24/7)',
      icon: Repeat,
      summary: 'Mercado secundario de tokens continuo sin necesidad de vender el inmueble completo.',
      legalBasis: 'Circulación desintermediada de alícuotas patrimoniales registradas.',
    },
    {
      id: 4,
      num: '04',
      title: 'Colateral & Financiación',
      icon: ShieldCheck,
      summary: 'Uso de tokens inmobiliarios como garantía líquida para préstamos DeFi o bancarios.',
      legalBasis: 'Pignoración digital de títulos de copropiedad manteniendo el cobro de rentas.',
    },
    {
      id: 5,
      num: '05',
      title: 'Tránsito Negocial Transparente',
      icon: Users2,
      summary: 'Transmisión verificable, eficaz, económica y con reducción radical de aranceles.',
      legalBasis: 'Inmutabilidad registral en blockchain y blindaje jurídico notarial.',
    },
    {
      id: 6,
      num: '06',
      title: 'Despertar del Capital Muerto',
      icon: BookOpen,
      summary: 'Doctrina Hernando de Soto: transformar bienes estáticos en palancas de riqueza global.',
      legalBasis: 'Democratización real del ahorro popular para la copropiedad productiva.',
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between max-w-7xl mx-auto pb-6 text-white space-y-8 select-none">
      {/* Slide Header with High-Impact Auditorium Typography */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono-code uppercase tracking-wider bg-neutral-900 text-[#FF6105] border border-neutral-800">
            Fase 4 de 5 · Estudio Comparativo & Pilares Doctrinales
          </span>
          <span className="text-xs text-neutral-500 font-mono-code">
            #ElDerechoDeHacerRuido · Roberto Hung Cavalieri
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold uppercase tracking-tight text-white leading-tight">
          Comparativa: <span className="text-red-500">Tradicional</span> vs <span className="text-[#FF6105]">Tokenizado RWA</span>
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-4xl leading-relaxed font-body">
          Contraste empírico entre el esquema tradicional bancario-notarial y el protocolo de tokenización fraccionada con base en los datos reales del auditorio.
        </p>
      </div>

      {/* TOP COMPARISON: Side-by-Side (Traditional on Left, Tokenized RWA on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: PLANTEAMIENTO TRADICIONAL                                   */}
        {/* ========================================================================= */}
        <div className="bg-[#0A0A0A] rounded-3xl p-6 sm:p-8 border-2 border-red-900/60 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-red-600" />

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
                  Modelo Tradicional (Cerrado)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-400 font-mono-code text-xs font-bold shrink-0">
                Ticket: &ge; $10.000 USD
              </span>
            </div>

            {/* Highlighted Numbers: Participants & Excluded */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <span className="text-xs uppercase font-mono-code text-neutral-400 block mb-1">
                  Personas Participantes
                </span>
                <span className="text-5xl sm:text-6xl font-black font-mono-code text-white">
                  {respondents}
                </span>
                <span className="text-xs text-neutral-400 block font-mono-code mt-1">
                  registradas en la sala
                </span>
              </div>

              <div className="p-4 bg-red-950/30 rounded-2xl border border-red-900/60">
                <span className="text-xs uppercase font-mono-code text-red-400 font-bold block mb-1">
                  Excluidos de Participar
                </span>
                <span className="text-5xl sm:text-6xl font-black font-mono-code text-red-400">
                  {excluded}
                </span>
                <span className="text-xs text-red-300 font-mono-code mt-1 block">
                  {exclusionRate}% de la sala fuera
                </span>
              </div>
            </div>

            {/* Amounts by Sector / Tiers */}
            <div className="space-y-2">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 block">
                Montos por Sector / Estrato de Capital:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">&ge; $10k (Calificados)</span>
                  <span className="text-emerald-400 font-bold">{p12.distribution?.tier10k || 0} pers.</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">$1k - $10k (Excluidos)</span>
                  <span className="text-red-400 font-bold">{p12.distribution?.tier1k || 0} pers.</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">$100 - $1k (Excluidos)</span>
                  <span className="text-red-400 font-bold">{p12.distribution?.tier100 || 0} pers.</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">&lt; $100 (Excluidos)</span>
                  <span className="text-red-400 font-bold">{p12.distribution?.tier1 || 0} pers.</span>
                </div>
              </div>
            </div>

            {/* Total Amounts */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5 font-mono-code text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Capital Calificado Captado:</span>
                <span className="font-bold text-white text-base">${traditionalCaptured.toLocaleString()} USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400">Ahorro Bloqueado Rechazado:</span>
                <span className="font-bold text-red-400 text-base">${excludedBlocked.toLocaleString()} USD</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-300 font-bold">Déficit de Financiación Obra:</span>
                <span className="font-black text-red-500 text-2xl">${deficit.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono-code text-neutral-400 pt-3 border-t border-neutral-900">
            Diagnóstico: <span className="text-neutral-200">Parálisis de obra por déficit y rechazo del ahorro ciudadano.</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PLANTEAMIENTO TOKENIZADO RWA                                */}
        {/* ========================================================================= */}
        <div className="bg-[#0A0A0A] rounded-3xl p-6 sm:p-8 border-2 border-[#FF6105]/70 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#FF6105]" />

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
                  Modelo Tokenizado RWA (Abierto)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono-code text-xs font-bold shrink-0">
                Ticket: Desde $10 USD
              </span>
            </div>

            {/* Highlighted Numbers: Participants & 0% Excluded */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <span className="text-xs uppercase font-mono-code text-neutral-400 block mb-1">
                  Copropietarios con Alícuota
                </span>
                <span className="text-5xl sm:text-6xl font-black font-mono-code text-emerald-400">
                  {p34.coOwnersCount}
                </span>
                <span className="text-xs text-neutral-400 block font-mono-code mt-1">
                  participantes con voto y renta
                </span>
              </div>

              <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-900/60">
                <span className="text-xs uppercase font-mono-code text-emerald-400 font-bold block mb-1">
                  Excluidos de Participar
                </span>
                <span className="text-5xl sm:text-6xl font-black font-mono-code text-emerald-400">
                  0
                </span>
                <span className="text-xs text-emerald-300 font-mono-code mt-1 block">
                  100% Inclusión de Capital
                </span>
              </div>
            </div>

            {/* Amounts by Sector / Tiers */}
            <div className="space-y-2">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 block">
                Montos por Sector / Estrato (Democratización Real):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">&ge; $10k</span>
                  <span className="text-white font-bold">Paquetes Institucionales</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">$1k - $10k</span>
                  <span className="text-[#FF6105] font-bold">1 a 10 m² Habitable</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">$100 - $1k</span>
                  <span className="text-[#FF6105] font-bold">0,10 a 1 m²</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">&lt; $100</span>
                  <span className="text-emerald-400 font-bold">Desde $10 USD (1 token)</span>
                </div>
              </div>
            </div>

            {/* Total Amounts */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5 font-mono-code text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Capital RWA Levantado:</span>
                <span className="font-bold text-[#FF6105] text-lg">${p34.usdSubscribed.toLocaleString()} USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Metros² Absorbidos:</span>
                <span className="font-bold text-white text-base">{p34.m2Absorbed} m² suscritos</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-300 font-bold">Avance de Financiación Torre:</span>
                <span className="font-extrabold text-emerald-400 text-xl">{p34.fundingPercent}% Completado</span>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono-code text-neutral-400 pt-3 border-t border-neutral-900">
            Resultado: <span className="text-white font-bold">Cierre financiero acelerado, cero intermediarios y titularidad democrática.</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: LOS 6 PILARES DOCTRINALES A LO ANCHO                     */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <span className="text-xs font-mono-code uppercase tracking-wider text-[#FF6105] font-bold block mb-1">
              FUNDAMENTOS DE LA ECONOMÍA TOKENIZADA
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white uppercase tracking-tight">
              Los 6 Pilares Doctrinales de la Tokenización RWA
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono-code">
            Roberto Hung Cavalieri · #ElDerechoDeHacerRuido
          </span>
        </div>

        {/* 6 Cards deployed across the width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-[#FF6105]/60 transition-all flex flex-col justify-between space-y-3.5 shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6105]/15 border border-[#FF6105]/30 flex items-center justify-center text-[#FF6105] shrink-0 group-hover:bg-[#FF6105] group-hover:text-black transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-heading font-bold uppercase text-white tracking-wide">
                      {pillar.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono-code font-bold text-neutral-600 group-hover:text-[#FF6105]">
                    {pillar.num}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed font-body">
                  {pillar.summary}
                </p>

                <div className="pt-2.5 border-t border-neutral-900 text-[11px] font-mono-code text-[#FF6105]">
                  {pillar.legalBasis}
                </div>
              </div>
            );
          })}
        </div>

        {onGoToPhase5 && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={onGoToPhase5}
              className="px-6 py-3 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Avanzar al Dashboard Final (Fase 5)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
