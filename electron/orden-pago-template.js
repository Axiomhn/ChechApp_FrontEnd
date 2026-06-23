const fs = require('fs');
const path = require('path');

const LAYOUT_PATH = path.join(__dirname, 'templates', 'orden-pago-layout.html');

/** Diseño Figma ~2480×3030px → carta 8.5"×11" (816×1056px @ 96dpi). */
const DESIGN_WIDTH = 2480;
const DESIGN_HEIGHT = 3030;
const PAGE_WIDTH_PX = 816;
const PAGE_HEIGHT_PX = 1056;
const SCALE = PAGE_WIDTH_PX / DESIGN_WIDTH;

/** Carta 8.5" × 11" en micrones — tamaño fijo de impresión/PDF. */
const ORDEN_PAGO_PAGE_SIZE_MICRONS = { width: 215900, height: 279400 };

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
  const capped = Math.min(n, 999_999_999.99);
  return capped.toLocaleString('en-US', {
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

const CONTENT_RIGHT = 2356;
const ROW_807_TOP = 807;
const ROW_807_LEFT = 156;
const AFECTANDO_BLOCK_LEFT = 1520;
const L_PAREN_BLOCK_WIDTH = 480;
const L_AFECTANDO_GAP = 40;
const L_PAREN_SHIFT_RIGHT = 35;
const L_PAREN_BLOCK_LEFT =
  AFECTANDO_BLOCK_LEFT - L_AFECTANDO_GAP - L_PAREN_BLOCK_WIDTH + L_PAREN_SHIFT_RIGHT;
const ROW_807_SECTION_GAP = 16;
const ROW_807_UNDERSCORE_WIDTH =
  L_PAREN_BLOCK_LEFT - ROW_807_LEFT - ROW_807_SECTION_GAP;

const MONTO_LETRAS_LINE1_LEFT = 552;
const MONTO_LETRAS_LINE1_WIDTH = 1694;
const MONTO_LETRAS_LINE2_LEFT = ROW_807_LEFT;
const MONTO_LETRAS_LINE2_WIDTH = ROW_807_UNDERSCORE_WIDTH;
const MONTO_LETRAS_ROW1_TOP = 719;
const MONTO_LETRAS_ROW2_TOP = 801;
const MONTO_LETRAS_FONT_SIZE = 42;
const MONTO_LETRAS_FONT_SIZE_MIN = 22;
const MONTO_LETRAS_WIDTH_SAFETY = 1.15;
const MONTO_NUMERIC_LEFT = L_PAREN_BLOCK_LEFT + 82;
const MONTO_NUMERIC_ROW_TOP = ROW_807_TOP;
const MONTO_NUMERIC_WIDTH = 220;

const ROW_807_STATIC_MARKER = '<!-- ORDEN_ROW_807_STATIC -->';

function buildRow807StaticHtml() {
  const underscoreCount = Math.max(19, Math.ceil(ROW_807_UNDERSCORE_WIDTH / 26));
  const underscores = '_'.repeat(underscoreCount);
  const rowStyle = [
    'position:absolute',
    'color:black',
    'font-size:55px',
    "font-family:'Alexandria',Arial,sans-serif",
    'font-weight:400',
    'white-space:nowrap',
    'box-sizing:border-box',
  ].join(';');

  return [
    `<div style="left:${ROW_807_LEFT}px;top:${ROW_807_TOP}px;width:${ROW_807_UNDERSCORE_WIDTH}px;overflow:hidden;${rowStyle}">${underscores}</div>`,
    `<div style="left:${L_PAREN_BLOCK_LEFT}px;top:${ROW_807_TOP}px;${rowStyle}">(L._____________)</div>`,
    `<div style="left:${AFECTANDO_BLOCK_LEFT}px;top:${ROW_807_TOP}px;${rowStyle}">AFECTANDO LO SIGUIENTE:</div>`,
  ].join('\n    ');
}

function injectRow807Static(layout) {
  return layout.replace(ROW_807_STATIC_MARKER, buildRow807StaticHtml());
}

function estimateMontoLetrasWidth(text, fontSize = MONTO_LETRAS_FONT_SIZE) {
  let width = 0;
  for (const ch of String(text)) {
    if (ch === ' ') {
      width += fontSize * 0.26;
    } else if (ch === '/' || ch === '.') {
      width += fontSize * 0.36;
    } else if ('MWQG%'.includes(ch)) {
      width += fontSize * 0.8;
    } else if ('IL|!1'.includes(ch)) {
      width += fontSize * 0.3;
    } else {
      width += fontSize * 0.62;
    }
  }
  return width * MONTO_LETRAS_WIDTH_SAFETY;
}

function getMontoLetrasFontSize(text, maxWidth, maxSize = MONTO_LETRAS_FONT_SIZE) {
  const value = String(text ?? '').trim();
  if (!value) return maxSize;

  const widthAtDefault = estimateMontoLetrasWidth(value, maxSize);
  if (widthAtDefault <= maxWidth) {
    return maxSize;
  }

  const scaled = Math.floor((maxSize * maxWidth) / widthAtDefault);
  return Math.max(MONTO_LETRAS_FONT_SIZE_MIN, Math.min(maxSize, scaled));
}

function rebalanceMontoLetrasLines(
  line1,
  line2,
  fontSize = MONTO_LETRAS_FONT_SIZE
) {
  if (!line2) return { line1, line2 };

  const words1 = line1.split(/\s+/).filter(Boolean);
  const words2 = line2.split(/\s+/).filter(Boolean);

  while (words2.length > 1) {
    const line2Text = words2.join(' ');
    if (estimateMontoLetrasWidth(line2Text, fontSize) <= MONTO_LETRAS_LINE2_WIDTH) {
      break;
    }

    const word = words2.shift();
    const candidateLine1 = [...words1, word].join(' ');
    if (estimateMontoLetrasWidth(candidateLine1, fontSize) > MONTO_LETRAS_LINE1_WIDTH) {
      words2.unshift(word);
      break;
    }

    words1.push(word);
  }

  return {
    line1: words1.join(' '),
    line2: words2.join(' '),
  };
}

function montoLetrasLinesFitAtFont(line1, line2, fontSize) {
  if (estimateMontoLetrasWidth(line1, fontSize) > MONTO_LETRAS_LINE1_WIDTH) {
    return false;
  }
  if (!line2) {
    return true;
  }
  return estimateMontoLetrasWidth(line2, fontSize) <= MONTO_LETRAS_LINE2_WIDTH;
}

function buildMontoLetrasLineExtra(text, maxWidth, widthPx, fontSize) {
  const resolvedFontSize =
    fontSize ?? getMontoLetrasFontSize(text, maxWidth);
  return [
    `font-size:${resolvedFontSize}px`,
    'line-height:1.15',
    'white-space:nowrap',
    'overflow:visible',
    `width:${widthPx}px`,
  ].join(';');
}

function splitMontoLetrasByWidth(text, maxWidth, fontSize = MONTO_LETRAS_FONT_SIZE) {
  const value = String(text ?? '').trim();
  if (!value) return { line1: '', line2: '' };
  if (estimateMontoLetrasWidth(value, fontSize) <= maxWidth) {
    return { line1: value, line2: '' };
  }

  const words = value.split(/\s+/);
  const line1Words = [];

  for (const word of words) {
    const candidate = line1Words.length ? `${line1Words.join(' ')} ${word}` : word;
    if (estimateMontoLetrasWidth(candidate, fontSize) <= maxWidth) {
      line1Words.push(word);
    } else {
      break;
    }
  }

  if (!line1Words.length) {
    line1Words.push(words[0]);
  }

  const line1 = line1Words.join(' ');
  const line2 = words.slice(line1Words.length).join(' ');
  return { line1, line2 };
}

function splitMontoLetrasContent(value, fontSize = MONTO_LETRAS_FONT_SIZE) {
  const text = String(value ?? '').trim();
  if (!text) return { line1: '', line2: '' };

  const centsMatch = text.match(/^(.+?)\s+(CON\s+\d{2}\/100)$/i);
  if (!centsMatch) {
    const split = splitMontoLetrasByWidth(text, MONTO_LETRAS_LINE1_WIDTH, fontSize);
    return rebalanceMontoLetrasLines(split.line1, split.line2, fontSize);
  }

  const main = centsMatch[1].trim();
  const suffix = centsMatch[2].trim();

  if (estimateMontoLetrasWidth(text, fontSize) <= MONTO_LETRAS_LINE1_WIDTH) {
    return { line1: text, line2: '' };
  }

  if (estimateMontoLetrasWidth(main, fontSize) <= MONTO_LETRAS_LINE1_WIDTH) {
    return rebalanceMontoLetrasLines(main, suffix, fontSize);
  }

  const { line1, line2 } = splitMontoLetrasByWidth(main, MONTO_LETRAS_LINE1_WIDTH, fontSize);
  return rebalanceMontoLetrasLines(
    line1,
    line2 ? `${line2} ${suffix}` : suffix,
    fontSize
  );
}

function resolveMontoLetrasLayout(text) {
  const value = String(text ?? '').trim();
  if (!value) {
    return { line1: '', line2: '', fontSize: MONTO_LETRAS_FONT_SIZE };
  }

  for (let fontSize = MONTO_LETRAS_FONT_SIZE; fontSize >= MONTO_LETRAS_FONT_SIZE_MIN; fontSize--) {
    const { line1, line2 } = splitMontoLetrasContent(value, fontSize);
    if (montoLetrasLinesFitAtFont(line1, line2, fontSize)) {
      return { line1, line2, fontSize };
    }
  }

  const { line1, line2 } = splitMontoLetrasContent(value, MONTO_LETRAS_FONT_SIZE_MIN);
  return { line1, line2, fontSize: MONTO_LETRAS_FONT_SIZE_MIN };
}

/** Renglón 1 tras "LA SUMA DE :"; renglón 2 con ancho completo, en la 2ª línea del formulario. */
function buildMontoLetrasDiv(content) {
  const { line1, line2, fontSize } = resolveMontoLetrasLayout(content);
  if (!line1 && !line2) return '';

  if (!line2) {
    return buildFieldDiv(
      'orden-letras',
      fieldStyle(
        MONTO_LETRAS_LINE1_LEFT,
        MONTO_LETRAS_ROW1_TOP,
        buildMontoLetrasLineExtra(
          line1,
          MONTO_LETRAS_LINE1_WIDTH,
          MONTO_LETRAS_LINE1_WIDTH,
          fontSize
        )
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
        buildMontoLetrasLineExtra(
          line1,
          MONTO_LETRAS_LINE1_WIDTH,
          MONTO_LETRAS_LINE1_WIDTH,
          fontSize
        )
      ),
      line1
    ),
    buildFieldDiv(
      'orden-letras-l2',
      fieldStyle(
        MONTO_LETRAS_LINE2_LEFT,
        MONTO_LETRAS_ROW2_TOP,
        buildMontoLetrasLineExtra(
          line2,
          MONTO_LETRAS_LINE2_WIDTH,
          MONTO_LETRAS_LINE2_WIDTH,
          fontSize
        )
      ),
      line2
    ),
  ].join('\n    ');
}

const DESCRIPCION_ROW_COUNT = 4;
const ESTRUCTURA_ROW_COUNT = 5;
const DESCRIPCION_MAX_LENGTH = 100;
const DETALLE_GASTO_MAX_LENGTH = 80;

function normalizeDescripciones(descripciones) {
  const source = Array.isArray(descripciones) ? descripciones : [];
  return Array.from({ length: DESCRIPCION_ROW_COUNT }, (_, index) =>
    String(source[index] ?? '').trim().slice(0, DESCRIPCION_MAX_LENGTH)
  );
}

function parseMontoValue(value) {
  const cleaned = String(value ?? '').replace(/,/g, '').trim();
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.min(n, 999_999_999.99);
}

function sumEstructuraSubTotales(estructura) {
  const source = Array.isArray(estructura) ? estructura : [];
  let sum = 0;
  let hasValue = false;

  for (let i = 0; i < ESTRUCTURA_ROW_COUNT; i++) {
    const row = source[i] ?? {};
    const parsed = parseMontoValue(row.subTotal ?? row.sub_total ?? '');
    if (parsed === null) continue;
    sum += parsed;
    hasValue = true;
  }

  return hasValue ? formatMontoDisplay(sum) : '';
}

function normalizeEstructura(estructura) {
  const source = Array.isArray(estructura) ? estructura : [];
  return Array.from({ length: ESTRUCTURA_ROW_COUNT }, (_, index) => {
    const row = source[index] ?? {};
    const subTotalRaw = String(row.subTotal ?? row.sub_total ?? '').trim();
    return {
      detalle: String(row.detalle ?? '')
        .trim()
        .slice(0, DETALLE_GASTO_MAX_LENGTH),
      subTotal: subTotalRaw ? formatMontoDisplay(subTotalRaw) : '',
    };
  });
}

function buildDescripcionTableBody(descripciones) {
  return normalizeDescripciones(descripciones)
    .map((text) => {
      const content = text ? escapeHtml(text) : '&nbsp;';
      return `            <tr><td>${content}</td></tr>`;
    })
    .join('\n');
}

function buildEstructuraTableBody(estructura) {
  const dataRows = normalizeEstructura(estructura)
    .map(({ detalle, subTotal }) => {
      const detalleContent = detalle ? escapeHtml(detalle) : '&nbsp;';
      const subTotalContent = subTotal ? escapeHtml(subTotal) : '&nbsp;';
      return `            <tr><td class="orden-estructura-col-detalle">${detalleContent}</td><td>${subTotalContent}</td></tr>`;
    })
    .join('\n');

  const grandTotal = sumEstructuraSubTotales(estructura);
  const totalCellContent = grandTotal ? escapeHtml(grandTotal) : '&nbsp;';
  const totalRow = `            <tr class="orden-estructura-fila-total"><td>TOTAL</td><td>${totalCellContent}</td></tr>`;

  return dataRows ? `${dataRows}\n${totalRow}` : totalRow;
}

function fillOrdenTables(layout, data) {
  const descripcionBody = buildDescripcionTableBody(data.descripciones);
  const estructuraBody = buildEstructuraTableBody(data.estructura);

  return layout
    .replace(
      /(<table class="orden-tabla orden-tabla-descripcion"[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>)/,
      `$1\n${descripcionBody}\n        $2`
    )
    .replace(
      /(<table class="orden-tabla orden-tabla-estructura"[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>)/,
      `$1\n${estructuraBody}\n        $2`
    );
}

function buildOrdenPagoHtml(data) {
  // Tipografía y escala fijas en plantilla/CSS. No lee fuente_tamano ni calibración de cheque.
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
        MONTO_NUMERIC_LEFT,
        MONTO_NUMERIC_ROW_TOP,
        `font-size:48px;width:${MONTO_NUMERIC_WIDTH}px;text-align:left;white-space:nowrap`
      ),
      monto
    ),
  ]
    .filter(Boolean)
    .join('\n    ');

  const rawLayout = injectRow807Static(fillOrdenTables(getLayout().trim(), data));
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
    .orden-letras,
    .orden-letras-l1,
    .orden-letras-l2 {
      overflow: visible;
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
      font-size: 36px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
    .orden-tabla-estructura th.orden-estructura-th-detalle {
      width: 1820px;
      max-width: 1820px;
      text-align: center !important;
      vertical-align: middle;
      padding-left: 8px;
      padding-right: 8px;
    }
    .orden-tabla-estructura td.orden-estructura-col-detalle {
      width: 1820px;
      max-width: 1820px;
      text-align: left !important;
      vertical-align: middle;
      padding-left: 10px;
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
      font-size: 36px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .orden-tabla-estructura .orden-estructura-fila-total td {
      text-align: center !important;
      vertical-align: middle;
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
  ORDEN_PAGO_PAGE_SIZE_MICRONS,
  SCALE,
};
