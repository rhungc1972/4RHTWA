import React, { useState, useEffect } from 'react';
import { submitSurvey, useRealtimeState } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Star,
  CheckCircle2,
  User,
  Mail,
  ArrowRight,
  Send,
  Award,
  Check,
  Edit2,
  Lock,
  KeyRound,
  AlertCircle,
  Download,
  Phone,
  Building2,
  Briefcase,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { validateYearPin, getYearPin } from '../utils/securityPins';
import { DossierDownloadModal } from './DossierDownloadModal';
import { generateCleanParticipantDossierPDF } from '../utils/pdfGenerator';

interface AttendeeViewSurveyProps {
  onSwitchToPresenter?: () => void;
  onGoToForms?: () => void;
}

const AVAILABLE_TOPICS = [
  {
    id: 'Contratos Inteligentes & Derecho Notarial / Registral',
    title: 'Contratos Inteligentes & Derecho Notarial / Registral',
    desc: 'Protocolización de smart contracts y fe pública digital',
  },
  {
    id: 'Tokenización de Créditos Privados & Deuda Corporativa',
    title: 'Tokenización de Créditos Privados & Deuda Corporativa',
    desc: 'Securitización de pagarés y factoring descentralizado',
  },
  {
    id: 'Marco Regulatorio & Fiscalidad Cripto en Iberoamérica',
    title: 'Marco Regulatorio & Fiscalidad Cripto en Iberoamérica',
    desc: 'Tratamiento tributario de dividendos y ganancias patrimoniales',
  },
  {
    id: 'Vehículos Societarios, SPV y Fideicomisos para RWA',
    title: 'Vehículos Societarios, SPV y Fideicomisos para RWA',
    desc: 'Estructuración corporativa de blindaje y titularidad',
  },
  {
    id: 'Gobernanza Descentralizada (DAO) y Derecho Corporativo',
    title: 'Gobernanza Descentralizada (DAO) y Derecho Corporativo',
    desc: 'Toma de decisiones, asambleas digitales y voto ponderado',
  },
];

