import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Edit3, Check, Sparkles, X, Save } from 'lucide-react';

export interface ContentDictionary {
  [key: string]: string;
}

export const DEFAULT_CONTENT: ContentDictionary = {
  // Phase 1: Auditorium & Home
  phase1_badge: 'Conferencia Magistral · Roberto Hung',
  phase1_speaker: 'Roberto Hung Cavalieri',
  phase1_link: 'www.robertohung.com',
  phase1_hashtag: '#ElDerechoDeHacerRuido',
  phase1_tagline: 'Experiencia Interactiva en Tiempo Real',
  phase1_title: '¿Sabes lo que es la tokenización de activos del mundo real (RWA)?',
  phase1_subtitle: 'Roberto Hung desarrolló esta experiencia interactiva para generar iniciales reflexiones sobre el fenómeno de la tokenización de activos de la vida real (RWA). Conecte su teléfono móvil desde su asiento para participar en la simulación.',
  phase1_qr_card_title: 'Acceso Interactivo en Sala',
  phase1_qr_instruction: 'Escanea el código con la cámara de tu teléfono para participar en tiempo real desde tu asiento en la sala.',
  phase1_qr_note: '* El código QR se mantendrá visible para quienes entren más tarde.',

  // Phase 2: Traditional Exclusion Diagnosis
  phase2_badge: 'Fase 2 de 5 · Diagnóstico Analítico en Directo',
  phase2_hashtag: '#ElDerechoDeHacerRuido · Roberto Hung Cavalieri',
  phase2_title: 'Diagnóstico del Capital Paralizado: La Brecha de Exclusión',
  phase2_subtitle: 'Visualización empírica de cómo la barrera tradicional ($10.000 USD por cuota indivisa) trunca la movilización del ahorro privado en el propio auditorio, dejando al promotor con un severo déficit de financiación.',
  phase2_photo_badge_1: 'Foto 1 · Perspectiva Exterior',
  phase2_photo_badge_2: 'Foto 2 · Estructura & Gemelo BIM',
  phase2_project_title: 'Torre Residencial RH-RWA · 10 Pisos · 1.000 m²',
  phase2_project_subtitle: 'Valuación Obra: $1.000.000 USD · Ticket Mínimo Tradicional: $10.000 USD',
  phase2_theory_title: 'Fundamento Teórico: El Capital Inmóvil (Hernando de Soto)',
  phase2_theory_desc: 'Sin vehículos de titulación líquida o alícuotas digitales transferibles, la riqueza potencial de los pequeños y medianos ahorristas permanece estancada como «capital muerto». La exigencia de tickets desproporcionados en el derecho inmobiliario clásico bloquea el acceso de la ciudadanía al rendimiento productivo.',
  phase2_metric_qualified_label: 'Capital Capturado (Tradicional)',
  phase2_metric_qualified_sub: 'Tickets ≥ $10.000 USD',
  phase2_metric_excluded_label: 'Capital Excluido / Bloqueado',
  phase2_metric_excluded_sub: 'Ahorristas con < $10.000 USD',
  phase2_metric_deficit_label: 'Déficit de Financiación del Promotor',
  phase2_metric_deficit_sub: 'Capital faltante para la meta',

  // Phase 3: RWA Tokenization Protocol
  phase3_badge: 'Fase 3 de 5 · Arquitectura del Protocolo RWA',
  phase3_hashtag: '#ElDerechoDeHacerRuido · Roberto Hung Cavalieri',
  phase3_title: 'Protocolo de Tokenización: Especificaciones & Emisión',
  phase3_subtitle: 'Subdivisión matemática y contractual de la Torre Residencial RH-RWA en 100.000 tokens fungibles, permitiendo que cada participante acceda a la copropiedad con plenos derechos económicos.',
  phase3_legal_title: 'Certeza Jurídica & Smart Contract:',
  phase3_legal_desc: 'Cada token representa una alícuota patrimonial en el vehículo titular (SPV/Fideicomiso) con derecho automático a dividendos por arrendamiento y voto en asamblea descentralizada.',
  phase3_specs_title: 'Especificaciones de la Tokenización RH-RWA',
  phase3_specs_price: '1 Token = $10 USD',
  phase3_math_title: 'Subdivisión Matemática del Inmueble',
  phase3_math_headline: '100.000 Tokens',
  phase3_math_subtitle: 'Precio unitario: $10 USD por token fungible',
  phase3_equiv_1: '1 Token ($10 USD) = 0,01 m²',
  phase3_equiv_2: '10 Tokens ($100 USD) = 0,10 m²',
  phase3_equiv_3: '100 Tokens ($1.000 USD) = 1,00 m² Habitable',
  phase3_equiv_4: '10.000 Tokens ($100.000 USD) = 1 Piso Completo (100 m²)',

  // Phase 4: Democratization & Doctrinal Pillars
  phase4_badge: 'Fase 4 de 5 · Estudio Comparativo & Pilares Doctrinales',
  phase4_hashtag: '#ElDerechoDeHacerRuido · Roberto Hung Cavalieri',
  phase4_title: 'Comparativa: Modelo Tradicional vs Tokenizado RWA',
  phase4_subtitle: 'Contraste empírico entre el esquema tradicional bancario-notarial y el protocolo de tokenización fraccionada con base en los datos reales del auditorio.',
  phase4_trad_title: 'Modelo Tradicional (Cerrado)',
  phase4_trad_ticket: 'Ticket: ≥ $10.000 USD',
  phase4_rwa_title: 'Modelo Tokenizado RWA (Abierto)',
  phase4_rwa_ticket: 'Ticket: Desde $10 USD',
  phase4_p1_title: '01. Gobernanza On-Chain',
  phase4_p1_desc: 'Voto proporcional directo para elegir administración, presupuestos y mejoras edilicias.',
  phase4_p1_legal: 'Democracia accionaria digital sin asambleas presenciales conflictivas.',
  phase4_p2_title: '02. Rentas Automáticas',
  phase4_p2_desc: 'Dispersión directa a la wallet en stablecoins (USDC/USDT) según la alícuota en tokens.',
  phase4_p2_legal: 'Ejecución contractual auto-liquidable al segundo sin retenciones bancarias.',
  phase4_p3_title: '03. Liquidez Inmediata (24/7)',
  phase4_p3_desc: 'Mercado secundario de tokens continuo sin necesidad de vender el inmueble completo.',
  phase4_p3_legal: 'Circulación desintermediada de alícuotas patrimoniales registradas.',
  phase4_p4_title: '04. Colateral & Financiación',
  phase4_p4_desc: 'Uso de tokens inmobiliarios como garantía líquida para préstamos DeFi o bancarios.',
  phase4_p4_legal: 'Pignoración digital de títulos de copropiedad manteniendo el cobro de rentas.',
  phase4_p5_title: '05. Tránsito Negocial Transparente',
  phase4_p5_desc: 'Transmisión verificable, eficaz, económica y con reducción radical de aranceles.',
  phase4_p5_legal: 'Inmutabilidad registral en blockchain y blindaje jurídico notarial.',
  phase4_p6_title: '06. Despertar del Capital Muerto',
  phase4_p6_desc: 'Doctrina Hernando de Soto: transformar bienes estáticos en palancas de riqueza global.',
  phase4_p6_legal: 'Democratización real del ahorro popular para la copropiedad productiva.',

  // Phase 5: Survey Dashboard & Closing
  phase5_badge: 'Fase 5 de 5 · Evaluación, Gráficos Circulares & Dossier Final',
  phase5_hashtag: '#ElDerechoDeHacerRuido · Roberto Hung Cavalieri',
  phase5_title: 'Dashboard Analítico: Fotografías, Métricas & Percepción',
  phase5_subtitle: 'Consolidación empírica en tiempo real con los datos aportados por los asistentes: registro fotográfico del inmueble, gráficos circulares de ambos escenarios y satisfacción en sala.',
  phase5_sec_photos: '1. Registro Fotográfico y Gemelo Digital del Inmueble',
  phase5_sec_charts: '2. Comparativa Empírica: Gráficos Circulares de Absorción',
  phase5_sec_satisfaction: '3. Métrica de Calidad, Claridad Doctrinal y Net Promoter Score (NPS)',
  phase5_sec_topics: '4. Interés Temático del Auditorio para Próximas Sesiones',
  phase5_sec_comments: '5. Feed de Participación y Citas del Auditorio',
  closing_statement: '“Agradecemos profundamente su activa participación en esta sesión de inmersión en la economía tokenizada.”',
  closing_speaker: 'Roberto Hung Cavalieri · #ElDerechoDeHacerRuido · www.robertohung.com',
};

