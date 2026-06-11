/**
 * Plantilla gráfica para cheque preimpreso Banco de Occidente — 8.5" × 6".
 * Solo se imprime la mitad superior (≈3") donde van los campos editables.
 * Cada campo tiene un ancla base; los offsets de calibración se suman en píxeles.
 */

const CHEQUE_WIDTH_IN = 8.5;
const CHEQUE_HEIGHT_IN = 6;
const PRINTABLE_HEIGHT_IN = 3;

/** Anclas base (0,0) = inicio del área de texto del campo en el cheque físico. */
const FIELD_ANCHORS = {
  fecha: { left: 520, top: 40 },
  monto: { left: 650, top: 75 },
  beneficiario: { left: 120, top: 110 },
  letras: { left: 80, top: 145 },
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseOffset(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function fieldStyle(anchor, offsetX, offsetY, fontSize, extra = '') {
  const left = anchor.left + offsetX;
  const top = anchor.top + offsetY;
  return [
    'position:absolute',
    `left:${left}px`,
    `top:${top}px`,
    `font-size:${fontSize}px`,
    'font-weight:700',
    'color:#000',
    'white-space:nowrap',
    extra,
  ]
    .filter(Boolean)
    .join(';');
}

function buildChequeHtml({ data, offsets = {}, fuenteTamano = 12 }) {
  const fecha = data.fecha || '';
  const beneficiario = data.beneficiario || '';
  const monto = data.monto || '';
  const montoLetras = data.montoLetras || data.montoLetters || '';

  const offFechaX = parseOffset(offsets.fecha_x);
  const offFechaY = parseOffset(offsets.fecha_y);
  const offMontoX = parseOffset(offsets.monto_x);
  const offMontoY = parseOffset(offsets.monto_y);
  const offBeneX = parseOffset(offsets.beneficiario_x);
  const offBeneY = parseOffset(offsets.beneficiario_y);
  const offLetrasX = parseOffset(offsets.letras_x);
  const offLetrasY = parseOffset(offsets.letras_y);

  const baseFont = Number.isFinite(fuenteTamano) ? fuenteTamano : 12;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cheque</title>
  <style>
    @page {
      size: ${CHEQUE_WIDTH_IN}in ${CHEQUE_HEIGHT_IN}in;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${CHEQUE_WIDTH_IN}in;
      height: ${CHEQUE_HEIGHT_IN}in;
      overflow: hidden;
      background: transparent;
    }
    .cheque-page {
      position: relative;
      width: ${CHEQUE_WIDTH_IN}in;
      height: ${CHEQUE_HEIGHT_IN}in;
      font-family: 'Courier New', Courier, monospace;
      color: #000;
      background: transparent;
    }
    .cheque-printable {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: ${PRINTABLE_HEIGHT_IN}in;
      overflow: hidden;
    }
    .cheque-field-letras {
      white-space: normal;
      max-width: 580px;
      line-height: 1.3;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="cheque-page">
    <div class="cheque-printable">
      <div class="cheque-field-fecha" style="${fieldStyle(FIELD_ANCHORS.fecha, offFechaX, offFechaY, baseFont)}">${escapeHtml(fecha)}</div>
      <div class="cheque-field-monto" style="${fieldStyle(FIELD_ANCHORS.monto, offMontoX, offMontoY, baseFont + 2)}">${escapeHtml(monto)}</div>
      <div class="cheque-field-beneficiario" style="${fieldStyle(FIELD_ANCHORS.beneficiario, offBeneX, offBeneY, baseFont)}">${escapeHtml(beneficiario)}</div>
      <div class="cheque-field-letras" style="${fieldStyle(FIELD_ANCHORS.letras, offLetrasX, offLetrasY, Math.max(baseFont - 1, 8), 'white-space:normal;max-width:580px;line-height:1.3;word-wrap:break-word')}">${escapeHtml(montoLetras)}</div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  buildChequeHtml,
  CHEQUE_PAGE_SIZE_MICRONS: { width: 215900, height: 152400 },
};
