/** Renderer */
export interface Renderer {
  closeApp: () => void;
  //
  minimizeApp: () => void;
  //
  toggleTheme: (themeType: string) => Promise<boolean>;
  //
  saveFile: (
    fileTarBall: string
  ) => { filePath: string; oldFileName: string; newFileName: string } | null;
  //
  download: (
    downloadKey: string,
    url: string,
    oldFileName: string,
    newFileName: string,
    savedFilePath: string,
    downloadType: 'PackageOnly' | 'WithAllDependency',
    dependencies?: Record<string, string> | undefined,
    devDependencies?: Record<string, string> | undefined
  ) => void;
  //
  downloadOnStatus: (
    callBack: (
      key,
      isDownloading: boolean,
      isCompleted: boolean,
      isStarted: boolean,
      isPaused: boolean,
      isFailed: boolean,
      failedReason: string,
      progressStatus?: string
    ) => void
  ) => void;
  downloadOnFailed: (callBack: (key: string, reason: string) => void) => void;
  //
  downloadOnProgress: (
    callBack: (key: string, percentage: number) => void
  ) => void;
  downloadOnCompleted: (callBack: (key: string) => void) => void;
  //
  downloadOnPauseResume: (
    key: string,
    isPaused?: boolean,
    callBack?: () => void
  ) => void;
  //
  downloadOnStop: (key: string, callBack?: () => void) => void;
}

declare global {
  const Renderer: Renderer;
}
