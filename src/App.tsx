import React, { useState, useEffect, useCallback } from 'react';
import { useRealtimeState, useRemoteCommands } from './services/api';
import { Header } from './components/Header';
import { Phase1AuditoriumHome } from './components/Phase1AuditoriumHome';
import { Phase2ExclusionDiagnosis } from './components/Phase2ExclusionDiagnosis';
import { Phase3Tokenization } from './components/Phase3Tokenization';
import { Phase4Democratization } from './components/Phase4Democratization';
import { Phase5SurveyDashboard } from './components/Phase5SurveyDashboard';
import { AttendeeViewForm1 } from './components/AttendeeViewForm1';
import { AttendeeViewForm2 } from './components/AttendeeViewForm2';
import { AttendeeViewSurvey } from './components/AttendeeViewSurvey';
import { PresenterRemoteView } from './components/PresenterRemoteView';
import { AccessGateModal } from './components/AccessGateModal';
import { ExitIntentModal } from './components/ExitIntentModal';
import { WordPressEmbedModal } from './components/WordPressEmbedModal';
import { AppViewMode } from './types';
import { ChevronLeft, ChevronRight, KeyRound, Radio, Eye, EyeOff } from 'lucide-react';
import { getDayPin, getMonthPin, getYearPin, PRESENTER_MASTER_PIN } from './utils/securityPins';