const PRIMARY_STORAGE_KEY = 'rwa_custom_texts';
const FALLBACK_STORAGE_KEY = 'rwa_custom_copy';

interface ContentContextType {
  isEditMode: boolean;
  setIsEditMode: (active: boolean) => void;
  toggleEditMode: () => void;
  content: ContentDictionary;
  getText: (key: string, fallback?: string) => string;
  updateText: (key: string, value: string) => void;
  resetAllContent: () => void;
  isEditorModalOpen: boolean;
  setIsEditorModalOpen: (open: boolean) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [content, setContent] = useState<ContentDictionary>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONTENT;
    try {
      const saved = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(FALLBACK_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONTENT, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error reading custom copy from localStorage:', e);
    }
    return DEFAULT_CONTENT;
  });

  const updateText = (key: string, value: string) => {
    setContent((prev) => {
      const next = { ...prev, [key]: value };
      try {
        const serialized = JSON.stringify(next);
        localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);
        localStorage.setItem(FALLBACK_STORAGE_KEY, serialized);
      } catch (e) {
        console.warn('Error saving custom copy to localStorage:', e);
      }
      return next;
    });
  };

  const resetAllContent = () => {
    try {
      localStorage.removeItem(PRIMARY_STORAGE_KEY);
      localStorage.removeItem(FALLBACK_STORAGE_KEY);
    } catch {}
    setContent(DEFAULT_CONTENT);
  };

  // Crucial: If key is explicitly saved (even as empty string ""), honor it!
  const getText = (key: string, fallback?: string): string => {
    if (content[key] !== undefined) {
      return content[key];
    }
    return fallback !== undefined ? fallback : (DEFAULT_CONTENT[key] ?? '');
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  return (
    <ContentContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        toggleEditMode,
        content,
        getText,
        updateText,
        resetAllContent,
        isEditorModalOpen,
        setIsEditorModalOpen,
      }}
    >
      {children}

      {/* Floating Toolbar when Edit Mode is Active */}
      {isEditMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A] border-2 border-[#FF6105] text-white px-5 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(255,97,5,0.4)] flex items-center gap-3.5 backdrop-blur-md animate-fadeIn text-xs font-mono-code">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6105] animate-ping" />
            <span className="font-bold text-[#FF6105] uppercase">Modo Edición Activo</span>
            <span className="hidden md:inline text-neutral-400">· Vaciar texto lo oculta de la presentación</span>
          </div>

          <div className="h-4 w-px bg-neutral-800" />

          <button
            onClick={() => setIsEditorModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white rounded-lg border border-neutral-700 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#FF6105]" />
            <span>Formulario Completo</span>
          </button>

          <button
            onClick={() => setIsEditMode(false)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FF6105] hover:bg-[#ff7524] text-black font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Guardar & Salir</span>
          </button>
        </div>
      )}
    </ContentContext.Provider>
  );
};

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

