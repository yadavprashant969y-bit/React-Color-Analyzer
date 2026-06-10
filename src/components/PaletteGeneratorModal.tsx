import { useState } from 'react';
import { useColorStore } from '../store/useColorStore';
import { generateMonochromatic, generateAnalogous, generateComplementary, calculateContrast, calculateAPCA } from '../lib/colorMath';
import { X, Check } from 'lucide-react';

export function PaletteGeneratorModal({ onClose }: { onClose: () => void }) {
  const { foregroundColor, contrastMethod } = useColorStore();
  const [baseHex, setBaseHex] = useState(foregroundColor);
  const [paletteType, setPaletteType] = useState<'mono' | 'analogous' | 'complementary'>('analogous');

  let palette: string[] = [];
  if (paletteType === 'mono') palette = generateMonochromatic(baseHex);
  else if (paletteType === 'analogous') palette = generateAnalogous(baseHex);
  else if (paletteType === 'complementary') palette = generateComplementary(baseHex);

  const isWCAG2 = contrastMethod === 'WCAG2';

  const getContrast = (bg: string, fg: string) => {
    return isWCAG2 ? calculateContrast(bg, fg) : calculateAPCA(bg, fg);
  };

  const isPassing = (score: number) => {
    return isWCAG2 ? score >= 4.5 : score >= 60;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <h2 className="text-xl font-bold text-slate-200">Palette Generator & Contrast Matrix</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Base Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={baseHex} onChange={e => setBaseHex(e.target.value)} className="w-10 h-10 bg-transparent cursor-pointer" />
              <input type="text" value={baseHex} onChange={e => setBaseHex(e.target.value)} className="bg-slate-900 border border-slate-600 rounded px-3 py-2 uppercase font-mono w-28 text-center" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Harmony Type</label>
            <select value={paletteType} onChange={e => setPaletteType(e.target.value as "mono" | "analogous" | "complementary")} className="bg-slate-900 border border-slate-600 rounded px-3 py-2 outline-none cursor-pointer">
              <option value="mono">Monochromatic</option>
              <option value="analogous">Analogous</option>
              <option value="complementary">Complementary</option>
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Generated Palette</h3>
          <div className="flex gap-2 h-16 w-full rounded overflow-hidden border border-slate-700">
            {palette.map((hex, i) => (
              <div key={i} className="flex-1 flex items-end justify-center pb-2 text-xs font-mono font-bold shadow-inner" style={{ backgroundColor: hex, color: calculateContrast(hex, '#FFFFFF') > 3 ? '#FFFFFF' : '#000000' }}>
                {hex}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
            Contrast Matrix ({isWCAG2 ? 'WCAG 2.1 Ratio' : 'APCA Lc Score'})
          </h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-700 bg-slate-900 text-left text-slate-400 font-normal">Bg \ Fg</th>
                  {palette.map((hex, i) => (
                    <th key={i} className="p-2 border border-slate-700 text-center font-mono" style={{ backgroundColor: hex, color: calculateContrast(hex, '#FFFFFF') > 3 ? '#FFFFFF' : '#000000' }}>{hex}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {palette.map((bgHex, rowIdx) => (
                  <tr key={rowIdx}>
                    <th className="p-2 border border-slate-700 text-left font-mono" style={{ backgroundColor: bgHex, color: calculateContrast(bgHex, '#FFFFFF') > 3 ? '#FFFFFF' : '#000000' }}>{bgHex}</th>
                    {palette.map((fgHex, colIdx) => {
                      const score = getContrast(bgHex, fgHex);
                      const pass = isPassing(score);
                      const isSame = bgHex.toLowerCase() === fgHex.toLowerCase();
                      
                      return (
                        <td key={colIdx} className={`p-2 border border-slate-700 text-center relative ${isSame ? 'bg-slate-800' : 'bg-slate-900'}`}>
                          {isSame ? (
                            <span className="text-slate-600">-</span>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-mono font-bold ${pass ? 'text-green-400' : 'text-red-400'}`}>
                                {isWCAG2 ? score.toFixed(2) : score.toFixed(1)}
                              </span>
                              {pass && <Check size={12} className="text-green-500 absolute top-1 right-1 opacity-50" />}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
