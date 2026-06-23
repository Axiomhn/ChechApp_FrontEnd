const { BrowserWindow } = require('electron');
const { loadSettings } = require('./calibration-store');
const { buildOrdenPagoHtml, ORDEN_PAGO_PAGE_SIZE_MICRONS } = require('./orden-pago-template');
const { buildChequeHtml, CHEQUE_PAGE_SIZE_MICRONS } = require('./cheque-template');

let printWindow = null;

function destroyPrintWindow() {
  if (printWindow && !printWindow.isDestroyed()) {
    printWindow.destroy();
  }
  printWindow = null;
}

function printHtmlDocument({ html, deviceName, pageSize, printBackground = true }) {
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
        printBackground,
        deviceName,
        margins: { marginType: 'none' },
        pageSize,
      };

      const runPrint = () => {
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
      };

      // Breve espera para fuentes y layout antes de imprimir (orden de pago).
      setTimeout(runPrint, 400);
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

async function printOrdenPago(data, deviceName) {
  const html = buildOrdenPagoHtml(data);
  const printer = String(deviceName ?? '').trim();

  if (!printer) {
    return {
      success: false,
      error: 'No hay impresora seleccionada.',
    };
  }

  return printHtmlDocument({
    html,
    deviceName: printer,
    pageSize: ORDEN_PAGO_PAGE_SIZE_MICRONS,
    printBackground: true,
  });
}

async function printCheque(userDataPath, data, offsets = {}, deviceName = '') {
  const settings = loadSettings(userDataPath);
  const fuenteTamano = parseInt(settings.fuente_tamano || '12', 10);
  const html = buildChequeHtml({ data, offsets, fuenteTamano });
  const printer = String(deviceName ?? '').trim();

  if (!printer) {
    return {
      success: false,
      error: 'No hay impresora seleccionada.',
    };
  }

  return printHtmlDocument({
    html,
    deviceName: printer,
    pageSize: CHEQUE_PAGE_SIZE_MICRONS,
    printBackground: false,
  });
}

async function printGraphical(
  userDataPath,
  documentType,
  data,
  offsets = {},
  printerName = ''
) {
  if (documentType === 'ORDEN_PAGO') {
    return printOrdenPago(data, printerName);
  }

  if (documentType === 'CHEQUE') {
    return printCheque(userDataPath, data, offsets, printerName);
  }

  return {
    success: false,
    error: `Tipo de documento no soportado: ${documentType}`,
  };
}

module.exports = {
  printGraphical,
};
