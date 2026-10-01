import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Edit3, Check, Sparkles, X, Save } from 'lucide-react';

export interface ContentDictionary {
  [key: string]: string;
}

export const DEFAULT_CONTENT: ContentDictionary = {
  phase1_badge: 'Conferencia Magistral · Roberto Hung',
  phase1_title: '¿Sabes lo que es la tokenización de activos del mundo real (RWA)?',
  phase1_subtitle: 'Escanea el código con la cámara de tu teléfono para participar en tiempo real desde tu asiento en la sala.',
  phase1_question: '¿Cuánto capital estarías dispuesto a aportar en este proyecto inmobiliario?',
  phase1_quote: 'La propiedad formal no es simplemente un título, es el proceso que transforma activos dispersos en capital productivo.',
  phase2_badge: 'Fase 2 de 5 · Diagnóstico Analítico en Directo',
  phase2_title: 'Diagnóstico del Capital Paralizado: La Brecha de Exclusión',
  phase2_subtitle: 'Visualización empírica de cómo la barrera tradicional ($10.000 USD por cuota indivisa) trunca la movilización del ahorro privado en el propio auditorio, dejando al promotor con un severo déficit de financiación.',
  phase2_threshold_desc: 'Barrera de entrada tradicional: $10.000 USD. Quien dispone de menos queda excluido sin acceso al rendimiento.',
  phase3_title: 'Protocolo de Tokenización & Smart Contracts',
  phase3_subtitle: 'División molecular del activo en 100.000 tokens ERC-20 respaldados por alícuotas jurídicas reales',
  phase4_title: 'Democratización & Co-propiedad Líquida',
  phase4_subtitle: 'Absorción colectiva del edificio piso por piso: democratización desde $10 USD por token',
  phase5_title: 'Evaluación, Síntesis & Dossier Final',
  phase5_subtitle: 'Computación en tiempo real del auditorio y consolidación empírica',
  closing_statement: 'Roberto Hung ha desarrollado esta aplicación interactiva para la divulgación del fenómeno y cultura de la tokenización de activos del mundo real (RWA)',
  gratitude_message: 'Agradecemos profundamente su activa participación en esta sesión de inmersión en la economía tokenizada.',
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

  const getText = (key: string, fallback?: string): string => {
    return content[key] ?? fallback ?? DEFAULT_CONTENT[key] ?? '';
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
            <span className="hidden md:inline text-neutral-400">· Haz clic en textos para editarlos</span>
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

// In-situ editable text component helper
export const EditableText: React.FC<{
  contentKey: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}> = ({ contentKey, defaultText, className = '', as: Component = 'span' }) => {
  const { isEditMode, getText, updateText } = useContent();
  const textValue = getText(contentKey, defaultText);

  if (!isEditMode) {
    return <Component className={className}>{textValue}</Component>;
  }

  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const newText = e.currentTarget.textContent || '';
        updateText(contentKey, newText.trim());
      }}
      className={`${className} outline-2 outline-dashed outline-[#FF6105] bg-[#FF6105]/15 rounded-md px-1.5 py-0.5 transition-all cursor-text relative group inline-block`}
      title="Haz clic para editar este texto in-situ"
    >
      {textValue}
    </Component>
  );
};
