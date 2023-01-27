/** Renderer */
export interface Renderer {
  toggleTheme: (themeType: string) => Promise<boolean>;
}

declare global {
  const Renderer: Renderer;
}
