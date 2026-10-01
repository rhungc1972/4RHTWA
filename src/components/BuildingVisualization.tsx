import React, { useState, useEffect } from 'react';
import { Building2, Layers, CheckCircle2, Camera, Image as ImageIcon, Upload, Eye } from 'lucide-react';
import { FloorStatus } from '../types';

interface BuildingVisualizationProps {
  mode: 'traditional' | 'tokenized' | 'absorption';
  floors?: FloorStatus[];
  m2Absorbed?: number;
  tokensSubscribed?: number;
}

const DEFAULT_PROJECT_PHOTO = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

export const BuildingVisualization: React.FC<BuildingVisualizationProps> = ({
  mode,
  floors = [],
  m2Absorbed = 0,
  tokensSubscribed = 0,
}) => {
  const [viewStyle, setViewStyle] = useState<'blueprint' | 'photo'>('blueprint');
  const [projectPhoto, setProjectPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('rwa_project_photo_url') || DEFAULT_PROJECT_PHOTO;
    } catch {
      return DEFAULT_PROJECT_PHOTO;
    }
  });

  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  // 10 floors, represented top to bottom (Floor 10 down to Floor 1)
  const floorList = Array.from({ length: 10 }, (_, i) => 10 - i);

  const handleSaveCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhotoInput.trim()) return;
    setProjectPhoto(customPhotoInput.trim());
    try {
      localStorage.setItem('rwa_project_photo_url', customPhotoInput.trim());
    } catch {}
    setIsChangingPhoto(false);
    setCustomPhotoInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setProjectPhoto(base64);
        try {
          localStorage.setItem('rwa_project_photo_url', base64);
        } catch {}
        setIsChangingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center select-none text-white">
      {/* Visual Header & Toggle */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#FF6105]" />
          <span className="text-xs font-heading font-bold uppercase tracking-wider text-white">
            Proyecto Inmobiliario RH-RWA
          </span>
        </div>

        {/* Blueprint vs Photo Switcher */}
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-[10px] font-mono-code">
          <button
            type="button"
            onClick={() => setViewStyle('blueprint')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              viewStyle === 'blueprint'
                ? 'bg-[#FF6105] text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Blueprint
          </button>
          <button
            type="button"
            onClick={() => setViewStyle('photo')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              viewStyle === 'photo'
                ? 'bg-[#FF6105] text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>Foto</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      {viewStyle === 'photo' ? (
        /* Real Project Photograph Showcase */
        <div className="w-full bg-[#0A0A0A] rounded-2xl border border-neutral-800 p-3 shadow-xl space-y-3 relative overflow-hidden group">
          <div className="relative h-80 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
            <img
              src={projectPhoto}
              alt="Proyecto Inmobiliario RH-RWA"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

            {/* Top Badges on photo */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono-code font-bold text-[#FF6105] border border-[#FF6105]/40">
                10 Pisos · 1.000 m²
              </span>
              <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono-code text-white border border-neutral-700">
                Valoración: $1.000.000 USD
              </span>
            </div>

            {/* Bottom info banner on photo */}
            <div className="absolute bottom-3 inset-x-3 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold text-white uppercase tracking-tight">
                  Torre Residencial RH-RWA
                </span>
                <span className="text-[11px] font-mono-code font-bold text-[#FF6105]">
                  {tokensSubscribed.toLocaleString()} / 100.000 Tokens
                </span>
              </div>
              <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#FF6105] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (tokensSubscribed / 100000) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-code text-neutral-400">
                <span>Superficie: {m2Absorbed} m² suscritos</span>
                <span className="text-emerald-400">1 Token = 0,01 m²</span>
              </div>
            </div>
          </div>

          {/* Change Photo Toggle */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-neutral-500 font-mono-code">
              Fotografía real o render del proyecto
            </span>
            <button
              type="button"
              onClick={() => setIsChangingPhoto(!isChangingPhoto)}
              className="text-[11px] font-mono-code text-[#FF6105] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>{isChangingPhoto ? 'Cerrar' : 'Cambiar Fotografía'}</span>
            </button>
          </div>

          {/* Inline Photo Editor */}
          {isChangingPhoto && (
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 text-xs font-mono-code animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300 font-bold">Actualizar Imagen:</span>
                <label className="text-[10px] text-[#FF6105] bg-neutral-900 px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800 cursor-pointer">
                  Subir archivo local
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <form onSubmit={handleSaveCustomPhoto} className="flex gap-2">
                <input
                  type="url"
                  placeholder="O pega URL de imagen..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="flex-1 bg-black border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-[#FF6105]"
                />
                <button
                  type="submit"
                  disabled={!customPhotoInput.trim()}
                  className="px-3 py-1.5 bg-[#FF6105] hover:bg-[#ff7524] text-black font-bold text-xs rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Fijar
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Blueprint View */
        <div className="w-full bg-[#0A0A0A] p-4 rounded-2xl border border-neutral-800 shadow-xl relative overflow-hidden">
          {/* Background Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #333333 1px, transparent 1px), linear-gradient(to bottom, #333333 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          {/* Roof Structure */}
          <div className="relative z-10 w-full flex flex-col items-center mb-1">
            <div className="w-24 h-4 bg-[#141414] rounded-t-sm border border-neutral-800 border-b-0 flex items-center justify-center">
              <span className="text-[8px] text-[#FF6105] font-mono-code font-bold">AZOTEA / RWA</span>
            </div>
            <div className="w-48 h-1.5 bg-neutral-800 rounded-t-xs" />
          </div>

          {/* 10 Floor Stack */}
          <div className="relative z-10 flex flex-col gap-1.5 w-full">
            {floorList.map((floorNum) => {
              const floorData = floors.find((f) => f.floor === floorNum);
              const percent = floorData ? floorData.percent : 0;
              const isCompleted = percent >= 100;
              const isCurrent = percent > 0 && percent < 100;

              if (mode === 'absorption') {
                return (
                  <div
                    key={floorNum}
                    className={`relative rounded-xl border px-3 py-2 transition-all duration-500 flex items-center justify-between ${
                      isCompleted
                        ? 'bg-neutral-900 border-[#FF6105] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-neutral-900/90 border-[#FF6105]/70 text-white ring-1 ring-[#FF6105]/50'
                        : 'bg-neutral-950 border-neutral-800/80 text-neutral-400'
                    }`}
                  >
                    {/* Progress Fill bar behind */}
                    <div
                      className="absolute inset-y-0 left-0 bg-[#FF6105]/20 rounded-xl transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />

                    {/* Floor Info Left */}
                    <div className="relative z-10 flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono-code text-xs font-bold ${
                          isCompleted
                            ? 'bg-[#FF6105] text-black font-extrabold'
                            : isCurrent
                            ? 'bg-white text-black'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {floorNum}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Piso {floorNum} · 100 m²
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono-code">
                          10.000 Tokens RWA ($100.000 USD)
                        </div>
                      </div>
                    </div>

                    {/* Status Right */}
                    <div className="relative z-10 text-right">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6105] bg-[#FF6105]/15 px-2 py-0.5 rounded-md border border-[#FF6105]/40 font-mono-code">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          100% Absorvido
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/20 font-mono-code animate-pulse">
                          {percent}% en curso
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono-code text-neutral-500">
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (mode === 'tokenized') {
                return (
                  <div
                    key={floorNum}
                    className="relative rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 shadow-xs flex items-center justify-between overflow-hidden group hover:border-[#FF6105] transition-all"
                  >
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-neutral-800 text-white group-hover:bg-[#FF6105] group-hover:text-black flex items-center justify-center font-mono-code text-xs font-bold transition-colors">
                        {floorNum}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white">Piso {floorNum}</span>
                        <span className="text-[11px] text-[#FF6105] font-mono-code font-semibold ml-2">
                          = 10.000 Tokens ($10 c/u)
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-800 font-semibold">
                        100 m² · Fraccionable
                      </span>
                    </div>
                  </div>
                );
              }

              // Traditional mode
              return (
                <div
                  key={floorNum}
                  className="relative rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center font-mono-code text-xs font-bold">
                      {floorNum}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Apartamento Piso {floorNum}</div>
                      <div className="text-[10px] text-neutral-400 font-mono-code">
                        Unidad indivisible · 100 m²
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-white block font-mono-code">
                      $100.000 USD
                    </span>
                    <span className="text-[10px] text-red-400 font-medium">
                      Entrada mín: $10.000 USD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ground Foundation */}
          <div className="relative z-10 mt-3 pt-3 border-t-2 border-dashed border-neutral-800 w-full flex items-center justify-between text-xs text-neutral-400 font-mono-code">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#FF6105]" />
              <span className="font-semibold text-neutral-300">Terreno Urbano Titulado</span>
            </div>
            <span className="text-[11px] text-neutral-400">
              Valor Suelo + Obra: $1.000.000 USD
            </span>
          </div>
        </div>
      )}

      {/* Absorption Live Counter footer */}
      {mode === 'absorption' && (
        <div className="w-full mt-3 bg-[#0A0A0A] text-white p-3 rounded-2xl border border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono-code">
              Metros Cuadrados Fondeados
            </div>
            <div className="text-base sm:text-lg font-bold text-[#FF6105] font-mono-code">
              {m2Absorbed} m² <span className="text-xs font-normal text-neutral-500">/ 1.000 m²</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-neutral-400 uppercase font-mono-code">
              Tokens Emitidos
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono-code">
              {tokensSubscribed.toLocaleString('es-ES')}{' '}
              <span className="text-xs font-normal text-neutral-500">/ 100.000</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
