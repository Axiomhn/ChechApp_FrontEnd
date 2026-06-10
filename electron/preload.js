const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  config: {
    getSettings: () => ipcRenderer.invoke('calibration:get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('calibration:save-settings', settings),
    getPrinters: () => ipcRenderer.invoke('calibration:get-printers'),
  },
  print: {
    nativeEscP: (printerName, documentType, data, offsets) =>
      ipcRenderer.invoke('print:native-escp', { printerName, documentType, data, offsets }),
    graphical: (documentType, data, offsets) =>
      ipcRenderer.invoke('print:graphical', { documentType, data, offsets }),
  },
});
