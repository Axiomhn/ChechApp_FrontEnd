const fs = require('fs');
const path = require('path');

const LAYOUT_PATH = path.join(__dirname, 'templates', 'orden-pago-layout.html');

/** Diseño Figma ~2480×3030px → carta 8.5"×11" (816×1056px @ 96dpi). */
const DESIGN_WIDTH = 2480;
const DESIGN_HEIGHT = 3030;
const PAGE_WIDTH_PX = 816;
const PAGE_HEIGHT_PX = 1056;
const SCALE = PAGE_WIDTH_PX / DESIGN_WIDTH;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMontoDisplay(monto) {
  const cleaned = String(monto ?? '').replace(/,/g, '').trim();
  if (!cleaned) return '';
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n)) return String(monto ?? '');
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const LUGAR_FECHA_FIELD_LEFT = 620;
const UNIDAD_EJECUTORA_LEFT = 1100;
const LUGAR_FECHA_FIELD_MAX_WIDTH =
  UNIDAD_EJECUTORA_LEFT - LUGAR_FECHA_FIELD_LEFT - 16;

function getLugarFechaFontSize(text) {
  const value = String(text ?? '').trim();
  if (!value) return 44;

  const size = Math.floor(LUGAR_FECHA_FIELD_MAX_WIDTH / (value.length * 0.52));
  return Math.max(22, Math.min(44, size));
}

function getLayout() {
  return fs.readFileSync(LAYOUT_PATH, 'utf8');
}

function fieldStyle(left, top, extra = '') {
  return [
    `left:${left}px`,
    `top:${top}px`,
    'position:absolute',
    'color:black',
    "font-family:'Alexandria',Arial,sans-serif",
    'font-weight:400',
    'z-index:10',
    extra,
  ]
    .filter(Boolean)
    .join(';');
}

function buildFieldDiv(className, style, content) {
  if (!content) return '';
  return `<div class="orden-field ${className}" style="${style}">${escapeHtml(content)}</div>`;
}

const MONTO_LETRAS_LINE1_LEFT = 552;
const MONTO_LETRAS_LINE1_WIDTH = 1694;
const MONTO_LETRAS_LINE2_LEFT = 156;
const MONTO_LETRAS_LINE2_WIDTH = 2090;
const MONTO_LETRAS_ROW1_TOP = 719;
const MONTO_LETRAS_ROW2_TOP = 801;
const MONTO_LETRAS_LINE1_MAX_CHARS = 68;

function splitMontoLetras(text) {
  const value = String(text ?? '').trim();
  if (!value) return { line1: '', line2: '' };
  if (value.length <= MONTO_LETRAS_LINE1_MAX_CHARS) {
    return { line1: value, line2: '' };
  }

  let splitAt = value.lastIndexOf(' ', MONTO_LETRAS_LINE1_MAX_CHARS);
  if (splitAt <= 0) splitAt = MONTO_LETRAS_LINE1_MAX_CHARS;

  return {
    line1: value.slice(0, splitAt).trim(),
    line2: value.slice(splitAt).trim(),
  };
}

/** Renglón 1 tras "LA SUMA DE :"; renglón 2 con ancho completo, en la 2ª línea del formulario. */
function buildMontoLetrasDiv(content) {
  const { line1, line2 } = splitMontoLetras(content);
  if (!line1 && !line2) return '';

  const lineStyle =
    'font-size:42px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';

  if (!line2) {
    return buildFieldDiv(
      'orden-letras',
      fieldStyle(
        MONTO_LETRAS_LINE1_LEFT,
        MONTO_LETRAS_ROW1_TOP,
        `${lineStyle};width:${MONTO_LETRAS_LINE1_WIDTH}px`
      ),
      line1
    );
  }

  return [
    buildFieldDiv(
      'orden-letras-l1',
      fieldStyle(
        MONTO_LETRAS_LINE1_LEFT,
        MONTO_LETRAS_ROW1_TOP,
        `${lineStyle};width:${MONTO_LETRAS_LINE1_WIDTH}px`
      ),
      line1
    ),
    buildFieldDiv(
      'orden-letras-l2',
      fieldStyle(
        MONTO_LETRAS_LINE2_LEFT,
        MONTO_LETRAS_ROW2_TOP,
        `${lineStyle};width:${MONTO_LETRAS_LINE2_WIDTH}px`
      ),
      line2
    ),
  ].join('\n    ');
}

