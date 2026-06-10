export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function normalizeRgb(rgb: RGB): { r: number; g: number; b: number } {
  return {
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255
  };
}

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function calculateLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const normalized = normalizeRgb(rgb);
  const Rlinear = linearize(normalized.r);
  const Glinear = linearize(normalized.g);
  const Blinear = linearize(normalized.b);
  
  return 0.2126 * Rlinear + 0.7152 * Glinear + 0.0722 * Blinear;
}

export function calculateContrast(hex1: string, hex2: string): number {
  const L1 = calculateLuminance(hex1);
  const L2 = calculateLuminance(hex2);
  
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export function rgbToHex(rgb: RGB): string {
  return "#" + (1 << 24 | rgb.r << 16 | rgb.g << 8 | rgb.b).toString(16).slice(1).toUpperCase();
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(hsl: HSL): RGB {
  let r, g, b;
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function calculateDeltaE(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;
  
  const rMean = (rgb1.r + rgb2.r) / 2;
  const r = rgb1.r - rgb2.r;
  const g = rgb1.g - rgb2.g;
  const b = rgb1.b - rgb2.b;
  
  return Math.sqrt(
    (2 + rMean / 256) * Math.pow(r, 2) +
    4 * Math.pow(g, 2) +
    (2 + (255 - rMean) / 256) * Math.pow(b, 2)
  );
}

export function optimizeContrast(bgHex: string, fgHex: string, targetRatio: number): { hex: string, latency: number } {
  const start = performance.now();
  
  const rgbFg = hexToRgb(fgHex);
  if (!rgbFg) return { hex: fgHex, latency: 0 };
  const hslFg = rgbToHsl(rgbFg);

  const testL = (l: number) => {
    const testRgb = hslToRgb({ ...hslFg, l });
    return calculateContrast(bgHex, rgbToHex(testRgb));
  };

  if (testL(hslFg.l) >= targetRatio) {
    return { hex: fgHex, latency: performance.now() - start };
  }

  let iterations = 0;
  let lowD = 0, highD = hslFg.l, bestD = -1;
  while (highD - lowD > 0.1 && iterations < 50) {
    iterations++;
    const mid = (lowD + highD) / 2;
    if (testL(mid) >= targetRatio) {
      bestD = mid;
      lowD = mid;
    } else {
      highD = mid;
    }
  }

  let lowU = hslFg.l, highU = 100, bestU = -1;
  iterations = 0;
  while (highU - lowU > 0.1 && iterations < 50) {
    iterations++;
    const mid = (lowU + highU) / 2;
    if (testL(mid) >= targetRatio) {
      bestU = mid;
      highU = mid;
    } else {
      lowU = mid;
    }
  }

  let finalL: number;
  if (bestD !== -1 && bestU !== -1) {
    finalL = (Math.abs(bestD - hslFg.l) < Math.abs(bestU - hslFg.l)) ? bestD : bestU;
  } else if (bestD !== -1) {
    finalL = bestD;
  } else if (bestU !== -1) {
    finalL = bestU;
  } else {
    if (testL(0) > testL(100)) finalL = 0;
    else finalL = 100;
  }

  const bestHex = rgbToHex(hslToRgb({ ...hslFg, l: finalL }));
  
  const latency = performance.now() - start;
  return { hex: bestHex, latency };
}

export function calculateAPCA(bgHex: string, fgHex: string): number {
  const bgRgb = hexToRgb(bgHex);
  const fgRgb = hexToRgb(fgHex);
  if (!bgRgb || !fgRgb) return 0;

  const linearize = (c: number) => Math.pow(c / 255.0, 2.4);
  const bgY = 0.2126 * linearize(bgRgb.r) + 0.7152 * linearize(bgRgb.g) + 0.0722 * linearize(bgRgb.b);
  const fgY = 0.2126 * linearize(fgRgb.r) + 0.7152 * linearize(fgRgb.g) + 0.0722 * linearize(fgRgb.b);

  const blkThrs = 0.022;
  const blkClmp = 1.414;
  const scale = 1.14;
  
  const clampY = (y: number) => y < blkThrs ? y + Math.pow(blkThrs - y, blkClmp) : y;
  const bgYClamped = clampY(bgY);
  const fgYClamped = clampY(fgY);

  if (Math.abs(bgYClamped - fgYClamped) < 0.0005) return 0;

  let Lc: number;
  if (bgYClamped > fgYClamped) {
    Lc = (Math.pow(bgYClamped, 0.56) - Math.pow(fgYClamped, 0.57)) * scale * 100;
  } else {
    Lc = (Math.pow(bgYClamped, 0.65) - Math.pow(fgYClamped, 0.62)) * scale * 100;
  }

  return parseFloat(Math.abs(Lc).toFixed(1));
}

export function generateMonochromatic(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  const hsl = rgbToHsl(rgb);
  return [
    rgbToHex(hslToRgb({ ...hsl, l: Math.max(0, hsl.l - 40) })),
    rgbToHex(hslToRgb({ ...hsl, l: Math.max(0, hsl.l - 20) })),
    hex,
    rgbToHex(hslToRgb({ ...hsl, l: Math.min(100, hsl.l + 20) })),
    rgbToHex(hslToRgb({ ...hsl, l: Math.min(100, hsl.l + 40) }))
  ];
}

export function generateAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  const hsl = rgbToHsl(rgb);
  return [
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 300) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 330) % 360 })),
    hex,
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 30) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 60) % 360 }))
  ];
}

export function generateComplementary(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  const hsl = rgbToHsl(rgb);
  return [
    rgbToHex(hslToRgb({ ...hsl, l: Math.max(0, hsl.l - 30) })),
    hex,
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 180) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 180) % 360, l: Math.min(100, hsl.l + 20) })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 180) % 360, l: Math.max(0, hsl.l - 20) }))
  ];
}
