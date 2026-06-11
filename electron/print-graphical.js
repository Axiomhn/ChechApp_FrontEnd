const { BrowserWindow } = require('electron');
const { loadSettings } = require('./calibration-store');
const { buildOrdenPagoHtml } = require('./orden-pago-template');

let printWindow = null;

function destroyPrintWindow() {
  if (printWindow && !printWindow.isDestroyed()) {
    printWindow.destroy();
  }
  printWindow = null;
}

function resolvePrinterName(userDataPath, fallback = '') {
  const settings = loadSettings(userDataPath);
  return settings.printer_name?.trim() || fallback || undefined;
}

function printHtmlDocument({ html, deviceName, pageSize }) {
  return new Promise((resolve) => {
    destroyPrintWindow();

    printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

    printWindow.webContents.once('did-finish-load', () => {
      const options = {
        silent: true,
        printBackground: true,
        deviceName,
        margins: { marginType: 'none' },
        pageSize,
      };

      printWindow.webContents.print(options, (success, failureReason) => {
        destroyPrintWindow();
        if (success) {
          resolve({ success: true });
          return;
        }
        console.error('print-graphical:', failureReason);
        resolve({
          success: false,
          error: failureReason || 'No se pudo enviar el documento a la impresora.',
        });
      });
    });

    printWindow.webContents.once(
      'did-fail-load',
      (_event, _code, description) => {
        destroyPrintWindow();
        resolve({
          success: false,
          error: description || 'No se pudo cargar el documento de impresión.',
        });
      }
    );

    printWindow.loadURL(dataUrl);
  });
}

async function printOrdenPago(userDataPath, data) {
  const html = buildOrdenPagoHtml(data);
  const deviceName = resolvePrinterName(
    userDataPath,
    'Microsoft Print to PDF'
  );

  if (!deviceName) {
    return {
      success: false,
      error:
        'No hay impresora configurada. Seleccione una en Calibración y guarde la configuración.',
    };
  }

  return printHtmlDocument({
    html,
    deviceName,
    pageSize: 'Letter',
  });
}

async function printGraphical(userDataPath, documentType, data) {
  if (documentType === 'ORDEN_PAGO') {
    return printOrdenPago(userDataPath, data);
  }

  return {
    success: false,
    error: 'Impresión gráfica de cheque en desarrollo.',
  };
}

module.exports = {
  printGraphical,
};
