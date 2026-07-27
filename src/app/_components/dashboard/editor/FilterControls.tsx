"use client";

export interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  bgBoost: number;
}

interface FilterControlsProps {
  zoom: number;
  minZoom: number;
  onZoomChange: (zoom: number) => void;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  filters: Filters;
  onFiltersChange: (updater: (prev: Filters) => Filters) => void;
}

export function FilterControls({
  zoom,
  minZoom,
  onZoomChange,
  rotation,
  onRotationChange,
  filters,
  onFiltersChange,
}: FilterControlsProps) {
  const setFilter = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onFiltersChange((prev) => ({ ...prev, [key]: parseInt(e.target.value) }));

  return (
    <div className="space-y-6 pt-4 border-t border-slate-100">
      <h3 className="font-sans text-sm font-semibold text-heading pb-2">Position & Size</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <label htmlFor="editor-zoom">Zoom</label>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <input
            id="editor-zoom"
            name="editor-zoom"
            type="range"
            min={minZoom}
            max="4"
            step="0.02"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-full accent-primary bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <label htmlFor="editor-rotation">Straighten</label>
            <span>{rotation}°</span>
          </div>
          <input
            id="editor-rotation"
            name="editor-rotation"
            type="range"
            min="-180"
            max="180"
            step="1"
            value={rotation}
            onChange={(e) => onRotationChange(parseInt(e.target.value))}
            className="w-full accent-primary bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>
      </div>

      <h3 className="font-sans text-sm font-semibold text-heading pb-2 pt-2 border-t border-slate-50">Lighting</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <label htmlFor="editor-brightness">Brightness</label>
            <span>{filters.brightness}%</span>
          </div>
          <input
            id="editor-brightness"
            name="editor-brightness"
            type="range"
            min="60"
            max="140"
            value={filters.brightness}
            onChange={setFilter("brightness")}
            className="w-full accent-primary bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <label htmlFor="editor-contrast">Contrast</label>
            <span>{filters.contrast}%</span>
          </div>
          <input
            id="editor-contrast"
            name="editor-contrast"
            type="range"
            min="60"
            max="140"
            value={filters.contrast}
            onChange={setFilter("contrast")}
            className="w-full accent-primary bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <label htmlFor="editor-warmth">Warmth</label>
            <span>{filters.warmth > 0 ? `+${filters.warmth}` : filters.warmth}</span>
          </div>
          <input
            id="editor-warmth"
            name="editor-warmth"
            type="range"
            min="-25"
            max="25"
            value={filters.warmth}
            onChange={setFilter("warmth")}
            className="w-full accent-primary bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <label htmlFor="editor-background">Brighten Background</label>
            <span>{filters.bgBoost}%</span>
          </div>
          <input
            id="editor-background"
            name="editor-background"
            type="range"
            min="0"
            max="100"
            value={filters.bgBoost}
            onChange={setFilter("bgBoost")}
            className="w-full accent-primary bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
