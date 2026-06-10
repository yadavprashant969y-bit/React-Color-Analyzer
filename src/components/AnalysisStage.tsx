import { useColorStore } from '../store/useColorStore';
import { calculateContrast, calculateAPCA } from '../lib/colorMath';

import { AlertTriangle } from 'lucide-react';

export function AnalysisStage() {
  const { foregroundColor, backgroundColor, cvdFilter, targetLevel, textSize, setTextSize, contrastMethod } = useColorStore();
  const contrastRatio = calculateContrast(foregroundColor, backgroundColor);
  const apcaScore = calculateAPCA(backgroundColor, foregroundColor);

  const matrices: Record<string, string> = {
    None: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0",
    Protanopia: "0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0",
    Deuteranopia: "0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0",
    Tritanopia: "0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0",
    Achromatopsia: "0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"
  };

  const isWCAG2 = contrastMethod === 'WCAG2';

  const isAANormalPass = isWCAG2 ? contrastRatio >= 4.5 : apcaScore >= 60;
  const isAALargePass = isWCAG2 ? contrastRatio >= 3.0 : apcaScore >= 45;
  const isAAANormalPass = isWCAG2 ? contrastRatio >= 7.0 : apcaScore >= 75;
  const isAAALargePass = isWCAG2 ? contrastRatio >= 4.5 : apcaScore >= 60;

  const targetAANormal = isWCAG2 ? '4.5' : 'Lc 60';
  const targetAALarge = isWCAG2 ? '3.0' : 'Lc 45';
  const targetAAANormal = isWCAG2 ? '7.0' : 'Lc 75';
  const targetAAALarge = isWCAG2 ? '4.5' : 'Lc 60';

  const isPassing = targetLevel === 'AA' 
    ? (textSize === 'Large' ? isAALargePass : isAANormalPass)
    : (textSize === 'Large' ? isAAALargePass : isAAANormalPass);

  const textStyle = textSize === 'Large' ? { fontSize: '14pt', fontWeight: 'bold' } : {};

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full mt-4">
      <svg width="0" height="0" className="absolute">
        <filter id="cvd-filter">
          <feColorMatrix type="matrix" values={matrices[cvdFilter] || matrices.None} />
        </filter>
      </svg>
      
      {/* ComplianceScorecardPanel */}
      <div className="stage-panel w-full md:w-1/3 p-6 flex flex-col justify-center items-center">
        <div className="text-slate-400 mb-2 text-center uppercase tracking-widest border-b border-slate-700 w-full pb-2">
          {isWCAG2 ? 'Contrast Ratio' : 'APCA Score'}
        </div>
        <div className="text-6xl font-bold font-mono my-8 flex items-end justify-center min-h-[72px]">
          {isWCAG2 ? (
            <>{contrastRatio.toFixed(2)}<span className="text-3xl text-slate-500 mb-1">:1</span></>
          ) : (
            <><span className="text-3xl text-slate-500 mb-1 mr-2">Lc</span>{apcaScore.toFixed(1)}</>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2">
            <div className="font-bold text-center border-b border-slate-600 pb-1">{isWCAG2 ? 'WCAG AA' : 'APCA Bronze'}</div>
            <StatusBox label="Normal Text" passed={isAANormalPass} target={targetAANormal} />
            <StatusBox label="Large Text" passed={isAALargePass} target={targetAALarge} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="font-bold text-center border-b border-slate-600 pb-1">{isWCAG2 ? 'WCAG AAA' : 'APCA Silver'}</div>
            <StatusBox label="Normal Text" passed={isAAANormalPass} target={targetAAANormal} />
            <StatusBox label="Large Text" passed={isAAALargePass} target={targetAAALarge} />
          </div>
        </div>
      </div>

      {/* LiveSimulationPreviewerCanvas */}
      <div className="stage-panel flex-grow w-full md:w-2/3 p-6 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-slate-700 pb-2 gap-2">
          <div className="flex gap-2 items-center">
            <span className="text-slate-400 uppercase tracking-widest">Live Mockup Preview</span>
            {!isPassing && (
              <span className="flex items-center gap-1 text-red-500 font-bold bg-red-950/50 px-2 py-0.5 rounded text-xs border border-red-800">
                <AlertTriangle size={12} /> {targetLevel} Fail
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <select 
              value={textSize} 
              onChange={(e) => setTextSize(e.target.value as "Normal" | "Large")}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 outline-none font-bold text-slate-200 cursor-pointer"
            >
              <option value="Normal">Normal Text</option>
              <option value="Large">Large Text</option>
            </select>
            <select 
              value={cvdFilter} 
              onChange={(e) => useColorStore.getState().setCvdFilter(e.target.value as "None" | "Protanopia" | "Deuteranopia" | "Tritanopia" | "Achromatopsia")}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 outline-none font-bold text-slate-200 cursor-pointer"
            >
              {Object.keys(matrices).map(k => <option key={k} value={k}>{k === 'None' ? 'Standard Vision' : k}</option>)}
            </select>
          </div>
        </div>
        
        <div 
          className="flex-grow rounded border border-slate-700 flex items-center justify-center relative overflow-hidden transition-all"
          style={{ 
            backgroundColor, 
            filter: cvdFilter !== 'None' ? 'url(#cvd-filter)' : 'none' 
          }}
        >
          <div className={`p-8 max-w-md w-full flex flex-col gap-6 transition-all ${!isPassing ? 'ring-4 ring-red-500/50 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`} style={{ color: foregroundColor, ...textStyle }}>
            <div>
              <div className="font-bold mb-2 pb-2" style={{ borderBottom: `1px solid ${foregroundColor}40` }}>Digital Interface Fragment</div>
              <p className="opacity-90">This is a live simulation canvas. Paragraph text demonstrates the selected text scaling metrics.</p>
            </div>

            <div className="flex gap-4">
              <button 
                className="px-4 py-2 font-bold rounded cursor-pointer"
                style={{ backgroundColor: foregroundColor, color: backgroundColor }}
              >
                Primary Action
              </button>
              <button 
                className="px-4 py-2 font-bold rounded border cursor-pointer hover:opacity-80"
                style={{ borderColor: foregroundColor, color: foregroundColor }}
              >
                Secondary
              </button>
            </div>

            <div 
              className="p-4 rounded border"
              style={{ borderColor: `${foregroundColor}40`, backgroundColor: `${foregroundColor}10` }}
            >
              <div className="font-bold mb-1">Alert Notice</div>
              <div className="opacity-80">This alert card uses your active color pair. <a href="#" className="underline font-bold hover:opacity-80">Inline link test</a>.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBox({ label, passed, target }: { label: string, passed: boolean, target: string }) {
  return (
    <div className={`flex justify-between items-center p-2 rounded border ${passed ? 'bg-green-900/30 border-green-700 text-green-100' : 'bg-red-900/30 border-red-700 text-red-100'}`}>
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <span className="opacity-70">({target})</span>
        <span className="font-bold">{passed ? 'PASS' : 'FAIL'}</span>
      </div>
    </div>
  );
}
