import { AnalyzerConsole } from './components/AnalyzerConsole';
import { AnalysisStage } from './components/AnalysisStage';
import { TelemetryHUD } from './components/TelemetryHUD';
import { useColorStore } from './store/useColorStore';
import logo from './assets/logo.png';


function App() {
  const { targetLevel, setTargetLevel, contrastMethod, setContrastMethod } = useColorStore();
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col p-4 gap-2 w-full box-border">
      <header className="border-b border-slate-700 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4 w-full">
        <div className="ml-[1cm] flex gap-4 items-center">
          <img src={logo} alt="Color Analyzer Logo" className="w-12 h-12 rounded-xl shadow-lg border border-slate-700 object-cover" />
          <div>
            <h1 className="font-bold uppercase tracking-widest text-slate-200 text-xl md:text-2xl flex items-center gap-2">
             Color Analyzer <span className="text-slate-600"></span>
            </h1>
            <p className="text-slate-500 text-sm tracking-wide mt-1">Advanced WCAG 2.1 & APCA Evaluation Suite</p>
          </div>
        </div>
        <div className="flex gap-4 items-center flex-wrap bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-inner ml-auto md:ml-0">
          <div className="flex gap-2 items-center pl-2">
            <span className="uppercase tracking-widest text-slate-400 text-xs font-bold">Method:</span>
            <select 
              value={contrastMethod} 
              onChange={(e) => setContrastMethod(e.target.value as "WCAG2" | "APCA")}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 outline-none font-bold text-slate-200 cursor-pointer text-sm focus:border-indigo-500 transition-colors"
            >
              <option value="WCAG2">WCAG 2.1 Ratio</option>
              <option value="APCA">APCA (Draft)</option>
            </select>
          </div>
          <div className="flex gap-2 items-center pr-2">
            <span className="uppercase tracking-widest text-slate-400 text-xs font-bold">Target Level:</span>
            <select 
              value={targetLevel} 
              onChange={(e) => setTargetLevel(e.target.value as "AA" | "AAA")}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 outline-none font-bold text-slate-200 cursor-pointer text-sm focus:border-indigo-500 transition-colors"
            >
              <option value="AA">WCAG AA Standard</option>
              <option value="AAA">WCAG AAA Strict</option>
            </select>
          </div>
        </div>
      </header>
      
      <div className="shrink-0 mt-2">
        <AnalyzerConsole />
      </div>
      
      <div className="flex-grow min-h-0">
        <AnalysisStage />
      </div>
      
      <div className="shrink-0">
        <TelemetryHUD />
      </div>
    </div>
  );
}

export default App;
