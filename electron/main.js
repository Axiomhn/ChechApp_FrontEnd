const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { loadSettings, saveSettings } = require('./calibration-store');

let mainWindow;

function createWindow() {
  Menu.setApplicationMenu(null);

  const iconPath = app.isPackaged
    ? path.join(__dirname, '../dist/icon.png')
    : path.join(__dirname, '../public/icon.png');

  mainWindow = new BrowserWindow({
    width: 1385,
    height: 800,
    minWidth: 1385,
    minHeight: 700,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers() {
  ipcMain.handle('calibration:get-settings', async () => {
    try {
      const data = loadSettings(app.getPath('userData'));
      return { success: true, data };
    } catch (err) {
      console.error('calibration:get-settings', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('calibration:save-settings', async (_event, settings) => {
    try {
      const data = saveSettings(app.getPath('userData'), settings);
      return { success: true, data };
    } catch (err) {
      console.error('calibration:save-settings', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('calibration:get-printers', async () => {
    try {
      if (!mainWindow) return [];
      const printers = await mainWindow.webContents.getPrintersAsync();
      return printers.map((printer) => ({
        name: printer.name,
        isDefault: printer.isDefault,
      }));
    } catch (err) {
      console.error('calibration:get-printers', err);
      return [];
    }
  });

  ipcMain.handle('print:native-escp', async () => ({
    success: false,
    error: 'Impresión nativa en desarrollo.',
  }));

  ipcMain.handle('print:graphical', async () => ({
    success: false,
    error: 'Impresión gráfica en desarrollo.',
  }));
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
