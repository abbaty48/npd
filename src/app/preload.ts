// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
// #1
contextBridge.exposeInMainWorld('Renderer', {
  // toggleTheme
  toggleTheme: (themeType: string) =>
    ipcRenderer.invoke('themeMode', themeType),
  // minimize
  minimizeApp: () => ipcRenderer.send('minimizeApp'),
  // close
  closeApp: () => ipcRenderer.send('closeApp'),
  // saveFile
  saveFile: (
    fileTarBall: string,
    forType: 'PackageOnly' | 'WithAllDependency'
  ) => ipcRenderer.invoke('dialog:saveFile', { fileTarBall, forType }),
  // download
  download: (
    downloadKey: string,
    url: string,
    oldFileName: string,
    newFileName: string,
    savedFilePath: string,
    downloadType: 'PackageOnly' | 'WithAllDependency',
    dependencies?: Record<string, string> | undefined,
    devDependencies?: Record<string, string> | undefined
  ) =>
    ipcRenderer.send(
      'download',
      url,
      oldFileName,
      newFileName,
      savedFilePath,
      downloadType,
      downloadKey,
      dependencies,
      devDependencies
    ),
  // downloadOnStatus
  downloadOnStatus: (
    callBack: (
      key: string,
      isDownloading: boolean,
      isCompleted: boolean,
      isStarted: boolean,
      isPaused: boolean,
      isFailed: boolean,
      failedReason: string,
      progressStatus?: string
    ) => void
  ) => {
    ipcRenderer.on(
      'download:OnStatus',
      (
        e,
        {
          key,
          isDownloading,
          isCompleted,
          isStarted,
          isPaused,
          isFailed,
          failedReason,
          progressStatus,
        }
      ) => {
        callBack(
          key,
          isDownloading,
          isCompleted,
          isStarted,
          isPaused,
          isFailed,
          failedReason,
          progressStatus
        );
      }
    );
  },
  downloadOnFailed: (callBack: (key: string, reason: string) => void) => {
    ipcRenderer.on('download:OnFailed', (e, { key, reason }) => {
      callBack(key, reason);
    });
  },
  downloadOnProgress: (callBack: (key: string, percentage: number) => void) => {
    ipcRenderer.on('download:OnProgress', (e, { key, percentage }) => {
      callBack(key, percentage);
    });
  },
  downloadOnCompleted: (callBack: (key: string) => void) => {
    ipcRenderer.on('download:OnCompleted', (e, key) => {
      callBack(key);
    });
  },
  downloadOnPauseResume: (
    key: string,
    isPaused?: boolean,
    callBack?: () => void
  ) => {
    ipcRenderer.send('download:OnPauseResume', key, isPaused);
    callBack?.call(this);
  },
  downloadOnStop: (key: string, callBack?: () => void) => {
    ipcRenderer.send('download:OnStop', key);
    callBack?.call(this);
  },
  downloadOnStarted: (callBack: (key: string) => void) => {
    ipcRenderer.on('download:OnStarted', (e, key) => {
      callBack(key);
    });
  },
});
