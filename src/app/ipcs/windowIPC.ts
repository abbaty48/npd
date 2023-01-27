import { BrowserWindow, ipcMain } from 'electron';

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
