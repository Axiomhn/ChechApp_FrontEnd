const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = 'calibration-settings.json';

const DEFAULT_SETTINGS = {
  offset_cheque_fecha_x: '0',
  offset_cheque_fecha_y: '0',
  offset_cheque_monto_x: '0',
  offset_cheque_monto_y: '0',
  offset_cheque_beneficiario_x: '0',
  offset_cheque_beneficiario_y: '0',
  offset_cheque_letras_x: '0',
  offset_cheque_letras_y: '0',
  fuente_tamano: '12',
};

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

function getFilePath(userDataPath) {
  return path.join(userDataPath, SETTINGS_FILE);
}

function ensureUserDataDir(userDataPath) {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
}

function normalizeSettings(input = {}) {
  const normalized = { ...DEFAULT_SETTINGS };

  for (const key of SETTING_KEYS) {
    if (input[key] !== undefined && input[key] !== null) {
      normalized[key] = String(input[key]);
    }
  }

  return normalized;
}

function loadSettings(userDataPath) {
  ensureUserDataDir(userDataPath);
  const filePath = getFilePath(userDataPath);

  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeSettings(parsed);
  } catch (err) {
    console.error('Error leyendo calibración local:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(userDataPath, settings) {
  ensureUserDataDir(userDataPath);
  const filePath = getFilePath(userDataPath);
  const normalized = normalizeSettings(settings);

  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
}

module.exports = {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
};
