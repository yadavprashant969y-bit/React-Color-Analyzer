import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CVDFilter = 'None' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia' | 'Achromatopsia';
export type WCAGTarget = 'AA' | 'AAA';
export type TextScale = 'Normal' | 'Large';
export type ContrastMethod = 'WCAG2' | 'APCA';

interface TelemetryData {
  fgLuminance: number;
  bgLuminance: number;
  latencyMs: number;
  deltaE: number;
}

interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface ColorState {
  foregroundColor: string;
  backgroundColor: string;
  targetLevel: WCAGTarget;
  textSize: TextScale;
  cvdFilter: CVDFilter;
  contrastMethod: ContrastMethod;
  telemetry: TelemetryData;
  customPalettes: Palette[];

  setForegroundColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setTargetLevel: (level: WCAGTarget) => void;
  setTextSize: (size: TextScale) => void;
  setCvdFilter: (filter: CVDFilter) => void;
  setContrastMethod: (method: ContrastMethod) => void;
  setTelemetry: (data: Partial<TelemetryData>) => void;
  savePalette: (palette: Palette) => void;
  swapColors: () => void;
  flushCache: () => void;
}

export const useColorStore = create<ColorState>()(
  persist(
    (set, get) => ({
      foregroundColor: '#FFFFFF',
      backgroundColor: '#000000',
      targetLevel: 'AA',
      textSize: 'Normal',
      cvdFilter: 'None',
      contrastMethod: 'WCAG2',
      telemetry: {
        fgLuminance: 1,
        bgLuminance: 0,
        latencyMs: 0,
        deltaE: 100,
      },
      customPalettes: [],

      setForegroundColor: (color) => set({ foregroundColor: color }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      setTargetLevel: (level) => set({ targetLevel: level }),
      setTextSize: (size) => set({ textSize: size }),
      setCvdFilter: (filter) => set({ cvdFilter: filter }),
      setContrastMethod: (method) => set({ contrastMethod: method }),
      setTelemetry: (data) => set((state) => ({ telemetry: { ...state.telemetry, ...data } })),
      savePalette: (palette) => set((state) => ({ customPalettes: [...state.customPalettes, palette] })),
      swapColors: () => {
        const { foregroundColor, backgroundColor } = get();
        set({ foregroundColor: backgroundColor, backgroundColor: foregroundColor });
      },
      flushCache: () => set({
        foregroundColor: '#FFFFFF',
        backgroundColor: '#000000',
        targetLevel: 'AA',
        textSize: 'Normal',
        cvdFilter: 'None',
        contrastMethod: 'WCAG2',
        telemetry: {
          fgLuminance: 1,
          bgLuminance: 0,
          latencyMs: 0,
          deltaE: 100,
        },
        customPalettes: [],
      }),
    }),
    {
      name: 'color-contrast-storage',
      partialize: (state) => ({ customPalettes: state.customPalettes }), // Only persist palettes as per requirement, or maybe user preferences
    }
  )
);
