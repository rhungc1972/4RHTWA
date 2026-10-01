import React, { useState } from 'react';
import { X, Save, RotateCcw, Edit3, Check, Sparkles } from 'lucide-react';
import { useContent, DEFAULT_CONTENT } from '../context/ContentContext';

export const ContentEditorModal: React.FC = () => {
  const { isEditorModalOpen, setIsEditorModalOpen, content, updateText, resetAllContent } = useContent();
  const [formData, setFormData] = useState<Record<string, string>>({ ...content });
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isEditorModalOpen) return null;

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restaurar todos los textos predeterminados de la conferencia?')) {
      resetAllContent();
      setFormData({ ...DEFAULT_CONTENT });
    }
  };

  const fields = [
    { key: 'phase1_title', label: 'Fase 1 · Título Principal' },
    { key: 'phase1_question', label: 'Fase 1 · Pregunta Central al Auditorio' },
    { key: 'phase1_subtitle', label: 'Fase 1 · Subtítulo / Contexto' },
    { key: 'phase1_quote', label: 'Fase 1 · Cita Doctrinal' },
    { key: 'phase2_title', label: 'Fase 2 · Título Diagnóstico' },
    { key: 'phase2_subtitle', label: 'Fase 2 · Subtítulo Brecha Tradicional' },
    { key: 'phase2_threshold_desc', label: 'Fase 2 · Explicación Barrera $10.000 USD' },
    { key: 'phase3_title', label: 'Fase 3 · Título Tokenización' },
    { key: 'phase3_subtitle', label: 'Fase 3 · Protocolo & Smart Contracts' },
    { key: 'phase4_title', label: 'Fase 4 · Título Democratización' },
    { key: 'phase4_subtitle', label: 'Fase 4 · Co-propiedad Líquida' },
    { key: 'phase5_title', label: 'Fase 5 · Título Dashboard & Cierre' },
    { key: 'phase5_subtitle', label: 'Fase 5 · Síntesis y Resultados' },
    { key: 'closing_statement', label: 'Mensaje Institucional Roberto Hung' },
    { key: 'gratitude_message', label: 'Mensaje de Clausura y Gratitud' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn select-none text-white">
      <div className="bg-[#0A0A0A] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-800 relative text-white my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#FF6105] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF6105]/15 border border-[#FF6105]/30 flex items-center justify-center text-[#FF6105]">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-bold text-white uppercase tracking-tight">
                Editor In-Situ de Textos de Conferencia
              </h2>
              <p className="text-xs text-neutral-400 font-mono-code">
                Personaliza títulos, preguntas y citas. Se mantendrán guardados en tu navegador.
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

        {/* Form Body */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs font-mono-code">
          {fields.map(({ key, label }) => (
            <div key={key} className="space-y-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                {label}
              </label>
              <textarea
                rows={2}
                value={formData[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full p-2.5 rounded-lg bg-black border border-neutral-800 focus:border-[#FF6105] text-xs text-white outline-hidden resize-none transition-all"
              />
            </div>
          ))}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3 sticky bottom-0 bg-[#0A0A0A] py-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Valores por Defecto</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditorModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-300 text-xs cursor-pointer"
              >
                Cerrar
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
                    <span>Guardar Textos</span>
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
