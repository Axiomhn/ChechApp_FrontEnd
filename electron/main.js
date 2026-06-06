const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
    Menu.setApplicationMenu(null);

    const iconPath = app.isPackaged
        ? path.join(__dirname, '../dist/icon.png')
        : path.join(__dirname, '../public/icon.png');

    const win = new BrowserWindow({
        width: 1385,
        height: 800,
        minWidth: 1385,
        minHeight: 700,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        titleBarStyle: 'hiddenInset',
        show: false,
    });

    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    }

    win.once('ready-to-show', () => {
        win.maximize();
        win.show();
    });
}

app.whenReady().then(createWindow);

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
