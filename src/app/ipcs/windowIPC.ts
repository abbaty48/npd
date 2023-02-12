import { basename } from 'path';
import { BrowserWindow, ipcMain, dialog } from 'electron';
import { PackageDownloader } from '../libs/packageDownloader';
// Minimize the window that issue the minimization
ipcMain.on('minimizeApp', (event) => {
  BrowserWindow.fromWebContents(event.sender).minimize();
});

/*
   Close the window that issue the close.
   if this is the main window, the window-all-closed event will be fired
   and the app will determine to close in window/lixux or hide in mac
 */
ipcMain.on('closeApp', (event) => {
  BrowserWindow.fromWebContents(event.sender).close();
});

/*
  saveFileDialog.
  Open a save file dialog to allow user to choose a path where to save a downloaed file.
*/
ipcMain.handle('dialog:saveFile', async (event, { fileTarBall }) => {
  try {
    const choose = await dialog.showSaveDialog(
      BrowserWindow.fromWebContents(event.sender),
      {
        filters: [
          { name: 'tgz', extensions: ['tgz'] },
          { name: 'tar', extensions: ['tar'] },
          { name: 'tar.gz', extensions: ['tar.gz'] },
        ],
        properties: ['createDirectory', 'showOverwriteConfirmation'],
      }
    );
    if (choose.canceled) {
      return null;
    }
    return {
      filePath: choose.filePath,
      newFileName: basename(choose.filePath),
      oldFileName: basename(fileTarBall),
    };
  } catch (error) {}
});

/*
  DOWNLOAD
*/

interface IPackageDownloader {
  downloader: PackageDownloader;
  key: string;
}

const downloads: IPackageDownloader[] = [];

ipcMain.on(
  'download',
  async (
    event,
    url: string,
    oldFileName: string,
    newFileName: string,
    savedFilePath: string,
    downloadType: 'PackageOnly' | 'WithAllDependency',
    downloadKey: string,
    dependencies?: Record<string, string>,
    devDependencies?: Record<string, string>
  ) => {
    const downloader = new PackageDownloader(
      url,
      newFileName,
      oldFileName,
      savedFilePath
    );
    downloads.push({ key: downloadKey, downloader });

    try {
      if (downloadType === 'PackageOnly') {
        downloader.downloadPackageOnly(
          // Status
          ({
            isDownloading,
            isCompleted,
            isStarted,
            isPaused,
            isFailed,
            failedReason,
          }) => {
            BrowserWindow.fromWebContents(event.sender).webContents.send(
              'download:OnStatus',
              {
                key: downloadKey,
                isDownloading,
                isCompleted,
                isStarted,
                isPaused,
                isFailed,
                failedReason,
              }
            );
          },
          // Progress
          (percentage) => {
            BrowserWindow.fromWebContents(event.sender).webContents.send(
              'download:OnProgress',
              {
                key: downloadKey,
                percentage,
              }
            );
          },
          // Completed
          () => {
            BrowserWindow.fromWebContents(event.sender).webContents.send(
              'download:OnCompleted',
              downloadKey
            );
          },
          // Failed
          (reason) => {
            BrowserWindow.fromWebContents(event.sender).webContents.send(
              'download:OnFailed',
              { key: downloadKey, reason }
            );
          }
        );
      } else if (downloadType === 'WithAllDependency') {
        downloader.downloadWithAllDependency(
          dependencies,
          devDependencies,
          // Status
          ({
            isDownloading,
            isCompleted,
            isStarted,
            isPaused,
            isFailed,
            failedReason,
            progressStatus,
          }) => {
            BrowserWindow.fromWebContents(event.sender).webContents.send(
              'download:OnStatus',
              {
                key: downloadKey,
                isDownloading,
                isCompleted,
                isStarted,
                isPaused,
                isFailed,
                failedReason,
                progressStatus,
              }
            );
          },
          // Progress
          (percentage) => {
            BrowserWindow.fromWebContents(event.sender).webContents.send(
              'download:OnProgress',
              {
                key: downloadKey,
                percentage,
              }
            );
          },
          // Completed
          () => {
            BrowserWindow.fromWebContents(event.sender).webContents.send(
              'download:OnCompleted',
              downloadKey
            );
          },
          // Failed
          (reason) => {
            BrowserWindow.fromWebContents(event.sender).webContents.send(
              'download:OnFailed',
              { key: downloadKey, reason }
            );
          }
        );
      }
    } catch (error) {
      console.log('ERROR IN WINDOWIPC, REASON: ', error);
    }
  }
);

ipcMain.on('download:OnPauseResume', (e, key, isPaused) => {
  // find a downloader with the matching key
  const dl = downloads.find((d) => d.key === key);
  if (dl) {
    dl.downloader.pauseResume(isPaused);
  }
});
ipcMain.on('download:OnStop', (e, key) => {
  // find a downloader with the matching key
  const dl = downloads.find((d) => d.key === key);
  if (dl) {
    dl.downloader.stop();
  }
});
