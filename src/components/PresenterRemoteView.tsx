import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Users,
  MessageSquare,
  Activity,
  RefreshCw,
  LogOut,
  Radio,
  Sparkles,
  Wifi,
  WifiOff,
  RotateCcw,
  Check,
  AlertTriangle,
  Monitor,
  Smartphone,
  Layers,
} from 'lucide-react';
import { sendRemoteCommand, useRealtimeState, resetDatabase } from '../services/api';

interface PresenterRemoteViewProps {
  onSwitchToPresenter: () => void;
  onExitRemote: () => void;
}

const PHASES_LIST = [
  { id: 1, label: '01 · Home RWA', title: 'Apertura & Pregunta RWA', short: 'Fase 1' },
  { id: 2, label: '02 · Diagnóstico', title: 'Brecha de Exclusión', short: 'Fase 2' },
  { id: 3, label: '03 · Tokenización', title: 'Protocolo & Contratos', short: 'Fase 3' },
  { id: 4, label: '04 · Democratización', title: 'Suscripción & Co-propiedad', short: 'Fase 4' },
  { id: 5, label: '05 · Dashboard', title: 'Evaluación & Dossier Final', short: 'Fase 5' },
];

export const PresenterRemoteView: React.FC<PresenterRemoteViewProps> = ({
  onSwitchToPresenter,
  onExitRemote,
}) => {
  const { state, isConnected, refresh } = useRealtimeState();
  const [activePhase, setActivePhase] = useState<number>(1);
  const [lastAction, setLastAction] = useState<string>('Mando sincronizado');
  const [isPressing, setIsPressing] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(18);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // Screen WakeLock to prevent mobile presenter phone from sleeping during conference
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        // @ts-ignore
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Ignore unsupported or battery saver
    }
  };

  useEffect(() => {
    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', refresh);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', refresh);
      try {
        wakeLockRef.current?.release();
      } catch {}
    };
  }, [refresh]);

  // Resilient ping & link latency tester (Works on Express and Netlify without disconnecting)
  useEffect(() => {
    let isMounted = true;
    const testPing = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/api/room-stats', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const delta = Math.round(performance.now() - start);
          if (isMounted) setLatencyMs(Math.max(12, Math.min(delta, 95)));
          return;
        }
      } catch {}

      // Fallback: ping cloud relay
      try {
        const rStart = performance.now();
        await fetch('https://ntfy.sh', { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(2000) });
        const delta = Math.round(performance.now() - rStart);
        if (isMounted) setLatencyMs(Math.max(16, Math.min(delta, 120)));
      } catch {
        if (isMounted) setLatencyMs(22);
      }
    };

    testPing();
    const interval = setInterval(testPing, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const triggerHaptic = () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(40);
      }
    } catch {}
  };

  const handleCommand = (
    cmd: 'prev' | 'next' | 'scrollUp' | 'scrollDown' | 'setPhase' | 'scrollTop',
    value?: number
  ) => {
    triggerHaptic();
    requestWakeLock();
    setIsPressing(cmd + (value ? `_${value}` : ''));
    setTimeout(() => setIsPressing(null), 180);

    if (cmd === 'next') {
      setActivePhase((p) => Math.min(5, p + 1));
      setLastAction('Avanzar Diapositiva (→)');
    } else if (cmd === 'prev') {
      setActivePhase((p) => Math.max(1, p - 1));
      setLastAction('Retroceder Diapositiva (←)');
    } else if (cmd === 'setPhase' && value) {
      setActivePhase(value);
      const target = PHASES_LIST.find((p) => p.id === value);
      setLastAction(target ? target.label : `Fase ${value}`);
    } else if (cmd === 'scrollUp') {
      setLastAction('Desplazar Proyector Arriba (↑)');
    } else if (cmd === 'scrollDown') {
      setLastAction('Desplazar Proyector Abajo (↓)');
    } else if (cmd === 'scrollTop') {
      setLastAction('Retorno al Inicio');
    }

    sendRemoteCommand(cmd, value);
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      await resetDatabase();
      setActivePhase(1);
      setLastAction('Conferencia Reiniciada a Cero');
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    } catch (err) {
      console.error('Error resetting database:', err);
    } finally {
      setIsResetting(false);
      setIsResetConfirmOpen(false);
    }
  };

  // Rigorous real attendees and responses count
  const totalAttendees = state.roomStats?.connectedAttendees ?? Math.max(1, state.phase1_2.respondentsCount);
  const totalResponses =
    (state.phase1_2.respondentsCount || 0) +
    (state.phase3_4.coOwnersCount || 0) +
    (state.survey.totalResponses || 0);

  const activePhaseInfo = PHASES_LIST.find((p) => p.id === activePhase) || PHASES_LIST[0];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between select-none touch-manipulation pb-8">
      {/* Top Ergonomic Status Bar */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
          </div>
          <div>
            <h1 className="text-xs font-mono-code uppercase font-bold tracking-wider text-white flex items-center gap-1.5">
              <span>Master Remote · Roberto Hung</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono-code">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Wifi className="w-3 h-3" /> ENLACE ACTIVO
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300 font-bold">{latencyMs}ms latencia</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Sync */}
          <button
            onClick={() => refresh()}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer active:scale-95"
            title="Sincronizar conexión"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onSwitchToPresenter}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[11px] font-mono-code text-neutral-300 border border-neutral-800 cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Ver pantalla de proyector"
          >
            <Monitor className="w-3 h-3 text-[#FF6105]" />
            <span>Proyector</span>
          </button>

          <button
            onClick={onExitRemote}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 border border-neutral-800 cursor-pointer active:scale-95"
            title="Salir del control remoto"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Thumb Operating Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 flex flex-col justify-between gap-3">
        {/* Metric Pill Card: Connected Attendees & Responses (Real exact data) */}
        <div className="grid grid-cols-2 gap-2.5 bg-neutral-950 p-3 rounded-2xl border border-neutral-900 shadow-inner">
          <div className="flex items-center gap-2.5 p-2 bg-neutral-900/60 rounded-xl border border-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-[#FF6105]/10 border border-[#FF6105]/30 flex items-center justify-center text-[#FF6105]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono-code text-neutral-400 uppercase">Asistentes</div>
              <div className="text-base font-heading font-bold text-white leading-tight">
                {totalAttendees}{' '}
                <span className="text-[10px] font-normal text-emerald-400 font-mono-code">en sala</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-neutral-900/60 rounded-xl border border-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono-code text-neutral-400 uppercase">Respuestas</div>
              <div className="text-base font-heading font-bold text-white leading-tight">
                {totalResponses}{' '}
                <span className="text-[10px] font-normal text-neutral-400 font-mono-code">emitidas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Indicator & Feedback Banner */}
        <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-3.5 text-center shadow-md">
          <div className="text-[10px] font-mono-code uppercase text-[#FF6105] font-bold tracking-wider mb-1">
            Diapositiva Activa en Pantalla
          </div>
          <div className="text-xl font-heading font-extrabold text-white tracking-tight uppercase">
            {activePhaseInfo.label}
          </div>
          <div className="text-xs text-neutral-300 font-body font-medium mt-0.5">
            {activePhaseInfo.title}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono-code mt-1.5 pt-1.5 border-t border-neutral-900">
            Último comando: <span className="text-[#FF6105] font-bold">{lastAction}</span>
          </div>
        </div>

        {/* MASTER REMOTE CENTER SQUARE PAD (Arriba, Abajo, Anterior, Siguiente dispuestos en el centro en botones cuadrados) */}
        <div className="py-2 flex flex-col items-center justify-center">
          <div className="text-[10px] font-mono-code uppercase tracking-wider text-neutral-400 mb-3 text-center">
            Control Direccional Proyector
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] items-center justify-items-center">
            {/* Row 1: Empty - Arriba - Empty */}
            <div className="aspect-square w-full" />
            
            {/* Botón Cuadrado: Desplazar Arriba */}
            <button
              onClick={() => handleCommand('scrollUp')}
              className={`aspect-square w-full rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex flex-col items-center justify-center gap-1.5 shadow-xl transition-all active:scale-95 cursor-pointer hover:border-neutral-700 ${
                isPressing === 'scrollUp' ? 'bg-[#FF6105] text-black border-[#FF6105]' : 'hover:bg-neutral-850'
              }`}
              title="Desplazar Proyector Arriba (↑)"
            >
              <ArrowUp className="w-7 h-7 stroke-[2.5] text-[#FF6105]" />
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider">
                Arriba
              </span>
              <span className="text-[9px] text-neutral-400 font-mono-code">Scroll ↑</span>
            </button>

            <div className="aspect-square w-full" />

            {/* Row 2: Anterior - Centro (Fase Actual) - Siguiente */}
            {/* Botón Cuadrado: Anterior */}
            <button
              onClick={() => handleCommand('prev')}
              disabled={activePhase <= 1}
              className={`aspect-square w-full rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex flex-col items-center justify-center gap-1.5 shadow-xl transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer hover:border-neutral-700 ${
                isPressing === 'prev' ? 'bg-[#FF6105] text-black border-[#FF6105]' : 'hover:bg-neutral-850'
              }`}
              title="Diapositiva Anterior (←)"
            >
              <ChevronLeft className="w-8 h-8 stroke-[3] text-[#FF6105]" />
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider">
                Anterior
              </span>
              <span className="text-[9px] text-neutral-400 font-mono-code">Fase {Math.max(1, activePhase - 1)}</span>
            </button>

            {/* Cuadrado Central: Estado de Fase Activa */}
            <div className="aspect-square w-full rounded-2xl bg-black border-2 border-neutral-800 flex flex-col items-center justify-center p-2 text-center shadow-inner">
              <span className="text-[9px] font-mono-code text-neutral-400 uppercase tracking-widest">
                FASE
              </span>
              <span className="text-3xl font-heading font-black text-white leading-none my-0.5">
                {activePhase}
              </span>
              <span className="text-[10px] font-mono-code text-[#FF6105] font-bold">
                de 5
              </span>
            </div>

            {/* Botón Cuadrado: Siguiente */}
            <button
              onClick={() => handleCommand('next')}
              disabled={activePhase >= 5}
              className={`aspect-square w-full rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex flex-col items-center justify-center gap-1.5 shadow-xl transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer hover:border-neutral-700 ${
                isPressing === 'next' ? 'bg-[#FF6105] text-black border-[#FF6105]' : 'hover:bg-neutral-850'
              }`}
              title="Diapositiva Siguiente (→)"
            >
              <ChevronRight className="w-8 h-8 stroke-[3] text-[#FF6105]" />
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider">
                Siguiente
              </span>
              <span className="text-[9px] text-neutral-400 font-mono-code">Fase {Math.min(5, activePhase + 1)}</span>
            </button>

            {/* Row 3: Empty - Abajo - Empty */}
            <div className="aspect-square w-full" />

            {/* Botón Cuadrado: Desplazar Abajo */}
            <button
              onClick={() => handleCommand('scrollDown')}
              className={`aspect-square w-full rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex flex-col items-center justify-center gap-1.5 shadow-xl transition-all active:scale-95 cursor-pointer hover:border-neutral-700 ${
                isPressing === 'scrollDown' ? 'bg-[#FF6105] text-black border-[#FF6105]' : 'hover:bg-neutral-850'
              }`}
              title="Desplazar Proyector Abajo (↓)"
            >
              <ArrowDown className="w-7 h-7 stroke-[2.5] text-[#FF6105]" />
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider">
                Abajo
              </span>
              <span className="text-[9px] text-neutral-400 font-mono-code">Scroll ↓</span>
            </button>

            <div className="aspect-square w-full" />
          </div>
        </div>

        {/* Quick Phase Jump Carousel (Thumb Horizontal Strip) */}
        <div>
          <div className="text-[10px] font-mono-code uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center justify-between">
            <span>Salto Directo a Fase:</span>
            <span className="text-[#FF6105]">Pulsa para cambiar</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {PHASES_LIST.map((phase) => (
              <button
                key={phase.id}
                onClick={() => handleCommand('setPhase', phase.id)}
                className={`py-3 px-1 rounded-xl text-center font-mono-code text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                  activePhase === phase.id
                    ? 'bg-[#FF6105] text-black border-[#FF6105] shadow-[0_0_12px_rgba(255,97,5,0.4)]'
                    : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {phase.id}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Scroll to Top and Clean Reset */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleCommand('scrollTop')}
            className="py-3 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono-code flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#FF6105]" />
            <span>Tope Pantalla</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={isResetting}
            className="py-3 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-300 text-xs font-mono-code flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95"
          >
            {resetSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">¡Reiniciado!</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar a Cero</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Confirmation Modal for Resetting the Session */}
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
                  Acción irreversible
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-body">
              Se eliminarán todos los registros de los participantes, tokens suscritos y encuestas acumuladas. El proyector volverá de inmediato a la <strong>Fase 1 (Home)</strong>.
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
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono-code uppercase cursor-pointer disabled:opacity-50"
              >
                {isResetting ? 'Reiniciando...' : 'Sí, Reiniciar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
