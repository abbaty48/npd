// CORS

import { BrowserWindow } from 'electron';

export function corsHandler(window: BrowserWindow) {
  window.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      const { requestHeaders } = details;
      UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*']);
      callback({ requestHeaders });
    }
  );

  window.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      const { responseHeaders } = details;
      UpsertKeyValue(responseHeaders, 'origin', ['*']);
      UpsertKeyValue(responseHeaders, 'unsafe-url', ['*']);
      UpsertKeyValue(responseHeaders, 'same-origin', ['*']);
      UpsertKeyValue(responseHeaders, 'strict-origin', ['*']);
      UpsertKeyValue(responseHeaders, 'no-referrer-when-downgrade', ['*']);
      UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
      UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*']);
      UpsertKeyValue(responseHeaders, 'strict-origin-when-cross-origin', ['*']);
      callback({
        responseHeaders,
      });
    }
  );
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function UpsertKeyValue(obj: any, keyToChange: any, value: any) {
  const keyToChangeLower = keyToChange.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value;
      // Done
      return;
    }
  }
  // Insert at end instead
  obj[keyToChange] = value;
}
