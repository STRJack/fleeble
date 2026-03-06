export type ThemeName = 'violet' | 'emerald' | 'ocean' | 'rose' | 'amber';

export interface Theme {
  name: ThemeName;
  label: string;
  accent: string;
  accentRgb: string;
  light: string;
  dark: string;
  darker: string;
  tip: string;
  bg1: string;
  bg2: string;
  bodyGrad: [string, string, string];
  flashColor: string;
  orbGlow: string;
  orbGradient: string;
}

export type BubbleType = 'action' | 'error' | 'info' | 'question' | 'approval';

export interface BubbleScenario {
  id: string;
  source: 'claude-code' | 'cursor' | 'codex';
  type: BubbleType;
  message: string;
  project?: string;
  options?: string[];
}

export interface GitHubRelease {
  version: string;
  downloadUrl: string;
  downloadCount: number;
}