export const AttendeeViewSurvey: React.FC<AttendeeViewSurveyProps> = ({
  onSwitchToPresenter,
  onGoToForms,
}) => {
  const { state } = useRealtimeState();

  // Gatekeeper check: is Survey unlocked with Year Pin?
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      const surveyGate = sessionStorage.getItem('rwa_gate_survey_unlocked');
      return surveyGate === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [cleanDossierDownloading, setCleanDossierDownloading] = useState(false);
  const [cleanDossierSuccess, setCleanDossierSuccess] = useState(false);

  // Attendee profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);

  // Survey responses - ALL CHECKBOXES AND ASSESSMENTS START COMPLETELY UNSELECTED (EMPTY/NULL)
  const [ratingQuality, setRatingQuality] = useState<number | null>(null);
  const [ratingClarity, setRatingClarity] = useState<number | null>(null);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]); // COMPLETELY UNSELECTED BY DEFAULT
  const [comments, setComments] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  // Auto-fill from localStorage if available
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('rwa_attendee_name');
      const savedEmail = localStorage.getItem('rwa_attendee_email');
      if (savedName || savedEmail) {
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
        setHasSavedProfile(true);
      }
    } catch {}

    const handleReset = () => {
      setSubmitted(false);
      setRatingQuality(null);
      setRatingClarity(null);
      setNpsScore(null);
      setSelectedTopics([]);
      setComments('');
      setErrorMsg('');
    };
    window.addEventListener('rwa_state_reset', handleReset);
    return () => window.removeEventListener('rwa_state_reset', handleReset);
  }, []);

  const handleUnlockSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (validateYearPin(pinInput)) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('rwa_gate_survey_unlocked', 'true');
      } catch {}
    } else {
      setPinError(`Clave incorrecta. Ingrese los dos últimos dígitos del año en curso (${getYearPin()}).`);
    }
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#FF6105', '#10B981', '#FFFFFF'],
      });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const finalName = name.trim() || 'Asistente';
      const finalEmail = email.trim(); // Completely optional!
      // Only include effective comments if provided, omitting blank / null
      const finalComments = comments.trim() ? comments.trim() : undefined;

      await submitSurvey({
        name: finalName,
        email: finalEmail,
        ratingQuality: ratingQuality ?? 5,
        ratingClarity: ratingClarity ?? 5,
        npsScore: npsScore ?? 10,
        selectedTopics,
        comments: finalComments,
      });

      try {
        if (finalName) localStorage.setItem('rwa_attendee_name', finalName);
        if (finalEmail) localStorage.setItem('rwa_attendee_email', finalEmail);
      } catch {}

      setSubmitted(true);
      triggerConfetti();
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo registrar la encuesta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // IF LOCKED: Show key unlock screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between py-8 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto my-auto">
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-center">
            <div className="w-14 h-14 bg-[#FF6105]/10 border border-[#FF6105]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#FF6105]">
              <Lock className="w-7 h-7 stroke-[2.2]" />
            </div>

            <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-tight">
              Encuesta y Dossier RWA
            </h2>
            <p className="text-xs text-neutral-400 mt-1 mb-5">
              Ingrese la clave indicada por el ponente en la sala:
            </p>

            <form onSubmit={handleUnlockSurvey} className="space-y-4">
              <input
                type="text"
                maxLength={7}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Clave de Sala"
                className="w-full text-center py-3.5 px-4 bg-neutral-950 border-2 border-neutral-700 focus:border-[#FF6105] rounded-xl text-2xl font-mono-code font-bold tracking-widest text-white outline-hidden"
                autoFocus
              />

              {pinError && (
                <div className="p-2.5 bg-red-950/40 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-md cursor-pointer"
              >
                Acceder a la Evaluación
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW: Survey Form
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono-code uppercase tracking-wider text-neutral-300 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6105] animate-pulse" />
            <span>ROBERTO HUNG · EVALUACIÓN FINAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
            Encuesta y Solicitud de Dossier
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Plataforma RWA · Retroalimentación y Descarga de Certificado
          </p>
        </div>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6"
          >
            {/* Identity Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Tu nombre (para el certificado del Dossier)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-[#FF6105] text-sm outline-hidden transition-all text-white placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono-code uppercase tracking-wider text-neutral-400 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico (Opcional - solo si deseas recibir el informe)"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-[#FF6105] text-xs sm:text-sm outline-hidden transition-all text-white placeholder:text-neutral-500"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1 pl-1">
                  * Voluntario: la falta de correo no condiciona ni bloquea el envío de la encuesta.
                </p>
              </div>
            </div>

            {/* Rating: Quality & Clarity */}
            <div className="pt-3 border-t border-neutral-800 space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-white mb-2">
                  Calidad y Rigor de la Exposición (1 a 5 Estrellas)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingQuality(star)}
                      className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 transition-all cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          ratingQuality !== null && star <= ratingQuality
                            ? 'text-[#FF6105] fill-[#FF6105]'
                            : 'text-neutral-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono-code text-[#FF6105] font-bold ml-2">
                    {ratingQuality !== null ? `${ratingQuality}/5 ★` : 'Seleccionar valoración'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-white mb-2">
                  Claridad Conceptual sobre Tokenización RWA (1 a 5)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setRatingClarity(score)}
                      className={`py-2 rounded-xl text-center font-mono-code text-xs font-bold transition-all border cursor-pointer ${
                        ratingClarity === score
                          ? 'bg-[#FF6105] text-black border-[#FF6105]'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkboxes: Areas of Interest (ALL INITIALLY UNCHECKED BY DEFAULT) */}
            <div className="pt-3 border-t border-neutral-800">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-white mb-1.5">
                Áreas de Interés Doctrinal y Especialización
              </label>
              <p className="text-[11px] text-neutral-400 mb-3">
                Selecciona los temas en los que te gustaría recibir investigación o futuras sesiones:
              </p>

              <div className="space-y-2">
                {AVAILABLE_TOPICS.map((topic) => {
                  const isChecked = selectedTopics.includes(topic.id);
                  return (
                    <label
                      key={topic.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#FF6105]/10 border-[#FF6105] text-white shadow-sm'
                          : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTopic(topic.id)}
                        className="mt-1 h-4 w-4 rounded-md border-neutral-700 bg-neutral-900 text-[#FF6105] focus:ring-[#FF6105] cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <span className="font-semibold block text-white">{topic.title}</span>
                        <span className="text-neutral-400 text-[11px] mt-0.5 block">{topic.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* NPS 1 to 10 */}
            <div className="pt-3 border-t border-neutral-800">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-white mb-1.5">
                ¿Qué probabilidad hay de que recomiendes esta sesión a colegas o directivos?
              </label>
              <p className="text-[11px] text-neutral-400 mb-3">Escala de 1 (Nada probable) a 10 (Totalmente seguro):</p>
              <div className="grid grid-cols-10 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setNpsScore(score)}
                    className={`py-2 rounded-lg text-center font-mono-code text-xs font-bold transition-all border cursor-pointer ${
                      npsScore === score
                        ? 'bg-[#FF6105] text-black border-[#FF6105]'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Open Comments (Completely optional, omitted if empty) */}
            <div className="pt-3 border-t border-neutral-800">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-white mb-1.5">
                Reflexiones o Comentarios para Roberto Hung
              </label>
              <p className="text-[11px] text-neutral-400 mb-2">
                (Opcional - solo se computarán e incluirán las respuestas efectivamente completadas)
              </p>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Escribe tus impresiones sobre la tokenización, dudas jurídicas o aportes..."
                className="w-full p-3 rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-[#FF6105] text-xs sm:text-sm text-white placeholder:text-neutral-600 outline-hidden resize-none transition-all"
              />
            </div>

            {/* Error notice */}
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,97,5,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Registrando Encuesta...' : 'Enviar Evaluación y Obtener Dossier'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Confirmation & Dossier Download Card */
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-bold text-white uppercase tracking-tight">
              ¡Evaluación Registrada con Éxito!
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-sm mx-auto">
              “Agradecemos profundamente su activa participación en esta sesión de inmersión en la economía tokenizada.”
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={async () => {
                  setCleanDossierDownloading(true);
                  try {
                    await generateCleanParticipantDossierPDF({
                      appState: state,
                      ratings: {
                        quality: ratingQuality ?? undefined,
                        clarity: ratingClarity ?? undefined,
                        nps: npsScore ?? undefined,
                      },
                    });
                    setCleanDossierSuccess(true);
                    setTimeout(() => setCleanDossierSuccess(false), 3000);
                  } catch (e) {
                    console.error('Error generating clean PDF:', e);
                  } finally {
                    setCleanDossierDownloading(false);
                  }
                }}
                disabled={cleanDossierDownloading}
                className="w-full py-4 px-4 bg-[#FF6105] hover:bg-[#ff7524] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(255,97,5,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {cleanDossierSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>¡Infografía Descargada!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Descargar Infografía Oficial de la Sala (Zero PII)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setDossierModalOpen(true)}
                className="w-full py-3 px-4 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono-code font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#FF6105]" />
                <span>Ver Ejemplar Personalizado de Participación</span>
              </button>

              {/* Prominent external link to official website */}
              <a
                href="https://www.robertohung.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-neutral-900 to-neutral-950 hover:from-neutral-800 hover:to-neutral-900 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-[#FF6105]/40 flex items-center justify-center gap-2 shadow-lg group"
              >
                <span>Conoce Más en www.robertohung.com</span>
                <ExternalLink className="w-4 h-4 text-[#FF6105] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {onGoToForms && (
              <button
                onClick={onGoToForms}
                className="text-xs text-neutral-500 hover:text-neutral-300 underline cursor-pointer pt-1 block mx-auto"
              >
                Volver a la simulación inicial
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-neutral-500 mt-6 font-mono-code">
          Roberto Hung Cavalieri · www.robertohung.com · #ElDerechoDeHacerRuido
        </div>
      </div>

      {/* Dossier Download Modal */}
      <DossierDownloadModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        attendeeName={name || 'Asistente en Sala'}
        attendeeEmail={email}
        tokensSubscribed={10}
        usdAmount={100}
        m2Acquired={0.1}
        ratings={{
          quality: ratingQuality ?? undefined,
          clarity: ratingClarity ?? undefined,
          nps: npsScore ?? undefined,
        }}
      />
    </div>
  );
};
