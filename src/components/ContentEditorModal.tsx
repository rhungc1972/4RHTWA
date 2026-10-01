import React, { useState } from 'react';
import { X, Save, RotateCcw, Edit3, Check, Sparkles, Trash2, Eye, EyeOff } from 'lucide-react';
import { useContent, DEFAULT_CONTENT } from '../context/ContentContext';

interface PhaseGroup {
  id: string;
  name: string;
  fields: { key: string; label: string; placeholder?: string }[];
}

const PHASE_GROUPS: PhaseGroup[] = [
  {
    id: 'fase1',
    name: 'Fase 1: Apertura & QR',
    fields: [
      { key: 'phase1_badge', label: 'Insignia Superior', placeholder: 'Conferencia Magistral · Roberto Hung' },
      { key: 'phase1_speaker', label: 'Nombre del Ponente', placeholder: 'Roberto Hung Cavalieri' },
      { key: 'phase1_link', label: 'Enlace Web Oficial', placeholder: 'www.robertohung.com' },
      { key: 'phase1_hashtag', label: 'Hashtag Institucional', placeholder: '#ElDerechoDeHacerRuido' },
      { key: 'phase1_tagline', label: 'Etiqueta de Experiencia', placeholder: 'Experiencia Interactiva en Tiempo Real' },
      { key: 'phase1_title', label: 'Pregunta Central de Apertura', placeholder: '¿Sabes lo que es la tokenización de activos del mundo real (RWA)?' },
      { key: 'phase1_subtitle', label: 'Subtítulo / Contexto Inicial', placeholder: 'Roberto Hung desarrolló esta experiencia interactiva...' },
      { key: 'phase1_qr_card_title', label: 'Título Tarjeta QR', placeholder: 'Acceso Interactivo en Sala' },
      { key: 'phase1_qr_instruction', label: 'Instrucción de Escaneo', placeholder: 'Escanea el código con la cámara de tu teléfono...' },
      { key: 'phase1_qr_note', label: 'Nota bajo el QR', placeholder: '* El código QR se mantendrá visible para quienes entren más tarde.' },
    ],
  },
  {
    id: 'fase2',
    name: 'Fase 2: Diagnóstico',
    fields: [
      { key: 'phase2_badge', label: 'Insignia de Fase', placeholder: 'Fase 2 de 5 · Diagnóstico Analítico en Directo' },
      { key: 'phase2_hashtag', label: 'Hashtag y Ponente', placeholder: '#ElDerechoDeHacerRuido · Roberto Hung Cavalieri' },
      { key: 'phase2_title', label: 'Título de la Brecha de Exclusión', placeholder: 'Diagnóstico del Capital Paralizado: La Brecha de Exclusión' },
      { key: 'phase2_subtitle', label: 'Subtítulo Doctrinal', placeholder: 'Visualización empírica de cómo la barrera tradicional...' },
      { key: 'phase2_project_title', label: 'Título del Proyecto Inmobiliario', placeholder: 'Torre Residencial RH-RWA · 10 Pisos · 1.000 m²' },
      { key: 'phase2_project_subtitle', label: 'Valuación y Ticket del Proyecto', placeholder: 'Valuación Obra: $1.000.000 USD · Ticket Mínimo Tradicional: $10.000 USD' },
      { key: 'phase2_theory_title', label: 'Título Doctrina Hernando de Soto', placeholder: 'Fundamento Teórico: El Capital Inmóvil (Hernando de Soto)' },
      { key: 'phase2_theory_desc', label: 'Texto Doctrinal Hernando de Soto', placeholder: 'Sin vehículos de titulación líquida...' },
      { key: 'phase2_metric_qualified_label', label: 'Etiqueta Capital Capturado', placeholder: 'Capital Capturado (Tradicional)' },
      { key: 'phase2_metric_excluded_label', label: 'Etiqueta Capital Excluido', placeholder: 'Capital Excluido / Bloqueado' },
      { key: 'phase2_metric_deficit_label', label: 'Etiqueta Déficit Promotor', placeholder: 'Déficit de Financiación del Promotor' },
    ],
  },
  {
    id: 'fase3',
    name: 'Fase 3: Tokenización',
    fields: [
      { key: 'phase3_badge', label: 'Insignia de Fase', placeholder: 'Fase 3 de 5 · Arquitectura del Protocolo RWA' },
      { key: 'phase3_hashtag', label: 'Hashtag y Ponente', placeholder: '#ElDerechoDeHacerRuido · Roberto Hung Cavalieri' },
      { key: 'phase3_title', label: 'Título Protocolo de Tokenización', placeholder: 'Protocolo de Tokenización: Especificaciones & Emisión' },
      { key: 'phase3_subtitle', label: 'Subtítulo Subdivisión Matemática', placeholder: 'Subdivisión matemática y contractual de la Torre...' },
      { key: 'phase3_legal_title', label: 'Título Certeza Jurídica', placeholder: 'Certeza Jurídica & Smart Contract:' },
      { key: 'phase3_legal_desc', label: 'Descripción Jurídica SPV/Fideicomiso', placeholder: 'Cada token representa una alícuota patrimonial...' },
      { key: 'phase3_specs_title', label: 'Título Especificaciones RWA', placeholder: 'Especificaciones de la Tokenización RH-RWA' },
      { key: 'phase3_math_title', label: 'Subdivisión Matemática', placeholder: 'Subdivisión Matemática del Inmueble' },
      { key: 'phase3_math_headline', label: 'Emisión Total de Tokens', placeholder: '100.000 Tokens' },
      { key: 'phase3_math_subtitle', label: 'Precio Unitario por Token', placeholder: 'Precio unitario: $10 USD por token fungible' },
      { key: 'phase3_equiv_1', label: 'Equivalencia 1', placeholder: '1 Token ($10 USD) = 0,01 m²' },
      { key: 'phase3_equiv_2', label: 'Equivalencia 2', placeholder: '10 Tokens ($100 USD) = 0,10 m²' },
      { key: 'phase3_equiv_3', label: 'Equivalencia 3', placeholder: '100 Tokens ($1.000 USD) = 1,00 m² Habitable' },
      { key: 'phase3_equiv_4', label: 'Equivalencia 4', placeholder: '10.000 Tokens ($100.000 USD) = 1 Piso Completo (100 m²)' },
    ],
  },
  {
    id: 'fase4',
    name: 'Fase 4: Democratización',
    fields: [
      { key: 'phase4_badge', label: 'Insignia de Fase', placeholder: 'Fase 4 de 5 · Estudio Comparativo & Pilares Doctrinales' },
      { key: 'phase4_title', label: 'Título Comparativa de Modelos', placeholder: 'Comparativa: Modelo Tradicional vs Tokenizado RWA' },
      { key: 'phase4_subtitle', label: 'Subtítulo Comparativa', placeholder: 'Contraste empírico entre el esquema tradicional...' },
      { key: 'phase4_trad_title', label: 'Nombre Modelo Tradicional', placeholder: 'Modelo Tradicional (Cerrado)' },
      { key: 'phase4_trad_ticket', label: 'Barrera Tradicional', placeholder: 'Ticket: ≥ $10.000 USD' },
      { key: 'phase4_rwa_title', label: 'Nombre Modelo Tokenizado', placeholder: 'Modelo Tokenizado RWA (Abierto)' },
      { key: 'phase4_rwa_ticket', label: 'Acceso Tokenizado', placeholder: 'Ticket: Desde $10 USD' },
      { key: 'phase4_p1_title', label: 'Pilar 1: Título', placeholder: '01. Gobernanza On-Chain' },
      { key: 'phase4_p1_desc', label: 'Pilar 1: Resumen', placeholder: 'Voto proporcional directo para elegir administración...' },
      { key: 'phase4_p1_legal', label: 'Pilar 1: Base Jurídica', placeholder: 'Democracia accionaria digital sin asambleas presenciales...' },
      { key: 'phase4_p2_title', label: 'Pilar 2: Título', placeholder: '02. Rentas Automáticas' },
      { key: 'phase4_p2_desc', label: 'Pilar 2: Resumen', placeholder: 'Dispersión directa a la wallet en stablecoins...' },
      { key: 'phase4_p2_legal', label: 'Pilar 2: Base Jurídica', placeholder: 'Ejecución contractual auto-liquidable...' },
      { key: 'phase4_p3_title', label: 'Pilar 3: Título', placeholder: '03. Liquidez Inmediata (24/7)' },
      { key: 'phase4_p3_desc', label: 'Pilar 3: Resumen', placeholder: 'Mercado secundario de tokens continuo...' },
      { key: 'phase4_p3_legal', label: 'Pilar 3: Base Jurídica', placeholder: 'Circulación desintermediada de alícuotas...' },
      { key: 'phase4_p4_title', label: 'Pilar 4: Título', placeholder: '04. Colateral & Financiación' },
      { key: 'phase4_p4_desc', label: 'Pilar 4: Resumen', placeholder: 'Uso de tokens inmobiliarios como garantía...' },
      { key: 'phase4_p4_legal', label: 'Pilar 4: Base Jurídica', placeholder: 'Pignoración digital de títulos de copropiedad...' },
      { key: 'phase4_p5_title', label: 'Pilar 5: Título', placeholder: '05. Tránsito Negocial Transparente' },
      { key: 'phase4_p5_desc', label: 'Pilar 5: Resumen', placeholder: 'Transmisión verificable, eficaz, económica...' },
      { key: 'phase4_p5_legal', label: 'Pilar 5: Base Jurídica', placeholder: 'Inmutabilidad registral en blockchain...' },
      { key: 'phase4_p6_title', label: 'Pilar 6: Título', placeholder: '06. Despertar del Capital Muerto' },
      { key: 'phase4_p6_desc', label: 'Pilar 6: Resumen', placeholder: 'Doctrina Hernando de Soto: transformar bienes estáticos...' },
      { key: 'phase4_p6_legal', label: 'Pilar 6: Base Jurídica', placeholder: 'Democratización real del ahorro popular...' },
    ],
  },
  {
    id: 'fase5',
    name: 'Fase 5: Dashboard & Cierre',
    fields: [
      { key: 'phase5_badge', label: 'Insignia de Fase', placeholder: 'Fase 5 de 5 · Evaluación, Gráficos Circulares & Dossier Final' },
      { key: 'phase5_title', label: 'Título del Dashboard', placeholder: 'Dashboard Analítico: Fotografías, Métricas & Percepción' },
      { key: 'phase5_subtitle', label: 'Subtítulo del Dashboard', placeholder: 'Consolidación empírica en tiempo real...' },
      { key: 'phase5_sec_photos', label: 'Sección 1: Fotografías', placeholder: '1. Registro Fotográfico y Gemelo Digital del Inmueble' },
      { key: 'phase5_sec_charts', label: 'Sección 2: Gráficos Circulares', placeholder: '2. Comparativa Empírica: Gráficos Circulares de Absorción' },
      { key: 'phase5_sec_satisfaction', label: 'Sección 3: Satisfacción & NPS', placeholder: '3. Métrica de Calidad, Claridad Doctrinal y Net Promoter Score (NPS)' },
      { key: 'phase5_sec_topics', label: 'Sección 4: Temas de Interés', placeholder: '4. Interés Temático del Auditorio para Próximas Sesiones' },
      { key: 'phase5_sec_comments', label: 'Sección 5: Feed de Citas', placeholder: '5. Feed de Participación y Citas del Auditorio' },
      { key: 'closing_statement', label: 'Mensaje de Clausura Doctrinal', placeholder: '“Agradecemos profundamente su activa participación...”' },
      { key: 'closing_speaker', label: 'Firma y Créditos de Clausura', placeholder: 'Roberto Hung Cavalieri · #ElDerechoDeHacerRuido · www.robertohung.com' },
    ],
  },
];

