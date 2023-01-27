import { nativeTheme, ipcMain } from 'electron';

ipcMain.handle('themeMode', (e, type: string) => {
  switch (type) {
    case 'light':
      nativeTheme.themeSource = 'light';
      break;
    case 'dark':
      nativeTheme.themeSource = 'dark';
      break;
    case 'system':
      nativeTheme.themeSource = 'system';
      break;
    default:
      nativeTheme.themeSource = 'system';
      break;
  }
  return nativeTheme.shouldUseDarkColors;
});
