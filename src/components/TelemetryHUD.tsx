import { useColorStore } from '../store/useColorStore';
import { calculateLuminance, calculateDeltaE } from '../lib/colorMath';
import { DownloadCloud } from 'lucide-react';

export function TelemetryHUD() {
  const { foregroundColor, backgroundColor, telemetry, targetLevel } = useColorStore();
  const fgLum = calculateLuminance(foregroundColor);
  const bgLum = calculateLuminance(backgroundColor);
  const deltaE = calculateDeltaE(foregroundColor, backgroundColor);

  const exportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      foregroundColor,
      backgroundColor,
      fgLuminance: fgLum,
      bgLuminance: bgLum,
      contrastRatio: ((Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05)).toFixed(2),
      targetWCAG: targetLevel,
      latencyMs: telemetry.latencyMs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // eslint-disable-next-line
    a.download = `compliance-ledger-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded mt-4 flex flex-col md:flex-row items-start md:items-center justify-between font-mono gap-4">
      <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 w-full md:w-auto">
        <div className="flex flex-col">
          <span className="text-slate-400 uppercase tracking-widest">Y_fg (Rel. Lum)</span>
          <span className="font-bold text-slate-200">{fgLum.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 uppercase tracking-widest">Y_bg (Rel. Lum)</span>
          <span className="font-bold text-slate-200">{bgLum.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 uppercase tracking-widest">Thread Latency</span>
          <span className="font-bold text-slate-200">{telemetry.latencyMs.toFixed(2)} ms</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 uppercase tracking-widest">Delta-E Index</span>
          <span className="font-bold text-slate-200">{deltaE.toFixed(2)}</span>
        </div>
      </div>
      
      <button onClick={exportJSON} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded border border-slate-600 transition-colors cursor-pointer">
        <DownloadCloud size={16} /> Export JSON Ledger
      </button>
    </div>
  );
}