function buildOrdenPagoHtml(data) {
  const lugarFecha = String(data.fecha ?? '').trim();
  const beneficiario = data.beneficiario || '';
  const montoLetras = data.montoLetras || data.montoLetters || '';
  const monto = formatMontoDisplay(data.monto);

  const fields = [
    buildFieldDiv(
      'orden-lugar-fecha',
      fieldStyle(
        LUGAR_FECHA_FIELD_LEFT,
        543,
        `font-size:${getLugarFechaFontSize(lugarFecha)}px;max-width:${LUGAR_FECHA_FIELD_MAX_WIDTH}px;white-space:nowrap;overflow:hidden`
      ),
      lugarFecha
    ),
    buildFieldDiv(
      'orden-beneficiario',
      fieldStyle(1081, 631, 'font-size:48px;max-width:1280px;white-space:nowrap'),
      beneficiario
    ),
    buildMontoLetrasDiv(montoLetras),
    buildFieldDiv(
      'orden-monto',
      fieldStyle(
        855,
        807,
        'font-size:48px;width:200px;text-align:left;white-space:nowrap'
      ),
      monto
    ),
  ]
    .filter(Boolean)
    .join('\n    ');

  const rawLayout = getLayout().trim();
  const insertAt = rawLayout.lastIndexOf('</div>');
  const layout =
    insertAt === -1
      ? rawLayout + fields
      : `${rawLayout.slice(0, insertAt)}\n    ${fields}\n${rawLayout.slice(insertAt)}`;

  const innerLayout = layout
    .replace(/^<div[^>]*>/, '')
    .replace(/<\/div>\s*$/, '');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Orden de Pago UMASENY</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400&family=Arapey&family=Bakbak+One&display=swap" rel="stylesheet" />
  <style>
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${PAGE_WIDTH_PX}px;
      height: ${PAGE_HEIGHT_PX}px;
      overflow: hidden;
      background: white;
    }
    .orden-page {
      width: ${DESIGN_WIDTH}px;
      height: ${DESIGN_HEIGHT}px;
      position: relative;
      background: white;
      zoom: ${SCALE};
    }
    .orden-field {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .orden-letras {
      overflow: hidden;
    }
    .orden-tabla {
      border-collapse: collapse;
      table-layout: fixed;
      font-family: 'Alexandria', Arial, sans-serif;
      font-size: 40px;
      font-weight: 400;
      color: black;
      background: white;
    }
    .orden-tabla th,
    .orden-tabla td {
      border: 3px solid black;
      text-align: center;
      vertical-align: middle;
      padding: 4px 8px;
      box-sizing: border-box;
    }
    .orden-tabla-codigos {
      width: 486px;
    }
    .orden-tabla-codigos th,
    .orden-tabla-codigos td {
      width: 162px;
      height: 58px;
    }
    .orden-tabla-codigos tbody td {
      height: 63px;
    }
    .orden-tabla-descripcion {
      width: 2200px;
    }
    .orden-tabla-descripcion th,
    .orden-tabla-descripcion td {
      width: 2200px;
    }
    .orden-tabla-descripcion thead th {
      height: 58px;
      text-align: center;
    }
    .orden-tabla-descripcion tbody td {
      height: 63px;
      text-align: left;
    }
    .orden-tabla-estructura {
      width: 2200px;
      min-width: 2200px;
      max-width: 2200px;
    }
    .orden-tabla-estructura .orden-estructura-titulo {
      height: 58px;
      font-size: 40px;
      text-align: center;
    }
    .orden-tabla-estructura .orden-estructura-columnas th {
      height: 124px;
      font-size: 38px;
      line-height: 1.1;
    }
    .orden-tabla-estructura th.orden-estructura-th-detalle,
    .orden-tabla-estructura td.orden-estructura-col-detalle {
      width: 1820px;
      max-width: 1820px;
      text-align: center !important;
      vertical-align: middle;
      padding-left: 8px;
      padding-right: 8px;
    }
    .orden-tabla-estructura th.orden-estructura-th-subtotal,
    .orden-tabla-estructura td:nth-child(2) {
      width: 380px;
      max-width: 380px;
      text-align: center !important;
      vertical-align: middle;
    }
    .orden-tabla-estructura tbody td {
      height: 63px;
    }
  </style>
</head>
<body>
  <div class="orden-page">
    ${innerLayout}
  </div>
</body>
</html>`;
}

module.exports = {
  buildOrdenPagoHtml,
  SCALE,
};
