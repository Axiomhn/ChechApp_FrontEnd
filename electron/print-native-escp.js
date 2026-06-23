const { exec } = require('child_process');
const path = require('path');

function isVirtualPrinter(printerName) {
  const name = String(printerName).toLowerCase();
  return (
    name.includes('print to pdf') ||
    name.includes('xps document') ||
    name.includes('onenote')
  );
}

function buildChequeEscpPayload(data, offsets = {}) {
  const maxRows = 36;
  const maxCols = 85;
  const grid = Array.from({ length: maxRows }, () => Array(maxCols).fill(' '));

  const offFechaX = parseInt(offsets.fecha_x || 0, 10);
  const offFechaY = parseInt(offsets.fecha_y || 0, 10);
  const offMontoX = parseInt(offsets.monto_x || 0, 10);
  const offMontoY = parseInt(offsets.monto_y || 0, 10);
  const offBeneX = parseInt(offsets.beneficiario_x || 0, 10);
  const offBeneY = parseInt(offsets.beneficiario_y || 0, 10);
  const offLetrasX = parseInt(offsets.letras_x || 0, 10);
  const offLetrasY = parseInt(offsets.letras_y || 0, 10);

  const posFecha = { r: 2 + offFechaY, c: 52 + offFechaX };
  const posMontoNum = { r: 4 + offMontoY, c: 68 + offMontoX };
  const posBeneficiario = { r: 6 + offBeneY, c: 15 + offBeneX };
  const posMontoLetras = { r: 8 + offLetrasY, c: 8 + offLetrasX };

  const injectText = (text, row, col) => {
    if (row < 0 || row >= maxRows) return;
    const startCol = Math.max(0, Math.min(col, maxCols - 1));
    const len = Math.min(String(text).length, maxCols - startCol);
    for (let i = 0; i < len; i++) {
      grid[row][startCol + i] = String(text)[i];
    }
  };

  injectText(data.fecha || '', posFecha.r, posFecha.c);
  injectText(data.monto || '', posMontoNum.r, posMontoNum.c);
  injectText(data.beneficiario || '', posBeneficiario.r, posBeneficiario.c);
  injectText(data.montoLetras || data.montoLetters || '', posMontoLetras.r, posMontoLetras.c);

  const escpBytes = [0x1b, 0x40, 0x1b, 0x43, 0x06, 0x1b, 0x32];

  for (let r = 0; r < maxRows; r++) {
    const lineStr = grid[r].join('').trimEnd();
    if (lineStr.length > 0) {
      for (let c = 0; c < lineStr.length; c++) {
        escpBytes.push(lineStr.charCodeAt(c));
      }
    }
    escpBytes.push(0x0d, 0x0a);
  }

  escpBytes.push(0x0c);
  return Buffer.from(escpBytes).toString('hex');
}

function sendRawToPrinter(printerName, hexPayload) {
  const scriptPath = path.join(__dirname, 'scripts', 'print_raw.ps1');
  const command = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -PrinterName "${printerName}" -HexData "${hexPayload}"`;

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('print-native-escp:', error, stderr);
        resolve({ success: false, error: error.message });
        return;
      }
      if (stdout.trim().includes('SUCCESS')) {
        resolve({ success: true });
        return;
      }
      resolve({
        success: false,
        error: stdout || stderr || 'Error desconocido al imprimir en modo nativo.',
      });
    });
  });
}

async function printNativeEscP(printerName, documentType, data, offsets = {}) {
  if (!printerName?.trim()) {
    return {
      success: false,
      error:
        'No hay impresora seleccionada. Elija una impresora en el diálogo de impresión.',
    };
  }

  if (documentType !== 'CHEQUE') {
    return {
      success: false,
      error: 'La orden de pago se imprime en modo gráfico (plantilla HTML).',
    };
  }

  if (isVirtualPrinter(printerName)) {
    return {
      success: false,
      error:
        'El modo nativo ESC/P no funciona con impresoras virtuales (PDF/XPS). ' +
        'Use una impresora física (p. ej. Epson LX-350) para imprimir cheques.',
    };
  }

  const hexPayload = buildChequeEscpPayload(data, offsets);
  return sendRawToPrinter(printerName.trim(), hexPayload);
}

module.exports = {
  printNativeEscP,
};