export const ContentEditorModal: React.FC = () => {
  const { isEditorModalOpen, setIsEditorModalOpen, content, updateText, resetAllContent } = useContent();
  const [formData, setFormData] = useState<Record<string, string>>(() => ({ ...content }));
  const [activeTab, setActiveTab] = useState<string>('fase1');
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isEditorModalOpen) return null;

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearField = (key: string) => {
    setFormData((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(formData).forEach(([k, v]) => {
      updateText(k, v);
    });
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      setIsEditorModalOpen(false);
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restaurar todos los textos predeterminados de la conferencia?')) {
      resetAllContent();
      setFormData({ ...DEFAULT_CONTENT });
    }
  };

  const currentGroup = PHASE_GROUPS.find((g) => g.id === activeTab) || PHASE_GROUPS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn select-none text-white">
      <div className="bg-[#0A0A0A] rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-neutral-800 relative text-white my-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#FF6105] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5 mb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF6105]/15 border border-[#FF6105]/30 flex items-center justify-center text-[#FF6105]">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-white uppercase tracking-tight">
                Gestor Integral de Textos & Modo Minimalista
              </h2>
              <p className="text-xs text-neutral-400 font-mono-code">
                Cualquier campo dejado en blanco se ocultará limpiamente sin dejar espacios residuales.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditorModalOpen(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 shrink-0 border-b border-neutral-900 text-xs font-mono-code">
          {PHASE_GROUPS.map((group) => {
            const isActive = activeTab === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveTab(group.id)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#FF6105] text-black font-bold shadow-md'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>

        {/* Form Body for Selected Phase */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto pr-2 space-y-3.5 text-xs font-mono-code">
          {currentGroup.fields.map(({ key, label, placeholder }) => {
            const currentVal = formData[key] !== undefined ? formData[key] : (DEFAULT_CONTENT[key] ?? '');
            const isBlank = !currentVal || currentVal.trim().length === 0;

            return (
              <div
                key={key}
                className={`space-y-1.5 p-3 rounded-xl border transition-all ${
                  isBlank
                    ? 'bg-neutral-950/40 border-neutral-900 opacity-75'
                    : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{label}</span>
                    {isBlank && (
                      <span className="text-[10px] text-amber-500 font-mono-code font-normal">
                        (Oculto en presentación)
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-1.5">
                    {isBlank ? (
                      <button
                        type="button"
                        onClick={() => handleChange(key, DEFAULT_CONTENT[key] || '')}
                        className="text-[10px] text-neutral-400 hover:text-[#FF6105] underline cursor-pointer"
                      >
                        Restaurar original
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClearField(key)}
                        className="text-[10px] text-neutral-500 hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
                        title="Vaciar este campo para ocultarlo de la diapositiva"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Ocultar (Vaciar)</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={currentVal.length > 90 ? 3 : 2}
                  value={currentVal}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder || 'Escribe el texto o deja en blanco para ocultar...'}
                  className="w-full p-2.5 rounded-lg bg-black border border-neutral-800 focus:border-[#FF6105] text-xs text-white outline-hidden resize-none transition-all placeholder:text-neutral-600 font-sans"
                />
              </div>
            );
          })}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3 sticky bottom-0 bg-[#0A0A0A] py-2 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Valores por Defecto</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditorModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-300 text-xs cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#FF6105] hover:bg-[#ff7524] text-black font-bold uppercase text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                {savedFeedback ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>¡Guardado con Éxito!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Todos los Textos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