// Hook helper to conditionally check if a key has non-empty text
export function useHasText(key: string, defaultText: string = ''): boolean {
  const { isEditMode, getText } = useContent();
  if (isEditMode) return true;
  const val = getText(key, defaultText);
  return Boolean(val && val.trim().length > 0);
}

// In-situ editable text component helper with clean conditional rendering when empty
export const EditableText: React.FC<{
  contentKey: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  placeholder?: string;
}> = ({
  contentKey,
  defaultText,
  className = '',
  as: Component = 'span',
  placeholder = 'Haz clic para redactar...',
}) => {
  const { isEditMode, getText, updateText } = useContent();
  const rawText = getText(contentKey, defaultText);
  const isBlank = !rawText || rawText.trim().length === 0;

  // Clean conditional rendering in presentation mode: if empty, completely hide with no DOM remnants
  if (!isEditMode) {
    if (isBlank) return null;
    return <Component className={className}>{rawText}</Component>;
  }

  // In Edit Mode: show dashed box so presenter can click and write/restore text
  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const newText = e.currentTarget.textContent || '';
        const cleaned = newText === placeholder ? '' : newText.trim();
        updateText(contentKey, cleaned);
      }}
      className={`${className} outline-2 outline-dashed outline-[#FF6105] bg-[#FF6105]/15 rounded-md px-1.5 py-0.5 transition-all cursor-text relative group inline-block ${
        isBlank ? 'border border-dashed border-[#FF6105] bg-[#FF6105]/10 text-[#FF6105]/70 italic' : ''
      }`}
      title="Haz clic para editar in-situ. Si dejas el texto vacío, se ocultará automáticamente en la presentación."
    >
      {isBlank ? placeholder : rawText}
    </Component>
  );
};
