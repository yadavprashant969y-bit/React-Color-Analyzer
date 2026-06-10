import { useState } from 'react';
import { useColorStore } from '../store/useColorStore';
import { hexToRgb, rgbToHex, rgbToHsl, optimizeContrast } from '../lib/colorMath';
import { Download, ArrowLeftRight, Wand2, Trash2, Copy, Check, LayoutGrid } from 'lucide-react';
import { PaletteModal } from './PaletteModal';
import { PaletteGeneratorModal } from './PaletteGeneratorModal';

export function AnalyzerConsole() {
  const { 
    foregroundColor, backgroundColor, 
    setForegroundColor, setBackgroundColor, 
    swapColors, targetLevel,
    setTelemetry
  } = useColorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const handleOptimize = () => {
    const targetRatio = targetLevel === 'AAA' ? 7.0 : 4.5;
    const { hex, latency } = optimizeContrast(backgroundColor, foregroundColor, targetRatio);
    setForegroundColor(hex);
    setTelemetry({ latencyMs: latency });
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-800 p-4 border border-slate-700 rounded">
      {/* PaletteActionStrip */}
      <div className="flex gap-2 items-center flex-wrap border-b border-slate-700 pb-4">
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded border border-slate-600 transition-colors cursor-pointer">
          <Download size={14} /> Import Brand Palette Array
        </button>
        <button onClick={swapColors} className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded border border-slate-600 transition-colors">
          <ArrowLeftRight size={14} /> Swap Foreground/Background Channels
        </button>
        <button onClick={handleOptimize} className="flex items-center gap-1 bg-indigo-900 hover:bg-indigo-800 text-indigo-100 px-3 py-1 rounded border border-indigo-700 transition-colors cursor-pointer">
          <Wand2 size={14} /> Optimize Compliance Curve
        </button>
        <button onClick={() => setIsGeneratorOpen(true)} className="flex items-center gap-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 px-3 py-1 rounded border border-emerald-700 transition-colors cursor-pointer">
          <LayoutGrid size={14} /> Open Palette Generator
        </button>
        <button onClick={() => useColorStore.getState().flushCache()} className="flex items-center gap-1 bg-red-900 hover:bg-red-800 text-red-100 px-3 py-1 rounded border border-red-700 transition-colors md:ml-auto cursor-pointer">
          <Trash2 size={14} /> Flush Laboratory Cache
        </button>
      </div>

      {/* ColorPickerForm */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <ColorControl 
          label="Background Channel" 
          hex={backgroundColor} 
          onChange={setBackgroundColor} 
        />
        <ColorControl 
          label="Foreground Channel" 
          hex={foregroundColor} 
          onChange={setForegroundColor} 
        />
      </div>

      {isModalOpen && <PaletteModal onClose={() => setIsModalOpen(false)} />}
      {isGeneratorOpen && <PaletteGeneratorModal onClose={() => setIsGeneratorOpen(false)} />}
    </div>
  );
}

function ColorControl({ label, hex, onChange }: { label: string, hex: string, onChange: (val: string) => void }) {
  const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb);

  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const newRgb = { ...rgb, [channel]: val };
    onChange(rgbToHex(newRgb));
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="font-bold text-slate-300">{label}</div>
      <div className="flex gap-2 items-center">
        <div className="w-8 h-8 rounded border border-slate-500" style={{ backgroundColor: hex }}></div>
        <input 
          type="text" 
          value={hex} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-900 border border-slate-600 rounded px-2 py-1 uppercase font-mono w-24 text-center"
          maxLength={7}
        />
        <button onClick={handleCopy} className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded transition-colors cursor-pointer text-slate-400 hover:text-slate-200" title="Copy to clipboard">
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-1 items-center max-w-xs mt-2">
        <span>R</span>
        <input type="range" min="0" max="255" value={rgb.r} onChange={(e) => handleRgbChange('r', parseInt(e.target.value))} className="accent-red-500" />
        <span className="w-6 text-right">{rgb.r}</span>

        <span>G</span>
        <input type="range" min="0" max="255" value={rgb.g} onChange={(e) => handleRgbChange('g', parseInt(e.target.value))} className="accent-green-500" />
        <span className="w-6 text-right">{rgb.g}</span>

        <span>B</span>
        <input type="range" min="0" max="255" value={rgb.b} onChange={(e) => handleRgbChange('b', parseInt(e.target.value))} className="accent-blue-500" />
        <span className="w-6 text-right">{rgb.b}</span>
      </div>
      <div className="text-slate-400 mt-1">
        HSL Lightness Vector: {hsl.l.toFixed(1)}%
      </div>
    </div>
  );
}
