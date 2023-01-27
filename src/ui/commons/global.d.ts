/** Renderer */
export interface Renderer {
  closeApp: () => void;
  minimizeApp: () => void;
  toggleTheme: (themeType: string) => Promise<boolean>;
}

declare global {
  const Renderer: Renderer;
}
