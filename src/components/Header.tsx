import React, { useState } from 'react';
import { AppViewMode, AppStateData } from '../types';
import {
  MonitorPlay,
  Smartphone,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Code,
  Wifi,
  WifiOff,
  ChevronDown,
  Check,
  ClipboardList,
  KeyRound,
  Radio,
  FileDown,
  Lock,
  Edit3,
} from 'lucide-react';
import { resetDatabase, seedDemoData, setSessionActiveStatus } from '../services/api';
import { getDayPin, getMonthPin, getYearPin, getMonthName } from '../utils/securityPins';
import { generatePresenterStructuredReportPDF } from '../utils/pdfGenerator';
import { logoutPresenter } from '../utils/presenterAuth';
import { AdminPinModal } from './AdminPinModal';
import { useContent } from '../context/ContentContext';

interface HeaderProps {
  currentView: AppViewMode;
  onSelectView: (view: AppViewMode) => void;
  currentPhase: number;
  onSelectPhase: (phase: number) => void;
  isConnected: boolean;
  onOpenEmbedModal: () => void;
  state?: AppStateData;
  onLockSession?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  currentPhase,
  onSelectPhase,
  isConnected,
  onOpenEmbedModal,
  state,
  onLockSession,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);

  const { isEditMode, toggleEditMode, setIsEditorModalOpen } = useContent();

  const dayPin = getDayPin();
  const monthPin = getMonthPin();
  const yearPin = getYearPin();
  const monthName = getMonthName();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleReset = async () => {
    if (window.confirm('¿Deseas reiniciar todos los datos para comenzar una nueva conferencia en limpio? El proyector volverá a la Fase 1.')) {
      setToolsOpen(false);
      onSelectPhase(1);
      setFeedbackAction('Conferencia reiniciada en limpio (Fase 1)');
      setTimeout(() => setFeedbackAction(null), 2500);

      try {
        await resetDatabase();
      } catch (err) {
        console.warn('Reset background sync warning:', err);
      }
      return;
    }
    setToolsOpen(false);
  };

  const handleSeed = async () => {
    try {
      await seedDemoData();
      setFeedbackAction('Simulación demo cargada');
      setTimeout(() => setFeedbackAction(null), 2500);
    } catch (err) {
      console.error(err);
    }
    setToolsOpen(false);
  };

  const handleRequestDownloadReport = () => {
    setToolsOpen(false);
    setIsAdminPinModalOpen(true);
  };

  const handleAdminDownloadConfirmed = () => {
    setIsGeneratingPdf(true);
    try {
      if (state) {
        generatePresenterStructuredReportPDF(state);
        setFeedbackAction('Informe PDF de Asistentes Descargado');
        setTimeout(() => setFeedbackAction(null), 3000);
      }
    } catch (err) {
      console.error('Error al generar informe estructurado PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleLockClick = async () => {
    logoutPresenter();
    try {
      await setSessionActiveStatus(false);
    } catch (err) {
      console.error('Error updating session active status:', err);
    }
    if (onLockSession) {
      onLockSession();
    }
    setToolsOpen(false);
  };

  const phases = [
    { num: 1, label: '1. CUELLO DE BOTELLA' },
    { num: 2, label: '2. DIAGNÓSTICO' },
    { num: 3, label: '3. TOKENIZACIÓN' },
    { num: 4, label: '4. DEMOCRATIZACIÓN' },
    { num: 5, label: '5. EVALUACIÓN & FEEDBACK' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-md border-b border-[#262626] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Branding on Left */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#FF6105] text-black flex items-center justify-center font-display text-base font-black shadow-md border border-[#FF6105]/50">
            RH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display uppercase tracking-wide text-white text-base sm:text-lg">
                ROBERTO HUNG
              </span>
              <a
                href="https://www.robertohung.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-block px-2 py-0.5 rounded-sm bg-[#1A1A1A] border border-[#262626] text-[#FF6105] hover:text-white text-[10px] font-mono-code transition-colors"
              >
                www.robertohung.com
              </a>
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-2">
              <span>Proyecto Inmobiliario RH-RWA</span>
              <span className="text-neutral-600">·</span>
              <span className="text-[#FF6105] font-semibold">Conferencia & Simulación en Vivo</span>
            </div>
          </div>
        </div>

        {/* Phase Navigator (Presenter Mode) */}
        {currentView === 'presenter' && (
          <nav className="hidden lg:flex items-center gap-1 bg-[#0F0F0F] p-1 rounded-lg border border-[#262626]">
            {phases.map((p) => {
              const isActive = currentPhase === p.num;
              return (
                <button
                  key={p.num}
                  onClick={() => onSelectPhase(p.num)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-heading font-bold uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF6105] text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Controls on Right */}
        <div className="flex items-center gap-2.5">
          {/* New Presentation Quick Button (Presenter Mode) */}
          {currentView === 'presenter' && (
            <button
              onClick={handleReset}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs font-semibold transition-colors cursor-pointer"
              title="Iniciar una nueva presentación limpia para un nuevo auditorio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nueva Presentación</span>
            </button>
          )}

          {/* Mode Selector */}
          <div className="flex items-center bg-[#0F0F0F] p-0.5 rounded-lg border border-[#262626] text-xs">
            <button
              onClick={() => onSelectView('presenter')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-heading font-semibold transition-all ${
                currentView === 'presenter'
                  ? 'bg-[#FF6105] text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Modo Proyector (Presentador)"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PROYECTOR</span>
            </button>

            <button
              onClick={() => onSelectView('remote')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-heading font-semibold transition-all ${
                currentView === 'remote'
                  ? 'bg-[#FF6105] text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Control Remoto Presentador"
            >
              <Radio className="w-3.5 h-3.5 text-[#FF6105]" />
              <span className="hidden sm:inline">REMOTO</span>
            </button>

            <button
              onClick={() => onSelectView('attendee_form1')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-heading font-semibold transition-all ${
                currentView === 'attendee_form1' || currentView === 'attendee_form2' || currentView === 'audience'
                  ? 'bg-[#FF6105] text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Modo Móvil Asistente"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">MÓVIL</span>
            </button>

            <button
              onClick={() => onSelectView('attendee_survey')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-heading font-semibold transition-all ${
                currentView === 'attendee_survey'
                  ? 'bg-[#FF6105] text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Encuesta Post-Conferencia"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ENCUESTA</span>
            </button>
          </div>

          {/* Live Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono-code font-bold uppercase border ${
              isConnected
                ? 'bg-[#0F0F0F] text-[#FF6105] border-[#262626]'
                : 'bg-neutral-900 text-amber-500 border-amber-900/50'
            }`}
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#FF6105] animate-ping" />
                <span>EN VIVO</span>
              </>
            ) : (
              <span>RECONECTANDO</span>
            )}
          </div>

          {/* Tools Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="px-2.5 py-1.5 rounded-lg border border-[#262626] bg-[#0F0F0F] hover:bg-[#1A1A1A] text-xs font-semibold text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>HERRAMIENTAS</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {toolsOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#0F0F0F] rounded-xl shadow-2xl border border-[#262626] py-2 z-50 text-xs animate-fadeIn"
                onMouseLeave={() => setToolsOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#FF6105] font-display border-b border-[#262626]">
                  Control de la Conferencia
                </div>

                <div className="p-3 my-1 bg-[#141414] border-y border-[#262626] text-[11px] text-neutral-300">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF6105]" />
                    <span>Claves Dinámicas de Sala:</span>
                  </div>
                  <div className="space-y-1 font-mono-code text-[10px]">
                    <div>• Etapa 1 (Capital): <span className="text-[#FF6105] font-bold">{dayPin}</span> (Día actual)</div>
                    <div>• Etapa 2 (Tokens): <span className="text-[#FF6105] font-bold">{monthPin}</span> ({monthName})</div>
                    <div>• Etapa 3 (Encuesta): <span className="text-[#FF6105] font-bold">{yearPin}</span> (Año {new Date().getFullYear()})</div>
                  </div>
                </div>

                {/* Edit Mode Toggle & Modal */}
                <button
                  onClick={() => {
                    toggleEditMode();
                    setToolsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 font-medium cursor-pointer transition-colors ${
                    isEditMode
                      ? 'bg-[#FF6105]/20 text-[#FF6105] font-bold'
                      : 'text-neutral-300 hover:bg-[#1A1A1A]'
                  }`}
                >
                  <Edit3 className="w-4 h-4 text-[#FF6105]" />
                  <span>{isEditMode ? 'Desactivar Edición In-Situ' : 'Modo Edición de Contenidos'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsEditorModalOpen(true);
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-300 hover:bg-[#1A1A1A] flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FF6105]" />
                  <span>Personalizar Textos y Citas</span>
                </button>

                <button
                  onClick={() => {
                    onSelectView('presenter');
                    onSelectPhase(5);
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-white hover:bg-[#1A1A1A] flex items-center gap-2 font-medium cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4 text-[#FF6105]" />
                  <span>Ver Resultados de Encuesta (Fase 5)</span>
                </button>

                <button
                  onClick={handleRequestDownloadReport}
                  disabled={isGeneratingPdf}
                  className="w-full text-left px-3 py-2 text-[#FF6105] hover:bg-[#1A1A1A] flex items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                  title="Descargar informe consolidado con datos de los participantes (Requiere clave)"
                >
                  <FileDown className="w-4 h-4 text-[#FF6105]" />
                  <span>Descargar Informe de Asistentes (PDF)</span>
                </button>

                <button
                  onClick={handleSeed}
                  className="w-full text-left px-3 py-2 text-neutral-300 hover:bg-[#1A1A1A] flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Cargar Simulación Demo</span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-[#1A1A1A] flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  <span>Reiniciar Todos los Datos a Cero</span>
                </button>

                <div className="my-1 border-t border-[#262626]" />

                {/* Session lock */}
                <button
                  onClick={handleLockClick}
                  className="w-full text-left px-3 py-2 text-amber-400 hover:bg-[#1A1A1A] flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Bloquear Pantalla / Cerrar Sesión</span>
                </button>

                <button
                  onClick={() => {
                    onOpenEmbedModal();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-300 hover:bg-[#1A1A1A] flex items-center gap-2 cursor-pointer"
                >
                  <Code className="w-4 h-4 text-[#FF6105]" />
                  <span>Código WordPress (iframe)</span>
                </button>

                <button
                  onClick={() => {
                    toggleFullscreen();
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-300 hover:bg-[#1A1A1A] flex items-center gap-2 cursor-pointer"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4 text-neutral-400" />
                      <span>Salir de Pantalla Completa</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 text-neutral-400" />
                      <span>Pantalla Completa</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Pin Confirmation Modal for Protected Report Download */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={handleAdminDownloadConfirmed}
      />

      {/* Action feedback toast */}
      {feedbackAction && (
        <div className="absolute top-14 right-6 bg-[#FF6105] text-black font-heading font-bold px-3 py-1.5 rounded-md shadow-xl text-xs flex items-center gap-1.5 z-50 animate-fadeIn">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>{feedbackAction}</span>
        </div>
      )}
    </header>
  );
};
