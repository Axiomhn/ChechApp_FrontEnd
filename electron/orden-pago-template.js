const fs = require('fs');
const path = require('path');

const LAYOUT_PATH = path.join(__dirname, 'templates', 'orden-pago-layout.html');

/** Diseño exportado ~2480×3030px; escala a carta 8.5"×11". */
const DESIGN_WIDTH = 2480;
const DESIGN_HEIGHT = 3030;
const PAGE_WIDTH_IN = 8.5;
const PAGE_HEIGHT_IN = 11;
const SCALE = PAGE_WIDTH_IN / (DESIGN_WIDTH / 96);

let cachedLayout = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getLayout() {
  if (!cachedLayout) {
    cachedLayout = fs.readFileSync(LAYOUT_PATH, 'utf8');
  }
  return cachedLayout;
}

function fieldStyle(left, top, extra = '') {
  return [
    `left:${left}px`,
    `top:${top}px`,
    'position:absolute',
    'color:black',
    "font-family:'Alexandria',Arial,sans-serif",
    'font-weight:400',
    'background:white',
    'z-index:2',
    extra,
  ]
    .filter(Boolean)
    .join(';');
}

function buildFieldDiv(className, style, content) {
  return `<div class="orden-field ${className}" style="${style}">${escapeHtml(content)}</div>`;
}

function buildOrdenPagoHtml(data) {
  const fecha = data.fecha || '';
  const beneficiario = data.beneficiario || '';
  const montoLetras = data.montoLetras || data.montoLetters || '';
  const monto = data.monto || '';

  const fields = [
    buildFieldDiv(
      'orden-fecha',
      fieldStyle(399, 543, 'font-size:55px;max-width:450px;white-space:nowrap'),
      fecha
    ),
    buildFieldDiv(
      'orden-beneficiario',
      fieldStyle(1081, 631, 'font-size:48px;max-width:1280px;white-space:nowrap'),
      beneficiario
    ),
    buildFieldDiv(
      'orden-letras',
      fieldStyle(552, 719, 'font-size:42px;width:1694px;line-height:1.15;white-space:normal'),
      montoLetras
    ),
    buildFieldDiv(
      'orden-monto',
      fieldStyle(520, 807, 'font-size:55px;white-space:nowrap'),
      monto
    ),
  ].join('\n    ');

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
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${PAGE_WIDTH_IN}in;
      height: ${PAGE_HEIGHT_IN}in;
      overflow: hidden;
      background: white;
    }
    .orden-page {
      width: ${DESIGN_WIDTH}px;
      height: ${DESIGN_HEIGHT}px;
      transform: scale(${SCALE});
      transform-origin: top left;
      position: relative;
      background: white;
      overflow: hidden;
    }
    .orden-field {
      word-wrap: break-word;
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
};