export default function App() {
  const { state, isConnected } = useRealtimeState();
  const [currentView, setCurrentView] = useState<AppViewMode>('presenter');
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [surveyDismissed, setSurveyDismissed] = useState<boolean>(false);
  const [isUiBarsVisible, setIsUiBarsVisible] = useState<boolean>(false);

  const dayPin = getDayPin();
  const monthPin = getMonthPin();
  const yearPin = getYearPin();

  // Keyboard toggle for UI bars (Press 'H' or 'h')
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsUiBarsVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Read view parameter from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'audience') {
      setCurrentView('audience');
      setIsGatewayModalOpen(true);
    } else if (viewParam === 'remote') {
      setCurrentView('remote');
    } else if (viewParam === 'form1') {
      setCurrentView('attendee_form1');
    } else if (viewParam === 'form2') {
      setCurrentView('attendee_form2');
    } else if (viewParam === 'survey') {
      setCurrentView('attendee_survey');
    }
  }, []);

  // Real-time synchronization: Listen to commands from Master Remote (<150ms latency)
  const handleRemoteCommand = useCallback((cmd: string, val?: number) => {
    if (cmd === 'next') {
      setCurrentPhase((prev) => Math.min(5, prev + 1));
    } else if (cmd === 'prev') {
      setCurrentPhase((prev) => Math.max(1, prev - 1));
    } else if (cmd === 'setPhase' && typeof val === 'number') {
      setCurrentPhase(val);
    } else if (cmd === 'scrollDown') {
      window.scrollBy({ top: 380, behavior: 'smooth' });
    } else if (cmd === 'scrollUp') {
      window.scrollBy({ top: -380, behavior: 'smooth' });
    } else if (cmd === 'scrollTop') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useRemoteCommands(handleRemoteCommand);

  // Keyboard navigation for presentation slides (ArrowLeft / ArrowRight)
  useEffect(() => {
    if (currentView !== 'presenter') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (currentPhase < 5) {
          setCurrentPhase((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPhase > 1) {
          setCurrentPhase((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, currentPhase]);

  const handleNextPhase = () => {
    if (currentPhase < 5) setCurrentPhase((p) => p + 1);
  };

  const handlePrevPhase = () => {
    if (currentPhase > 1) setCurrentPhase((p) => p - 1);
  };

  // Exit-intent detection for attendees
  useEffect(() => {
    const isAttendee =
      currentView === 'attendee_form1' || currentView === 'attendee_form2';
    if (!isAttendee || surveyDismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        setIsExitModalOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [currentView, surveyDismissed]);

  // 1. MASTER REMOTE VIEW (Presenter Thumb Controller)
  if (currentView === 'remote') {
    return (
      <PresenterRemoteView
        onSwitchToPresenter={() => setCurrentView('presenter')}
        onExitRemote={() => setCurrentView('presenter')}
      />
    );
  }

  // 2. AUDIENCE GATEWAY VIEW (When QR is scanned with ?view=audience)
  if (currentView === 'audience') {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4">
        <AccessGateModal
          isOpen={true}
          onSuccess={(role) => {
            if (role === 'presenter') {
              setCurrentView('remote');
            } else {
              setCurrentView('attendee_form1');
            }
          }}
        />
      </div>
    );
  }

  // 3. ATTENDEE FORM 1 VIEW
  if (currentView === 'attendee_form1') {
    return (
      <>
        <AttendeeViewForm1
          onSwitchToPresenter={() => setCurrentView('presenter')}
          onGoToForm2={() => setCurrentView('attendee_form2')}
          onGoToSurvey={() => setCurrentView('attendee_survey')}
        />
        <ExitIntentModal
          isOpen={isExitModalOpen}
          onClose={() => {
            setIsExitModalOpen(false);
            setSurveyDismissed(true);
          }}
          onGoToSurvey={() => {
            setIsExitModalOpen(false);
            setCurrentView('attendee_survey');
          }}
        />
      </>
    );
  }

  // 4. ATTENDEE FORM 2 VIEW
  if (currentView === 'attendee_form2') {
    return (
      <>
        <AttendeeViewForm2
          onSwitchToPresenter={() => setCurrentView('presenter')}
          onGoToForm1={() => setCurrentView('attendee_form1')}
          onGoToSurvey={() => setCurrentView('attendee_survey')}
        />
        <ExitIntentModal
          isOpen={isExitModalOpen}
          onClose={() => {
            setIsExitModalOpen(false);
            setSurveyDismissed(true);
          }}
          onGoToSurvey={() => {
            setIsExitModalOpen(false);
            setCurrentView('attendee_survey');
          }}
        />
      </>
    );
  }

  // 5. ATTENDEE SURVEY VIEW
  if (currentView === 'attendee_survey') {
    return (
      <AttendeeViewSurvey
        onSwitchToPresenter={() => setCurrentView('presenter')}
        onGoToForms={() => setCurrentView('attendee_form1')}
      />
    );
  }

  // 6. MAIN PROJECTOR SCREEN (HOME / AUDITORIO) - STRICT PURE BLACK (#000000)
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-between text-white selection:bg-[#FF6105] selection:text-black relative">
      {/* Floating toggle for presentation UI bars (Top Header & Footer) */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsUiBarsVisible((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono-code transition-all cursor-pointer shadow-xl backdrop-blur-md ${
            isUiBarsVisible
              ? 'bg-[#FF6105] text-black border-[#FF6105] font-bold opacity-90 hover:opacity-100'
              : 'bg-black/70 hover:bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:text-white opacity-40 hover:opacity-100'
          }`}
          title={isUiBarsVisible ? 'Ocultar cintillos de navegación (Tecla H)' : 'Mostrar cintillos de navegación (Tecla H)'}
        >
          {isUiBarsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#FF6105]" />}
          <span className="hidden sm:inline">{isUiBarsVisible ? 'Ocultar Cintillos' : 'Ver Cintillos'}</span>
        </button>
      </div>

      {/* Top Bar Header (Hidden by default in presentation, toggled via floating button or 'H') */}
      {isUiBarsVisible && (
        <Header
          currentView={currentView}
          onSelectView={(v) => {
            if (v === 'audience') {
              setIsGatewayModalOpen(true);
            } else {
              setCurrentView(v);
            }
          }}
          currentPhase={currentPhase}
          onSelectPhase={setCurrentPhase}
          isConnected={isConnected}
          onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
          state={state}
        />
      )}

      {/* Main Slide Presentation Canvas */}
      <main className={`flex-1 w-full flex flex-col justify-between ${
        currentPhase === 1 && !isUiBarsVisible ? 'max-w-none px-0 py-0 overflow-hidden' : 'max-w-7xl mx-auto px-4 sm:px-6 py-4'
      }`}>
        {/* Phase 1: Pure Black Auditorium Screen with clean Roberto Hung silhouette & Question */}
        {currentPhase === 1 && (
          <Phase1AuditoriumHome
            state={state}
            onGoToPhase2={() => setCurrentPhase(2)}
          />
        )}
        {currentPhase === 2 && (
          <Phase2ExclusionDiagnosis
            state={state}
            onGoToPhase3={() => setCurrentPhase(3)}
          />
        )}
        {currentPhase === 3 && <Phase3Tokenization state={state} />}
        {currentPhase === 4 && (
          <Phase4Democratization
            state={state}
            onGoToPhase5={() => setCurrentPhase(5)}
          />
        )}
        {currentPhase === 5 && (
          <Phase5SurveyDashboard
            state={state}
            onGoToPhase1={() => setCurrentPhase(1)}
          />
        )}
      </main>

      {/* Bottom Presenter Navigation Bar (Hidden by default, toggled via floating button or 'H') */}
      {isUiBarsVisible && (
        <footer className="sticky bottom-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-neutral-900 py-3 px-4 sm:px-6 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Previous Button */}
            <button
              onClick={handlePrevPhase}
              disabled={currentPhase === 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-neutral-300 bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Center: Phase Indicators & Shortcuts */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <button
                  key={step}
                  onClick={() => setCurrentPhase(step)}
                  className={`transition-all cursor-pointer ${
                    currentPhase === step
                      ? 'w-8 h-2.5 bg-[#FF6105] rounded-full shadow-[0_0_10px_rgba(255,97,5,0.6)]'
                      : 'w-2.5 h-2.5 bg-neutral-800 hover:bg-neutral-600 rounded-full'
                  }`}
                  title={`Ir a Fase ${step}`}
                />
              ))}
              <span className="text-xs text-neutral-400 font-mono-code font-medium ml-2 hidden sm:inline">
                Fase {currentPhase} / 5 · (Usa flechas ← / → o Control Remoto)
              </span>
            </div>

            {/* Right: Master Remote Quick Link & Next Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCurrentView('remote')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-mono-code text-neutral-300 hover:text-[#FF6105] transition-colors cursor-pointer"
                title="Abrir Master Remote para control con el pulgar"
              >
                <Radio className="w-3.5 h-3.5 text-[#FF6105]" />
                <span>Mando Móvil</span>
              </button>

              <button
                onClick={handleNextPhase}
                disabled={currentPhase === 5}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-black bg-[#FF6105] hover:bg-[#ff7524] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-[0_0_15px_rgba(255,97,5,0.3)]"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Access Gate Modal (triggered if opened manually or from header) */}
      <AccessGateModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        onSuccess={(role) => {
          setIsGatewayModalOpen(false);
          if (role === 'presenter') {
            setCurrentView('remote');
          } else {
            setCurrentView('attendee_form1');
          }
        }}
      />

      {/* WordPress Embed instructions modal */}
      <WordPressEmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
      />
    </div>
  );
}
