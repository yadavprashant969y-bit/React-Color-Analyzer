import { useColorStore } from '../store/useColorStore';
import { X } from 'lucide-react';

const PRESET_PALETTES = [
  { name: 'Dracula', bg: '#282a36', fg: '#f8f8f2' },
  { name: 'Solarized Dark', bg: '#002b36', fg: '#839496' },
  { name: 'Solarized Light', bg: '#fdf6e3', fg: '#657b83' },
  { name: 'High-Contrast Terminal', bg: '#000000', fg: '#00ff00' },
  { name: 'Corporate Blue', bg: '#0f172a', fg: '#e2e8f0' },
  { name: 'Gruvbox Dark', bg: '#282828', fg: '#ebdbb2' },
];

export function PaletteModal({ onClose }: { onClose: () => void }) {
  const { setForegroundColor, setBackgroundColor } = useColorStore();

  const handleSelect = (bg: string, fg: string) => {
    setBackgroundColor(bg);
    setForegroundColor(fg);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-600 rounded shadow-xl max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="font-bold text-slate-200 uppercase tracking-widest">Brand Palette Array Library</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESET_PALETTES.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelect(p.bg, p.fg)}
              className="flex flex-col border border-slate-600 rounded p-2 hover:bg-slate-700 transition-colors cursor-pointer text-left"
            >
              <div className="font-bold mb-2">{p.name}</div>
              <div className="flex w-full h-8 rounded border border-slate-500 overflow-hidden">
                <div className="flex-1" style={{ backgroundColor: p.bg }}></div>
                <div className="flex-1" style={{ backgroundColor: p.fg }}></div>
              </div>
              <div className="flex justify-between mt-2 opacity-70">
                <span>{p.bg}</span>
                <span>{p.fg}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
